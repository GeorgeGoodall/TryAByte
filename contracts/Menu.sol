pragma solidity ^0.5.0;

import "./menuHelper.sol";
import "./uintArrayExtension.sol";
import "./bytes32ArrayExtension.sol";

contract Menu {

  using menuHelper for menuHelper.menuStruct;
  using uintArrayExtension for uint[];
  using bytes32ArrayExtension for bytes32[];

  //event AddEntry(bytes32 head,uint number,bytes32 name,bytes32 next);
  event addOptionEvent(uint itemId, uint addAtIndex, bytes32 optionName, uint optionPrice);
  event debug(string message);
  event debuguint(uint number);

  address public owner;
  uint public length = 0;//also used as nonce

  menuHelper.menuStruct public menu;

  constructor(address _owner) public{
    owner = _owner;
  }

  function getMenuLength() public view returns (uint){
    uint itemIndex = menu.itemHead;
    uint menuLength = 0;

    while(itemIndex != 0){
      itemIndex = menu.items[itemIndex].nextItem;
      menuLength++;
    }

    return menuLength;
  }

  //needed for external contract access to struct
  function getEntry(uint _id) public view returns (bytes32,bytes32,bytes32[] memory,uint[] memory, uint[] memory){
    (uint itemIndex, bool found) = menu.getItemMappingIndex(_id);
    require(found == true, "index out of range");

    menuHelper.Item memory itemToReturn = menu.items[itemIndex];

    bytes32[] memory optionNamesToReturn;
    uint[] memory optionPricesToReturn;
    uint counter = 0;
    uint optionCount = 0;
    uint index = itemToReturn.optionsHead;
    while(index != 0){
      index = menu.options[index].nextOption;
      optionCount++;
    }
    optionNamesToReturn = new bytes32[](optionCount);
    optionPricesToReturn = new uint[](optionCount);

    index = itemToReturn.optionsHead;

    while(index != 0){
      optionNamesToReturn[counter] = menu.options[index].optionName;
      optionPricesToReturn[counter] = menu.options[index].optionPrice;
      counter++;
      index = menu.options[index].nextOption;
    }

    return (itemToReturn.itemName,itemToReturn.description,optionNamesToReturn,optionPricesToReturn, itemToReturn.extrasIds);
  }

  // =============================== unpack function to allow menu updates with one call ===============================================

  // this function will
    // remove menu.extras  [indexes int] 1
    // add menu.extras     [names string, prices int] 2
    // remove menu.items   [itemindexes int] 1
    // add menu.items      [addAtIndex int, itemnames sting, itemDescription string, optionnames string, price int, optionFlags int, extraIds int, extraFlags int] 2
    // remove menu.options [itemIdss int, optionids int, flags int] 1
    // add menu.options    [itemids int, addAtIndex int, optionNames string, _prices] 2
    // unassign menu.extras[itemids int, extrasids int, flags int] 1
    // assign menu.extras  [itemids int, extrasids int, flags int] 1
    // update prices <-- needs doing



function updateMenu(uint[] memory integers, uint[] memory integersFlags, bytes32[] memory strings, uint[] memory stringsFlags) public returns (bool){
    uint integerIndex = 0;
    uint stringIndex = 0;

    uint[] memory ints_1;
    uint[] memory ints_2;
    uint[] memory ints_3;
    bytes32[] memory str_1;


    // remove menu.extras
    ints_1 = integers.getPartition(integerIndex,integersFlags[0]);
    integerIndex += integersFlags[0];
    setExtrasInactive(ints_1);

    // add menu.extras
    str_1 = strings.getPartition(stringIndex,stringsFlags[0]);
    stringIndex += stringsFlags[0];

    ints_2 = integers.getPartition(integerIndex,integersFlags[1]);
    integerIndex += integersFlags[1];
    addExtras(str_1,ints_2);

    // remove menu.items
    ints_1 = integers.getPartition(integerIndex,integersFlags[2]);
    integerIndex += integersFlags[2];
    removeMultipleItems(ints_1);

    // add menu.items [addAtIndex int, itemnames sting, itemDescription string, optionnames string, price int, optionFlags int, extraIds int, extraFlags int]
    // addAtIndex
    ints_1 = integers.getPartition(integerIndex,integersFlags[3]+integersFlags[4]+integersFlags[5]+integersFlags[6]+integersFlags[7]);
    integerIndex = integerIndex + integersFlags[3]+integersFlags[4]+integersFlags[5]+integersFlags[6]+integersFlags[7];
    ints_2 = integersFlags.getPartition(3,5);
    str_1 = strings.getPartition(stringIndex,stringsFlags[1]+stringsFlags[2]+stringsFlags[3]);
    stringIndex = stringIndex+stringsFlags[1]+stringsFlags[2]+stringsFlags[3];
    ints_3 = stringsFlags.getPartition(1,3);
    addMultipleItemsUnpackInputs(ints_1, ints_2, str_1, ints_3);

    // remove menu.options
    // itemIds
    ints_1 = integers.getPartition(integerIndex,integersFlags[8]);
    integerIndex += integersFlags[8];

    // optionIds
    ints_2 = integers.getPartition(integerIndex,integersFlags[9]);
    integerIndex += integersFlags[9];

    // flags
    ints_3 = integers.getPartition(integerIndex,integersFlags[10]);
    integerIndex += integersFlags[10];
    removeMultipleOptions(ints_1,ints_2,ints_3);

    // add menu.options [itemids int, addAtIndex int, optionNames string, _prices]
    ints_1 = integers.getPartition(integerIndex,integersFlags[11]);
    integerIndex += integersFlags[11];

    ints_2 = integers.getPartition(integerIndex,integersFlags[12]);
    integerIndex += integersFlags[12];

    str_1 = strings.getPartition(stringIndex,stringsFlags[4]);
    stringIndex += stringsFlags[4];

    ints_3 = integers.getPartition(integerIndex,integersFlags[13]);
    integerIndex += integersFlags[13];
    addMultipleOptions(ints_1, ints_2, str_1, ints_3);

    // unassign menu.extras[itemids int, extrasids int, flags int] 1
   ints_1 = integers.getPartition(integerIndex,integersFlags[14]);
    integerIndex += integersFlags[14];

    ints_2 = integers.getPartition(integerIndex,integersFlags[15]);
    integerIndex += integersFlags[15];

    ints_3 = integers.getPartition(integerIndex,integersFlags[16]);
    integerIndex += integersFlags[16];
    unassignExtras(ints_1,ints_2,ints_3);


    // assign menu.extras  [itemids int, extrasids int, flags int] 1
    ints_1 = integers.getPartition(integerIndex,integersFlags[17]);
    integerIndex += integersFlags[17];

    ints_2 = integers.getPartition(integerIndex,integersFlags[18]);
    integerIndex += integersFlags[18];

    ints_3 = integers.getPartition(integerIndex,integersFlags[19]);
    integerIndex += integersFlags[19];
    assignExtras(ints_1,ints_2,ints_3);

  }

  // =============================== END unpack function to allow menu updates with one call ===============================================

  // =============================== menu.ITEMS ===============================================

  // toDo
  function addMultipleItemsUnpackInputs(uint[] memory integers, uint[] memory integersFlags, bytes32[] memory strings, uint[] memory stringsFlags) public {

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

    ints_1 = integers.getPartition(integerIndex,integersFlags[0]);
    integerIndex += integersFlags[0];

    //itemNames
    str_1 = strings.getPartition(stringIndex,stringsFlags[0]);
    stringIndex += stringsFlags[0];

    //itemDescriptions
    str_2 = strings.getPartition(stringIndex,stringsFlags[1]);
    stringIndex += stringsFlags[1];

    // optionNames
    str_3 = strings.getPartition(stringIndex,stringsFlags[2]);
    stringIndex += stringsFlags[2];

    // price
    ints_2 = integers.getPartition(integerIndex,integersFlags[1]);
    integerIndex += integersFlags[1];

    // optionFlags
    ints_3 = integers.getPartition(integerIndex,integersFlags[2]);
    integerIndex += integersFlags[2];

    ints_4 = integers.getPartition(integerIndex,integersFlags[3]);
    integerIndex += integersFlags[3];

    ints_5 = integers.getPartition(integerIndex,integersFlags[4]);
    integerIndex += integersFlags[4];

    addMultipleItems(ints_1, str_1, str_2, str_3, ints_2, ints_3, ints_4, ints_5);
  }


  function addMultipleItems(uint[] memory addAtIndex, bytes32[] memory itemNames, bytes32[] memory itemDescriptions, bytes32[] memory _optionNames, uint[] memory _prices, uint[] memory optionFlags, uint[] memory _extrasIds, uint[] memory extrasFlags) public {
    require(msg.sender == owner, "you are not the owner");
    require(addAtIndex.length == itemNames.length, "the number of item indexes and item names do not match");
    require(itemNames.length == itemDescriptions.length, "the number of descriptions and item names do not match");
    require(_optionNames.length == _prices.length, "the number of menu.options and prices do not match");
    require(itemNames.length == optionFlags.length, "the number of item names and option flags do not match");
    require(itemNames.length == extrasFlags.length, "the number of item names and menu.extras flags do not match");
    uint optionFlagsSum = 0;
    for(uint i = 0; i < optionFlags.length; i++){
        optionFlagsSum += optionFlags[i];
    }
    require(_optionNames.length == optionFlagsSum, "the number of menu.options and the sum of the option flags do not match");


    uint optionIndex = 0;
    bytes32[] memory optionNames;
    uint[] memory prices;

    uint extrasIndex = 0;
    uint[] memory extraIds;

    for(uint i = 0; i < optionFlags.length; i++){

        optionNames = new bytes32[](optionFlags[i]);
        prices = new uint[](optionFlags[i]);
        
        //ToDo: need to require that the total number of menu.options for an item is less than the menu.options array limit, or have the limit increase when it is exceeded

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
    require(_optionNames.length == _optionPrices.length, "the number of menu.options does not match the number of prices"); // 28


    // add the menu.options
    // having a next of 0 informs my code that we are at the end of this list
    menuHelper.Option memory option = menuHelper.Option(0,_optionNames[0],_optionPrices[0]); // 252
    menu.optionsHead++; // 237
    menu.options[menu.optionsHead] = option; //40554


    //2918775 - 2796277 (three)
    for(uint i = 1; i < _optionNames.length; i++){
      option = menuHelper.Option(menu.optionsHead,_optionNames[i],_optionPrices[i]); // 377
      menu.optionsHead++; // 437
      menu.options[menu.optionsHead] = option; // 60354
    }

    menuHelper.Item memory item; // 137
    if(addAtIndex == 0){ //26
      item = menuHelper.Item(menu.itemHead,_itemName,_itemDescription,menu.optionsHead, extraIds);
      length++;
      menu.items[length] = item;
      menu.itemHead = length;
    }
    else{
      uint insertAfter = menu.itemHead; // 237
      for(uint i = 1;i < addAtIndex; i++){
        uint index = menu.items[insertAfter].nextItem; // 295
        if(index == 0) // 26
          break; // if you hit the end of the list, just add it to the end
        insertAfter = index; // 69
      }
      item = menuHelper.Item(menu.items[insertAfter].nextItem,_itemName,_itemDescription,menu.optionsHead,extraIds); // 582

      length++; // 5237
      menu.items[length] = item; // 80375
      menu.items[insertAfter].nextItem = length; //5394
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
     uint newItemHead = menu.items[menu.itemHead].nextItem;
     delete menu.items[menu.itemHead];
     menu.itemHead = newItemHead;
     return true;
    }


    uint itemToUpdate = menu.itemHead;
    for(uint i = 0; i < itemId - 1; i++){
      itemToUpdate = menu.items[itemToUpdate].nextItem;
    }
    uint itemToDelete = menu.items[itemToUpdate].nextItem;
    menu.items[itemToUpdate].nextItem = menu.items[itemToDelete].nextItem;
    return true;
  }

  // =============================== END menu.ITEMS ===============================================

  // =============================== menu.OPTIONS ===============================================

  function addMultipleOptions(uint[] memory itemIds, uint[] memory addAtIndexs, bytes32[] memory _optionNames, uint[] memory _prices) public {
    require(msg.sender == owner, "you are not the owner");
    require(itemIds.length == addAtIndexs.length, "the number of itemIds and indexes to insert at are not the same");
    require(_optionNames.length == _prices.length, "the number of menu.options does not match the number of prices");
    require(_optionNames.length == itemIds.length, "the number of itemIDs does not match the number of optionNames");

    for(uint i = 0; i < itemIds.length; i++){
      addOption(itemIds[i], addAtIndexs[i], _optionNames[i],_prices[i]);
    }
  }

  // adding at index > 0 puts it at the end, index == 0 puts it at 0
  function addOption(uint itemId, uint addAtIndex, bytes32 _optionName, uint _optionPrice) public returns(bool){
    require(msg.sender == owner, "you are not the owner of this menu");

    menuHelper.Option memory option;

    (uint itemIndex, bool foundItem) = menu.getItemMappingIndex(itemId);
    require(foundItem == true, "index out of range");

    if(addAtIndex == 0){
      option = menuHelper.Option(menu.items[itemIndex].optionsHead,_optionName,_optionPrice);
      menu.optionsHead++;
      menu.options[menu.optionsHead] = option;
      menu.items[itemIndex].optionsHead = menu.optionsHead;
    }

    else{
      // get the pointer of the item currently at the index
      (uint insertAfter,bool foundOption) = menu.getOptionMappingIndex(itemIndex,addAtIndex);
      if(!foundOption)
        insertAfter = 0;

      option = menuHelper.Option(menu.options[insertAfter].nextOption,_optionName,_optionPrice);

      menu.optionsHead++;
      menu.options[menu.optionsHead] = option;

      menu.options[insertAfter].nextOption = menu.optionsHead;
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

    (uint itemIndex, bool found) = menu.getItemMappingIndex(itemId);
    require(found == true, "index out of range");

    uint optionToUpdate = menu.items[itemIndex].optionsHead;

    if(optionId == 0){
     uint newOptionsHead = menu.options[optionToUpdate].nextOption;
     delete menu.options[optionToUpdate];
     menu.items[itemIndex].optionsHead = newOptionsHead;
     return true;
    }

    (optionToUpdate, found) = menu.getOptionMappingIndex(itemIndex,optionId - 1);
    require(found == true, "option index out of range");
    
    uint optionToDelete = menu.options[optionToUpdate].nextOption;
    menu.options[optionToUpdate].nextOption = menu.options[optionToDelete].nextOption;
    delete menu.options[optionToDelete];
    return true;
  }

  // =============================== END menu.OPTIONS ===============================================

  // =============================== menu.EXTRAS ===============================================

  // should improve this storage method
  function addExtras(bytes32[] memory extraNames, uint[] memory extraPrice) public {
    require(extraNames.length == extraPrice.length, "the count of the params dont match");
    for(uint i = 0; i < extraNames.length; i++){
      menu.extras[menu.extraHead] = menuHelper.Extra(extraNames[i],extraPrice[i],true);
      menu.extraHead++;
    }
  }

  // ToDo: check that the menu.extras dont belong to any menu.items
  function setExtrasInactive(uint[] memory _ids) public {
    for(uint i = 0; i < _ids.length; i++){
       menu.extras[_ids[i]].active = false;
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
    require(flagSum == _extrasIds.length, "the flags are inconsistent with the menu.extras passed in");
    
    uint extrasIndex = 0;
    for(uint i = 0; i < flags.length; i++){
      (uint itemIndex, bool found) = menu.getItemMappingIndex(_itemIds[i]);
      require(found == true, "index out of range");

      for(uint j = 0; j < flags[i]; j++){
        // add extra j to item i
        menu.items[itemIndex].extrasIds.push(_extrasIds[extrasIndex]);
        extrasIndex++;
      }
    }
  }

  // ToDo, change menu.extras to a list structure so propper deletion can be done
  function unassignExtras(uint[] memory _itemIds, uint[] memory _extrasIds, uint[] memory flags) public {
    require(flags.length == _itemIds.length, "inconsistent number of flags and item ids");
    uint flagSum = 0;
    for(uint i = 0; i < flags.length; i++){
      flagSum += flags[i];
    }
    require(flagSum == _extrasIds.length, "the flags are inconsistent with the menu.extras passed in");
    
    uint extrasIndex = 0;
    for(uint i = 0; i < flags.length; i++){
      (uint itemIndex, bool found) = menu.getItemMappingIndex(_itemIds[i]);
      require(found == true, "index out of range");

      // for each extra id
      for(uint j = 0; j < flags[i]; j++){
        // for each extra in the item
        for(uint k = 0; k < menu.items[itemIndex].extrasIds.length; k++){
          if(menu.items[itemIndex].extrasIds[k] == _extrasIds[extrasIndex]){
            menu.items[itemIndex].extrasIds[k] = 9999; // TODO: should remove element instead of putting in a placholder
            extrasIndex++;
            break;
          }
        }
      }
    }
  }

  // =============================== END menu.EXTRAS ===============================================

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

    uint itemIndex = menu.itemHead;
    for(uint i = 0; i <= index2; i++){
      if(i == index1)
        item1Index = itemIndex;
      if(i == index1 - 1)
        preItem1Index = itemIndex;
      if(i == index2)
        item2Index = itemIndex;
      if(i == index2 - 1)
        preItem2Index = itemIndex;

      itemIndex = menu.items[itemIndex].nextItem;
    }

    uint temp;
    if(index1 == 0){
      // update pre Item Links
      temp = menu.itemHead;
      menu.itemHead = menu.items[preItem2Index].nextItem;
      menu.items[preItem2Index].nextItem = temp;
    }
    else{
      temp = menu.items[preItem1Index].nextItem;
      menu.items[preItem1Index].nextItem = menu.items[preItem2Index].nextItem;
      menu.items[preItem2Index].nextItem = temp;
    }

    //update item links
    temp = menu.items[item1Index].nextItem;
    menu.items[item1Index].nextItem = menu.items[item2Index].nextItem;
    menu.items[item2Index].nextItem = temp;
  }

  function swapOptions(uint _id, uint index1, uint index2) public {
    require(msg.sender == owner, "you are not the owner of this menu");
    require(index1 < index2, "index 1 must be smaller than index 2");

    uint itemIndex = menu.itemHead;
    for(uint i = 0; i < _id; i++){
      itemIndex = menu.items[itemIndex].nextItem;
    }

    uint item1Index;
    uint item2Index;

    uint preItem1Index;
    uint preItem2Index;

    uint optionIndex = menu.items[itemIndex].optionsHead;
    for(uint i = 0; i <= index2; i++){
      if(i == index1)
        item1Index = optionIndex;
      if(i == index1 - 1)
        preItem1Index = optionIndex;
      if(i == index2)
        item2Index = optionIndex;
      if(i == index2 - 1)
        preItem2Index = optionIndex;

      optionIndex = menu.options[optionIndex].nextOption;
    }

    uint temp;
    if(index1 == 0){
      // update pre Item Links
      temp = menu.items[itemIndex].optionsHead;
      menu.items[itemIndex].optionsHead = menu.options[preItem2Index].nextOption;
      menu.options[preItem2Index].nextOption = temp;
    }
    else{
      temp = menu.options[preItem1Index].nextOption;
      menu.options[preItem1Index].nextOption = menu.options[preItem2Index].nextOption;
      menu.options[preItem2Index].nextOption = temp;
    }

    //update item links
    temp = menu.options[item1Index].nextOption;
    menu.options[item1Index].nextOption = menu.options[item2Index].nextOption;
    menu.options[item2Index].nextOption = temp;
  }

  // =============================== End Swapping Order ===============================================

  // =============================== Other ===============================================

  // integers is uint[] calldata itemIds, uint[] calldata optionIds, uint[] calldata extraFlags, uint[] calldata extraIds
  function getOrderPrice(uint[] memory integers, uint itemCount) public view returns (uint){
      uint price = 0;
      for(uint i = 0; i < itemCount; i++){

        // get item/option price
        (uint index, bool found) = menu.getItemMappingIndex(integers[i]);
        require(found == true, "item index out of range");
        (index, found) = menu.getOptionMappingIndex(index,integers[i+itemCount]);
        require(found == true, "option index out of range");
        price += menu.options[index].optionPrice;

        // get menu.extras total
        uint extrasIdsIndex = 0;
        for(uint j = 0; j < integers[i+itemCount*2]; j++){
          price += menu.extras[integers[extrasIdsIndex+itemCount*3]].extraPrice;
          extrasIdsIndex ++;
        }
      }
      return price;
  }

}