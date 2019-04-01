pragma solidity ^0.5.0;

import "./Restaurant.sol";

contract RestaurantFactory {

	address public owner;
	address controller;
	
	// ToDo: consider if thease need to be public
	mapping(uint => address) public restaurants0; 		// contract id to contract address
	mapping(address => address) public restaurants1;	// contract address to owner address
	mapping(address => address) public restaurants2; 	// owner address to contract address
	uint public restaurantCount;

	event LOG_NEWRestaurantContract(address indexed theNewRestaurant, address indexed theRestaurantCreater);

	constructor(address _owner) public {
		owner = _owner;
		controller = msg.sender;
		restaurantCount = 0;
	}

	// factory function creates a new restaurant
	function createRestaurant(string calldata name, string calldata _address, string calldata contactNumber) external returns(address newRestaurant){
		//ToDo: require deposit to create a restaurant
		require(restaurants2[msg.sender] == address(0x0));
		require(bytes(name).length >0);
		require(bytes(_address).length >0);
		require(bytes(contactNumber).length >0);


		Restaurant theNewRestaurant = new Restaurant(controller,msg.sender,restaurantCount, name, _address, contactNumber);
		restaurants0[restaurantCount] = address(theNewRestaurant);
		restaurantCount ++;
		restaurants1[address(theNewRestaurant)] = msg.sender;
		restaurants2[msg.sender] = address(theNewRestaurant);
		return address(theNewRestaurant);

	}
	
	function restaurantExists(address restaurant) public view returns(bool RestaurantExists){
	    if(restaurants1[restaurant] != address(0x0)){
	    	return true;
	    }else{
	    	return false;	
	    }
	}
}