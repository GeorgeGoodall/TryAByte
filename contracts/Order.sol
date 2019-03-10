pragma solidity ^0.5.0;

import './lib.sol';
import './RestaurantFactory.sol';

contract Order{
    
	uint public id;
	address public parentRestaurant;
	address public restaurantFactoryAddress;
	address customer; // this should be encrypted
    

	uint public totalItems;
	mapping(uint=>Item) public items; // this should be encrypted

	struct Item{
		string itemName;
		uint itemCost; // in wei (10^-18 Eth)
	}

	constructor(uint _id, address _restaurantFactoryAddress, bytes32[] memory itemNames, uint[] memory prices) public {
	    // require sent from a restaurant contract
	    require(RestaurantFactory(_restaurantFactoryAddress).restaurantExists(msg.sender));
	    require(itemNames.length == prices.length);

		
		// set contract infomation
		id = _id;
		parentRestaurant = msg.sender;
		customer = tx.origin;
		restaurantFactoryAddress = _restaurantFactoryAddress;
		
		// set items
		totalItems = 0;
		for(uint i = 0; i < itemNames.length; i++){
		    items[totalItems] = Item(lib.bytes32ToString(itemNames[i]),prices[i]);
		    totalItems++;
		}
		
		
	}

}