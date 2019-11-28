// Rider account is theAccounts[7]
// Restaurant account is theAccounts[2]
// customer account is theAccounts[6]

var Controller = artifacts.require("Controller");
var RestaurantFactory = artifacts.require("RestaurantFactory");
var Restaurant = artifacts.require("Restaurant");
var Order = artifacts.require("Order");
var RiderFactory = artifacts.require("./RiderFactory.sol");
var Rider = artifacts.require("./Rider.sol");
var CustomerFactory = artifacts.require("./CustomerFactory.sol");
var Customer = artifacts.require("./Customer.sol");
var Menu = artifacts.require("./Menu.sol");

var controllerInstance;
var restaurantFactoryInstance;
var restaurantInstance;
var orderInstance;
var customerFactoryInstance;
var customerInstance;
var riderFactoryInstance;
var riderInstance;

var orderAddress;

var theAccounts;

//let catchRevert = require("./exceptions.js").catchRevert; // see exceptions.js for code reference

var menuInstance;

contract('Menu', function(accounts){
	it("can depoly a menu",function(){
		return Menu.deployed().then(function(_menuInstance){
			menuInstance = _menuInstance;
		});
	});

	it("can add items to the menu", function(){
		return menuInstance.addEntry(0,web3.utils.fromAscii("Chips"),
			web3.utils.fromAscii("Golden Chips"),
			[web3.utils.fromAscii("small"),web3.utils.fromAscii("medium"),web3.utils.fromAscii("large")],
			[100,200,300])
		.then(function(){
			return menuInstance.getEntry.call(0);
		}).then(function(item){
			assert.equal(web3.utils.toUtf8(item[0]),"Chips");
			assert.equal(web3.utils.toUtf8(item[1]),"Golden Chips");
			assert.equal(web3.utils.toUtf8(item[2][0]),"large");
			assert.equal(item[3][1],200);


			return menuInstance.addEntry(0,web3.utils.fromAscii("Fish"),
			web3.utils.fromAscii("Fresh Fish"),
			[web3.utils.fromAscii("cod"),web3.utils.fromAscii("haddok"),web3.utils.fromAscii("sammon")],
			[300,400,300]);
		}).then(function(){
			return menuInstance.getEntry.call(0);
		}).then(function(item){
			assert.equal(web3.utils.toUtf8(item[0]),"Fish");
			assert.equal(web3.utils.toUtf8(item[1]),"Fresh Fish");
			assert.equal(web3.utils.toUtf8(item[2][2]),"cod");
			assert.equal(item[3][1],400);


			return menuInstance.addEntry(1,web3.utils.fromAscii("Peas"),
			web3.utils.fromAscii("Green is Green"),
			[web3.utils.fromAscii("")],
			[150]);
		}).then( function(){
			return menuInstance.getEntry.call(1);
		}).then(function(item){
			assert.equal(web3.utils.toUtf8(item[0]),"Peas");
			assert.equal(web3.utils.toUtf8(item[1]),"Green is Green");
			assert.equal(web3.utils.toUtf8(item[2][0]),"");
			assert.equal(item[3][0],150);

			return menuInstance.addEntry(1,web3.utils.fromAscii("beans"),
			web3.utils.fromAscii("way too gassy"),
			[web3.utils.fromAscii("")],
			[150]);
		}).then( function(){
			return menuInstance.getEntry.call(1);
		}).then(function(item){
			assert.equal(web3.utils.toUtf8(item[0]),"beans");
			assert.equal(web3.utils.toUtf8(item[1]),"way too gassy");
			assert.equal(web3.utils.toUtf8(item[2][0]),"");
			assert.equal(item[3][0],150);
		});
	});

	it("can remove items", function(){
		return menuInstance.removeItem(2).then(function(){
			return menuInstance.getEntry.call(2);
		}).then(function(item){
			assert.equal(web3.utils.toUtf8(item[0]),"Chips");
			assert.equal(web3.utils.toUtf8(item[1]),"Golden Chips");
			assert.equal(web3.utils.toUtf8(item[2][0]),"large");
			assert.equal(item[3][1],200);

			return menuInstance.removeItem(0);
		}).then(function(){
			return menuInstance.getEntry.call(2);
		}).then(function(item){
			assert.equal(web3.utils.toUtf8(item[0]),"");
			assert.equal(web3.utils.toUtf8(item[1]),"");
			assert.equal(typeof item[2][0],"undefined");
			assert.equal(typeof item[3][0],"undefined");

			return menuInstance.getEntry.call(0);
		}).then(function(item){
			assert.equal(web3.utils.toUtf8(item[0]),"beans");
			assert.equal(web3.utils.toUtf8(item[1]),"way too gassy");
			assert.equal(web3.utils.toUtf8(item[2][0]),"");
			assert.equal(item[3][0],150);
		});
	});

	it("can add options to an item", function(){
		return menuInstance.addOption(1,0,web3.utils.fromAscii("super-size"),500).then(function(){
			return menuInstance.getEntry.call(1);
		}).then(function(item){

			assert.equal(web3.utils.toUtf8(item[0]),"Chips");
			assert.equal(web3.utils.toUtf8(item[1]),"Golden Chips");
			assert.equal(web3.utils.toUtf8(item[2][0]),"super-size");
			assert.equal(item[3][0],500);

			return menuInstance.addOption(1,7,web3.utils.fromAscii("super-small"),50);
		}).then(function(){
			return menuInstance.getEntry.call(1);
		}).then(function(item){
			console.log(item);

			assert.equal(web3.utils.toUtf8(item[0]),"Chips");
			assert.equal(web3.utils.toUtf8(item[1]),"Golden Chips");
			assert.equal(web3.utils.toUtf8(item[2][4]),"super-small");
			assert.equal(item[3][4],50);

			//return menuInstance.addOption(0,0,web3.utils.fromAscii("super-size"),500);
		});;
	});

});



function makeid(length) {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < length; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}

