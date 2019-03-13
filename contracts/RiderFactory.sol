pragma solidity ^0.5.0;

import "./Rider.sol";

contract RiderFactory {
    address public owner;
    address public controller;
    
    uint public riderCount;
    mapping(address => address) public riders1;
    mapping(address => address) public riders2;
    
    constructor(address _owner) public
    {
        controller = msg.sender;
        owner = _owner;
        riderCount = 0;
    }
    
    function makeRider(string calldata name, string calldata contactNumber) external returns(address customer){
        require(riders2[msg.sender] == address(0x0)); // the rider must not already be signed up
        Rider newRider = new Rider(riderCount, name, contactNumber, msg.sender, controller);
        riders1[address(newRider)] = msg.sender;
        riders2[msg.sender] = address(newRider);
        riderCount++;
        return address(newRider);
    }

    function riderExists(address rider) public view returns(bool exists){
        if(riders1[rider] != address(0x0))
            return true;
        else
            return false;
    }
}