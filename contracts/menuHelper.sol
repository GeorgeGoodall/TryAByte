pragma solidity ^0.5.0;

import "./uintArrayExtension.sol";
import "./bytes32ArrayExtension.sol";
import "./StructuredLinkedList.sol";

library menuHelper {

	using uintArrayExtension for uint[];
    using bytes32ArrayExtension for bytes32[];
    using StructuredLinkedList for StructuredLinkedList.List;

    event debug(string message);
    event debuguint(uint number);

   struct Item{
    uint nextItem; 
    bytes32 itemName;
    bytes32 description;
    StructuredLinkedList.List optionsIds;
    StructuredLinkedList.List extrasIds;
  }

  struct Option{
    bytes32 optionName;
    uint optionPrice;
    bool active;
  }

  struct Extra{
    bytes32 extraName;
    uint extraPrice;
    bool active;
  }

   struct menuStruct{
   	uint itemTop;
    uint itemHead;
    uint optionsHead;
    uint extraHead;
    mapping (uint => Option) options;
    mapping (uint => Item) items;
    mapping (uint => Extra) extras;
  }

  function length(menuStruct storage self) public view returns (uint){
    uint itemIndex = self.itemHead;
    uint menuLength = 0;

    while(itemIndex != 0){
      itemIndex = self.items[itemIndex].nextItem;
      menuLength++;
    }

    return menuLength;
  }



  function getEntry(menuStruct storage self, uint itemId) public view returns (bytes32,bytes32,uint[] memory, uint[] memory){
    (uint itemIndex, bool found) = getItemMappingIndex(self,itemId);
    require(found == true);
    menuHelper.Item storage itemToReturn = self.items[itemIndex];

    uint count = itemToReturn.optionsIds.sizeOf();
    uint[] memory optionIds = new uint[](count);

    count = itemToReturn.extrasIds.sizeOf();
    uint[] memory extraIds = new uint[](count);

    uint index;
    uint i;
    bool exists;
    (exists, i) = itemToReturn.optionsIds.getAdjacent(0, true);
    while (i != 0 && exists) {
        optionIds[index] = i;
        index++;
        (exists, i) = itemToReturn.optionsIds.getAdjacent(i, true);
    }

    index = 0;
    (exists, i) = itemToReturn.extrasIds.getAdjacent(0, true);
    while (i != 0 && exists) {
        extraIds[index] = i;
        index++;
        (exists, i) = itemToReturn.extrasIds.getAdjacent(i, true);
    }

    return (itemToReturn.itemName,itemToReturn.description,optionIds,extraIds);
  }

  function getOrderItem(menuStruct storage self, uint itemIndex, uint optionId, uint[] memory extraIds) public view returns (bytes32, bytes32, bytes32, uint, bytes32[] memory, uint[] memory){
    menuHelper.Item memory itemToReturn = self.items[itemIndex];
    menuHelper.Option memory optionToReturn = self.options[optionId];

    bytes32[] memory extraNamesToReturn = new bytes32[](extraIds.length);
    uint[] memory extraPricesToReturn = new uint[](extraIds.length);

    menuHelper.Extra memory currentExtra;
    for(uint i = 0; i < extraIds.length; i++){
    	currentExtra = self.extras[extraIds[i]];
    	extraNamesToReturn[i] = currentExtra.extraName;
    	extraPricesToReturn[i] = currentExtra.extraPrice;
    }

    return (itemToReturn.itemName, itemToReturn.description, optionToReturn.optionName, optionToReturn.optionPrice, extraNamesToReturn, extraPricesToReturn);
  }

	function getEntryIndexingInfo(menuStruct storage self, uint _id) public view returns (uint){
		return self.items[_id].nextItem;
	}

	function getItemHead(menuStruct storage self) public view returns (uint nextitem){
		return self.itemHead;
	}

	function getItemMappingIndex(menuStruct storage self, uint _id) internal view returns (uint, bool){
	    uint itemIndex = self.itemHead;
	    for(uint i = 0; i < _id; i++){
	      itemIndex = self.items[itemIndex].nextItem;
	      if(itemIndex == 0)
	        return (0,false);
	    }
	    return (itemIndex,true);
	}

// modifying items

	function removeItems(menuStruct storage self, uint[] memory itemIds) public returns (bool){
		uint lastId = 9999999999;
	    for(uint i = itemIds.length; i > 0; i--){
	      require(lastId > itemIds[i-1], "itemIds not in assending order");
	      if(!removeItem(self,itemIds[i-1]))
	        revert("item id is out range");
	    }
	}

	function removeItem(menuStruct storage self, uint itemId) public returns (bool){

	    // if the item is the first item, simple change the head 
	    if(itemId == 0){
	     uint newItemHead = self.items[self.itemHead].nextItem;
	     delete self.items[self.itemHead];
	     self.itemHead = newItemHead;
	     return true;
	    }


	    uint itemToUpdate = self.itemHead;
	    for(uint i = 0; i < itemId - 1; i++){
	      itemToUpdate = self.items[itemToUpdate].nextItem;
	    }
	    uint itemToDelete = self.items[itemToUpdate].nextItem;
	    self.items[itemToUpdate].nextItem = self.items[itemToDelete].nextItem;
	    return true;
  	}

  	function addMultipleItems(menuStruct storage self, uint[] memory addAtIndex, bytes32[] memory itemNames, bytes32[] memory itemDescriptions) public {
	    require(addAtIndex.length == itemNames.length, "item indexes/item names mismatch");
	    require(itemNames.length == itemDescriptions.length, "descriptions/item names mismatch");

	    for(uint i = 0; i < addAtIndex.length; i++){
	        addEntry(self, addAtIndex[i], itemNames[i], itemDescriptions[i]);
	    }
  	}

  	function addEntry(menuStruct storage self, uint addAtIndex, bytes32 _itemName,bytes32 _itemDescription) public returns (bool){
	    
	    menuHelper.Item memory item; // 137
	    StructuredLinkedList.List memory list;
	    if(addAtIndex == 0){ //26
	      item = menuHelper.Item(self.itemHead,_itemName,_itemDescription,list, list);
	      self.itemTop++;
	      self.items[self.itemTop] = item;
	      self.itemHead = self.itemTop;
	    }
	    else{
	      uint insertAfter = self.itemHead; // 237
	      for(uint i = 1;i < addAtIndex; i++){
	        uint index = self.items[insertAfter].nextItem; // 295
	        if(index == 0) // 26
	          break; // if you hit the end of the list, just add it to the end
	        insertAfter = index; // 69
	      }
	      item = menuHelper.Item(self.items[insertAfter].nextItem,_itemName,_itemDescription,list,list); // 582

	      self.itemTop++; // 5237
	      self.items[self.itemTop] = item; // 80375
	      self.items[insertAfter].nextItem = self.itemTop; //5394
	    }
	}

// ================================ Options ============================================

// add option
// makeOptionInactive??
// assign option
// unassign option

	function addOptions(menuStruct storage self, bytes32[] memory optionNames, uint[] memory optionPrices) public {
	    require(optionNames.length == optionPrices.length, "the count of the params dont match");
	    for(uint i = 0; i < optionNames.length; i++){
	      self.options[self.optionsHead] = Option(optionNames[i],optionPrices[i],true);
	      self.optionsHead++;
	    }
	}

	function setOptionsInactive(menuStruct storage self, uint[] memory _ids) public {
	    for(uint i = 0; i < _ids.length; i++){
	       self.options[_ids[i]].active = false;
	    }
	}

	function assignOptions(menuStruct storage self, uint[] memory _itemIds, uint[] memory _optionIds, uint[] memory flags) public {
	    require(flags.length == _itemIds.length, "flags/itemIds mismatch");
	    uint flagSum = 0;
	    for(uint i = 0; i < flags.length; i++){
	      flagSum += flags[i];
	    }
	    require(flagSum == _optionIds.length, "flags/optionIds mismatch");
	    
	    uint optionsIndex = 0;
	    for(uint i = 0; i < flags.length; i++){
	      (uint itemIndex, bool found) = getItemMappingIndex(self,_itemIds[i]);
	      require(found == true, "index out of range");

	      for(uint j = 0; j < flags[i]; j++){
	        // add option j to item i
	        self.items[itemIndex].optionsIds.push(_optionIds[optionsIndex],false);
	        optionsIndex++;
	      }
	    }
	}

	function unassignOptions(menuStruct storage self, uint[] memory _itemIds, uint[] memory _optionsIds, uint[] memory flags) public {
	    require(flags.length == _itemIds.length, "flags/itemids mismatch");
	    uint flagSum = 0;
	    for(uint i = 0; i < flags.length; i++){
	      flagSum += flags[i];
	    }
	    require(flagSum == _optionsIds.length, "flags/options mismatch");
	    
	    uint optionsIndex;
	    for(uint i = 0; i < flags.length; i++){
	      (uint itemIndex, bool found) = getItemMappingIndex(self, _itemIds[i]);
	      require(found == true, "index out of range");

	      // for each option id
	      for(uint j = 0; j < flags[i]; j++){
	        // for each option in the item
	        self.items[itemIndex].optionsIds.remove(_optionsIds[optionsIndex]); 
	        optionsIndex++;
	      }
	    }
	}

  	// =========================== Extras ====================================

	function addExtras(menuStruct storage self, bytes32[] memory extraNames, uint[] memory extraPrice) public {
	    require(extraNames.length == extraPrice.length, "the count of the params dont match");
	    for(uint i = 0; i < extraNames.length; i++){
	      self.extras[self.extraHead] = Extra(extraNames[i],extraPrice[i],true);
	      self.extraHead++;
	    }
	}

	function setExtrasInactive(menuStruct storage self, uint[] memory _ids) public {
	    for(uint i = 0; i < _ids.length; i++){
	       self.extras[_ids[i]].active = false;
	    }
	}

	function assignExtras(menuStruct storage self, uint[] memory _itemIds, uint[] memory _extrasIds, uint[] memory flags) public {
	    require(flags.length == _itemIds.length, "flags/itemIds mismatch");
	    uint flagSum = 0;
	    for(uint i = 0; i < flags.length; i++){
	      flagSum += flags[i];
	    }
	    require(flagSum == _extrasIds.length, "flags/extras mismatch");
	    
	    uint extrasIndex = 0;
	    for(uint i = 0; i < flags.length; i++){
	      (uint itemIndex, bool found) = getItemMappingIndex(self,_itemIds[i]);
	      require(found == true, "index out of range");

	      for(uint j = 0; j < flags[i]; j++){
	        // add extra j to item i
	        self.items[itemIndex].extrasIds.push(_extrasIds[extrasIndex],false);
	        extrasIndex++;
	      }
	    }
	}

	function unassignExtras(menuStruct storage self, uint[] memory _itemIds, uint[] memory _extrasIds, uint[] memory flags) public {
	    require(flags.length == _itemIds.length, "flags/itemids mismatch");
	    uint flagSum = 0;
	    for(uint i = 0; i < flags.length; i++){
	      flagSum += flags[i];
	    }
	    require(flagSum == _extrasIds.length, "flags/ extras mismatch");
	    
	    uint extrasIndex = 0;
	    for(uint i = 0; i < flags.length; i++){
	      (uint itemIndex, bool found) = getItemMappingIndex(self, _itemIds[i]);
	      require(found == true, "index out of range");

	      // for each extra id
	      for(uint j = 0; j < flags[i]; j++){
	        // for each extra in the item
	        self.items[itemIndex].extrasIds.remove(_extrasIds[extrasIndex]); 
	        extrasIndex++;
	      }
	    }
	}


	// does all but insert items as 
	function updateMenu(menuStruct storage self, uint[] memory integers, uint[] memory integersFlags, bytes32[] memory strings, uint[] memory stringsFlags) public returns (bool){
	    uint integerIndex;
	    uint stringIndex;

	    

	    // remove menu.extras
	    setExtrasInactive(self, integers.getPartition(integerIndex,integersFlags[0]));
	    integerIndex += integersFlags[0];

	    // add menu.extras
	    addExtras(self, strings.getPartition(stringIndex,stringsFlags[0]),integers.getPartition(integerIndex,integersFlags[1]));
	    stringIndex += stringsFlags[0];
	    integerIndex += integersFlags[1];

	    // remove menu.options
	    // takes Ids
	    setOptionsInactive(self,integers.getPartition(integerIndex,integersFlags[2]));
	    integerIndex += integersFlags[2];

	    // add menu.options [names, prices]
	    addOptions(self,strings.getPartition(stringIndex,stringsFlags[1]),integers.getPartition(integerIndex,integersFlags[3]));
	    stringIndex += stringsFlags[1];
	    integerIndex += integersFlags[3];

	    // remove menu.items
	    removeItems(self, integers.getPartition(integerIndex,integersFlags[4]));
	    integerIndex += integersFlags[4];
	    
	    //addAtIndex, itemnames, itemDescriptions
	    addMultipleItems(self, 
	    	integers.getPartition(integerIndex,integersFlags[5]),
	    	strings.getPartition(stringIndex,stringsFlags[2]),
	    	strings.getPartition(stringIndex+stringsFlags[2],stringsFlags[3]));
	    integerIndex = integerIndex + integersFlags[5];
	    stringIndex = stringIndex+stringsFlags[2]+stringsFlags[3];

	    // unassign menu.extras[itemids int, extrasids int, flags int] 1
	    unassignOptions(self,
	      integers.getPartition(integerIndex,integersFlags[6]),
	      integers.getPartition(integerIndex + integersFlags[6],integersFlags[7]),
	      integers.getPartition(integerIndex + integersFlags[6] + integersFlags[7],integersFlags[8]));
	    integerIndex += integersFlags[6]+integersFlags[7]+integersFlags[8];
	
	    // assign menu.extras  [itemids int, extrasids int, flags int] 1
	    assignOptions(self,
	      integers.getPartition(integerIndex,integersFlags[9]),
	      integers.getPartition(integerIndex + integersFlags[9],integersFlags[10]),
	      integers.getPartition(integerIndex + integersFlags[9] + integersFlags[10],integersFlags[11]));
	    integerIndex += integersFlags[9]+integersFlags[10]+integersFlags[11];

	    // unassign menu.extras[itemids int, extrasids int, flags int] 1
	    unassignExtras(self,
	      integers.getPartition(integerIndex,integersFlags[12]),
	      integers.getPartition(integerIndex + integersFlags[12],integersFlags[13]),
	      integers.getPartition(integerIndex + integersFlags[12] + integersFlags[13],integersFlags[14]));
	    integerIndex += integersFlags[12] + integersFlags[13] + integersFlags[14];


	    // assign menu.extras  [itemids int, extrasids int, flags int] 1
	    assignExtras(self,
	      integers.getPartition(integerIndex,integersFlags[15]),
	      integers.getPartition(integerIndex + integersFlags[15],integersFlags[16]),
	      integers.getPartition(integerIndex + integersFlags[15] + integersFlags[16],integersFlags[17]));
	    integerIndex += integersFlags[15] + integersFlags[16] + integersFlags[17];
  }

  // could probably save alot of gas by changing the items into the linked list class
  function swapItems(menuStruct storage self, uint index1, uint index2) public {
    require(index1 < index2, "index 1 must be smaller than index 2");

    uint item1Index;
    uint item2Index;

    uint preItem1Index;
    uint preItem2Index;

    uint itemIndex = self.itemHead;
    for(uint i = 0; i <= index2; i++){
      if(i == index1)
        item1Index = itemIndex;
      if(i == index1 - 1)
        preItem1Index = itemIndex;
      if(i == index2)
        item2Index = itemIndex;
      if(i == index2 - 1)
        preItem2Index = itemIndex;

      itemIndex = self.items[itemIndex].nextItem;
    }

    uint temp;
    if(index1 == 0){
      // update pre Item Links
      temp = self.itemHead;
      self.itemHead = self.items[preItem2Index].nextItem;
      self.items[preItem2Index].nextItem = temp;
    }
    else{
      temp = self.items[preItem1Index].nextItem;
      self.items[preItem1Index].nextItem = self.items[preItem2Index].nextItem;
      self.items[preItem2Index].nextItem = temp;
    }

    //update item links
    temp = self.items[item1Index].nextItem;
    self.items[item1Index].nextItem = self.items[item2Index].nextItem;
    self.items[item2Index].nextItem = temp;
  }

  function swapOptions(menuStruct storage self, uint _id, uint index1, uint index2) public {
  	(uint index, bool found) = getItemMappingIndex(self,_id);
  	require(found == true, "index out of range");
  	self.items[index].optionsIds.swapIndexs(index1,index2);
  }

}