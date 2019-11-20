var Controller = artifacts.require("./Controller.sol");
var RestaurantFactory = artifacts.require("./RestaurantFactory.sol");
var Restaurant = artifacts.require("./Restaurant.sol");
var Order = artifacts.require("./Order.sol");
var RiderFactory = artifacts.require("./RiderFactory.sol");
var Rider = artifacts.require("./Rider.sol");
var CustomerFactory = artifacts.require("./CustomerFactory.sol");
var Customer = artifacts.require("./Customer.sol");
var test = artifacts.require("./Test.sol");

module.exports = function(deployer) {
	//deployer.deploy(lib);

	//deployer.link(lib,Restaurant);
	//deployer.link(lib,Order);
	//deployer.link(lib,Controller);
	

	// deployer.deploy(RestaurantFactory,"0x7DcD6B2EBc56C69dD6ee17f7CdCa82149e13e4E3");
	//deployer.deploy(RiderFactory,"0x7DcD6B2EBc56C69dD6ee17f7CdCa82149e13e4E3");
	//deployer.deploy(CustomerFactory,"0x7DcD6B2EBc56C69dD6ee17f7CdCa82149e13e4E3");
  	

	// for deploying everything
  	deployer.deploy(Controller).then(
  		async function(instance){
	  		var restFactAddress;
	  		await deployer.deploy(RestaurantFactory,instance.address).then(async function(restaurantFactInstance){
				restFactAddress = restaurantFactInstance.address;
				await restaurantFactInstance.createRestaurant( "0x47656f726765277320546573742052657374617572616e74","0x46616b65204164647265737320537472656574",200,300,"0x30313233343536373839",{gas: 5000000}).then(async function(){
		  			console.log("Test restaurant Made");
		  		// 	await restaurantFactInstance.restaurants0(0).then(async function(address){
		  		// 		console.log("restaurant address: " + address);
						// var menuStaging = [["0x46697368",2],["0x4368697073",1],["0x6265616e73",1],["0x70656173",1]];
						// var itemNames = [];
						// var itemPrices = [];
						// for(var i = 0; i< menuStaging.length; i++){
						// 	itemNames[i] = menuStaging[i][0];
						// 	// change value from finney (10^-3 eth) to wei (10^-18 eth)
						// 	itemPrices[i] = menuStaging[i][1] * Math.pow(10,15);
						// }
				  //     	var restaurant = await new Restaurant(address)
				  //     	await restaurant.menuAddItems(itemNames,itemPrices);
				  //     	console.log("Test restaurant Menu updated");
				  //     });
			    });
			  return;
	  		});
	  		
	  		var custFactAddress;
	  		await deployer.deploy(CustomerFactory,instance.address).then(async function(custFactInstance){
	  			custFactAddress = custFactInstance.address;
	  			await custFactInstance.makeCustomer({gas: 4000000}).then(function(){
	      			console.log("Test customer Made");
	    		})
	  		});
	  		var riderFactAddress;
	  		await deployer.deploy(RiderFactory,instance.address).then(async function(riderFactInstance){
	  			riderFactAddress = riderFactInstance.address;
	  			await riderFactInstance.makeRider({gas: 4000000}).then(function(){
	  				console.log("Test rider made");
	  			})
	  		});

	  		await instance.setFactoryAddresses(restFactAddress, custFactAddress, riderFactAddress).then(function(){
	  			console.log("Factory addresses added to Controller smart contract");
	  		});
  		}
  	);







	deployer.deploy(test);

};
