pragma solidity ^0.5.0;

contract Test{

	struct Item{
		bytes32 itemName;
        bytes32 description;
        bytes32[] options;
		uint[] optionsCost; // in wei (10^-18 Eth)
	}
	
    uint public menuLength;
	mapping(uint => Item) public menu; 





	function getHash(bytes32 data) public view returns(bytes32){
		return keccak256(abi.encodePacked(address(this),data));
	}

	event testEvent(string eventString);

	function emitEvent() public {
		emit testEvent("this is a test");
	}

	function compareBytes32(bytes32 a) public returns(bool) {
		return (a == "<>"); 
	}

	 function menuAddItems(bytes32[] calldata itemNames, bytes32[] calldata itemDescriptions, bytes32[] calldata _optionNames, uint[] calldata _prices) external returns(bool){      
        uint itemindex = 0;
        bool isNewItem = true;

        bytes32 itemName;
        bytes32 itemDescription;
        bytes32[] memory optionNames = new bytes32[](5);
        uint[] memory prices = new uint[](5);


        for(uint i = 0; i < _optionNames.length; i++){

            if(isNewItem){
                itemName = itemNames[itemindex];
                itemDescription = itemDescription[itemindex];
                isNewItem = false;
            }

            bytes32 optionName = _optionNames[i];

            if(optionName == "<>"){
                menu[itemindex] = Item(itemName,itemDescription,optionNames,prices);
                menuLength++;
                itemindex++;
                return true;
            }
            else{
                //optionNames[optionIndex] = _optionNames[i];
                //prices[optionIndex] = _prices[i];
            }

        }

        menu[itemindex] = Item(itemName,itemDescription,optionNames,prices);
        menuLength++;


    }
}