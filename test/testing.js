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

	// fish, beans, Peas, chips

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

	// beans, chips

	it("can add options to an item", function(){
		return menuInstance.getEntry.call(1).then(function(item){
			menuInstance.addOption(1,0,web3.utils.fromAscii("super-size"),500);
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
			assert.equal(web3.utils.toUtf8(item[0]),"Chips");
			assert.equal(web3.utils.toUtf8(item[1]),"Golden Chips");
			assert.equal(web3.utils.toUtf8(item[2][4]),"super-small");
			assert.equal(item[3][4],50);
		});;
	});

	it("can swap item indexes", function(){
		return menuInstance.swapItems(0,1).then(function(){
			return menuInstance.getEntry.call(0);
		}).then(function(item){
			assert.equal(web3.utils.toUtf8(item[0]),"Chips");
			assert.equal(web3.utils.toUtf8(item[1]),"Golden Chips");
			assert.equal(web3.utils.toUtf8(item[2][0]),"super-size");
			assert.equal(item[3][0],500);

			return menuInstance.getEntry.call(1);
		}).then(function(item){
			assert.equal(web3.utils.toUtf8(item[0]),"beans");
			assert.equal(web3.utils.toUtf8(item[1]),"way too gassy");
			assert.equal(web3.utils.toUtf8(item[2][0]),"");
			assert.equal(item[3][0],150);
		});
	});

	it("can swap option indexes", function(){
		return menuInstance.getEntry.call(0).then(function(item){
			menuInstance.swapOptions(0,0,1);
			return menuInstance.getEntry.call(0);
		}).then(function(item){
			assert.equal(web3.utils.toUtf8(item[0]),"Chips");
			assert.equal(web3.utils.toUtf8(item[1]),"Golden Chips");
			assert.equal(web3.utils.toUtf8(item[2][1]),"super-size");
			assert.equal(web3.utils.toUtf8(item[2][0]),"large");
			assert.equal(item[3][1],500);
			assert.equal(item[3][0],300);
		});
	});

	it("Can Add Multiple Items", function(){
		return menuInstance.addMultipleItems(
			[0,0,2,3],
			[web3.utils.fromAscii("Chili"),web3.utils.fromAscii("Lasagnia"),web3.utils.fromAscii("Nachos"),web3.utils.fromAscii("Milkshake")],
			[web3.utils.fromAscii("the best chili in town"),web3.utils.fromAscii("Garfield would approve"),web3.utils.fromAscii("Cheese topped"),web3.utils.fromAscii("american styled Milkshake")],
			[web3.utils.fromAscii(""),web3.utils.fromAscii(""),web3.utils.fromAscii("plain"),web3.utils.fromAscii("extra cheese"),web3.utils.fromAscii("vanila"),web3.utils.fromAscii("orio"),web3.utils.fromAscii("banana")],
			[500,500,150,250,400,400,400],
			[1,1,2,3]).then(function(){
				return menuInstance.getEntry.call(0);
			}).then(function(item) {
				assert.equal(web3.utils.toUtf8(item[0]),"Lasagnia");
				assert.equal(web3.utils.toUtf8(item[1]),"Garfield would approve");
				assert.equal(web3.utils.toUtf8(item[2][0]),"");
				assert.equal(item[3][0],500);
				return menuInstance.getEntry.call(1);
			}).then(function(item) {
				assert.equal(web3.utils.toUtf8(item[0]),"Chili");
				assert.equal(web3.utils.toUtf8(item[1]),"the best chili in town");
				assert.equal(web3.utils.toUtf8(item[2][0]),"");
				assert.equal(item[3][0],500);
				return menuInstance.getEntry.call(2);
			}).then(function(item) {
				assert.equal(web3.utils.toUtf8(item[0]),"Nachos");
				assert.equal(web3.utils.toUtf8(item[1]),"Cheese topped");
				assert.equal(web3.utils.toUtf8(item[2][1]),"plain");
				assert.equal(web3.utils.toUtf8(item[2][0]),"extra cheese");
				assert.equal(item[3][1],150);
				assert.equal(item[3][0],250);
				return menuInstance.getEntry.call(3);
			}).then(function(item) {
				assert.equal(web3.utils.toUtf8(item[0]),"Milkshake");
				assert.equal(web3.utils.toUtf8(item[1]),"american styled Milkshake");
				assert.equal(web3.utils.toUtf8(item[2][2]),"vanila");
				assert.equal(web3.utils.toUtf8(item[2][1]),"orio");
				assert.equal(web3.utils.toUtf8(item[2][0]),"banana");
				assert.equal(item[3][2],400);
				assert.equal(item[3][1],400);
				assert.equal(item[3][0],400);
			});
	});

	// lasagnia, chili, nachos, milkshake, beans, chips

	it("Can add multiple options", function(){
		return menuInstance.addMultipleOptions(
			[3,3,3],
			[0,0,2],
			[web3.utils.fromAscii("chocolate"),web3.utils.fromAscii("strawbery"),web3.utils.fromAscii("peanut butter")],
			[400,400,400]).then(function(){
				return menuInstance.getEntry.call(3);
			}).then(function(item){
				assert.equal(web3.utils.toUtf8(item[0]),"Milkshake");
				assert.equal(web3.utils.toUtf8(item[1]),"american styled Milkshake");
				assert.equal(web3.utils.toUtf8(item[2][5]),"vanila");
				assert.equal(web3.utils.toUtf8(item[2][4]),"peanut butter");
				assert.equal(web3.utils.toUtf8(item[2][3]),"orio");
				assert.equal(web3.utils.toUtf8(item[2][2]),"banana");
				assert.equal(web3.utils.toUtf8(item[2][1]),"chocolate");
				assert.equal(web3.utils.toUtf8(item[2][0]),"strawbery");
				assert.equal(item[3][2],400);
				assert.equal(item[3][1],400);
				assert.equal(item[3][0],400);
				assert.equal(item[3][3],400);
				assert.equal(item[3][4],400);
				return menuInstance.getEntry.call(4);
			});
	});




	it("can remove multiple items", function(){
		return menuInstance.removeMultipleItems([0,2,4]).then(function(){
			return menuInstance.getEntry.call(0);
		}).then(function(item){
			assert.equal(web3.utils.toUtf8(item[0]),"Chili");
			assert.equal(web3.utils.toUtf8(item[1]),"the best chili in town");
			assert.equal(web3.utils.toUtf8(item[2][0]),"");
			assert.equal(item[3][0],500);
			return menuInstance.getEntry.call(1);
		}).then(function(item){
			assert.equal(web3.utils.toUtf8(item[0]),"Milkshake");
			assert.equal(web3.utils.toUtf8(item[1]),"american styled Milkshake");
			assert.equal(web3.utils.toUtf8(item[2][5]),"vanila");
			assert.equal(web3.utils.toUtf8(item[2][4]),"peanut butter");
			assert.equal(web3.utils.toUtf8(item[2][3]),"orio");
			assert.equal(web3.utils.toUtf8(item[2][2]),"banana");
			assert.equal(web3.utils.toUtf8(item[2][1]),"chocolate");
			assert.equal(web3.utils.toUtf8(item[2][0]),"strawbery");
			assert.equal(item[3][2],400);
			assert.equal(item[3][1],400);
			assert.equal(item[3][0],400);
			assert.equal(item[3][3],400);
			assert.equal(item[3][4],400);
			return menuInstance.getEntry.call(2);
		}).then(function(item){
			assert.equal(web3.utils.toUtf8(item[0]),"beans");
			assert.equal(web3.utils.toUtf8(item[1]),"way too gassy");
			assert.equal(web3.utils.toUtf8(item[2][0]),"");
			assert.equal(item[3][0],150);
		});
	});

	// options for milkshake
	// strawbery, chocolate, banana, orio, peanut butter, vanila

	it("can remove an option", function(){
		return menuInstance.removeOption(1,0).then(function(){
			return menuInstance.getEntry.call(1);
		}).then(function(item){
			assert.equal(web3.utils.toUtf8(item[2][0]),"chocolate");
			return menuInstance.removeOption(1,2);
		}).then(function(){
			return menuInstance.getEntry.call(1);
		}).then(function(item){
			assert.equal(web3.utils.toUtf8(item[2][2]),"peanut butter");
		});
	});

	// chocolate, banana, peanut butter, vanila

	it("can remove multiple options", function(){
		return menuInstance.removeMultipleOptions([1],[0,2,3],[3]).then(function(){
			return menuInstance.getEntry.call(1);
		}).then(function(item){
			assert.equal(web3.utils.toUtf8(item[2][0]),"banana");
			assert.equal(typeof item[2][1],"undefined");
		});
	});

	
});

// chili, milkshake, chips



function makeid(length) {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < length; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}

function itemDump(item){
	console.log(web3.utils.toUtf8(item[0]));
	console.log(web3.utils.toUtf8(item[1]));
	for(let i = 0; i < item[2].length; i++){
		console.log(web3.utils.toUtf8(item[2][i]) + ": " + item[3][i]);
	}
}

function dumpItems(menuInstance){
	return menuInstance.getEntry.call(0).then(function(item){
		itemDump(item);
		return menuInstance.getEntry.call(1);
	}).then(function(){
		itemDump(item);
		return menuInstance.getEntry.call(2);
	}).then(function(){
		itemDump(item);
		return menuInstance.getEntry.call(3);
	}).then(function(){
		itemDump(item);
		return menuInstance.getEntry.call(4);
	}).then(function(){
		itemDump(item);
		return menuInstance.getEntry.call(5);
	}).then(function(){
		itemDump(item);
		return menuInstance.getEntry.call(6);
	});
}

