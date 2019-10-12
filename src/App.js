var express = require('express');
var https = require("https");
var http = require("http");
var bodyParser = require('body-parser');
var mongoose = require("mongoose");
const sigUtil = require('eth-sig-util');
var fs = require('fs');
var path = require('path');
var multer = require('multer');
var upload = multer({ dest: 'uploads/' })

// todo move http provide link to dotenv
require('dotenv').config();
var Web3 = require('web3');

var web3js = new Web3(new Web3.providers.HttpProvider("https://ropsten.infura.io/v3/a5c0811537054f2d9396aeb399c2efc7"));
//var web3js = new Web3(new Web3.providers.HttpProvider('http://localhost:7545'));

var orderContract;
var restaurantContract;

var controllerAddress = "0xAfcA2cA5270C46af7C0462aA530A3B31b729e92b";
var controller;
var customerFactory;
var restaurantFactory;
var riderFactory;

var port = 9000;

loadContracts();

async function loadContracts(){
  var orderABI = JSON.parse(fs.readFileSync('Contracts/Order.json', 'utf8'));
  var restaurantABI = JSON.parse(fs.readFileSync('Contracts/Restaurant.json', 'utf8'));
  var customerFactoryABI = JSON.parse(fs.readFileSync('Contracts/CustomerFactory.json', 'utf8'));
  var restaurantFactoryABI = JSON.parse(fs.readFileSync('Contracts/RestaurantFactory.json', 'utf8'));
  var riderFactoryABI = JSON.parse(fs.readFileSync('Contracts/RiderFactory.json', 'utf8'));
  var controllerABI = JSON.parse(fs.readFileSync('Contracts/Controller.json', 'utf8'));

  orderContract = web3js.eth.contract(orderABI.abi);
  restaurantContract = web3js.eth.contract(restaurantABI.abi);
  var customerFactoryContract = web3js.eth.contract(customerFactoryABI.abi);
  var restaurantFactoryContract = web3js.eth.contract(restaurantFactoryABI.abi);
  var riderFactoryContract = web3js.eth.contract(riderFactoryABI.abi);
  var controllerContract = web3js.eth.contract(controllerABI.abi);

  controller = controllerContract.at(controllerAddress);
  var customerFactoryAddress = await controller.customerFactoryAddress();
  var restaurantFactoryAddress = await controller.restaurantFactoryAddress();
  var riderFactoryAddress = await controller.riderFactoryAddress();
  customerFactory = customerFactoryContract.at(customerFactoryAddress);
  restaurantFactory = restaurantFactoryContract.at(restaurantFactoryAddress);
  riderFactory = riderFactoryContract.at(riderFactoryAddress);
}

mongoose.connect('mongodb://localhost:27017/tryabyte', {useNewUrlParser: true});
var db = mongoose.connection;
var Schema = mongoose.Schema;

db.once('open',function(){
  console.log('Connection to database made');
});

var orderSchema = new Schema({
  contractAddress: String,
  customerAddress: String
});

var Order = mongoose.model('Orders',orderSchema);

Order.countDocuments({}).exec(function(err, count){
  if(count != null){
    console.log("record count: " + count);
  }else{
    console.log("Error:" + err)
  }
});

// get eth price
var currentPrice = "NA";
const rp = require('request-promise');
const requestOptions = {
 method: 'GET',
  uri: 'https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest',
  qs: {
    symbol: 'ETH',
    convert: 'GBP'
  },
  headers: {
    'X-CMC_PRO_API_KEY': '84e3c364-0000-44f8-8da0-311fa89742a3'
  },
  json: true,
  gzip: true
};

rp(requestOptions).then(response => {
  currentPrice = Math.round(response.data.ETH.quote.GBP.price * 100) / 100;
  console.log('Current Eth Price:', currentPrice);
}).catch((err) => {
  console.log('API call error:', err.message);
  currentPrice = 'NA';
});






