pragma solidity ^0.5.0;

// this should be done with inheritance for riders and customers
contract Rider {
    
    address owner;
    uint id;
    string name;
    string private contactNumber;
    
    constructor(uint _id, string memory _name, string memory _contactNumber) public
    {
        id = _id;
        name = _name;
        contactNumber = _contactNumber;
        owner = msg.sender; // this needs changing to the origin of the call
    }
    
    function getContactNumber() public view returns(string memory _contactNumber){
        // require the sender of the message to be either the delivery worker or the the restaurant
        return contactNumber;
    }
    
    
    
    
}