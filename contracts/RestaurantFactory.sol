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

	event RestaurantMade(address indexed restaurantAddress, address indexed createrAddress);
	
	constructor(address _controller) public {
		owner = msg.sender;
		controller = _controller;
		restaurantCount = 0;
	}

	// factory function creates a new restaurant
	function createRestaurant(string calldata name, string calldata _address, string calldata contactNumber) external returns(address newRestaurant){
		//ToDo: require deposit to create a restaurant
		require(restaurants2[msg.sender] == address(0x0), "your address already has a restaurant associated with it");
		require(bytes(name).length >0, "name cannot be empty");
		require(bytes(_address).length >0, "address can not be empty");
		require(bytes(contactNumber).length >0, "contact number can not be empty");


		Restaurant theNewRestaurant = new Restaurant(controller,msg.sender,restaurantCount, name, _address, contactNumber);
		restaurants0[restaurantCount] = address(theNewRestaurant);
		restaurantCount ++;
		restaurants1[address(theNewRestaurant)] = msg.sender;
		restaurants2[msg.sender] = address(theNewRestaurant);

		emit RestaurantMade(address(theNewRestaurant),msg.sender);

		return address(theNewRestaurant);

	}
	
	function restaurantExists(address restaurant) public view returns(bool RestaurantExists){
	    if(restaurants1[restaurant] != address(0x0)){
	    	return true;
	    }else{
	    	return false;	
	    }
	}

    function reset() public {
        require(msg.sender == controller);
        for(uint i = 0; i < restaurantCount; i++){
            address currentContract = restaurants0[i];
            address currentOwnAddress = restaurants1[currentContract];

            delete restaurants0[i];
            delete restaurants1[currentContract];
            delete restaurants2[currentOwnAddress];

            restaurantCount = 0;
        }
    }
}