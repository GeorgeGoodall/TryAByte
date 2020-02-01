var Controller = artifacts.require("./Controller.sol");
var RestaurantFactory = artifacts.require("./RestaurantFactory.sol");
var Restaurant = artifacts.require("./Restaurant.sol");
var Order = artifacts.require("./Order.sol");
var RiderFactory = artifacts.require("./RiderFactory.sol");
var Rider = artifacts.require("./Rider.sol");
var CustomerFactory = artifacts.require("./CustomerFactory.sol");
var Customer = artifacts.require("./Customer.sol");
var Menu = artifacts.require("./Menu.sol");
var test = artifacts.require("./Test.sol");

var b32Array = artifacts.require("./bytes32ArrayExtension.sol");
var uintArray = artifacts.require("./uintArrayExtension.sol");
var menuHelper = artifacts.require("./menuHelper.sol");

module.exports = async function(deployer) {	
	// for deploying everything
	await deployer.deploy(b32Array);
  	await deployer.deploy(uintArray);
  	deployer.link(b32Array,menuHelper);
	deployer.link(uintArray,menuHelper);
  	await deployer.deploy(menuHelper);
	deployer.link(b32Array,RestaurantFactory);
	deployer.link(uintArray,RestaurantFactory);
	deployer.link(menuHelper,RestaurantFactory);

	deployer.link(b32Array,Menu);
	deployer.link(uintArray,Menu);
	deployer.link(menuHelper,Menu);

  	await deployer.deploy(Controller).then(
  		async function(instance){
	  		var restFactAddress;
	  		await deployer.deploy(RestaurantFactory,instance.address).then(async function(restaurantFactInstance){
				restFactAddress = restaurantFactInstance.address;
				// await restaurantFactInstance.createRestaurant( "0x47656f726765277320546573742052657374617572616e74","0x46616b65204164647265737320537472656574",200,300,"0x30313233343536373839",{gas: 5000000}).then(async function(){
		  // 			console.log("Test restaurant Made");
		  // 		// 	await restaurantFactInstance.restaurants0(0).then(async function(address){
		  // 		// 		console.log("restaurant address: " + address);
				// 		// var menuStaging = [["0x46697368",2],["0x4368697073",1],["0x6265616e73",1],["0x70656173",1]];
				// 		// var itemNames = [];
				// 		// var itemPrices = [];
				// 		// for(var i = 0; i< menuStaging.length; i++){
				// 		// 	itemNames[i] = menuStaging[i][0];
				// 		// 	// change value from finney (10^-3 eth) to wei (10^-18 eth)
				// 		// 	itemPrices[i] = menuStaging[i][1] * Math.pow(10,15);
				// 		// }
				//   //     	var restaurant = await new Restaurant(address)
				//   //     	await restaurant.menuAddItems(itemNames,itemPrices);
				//   //     	console.log("Test restaurant Menu updated");
				//   //     });
			 //    });
			 //  return;
	  		});
	  		
	  		var custFactAddress;
	  		await deployer.deploy(CustomerFactory,instance.address).then(async function(custFactInstance){
	  			custFactAddress = custFactInstance.address;
	  		});
	  		var riderFactAddress;
	  		await deployer.deploy(RiderFactory,instance.address).then(async function(riderFactInstance){
	  			riderFactAddress = riderFactInstance.address;
	  		});

	  		await instance.setFactoryAddresses(restFactAddress, custFactAddress, riderFactAddress).then(function(){
	  			console.log("Factory addresses added to Controller smart contract");
	  		});
  		}
  	);

  	//await deployer.deploy(Menu, "0x7DcD6B2EBc56C69dD6ee17f7CdCa82149e13e4E3");
	//deployer.deploy(test);

};
