pragma solidity ^0.5.0;

contract Test{


	function getHash(bytes32 data) public view returns(bytes32){
		return keccak256(abi.encodePacked(address(this),data));
	}

	event testEvent(string eventString);

	function emitEvent() public {
		emit testEvent("this is a test");
	}
}