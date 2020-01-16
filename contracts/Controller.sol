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

	// removes all user accounts and orders.
	function resetApplication() public { 
		require(msg.sender == owner);
		RestaurantFactory(restaurantFactoryAddress).reset();
		CustomerFactory(customerFactoryAddress).reset();
		RiderFactory(riderFactoryAddress).reset();
	}

	function getPartitionOfIntArray(uint startIndex,uint size,uint[] memory intArray) public pure returns (uint[] memory){
	    uint[] memory toReturn = new uint[](size);
	    for(uint i = 0; i < (size); i++){
	      toReturn[i] = intArray[startIndex+i];
	    }
	    return toReturn;
	  }

  	function getPartitionOfBytesArray(uint startIndex,uint size, bytes32[] memory strArray) public pure returns (bytes32[] memory){
	    bytes32[] memory toReturn = new bytes32[](size);
	    for(uint i = 0; i < (size); i++){
	      toReturn[i] = strArray[startIndex+i];
	    }
	    return toReturn;
	}
}