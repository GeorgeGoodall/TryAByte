pragma solidity ^0.5.0;

// need to reference the source of this code!!!

library lib{    
  
    function strConcat(string memory _a, string memory _b) public pure returns (string memory concatString){
        bytes memory _ba = bytes(_a);
        bytes memory _bb = bytes(_b);
        string memory ab = new string(_ba.length + _bb.length);
        bytes memory bab = bytes(ab);
        uint k = 0;
        for (uint i = 0; i < _ba.length; i++) bab[k++] = _ba[i];
        for (uint i = 0; i < _bb.length; i++) bab[k++] = _bb[i];
        return string(bab);
    }
    function strConcat(string memory _a, string memory _b, string memory _c) public pure returns (string memory concatString){
        return strConcat(strConcat(_a,_b),_c);
    }  
    function strConcat(string memory _a, string memory _b, string memory _c,string memory _d) public pure returns (string memory concatString){
        return strConcat(strConcat(strConcat(_a,_b),_c),_d);
    }  
    
    function stringToBytes32(string memory source) public pure returns (bytes32 result) {
        bytes memory tempEmptyStringTest = bytes(source);
        if (tempEmptyStringTest.length == 0) {
            return 0x0;
        }
        assembly {
            result := mload(add(source, 32))
        }      
    }
    
    function bytes32ToString(bytes32 x) public pure returns (string memory result) {
        bytes memory bytesString = new bytes(32);
        uint charCount = 0;
        for (uint j = 0; j < 32; j++) {
            byte char = byte(bytes32(uint(x) * 2 ** (8 * j)));
            if (char != 0) {
                bytesString[charCount] = char;
                charCount++;
            }
        }
        bytes memory bytesStringTrimmed = new bytes(charCount);
        for (uint j = 0; j < charCount; j++) {
            bytesStringTrimmed[j] = bytesString[j];
        }
        return string(bytesStringTrimmed);
    }
    
    
    function compareStrings (string memory a, string memory b) internal pure returns (bool){
        if(bytes(a).length != bytes(b).length) {
            return false;
        }
        else{
            return keccak256(bytes(a)) == keccak256(bytes(b));
        }
   }

   // taken from https://ethereum.stackexchange.com/questions/6591/conversion-of-uint-to-string
    function uint2str(uint _i) internal pure returns (string memory _uintAsString) {
        if (_i == 0) {
            return "0";
        }
        uint j = _i;
        uint len;
        while (j != 0) {
            len++;
            j /= 10;
        }
        bytes memory bstr = new bytes(len);
        uint k = len - 1;
        while (_i != 0) {
            bstr[k--] = byte(uint8(48 + _i % 10));
            _i /= 10;
        }
        return string(bstr);
    }
   
}