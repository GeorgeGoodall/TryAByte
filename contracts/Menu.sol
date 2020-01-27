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
  
  menuHelper.menuStruct public menu;

  constructor(address _owner) public{
    owner = _owner;
    menu.optionsHead = 1;
    menu.extraHead = 1;
  }

  function getExtra(uint _id) public view returns (bytes32, uint, bool){
    return (menu.extras[_id].extraName,menu.extras[_id].extraPrice,menu.extras[_id].active);
  }

  function getOption(uint _id) public view returns (bytes32, uint, bool){
    return (menu.options[_id].optionName,menu.options[_id].optionPrice,menu.options[_id].active);
  }

  function length() public view returns (uint){
    return menu.itemTop;
  }

  function getMenuLength() public view returns (uint){
    return menu.length();
  }

  //needed for external contract access to struct
  function getEntry(uint _id) public view returns (bytes32,bytes32,uint[] memory, uint[] memory){
    return menu.getEntry(_id);
  }

  //needed for external contract access to struct
  function getOrderItem(uint itemId, uint optionId, uint[] memory extraIds) public view returns (bytes32, bytes32, bytes32, uint, bytes32[] memory, uint[] memory){
    return menu.getOrderItem(itemId,optionId,extraIds);
  }

  //needed for external contract access to struct
  function getEntryIndexingInfo(uint _id) public view returns (uint nextitem){
    return menu.getEntryIndexingInfo(_id);
  }

  function getItemHead() public view returns (uint nextitem){
    return menu.getItemHead();
  }

// =============================== unpack function to allow menu updates with one call ===============================================


  function updateMenu(uint[] memory integers, uint[] memory integersFlags, bytes32[] memory strings, uint[] memory stringsFlags) public returns (bool){
    require(msg.sender == owner);
    menu.updateMenu(integers, integersFlags, strings, stringsFlags);
  }

// =============================== END unpack function to allow menu updates with one call ===============================================

// =============================== menu.ITEMS ===============================================

  function addMultipleItems(uint[] memory addAtIndex, bytes32[] memory itemNames, bytes32[] memory itemDescriptions) public {
    require(msg.sender == owner);
    menu.addMultipleItems(addAtIndex, itemNames, itemDescriptions);
  }

  function removeMultipleItems(uint[] memory itemIds) public {
    require(msg.sender == owner);
    menu.removeItems(itemIds);
  }

// =============================== END menu.ITEMS ===============================================

// =============================== menu.OPTIONS ===============================================

  function addOptions(bytes32[] memory _optionNames, uint[] memory _prices) public {
    require(msg.sender == owner);
    menu.addOptions(_optionNames, _prices);
  }


  function setOptionsInactive(uint[] memory optionIds) public {
    menu.setOptionsInactive(optionIds);
  }

  function assignOptions(uint[] memory _itemIds, uint[] memory optionIds, uint[] memory flags) public {
    require(msg.sender == owner);
    menu.assignOptions(_itemIds, optionIds, flags);
  }

  function unassignOptions(uint[] memory _itemIds, uint[] memory optionIds, uint[] memory flags) public {
    require(flags.length == _itemIds.length);
    menu.unassignOptions(_itemIds, optionIds, flags);
  }

// =============================== END menu.OPTIONS ===============================================

// =============================== menu.EXTRAS ===============================================

  function addExtras(bytes32[] memory extraNames, uint[] memory extraPrice) public {
    require(msg.sender == owner);
    menu.addExtras(extraNames, extraPrice);
  }

  function setExtrasInactive(uint[] memory _ids) public {
    require(msg.sender == owner);
    menu.setExtrasInactive(_ids);
  }

  function assignExtras(uint[] memory _itemIds, uint[] memory _extrasIds, uint[] memory flags) public {
    require(msg.sender == owner);
    menu.assignExtras(_itemIds, _extrasIds, flags);
  }

  function unassignExtras(uint[] memory _itemIds, uint[] memory _extrasIds, uint[] memory flags) public {
    require(flags.length == _itemIds.length);
    menu.unassignExtras(_itemIds, _extrasIds, flags);
  }

// =============================== END menu.EXTRAS ===============================================

// =============================== changing order ===============================================
  // needs doing and implementing

  // function reorderItems() public {

  // }

  // function reorderOptions() public {

  // }

  function swapItems(uint index1, uint index2) public {
    require(msg.sender == owner, "you are not the owner of this menu");
    menu.swapItems(index1, index2);
  }

  function swapOptions(uint _id, uint index1, uint index2) public {
    require(msg.sender == owner, "you are not the owner of this menu");
    menu.swapOptions(_id, index1, index2);
  }

// =============================== End Swapping Order ===============================================

// =============================== Other ===============================================

  //integers is uint[] calldata itemIds, uint[] calldata optionIds, uint[] calldata extraFlags, uint[] calldata extraIds
  function getOrderPrice(uint[] memory integers, uint itemCount) public view returns (uint){
      uint price = 0;
      for(uint i = 0; i < itemCount; i++){

        // get item/option price
        (uint index, bool found) = menu.getItemMappingIndex(integers[i]);
        require(found == true);

        price += menu.options[integers[i+itemCount]].optionPrice;

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