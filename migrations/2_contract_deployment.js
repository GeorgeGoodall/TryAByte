var RestaurantFactory = artifacts.require("./RestaurantFactory.sol");
var Restaurant = artifacts.require("./Restaurant.sol");
var Order = artifacts.require("./Order.sol");
var lib = artifacts.require("./lib.sol");

module.exports = function(deployer) {
	deployer.deploy(lib);
	deployer.link(lib,RestaurantFactory);
	deployer.link(lib,Restaurant);
	deployer.link(lib,Order);
  	deployer.deploy(RestaurantFactory);
};
