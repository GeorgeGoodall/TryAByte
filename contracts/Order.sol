pragma solidity ^0.5.0;

import './lib.sol';
import './RestaurantFactory.sol';

contract Order{
    
	uint id;
	address parentRestaurant;
	address restaurantFactoryAddress;
	address customer; // this should be encrypted
    

	uint totalItems;
	mapping(uint=>Item) public items; 

	struct Item{
		string itemName;
		uint itemCost; // in wei (10^-18 Eth)
	}

	constructor(uint _id, bytes32[] memory itemNames, uint[] memory prices) public {
	    // require sent from a restaurant contract
	    require(RestaurantFactory(restaurantFactoryAddress).restaurantExists(msg.sender));
	    require(itemNames.length == prices.length);

		
		// set contract infomation
		id = _id;
		parentRestaurant = msg.sender;
		customer = tx.origin;
		
		// set items
		totalItems = 0;
		for(uint i = 0; i < itemNames.length; i++){
		    items[totalItems] = Item(lib.bytes32ToString(itemNames[i]),prices[i]);
		}
		
		
	}

}