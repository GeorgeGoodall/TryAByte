pragma solidity ^0.5.0;

library menuHelper {

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

   struct menuStruct{
    uint itemHead;
    uint optionsHead;
    uint extraHead;
    mapping (uint => Option) options;
    mapping (uint => Item) items;
    mapping (uint => Extra) extras;
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

  function getOptionMappingIndex(menuStruct storage self, uint itemId, uint optionId) internal view returns (uint, bool){
  	(uint itemIndex,bool found) = getItemMappingIndex(self,itemId);
  	uint optionMappingIndex = self.items[itemIndex].optionsHead;

    for(uint i = 0; i < optionId; i++){
      optionMappingIndex = self.options[optionMappingIndex].nextOption;
      if(optionMappingIndex == 0)
        return (0,false);
    }
    return (optionMappingIndex,true);
  }

}