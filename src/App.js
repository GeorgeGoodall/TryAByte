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

//var web3js = new Web3(new Web3.providers.HttpProvider("https://ropsten.infura.io/v3/a5c0811537054f2d9396aeb399c2efc7"));
var web3js = new Web3(new Web3.providers.HttpProvider('http://localhost:7545'));

var orderContract;
var restaurantContract;

var controllerAddress = "0xFE9A1014A451a4ab27C6E4D388aeCE094A8e52C3";
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
app.use('/uploads',express.static(__dirname+'/uploads'));


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

app.get(["/editYourRestaurant"], function(req,res){
  // output screen with list of restaurants
  res.sendFile(__dirname+'/html/EditYourRestaurant.html');
});

app.get([""])


//ajax
app.post(["/uploadImage"], upload.single('file'), async function(req,res){
  console.log("message: " + req.body.message);
  // validate the signiture
  const msgParams = [
  {
      type: 'string',       // Any valid solidity type
      name: 'message',   // Any string label you want
      value: req.body.message,    // The value to sign, this should be changed
  }];

  const recovered = sigUtil.recoverTypedSignature({
    data: msgParams,
    sig: req.body.signature 
  });
  
  console.log('Recovered signature: "' + recovered + '" With type of ' + typeof recovered);
  var restaurantContractAddressFromSignature = restaurantFactory.restaurants2(recovered);

  if(restaurantContractAddressFromSignature == "0x"){
    res.status(200).contentType("text/plain")
      .end("No Contract Assosiated with your addreess");
      return;
  }

  console.log("getting contract at: " + restaurantContractAddressFromSignature);



  var restaurant = restaurantContract.at(restaurantContractAddressFromSignature);
  var contractOwnerAddress = await restaurant.owner();

  // if valid
  if(contractOwnerAddress == recovered){
    // if valid then store the image
    const oldPath = req.file.path;
    var id = restaurant.id();
    const temp = '/uploads/logos/'+id+'.png'; // file name is the id of the restaurant
    const targetPath = path.join(__dirname, temp);
    if (path.extname(req.file.originalname).toLowerCase() === ".png") {
      fs.rename(oldPath, targetPath, err => {
        if (err){
          res.status(200).contentType("text/plain")
          .end("Error: " + err);
          return;
        }
        console.log("writing file from " + oldPath + " to " + targetPath);
        res
          .status(200)
          .contentType("text/plain")
          .end("File uploaded!");
      });
    } else {
      fs.unlink(oldPath, err => {
        if (err){
          res
          .status(400)
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
    
  }
  else{
    console.log("signature mismatch: you aren't the owner of this contract");
    console.log("contract Owner     : " + contractOwnerAddress);
    console.log("recovered signature: " + recovered);
    res
      .status(400)
      .contentType("text/plain")
      .end("signature mismatch: you aren't the owner of this contract");
      return;
  }
});

