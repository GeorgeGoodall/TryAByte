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
		minimumDeliveryFee = 2000000000000000; // set min delivery fee to 0.02 eth
	}

	function setFactoryAddresses(address _restaurantFactoryAddress, address _customerFactoryAddress, address _riderFactoryAddress) public{
		require(msg.sender == owner);
		restaurantFactoryAddress = _restaurantFactoryAddress;
		customerFactoryAddress = _customerFactoryAddress;
		riderFactoryAddress = _riderFactoryAddress;
	}

	function updateMinDeliveryFee(uint newFee) public{
		require(msg.sender == owner,"you are not the owner");
		minimumDeliveryFee = newFee;
	}

	function getHash(bytes32 data) public pure returns(bytes32){
		return keccak256(abi.encodePacked(data));
	}
}