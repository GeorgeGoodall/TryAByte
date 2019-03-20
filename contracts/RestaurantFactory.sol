pragma solidity ^0.5.0;

import "./Restaurant.sol";
import "./lib.sol";

contract RestaurantFactory {
	using lib for string;

	address public owner;
	address controller;
	
	mapping(uint => address) public restaurants;
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
		require(bytes(name).length >0);
		require(bytes(_address).length >0);
		require(bytes(contactNumber).length >0);


		Restaurant theNewRestaurant = new Restaurant(controller,msg.sender,restaurantCount, name, _address, contactNumber);
		restaurants[restaurantCount] = address(theNewRestaurant);
		restaurantCount ++;
		return restaurants[restaurantCount];

	}
	
	function restaurantExists(address restaurant) public view returns(bool RestaurantExists){
	    for(uint i = 0; i < restaurantCount;i++){
	        if(restaurants[i] == restaurant){
	            return true;
	        }
	    }
	    return false;
	}
}