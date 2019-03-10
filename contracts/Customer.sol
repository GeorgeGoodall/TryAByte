pragma solidity ^0.5.0;

import "./Restaurant.sol";
import "./RestaurantFactory.sol";
import "./Order.sol";

contract Customer {
    
    address owner;
    address customerFactory;
    uint id;
    string name;
    string private contactNumber;
    uint totalOrders;
    mapping(uint => address) orders;
    
    
    
    constructor(uint _id, string memory _name, string memory _contactNumber, address _owner) public
    {
        id = _id;
        name = _name;
        contactNumber = _contactNumber;
        owner = _owner;
        customerFactory = msg.sender;
    }
    
    // this function will call the restaurant make order
    function makeOrder(address restaurant, bytes32[] calldata items) external returns (address orderAddress){
        require(msg.sender == owner);
        //require(RestaurantFactory(restaurantFactoryAddress).restaurantExists(msg.sender));
        require(Restaurant(restaurant).validOrder(items));
        // require 


        
        orders[totalOrders] = address(Restaurant(restaurant).makeOrder(items));
        totalOrders++;
        return orders[totalOrders];

    }

    function getContactNumber() public view returns(string memory _contactNumber){
        // require the sender of the message to be either the delivery worker or the the restaurant via the order class, the order status must be currenly active
        return contactNumber;
    }

    function getOrder(uint _id) external view returns(address orderAdderss){
        require(msg.sender == owner);
        return orders[_id];
    }  

    function getTotalOrders() external view returns(uint totalOrdersMade){
        require(msg.sender == owner);
        return totalOrders;
    }    
    
    
    
}
