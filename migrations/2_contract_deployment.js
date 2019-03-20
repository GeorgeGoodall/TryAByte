var Controller = artifacts.require("./Controller.sol");
var RestaurantFactory = artifacts.require("./RestaurantFactory.sol");
var Restaurant = artifacts.require("./Restaurant.sol");
var Order = artifacts.require("./Order.sol");
var RiderFactory = artifacts.require("./RiderFactory.sol");
var Rider = artifacts.require("./Rider.sol");
var CustomerFactory = artifacts.require("./CustomerFactory.sol");
var Customer = artifacts.require("./Customer.sol");
var lib = artifacts.require("./lib.sol");

module.exports = function(deployer) {
	deployer.deploy(lib);

	deployer.link(lib,RestaurantFactory);
	deployer.link(lib,Restaurant);
	deployer.link(lib,Order);
	deployer.link(lib,Controller);
	
  	deployer.deploy(Controller);
};
