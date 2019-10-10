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


	it("Initialises with 1 test restaurants", function(){
		return restaurantFactoryInstance.methods.restaurantCount().call().then(function(count){
			assert.equal(count,1);
		});
	});

	it("Can create a restaurant", function(){
		return restaurantFactoryInstance.methods.createRestaurant("Test Restaurant", "41 Test Address, Cardiff", 200 , 300, "0123456789").send({from: theAccounts[2], gas: 4000000}).then(function(){
			return restaurantFactoryInstance.methods.restaurantCount().call();
		}).then(function(count){
			assert.equal(count,2);
			return restaurantFactoryInstance.methods.restaurants0(1).call();
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

	it("Initialises with one Customers", function(){
		return customerFactoryInstance.methods.customerCount().call().then(function(count){
			assert.equal(count,1);
		});
	});

	it("Can make a customer", function(){
		return customerFactoryInstance.methods.makeCustomer().send({from: theAccounts[6], gas: 3000000}).then(function(){
			return customerFactoryInstance.methods.customerCount().call();
		}).then(function(count){
			assert.equal(count,2);
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

	it("Initialises with one Riders", function(){
		return riderFactoryInstance.methods.riderCount().call().then(function(count){
			assert.equal(count,1);
		});
	});

	it("Can make a rider", function(){
		return riderFactoryInstance.methods.makeRider().send({from: theAccounts[7], gas: 3000000}).then(function(){
			return riderFactoryInstance.methods.riderCount().call();
		}).then(function(count){
			assert.equal(count,2);
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
		return restaurantInstance.methods.menuAddItems([web3.utils.fromAscii("Fish"),web3.utils.fromAscii("Chips")],
														[web3.utils.fromAscii("Fish desc"),web3.utils.fromAscii("Chips desc")],
														[web3.utils.fromAscii("cod"),web3.utils.fromAscii("hadock"),"0x3c3e",web3.utils.fromAscii("small"),web3.utils.fromAscii("large")],
														[200,300,0,150,250]).send({from:theAccounts[2], gas:3000000}).then(function(){
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
		return restaurantInstance.methods.menuRemoveItems([3]).send({from:theAccounts[2], gas:3000000}).then(function(){
			return restaurantInstance.methods.getMenuLength().call().then(function(menuLength){
				assert.equal(menuLength,7);
				return restaurantInstance.methods.getMenuItem(3).call();
			}).then(function(item){
				assert.equal(web3.utils.hexToUtf8(item["itemname"]),"beans")
				assert.equal(item["cost"],500);
			});
		})
	})	
});

var customerKey;
describe("Contract: Customer", async function(){
	it("Can not make order from address that isnt a customer smart contract", async function() {
        await catchRevert(restaurantInstance.methods.makeOrder([0,1],200,web3.utils.fromAscii("Fake Address")).send({from:theAccounts[1],gas:3000000}));
    });
	it("Can not make order from address that doesn't own the customer smart contract", async function() {
        await catchRevert(customerInstance.methods.makeOrder(restaurantInstance.options.address,[0,1],2000000000000000,web3.utils.fromAscii("Fake Address")).send({from:theAccounts[9],gas:3000000,value:2000000000000500}));
    });
    it("Can not make order if the deliveryFee is too low", async function() {
        await catchRevert(customerInstance.methods.makeOrder(restaurantInstance.options.address,[0,1],2,web3.utils.fromAscii("Fake Address")).send({from:theAccounts[9],gas:3000000,value:2000000000000500}));
    });
    it("Can not make order if the order items aren't in the menu", async function() {
        await catchRevert(customerInstance.methods.makeOrder(restaurantInstance.options.address,[0,15],2000000000000000,web3.utils.fromAscii("Fake Address")).send({from:theAccounts[6],gas:3000000,value:2000000000000500}));
    });
    it("Can not make an order if not enough ether is sent", async function() {
        await catchRevert(customerInstance.methods.makeOrder(restaurantInstance.options.address,[0,1],2000000000000000,web3.utils.fromAscii("Fake Address")).send({from:theAccounts[6],gas:3000000,value:2000000000000000}));
    });

	it("Can make an order if enough ether is sent",async function(){
		var random = makeid(12);
		customerKey = random;
		var hash = await controllerInstance.getHash(web3.utils.fromAscii(random));
		return customerInstance.methods.makeOrder(restaurantInstance.options.address,[0,1],2000000000000000,hash).send({from:theAccounts[6],gas:3000000,value:2000000000000500}).then(function(){
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
			assert.equal(totalItems,2);
			return orderInstance.methods.riderStatus().call();
		}).then(function(status){
			assert.equal(status,0);
		});
	});
	it("has the correct balence (payed by the customer)", function(){
		return orderInstance.methods.getBalance().call().then(function(balance){
			assert.equal(balance,2000000000000500)
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
			assert.equal(_id,1);
			return riderInstance.methods.owner().call();
		}).then(function(owner){
			assert.equal(owner,theAccounts[7]);
			return riderInstance.methods.totalOrders().call();
		}).then(function(totalOrders){
			assert.equal(totalOrders,0);
		});
	});

	it("Rider can not offer to deliver an order if invoked from an address that is not the owner of the rider smart contract", async function(){
		var random = makeid(12);
		var hash = await controllerInstance.getHash(web3.utils.fromAscii(random));
		await catchRevert(riderInstance.methods.offerDelivery(orderAddress,hash).send({from:theAccounts[6],gas:3000000, value:500}));
	});

	it("Rider Can not signal order picked up if they have not yet offered to deliver the order", async function(){
		await catchRevert(riderInstance.methods.setStatus(orderAddress,2).send({from:theAccounts[9],gas:3000000}));
	});

	it("Rider Can not offer to deliver the order if they dont also send a sufficient deposit", async function(){
		var random = makeid(12);
		var hash = await controllerInstance.getHash(web3.utils.fromAscii(random));
		await catchRevert(riderInstance.methods.offerDelivery(orderAddress,hash).send({from:theAccounts[7],gas:3000000,value:20}));
	});


	var riderKey;
	it("Rider can offer to deliver the Order when invoked from the owners address and sent with a sufficient deposit of ethereum", async function(){
		var random = makeid(12);
		riderKey = random;
		var hash = await controllerInstance.getHash(web3.utils.fromAscii(random));
		return riderInstance.methods.offerDelivery(orderAddress,hash).send({from:theAccounts[7],gas:3000000,value:500}).then(function(){
			return riderInstance.methods.totalOrders().call();
		}).then(function(totalOrders){
			assert.equal(totalOrders,1);
			return orderInstance.methods.riderStatus().call();
		}).then(function(status){
			assert.equal(status,1);
		});
	});


	it("Restaurant Can not signal prepairing if invoked from an address that is not the owner of the restaurant smart contract", async function(){
		await catchRevert(restaurantInstance.methods.setStatus(orderAddress,1).send({from:theAccounts[9],gas:3000000}));
	});

	it("Restaurant Can not signal order picked up by rider if invoked from an address that is not the owner of the restaurant smart contract", async function(){
		await catchRevert(restaurantInstance.methods.setStatus(orderAddress,3).send({from:theAccounts[9],gas:3000000}));
	});
	
	it("Restaurant can signal prepairing if invoked from the owners account",function(){
		return restaurantInstance.methods.setStatus(orderAddress,1).send({from:theAccounts[2],gas:3000000}).then(function(){
			return orderInstance.methods.restaurantStatus().call();
		}).then(function(restaurantStatus){
			assert.equal(restaurantStatus,1);
		});
	});

	it("Restaurant can signal order ready for collection if invoked from the owners account",function(){
		return restaurantInstance.methods.setStatus(orderAddress,2).send({from:theAccounts[2],gas:3000000}).then(function(){
			return orderInstance.methods.restaurantStatus().call();
		}).then(function(restaurantStatus){
			assert.equal(restaurantStatus,2);
		});
	});
	
	it("Restaurant can signal order picked up by rider if invoked from the owners account",function(){
		return restaurantInstance.methods.setStatus(orderAddress,3).send({from:theAccounts[2],gas:3000000}).then(function(){
			return orderInstance.methods.restaurantStatus().call();
		}).then(function(restaurantStatus){
			assert.equal(restaurantStatus,3);
		});
	});


	it("Restaurant can detect if the riders pickup code is inccorrect",async function(){
		await catchRevert(orderInstance.methods.restaurantSubmitKey(web3.utils.fromAscii("aaaaaaaaaaaa")).send({from:theAccounts[2],gas:3000000}));
	});


	it("Restaurant is informed if they submit the riders correct key, and the order status is updated",function(){
		return orderInstance.methods.restaurantSubmitKey(web3.utils.fromAscii(riderKey)).send({from:theAccounts[2],gas:3000000}).then(function(result){
			return orderInstance.methods.riderStatus().call();
		}).then(function(riderStatus){
			assert.equal(riderStatus,2);
			return orderInstance.methods.restaurantStatus().call();
		}).then(function (restaurantStatus) {
			assert.equal(restaurantStatus,3);
		});
	});

	it("rider can detect if the customers code is inccorrect",async function(){
		await catchRevert(orderInstance.methods.riderSubmitKey(web3.utils.fromAscii("aaaaaaaaaaaa")).send({from:theAccounts[7],gas:3000000}));
	});


	it("rider is informed if they submit the customers correct key, and the order status is updated",function(){
		return orderInstance.methods.riderSubmitKey(web3.utils.fromAscii(customerKey)).send({from:theAccounts[7],gas:3000000}).then(function(result){
			return orderInstance.methods.riderStatus().call();
		}).then(function(riderStatus){
			assert.equal(riderStatus,3);
			return orderInstance.methods.customerStatus().call();
		}).then(function (customerStatus) {
			assert.equal(customerStatus,2);
		});
	});



});

function makeid(length) {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < length; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}

