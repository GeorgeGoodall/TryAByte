pragma solidity ^0.5.0;

import "./Order.sol";

// this should be done with inheritance for riders and customers
contract Rider {
    
    address public owner;
    address controller; // do you even need this?

    uint public id;
    string name;
    string private contactNumber;

    uint public totalOrders;
    mapping(uint => address) orders;

    enum riderState{unassigned, accepted, hasCargo, Delivered}
    
    constructor(uint _id, string memory _name, string memory _contactNumber, address _owner, address _controller) public
    {
        id = _id;
        name = _name;
        contactNumber = _contactNumber;
        owner = _owner; // this needs changing to the origin of the call
        controller = _controller;
        totalOrders = 0;
    }
    
    // this function should be payable
    function offerDelivery(address orderAddress) public {
        require(msg.sender == owner);
        Order(orderAddress).riderOfferDelivery();

        orders[totalOrders] = orderAddress;
        totalOrders++;
    }

    function pickupCargo(address orderAddress) public {
        require(msg.sender == owner);
        Order(orderAddress).setOrderStatus(uint(riderState.hasCargo));
    }

    function dropOffCargo(address orderAddress) public {
        require(msg.sender == owner);
        Order(orderAddress).setOrderStatus(uint(riderState.Delivered));
    }

    function getContactNumber() public view returns(string memory _contactNumber){
        // require the sender of the message to be either the delivery worker or the the restaurant
        return contactNumber;
    }


    
    
    
    
}