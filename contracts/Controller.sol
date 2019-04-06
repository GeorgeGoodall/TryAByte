pragma solidity ^0.5.0;

import "./RestaurantFactory.sol";
import "./CustomerFactory.sol";
import "./RiderFactory.sol";


contract Controller {

	address public owner;
	address public restaurantFactoryAddress;
	address public customerFactoryAddress;
	address public riderFactoryAddress;

	uint public minimumDeliveryFee;

	constructor() public{
		owner = msg.sender;
		restaurantFactoryAddress = address(new RestaurantFactory(owner));
		customerFactoryAddress = address(new CustomerFactory(owner));
		riderFactoryAddress = address(new RiderFactory(owner));

		minimumDeliveryFee = 2000000000000000; // set min delivery fee to 0.02 eth
	}

	function updateMinDeliveryFee(uint newFee) public{
		require(msg.sender == owner,"you are not the owner");
		minimumDeliveryFee = newFee;
	}
}