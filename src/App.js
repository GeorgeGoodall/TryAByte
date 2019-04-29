var express = require('express');
var http = require("html");
var bodyParser = require('body-parser');
var mongoose = require("mongoose");
const sigUtil = require('eth-sig-util');

// todo move http provide link to dotenv
require('dotenv').config();
var Web3 = require('web3');

var web3js = new Web3(new Web3.providers.HttpProvider("https://ropsten.infura.io/v3/a5c0811537054f2d9396aeb399c2efc7"));

var orderContract;

var controllerAddress = "0x0C65a3108b992F01FCeb6354990BB83e43d80FC7";
var controller;
var customerFactory;
var restaurantFactory;
var riderFactory;

loadContracts();

async function loadContracts(){
  var fs = require('fs');
  var orderABI = JSON.parse(fs.readFileSync('src/Contracts/Order.json', 'utf8'));
  var customerFactoryABI = JSON.parse(fs.readFileSync('src/Contracts/CustomerFactory.json', 'utf8'));
  var restaurantFactoryABI = JSON.parse(fs.readFileSync('src/Contracts/RestaurantFactory.json', 'utf8'));
  var riderFactoryABI = JSON.parse(fs.readFileSync('src/Contracts/RiderFactory.json', 'utf8'));
  var controllerABI = JSON.parse(fs.readFileSync('src/Contracts/Controller.json', 'utf8'));

  orderContract = web3js.eth.contract(orderABI.abi);
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

var Order = mongoose.model('Order',orderSchema);

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



app.listen(8080);
console.log("listening on port 8080");


//===================================================


app.get(['/',"/login","/login.html"], function(req,res){
  res.sendFile(__dirname+'/login.html');
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
  console.log(currentPrice);
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



