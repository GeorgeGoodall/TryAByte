pragma solidity ^0.5.0;

import './lib.sol';
import './RestaurantFactory.sol';
import './RiderFactory.sol';
import './Controller.sol';

contract Order{

	enum riderState{unassigned, accepted, hasCargo, Delivered}
	enum restaurantState{acceptedOrder, preparingCargo, HandedOver}
	enum customerState{madeOrder,hasCargo}
    
	uint public riderStatus;
	uint public restaurantStatus;
	uint public customerStatus;

	uint public id;
	address public restaurantFactoryAddress;
	

	address public restaurant;
	address rider; 	  // this should be encrypted
	address customer; // this should be encrypted

	address controller;

	bytes32 deliveryAddress;
    


	uint public totalItems;
	mapping(uint=>Item) public items; // this should be encrypted

	struct Item{
		string itemName;
		uint itemCost; // in wei (10^-18 Eth)
	}

	constructor(uint _id, address _restaurantFactoryAddress, bytes32[] memory itemNames, uint[] memory prices, address _controller, address _customer) public {
	    // require sent from a restaurant contract
	    require(RestaurantFactory(_restaurantFactoryAddress).restaurantExists(msg.sender));
	    require(itemNames.length == prices.length);

		
		// set contract infomation
		id = _id;
		restaurant = msg.sender;
		customer = _customer; // this needs changing as is vunrability
		restaurantFactoryAddress = _restaurantFactoryAddress;

		controller = _controller;
		
		// set items
		totalItems = 0;
		for(uint i = 0; i < itemNames.length; i++){
		    items[totalItems] = Item(lib.bytes32ToString(itemNames[i]),prices[i]);
		    totalItems++;
		}

		riderStatus = uint(riderState.unassigned);
		customerStatus = uint(customerState.madeOrder);
		restaurantStatus = uint(restaurantState.acceptedOrder);
		
		
	}

	function getItem(uint _id) public view returns(bytes32 itemName, uint itemCost){
		require(customer == msg.sender || restaurant == msg.sender || rider == msg.sender);
		return (lib.stringToBytes32(items[_id].itemName),items[_id].itemCost);
	}  

	function getDeliveryAddress() public view returns(bytes32 _deliveryAddress){
		require(customer == msg.sender || restaurant == msg.sender || rider == msg.sender);
		return deliveryAddress;
	}

	function riderOfferDelivery() public {
		require(RiderFactory(Controller(controller).riderFactoryAddress()).riderExists(msg.sender));
		riderStatus = uint(riderState.accepted);
		rider = msg.sender;
	}

	function setOrderStatus(uint status) public {
		require(msg.sender == rider || msg.sender == restaurant || msg.sender == customer, "You dont have permission to see this order, did you get the order address wrong?");

		if(msg.sender == rider)
			riderStatus = status;
		else if(msg.sender == restaurant)
			restaurantStatus = status;
		else if(msg.sender == customer)
			customerStatus = status;
		else
			revert("Error: unauthoriserd address accessing setOrderStatus");
	}
}