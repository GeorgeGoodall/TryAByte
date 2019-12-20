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
  }

  struct Option{
    uint nextOption; 
    bytes32 optionName;
    uint optionPrice;
  }

  uint public itemHead = 0;
  uint public optionsHead = 0;
  mapping (uint => Option) public options;
  mapping (uint => Item) public items;

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

  //needed for external contract access to struct
  function getEntry(uint _id) public view returns (bytes32,bytes32,bytes32[] memory,uint[] memory){
    uint itemIndex = itemHead;
    
    for(uint i = 0; i < _id; i++){
      itemIndex = items[itemIndex].nextItem;
    }

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
    return (itemToReturn.itemName,itemToReturn.description,optionNamesToReturn,optionPricesToReturn);
  }

  // add item at index needs doing
  function addEntry(uint addAtIndex, bytes32 _itemName,bytes32 _itemDescription, bytes32[] memory _optionNames, uint[] memory _optionPrices) public returns (bool){
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
      item = Item(itemHead,_itemName,_itemDescription,optionsHead);
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
      item = Item(items[insertAfter].nextItem,_itemName,_itemDescription,optionsHead); // 582

      length++; // 5237
      items[length] = item; // 80375
      items[insertAfter].nextItem = length; //5394
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

  function addOption(uint itemId, uint addAtIndex, bytes32 _optionName, uint _optionPrice) public returns(bool){
    require(msg.sender == owner, "you are not the owner of this menu");

    Option memory option;

    uint itemIndex = itemHead;
    for(uint i = 0; i < itemId; i++){
      itemIndex = items[itemIndex].nextItem;
    }

    if(addAtIndex == 0){
      option = Option(items[itemIndex].optionsHead,_optionName,_optionPrice);
      optionsHead++;
      options[optionsHead] = option;
      items[itemIndex].optionsHead = optionsHead;
    }

    else{
      // get the pointer of the item currently at the index
      uint insertAfter = items[itemIndex].optionsHead;
      for(uint i = 0; i < addAtIndex + 1; i++){
        uint index = options[insertAfter].nextOption;
        if(index == 0)
          break; // if you hit the end of the list, just add it to the end
        insertAfter = index;
      }
      option = Option(options[insertAfter].nextOption,_optionName,_optionPrice);

      optionsHead++;
      options[optionsHead] = option;

      options[insertAfter].nextOption = optionsHead;
    }



  }

  function removeOption(uint itemId, uint optionId) public returns(bool){
    require(msg.sender == owner, "you are not the owner of this menu");

    uint itemIndex = itemHead;
    for(uint i = 0; i < itemId; i++){
      itemIndex = items[itemIndex].nextItem;
    }

    uint optionToUpdate = items[itemIndex].optionsHead;

    if(optionId == 0){
     uint newOptionsHead = options[optionToUpdate].nextOption;
     delete options[optionToUpdate];
     items[itemIndex].optionsHead = newOptionsHead;
     return true;
    }

    for(uint i = 0; i < optionId - 1; i++){
      optionToUpdate = options[optionToUpdate].nextOption;
    }
    uint optionToDelete = options[optionToUpdate].nextOption;
    options[optionToUpdate].nextOption = options[optionToDelete].nextOption;
    delete options[optionToDelete];
    return true;
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


  // toDo
  function addMultipleItems(uint[] memory addAtIndex, bytes32[] memory itemNames, bytes32[] memory itemDescriptions, bytes32[] memory _optionNames, uint[] memory _prices, uint[] memory optionFlags) public {
    require(msg.sender == owner, "you are not the owner");
    require(addAtIndex.length == itemNames.length, "the number of item indexes and item names do not match");
    require(itemNames.length == itemDescriptions.length, "the number of descriptions and item names do not match");
    require(_optionNames.length == _prices.length, "the number of options and prices do not match");
    require(itemNames.length == optionFlags.length, "the number of item names and option flags do not match");
    uint optionFlagsSum = 0;
    for(uint i = 0; i < optionFlags.length; i++){
        optionFlagsSum += optionFlags[i];
    }
    require(_optionNames.length == optionFlagsSum, "the number of options and the sum of the option flags do not match");


    uint optionIndex = 0;
    bytes32[] memory optionNames;
    uint[] memory prices;

    for(uint i = 0; i < optionFlags.length; i++){

        optionNames = new bytes32[](optionFlags[i]);
        prices = new uint[](optionFlags[i]);
        
        //ToDo: need to require that the total number of options for an item is less than the options array limit, or have the limit increase when it is exceeded

        for(uint j = 0; j < optionFlags[i]; j++){
            optionNames[j] = _optionNames[optionIndex];
            prices[j] = _prices[optionIndex];
            optionIndex++;
        }

        addEntry(addAtIndex[i], itemNames[i], itemDescriptions[i], optionNames, prices);
    }

  }

  function addMultipleOptions(uint[] memory itemIds, uint[] memory addAtIndexs, bytes32[] memory _optionNames, uint[] memory _prices) public {
    require(msg.sender == owner, "you are not the owner");
    require(itemIds.length == addAtIndexs.length, "the number of itemIds and indexes to insert at are not the same");
    require(_optionNames.length == _prices.length, "the number of options does not match the number of prices");
    require(_optionNames.length == itemIds.length, "the number of itemIDs does not match the number of optionNames");

    for(uint i = 0; i < itemIds.length; i++){
      addOption(itemIds[i], addAtIndexs[i], _optionNames[i],_prices[i]);
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

  function removeMultipleOptions(uint[] memory itemIds, uint[] memory optionIds, uint[] memory flags) public {
    uint optionIdsIndex = 0;
    for(uint i = 0; i < itemIds.length; i++){
      for(int j = int(flags[i] - 1); j >= 0; j--){
        removeOption(itemIds[i],optionIds[optionIdsIndex+uint(j)]);
      }
      optionIdsIndex+=flags[i];
    }
  }

  function reorderItems() public {

  }

  function reorderOptions() public {

  }

}