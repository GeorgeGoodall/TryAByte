var RestaurantFactory = artifacts.require("RestaurantFactory");
var Restaurant = artifacts.require("Restaurant");
var Order = artifacts.require("Order");

var restaurantFactoryInstance;
var restaurantInstance;
var orderInstance;

var theAccounts;

contract('RestaurantFactory', function(accounts){

	theAccounts = accounts;

	it("Initialises with no restaurants", function(){
		return RestaurantFactory.deployed().then(function(instance){
			restaurantFactoryInstance = instance;
			return instance.restaurantCount();
		}).then(function(count){
			assert.equal(count,0);
		});
	});

	it("Can create a restaurant", function(){
		restaurantFactoryInstance.createRestaurant("Test Restaurant", "41 Test Address, Cardiff", "0123456789",{from: theAccounts[2]});
		return restaurantFactoryInstance.restaurantCount().then(function(count){
			assert.equal(count,1,"restaurant count is now 1");
			return restaurantFactoryInstance.restaurants(1);
		}).then(function(restaurantAddress){
			return new web3.eth.Contract(Restaurant.abi,restaurantAddress);
		}).then(function(instance){
			restaurantInstance = instance;
			return restaurantInstance.methods.name().call();
		}).then(function(restaurantName){
			assert.equal(restaurantName,"Test Restaurant", "Able to access the restaurant name");
		});
	});
});


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

	it("Can make an order",function(){
		return restaurantInstance.methods.makeOrder([web3.utils.fromAscii("Fish"),web3.utils.fromAscii("Chips")]).send({from:theAccounts[1],gas:6000000}).then(function(){
			return restaurantInstance.methods.totalOrders().call().then(function(totalOrders){
				assert.equal(totalOrders,1);
			});
		});
	});

	
});

describe("Contract: Order", function(){
	it("can access order Deetails", function(){
		return restaurantInstance.methods.orders(1).call().then(function(orderAddress){
			return new web3.eth.Contract(Order.abi,orderAddress);
		}).then(function(instance){
			orderInstance = instance;
			return orderInstance.methods.id().call();
		}).then(function(id){
			assert.equal(id,1);
			return orderInstance.methods.totalItems().call();
		}).then(function(totalItems){
			assert.equal(totalItems,2);
		});
	});
});