var app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.locals.points = "test";

app.use('/js',express.static(__dirname+'/js'));
app.use('/css',express.static(__dirname+'/css'));
app.use('/Contracts',express.static(__dirname+'/Contracts'));
app.use('/Images',express.static(__dirname+'/Images'));


const httpsOptions = {
  cert: fs.readFileSync(path.join(__dirname,'ssl','server.crt')),
  key: fs.readFileSync(path.join(__dirname,'ssl','server.key'))
}


var http = http.createServer({}, app).listen(port, function(){
  console.log('hosting');
});





//app.listen(port);
console.log("**listening on port: " + port);


//===================================================

// new HTML locations

app.get(['/'], function(req,res){
  res.sendFile(__dirname+'/html/Homepage.html');
});

app.get(["/restaurants"], function(req,res){
  // output screen with list of restaurants
  res.sendFile(__dirname+'/html/restaurantQuery.html');
});

app.get(["/restaurantview"], function(req,res){
  // output screen with list of restaurants
  res.sendFile(__dirname+'/html/RestaurantView.html');
});

app.get(["/becomeapartner"], function(req,res){
  // output screen with list of restaurants
  res.sendFile(__dirname+'/html/BecomeAPartner.html');
});

app.get(["/restaurantAccountCreation"], function(req,res){
  // output screen with list of restaurants
  res.sendFile(__dirname+'/html/RestaurantAccountCreation.html');
});


//ajax
app.post(["/uploadTemp"], upload.single('file'), function(req,res){
  console.log(req);
  console.log("userAddress: " + req.body.userAddress);
  const oldPath = req.file.path;
  const temp = '/uploads/temp/'+req.body.userAddress+'.png'; // file name is the id of the restaurant
  const targetPath = path.join(__dirname, temp);

  console.log("writing file from " + oldPath + " to " + targetPath);

  if (path.extname(req.file.originalname).toLowerCase() === ".png") {
    fs.rename(oldPath, targetPath, err => {
      if (err){
        res
        .status(200)
        .contentType("text/plain")
        .end("Error: " + err);
        return;
      }

      res
        .status(200)
        .contentType("text/plain")
        .end("File uploaded!");
    });
  } else {
    fs.unlink(oldPath, err => {
      if (err){
        res
        .status(200)
        .contentType("text/plain")
        .end("Error: " + err);
        return;
      }

      res
        .status(403)
        .contentType("text/plain")
        .end("Only .png files are allowed!");
    });
  }
});

app.post(["/commitLogo"], async function(req,res){
  const msgParams = [
  {
      type: 'string',       // Any valid solidity type
      name: 'restaurantAddress',   // Any string label you want
      value: req.body.contractAddress,    // The value to sign, this should be changed
  }];

  const recovered = sigUtil.recoverTypedSignature({
    data: msgParams,
    sig: req.body.signature 
  });
  
  console.log('Recovered signature: ' + recovered);

  // check if customer, restaurant or rider sent this message
  var restaurant = restaurantContract.at(req.body.contractAddress);
  var contractOwnerAddress = await restaurant.owner();

  if(contractOwnerAddress == recovered){

    // process and move the image file to storage
    var oldPath = "/uploads/temp/" + contractOwnerAddress + ".png";

    var restaurantID = await restaurant.id();
    var newPath = "/uploads/logos/"+restaurantID+".png";

    console.log("signature match: commiting logo from " + oldPath + " to " + newPath);

    fs.rename(oldPath, targetPath, err => {
      if (err) return handleError(err, res);

      res
        .status(200)
        .contentType("text/plain")
        .end("File commited!");
    })

  }else{
    console.log("signature mismatch: you aren't the owner of this contract");
  }

});


// old get/post 

app.get(["/login","/login.html"], function(req,res){
  res.sendFile(__dirname+'html/login.html');
});

app.get(["/RestaurantHome.html"], function(req,res){
  res.sendFile(__dirname+'/RestaurantHome.html');
});

