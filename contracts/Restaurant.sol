pragma solidity ^0.5.0;

 //import "./lib.sol";
 import "./Order.sol";
 import "./RestaurantFactory.sol";
 import "./CustomerFactory.sol";
 import "./Controller.sol";

contract Restaurant {

    // additional variables to add

	uint public id;
	bytes32 public name; 

	bytes public location; 
    uint public longitude; 
    uint public latitude; 

    bytes public logoURI; 
    bytes32 public logoHash; 


	bytes32 public contactNumber; 

	address payable public owner; 
    address public controllerAddress;
	address public restaurantFactoryAddress;


    struct order{bool open; address orderAddress;}
	uint public totalOrders;
    // todo: make orders private and accessed via method for only rider and restaurant
	mapping(uint => order) public orders; // must be a better way to store the orders

    uint totalPay;
	
	// struct Item{
	// 	bytes32 itemName;
 //        bytes32 description;
 //        bytes32[] options;
	// 	uint[] optionsCost; // in wei (10^-18 Eth)
 //        uint optionsCount;
	// }
	
    uint public menuLength;
	mapping(uint => Item) public menu;
    uint[60] private menuIndexes;
    uint private menuMappingLength;

    enum restaurantState{acceptedOrder, preparingCargo, readyForCollection, HandedOver}
	
    event OrderMadeEvent(address orderAddress);
    event MenuUpdated();

	constructor(address _controller, address payable _owner, 
                uint _id, bytes32 _name, 
                bytes memory _address, uint _latitude, uint _longitude, 
                bytes32 _contactNumber
                ) public {
        // itemOptions and prices will have to be parsed as they are 2d arrays
		id = _id;
		name = _name;
		
        location = _address;
        latitude = _latitude;
        longitude = _longitude;

		contactNumber = _contactNumber;
		totalOrders = 0;
        totalPay = 0;

        menuLength = 0;
        menuMappingLength = 0;

        controllerAddress = _controller;
		owner = _owner;
		restaurantFactoryAddress = msg.sender;
	}

    function getMenuItem(uint index) public view returns(bytes32 itemName, bytes32 itemDescription, bytes32[] memory optionNames, uint[] memory optionPrices, uint optionsCount){
        require(index < menuLength, "index out of bounds");
        // this needs modifying to only return indexes that are within the menulength
        Item memory i = menu[menuIndexes[index]];
        return (i.itemName, i.description, i.options, i.optionsCost, i.optionsCount);
    }

    function updateLogo(bytes calldata imageURI, bytes32 imageHash) external{
        require(msg.sender == owner);
        logoURI = imageURI;
        logoHash = imageHash;
    }

    // ToDo Remove this
    function getMenuLength() external view returns(uint length){
        return menuLength;
    }
    
    // menuIndex
    // itemType
    // uint new prices
    // byte32 new text

    function updateMenu(bytes32[] memory itemNames, bytes32[] memory itemDescriptions, bytes32[] memory _optionNames, uint[] memory _prices, uint[] memory optionFlags,uint[] memory itemsToRemove, uint[] memory optionsToRemove, uint[] memory optionsToRemoveFlags,uint[] memory itemIds, bytes32[] memory _addOptionNames, uint[] memory _addPrices, uint[] memory addOptionFlags) 
    public {
        require(msg.sender == owner, "you are not the owner");
        // also need the ability to swap item and option indexes,
        // also need the ability to modify item and option names and prices
        if(itemIds.length > 0) //add options should be able to add an option at any index
            menuAddOptions(itemIds, _addOptionNames, _addPrices, addOptionFlags);
        if(itemNames.length > 0)
            menuAddItems(itemNames,itemDescriptions,_optionNames,_prices,optionFlags);
        if(itemsToRemove.length > 0)
            menuRemoveItems(itemsToRemove,optionsToRemove,optionsToRemoveFlags);
    }



    function menuRemoveItems(uint[] memory itemsToRemove, uint[] memory optionsToRemove, uint[] memory optionsToRemoveFlags) public {
        require(msg.sender == owner, "you are not the owner");
        require(itemsToRemove.length == optionsToRemoveFlags.length, "the number of items to remove and the number of optionsToRemoveFlags do not match");
        for(uint itemsToRemoveIndex = 0; itemsToRemoveIndex < itemsToRemove.length; itemsToRemoveIndex++){
            require(itemsToRemove[itemsToRemoveIndex] < menuIndexes.length, "you have requested to delete an index that is out of range");
        }
        uint optionsToRemoveFlagsSum = 0;
        for(uint optionsToRemoveFlagsIndex = 0; optionsToRemoveFlagsIndex < optionsToRemoveFlags.length; optionsToRemoveFlagsIndex++){
            optionsToRemoveFlagsSum += optionsToRemoveFlags[optionsToRemoveFlagsIndex];
        }
        require(optionsToRemove.length == optionsToRemoveFlagsSum, "the number of options to remove and the sum of the options to remove flags do not match");
        // ToDo: add require that checks to make sure the option index isn't out of range


        // remove from menu 
        uint optionsToRemoveIndex = 0;
        for(int i = int(itemsToRemove.length-1); i >= 0; i--){ // work backwards through the array as not to change the indexes of any unworked items
            if(itemsToRemove[uint(i)] <= menuLength){
                if(menuLength > 0){
                    if(optionsToRemoveFlags[uint(i)] == 0){ 
                        // move all items after the items to delete down and option and delete the last item
                        for(uint j = itemsToRemove[uint(i)]; j < menuLength-1; j++){
                            menuIndexes[j] = menuIndexes[j + 1];  
                        }
                        delete menuIndexes[menuLength-1];
                        menuLength--;
                    }
                    else{
                        // for each option to remove specified by the optionToRemoveFlag
                        for(int j = int(optionsToRemoveFlags[uint(i)] + optionsToRemoveIndex - 1); j >= int(optionsToRemoveIndex); j--){
                            // move all options after the option to delete down an index and remove the last option
                            for(uint k = optionsToRemove[uint(j)]; k < menu[menuIndexes[itemsToRemove[uint(i)]]].optionsCount-1; k++){
                                menu[menuIndexes[itemsToRemove[uint(i)]]].options[k] = menu[menuIndexes[itemsToRemove[uint(i)]]].options[k+1];
                                menu[menuIndexes[itemsToRemove[uint(i)]]].optionsCost[k] = menu[menuIndexes[itemsToRemove[uint(i)]]].optionsCost[k+1];
                            }
                            delete menu[menuIndexes[itemsToRemove[uint(i)]]].options[menu[menuIndexes[itemsToRemove[uint(i)]]].optionsCount-1];
                            delete menu[menuIndexes[itemsToRemove[uint(i)]]].optionsCost[menu[menuIndexes[itemsToRemove[uint(i)]]].optionsCount-1];
                            menu[menuIndexes[itemsToRemove[uint(i)]]].optionsCount--;
                        }
                        optionsToRemoveIndex += optionsToRemoveFlags[uint(i)];
                    }
                }
            }
        }
    }

    // should also be able to modify items
    function menuAddItems(bytes32[] memory itemNames, bytes32[] memory itemDescriptions, bytes32[] memory _optionNames, uint[] memory _prices, uint[] memory optionFlags) public{
        require(msg.sender == owner, "you are not the owner");
        require(itemNames.length == itemDescriptions.length, "the number of descriptions and item names do not match");
        require(_optionNames.length == _prices.length, "the number of options and prices do not match");
        require(itemNames.length == optionFlags.length, "the number of item names and option flags do not match");
        uint optionFlagsSum = 0;
        for(uint i = 0; i < optionFlags.length; i++){
            optionFlagsSum += optionFlags[i];
        }
        require(_optionNames.length == optionFlagsSum, "the number of options and the sum of the option flags do not match");

        // checks on if an item is in the menu should be done client side, maybe??
                
        // add to menu
        uint optionIndex = 0;
        bytes32 itemName;
        bytes32 itemDescription;
        bytes32[] memory optionNames;
        uint[] memory prices;

        for(uint i = 0; i < optionFlags.length; i++){

            itemName = itemNames[i];
            itemDescription = itemDescriptions[i];

            optionNames = new bytes32[](8);
            prices = new uint[](8);
            
            //ToDo: need to require that the total number of options for an item is less than the options array limit, or have the limit increase when it is exceeded

            for(uint j = 0; j < optionFlags[i]; j++){
                optionNames[j] = _optionNames[optionIndex];
                prices[j] = _prices[optionIndex];
                optionIndex++;
            }

            // if the optionsflag is one then the number of options is 0
            uint optionsCount = 0;
            if(optionFlags[i] != 1)
                optionsCount = optionFlags[i];
            

            menu[menuMappingLength] = Item(itemName,itemDescription,optionNames,prices, optionFlags[i]);
            menuIndexes[menuLength] = menuMappingLength;
            menuLength++;
            menuMappingLength++;
            
        }
    }

    function menuAddOptions(uint[] memory itemIds, bytes32[] memory _optionNames, uint[] memory _prices, uint[] memory optionFlags) public {
        require(msg.sender == owner, "you are not the owner");
        require(itemIds.length == optionFlags.length, "the number of item ids does not match the number of option flags");
        require(_optionNames.length == _prices.length, "the number of options does not match the number of prices");
        uint optionFlagsSum = 0;
        for(uint i = 0; i < optionFlags.length; i++){
            optionFlagsSum += optionFlags[i];
        }
        require(_optionNames.length == optionFlagsSum, "the number of option names does not match the sum of the flags");

        uint optionIndex = 0;
        for(uint i = 0; i < itemIds.length; i++){
            for(uint j = optionIndex; j < optionFlags[i]+optionIndex; j++){
                menu[menuIndexes[itemIds[i]]].options[menu[menuIndexes[itemIds[i]]].optionsCount] = _optionNames[j];
                menu[menuIndexes[itemIds[i]]].optionsCost[menu[menuIndexes[itemIds[i]]].optionsCount] = _prices[j];
                menu[menuIndexes[itemIds[i]]].optionsCount++;
            }
            optionIndex+=optionFlags[i];
        }
    }


    // todo: fix this
    function getOrderPrice(uint[] memory itemIds) public view returns (uint){
        uint price = 0;
        for(uint i = 0; i < itemIds.length; i++){
            price += menu[itemIds[i]].optionsCost[0];
        }
        return price;
    }
    

    function makeOrder(uint[] calldata itemIds, uint deliveryFee, bytes32 riderKeyHash) external payable returns (address orderAddress) {
        //require this comes from a customer smart contract, maybe worth moving this to the order smart contract
        require(CustomerFactory(Controller(controllerAddress).customerFactoryAddress()).customerExists(msg.sender), "Customer doesnt exist");

        uint[] memory prices = new uint[](itemIds.length);
        bytes32[] memory items = new bytes32[](itemIds.length);
        for(uint i = 0; i < itemIds.length; i++)
        {
            if (itemIds[i] >= 0 && itemIds[i] < menuLength){
                // could consider sending itemID and price to reduce gas cost
                items[i] = menu[uint(itemIds[i])].itemName; 
                prices[i] = menu[uint(itemIds[i])].optionsCost[0];
            }
            else{
                revert("Invalid Items");
            }
        }
        
		Order newOrder = (new Order).value(msg.value)(totalOrders,items,prices,deliveryFee, controllerAddress, msg.sender, riderKeyHash);
		orders[totalOrders] = order(true,address(newOrder));
        totalOrders ++;

        emit OrderMadeEvent(orders[totalOrders - 1].orderAddress);

		return orders[totalOrders - 1].orderAddress;       
    }

    function setStatus(address orderAddress, uint status) public{
        require(msg.sender == owner, "you are not the owner");
        Order(orderAddress).setOrderStatus(status);
    }

    function pay() external payable {
        totalPay += msg.value;
        owner.transfer(msg.value);
    } 

    function() external payable {

    }


    // Setters
    function updateRestaurant(bytes32 _name, bytes32 _number, address payable _owner, bytes memory _location, uint _latitude, uint _longitude, bytes memory _logoURI, bytes32 _logoHash) public {
        require(msg.sender == owner);
        if(_name.length > 0 )
            setName(_name);
        if(_number.length > 0 )
            setNumber(_number);
        if(_owner != address(0))
            setOwner(_owner);
        if(_location.length > 0)
            setLocation(_location, _latitude, _longitude);
        if(_logoURI.length > 0)
            setName(_name);
    }
    function setName(bytes32 _name) public {
        require(msg.sender == owner);
        name = _name;
    }
    function setNumber(bytes32 _number) public {
        require(msg.sender == owner);
        contactNumber = _number;
    }
    function setOwner(address payable _owner) public {
        require(msg.sender == owner);
        owner = _owner;
    }
    function setLocation(bytes memory _location, uint _latitude, uint _longitude) public {
        require(msg.sender == owner);
        location = _location;
        latitude - _latitude;
        longitude = _longitude;
    }
    function setLogo(bytes memory _logoURI, bytes32 _logoHash) public {
        require(msg.sender == owner);
        logoURI = _logoURI;
        logoHash = _logoHash;
    }
}