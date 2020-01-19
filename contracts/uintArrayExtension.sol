pragma solidity ^0.5.0;

library uintArrayExtension {

	function getPartition(uint[] memory self, uint startIndex, uint size) public view returns (uint[] memory){
		uint[] memory intArray = new uint[](size);
	    for(uint i = 0; i < size; i++){
	      intArray[i] = self[i+startIndex];
	    }
	    return intArray;
	}
}

