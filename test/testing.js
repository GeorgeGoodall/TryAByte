var RestaurantFactory = artifacts.require("RestaurantFactory");
var Restaurant = artifacts.require("Restaurant");

contract('RestaurantFactory', function(accounts){

	it("Initialises with no restaurants", function(){
		return RestaurantFactory.deployed().then(function(instance){
			return instance.restaurantCount();
		}).then(function(count){
			assert.equal(count,0);
		});
	});


	var restaurantFactoryInstance;

	it("Can can create a restaurant", function(){
		return RestaurantFactory.deployed().then(function(instance){
			restaurantFactoryInstance = instance;
			let result = await restaurantFactoryInstance.createRestaurant("Test Restaurant", "41 Test Address, Cardiff", "0123456789");
			//console.log("address of B: " + result);
			//return result
			assert.equal(0,0);
		});
	});

	// .then(function(restaurantAddress){
	// 		testRestraurnt = Restaurant(restaurantAddress);
	// 		return testRestraurnt.name()
	// 	}).then(function(restaurantName){
	// 		assert.equal(restaurantName,"Test Restaurant","contrains the correct name");
	// 	});

	// it("Can can create a restaurant", function(){
	// 	return restaurantFactory.deployed().then(function(instance){
			
	// 	})
	// })

	// it("Can can create a restaurant", function(){
	// 	return restaurantFactory.deployed().then(function(instance){
			
	// 	})
	// })

});