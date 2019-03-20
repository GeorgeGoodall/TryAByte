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
		return restaurantFactoryInstance.methods.createRestaurant("Test Restaurant", "41 Test Address, Cardiff", "0123456789").send({from: theAccounts[2], gas: 4000000}).then(function(){
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
		return riderFactoryInstance.methods.makeRider("Gandalf", "0987654321").send({from: theAccounts[7], gas: 3000000}).then(function(){
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
														web3.utils.fromAscii("beans"),
														web3.utils.fromAscii("Jacket Potato"),
														web3.utils.fromAscii("Burger"),
														web3.utils.fromAscii("spaghetti")],
														[300,200,100,400,500,600,700,800]).send({from:theAccounts[2], gas:3000000}).then(function(){
			return restaurantInstance.methods.getMenuLength().call().then(function(menuLength){
				assert.equal(menuLength,8,"Menu length hasn't increased");
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
		return restaurantInstance.methods.menuRemoveItems([web3.utils.fromAscii("cake")]).send({from:theAccounts[2], gas:3000000}).then(function(){
			return restaurantInstance.methods.getMenuLength().call().then(function(menuLength){
				assert.equal(menuLength,7);
				return restaurantInstance.methods.getMenuItem(4).call();
			}).then(function(item){
				assert.equal(web3.utils.hexToUtf8(item["itemname"]),"beans")
				assert.equal(item["cost"],500);
			});
		})
	})

	it("can check if an order is valid and get its price",function(){
		return restaurantInstance.methods.validOrder([web3.utils.fromAscii("Fish"),web3.utils.fromAscii("Chips")]).call().then(function(validOrder){
			assert.equal(validOrder[0],true,"thinks valid order is invalid");
			assert.equal(validOrder[1],500,"returned an incorrect price");
			return restaurantInstance.methods.validOrder([web3.utils.fromAscii("Fish"),web3.utils.fromAscii("Lasagnia")]).call();
		}).then(function(validOrder){
			assert.equal(validOrder[0],false,"thinks invalid order is valid");
		})
	})

	it("Can not make order from address that isnt a customer smart contract", async function() {
        await catchRevert(restaurantInstance.methods.makeOrder([web3.utils.fromAscii("Fish"),web3.utils.fromAscii("Chips")]).send({from:theAccounts[1],gas:3000000}));
    });
	
});

describe("Contract: Customer", async function(){
	it("Can not make order from address that isnt a customer smart contract", async function() {
        await catchRevert(restaurantInstance.methods.makeOrder([web3.utils.fromAscii("Fish"),web3.utils.fromAscii("Chips")]).send({from:theAccounts[1],gas:3000000}));
    });
	it("Can not make order from address that doesn't own the customer smart contract", async function() {
        await catchRevert(customerInstance.methods.makeOrder(restaurantInstance.options.address,[web3.utils.fromAscii("Fish"),web3.utils.fromAscii("Chips")]).send({from:theAccounts[9],gas:3000000}));
    });
    it("Can not make order if the order items aren't in the menu", async function() {
        await catchRevert(customerInstance.methods.makeOrder(restaurantInstance.options.address,[web3.utils.fromAscii("Fish"),web3.utils.fromAscii("Lasagnia")]).send({from:theAccounts[6],gas:3000000}));
    });
    it("Can not make an order if not enough ether is sent", async function() {
        await catchRevert(customerInstance.methods.makeOrder(restaurantInstance.options.address,[web3.utils.fromAscii("Fish"),web3.utils.fromAscii("Chips")]).send({from:theAccounts[6],gas:3000000}));
    });
    // ToDo: need to do a check that the ether is returned
    it("Can not make an order if not enough ether is sent",async function(){
    	await catchRevert(customerInstance.methods.makeOrder(restaurantInstance.options.address,[web3.utils.fromAscii("Fish"),web3.utils.fromAscii("Chips")]).send({from:theAccounts[6],gas:300000000,value:300}));
	});

	it("Can make an order if enough ether is sent",async function(){
		return customerInstance.methods.makeOrder(restaurantInstance.options.address,[	web3.utils.fromAscii("Fish"),
																						web3.utils.fromAscii("Fish"),
																						web3.utils.fromAscii("Fish"),
																						web3.utils.fromAscii("Chips"),
																						web3.utils.fromAscii("beans"),
																						web3.utils.fromAscii("Pie")]).send({from:theAccounts[6],gas:30000000,value:30000}).then(function(){
			return customerInstance.methods.getTotalOrders().call({from:theAccounts[6]}).then(function(totalOrders){
				assert.equal(totalOrders,1);
			});
		});
	});

	// it("Can make an order if enough ether is sent",async function(){
	// 	let balance = await web3.eth.getBalance(theAccounts[6]);
	// 	return customerInstance.methods.makeOrder(restaurantInstance.options.address,[	web3.utils.fromAscii("Fish"),
	// 																					web3.utils.fromAscii("Fish"),
	// 																					web3.utils.fromAscii("Fish")
	// 																					web3.utils.fromAscii("Chips"),
	// 																					web3.utils.fromAscii("beans"),
	// 																					web3.utils.fromAscii("Pie")]).send({from:theAccounts[6],gas:30000000,value:30000}).then(function(){
	// 		return customerInstance.methods.getTotalOrders().call({from:theAccounts[6]}).then(function(totalOrders){
	// 			assert.equal(totalOrders,1);
	// 		});
	// 	}).then(async function(){
	// 		let balance2 = await web3.eth.getBalance(theAccounts[6]);
	// 		console.log(balance - balance2);
	// 	});
	// });
})



describe("Contract: Order", function(){
	it("can access order Deetails", function(){
		return restaurantInstance.methods.orders(0).call().then(function(_orderAddress){
			orderAddress = _orderAddress[1];
			return new web3.eth.Contract(Order.abi,_orderAddress[1]);
		}).then(function(instance){
			orderInstance = instance;
			return orderInstance.methods.id().call();
		}).then(function(id){
			assert.equal(id,0);
			return orderInstance.methods.totalItems().call();
		}).then(function(totalItems){
			assert.equal(totalItems,6);
			return orderInstance.methods.riderStatus().call();
		}).then(function(status){
			assert.equal(status,0);
		});
	});
	it("has the correct balence (payed by the customer)", function(){
		return orderInstance.methods.getBalance().call().then(function(balance){
			assert.equal(balance,1900)
		});
	});
});



describe("Order Tracking",function(){
	
	it("Can access the rider instance",function(){
		return riderFactoryInstance.methods.riders2(theAccounts[7]).call().then(function(riderAddress){
			return new web3.eth.Contract(Rider.abi,riderAddress);
		}).then(function(instance){
			riderInstance = instance;
			return riderInstance.methods.id().call();
		}).then(function(_id){
			assert.equal(_id,0);
			return riderInstance.methods.owner().call();
		}).then(function(owner){
			assert.equal(owner,theAccounts[7]);
			return riderInstance.methods.totalOrders().call();
		}).then(function(totalOrders){
			assert.equal(totalOrders,0);
		});
	});

	it("Rider can not offer to deliver an order if invoked from an address that is not the owner of the rider smart contract", async function(){
		await catchRevert(riderInstance.methods.offerDelivery(orderAddress).send({from:theAccounts[6],gas:3000000}));
	});

	it("Rider Can not signal order picked up if they have not yet offered to deliver the order", async function(){
		await catchRevert(riderInstance.methods.pickupCargo(orderAddress).send({from:theAccounts[9],gas:3000000}));
	});

	it("Rider Can not offer to deliver the order if they dont also send a sufficient deposit", async function(){
		await catchRevert(riderInstance.methods.offerDelivery(orderAddress).send({from:theAccounts[7],gas:3000000,value:20}));
	});

	it("Rider can offer to deliver the Order when invoked from the owners address and sent with a sufficient deposit of ethereum", function(){
		return riderInstance.methods.offerDelivery(orderAddress).send({from:theAccounts[7],gas:3000000,value:2400}).then(function(){
			return riderInstance.methods.totalOrders().call();
		}).then(function(totalOrders){
			assert.equal(totalOrders,1);
			return orderInstance.methods.riderStatus().call();
		}).then(function(status){
			assert.equal(status,1);
		});
	});


	it("Restaurant Can not signal prepairing if invoked from an address that is not the owner of the restaurant smart contract", async function(){
		await catchRevert(restaurantInstance.methods.setStatusPrepairing(orderAddress).send({from:theAccounts[9],gas:3000000}));
	});

	it("Restaurant Can not signal order picked up by rider if invoked from an address that is not the owner of the restaurant smart contract", async function(){
		await catchRevert(restaurantInstance.methods.handOverCargo(orderAddress).send({from:theAccounts[9],gas:3000000}));
	});
	
	it("Restaurant can signal prepairing if invoked from the owners account",function(){
		return restaurantInstance.methods.setStatusPrepairing(orderAddress).send({from:theAccounts[2],gas:3000000}).then(function(){
			return orderInstance.methods.restaurantStatus().call();
		}).then(function(restaurantStatus){
			assert.equal(restaurantStatus,1);
		});
	});
	
	it("Restaurant can signal order picked up by rider if invoked from the owners account",function(){
		return restaurantInstance.methods.handOverCargo(orderAddress).send({from:theAccounts[2],gas:3000000}).then(function(){
			return orderInstance.methods.restaurantStatus().call();
		}).then(function(restaurantStatus){
			assert.equal(restaurantStatus,2);
		});
	});



	it("Rider Can not signal order picked up if invoked from an address that is not the owner of the rider smart contract", async function(){
		await catchRevert(riderInstance.methods.pickupCargo(orderAddress).send({from:theAccounts[9],gas:3000000}));
	});
	
	it("Rider can signal order picked up if invoked from the owners account",function(){
		return riderInstance.methods.pickupCargo(orderAddress).send({from:theAccounts[7],gas:3000000}).then(function(){
			return orderInstance.methods.riderStatus().call();
		}).then(function(restaurantStatus){
			assert.equal(restaurantStatus,2);
		});
	});

	it("Rider Can not signal order dropped off if invoked from an address that is not the owner of the rider smart contract", async function(){
		await catchRevert(riderInstance.methods.dropOffCargo(orderAddress).send({from:theAccounts[9],gas:3000000}));
	});
	
	it("Rider can signal order dropped off if invoked from the owners account",function(){
		return riderInstance.methods.dropOffCargo(orderAddress).send({from:theAccounts[7],gas:3000000}).then(function(){
			return orderInstance.methods.riderStatus().call();
		}).then(function(restaurantStatus){
			assert.equal(restaurantStatus,3);
		});
	});

	it("Customer Can not signal order dropped off if invoked from an address that is not the owner of the customer smart contract", async function(){
		await catchRevert(customerInstance.methods.signalDelivered(orderAddress).send({from:theAccounts[9],gas:3000000}));
	});

	it("Customer can signal order dropped off if invoked from the owners account",function(){
		return customerInstance.methods.signalDelivered(orderAddress).send({from:theAccounts[6],gas:300000000}).then(function(){
			return orderInstance.methods.customerStatus().call();
		}).then(function(customerStatus){
			assert.equal(customerStatus,2);
		});
	});
	


});

