pragma solidity ^0.5.0;

import './lib.sol';
import './RestaurantFactory.sol';

contract Order{
    
	uint public id;
	address public restaurant;
	address public restaurantFactoryAddress;
	address rider;
	address customer; // this should be encrypted

	bytes32 deliveryAddress;
    

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
		restaurant = msg.sender;
		customer = tx.origin; // this needs changing as is vunrability
		restaurantFactoryAddress = _restaurantFactoryAddress;
		
		// set items
		totalItems = 0;
		for(uint i = 0; i < itemNames.length; i++){
		    items[totalItems] = Item(lib.bytes32ToString(itemNames[i]),prices[i]);
		    totalItems++;
		}
		
		
	}

	function getItem(uint _id) public view returns(bytes32 itemName, uint itemCost){
		require(customer == msg.sender || restaurant == msg.sender || rider == msg.sender);
		return (lib.stringToBytes32(items[_id].itemName),items[_id].itemCost);
	}  

	function getDeliveryAddress() public view returns(bytes32 _deliveryAddress){
		require(customer == msg.sender || restaurant == msg.sender || rider == msg.sender);
		return deliveryAddress;
	}

}