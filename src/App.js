var express = require('express');
var http = require("html");
var bodyParser = require('body-parser');
var mongo = require("mongodb");
const sigUtil = require('eth-sig-util');



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



function initWeb3(){
  if(typeof web3 !== 'undefined'){
    App.web3Provider = web3.currentProvider;
    console.log(App.web3Provider);
    console.log("Found Web3 Provider");
    web3 = new Web3(web3.currentProvider);
  } else {
    console.log("No Web3 Provider Found, attemting to connect to localhost. please install metamask");
    App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
    web3 = new Web3(App.web3Provider);
  }
  return;
}


// get order contract abi
var orderABI;

function initContracts() {
  console.log("Init Contracts");
  var OrderRequest = $.ajax({
    url: '/Contracts/Order.json',
    async: false,
    success: function(Order){
      console.log("success loading Order JSON")
      orderABI = TruffleContract(Order);
      orderABI.setProvider(App.web3Provider);
    }
  });
  //return App.initFactories(); modified after controller migration changed

  
  await App.initFactories();
  return afterAsync();

},



var app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());



app.locals.points = "test";

app.use('/js',express.static(__dirname+'/js'));
app.use('/css',express.static(__dirname+'/css'));
app.use('/Contracts',express.static(__dirname+'/Contracts'));



app.listen(8080);

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

app.post(["/db"], function(req,res){
  console.log(req.body.message);
  console.log(req.body.signedNumberValue);

  const recovered = sigUtil.recoverTypedSignature({
    data: msgParams,
    sig: req.body.message 
  });
  
  console.log('Recovered signer: ' + recovered)
  
});

app.post(["/requestAddress"], function(req,res){
  console.log(req.body.orderAddress);
  console.log(req.body.message);

  const recovered = sigUtil.recoverTypedSignature({
    data: msgParams,
    sig: req.body.message 
  });
  
  console.log('Recovered signer: ' + recovered)
  
});

app.post(["/newDbEntry"], function(req,res){
  console.log(req.body.msgParams);
  console.log(req.body.signature);
  console.log(req.body.address);
  console.log(req.body.orderAddress);
  
  // get the signature
  const recovered = sigUtil.recoverTypedSignature({
    data: req.body.msgParams,
    sig: req.body.signature 
  });

  console.log("recovered Sig: " + recovered);

  // check the order contract and see if the address matches the customer address
  // add a db entry if it does


});

app.get(["/EthPrice"], function(req,res){
  console.log(currentPrice);
  res.json({'currentPrice':currentPrice});
});
console.log("listening on port 8080");

// var server = http.createServer(function(req,res){
// 	console.log('request was made: ' + req.url);
// 	res.writeHead(200, {'Content-Type': 'text/html'});
// 	var myReadStream = fs.createReadStream(__dirname+'/login.html', 'utf8');
// 	myReadStream.pipe(res);
// });

// server.listen(3000, '127.0.0.1');
// 