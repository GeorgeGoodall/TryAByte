pragma solidity ^0.5.0;

contract Menu {

  //event AddEntry(bytes32 head,uint number,bytes32 name,bytes32 next);
  event addOptionEvent(uint itemId, uint addAtIndex, bytes32 optionName, uint optionPrice);
  event debug(string message);
  event debuguint(uint number);

  address public owner;
  uint public length = 0;//also used as nonce

  struct Item{
    uint nextItem; 
    bytes32 itemName;
    bytes32 description;
    uint optionsHead;
    uint[] extrasIds;
  }

  struct Option{
    uint nextOption; 
    bytes32 optionName;
    uint optionPrice;
  }

  struct Extra{
    bytes32 extraName;
    uint extraPrice;
    bool active;
  }

  uint public itemHead = 0;
  uint public optionsHead = 0;
  uint public extraHead = 0;
  mapping (uint => Option) public options;
  mapping (uint => Item) public items;
  mapping (uint => Extra) public extras;

  constructor(address _owner) public{
    owner = _owner;
  }

  function getMenuLength() public view returns (uint){
    uint itemIndex = itemHead;
    uint menuLength = 0;

    while(itemIndex != 0){
      itemIndex = items[itemIndex].nextItem;
      menuLength++;
    }

    return menuLength;
  }

  function getItemMappingIndex(uint _id) private view returns (uint, bool){
    uint itemIndex = itemHead;
    for(uint i = 0; i < _id; i++){
      itemIndex = items[itemIndex].nextItem;
      if(itemIndex == 0)
        return (0,false);
    }
    return (itemIndex,true);
  }

  function getOptionMappingIndex(uint _optionHead, uint _id) private view returns (uint, bool){
    uint optionMappingIndex = _optionHead;
    for(uint i = 0; i < _id; i++){
      optionMappingIndex = options[optionMappingIndex].nextOption;
      if(optionMappingIndex == 0)
        return (0,false);
    }
    return (optionMappingIndex,true);
  }

  //needed for external contract access to struct
  function getEntry(uint _id) public view returns (bytes32,bytes32,bytes32[] memory,uint[] memory, uint[] memory){
    (uint itemIndex, bool found) = getItemMappingIndex(_id);
    require(found == true, "index out of range");

    Item memory itemToReturn = items[itemIndex];

    bytes32[] memory optionNamesToReturn;
    uint[] memory optionPricesToReturn;
    uint counter = 0;
    uint optionCount = 0;
    uint index = itemToReturn.optionsHead;
    while(index != 0){
      index = options[index].nextOption;
      optionCount++;
    }
    optionNamesToReturn = new bytes32[](optionCount);
    optionPricesToReturn = new uint[](optionCount);

    index = itemToReturn.optionsHead;

    while(index != 0){
      optionNamesToReturn[counter] = options[index].optionName;
      optionPricesToReturn[counter] = options[index].optionPrice;
      counter++;
      index = options[index].nextOption;
    }

    return (itemToReturn.itemName,itemToReturn.description,optionNamesToReturn,optionPricesToReturn, itemToReturn.extrasIds);
  }

  // =============================== unpack function to allow menu updates with one call ===============================================

  // this function will
    // remove extras  [indexes int] 1
    // add extras     [names string, prices int] 2
    // remove items   [itemindexes int] 1
    // add items      [addAtIndex int, itemnames sting, itemDescription string, optionnames string, price int, optionFlags int, extraIds int, extraFlags int] 2
    // remove options [itemIdss int, optionids int, flags int] 1
    // add options    [itemids int, addAtIndex int, optionNames string, _prices] 2
    // unassign extras[itemids int, extrasids int, flags int] 1
    // assign extras  [itemids int, extrasids int, flags int] 1
    // update prices <-- needs doing



function updateMenu(uint[] memory integers, uint[] memory integersFlags, bytes32[] memory strings, uint[] memory stringsFlags) public returns (bool){
    uint integerIndex = 0;
    uint stringIndex = 0;

    uint[] memory ints_1;
    uint[] memory ints_2;
    uint[] memory ints_3;
    uint[] memory ints_4;
    uint[] memory ints_5;
    bytes32[] memory str_1;
    bytes32[] memory str_2;
    bytes32[] memory str_3;


    // remove extras
    ints_1 = new uint[](integersFlags[0]);
    for(uint i = 0; i < integersFlags[0]; i++){
      ints_1[i] = integers[integerIndex];
      integerIndex ++;
    }
    setExtrasInactive(ints_1);

    // add extras
    str_1 = new bytes32[](stringsFlags[0]);
    for(uint i = 0; i < stringsFlags[0]; i++){
      str_1[i] = strings[stringIndex];
      stringIndex ++;
    }

    ints_2 = new uint[](integersFlags[1]);
    for(uint i = 0; i < integersFlags[1]; i++){
      ints_2[i] = integers[integerIndex];
      integerIndex ++;
    }
    addExtras(str_1,ints_2);

    // remove items
    ints_1 = new uint[](integersFlags[2]);
    for(uint i = 0; i < integersFlags[2]; i++){
      ints_1[i] = integers[integerIndex];
      integerIndex ++;
    }
    removeMultipleItems(ints_1);

    // add items [addAtIndex int, itemnames sting, itemDescription string, optionnames string, price int, optionFlags int, extraIds int, extraFlags int]
    // addAtIndex
    ints_1 = new uint[](integersFlags[3]);
    for(uint i = 0; i < integersFlags[3]; i++){
      ints_1[i] = integers[integerIndex];
      integerIndex ++;
    }

    //itemNames
    str_1 = new bytes32[](stringsFlags[1]);
    for(uint i = 0; i < stringsFlags[1]; i++){
      str_1[i] = strings[stringIndex];
      stringIndex ++;
    }

    //itemDescriptions
    str_2 = new bytes32[](stringsFlags[2]);
    for(uint i = 0; i < stringsFlags[2]; i++){
      str_2[i] = strings[stringIndex];
      stringIndex ++;
    }

    // optionNames
    str_3 = new bytes32[](stringsFlags[3]);
    for(uint i = 0; i < stringsFlags[3]; i++){
      str_3[i] = strings[stringIndex];
      stringIndex ++;
    }

    // price
    ints_2 = new uint[](integersFlags[4]);
    for(uint i = 0; i < integersFlags[4]; i++){
      ints_2[i] = integers[integerIndex];
      integerIndex ++;
    }

    // optionFlags
    ints_3 = new uint[](integersFlags[5]);
    for(uint i = 0; i < integersFlags[5]; i++){
      ints_3[i] = integers[integerIndex];
      integerIndex ++;
    }

    ints_4 = new uint[](integersFlags[6]);
    for(uint i = 0; i < integersFlags[6]; i++){
      ints_4[i] = integers[integerIndex];
      integerIndex ++;
    }

    ints_5 = new uint[](integersFlags[7]);
    for(uint i = 0; i < integersFlags[7]; i++){
      ints_5[i] = integers[integerIndex];
      integerIndex ++;
    }
    addMultipleItems(ints_1, str_1, str_2, str_3, ints_2, ints_3, ints_4, ints_5);

    // remove options
    // itemIds
    ints_1 = new uint[](integersFlags[8]);
    for(uint i = 0; i < integersFlags[8]; i++){
      ints_1[i] = integers[integerIndex];
      integerIndex ++;
    }

    // optionIds
    ints_2 = new uint[](integersFlags[9]);
    for(uint i = 0; i < integersFlags[9]; i++){
      ints_2[i] = integers[integerIndex];
      integerIndex ++;
    }

    // flags
    ints_3 = new uint[](integersFlags[10]);
    for(uint i = 0; i < integersFlags[10]; i++){
      ints_3[i] = integers[integerIndex];
      integerIndex ++;
    }
    removeMultipleOptions(ints_1,ints_2,ints_3);

    // add options [itemids int, addAtIndex int, optionNames string, _prices]
    ints_1 = new uint[](integersFlags[11]);
    for(uint i = 0; i < integersFlags[11]; i++){
      ints_1[i] = integers[integerIndex];
      integerIndex ++;
    }

    ints_2 = new uint[](integersFlags[12]);
    for(uint i = 0; i < integersFlags[12]; i++){
      ints_2[i] = integers[integerIndex];
      integerIndex ++;
    }

    str_1 = new bytes32[](stringsFlags[4]);
    for(uint i = 0; i < stringsFlags[4]; i++){
      str_1[i] = strings[stringIndex];
      stringIndex ++;
    }

    ints_3 = new uint[](integersFlags[13]);
    for(uint i = 0; i < integersFlags[13]; i++){
      ints_3[i] = integers[integerIndex];
      integerIndex ++;
    }
    addMultipleOptions(ints_1, ints_2, str_1, ints_3);

    // unassign extras[itemids int, extrasids int, flags int] 1
   ints_1 = new uint[](integersFlags[14]);
    for(uint i = 0; i < integersFlags[14]; i++){
      ints_1[i] = integers[integerIndex];
      integerIndex ++;
    }

    ints_2 = new uint[](integersFlags[15]);
    for(uint i = 0; i < integersFlags[15]; i++){
      ints_2[i] = integers[integerIndex];
      integerIndex ++;
    }

    ints_3 = new uint[](integersFlags[16]);
    for(uint i = 0; i < integersFlags[16]; i++){
      ints_3[i] = integers[integerIndex];
      integerIndex ++;
    }
    unassignExtras(ints_1,ints_2,ints_3);


    // assign extras  [itemids int, extrasids int, flags int] 1
    ints_1 = new uint[](integersFlags[17]);
    for(uint i = 0; i < integersFlags[17]; i++){
      ints_1[i] = integers[integerIndex];
      integerIndex ++;
    }

    ints_2 = new uint[](integersFlags[18]);
    for(uint i = 0; i < integersFlags[18]; i++){
      ints_2[i] = integers[integerIndex];
      integerIndex ++;
    }

    ints_3 = new uint[](integersFlags[19]);
    for(uint i = 0; i < integersFlags[19]; i++){
      ints_3[i] = integers[integerIndex];
      integerIndex ++;
    }
    assignExtras(ints_1,ints_2,ints_3);

  }

  // stack overflow with this method
  // function updateMenu(uint[] memory integers, uint[] memory integersFlags, bytes32[] memory strings, uint[] memory stringsFlags) public {
  //   uint integerIndex = 0;
  //   uint stringIndex = 0;

  //   uint[] memory ints_1;
  //   // remove extras
  //   ints_1 = getPartitionOfIntArray(integerIndex,integersFlags[0],integers);
  //   integerIndex += integersFlags[0];
  //   setExtrasInactive(ints_1);

  //   uint[] memory ints_2;
  //   bytes32[] memory str_1;
  //   // add extras
  //   str_1 = getPartitionOfBytesArray(stringIndex,stringsFlags[0],strings);
  //   stringIndex += stringsFlags[0];
  //   ints_2 = getPartitionOfIntArray(integerIndex,integersFlags[1],integers);
  //   integerIndex += integersFlags[1];
  //   addExtras(str_1,ints_2);

  //   // remove items
  //   ints_1 = getPartitionOfIntArray(integerIndex,integersFlags[2],integers);
  //   integerIndex += integersFlags[2];
  //   removeMultipleItems(ints_1);

  //   uint[] memory ints_3;
  //   uint[] memory ints_4;
  //   uint[] memory ints_5;
  //   bytes32[] memory str_2;
  //   bytes32[] memory str_3;
  //   // add items [addAtIndex int, itemnames sting, itemDescription string, optionnames string, price int, optionFlags int, extraIds int, extraFlags int]
  //   // addAtIndex
  //   ints_1 = getPartitionOfIntArray(integerIndex,integersFlags[3],integers);
  //   integerIndex += integersFlags[3];
  //   //itemNames
  //   str_1 = getPartitionOfBytesArray(stringIndex,stringsFlags[1],strings);
  //   stringIndex += stringsFlags[1];
  //   //itemDescriptions
  //   str_2 = getPartitionOfBytesArray(stringIndex,stringsFlags[2],strings);
  //   stringIndex += stringsFlags[2];
  //   // optionNames
  //   str_3 = getPartitionOfBytesArray(stringIndex,stringsFlags[3],strings);
  //   stringIndex += stringsFlags[3];
  //   // price
  //   ints_2 = getPartitionOfIntArray(integerIndex,integersFlags[4],integers);
  //   integerIndex += integersFlags[4];
  //   // optionFlags
  //   ints_3 = getPartitionOfIntArray(integerIndex,integersFlags[5],integers);
  //   integerIndex += integersFlags[5];
  //   // extraIds
  //   ints_4 = getPartitionOfIntArray(integerIndex,integersFlags[6],integers);
  //   integerIndex += integersFlags[6];
  //   // extraFlags
  //   ints_5 = getPartitionOfIntArray(integerIndex,integersFlags[7],integers);
  //   integerIndex += integersFlags[7];
  //   addMultipleItems(ints_1, str_1, str_2, str_3, ints_2, ints_3, ints_4, ints_5);

  //   // remove options
  //   // itemIds
  //   ints_1 = getPartitionOfIntArray(integerIndex,integersFlags[8],integers);
  //   integerIndex += integersFlags[8];
  //   // optionIds
  //   ints_2 = getPartitionOfIntArray(integerIndex,integersFlags[9],integers);
  //   integerIndex += integersFlags[9];
  //   // flags
  //   ints_3 = getPartitionOfIntArray(integerIndex,integersFlags[10],integers);
  //   integerIndex += integersFlags[10];
  //   removeMultipleOptions(ints_1,ints_2,ints_3);

  //   // add options [itemids int, addAtIndex int, optionNames string, _prices]
  //   // itemids
  //   ints_1 = getPartitionOfIntArray(integerIndex,integersFlags[11],integers);
  //   integerIndex += integersFlags[11];
  //   // addatindex
  //   ints_2 = getPartitionOfIntArray(integerIndex,integersFlags[12],integers);
  //   integerIndex += integersFlags[12];
  //   //  optionnames
  //   str_1 = getPartitionOfBytesArray(stringIndex,stringsFlags[4],strings);
  //   stringIndex += stringsFlags[4];
  //   // prices
  //   ints_3 = getPartitionOfIntArray(integerIndex,integersFlags[13],integers);
  //   integerIndex += integersFlags[13];
  //   addMultipleOptions(ints_1, ints_2, str_1, ints_3);

  //   // unassign extras[itemids int, extrasids int, flags int] 1
  //   // itemIds
  //   ints_1 = getPartitionOfIntArray(integerIndex,integersFlags[14],integers);
  //   integerIndex += integersFlags[14];
  //   // extraIds
  //   ints_2 = getPartitionOfIntArray(integerIndex,integersFlags[15],integers);
  //   integerIndex += integersFlags[15];
  //   // flags
  //   ints_3 = getPartitionOfIntArray(integerIndex,integersFlags[16],integers);
  //   integerIndex += integersFlags[16];
  //   unassignExtras(ints_1,ints_2,ints_3);


  //   // assign extras  [itemids int, extrasids int, flags int] 1
  //   // itemIds
  //   ints_1 = getPartitionOfIntArray(integerIndex,integersFlags[17],integers);
  //   integerIndex += integersFlags[17];
  //   // extraIds
  //   ints_2 = getPartitionOfIntArray(integerIndex,integersFlags[18],integers);
  //   integerIndex += integersFlags[18];
  //   // flags
  //   ints_3 = getPartitionOfIntArray(integerIndex,integersFlags[19],integers);
  //   integerIndex += integersFlags[19];
  //   assignExtras(ints_1,ints_2,ints_3);

  // }

  // =============================== END unpack function to allow menu updates with one call ===============================================

  // =============================== ITEMS ===============================================

  // toDo
  function addMultipleItems(uint[] memory addAtIndex, bytes32[] memory itemNames, bytes32[] memory itemDescriptions, bytes32[] memory _optionNames, uint[] memory _prices, uint[] memory optionFlags, uint[] memory _extrasIds, uint[] memory extrasFlags) public {
    require(msg.sender == owner, "you are not the owner");
    require(addAtIndex.length == itemNames.length, "the number of item indexes and item names do not match");
    require(itemNames.length == itemDescriptions.length, "the number of descriptions and item names do not match");
    require(_optionNames.length == _prices.length, "the number of options and prices do not match");
    require(itemNames.length == optionFlags.length, "the number of item names and option flags do not match");
    require(itemNames.length == extrasFlags.length, "the number of item names and extras flags do not match");
    uint optionFlagsSum = 0;
    for(uint i = 0; i < optionFlags.length; i++){
        optionFlagsSum += optionFlags[i];
    }
    require(_optionNames.length == optionFlagsSum, "the number of options and the sum of the option flags do not match");


    uint optionIndex = 0;
    bytes32[] memory optionNames;
    uint[] memory prices;

    uint extrasIndex = 0;
    uint[] memory extraIds;

    for(uint i = 0; i < optionFlags.length; i++){

        optionNames = new bytes32[](optionFlags[i]);
        prices = new uint[](optionFlags[i]);
        
        //ToDo: need to require that the total number of options for an item is less than the options array limit, or have the limit increase when it is exceeded

        for(uint j = 0; j < optionFlags[i]; j++){
            optionNames[j] = _optionNames[optionIndex];
            prices[j] = _prices[optionIndex];
            optionIndex++;
        }

        extraIds = new uint[](extrasFlags[i]);

        for(uint j = 0; j < extrasFlags[i]; j++){
          extraIds[j] = _extrasIds[extrasIndex];
          extrasIndex++;
        }



        addEntry(addAtIndex[i], itemNames[i], itemDescriptions[i], optionNames, prices, extraIds);
    }

  }

  // add item at index needs doing
  function addEntry(uint addAtIndex, bytes32 _itemName,bytes32 _itemDescription, bytes32[] memory _optionNames, uint[] memory _optionPrices, uint[] memory extraIds) public returns (bool){
    require(msg.sender == owner, "you are not the owner of this menu"); // 270
    require(_optionNames.length == _optionPrices.length, "the number of options does not match the number of prices"); // 28


    // add the options
    // having a next of 0 informs my code that we are at the end of this list
    Option memory option = Option(0,_optionNames[0],_optionPrices[0]); // 252
    optionsHead++; // 237
    options[optionsHead] = option; //40554


    //2918775 - 2796277 (three)
    for(uint i = 1; i < _optionNames.length; i++){
      option = Option(optionsHead,_optionNames[i],_optionPrices[i]); // 377
      optionsHead++; // 437
      options[optionsHead] = option; // 60354
    }

    Item memory item; // 137
    if(addAtIndex == 0){ //26
      item = Item(itemHead,_itemName,_itemDescription,optionsHead, extraIds);
      length++;
      items[length] = item;
      itemHead = length;
    }
    else{
      uint insertAfter = itemHead; // 237
      for(uint i = 1;i < addAtIndex; i++){
        uint index = items[insertAfter].nextItem; // 295
        if(index == 0) // 26
          break; // if you hit the end of the list, just add it to the end
        insertAfter = index; // 69
      }
      item = Item(items[insertAfter].nextItem,_itemName,_itemDescription,optionsHead,extraIds); // 582

      length++; // 5237
      items[length] = item; // 80375
      items[insertAfter].nextItem = length; //5394
    }
  }

  function removeMultipleItems(uint[] memory itemIds) public {

    uint lastId = 9999999999;
    for(int i = int(itemIds.length - 1); i >= 0; i--){
      require(lastId > itemIds[uint(i)], "the array of itemIds must be in assending order");
      removeItem(itemIds[uint(i)]);
      lastId = itemIds[uint(i)];
    }
  }

  function removeItem(uint itemId) public returns (bool){
    require(msg.sender == owner, "you are not the owner of this menu");

    // if the item is the first item, simple change the head 
    if(itemId == 0){
     uint newItemHead = items[itemHead].nextItem;
     delete items[itemHead];
     itemHead = newItemHead;
     return true;
    }


    uint itemToUpdate = itemHead;
    for(uint i = 0; i < itemId - 1; i++){
      itemToUpdate = items[itemToUpdate].nextItem;
    }
    uint itemToDelete = items[itemToUpdate].nextItem;
    items[itemToUpdate].nextItem = items[itemToDelete].nextItem;
    return true;
  }

  // =============================== END ITEMS ===============================================

  // =============================== OPTIONS ===============================================

  function addMultipleOptions(uint[] memory itemIds, uint[] memory addAtIndexs, bytes32[] memory _optionNames, uint[] memory _prices) public {
    require(msg.sender == owner, "you are not the owner");
    require(itemIds.length == addAtIndexs.length, "the number of itemIds and indexes to insert at are not the same");
    require(_optionNames.length == _prices.length, "the number of options does not match the number of prices");
    require(_optionNames.length == itemIds.length, "the number of itemIDs does not match the number of optionNames");

    for(uint i = 0; i < itemIds.length; i++){
      addOption(itemIds[i], addAtIndexs[i], _optionNames[i],_prices[i]);
    }
  }

  // adding at index > 0 puts it at the end, index == 0 puts it at 0
  function addOption(uint itemId, uint addAtIndex, bytes32 _optionName, uint _optionPrice) public returns(bool){
    require(msg.sender == owner, "you are not the owner of this menu");

    Option memory option;

    (uint itemIndex, bool foundItem) = getItemMappingIndex(itemId);
    require(foundItem == true, "index out of range");

    if(addAtIndex == 0){
      option = Option(items[itemIndex].optionsHead,_optionName,_optionPrice);
      optionsHead++;
      options[optionsHead] = option;
      items[itemIndex].optionsHead = optionsHead;
    }

    else{
      // get the pointer of the item currently at the index
      (uint insertAfter,bool foundOption) = getOptionMappingIndex(items[itemIndex].optionsHead,addAtIndex);
      if(!foundOption)
        insertAfter = 0;

      option = Option(options[insertAfter].nextOption,_optionName,_optionPrice);

      optionsHead++;
      options[optionsHead] = option;

      options[insertAfter].nextOption = optionsHead;
    }
  }


  function removeMultipleOptions(uint[] memory itemIds, uint[] memory optionIds, uint[] memory flags) public {
    uint optionIdsIndex = 0;
    for(uint i = 0; i < itemIds.length; i++){
      for(int j = int(flags[i] - 1); j >= 0; j--){
        removeOption(itemIds[i],optionIds[optionIdsIndex+uint(j)]);
      }
      optionIdsIndex+=flags[i];
    }
  }

  function removeOption(uint itemId, uint optionId) public returns(bool){
    require(msg.sender == owner, "you are not the owner of this menu");

    (uint itemIndex, bool found) = getItemMappingIndex(itemId);
    require(found == true, "index out of range");

    uint optionToUpdate = items[itemIndex].optionsHead;

    if(optionId == 0){
     uint newOptionsHead = options[optionToUpdate].nextOption;
     delete options[optionToUpdate];
     items[itemIndex].optionsHead = newOptionsHead;
     return true;
    }

    (optionToUpdate, found) = getOptionMappingIndex(optionToUpdate,optionId - 1);
    require(found == true, "option index out of range");
    
    uint optionToDelete = options[optionToUpdate].nextOption;
    options[optionToUpdate].nextOption = options[optionToDelete].nextOption;
    delete options[optionToDelete];
    return true;
  }

  // =============================== END OPTIONS ===============================================

  // =============================== EXTRAS ===============================================

  // should improve this storage method
  function addExtras(bytes32[] memory extraNames, uint[] memory extraPrice) public {
    require(extraNames.length == extraPrice.length, "the count of the params dont match");
    for(uint i = 0; i < extraNames.length; i++){
      extras[extraHead] = Extra(extraNames[i],extraPrice[i],true);
      extraHead++;
    }
  }

  // ToDo: check that the extras dont belong to any items
  function setExtrasInactive(uint[] memory _ids) public {
    for(uint i = 0; i < _ids.length; i++){
       extras[_ids[i]].active = false;
    }
  }

  // todo
  // should do some checks to ensure an extra can only be assigned once
  // could also sort this list to allow fast removal and finding??
  function assignExtras(uint[] memory _itemIds, uint[] memory _extrasIds, uint[] memory flags) public {
    require(flags.length == _itemIds.length, "inconsistent number of flags and item ids");
    uint flagSum = 0;
    for(uint i = 0; i < flags.length; i++){
      flagSum += flags[i];
    }
    require(flagSum == _extrasIds.length, "the flags are inconsistent with the extras passed in");
    
    uint extrasIndex = 0;
    for(uint i = 0; i < flags.length; i++){
      (uint itemIndex, bool found) = getItemMappingIndex(_itemIds[i]);
      require(found == true, "index out of range");

      for(uint j = 0; j < flags[i]; j++){
        // add extra j to item i
        items[itemIndex].extrasIds.push(_extrasIds[extrasIndex]);
        extrasIndex++;
      }
    }
  }

  // ToDo, change extras to a list structure so propper deletion can be done
  function unassignExtras(uint[] memory _itemIds, uint[] memory _extrasIds, uint[] memory flags) public {
    require(flags.length == _itemIds.length, "inconsistent number of flags and item ids");
    uint flagSum = 0;
    for(uint i = 0; i < flags.length; i++){
      flagSum += flags[i];
    }
    require(flagSum == _extrasIds.length, "the flags are inconsistent with the extras passed in");
    
    uint extrasIndex = 0;
    for(uint i = 0; i < flags.length; i++){
      (uint itemIndex, bool found) = getItemMappingIndex(_itemIds[i]);
      require(found == true, "index out of range");

      // for each extra id
      for(uint j = 0; j < flags[i]; j++){
        // for each extra in the item
        for(uint k = 0; k < items[itemIndex].extrasIds.length; k++){
          if(items[itemIndex].extrasIds[k] == _extrasIds[extrasIndex]){
            items[itemIndex].extrasIds[k] = 9999; // TODO: should remove element instead of putting in a placholder
            extrasIndex++;
            break;
          }
        }
      }
    }
  }

  // =============================== END EXTRAS ===============================================

  // =============================== changing order ===============================================
  // needs doing and implementing

  function reorderItems() public {

  }

  function reorderOptions() public {

  }

  function swapItems(uint index1, uint index2) public {
    require(msg.sender == owner, "you are not the owner of this menu");
    require(index1 < index2, "index 1 must be smaller than index 2");

    uint item1Index;
    uint item2Index;

    uint preItem1Index;
    uint preItem2Index;

    uint itemIndex = itemHead;
    for(uint i = 0; i <= index2; i++){
      if(i == index1)
        item1Index = itemIndex;
      if(i == index1 - 1)
        preItem1Index = itemIndex;
      if(i == index2)
        item2Index = itemIndex;
      if(i == index2 - 1)
        preItem2Index = itemIndex;

      itemIndex = items[itemIndex].nextItem;
    }

    uint temp;
    if(index1 == 0){
      // update pre Item Links
      temp = itemHead;
      itemHead = items[preItem2Index].nextItem;
      items[preItem2Index].nextItem = temp;
    }
    else{
      temp = items[preItem1Index].nextItem;
      items[preItem1Index].nextItem = items[preItem2Index].nextItem;
      items[preItem2Index].nextItem = temp;
    }

    //update item links
    temp = items[item1Index].nextItem;
    items[item1Index].nextItem = items[item2Index].nextItem;
    items[item2Index].nextItem = temp;
  }

  function swapOptions(uint _id, uint index1, uint index2) public {
    require(msg.sender == owner, "you are not the owner of this menu");
    require(index1 < index2, "index 1 must be smaller than index 2");

    uint itemIndex = itemHead;
    for(uint i = 0; i < _id; i++){
      itemIndex = items[itemIndex].nextItem;
    }

    uint item1Index;
    uint item2Index;

    uint preItem1Index;
    uint preItem2Index;

    uint optionIndex = items[itemIndex].optionsHead;
    for(uint i = 0; i <= index2; i++){
      if(i == index1)
        item1Index = optionIndex;
      if(i == index1 - 1)
        preItem1Index = optionIndex;
      if(i == index2)
        item2Index = optionIndex;
      if(i == index2 - 1)
        preItem2Index = optionIndex;

      optionIndex = options[optionIndex].nextOption;
    }

    uint temp;
    if(index1 == 0){
      // update pre Item Links
      temp = items[itemIndex].optionsHead;
      items[itemIndex].optionsHead = options[preItem2Index].nextOption;
      options[preItem2Index].nextOption = temp;
    }
    else{
      temp = options[preItem1Index].nextOption;
      options[preItem1Index].nextOption = options[preItem2Index].nextOption;
      options[preItem2Index].nextOption = temp;
    }

    //update item links
    temp = options[item1Index].nextOption;
    options[item1Index].nextOption = options[item2Index].nextOption;
    options[item2Index].nextOption = temp;
  }

  // =============================== End Swapping Order ===============================================

  // =============================== Other ===============================================

  // integers is uint[] calldata itemIds, uint[] calldata optionIds, uint[] calldata extraFlags, uint[] calldata extraIds
  function getOrderPrice(uint[] memory integers, uint itemCount) public view returns (uint){
      uint price = 0;
      for(uint i = 0; i < itemCount; i++){

        // get item/option price
        (uint index, bool found) = getItemMappingIndex(integers[i]);
        require(found == true, "item index out of range");
        (index, found) = getOptionMappingIndex(items[index].optionsHead,integers[i+itemCount]);
        require(found == true, "option index out of range");
        price += options[index].optionPrice;

        // get extras total
        uint extrasIdsIndex = 0;
        for(uint j = 0; j < integers[i+itemCount*2]; j++){
          price += extras[integers[extrasIdsIndex+itemCount*3]].extraPrice;
          extrasIdsIndex ++;
        }
      }
      return price;
  }

}