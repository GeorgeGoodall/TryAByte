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

contract('controller', function(accounts){
	theAccounts = accounts;


	it("Initialises all factories", function(){
		return Controller.deployed().then(function(instance){
			controllerInstance = instance;
			return controllerInstance.restaurantFactoryAddress().then(function(address){
				return new web3.eth.Contract(RestaurantFactory.abi,address);
			}).then(function(instance){
				restaurantFactoryInstance = instance;
				return restaurantFactoryInstance.methods.owner().call();
			}).then(function(owner){;
				assert(theAccounts[0], owner);
				return controllerInstance.customerFactoryAddress();
			}).then(function(address){
				return new web3.eth.Contract(CustomerFactory.abi,address);
			}).then(function(instance){
				customerFactoryInstance = instance;
				return customerFactoryInstance.methods.owner().call();
			}).then(function(owner){
				assert(theAccounts[0], owner);
				return controllerInstance.riderFactoryAddress();
			}).then(function(address){
				return new web3.eth.Contract(RiderFactory.abi,address);
			}).then(function(instance){
				riderFactoryInstance = instance;
				return riderFactoryInstance.methods.owner().call();
			}).then(function(owner){
				assert(theAccounts[0], owner);
			})
		});
	});
	
});

describe('Contract: RestaurantFactory', function(){
	it("Initialises with no restaurants", function(){
		return restaurantFactoryInstance.methods.restaurantCount().call().then(function(count){
			assert.equal(count,0);
		});
	});

	it("Can create a restaurant", function(){
		return restaurantFactoryInstance.methods.createRestaurant(web3.utils.fromAscii("Test Restaurant"), web3.utils.fromAscii("41 Test Address, Cardiff"), 200 , 300, web3.utils.fromAscii("0123456789")).send({from: theAccounts[2], gas: 6721975}).then(function(res){
			return restaurantFactoryInstance.methods.restaurantCount().call();
		}).then(function(count){
			assert.equal(count,1);
			return restaurantFactoryInstance.methods.restaurants0(0).call();
		}).then(function(restaurantAddress){
			return new web3.eth.Contract(Restaurant.abi,restaurantAddress);
		}).then(function(instance){
			restaurantInstance = instance;
			return restaurantInstance.methods.name().call();
		}).then(function(restaurantName){
			assert.equal(web3.utils.hexToUtf8(restaurantName),"Test Restaurant", "Able to access the restaurant name");
		});
	});
});

