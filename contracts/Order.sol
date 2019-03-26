pragma solidity ^0.5.0;

import './lib.sol';
import './RestaurantFactory.sol';
import './RiderFactory.sol';
import './Controller.sol';

contract Order{

	enum riderState{unassigned, accepted, hasCargo, Delivered}
	enum restaurantState{acceptedOrder, preparingCargo, HandedOver}
	enum customerState{madeOrder, payed, hasCargo}
    
	uint public riderStatus;
	uint public restaurantStatus;
	uint public customerStatus;

	uint public id;
	address public restaurantFactoryAddress;
	

	address payable public restaurant;
	address payable rider; 	  // this should be encrypted
	address payable customer; // this should be encrypted

	address controller;

	bytes32 deliveryAddress;
	uint cost;
	uint public deliveryFee;
    


	uint public totalItems;
	mapping(uint=>Item) public items; // this should be encrypted

	struct Item{
		string itemName;
		uint itemCost; // in wei (10^-18 Eth)
	}

	constructor(uint _id, address _restaurantFactoryAddress, bytes32[] memory itemNames, uint[] memory prices, address _controller, address payable _customer) public {
	    // require sent from a restaurant contract
	    require(RestaurantFactory(_restaurantFactoryAddress).restaurantExists(msg.sender),"attempted to make order from address that is not a restaurant");
	    require(itemNames.length == prices.length);

		
		// set contract infomation
		id = _id;
		restaurant = msg.sender;
		customer = _customer; // this needs changing as is vunrability
		restaurantFactoryAddress = _restaurantFactoryAddress;

		controller = _controller;
		
		cost = 0;

		// set items
		totalItems = 0;
		for(uint i = 0; i < itemNames.length; i++){
		    items[totalItems] = Item(lib.bytes32ToString(itemNames[i]),prices[i]);
		    cost += prices[i];
		    totalItems++;
		}

		deliveryFee = 200;

		riderStatus = uint(riderState.unassigned);
		customerStatus = uint(customerState.madeOrder);
		restaurantStatus = uint(restaurantState.acceptedOrder);	
	}

	function customerPay() public payable{
		require(msg.sender == customer, "only the customer can pay for this order");
		require(msg.value >= cost + deliveryFee, lib.strConcat("not enough ether sent to the order, needed: ",lib.uint2str(cost + deliveryFee)));
		customerStatus = uint(customerState.payed);
	}

	function getItem(uint _id) public view returns(bytes32 itemName, uint itemCost){
		require(customer == msg.sender || restaurant == msg.sender || rider == msg.sender);
		return (lib.stringToBytes32(items[_id].itemName),items[_id].itemCost);
	}  

	function getDeliveryAddress() public view returns(bytes32 _deliveryAddress){
		require(customer == msg.sender || restaurant == msg.sender || rider == msg.sender);
		return deliveryAddress;
	}

	function riderOfferDelivery() public payable{
		require(RiderFactory(Controller(controller).riderFactoryAddress()).riderExists(msg.sender));
		require(msg.value >= cost);
		
		riderStatus = uint(riderState.accepted);
		rider = msg.sender;
	}

	function setOrderStatus(uint status) public payable{
		require(msg.sender == rider || msg.sender == restaurant || msg.sender == customer, "You dont have permission to see this order, did you get the order address wrong?");

		if(msg.sender == rider)
			riderStatus = status;
		else if(msg.sender == restaurant)
			restaurantStatus = status;
		else if(msg.sender == customer)
			customerStatus = status;
		else
			revert("Error: unauthoriserd address accessing setOrderStatus");

		// if both rider and customer state the customer has the food
		if(riderStatus == 3 && customerStatus == 2){
			
			address(rider).transfer(100);
			// restaurant.transfer(100);
		}
	}

	function getBalance() public view returns(uint){
		return address(this).balance;
	}

	function getCost() public view returns(uint){
		//require that this is one of the agents involved
		return cost;
	}
}