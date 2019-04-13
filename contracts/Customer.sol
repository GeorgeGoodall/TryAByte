pragma solidity ^0.5.0;

import "./Restaurant.sol";
//import "./RestaurantFactory.sol";
import "./Order.sol";
import "./Controller.sol";

contract Customer {
    
    address public owner;
    address customerFactory; // might not need this
    address public controller;

    uint public id;
    string name;
    string private contactNumber;
    uint totalOrders;
    mapping(uint => address) orders;

    enum customerState{madeOrder, payed, hasCargo}    
    
    event OrderMadeEvent();
    
    constructor(uint _id, string memory _name, string memory _contactNumber, address _owner, address controllerAddress) public
    {
        id = _id;
        name = _name;
        contactNumber = _contactNumber;
        owner = _owner;
        controller = controllerAddress;

        totalOrders = 0;
        customerFactory = msg.sender;
    }
    
    // this function will call the restaurant make order
    // todo change to reference restaurantID from restFact to reduce cost??
    function makeOrder(address payable restaurant, uint[] calldata items, uint deliveryFee, bytes calldata delivreyAddress,bytes32 riderKeyHash) external payable returns (address orderAddress){
        require(msg.sender == owner, "you dont own the customer smart contract");
        //require(RestaurantFactory(restaurantFactoryAddress).restaurantExists(msg.sender));
        uint price = Restaurant(restaurant).getOrderPrice(items);
        uint minimumDeliveryFee = Controller(controller).minimumDeliveryFee();
        require(deliveryFee >= minimumDeliveryFee, "deliveryFee must be greater than the minimum");
        require(msg.value >= price + deliveryFee,"sent ether is not enough to cover the order cost and delivery fee");
        
        address orderAddr = Restaurant(restaurant).makeOrder.value(price + deliveryFee)(items, deliveryFee, delivreyAddress, riderKeyHash);
        msg.sender.transfer(msg.value - (price + deliveryFee)); // return excess payment
        orders[totalOrders] = orderAddr;
        
        totalOrders++;

        emit OrderMadeEvent();

        return orders[totalOrders - 1];
    }

    function signalDelivered(address orderAddress) public {
        require(msg.sender == owner, "sent from address that isnt the owner");
        Order(orderAddress).setOrderStatus(uint(customerState.hasCargo));
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
