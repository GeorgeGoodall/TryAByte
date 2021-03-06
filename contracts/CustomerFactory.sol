pragma solidity ^0.5.0;

import "./Customer.sol";

contract CustomerFactory {
    address public owner;
    address public controller;

    uint public customerCount;
    mapping(uint => address) public customers0; // id to customerContractAddress
    mapping(address => address) private customers1; // customerContractAddress to customersOwnAddress
    mapping(address => address) public customers2; // customersOwnAddress to customerContractAddress
    
    event CustomerMade(address indexed customerAddress, address indexed createrAddress);

    constructor(address _controller) public
    {
        controller = _controller;
        owner = msg.sender;
        customerCount = 0;
    }
    
    function makeCustomer() external returns(address customer){
        require(customers2[msg.sender] == address(0x0), "your address already has a customer associated with it");
        Customer newCustomer = new Customer(customerCount, msg.sender, controller);
        customers1[address(newCustomer)] = msg.sender;
        customers2[msg.sender] = address(newCustomer);
        customers0[customerCount] = address(newCustomer);
        customerCount++;

        emit CustomerMade(address(newCustomer),msg.sender);

        return address(newCustomer);
    }
    
    function customerExists(address customer) public view returns(bool CustomerExists){
	    if(customers1[customer] != address(0x0))
            return true;
        else
            return false;
	}

    function reset() public {
        require(msg.sender == controller);
        for(uint i = 0; i < customerCount; i++){
            address currentContract = customers0[i];
            address currentOwnAddress = customers1[currentContract];

            delete customers0[i];
            delete customers1[currentContract];
            delete customers2[currentOwnAddress];

            customerCount = 0;
        }
    }
}