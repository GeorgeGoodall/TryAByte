pragma solidity ^0.5.0;

import "./Customer.sol";

contract CustomerFactory {
    address public owner;
    address public controller;

    uint public customerCount;
    mapping(uint => address) public customers0; // id to customerContractAddress
    mapping(address => address) private customers1; // customerContractAddress to customersOwnAddress
    mapping(address => address) public customers2; // customersOwnAddress to customerContractAddress
    
    constructor(address _owner) public
    {
        controller = msg.sender;
        owner = _owner;
        customerCount = 0;
    }
    
    // todo change name to createCustomer()
    function makeCustomer(string calldata name, string calldata contactNumber) external returns(address customer){ 
        Customer newCustomer = new Customer(customerCount, name, contactNumber, msg.sender);
        customers1[address(newCustomer)] = msg.sender;
        customers2[msg.sender] = address(newCustomer);
        customers0[customerCount] = address(newCustomer);
        customerCount++;
        return address(newCustomer);
    }
    
    function customerExists(address customer) public view returns(bool CustomerExists){
	    if(customers1[customer] != address(0x0))
            return true;
        else
            return false;
	}
}