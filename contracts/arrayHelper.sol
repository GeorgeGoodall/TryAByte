pragma solidity ^0.5.0;

library uintArrayExtension {

	function getPartition(uint[] storage self, uint startIndex, uint size) public view returns (uint[] memory){
		uint[] memory intArray = new uint[](size);
	    for(uint i = 0; i < size; i++){
	      intArray[i] = self[i+startIndex];
	    }
	    return intArray;
	}


}

library bytes32ArrayExtension {

	function getPartition(bytes32[] storage self, uint startIndex, uint size) public view returns (bytes32[] memory){
		bytes32[] memory _byte32Array = new bytes32[](size);
	    for(uint i = 0; i < size; i++){
	      _byte32Array[i] = self[i+startIndex];
	    }
	    return _byte32Array;
	}
}