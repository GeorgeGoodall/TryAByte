pragma solidity ^0.5.0;

import "./Restaurant.sol";
import "./Order.sol";
import "./Controller.sol";

contract Customer {
    
    address public owner;
    address customerFactory; // might not need this
    address public controller;

    uint public id;
    uint totalOrders;
    mapping(uint => address) orders;

    enum customerState{madeOrder, payed, hasCargo}    
    
    event OrderMadeEvent(
        address orderAddress,
        bytes32 riderKeyHash
    );
    
    constructor(uint _id, address _owner, address controllerAddress) public
    {
        id = _id;
        owner = _owner;
        controller = controllerAddress;

        totalOrders = 0;
        customerFactory = msg.sender;
    }
    
    function makeOrder(address payable restaurant, uint[] calldata itemIntegers, uint itemCount, uint deliveryFee, bytes32 riderKeyHash) external payable returns (address orderAddress){
        require(msg.sender == owner, "you dont own the customer smart contract");
        require(RestaurantFactory(Controller(controller).restaurantFactoryAddress()).restaurantExists(msg.sender), "the restaurant you are ordering from doesn't exist");

        uint price = Restaurant(restaurant).getOrderPrice(itemIntegers, itemCount);
        uint minimumDeliveryFee = Controller(controller).minimumDeliveryFee();

        require(deliveryFee >= minimumDeliveryFee, "deliveryFee must be greater than the minimum");
        require(msg.value >= price + deliveryFee,"sent ether is not enough to cover the order cost and delivery fee");

        uint[] memory integers = new uint[](3 + itemIntegers.length);
        //integers[0] = totalOrders; add id when passing through the restaurant cotract
        integers[1] = price;
        integers[2] = deliveryFee;
        for(uint i = 0; i < itemIntegers.length; i++){
            integers[i+3] = itemIntegers[i];    
        }
        
        address orderAddr = Restaurant(restaurant).makeOrder.value(price + deliveryFee)(integers, itemCount, riderKeyHash);
        msg.sender.transfer(msg.value - (price + deliveryFee)); // return excess payment
        orders[totalOrders] = orderAddr;
        
        totalOrders++;

        emit OrderMadeEvent(orderAddr, riderKeyHash);

        return orders[totalOrders - 1];
    }

    function signalDelivered(address orderAddress) public {
        require(msg.sender == owner, "sent from address that isnt the owner");
        Order(orderAddress).setOrderStatus(uint(customerState.hasCargo));
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
