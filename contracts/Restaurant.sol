pragma solidity ^0.5.0;

 //import "./lib.sol";
 import "./Order.sol";
 import "./RestaurantFactory.sol";
 import "./CustomerFactory.sol";
 import "./Controller.sol";

contract Restaurant {

    //using lib for bytes32;

    // additional variables to add
    // restaurant logo: need link to logo file and hash of file
    // banner image of restaurant

    // latitud and longitude for indexing on area

    // todo:


	uint public id;
	string public name;

	bytes public location;
    uint public longitude;
    uint public latitude;

    bytes public logoURI;
    bytes32 private logoHash;


	string public contactNumber;

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

    enum restaurantState{acceptedOrder, preparingCargo, readyForCollection, HandedOver}
	
    event OrderMadeEvent(address orderAddress);
    event MenuUpdated();

	constructor(address _controller, address payable _owner, 
                uint _id, string memory _name, 
                bytes memory _address, uint _latitude, uint _longitude, 
                string memory _contactNumber
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

        controllerAddress = _controller;
		owner = _owner;
		restaurantFactoryAddress = msg.sender;


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
    

    function menuAddItems(bytes32[] calldata itemNames, bytes32[] calldata itemDescriptions, bytes32[] calldata _optionNames, uint[] calldata _prices) external {
        require(msg.sender == owner);
        require(itemNames.length == itemDescriptions.length);
        require(_optionNames.length == _prices.length);
        
        uint itemindex = 0;
        uint optionIndex = 0;
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
                optionIndex = 0;
                isNewItem = true;
            }
            else{
                optionNames[optionIndex] = _optionNames[i];
                prices[optionIndex] = _prices[i];
                optionIndex++;
            }

        }

        menu[itemindex] = Item(itemName,itemDescription,optionNames,prices);
        menuLength++;


    }

    
    
    function menuRemoveItems(uint[] calldata itemIds) external{
        require(msg.sender == owner);
        require(itemIds.length>0);

        uint totalItemsToKeep = menuLength - uint(itemIds.length);

        uint[] memory itemsToKeep = new uint[](totalItemsToKeep);
        uint counter = 0;
        for(uint i = 0; i<menuLength;i++){
            bool idUndeleted = true;
            for(uint j = 0; j < itemIds.length; j++){
                if(i == itemIds[j]){
                    idUndeleted = false;
                }
            }
            if(idUndeleted){
                itemsToKeep[counter] = i;
                counter++;
            }
        }

        for(uint i = 0; i < itemsToKeep.length; i++){
            menu[i] = menu[itemsToKeep[i]];
        }
        menuLength = itemsToKeep.length;
        emit MenuUpdated();
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
    
    function getMenuItem(uint itemId)public view returns(bytes32 itemname, uint cost){
        return (menu[itemId].itemName,menu[itemId].optionsCost[0]);
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
}