describe('Contract: Restaurant', function(){
	it("Can access its Deetails", function(){
		return restaurantInstance.methods.name().call().then(function(restaurantName){
			assert.equal(web3.utils.hexToUtf8(restaurantName),"Test Restaurant", "Able to access the restaurant name");
			return restaurantInstance.methods.location().call();
		}).then(function(restaurantAddress){
			assert.equal(web3.utils.hexToUtf8(restaurantAddress),"41 Test Address, Cardiff", "Able to access the restaurant Address");
			return restaurantInstance.methods.contactNumber().call();
		}).then(function(restaurantNumber){
			assert.equal(web3.utils.hexToUtf8(restaurantNumber),"0123456789", "Able to access the restaurant Phone Number");
		});
	});

	it("Initialises with correct owner", function(){
		return restaurantInstance.methods.owner().call().then(function(owner){
			assert.equal(owner,theAccounts[2]);
		});
	});

	it("can access the menu",function(){
		return restaurantInstance.methods.getMenuAddress().call().then(function(_menuAddress){
			return new web3.eth.Contract(Menu.abi,_menuAddress);
		}).then(function(instance){
			menuInstance = instance;
			return menuInstance.methods.length().call();
		}).then(function(menuLength){
			assert.equal(menuLength,0);
		});
	});

	it("Can Add Multiple Items", function(){
		return menuInstance.methods.addMultipleItems(
			[0,0,2,3,4],
			[web3.utils.fromAscii("Chili"),web3.utils.fromAscii("Lasagnia"),web3.utils.fromAscii("Nachos"),web3.utils.fromAscii("Milkshake"),web3.utils.fromAscii("ice cream")],
			[web3.utils.fromAscii("the best chili in town"),web3.utils.fromAscii("Garfield would approve"),web3.utils.fromAscii("Cheese topped"),web3.utils.fromAscii("american styled Milkshake"),web3.utils.fromAscii("refreshing ice cream")]
			).send({from: theAccounts[2], gas: 6000000}).then(function(){
				return menuInstance.methods.getEntry(0).call();
			}).then(function(item) {
				assert.equal(web3.utils.toUtf8(item[0]),"Lasagnia");
				assert.equal(web3.utils.toUtf8(item[1]),"Garfield would approve");
				return menuInstance.methods.getEntry(1).call();
			}).then(function(item) {
				assert.equal(web3.utils.toUtf8(item[0]),"Chili");
				assert.equal(web3.utils.toUtf8(item[1]),"the best chili in town");
				return menuInstance.methods.getEntry(2).call();
			}).then(function(item) {
				assert.equal(web3.utils.toUtf8(item[0]),"Nachos");
				assert.equal(web3.utils.toUtf8(item[1]),"Cheese topped");
				return menuInstance.methods.getEntry(3).call();
			}).then(function(item) {
				assert.equal(web3.utils.toUtf8(item[0]),"Milkshake");
				assert.equal(web3.utils.toUtf8(item[1]),"american styled Milkshake");
				return menuInstance.methods.getEntry(4).call();
			}).then(function(item) {
				assert.equal(web3.utils.toUtf8(item[0]),"ice cream");
				assert.equal(web3.utils.toUtf8(item[1]),"refreshing ice cream");
			});
	});

	it("can swap item indexes", function(){
		return menuInstance.methods.swapItems(0,1).send({from: theAccounts[2], gas: 6000000}).then(function(){
			return menuInstance.methods.getEntry(0).call();
		}).then(function(item){
			assert.equal(web3.utils.toUtf8(item[0]),"Chili");
			assert.equal(web3.utils.toUtf8(item[1]),"the best chili in town");
			return menuInstance.methods.getEntry(1).call();
		}).then(function(item){
			assert.equal(web3.utils.toUtf8(item[0]),"Lasagnia");
			assert.equal(web3.utils.toUtf8(item[1]),"Garfield would approve");
		});
	});

	it("can add extras to the menu", function(){
		return menuInstance.methods.addExtras([web3.utils.fromAscii("extra cheese"),web3.utils.fromAscii("extra spicy"),web3.utils.fromAscii("loaded"),web3.utils.fromAscii("cream"),web3.utils.fromAscii("caramel")],[100,200,300,150,250]).send({from: theAccounts[2], gas: 6721975}).then(function(res){
			return menuInstance.methods.getExtra(1).call();
		}).then(function(extra){
			assert.equal(web3.utils.hexToUtf8(extra[0]),"extra cheese");
			assert.equal(extra[1],100);
			return menuInstance.methods.getExtra(2).call();
		}).then(function(extra){
			assert.equal(web3.utils.hexToUtf8(extra[0]),"extra spicy");
			assert.equal(extra[1],200);
			return menuInstance.methods.getExtra(3).call();
		}).then(function(extra){
			assert.equal(web3.utils.hexToUtf8(extra[0]),"loaded");
			assert.equal(extra[1],300);
		});
	});

	it("can assign extras to an item", function(){
		return menuInstance.methods.assignExtras([0,1,2],[4,3,4,2,3,4],[1,3,2]).send({from: theAccounts[2], gas: 6000000}).then(function(res){
			return menuInstance.methods.getEntry(0).call();
		}).then(function(item){
			//assert.equal(web3.utils.toUtf8(item[0]),"Nachos");
			assert.equal(item[4][0],4);
			return menuInstance.methods.getEntry(1).call();
		}).then(function(item){
			//assert.equal(web3.utils.toUtf8(item[0]),"Milkshake");
			assert.equal(item[4][0],3);
			assert.equal(item[4][1],4);
		});
	});


	it("can unassign extras", function(){
		return menuInstance.methods.unassignExtras([1,2],[2,3,3],[2,1]).send({from: theAccounts[2], gas: 6000000}).then(function(){
			return menuInstance.methods.getEntry(1).call();
		}).then(function(item){
			assert.equal(typeof item[4][2],"undefined");
			return menuInstance.methods.getEntry(2).call();
		}).then(function(item){
			assert.equal(typeof item[4][3],"undefined");
			assert.equal(typeof item[4][4],"undefined");
		});
	});

	// lasagnia, chili, nachos, milkshake, beans, chips

	it("Can add multiple options", function(){
		return menuInstance.methods.addOptions(
			[web3.utils.fromAscii("chocolate"),web3.utils.fromAscii("strawbery"),web3.utils.fromAscii("peanut butter"),web3.utils.fromAscii("extraSpicy"),web3.utils.fromAscii("Large"),web3.utils.fromAscii("small")],
			[400,400,400,500,700,500]).send({from: theAccounts[2], gas: 6000000}).then(function(){
				return menuInstance.methods.getOption(1).call();
			}).then(function(option){
				assert.equal(web3.utils.hexToUtf8(option[0]),"chocolate");
				assert.equal(option[1],400);
				return menuInstance.methods.getOption(2).call();
			}).then(function(option){
				assert.equal(web3.utils.hexToUtf8(option[0]),"strawbery");
				assert.equal(option[1],400);
				return menuInstance.methods.getOption(3).call();
			}).then(function(option){
				assert.equal(web3.utils.hexToUtf8(option[0]),"peanut butter");
				assert.equal(option[1],400);
				return menuInstance.methods.getOption(4).call();
			}).then(function(option){
				assert.equal(web3.utils.hexToUtf8(option[0]),"extraSpicy");
				assert.equal(option[1],500);
				return menuInstance.methods.getOption(5).call();
			}).then(function(option){
				assert.equal(web3.utils.hexToUtf8(option[0]),"Large");
				assert.equal(option[1],700);
				return menuInstance.methods.getOption(6).call();
			}).then(function(option){
				assert.equal(web3.utils.hexToUtf8(option[0]),"small");
				assert.equal(option[1],500);
			});
	});

	it("can assign options to an item", function(){
		return menuInstance.methods.assignOptions([0,1,2],[5,4,5,3,4,5],[1,3,2]).send({from: theAccounts[2], gas: 6000000}).then(function(res){
			return menuInstance.methods.getEntry(0).call();
		}).then(function(item){
			assert.equal(web3.utils.hexToUtf8(item[2][0]),"Large");
			assert.equal(item[3][0],700);
			return menuInstance.methods.getEntry(1).call();
		}).then(function(item){
			assert.equal(web3.utils.hexToUtf8(item[2][0]),"extraSpicy");
			assert.equal(web3.utils.hexToUtf8(item[2][1]),"Large");
			assert.equal(web3.utils.hexToUtf8(item[2][2]),"peanut butter");
			assert.equal(item[3][0],500);
			assert.equal(item[3][1],700);
			assert.equal(item[3][2],400);
			return menuInstance.methods.getEntry(2).call();
		}).then(function(item){
			assert.equal(web3.utils.hexToUtf8(item[2][0]),"extraSpicy");
			assert.equal(web3.utils.hexToUtf8(item[2][1]),"Large");
			assert.equal(item[3][0],500);
			assert.equal(item[3][1],700);
		});
	});

	it("can swap option indexes", function(){
		return menuInstance.methods.getEntry(1).call().then(function(item){
			return menuInstance.methods.swapOptions(1,4,5).send({from: theAccounts[2], gas: 6000000});
		}).then(function(res){
			return menuInstance.methods.getEntry(1).call();
		}).then(function(item){
			assert.equal(web3.utils.toUtf8(item[0]),"Lasagnia");
			assert.equal(web3.utils.toUtf8(item[1]),"Garfield would approve");
			assert.equal(web3.utils.toUtf8(item[2][0]),"Large");
			assert.equal(item[3][0],700);
			assert.equal(web3.utils.hexToUtf8(item[2][1]),"extraSpicy");
			assert.equal(item[3][1],500);
			assert.equal(web3.utils.hexToUtf8(item[2][2]),"peanut butter");
			assert.equal(item[3][2],400);
		});
	});

	it("can unassign options", function(){
		return menuInstance.methods.unassignOptions([1,2],[4,3,5],[2,1]).send({from: theAccounts[2], gas: 6000000}).then(function(){
			return menuInstance.methods.getEntry(1).call();
		}).then(function(item){
			assert.equal(web3.utils.toUtf8(item[2][0]),"Large");
			assert.equal(typeof item[2][1],"undefined");
			assert.equal(typeof item[2][2],"undefined");
			return menuInstance.methods.getEntry(2).call();
		}).then(function(item){
			assert.equal(web3.utils.toUtf8(item[2][0]),"extraSpicy");
			assert.equal(typeof item[2][1],"undefined");
		});
	});



	it("can remove multiple items", function(){
		return menuInstance.methods.removeMultipleItems([0,3]).send({from: theAccounts[2], gas: 6000000}).then(function(){
			return menuInstance.methods.getEntry(0).call();
		}).then(function(item){
			assert.equal(web3.utils.toUtf8(item[0]),"Lasagnia");
			assert.equal(web3.utils.toUtf8(item[1]),"Garfield would approve");
			assert.equal(web3.utils.toUtf8(item[2][0]),"Large");
			assert.equal(item[3][0],700);
			return menuInstance.methods.getEntry(1).call();
		}).then(function(item){
			assert.equal(web3.utils.toUtf8(item[0]),"Nachos");
			assert.equal(web3.utils.toUtf8(item[1]),"Cheese topped");
			assert.equal(web3.utils.toUtf8(item[2][0]),"extraSpicy");
			assert.equal(item[3][0],500);
		});
	});


	// this isn't working
	it("can remove multiple options", function(){
		return menuInstance.methods.setOptionsInactive([0,1]).send({from: theAccounts[2], gas: 6000000}).then(function(){
			return menuInstance.methods.getOption(0).call();
		}).then(function(option){
			assert.equal(option[2],false);
			return menuInstance.methods.getOption(1).call();
		}).then(function(option){
			assert.equal(option[2],false);
		});
	});

	let integerFlags = [2,3,2,3,2,2,2,4,2,2,4,2,1,1,1,2,4,2];
	let integerArray = [1,2,				// set extras inactive index

						200,200,300,		// add extra: price

						1,2,				// set option inactive index

						100,200,300,		// add option price

						0,1, 				// remove item at index			

						0,1, 				// add item at index

						0,1, 				// unassign options : item id
						1,2,2,3,			// option id
						2,2, 				// flags

						0,1, 				// assign options : item id
						5,8,4,5,			// option id
						2,2, 				// flags

						0, 					// unassign extras item ids
						4, 					// extra ids
						1, 					// flags

						0,1, 				// assign extra item ids
						5,6,5,6,			// extra id
						2,2]; 				// flags

	let stringFlags = [3,3,2,2];
	let stringArray = [	web3.utils.fromAscii("tomato sauce"), web3.utils.fromAscii("bbq sauce"), web3.utils.fromAscii("extra Cheese"), // extra names
						web3.utils.fromAscii("Small"), web3.utils.fromAscii("Medium"), web3.utils.fromAscii("Large"),
						web3.utils.fromAscii("Pizza"), web3.utils.fromAscii("Burger"),
						web3.utils.fromAscii("custom pizza"), web3.utils.fromAscii("100% beef")
						];

	// lassagnia natchos

	// ToDo write better tests for this
	it("Can run the batch menu update", function(){
		return menuInstance.methods.updateMenu(integerArray,integerFlags,stringArray, stringFlags).send({from: theAccounts[2], gas: 6000000}).then(function(res){
			return menuInstance.methods.getEntry(0).call();
		}).then((item)=>{
			itemDump(item);
			return menuInstance.methods.getEntry(1).call();
		}).then((item)=>{
			itemDump(item);
			return menuInstance.methods.getExtra(5).call();
		}).then((extra)=>{
			assert.equal(web3.utils.hexToUtf8(extra[0]),"tomato sauce");
			assert.equal(extra[1],200);
			return menuInstance.methods.getExtra(6).call();
		}).then((extra)=>{
			assert.equal(web3.utils.hexToUtf8(extra[0]),"bbq sauce");
			assert.equal(extra[1],200);
		});
	});

// 	// let testintegerFlags = [0,3,0,2,4,4,2,0,0,0,0,0,0,0,0,0,0,0,0];
// 	// let testintegerArray = [10,10,10,0,0,300,50,700,450,0,1,2,0,3,1];
// 	// let teststringFlags = [3,2,2,4,0];
// 	// let teststringArray = ["0x636865657365","0x70657070657273","0x636869636b656e","0x70697a7a61","0x6368697073","0x74657374","0x74657374","0x736d616c6c","0x6d656469756d","0x6c61726765","0x"];

// 	// it("can run batch update with sparse params", function(){
// 	// 	return menuInstance.methods.updateMenu(testintegerArray,testintegerFlags,teststringArray, teststringFlags).send({from: theAccounts[2], gas: 6000000});
// 	// })


});

