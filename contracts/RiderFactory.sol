pragma solidity ^0.5.0;

import "./Rider.sol";

contract RiderFactory {
    address public owner;
    address public controller;
    
    uint public riderCount;
    mapping(uint => address) public riders0; // ids to contract address
    mapping(address => address) public riders1; // contract address to owner addresses, // todo check if need this
    mapping(address => address) public riders2; // owner addresses to contract addresses
   
    event RiderMade(address indexed riderAddress, address indexed createrAddress);

    constructor(address _controller) public
    {
        controller = _controller;
        owner = msg.sender;
        riderCount = 0;
    }
    
    function makeRider() external returns(address customer){
        require(riders2[msg.sender] == address(0x0)); // the rider must not already be signed up
        Rider newRider = new Rider(riderCount, msg.sender, controller);
        riders1[address(newRider)] = msg.sender;
        riders2[msg.sender] = address(newRider);
        riders0[riderCount] = address(newRider);
        riderCount++;

        emit RiderMade(address(newRider),msg.sender);

        return address(newRider);
    }

    function riderExists(address rider) public view returns(bool exists){
        if(riders1[rider] != address(0x0))
            return true;
        else
            return false;
    }

    function reset() public {
        require(msg.sender == controller);
        for(uint i = 0; i < riderCount; i++){
            address currentContract = riders0[i];
            address currentOwnAddress = riders1[currentContract];

            delete riders0[i];
            delete riders1[currentContract];
            delete riders2[currentOwnAddress];

            riderCount = 0;
        }
    }
}