var express = require('express');
var http = require("html");

var mongo = require("mongodb");



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

//app.set

// var fs = require("fs");


var app = express();

app.locals.points = "test";

app.use('/js',express.static(__dirname+'/js'));
app.use('/css',express.static(__dirname+'/css'));
app.use('/Contracts',express.static(__dirname+'/Contracts'));



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

// app.get(["/db"], function(req,res){
// 	console.log(currentPrice);
// 	res.json({'currentPrice':currentPrice});
// });


app.listen(8080);
console.log("listening on port 8080");

// var server = http.createServer(function(req,res){
// 	console.log('request was made: ' + req.url);
// 	res.writeHead(200, {'Content-Type': 'text/html'});
// 	var myReadStream = fs.createReadStream(__dirname+'/login.html', 'utf8');
// 	myReadStream.pipe(res);
// });

// server.listen(3000, '127.0.0.1');
// 