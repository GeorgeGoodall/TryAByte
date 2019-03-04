pragma solidity ^0.5.0;

import "./Restaurant.sol";
import "./lib.sol";

contract RestaurantFactory {
	using lib for string;

	address public owner;
	address controller;
	
	mapping(uint => address) restaurants;
	uint public restaurantCount = 0;

	event LOG_NEWRestaurantContract(address indexed theNewRestaurant, address indexed theRestaurantCreater);

	constructor() public {
		owner = tx.origin;
		controller = msg.sender;
	}

	// factory function creates a new restaurant
	function createRestaurant(string calldata name, string calldata _address, string calldata contactNumber) external returns(address newRestaurant){
		//require deposit to create a restaurant
		restaurantCount ++;
		Restaurant theNewRestaurant = new Restaurant(restaurantCount, name, _address, contactNumber);
		restaurants[restaurantCount] = address(theNewRestaurant);
		return restaurants[restaurantCount];
	}
	
	function restaurantExists(address restaurant) public view returns(bool RestaurantExists){
	    for(uint i = 0; i < restaurantCount;i++){
	        if(restaurants[i+1] == restaurant){
	            return true;
	        }
	    }
	    return false;
	}
}