// describe("contract: CustomerFactory", function(){

// 	it("Initialises with no customers", function(){
// 		return customerFactoryInstance.methods.customerCount().call().then(function(count){
// 			assert.equal(count,0);
// 		})
// 	})

// 	it("can create a customer account",function(){
// 		return customerFactoryInstance.methods.makeCustomer().send({from: theAccounts[3], gas: 6000000}).then(function(){
// 			return customerFactoryInstance.methods.customerCount().call();
// 		}).then(function(count){
// 			assert.equal(count,1);
// 			//customerFactoryInstance.methods.makeCustomer().send()
// 		});
// 	});
// });

function makeid(length) {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < length; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}

function itemDump(item){
	console.log("=====================");
	console.log(web3.utils.toUtf8(item[0]));
	console.log(web3.utils.toUtf8(item[1]));
	for(let i = 0; i < item[2].length; i++){
		console.log(web3.utils.toUtf8(item[2][i]) + ": " + item[3][i]);
	}
	let s = "";
	for(let i = 0; i < item[4].length; i++){
		s = s + item[4][i] + ",";
	}
	console.log(s);
	console.log("=====================");
}

function dumpItems(menuInstance){
	return menuInstance.methods.getEntry(0).call().then(function(item){
		itemDump(item);
		return menuInstance.methods.getEntry(1).call();
	}).then(function(){
		itemDump(item);
		return menuInstance.methods.getEntry(2).call();
	}).then(function(){
		itemDump(item);
		return menuInstance.methods.getEntry(3).call();
	}).then(function(){
		itemDump(item);
		return menuInstance.methods.getEntry(4).call();
	}).then(function(){
		itemDump(item);
		return menuInstance.methods.getEntry(5).call();
	}).then(function(){
		itemDump(item);
		return menuInstance.methods.getEntry(6).call();
	});
}

