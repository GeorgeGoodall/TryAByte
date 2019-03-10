var Controller = artifacts.require("Controller");
var RestaurantFactory = artifacts.require("RestaurantFactory");
var Restaurant = artifacts.require("Restaurant");
var Order = artifacts.require("Order");
var RiderFactory = artifacts.require("./RiderFactory.sol");
var Rider = artifacts.require("./Rider.sol");
var CustomerFactory = artifacts.require("./CustomerFactory.sol");
var Customer = artifacts.require("./Customer.sol");

var controllerInstance;
var restaurantFactoryInstance;
var restaurantInstance;
var orderInstance;
var customerFactoryInstance;
var customerInstance;
var riderFactoryInstance;
var riderInstance;

var theAccounts;

let catchRevert = require("./exceptions.js").catchRevert; // see exceptions.js for code reference

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
	
})

describe('Contract: RestaurantFactory', function(){


	it("Initialises with no restaurants", function(){
		return restaurantFactoryInstance.methods.restaurantCount().call().then(function(count){
			assert.equal(count,0);
		});
	});

	it("Can create a restaurant", function(){
		return restaurantFactoryInstance.methods.createRestaurant("Test Restaurant", "41 Test Address, Cardiff", "0123456789").send({from: theAccounts[2], gas: 3000000}).then(function(){
			return restaurantFactoryInstance.methods.restaurantCount().call();
		}).then(function(count){
			assert.equal(count,1);
			return restaurantFactoryInstance.methods.restaurants(0).call();
		}).then(function(restaurantAddress){
			return new web3.eth.Contract(Restaurant.abi,restaurantAddress);
		}).then(function(instance){
			restaurantInstance = instance;
			return restaurantInstance.methods.name().call();
		}).then(function(restaurantName){
			assert.equal(restaurantName,"Test Restaurant", "Able to access the restaurant name");
		});
	});
})

describe("Contract: CustomerFactory", function(){

	it("Initialises with no Customers", function(){
		return customerFactoryInstance.methods.customerCount().call().then(function(count){
			assert.equal(count,0);
		});
	});

	it("Can make a customer", function(){
		return customerFactoryInstance.methods.makeCustomer("Bilbo Baggins", "0987654321").send({from: theAccounts[6], gas: 3000000}).then(function(){
			return customerFactoryInstance.methods.customerCount().call();
		}).then(function(count){
			assert.equal(count,1);
		}).then(function(){
			return customerFactoryInstance.methods.customers2(theAccounts[6]).call();
		}).then(function(customerAddress){
			console.log(customerAddress);
			return new web3.eth.Contract(Customer.abi,customerAddress);
		}).then(function(instance){
			customerInstance = instance;
		});
	});
})


describe("Contract: RiderFactory", function(){

	it("Initialises with no Riders", function(){
		return riderFactoryInstance.methods.riderCount().call().then(function(count){
			assert.equal(count,0);
		});
	});

	it("Can make a rider", function(){
		return riderFactoryInstance.methods.makeRider("Gandalf", "0987654321").send({from: theAccounts[6], gas: 3000000}).then(function(){
			return riderFactoryInstance.methods.riderCount().call();
		}).then(function(count){
			assert.equal(count,1);
		});
	});
})


describe('Contract: Restaurant', function(){
	it("Can access its Deetails", function(){
		return restaurantInstance.methods.name().call().then(function(restaurantName){
			assert.equal(restaurantName,"Test Restaurant", "Able to access the restaurant name");
			return restaurantInstance.methods.location().call();
		}).then(function(restaurantAddress){
			assert.equal(restaurantAddress,"41 Test Address, Cardiff", "Able to access the restaurant Address");
			return restaurantInstance.methods.contactNumber().call();
		}).then(function(restaurantNumber){
			assert.equal(restaurantNumber,"0123456789", "Able to access the restaurant Phone Number");
		});
	});

	it("Initialises with correct owner", function(){
		return restaurantInstance.methods.owner().call().then(function(owner){
			assert.equal(owner,theAccounts[2]);
		});
	});

	it("Initialises with an empty menu", function(){
		return restaurantInstance.methods.getMenuLength().call().then(function(menuLength){
			assert.equal(menuLength,0);
		});
	});

	it("Can Add Menu Items",function(){
		return restaurantInstance.methods.menuAddItems([web3.utils.fromAscii("Fish"),
														web3.utils.fromAscii("Chips"),
														web3.utils.fromAscii("Pie"),
														web3.utils.fromAscii("cake"),
														web3.utils.fromAscii("beans")],
														[300,200,100,400,500]).send({from:theAccounts[2], gas:3000000}).then(function(){
			return restaurantInstance.methods.getMenuLength().call().then(function(menuLength){
				assert.equal(menuLength,5,"Menu length hasn't increased");
			});
		});
	});

	// cant add menu items as anyone other than the restaurant owner

	// cant add items if there input args are incorrect

	// can search menu
	it("Can retrieve an item from the menu and it is correct", function(){
		return restaurantInstance.methods.getMenuItem(1).call().then(function(item){
			assert.equal(web3.utils.hexToUtf8(item["itemname"]),"Chips");
			assert.equal(item["cost"],200);
		});
	});

	it("Can remove menu items", function(){
		return restaurantInstance.methods.menuRemoveItems([web3.utils.fromAscii("cake"),web3.utils.fromAscii("beans")]).send({from:theAccounts[2], gas:3000000}).then(function(){
			return restaurantInstance.methods.getMenuLength().call().then(function(menuLength){
				assert.equal(menuLength,3);
			});
		})
	})

	it("can check if an order is valid (if its items exist)",function(){
		return restaurantInstance.methods.validOrder([web3.utils.fromAscii("Fish"),web3.utils.fromAscii("Chips")]).call().then(function(validOrder){
			assert.equal(validOrder,true,"thinks valid order is invalid");
			return restaurantInstance.methods.validOrder([web3.utils.fromAscii("Fish"),web3.utils.fromAscii("Lasagnia")]).call();
		}).then(function(validOrder){
			assert.equal(validOrder,false,"thinks invalid order is valid");
		})
	})

	it("Can not make order from address that isnt a customer smart contract", async function() {
        await catchRevert(restaurantInstance.methods.makeOrder([web3.utils.fromAscii("Fish"),web3.utils.fromAscii("Chips")]).send({from:theAccounts[1],gas:6000000}));
    });
	
});

describe("Contract: Customer", function(){
	it("Can make an order",function(){
		return customerInstance.methods.makeOrder(restaurantInstance.options.address,[web3.utils.fromAscii("Fish"),web3.utils.fromAscii("Chips")]).send({from:theAccounts[6],gas:6000000}).then(function(){
			return customerInstance.methods.getTotalOrders().call({from:theAccounts[6]}).then(function(totalOrders){
				assert.equal(totalOrders,1);
			});
		});
	});
})



describe("Contract: Order", function(){
	it("can access order Deetails", function(){
		return restaurantInstance.methods.orders(0).call().then(function(orderAddress){
			return new web3.eth.Contract(Order.abi,orderAddress[1]);
		}).then(function(instance){
			orderInstance = instance;
			return orderInstance.methods.id().call();
		}).then(function(id){
			assert.equal(id,0);
			return orderInstance.methods.totalItems().call();
		}).then(function(totalItems){
			assert.equal(totalItems,2);
		});
	});
});

