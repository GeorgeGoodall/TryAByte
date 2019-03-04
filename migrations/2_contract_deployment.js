var RestaurantFactory1 = artifacts.require("./RestaurantFactory.sol");
var Restaurant = artifacts.require("./Restaurant.sol");
var Order = artifacts.require("./Order.sol");
var lib = artifacts.require("./lib.sol");

module.exports = function(deployer) {
	deployer.deploy(lib);
	deployer.link(lib,RestaurantFactory1);
  	deployer.deploy(RestaurantFactory1,  {gas: 3000000});
};
