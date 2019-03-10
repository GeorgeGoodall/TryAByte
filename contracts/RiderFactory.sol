pragma solidity ^0.5.0;

import "./Rider.sol";

contract RiderFactory {
    address public owner;
    address public controller;
    
    uint public riderCount;
    mapping(uint => Rider) riders;
    
    constructor(address _owner) public
    {
        controller = msg.sender;
        owner = _owner;
        riderCount = 0;
    }
    
    function makeRider(string calldata name, string calldata contactNumber) external returns(address customer){
        Rider newRider = new Rider(riderCount, name, contactNumber);
        riderCount++;
        return address(newRider);
    }
}