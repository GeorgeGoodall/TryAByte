var fs = require("fs");
var configFileName = "AppConfig.json";
var configFile = require("../"+configFileName);


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

  			// update address of controller in config file
  			configFile.controllerAddress = instance.address;

  			await fs.writeFile(configFileName, JSON.stringify(configFile), function (err,res) {
			  if (err) console.log(err);
			  console.log(err);
			  console.log(res);
			});


	  		var restFactAddress;
	  		await deployer.deploy(RestaurantFactory,instance.address).then(async function(restaurantFactInstance){
				restFactAddress = restaurantFactInstance.address;
				await restaurantFactInstance.createRestaurant( "0x47656f726765277320546573742052657374617572616e74","0x46616b65204164647265737320537472656574",200,300,"0x30313233343536373839",{gas: 5000000}).then(async function(){
		  			console.log("Test restaurant Made");
		  			await restaurantFactInstance.restaurants0(0).then(async function(address){
		  				console.log("restaurant address: " + address);

				      	var restaurant = await new Restaurant(address)

				      	integerArray = [50,50,50,100,100,100,100,100,100,100,0,1,2,0,1,2,1,2,3,4,5,6,7,3,3,1,1,1,2,3,3];
				      	integerFlags = [0,3,0,7,0,3,0,0,0,3,7,3,0,0,0,1,3,1];
						stringArray = ["0x6368656573650000000000000000000000000000000000000000000000000000",  "0x6772617665790000000000000000000000000000000000000000000000000000",  "0x6375727279000000000000000000000000000000000000000000000000000000",  "0x636f640000000000000000000000000000000000000000000000000000000000",  "0x686164646f6b0000000000000000000000000000000000000000000000000000",  "0x73616c6d6f6e0000000000000000000000000000000000000000000000000000",  "0x736d616c6c000000000000000000000000000000000000000000000000000000",  "0x6d656469756d0000000000000000000000000000000000000000000000000000",  "0x6c61726765000000000000000000000000000000000000000000000000000000",  "0x726567756c617200000000000000000000000000000000000000000000000000",  "0x6669736800000000000000000000000000000000000000000000000000000000",  "0x6368697073000000000000000000000000000000000000000000000000000000",  "0x7065617300000000000000000000000000000000000000000000000000000000",  "0x6672657368000000000000000000000000000000000000000000000000000000",  "0x676f6c64656e0000000000000000000000000000000000000000000000000000",  "0x677265656e000000000000000000000000000000000000000000000000000000"];
						stringFlags = [3,7,3,3];

						let menuaddress = await restaurant.getMenuAddress();
						var menuInstance = await new Menu(menuaddress);

				      	await menuInstance.updateMenu(integerArray,integerFlags,stringArray, stringFlags,{gas: 6000000}).then(function(){
				      		console.log("added items to menu");
				      	})
				      	console.log("Test restaurant Menu updated");
				      });
			    });
			  return;
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
