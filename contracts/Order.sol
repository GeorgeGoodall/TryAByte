pragma solidity ^0.5.0;

import './RestaurantFactory.sol';
import './RiderFactory.sol';
import './Controller.sol';
import './Restaurant.sol';
import './Menu.sol';
import './Rider.sol';

contract Order{

	enum riderState{unassigned, accepted, hasCargo, Delivered}
	enum restaurantState{acceptedOrder, preparingCargo, readyForCollection, HandedOver}
	enum customerState{madeOrder, payed, hasCargo}
    
	uint public riderStatus;
	uint public restaurantStatus;
	uint public customerStatus;

	uint public id;
	
	bool public restaurantPaid = false;
	bool public riderPaid = false;

	address payable public restaurant;
	address payable public rider; 	 
	address payable public customer; 

	address controller;

	uint public orderTime;
	uint cost;
	uint public deliveryFee;
    
	bytes32 public keyHashRider;
	bool public keyRiderSet = false;

	bytes32 public keyHashRestaurant;
	bool public keyRestaurantSet = false;

	uint public totalItems;

	struct Item {
		uint itemId;
		uint optionId;
		uint[] extraIds;
	}

	mapping(uint=>Item) public items;

	event statusUpdated();

	//uint _id, uint price, uint _deliveryFee, uint[] memory itemIds, uint[] memory optionIds, uint[] memory extraFlags, uint[] memory extraIds
	constructor(uint[] memory integers, uint _itemCount, address _controller, address payable _customer, bytes32 keyHash) public payable {
	    // require sent from a restaurant contract
	    require(RestaurantFactory(Controller(_controller).restaurantFactoryAddress()).restaurantExists(msg.sender),"attempted to make order from address that is not a restaurant");

	    // deconstruct integer array
	    deliveryFee = integers[1];
	    cost = integers[0];

		require(msg.value >= cost + deliveryFee,"not enough ether sent to the order");

	    uint extraIndex = 0;
	    totalItems = _itemCount;
	    Item memory currentItem;
	    for(uint i = 0; i < _itemCount; i++){
	    	currentItem = Item(integers[i+2],integers[i+_itemCount+2], new uint[](integers[i+(_itemCount*2)+2]));
	    	for(uint j = 0; j < integers[i+(_itemCount*2)+2]; j++){
	    		currentItem.extraIds[j] = integers[extraIndex+(_itemCount*3)+2];
	    		extraIndex++;
	    	}
	    	items[i] = currentItem;	
	    }
		
		// set contract infomation
		restaurant = msg.sender;
		customer = _customer;
		orderTime = block.timestamp;
		controller = _controller;
		
		customerStatus = uint(customerState.payed);
		riderStatus = uint(riderState.unassigned);
		restaurantStatus = uint(restaurantState.acceptedOrder);	

		keyHashRider = keyHash;
		keyRiderSet = true;
	}

	function getItemRaw(uint _id) public view returns(uint, uint, uint[] memory){
		require(customer == msg.sender || restaurant == msg.sender || rider == msg.sender, "you dont have permission to view this order"); // removed as asking for contract address where as should be owner addresses
		return (items[_id].itemId,items[_id].optionId,items[_id].extraIds);
	}


	function riderOfferDelivery(bytes32 keyHash) public payable{
		require(riderStatus == uint(riderState.unassigned),"this order allready has delivery organised");
		require(RiderFactory(Controller(controller).riderFactoryAddress()).riderExists(msg.sender), "must be called via a rider smart contract");
		require(msg.value >= cost, "the deposit sent is not enough");
		
		riderStatus = uint(riderState.accepted);
		rider = msg.sender;

		keyHashRestaurant = keyHash;
		keyRestaurantSet = true;
		
		emit statusUpdated();
	}

	function setOrderStatus(uint status) public payable{
		require(msg.sender == restaurant, "You dont have permission to see this order, did you get the order address wrong?");
		require(status > restaurantStatus, "status cannot be backtracked");
		require(status <= 3 && status > 0, "given Status not valid");
		restaurantStatus = status;
		emit statusUpdated();
	}

	function payRider() private{
		Rider(rider).pay.value(cost+deliveryFee)();
		riderPaid = true;
		riderStatus = 3;
		emit statusUpdated();
	}

	function payRestaurant() private{
		Restaurant(restaurant).pay.value(cost)();
		restaurantPaid = true;
		restaurantStatus = 4;
		emit statusUpdated();
	}

	function getBalance() public view returns(uint){
		return address(this).balance;
	}

	function getCost() public view returns(uint){
		//require that this is one of the agents involved
		return cost;
	}

	function restaurantSubmitKey(bytes32 key) public returns (bool){
		require(keyRestaurantSet == true, "No key has been set");
		require(getHash(key) == keyHashRestaurant, "Incorrect Key");
		payRestaurant();
		restaurantStatus = uint(restaurantState.HandedOver);
		riderStatus = uint(riderState.hasCargo);
		emit statusUpdated();
		return true;
	}

	function riderSubmitKey(bytes32 key) public returns (bool){
		require(keyRiderSet == true, "No key has been set");
		require(getHash(key) == keyHashRider, "Incorrect Key");
		payRider();
		riderStatus = uint(riderState.Delivered);
		customerStatus = uint(customerState.hasCargo);
		emit statusUpdated();
		return true;
	}

	function getHash(bytes32 data) public pure returns(bytes32){
		return keccak256(abi.encodePacked(data));
	}
}