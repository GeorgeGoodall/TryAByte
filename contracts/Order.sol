pragma solidity ^0.5.0;

import './RestaurantFactory.sol';
import './RiderFactory.sol';
import './Controller.sol';
import './Restaurant.sol';
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
	address payable public rider; 	  // this should be encrypted
	address payable customer; // this should be encrypted

	address controller;

	uint public orderTime;
	uint cost;
	uint public deliveryFee;
    
	bytes32 public keyHashRider;
	bool public keyRiderSet = false;

	bytes32 public keyHashRestaurant;
	bool public keyRestaurantSet = false;

	uint public totalItems;
	mapping(uint=>Item) public items; // this should be encrypted

	event statusUpdated();

	struct Item{
		bytes32 itemName;
		uint itemCost; // in wei (10^-18 Eth)
	}


	constructor(uint _id, bytes32[] memory itemNames, uint[] memory prices, uint _deliveryFee, address _controller, address payable _customer, bytes32 keyHash) public payable {
	    // require sent from a restaurant contract
	    require(RestaurantFactory(Controller(_controller).restaurantFactoryAddress()).restaurantExists(msg.sender),"attempted to make order from address that is not a restaurant");
	    require(itemNames.length == prices.length, "invalid matching of items to prices");
		
		// set contract infomation
		id = _id;
		restaurant = msg.sender;
		customer = _customer; // this needs changing as is vunrability
		orderTime = block.timestamp;

		controller = _controller;
		
		cost = 0;

		// set items
		totalItems = 0;
		for(uint i = 0; i < itemNames.length; i++){
		    items[totalItems] = Item(itemNames[i],prices[i]);
		    cost += prices[i];
		    totalItems++;
		}

		deliveryFee = _deliveryFee;

		require(msg.value >= cost + deliveryFee,"not enough ether sent to the order ");
		
		customerStatus = uint(customerState.payed);
		riderStatus = uint(riderState.unassigned);
		restaurantStatus = uint(restaurantState.acceptedOrder);	

		keyHashRider = keyHash;
		keyRiderSet = true;
	}

	function getItem(uint _id) public view returns(bytes32 itemName, uint itemCost){
		//require(customer == msg.sender || restaurant == msg.sender || rider == msg.sender); // removed as asking for contract address where as should be owner addresses
		return (items[_id].itemName,items[_id].itemCost);
	}  


	function riderOfferDelivery(bytes32 keyHash) public payable{
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

	function getHash(bytes32 data) public view returns(bytes32){
		return keccak256(abi.encodePacked(data));
	}
}