app.get(["/CustomerView.html"], function(req,res){
  res.sendFile(__dirname+'/CustomerView.html');
});

app.get(["/RiderView.html"], function(req,res){
  res.sendFile(__dirname+'/RiderView.html');
});

app.get(["/EthPrice"], function(req,res){
  res.json({'currentPrice':currentPrice});
});


app.post(["/db"], function(req,res){
  console.log(req.body.message);
  console.log(req.body.signedNumberValue);

  const recovered = sigUtil.recoverTypedSignature({
    data: msgParams,
    sig: req.body.message 
  });
  
  console.log('Recovered signer: ' + recovered)
  
});

app.post(["/requestAddress"], async function(req,res){
  console.log("new request for address");

  const msgParams = [
  {
      type: 'string',      // Any valid solidity type
      name: 'orderAddress',     // Any string label you want
      value: req.body.orderAddress  // The value to sign, this should be changed
  }];

  const recovered = sigUtil.recoverTypedSignature({
    data: msgParams,
    sig: req.body.signature 
  });
  
  console.log('Recovered signer: ' + recovered);

  // check if customer, restaurant or rider sent this message
  var order = orderContract.at(req.body.orderAddress);
  // ToDo
  // add check here for if order was found
  // improve await logic
  var customerContractAddressForOrder = await order.customer();
  var restaurantContractAddressForOrder = await order.restaurant();
  var riderContractAddressForOrder = await order.rider();
  
  var customerContractAddressFromSignature = customerFactory.customers2(recovered);
  var restaurantContractAddressFromSignature = restaurantFactory.restaurants2(recovered);
  var riderContractAddressFromSignature = riderFactory.riders2(recovered);
  
  if(customerContractAddressForOrder == customerContractAddressFromSignature || restaurantContractAddressForOrder == restaurantContractAddressFromSignature || riderContractAddressForOrder == riderContractAddressFromSignature){
    console.log("signature match");



    var query = {'contractAddress':req.body.orderAddress};

    Order.findOne(query, 'customerAddress', function(err, doc){
        if (err) return res.send(500, { error: err });
        else if(doc == null){
           return res.send("Customer hasn't specified an address");
        }
        else{
          if(doc.customerAddress == null)
            return res.send("Customer hasn't specified an address");
          else{
            return res.send(doc.customerAddress);
          }

        }
        
    });

  }else{
    console.log("signature mismatch");
  }

});



app.post(["/saveOrderAddress"], async function(req,res){
  console.log("new db entry");
  
  const msgParams = [
  {
      type: 'string',      // Any valid solidity type
      name: 'orderAddress',     // Any string label you want
      value: req.body.orderAddress  // The value to sign, this should be changed
  }];

  // get the signature
  const recovered = sigUtil.recoverTypedSignature({
    data: msgParams,
    sig: req.body.signature 
  });

  console.log("recovered Sig: " + recovered);

  // check if customer sent message
  var order = orderContract.at(req.body.orderAddress);
  var customerContractAddressForOrder = await order.customer();
  
  var customerContractAddressForSignature = customerFactory.customers2(recovered);

  if(customerContractAddressForOrder == customerContractAddressForSignature){
    console.log("signature match");



    var query = {'contractAddress':req.body.orderAddress};
    var new_Order = {
      contractAddress: req.body.orderAddress,
      customerAddress: req.body.physicalAddress
    };

    Order.findOneAndUpdate(query, new_Order, {upsert:true, useFindAndModify:false}, function(err, doc){
        if (err){
          console.log(err);
          return res.end(500, { error: err });
        }
        console.log("updated address for order: " + req.body.orderAddress);
        res.header({"Content-Type": "text/plain"});
        return res.end("succesfully saved");
    });
  }else{
    console.log("signature mismatch");
    res.header({"Content-Type": "text/plain"});
    return res.end("incorrect signature");
  }
});



