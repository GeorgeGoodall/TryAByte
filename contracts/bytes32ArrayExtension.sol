pragma solidity ^0.5.0;

library bytes32ArrayExtension {

	function getPartition(bytes32[] memory self, uint startIndex, uint size) public pure returns (bytes32[] memory){
		bytes32[] memory _byte32Array = new bytes32[](size);
	    for(uint i = 0; i < size; i++){
	      _byte32Array[i] = self[i+startIndex];
	    }
	    return _byte32Array;
	}
}