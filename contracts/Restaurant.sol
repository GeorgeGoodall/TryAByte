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
	
	struct Item{
		bytes32 itemName;
        bytes32 description;
        bytes32[] options;
		uint[] optionsCost; // in wei (10^-18 Eth)
	}
	
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

    function getMenuItem(uint index) public view returns(bytes32 itemName, bytes32 itemDescription, bytes32[] memory optionNames, uint[] memory optionPrices){
        require(index < menuLength, "index out of bounds");
        Item memory i = menu[menuIndexes[index]];
        return (i.itemName, i.description, i.options, i.optionsCost);
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
    

    function updateMenu(bytes32[] memory itemNames, bytes32[] memory itemDescriptions, bytes32[] memory _optionNames, uint[] memory _prices, uint[] memory optionFlags, uint[] memory itemsToRemove) public{
        //require(msg.sender == owner, "you are not the owner");
        require(itemNames.length == itemDescriptions.length, "the number of descriptions and item names do not match");
        require(_optionNames.length == _prices.length, "the number of options and prices do not match");
        require(itemNames.length == optionFlags.length, "the number of item names and option flags do not match");
        uint optionFlagsSum = 0;
        for(uint i = 0; i < optionFlags.length; i++){
            optionFlagsSum += optionFlags[i];
        }
        require(_optionNames.length == optionFlagsSum, "the number of options and the sum of the option flags do not match");
        for(uint i = 0; i < itemsToRemove.length; i++){
            require(itemsToRemove[i] < menuIndexes.length, "you have requested to delete an index that is out of range");
        }
        
        // remove from menu 
        for(uint i = 0; i < itemsToRemove.length; i++){
            if(itemsToRemove[i] <= menuIndexes.length){
                if(menuLength > 0){
                    for(uint j = itemsToRemove[i]; j < menuLength-1; j++){
                        menuIndexes[j] = menuIndexes[j + 1];  
                    }
                }
                delete menuIndexes[menuIndexes.length-1];
                menuLength--;
            }
        }

        // add to menu
        uint optionIndex = 0;
        bytes32 itemName;
        bytes32 itemDescription;
        bytes32[] memory optionNames;
        uint[] memory prices;

        for(uint i = 0; i < optionFlags.length; i++){

            itemName = itemNames[i];
            itemDescription = itemDescriptions[i];

            optionNames = new bytes32[](optionFlags[i]);
            prices = new uint[](optionFlags[i]);
            
            for(uint j = 0; j < optionFlags[i]; j++){
                optionNames[j] = _optionNames[optionIndex];
                prices[j] = _prices[optionIndex];
                optionIndex++;
            }

            menu[menuMappingLength] = Item(itemName,itemDescription,optionNames,prices);
            menuIndexes[menuLength] = menuMappingLength;
            menuLength++;
            menuMappingLength++;
            
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