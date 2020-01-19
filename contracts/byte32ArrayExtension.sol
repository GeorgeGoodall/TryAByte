pragma solidity ^0.5.0;

library bytes32ArrayExtension {

	struct bytes32Array{
    	bytes32[] items;
  	}

	function getPartition(bytes32Array storage self, uint startIndex, uint size) public view returns (bytes32[] memory){
		bytes32[] memory _byte32Array = new bytes32[](size);
	    for(uint i = 0; i < size; i++){
	      _byte32Array[i] = self.items[i+startIndex];
	    }
	    return _byte32Array;
	}
}