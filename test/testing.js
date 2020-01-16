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

	it("can add extras to the menu", function(){
		return menuInstance.methods.addExtras([web3.utils.fromAscii("extra cheese"),web3.utils.fromAscii("extra spicy"),web3.utils.fromAscii("loaded"),web3.utils.fromAscii("cream"),web3.utils.fromAscii("caramel")],[100,200,300,150,250]).send({from: theAccounts[2], gas: 6721975}).then(function(res){
			return menuInstance.methods.extraHead().call();
		}).then(function(extraHead){
			assert.equal(extraHead,5);
			return menuInstance.methods.extras(0).call();
		}).then(function(extra){
			assert.equal(web3.utils.hexToUtf8(extra[0]),"extra cheese");
			assert.equal(extra[1],100);
			return menuInstance.methods.extras(1).call();
		}).then(function(extra){
			assert.equal(web3.utils.hexToUtf8(extra[0]),"extra spicy");
			assert.equal(extra[1],200);
			return menuInstance.methods.extras(2).call();
		}).then(function(extra){
			assert.equal(web3.utils.hexToUtf8(extra[0]),"loaded");
			assert.equal(extra[1],300);
		});
	});

	it("can add items to the menu", function(){
		return menuInstance.methods.addEntry(0,web3.utils.fromAscii("Chips"),
			web3.utils.fromAscii("Golden Chips"),
			[web3.utils.fromAscii("small"),web3.utils.fromAscii("medium"),web3.utils.fromAscii("large")],
			[100,200,300],
			[0,1,2]).send({from: theAccounts[2], gas: 6721975})
		.then(function(){
			return menuInstance.methods.getEntry(0).call();
		}).then(function(item){
			assert.equal(web3.utils.toUtf8(item[0]),"Chips");
			assert.equal(web3.utils.toUtf8(item[1]),"Golden Chips");
			assert.equal(web3.utils.toUtf8(item[2][0]),"large");
			assert.equal(item[3][1],200);
			assert.equal(item[4][0],0);
			assert.equal(item[4][2],2);

			return menuInstance.methods.addEntry(0,web3.utils.fromAscii("Fish"),
			web3.utils.fromAscii("Fresh Fish"),
			[web3.utils.fromAscii("cod"),web3.utils.fromAscii("haddok"),web3.utils.fromAscii("sammon")],
			[300,400,300],
			[]).send({from: theAccounts[2], gas: 6721975});
		}).then(function(){
			return menuInstance.methods.getEntry(0).call();
		}).then(function(item){
			assert.equal(web3.utils.toUtf8(item[0]),"Fish");
			assert.equal(web3.utils.toUtf8(item[1]),"Fresh Fish");
			assert.equal(web3.utils.toUtf8(item[2][2]),"cod");
			assert.equal(item[3][1],400);


			return menuInstance.methods.addEntry(1,web3.utils.fromAscii("Peas"),
			web3.utils.fromAscii("Green is Green"),
			[web3.utils.fromAscii("")],
			[150],
			[]).send({from: theAccounts[2], gas: 6721975});
		}).then( function(){
			return menuInstance.methods.getEntry(1).call();
		}).then(function(item){
			assert.equal(web3.utils.toUtf8(item[0]),"Peas");
			assert.equal(web3.utils.toUtf8(item[1]),"Green is Green");
			assert.equal(web3.utils.toUtf8(item[2][0]),"");
			assert.equal(item[3][0],150);

			return menuInstance.methods.addEntry(1,web3.utils.fromAscii("beans"),
			web3.utils.fromAscii("way too gassy"),
			[web3.utils.fromAscii("")],
			[150],
			[1]).send({from: theAccounts[2], gas: 6721975});
		}).then( function(){
			return menuInstance.methods.getEntry(1).call();
		}).then(function(item){
			assert.equal(web3.utils.toUtf8(item[0]),"beans");
			assert.equal(web3.utils.toUtf8(item[1]),"way too gassy");
			assert.equal(web3.utils.toUtf8(item[2][0]),"");
			assert.equal(item[3][0],150);
			assert.equal(item[4][0],1);
		});
	});

	it("can remove items", function(){
		return menuInstance.methods.removeItem(2).send({from: theAccounts[2], gas: 6721975}).then(function(){
			return menuInstance.methods.getEntry(2).call();
		}).then(function(item){
			assert.equal(web3.utils.toUtf8(item[0]),"Chips");
			assert.equal(web3.utils.toUtf8(item[1]),"Golden Chips");
			assert.equal(web3.utils.toUtf8(item[2][0]),"large");
			assert.equal(item[3][1],200);

			return menuInstance.methods.removeItem(0).send({from: theAccounts[2], gas: 6721975});
		}).then(function(){
			return menuInstance.methods.getEntry(2).call();
		}).then(function(item){
			assert.equal(web3.utils.toUtf8(item[0]),"");
			assert.equal(web3.utils.toUtf8(item[1]),"");
			assert.equal(typeof item[2][0],"undefined");
			assert.equal(typeof item[3][0],"undefined");

			return menuInstance.methods.getEntry(0).call();
		}).then(function(item){
			assert.equal(web3.utils.toUtf8(item[0]),"beans");
			assert.equal(web3.utils.toUtf8(item[1]),"way too gassy");
			assert.equal(web3.utils.toUtf8(item[2][0]),"");
			assert.equal(item[3][0],150);
		});
	});


	it("can add options to an item", function(){
		return menuInstance.methods.getEntry(1).call().then(function(item){
			return menuInstance.methods.addOption(1,0,web3.utils.fromAscii("super-size"),500).send({from: theAccounts[2], gas: 6000000});
		}).then(function(res){
			return menuInstance.methods.getEntry(1).call();
		}).then(function(item){
			assert.equal(web3.utils.toUtf8(item[0]),"Chips");
			assert.equal(web3.utils.toUtf8(item[1]),"Golden Chips");
			assert.equal(web3.utils.toUtf8(item[2][0]),"super-size");
			assert.equal(item[3][0],500);

			return menuInstance.methods.addOption(1,7,web3.utils.fromAscii("super-small"),50).send({from: theAccounts[2], gas: 6000000});
		}).then(function(){
			return menuInstance.methods.getEntry(1).call();
		}).then(function(item){
			assert.equal(web3.utils.toUtf8(item[0]),"Chips");
			assert.equal(web3.utils.toUtf8(item[1]),"Golden Chips");
			assert.equal(web3.utils.toUtf8(item[2][4]),"super-small");
			assert.equal(item[3][4],50);
		});;
	});

	it("can swap item indexes", function(){
		return menuInstance.methods.swapItems(0,1).send({from: theAccounts[2], gas: 6000000}).then(function(){
			return menuInstance.methods.getEntry(0).call();
		}).then(function(item){
			assert.equal(web3.utils.toUtf8(item[0]),"Chips");
			assert.equal(web3.utils.toUtf8(item[1]),"Golden Chips");
			assert.equal(web3.utils.toUtf8(item[2][0]),"super-size");
			assert.equal(item[3][0],500);

			return menuInstance.methods.getEntry(1).call();
		}).then(function(item){
			assert.equal(web3.utils.toUtf8(item[0]),"beans");
			assert.equal(web3.utils.toUtf8(item[1]),"way too gassy");
			assert.equal(web3.utils.toUtf8(item[2][0]),"");
			assert.equal(item[3][0],150);
		});
	});

	it("can swap option indexes", function(){
		return menuInstance.methods.getEntry(0).call().then(function(item){
			return menuInstance.methods.swapOptions(0,0,1).send({from: theAccounts[2], gas: 6000000});
		}).then(function(res){
			return menuInstance.methods.getEntry(0).call();
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
		return menuInstance.methods.addMultipleItems(
			[0,0,2,3],
			[web3.utils.fromAscii("Chili"),web3.utils.fromAscii("Lasagnia"),web3.utils.fromAscii("Nachos"),web3.utils.fromAscii("Milkshake")],
			[web3.utils.fromAscii("the best chili in town"),web3.utils.fromAscii("Garfield would approve"),web3.utils.fromAscii("Cheese topped"),web3.utils.fromAscii("american styled Milkshake")],
			[web3.utils.fromAscii(""),web3.utils.fromAscii(""),web3.utils.fromAscii("plain"),web3.utils.fromAscii("extra cheese"),web3.utils.fromAscii("vanila"),web3.utils.fromAscii("orio"),web3.utils.fromAscii("banana")],
			[500,500,150,250,400,400,400],
			[1,1,2,3],
			[1,0,0,1],
			[1,1,2,0]).send({from: theAccounts[2], gas: 6000000}).then(function(){
				return menuInstance.methods.getEntry(0).call();
			}).then(function(item) {
				assert.equal(web3.utils.toUtf8(item[0]),"Lasagnia");
				assert.equal(web3.utils.toUtf8(item[1]),"Garfield would approve");
				assert.equal(web3.utils.toUtf8(item[2][0]),"");
				assert.equal(item[3][0],500);
				assert.equal(item[4][0],0);
				return menuInstance.methods.getEntry(1).call();
			}).then(function(item) {
				assert.equal(web3.utils.toUtf8(item[0]),"Chili");
				assert.equal(web3.utils.toUtf8(item[1]),"the best chili in town");
				assert.equal(web3.utils.toUtf8(item[2][0]),"");
				assert.equal(item[3][0],500);
				assert.equal(item[4][0],1);
				return menuInstance.methods.getEntry(2).call();
			}).then(function(item) {
				assert.equal(web3.utils.toUtf8(item[0]),"Nachos");
				assert.equal(web3.utils.toUtf8(item[1]),"Cheese topped");
				assert.equal(web3.utils.toUtf8(item[2][1]),"plain");
				assert.equal(web3.utils.toUtf8(item[2][0]),"extra cheese");
				assert.equal(item[3][1],150);
				assert.equal(item[3][0],250);
				assert.equal(item[4][0],0);
				assert.equal(item[4][1],1);
				return menuInstance.methods.getEntry(3).call();
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
		return menuInstance.methods.addMultipleOptions(
			[3,3,3],
			[0,0,2],
			[web3.utils.fromAscii("chocolate"),web3.utils.fromAscii("strawbery"),web3.utils.fromAscii("peanut butter")],
			[400,400,400]).send({from: theAccounts[2], gas: 6000000}).then(function(){
				return menuInstance.methods.getEntry(3).call();
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
				return menuInstance.methods.getEntry(4).call();
			});
	});

	it("can assign extras to an item", function(){
		return menuInstance.methods.assignExtras([2,3,4],[4,3,4,2,3,4],[1,3,2]).send({from: theAccounts[2], gas: 6000000}).then(function(res){
			return menuInstance.methods.getEntry(2).call();
		}).then(function(item){
			assert.equal(web3.utils.toUtf8(item[0]),"Nachos");
			assert.equal(item[4][2],4);
			return menuInstance.methods.getEntry(3).call();
		}).then(function(item){
			assert.equal(web3.utils.toUtf8(item[0]),"Milkshake");
			assert.equal(item[4][0],3);
			assert.equal(item[4][1],4);
		});
	});


	it("can remove extras from an item", function(){
		return menuInstance.methods.unassignExtras([3,4],[2,4,3],[1,2]).send({from: theAccounts[2], gas: 6000000}).then(function(){
			return menuInstance.methods.getEntry(3).call();
		}).then(function(item){
			assert.equal(item[4][2],9999);
			return menuInstance.methods.getEntry(4).call();
		}).then(function(item){
			assert.equal(item[4][3],9999);
			assert.equal(item[4][4],9999);
		});
	});


	it("can remove multiple items", function(){
		return menuInstance.methods.removeMultipleItems([0,2,4]).send({from: theAccounts[2], gas: 6000000}).then(function(){
			return menuInstance.methods.getEntry(0).call();
		}).then(function(item){
			assert.equal(web3.utils.toUtf8(item[0]),"Chili");
			assert.equal(web3.utils.toUtf8(item[1]),"the best chili in town");
			assert.equal(web3.utils.toUtf8(item[2][0]),"");
			assert.equal(item[3][0],500);
			return menuInstance.methods.getEntry(1).call();
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
			return menuInstance.methods.getEntry(2).call();
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
		return menuInstance.methods.removeOption(1,0).send({from: theAccounts[2], gas: 6000000}).then(function(){
			return menuInstance.methods.getEntry(1).call();
		}).then(function(item){
			assert.equal(web3.utils.toUtf8(item[2][0]),"chocolate");
			return menuInstance.methods.removeOption(1,2).send({from: theAccounts[2], gas: 6000000});
		}).then(function(){
			return menuInstance.methods.getEntry(1).call();
		}).then(function(item){
			assert.equal(web3.utils.toUtf8(item[2][2]),"peanut butter");
		});
	});

	// chocolate, banana, peanut butter, vanila

	it("can remove multiple options", function(){
		return menuInstance.methods.removeMultipleOptions([1],[0,2,3],[3]).send({from: theAccounts[2], gas: 6000000}).then(function(){
			return menuInstance.methods.getEntry(1).call();
		}).then(function(item){
			assert.equal(web3.utils.toUtf8(item[2][0]),"banana");
			assert.equal(typeof item[2][1],"undefined");
		});
	});

	// remove extras  [indexes int] 1
    // add extras     [names string, prices int] 2
    // remove items   [itemindexes int] 1
    // add items      [addAtIndex int, itemnames sting, itemDescription string, optionnames string, price int, optionFlags int, extraIds int, extraFlags int] 2
    // remove options [itemIdss int, optionids int, flags int] 1
    // add options    [itemids int, addAtIndex int, optionNames string, _prices] 2
    // unassign extras[itemids int, extrasids int, flags int] 1
    // assign extras  [itemids int, extrasids int, flags int] 1
    // update prices <-- needs doing

	let integerFlags = [2,2,2,2,4,2,4,2,1,1,1,2,2,2,1,1,1,1,1,1];
	let integerArray = [0,1, 				//index

						200,200, 			// extra price

						0,1,				// remove item index

						0,1, 				// add at index
						400,700,900,600, 	// price
						3,1, 				// option flags
						4,5,4,5, 			// extras
						2,2, 				// extra flags

						0, 					// remove options item ids
						1, 					// remove options option ids
						1, 					// remove options flags

						0,0,				// add option to item with id
						1,1,				// insert options at index
						1200,700, 			// prices 

						0, 					// unassign extras item ids
						4, 					// extra ids
						1, 					// flags

						0, 					// assign extra item ids
						2, 					// extra id
						1]; 				// flags
	let stringFlags = [2,2,2,4,2];
	let stringArray = [	web3.utils.fromAscii("tomato sauce"), web3.utils.fromAscii("bbq sauce"),
						web3.utils.fromAscii("Pizza"), web3.utils.fromAscii("Burger"),
						web3.utils.fromAscii("custom pizza"), web3.utils.fromAscii("100% beef"),
						web3.utils.fromAscii("small"), web3.utils.fromAscii("medium"),web3.utils.fromAscii("large"),web3.utils.fromAscii(""),
						web3.utils.fromAscii("X-Large"), web3.utils.fromAscii("medium"),
						];




	it("Can run the batch menu update", function(){
		return menuInstance.methods.updateMenu(integerArray,integerFlags,stringArray, stringFlags).send({from: theAccounts[2], gas: 6000000}).then(function(){
			return menuInstance.methods.extras(0).call();
		}).then(function(extra){
			assert.equal(extra["active"],false)
			return menuInstance.methods.extras(1).call();
		}).then(function(extra){
			assert.equal(extra["active"],false)
			return menuInstance.methods.extraHead().call();
		}).then(function(extrasHead){
			assert.equal(extrasHead,7);
			return menuInstance.methods.extras(5).call();
		}).then(function(extra){
			assert.equal(web3.utils.toUtf8(extra["extraName"]),"tomato sauce")
			return menuInstance.methods.extras(6).call();
		}).then(function(extra){
			assert.equal(web3.utils.toUtf8(extra["extraName"]),"bbq sauce")
			return menuInstance.methods.getEntry(0).call();
		}).then(function(item){
			assert.equal(web3.utils.toUtf8(item[0]),"Pizza");
			assert.equal(web3.utils.toUtf8(item[1]),"custom pizza");
			assert.equal(web3.utils.toUtf8(item[2][0]),"large");
			assert.equal(item[3][0], 900);
			assert.equal(web3.utils.toUtf8(item[2][1]),"small");
			assert.equal(item[3][1],400);
			return menuInstance.methods.getEntry(1).call();
		}).then(function(item){
			assert.equal(web3.utils.toUtf8(item[0]),"Burger");
			assert.equal(web3.utils.toUtf8(item[1]),"100% beef");
			assert.equal(web3.utils.toUtf8(item[2][0]),"");
			assert.equal(item[3][0],600);
			assert.equal(item[4][0],4)
			return menuInstance.methods.getEntry(0).call();
		}).then(function(item){
			assert.equal(web3.utils.toUtf8(item[2][2]),"X-Large");
			assert.equal(item[3][2],1200);
			assert.equal(web3.utils.toUtf8(item[2][3]),"medium");
			assert.equal(item[3][3],700);
			assert.equal(item[4][0],9999);
			assert.equal(item[4][2],2);
		});
	});

	let testintegerFlags = [0,3,0,2,4,4,2,0,0,0,0,0,0,0,0,0,0,0,0];
	let testintegerArray = [10,10,10,0,0,300,50,700,450,0,1,2,0,3,1];
	let teststringFlags = [3,2,2,4,0];
	let teststringArray = ["0x636865657365","0x70657070657273","0x636869636b656e","0x70697a7a61","0x6368697073","0x74657374","0x74657374","0x736d616c6c","0x6d656469756d","0x6c61726765","0x"];

	it("can run batch update with sparse params", function(){
		return menuInstance.methods.updateMenu(testintegerArray,testintegerFlags,teststringArray, teststringFlags).send({from: theAccounts[2], gas: 6000000});
	})


});

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
	let s = "";
	for(let i = 0; i < item[4].length; i++){
		s = s + item[4][i] + ",";
	}
	console.log(s);
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

