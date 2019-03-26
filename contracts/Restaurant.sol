pragma solidity ^0.5.0;

 import "./lib.sol";
 import "./Order.sol";
 import "./RestaurantFactory.sol";
 import "./CustomerFactory.sol";
 import "./Controller.sol";

contract Restaurant {

    using lib for bytes32;

	uint public id;
	string public name;
	string public location;
	string public contactNumber;
	uint public rating;

	address public owner;
    address public controllerAddress;
	address public restaurantFactoryAddress;


    struct order{bool open; address orderAddress;}
	uint public totalOrders;
	mapping(uint => order) public orders; // must be a better way to store the orders
	
	struct Item{
		bytes32 itemName;
		uint itemCost; // in wei (10^-18 Eth)
	}
	
    uint public menuLength;
	mapping(uint => Item) public menu; // should probably change this to a mapping

    enum restaurantState{acceptedOrder, preparingCargo, HandedOver}
	

	constructor(address _controller, address _owner, uint _id, string memory _name,string memory _address,string memory _contactNumber) public {
		id = _id;
		name = _name;
		location = _address;
		contactNumber = _contactNumber;
		totalOrders = 0;

        controllerAddress = _controller;
		owner = _owner;
		restaurantFactoryAddress = msg.sender;
	}

    // ToDo Remove this
    function getMenuLength() external view returns(uint length){
        return menuLength;
    }

    // todo redo this 
    // function clearMenu() external {
    //     require(msg.sender == owner);
    //     delete menu;
    // }
    

    function menuAddItems(bytes32[] calldata itemNames, uint[] calldata prices) external {
        require(msg.sender == owner);
        require(itemNames.length == prices.length);
        
        // should add checks that an item isn't added twice
        for(uint i = 0; i<itemNames.length;i++){
            menu[menuLength] = Item(itemNames[i],prices[i]);
            menuLength++;
        }
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
    }
    
    function menuSearch(string memory query) private view returns(int index){
        for(uint i = 0; i<menuLength;i++){
            if(lib.compareStrings(lib.bytes32ToString(menu[i].itemName),query)){
                return int(i);
            }
        }
        return -1;
    }

    function getOrderPrice(uint[] memory itemIds) public view returns (uint){
        uint price = 0;
        for(uint i = 0; i < itemIds.length; i++){
            price += menu[itemIds[i]].itemCost;
        }
        return price;
    }
    

    function makeOrder(uint[] calldata itemIds) external payable returns (address orderAddress) {
        //require this comes from a customer smart contract
        require(CustomerFactory(Controller(controllerAddress).customerFactoryAddress()).customerExists(msg.sender), "Customer doesnt exist");
        

        uint[] memory prices = new uint[](itemIds.length);
        bytes32[] memory items = new bytes32[](itemIds.length);
        for(uint i = 0; i < itemIds.length; i++)
        {
            if (itemIds[i] >= 0 && itemIds[i] < menuLength){
                items[i] = menu[uint(itemIds[i])].itemName; 
                prices[i] = menu[uint(itemIds[i])].itemCost;
            }
            else{
                revert("Invalid Items");
            }
        }
        
		Order newOrder = new Order(totalOrders,restaurantFactoryAddress,items,prices,controllerAddress, msg.sender);
		orders[totalOrders] = order(true,address(newOrder));
        totalOrders ++;
		return orders[totalOrders - 1].orderAddress;       
    }
    
    function getMenuItem(uint itemId)public view returns(bytes32 itemname, uint cost){
        return (menu[itemId].itemName,menu[itemId].itemCost);
    }

    // toDo, could pass in orderID instead reduce gas
    function setStatusPrepairing(address orderAddress) public { 
        require(msg.sender == owner);
        Order(orderAddress).setOrderStatus(uint(restaurantState.preparingCargo));
    }    

    function handOverCargo(address orderAddress) public {
        require(msg.sender == owner);
        Order(orderAddress).setOrderStatus(uint(restaurantState.HandedOver));
    }
}