pragma solidity ^0.5.0;

import "./RestaurantFactory.sol";
import "./CustomerFactory.sol";
import "./RiderFactory.sol";


contract Controller {

	address public owner;
	address public restaurantFactoryAddress;
	address public customerFactoryAddress;
	address public riderFactoryAddress;

	constructor() public{
		owner = msg.sender;
		restaurantFactoryAddress = address(new RestaurantFactory(owner));
		customerFactoryAddress = address(new CustomerFactory(owner));
		riderFactoryAddress = address(new RiderFactory(owner));
	}
}