pragma solidity ^0.5.0;

contract Menu {

  //event AddEntry(bytes32 head,uint number,bytes32 name,bytes32 next);


  address owner;
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

  constructor() public{
    owner = msg.sender;
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


    if(addAtIndex == 0){
      option = Option(items[itemId].optionsHead,_optionName,_optionPrice);
      optionsHead++;
      options[optionsHead] = option;
      items[itemId].optionsHead = optionsHead;
    }

    else{
      // get the pointer of the item currently at the index
      uint insertAfter = items[itemId].optionsHead;
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

    uint optionToUpdate = items[itemId].optionsHead;

    if(optionId == 0){
     uint newOptionsHead = options[optionToUpdate].nextOption;
     delete options[optionToUpdate];
     items[itemId].optionsHead = newOptionsHead;
     return true;
    }

    for(uint i = 0; i < optionId - 1; i++){
      optionToUpdate = options[optionToUpdate].nextOption;
    }
    uint optionToDelete = options[optionToUpdate].nextOption;
    options[optionToUpdate].nextOption = options[optionToDelete].nextOption;
    delete options[optionToDelete];
    length--;
    return true;
  }

  //needed for external contract access to struct
  function getEntry(uint _id) public returns (bytes32,bytes32,bytes32[] memory,uint[] memory){
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

  function swapOptions(){

  }

  function addMultipleItems(uint addAtIndex, bytes32[] memory itemNames, bytes32[] memory itemDescriptions, bytes32[] memory _optionNames, uint[] memory _prices, uint[] memory optionFlags) public {
    // add items 
  }

  function addMultipleOptions() public {

  }

}