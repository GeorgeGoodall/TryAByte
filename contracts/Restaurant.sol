pragma solidity ^0.5.0;

 import "./lib.sol";
 import "./Order.sol";
 import "./RestaurantFactory.sol";
 import "./CustomerFactory.sol";
 import "./Controller.sol";

contract Restaurant {

    using lib for bytes32;

	uint id;
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
	
	Item[] public menu; // should probably change this to a mapping

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

    function getMenuLength() external view returns(uint length){
        return menu.length;
    }

    function clearMenu() external {
        require(msg.sender == owner);
        delete menu;
    }
    
    function menuAddItems(bytes32[] calldata itemNames, uint[] calldata prices) external {
        require(msg.sender == owner);
        require(itemNames.length == prices.length);
        
        // should add checks that an item isn't added twice
        for(uint i = 0; i<itemNames.length;i++){
            menu.push(Item(itemNames[i], prices[i]));
        }
    }

    
    // could add ids to menu items then remove by id to lower gas cost
    function menuRemoveItems(bytes32[] calldata itemNames) external returns(string memory result){
        require(msg.sender == owner);
        require(itemNames.length>0);
        result = "";
        for(uint i = 0; i<itemNames.length;i++){
            result = lib.strConcat(result,lib.strConcat(lib.bytes32ToString(itemNames[i]),":"));
            int index = menuSearch(lib.bytes32ToString(itemNames[i]));
            if(index!=-1){
                delete menu[uint(index)];
                menu[uint(index)] = menu[menu.length-1];
                delete menu[menu.length-1];
                result = lib.strConcat(result," Removed Sucessfully");
                menu.length--;
            }
            else{
                result = lib.strConcat(result, " Error, could not find in menu");
            }
        }
        
        return result;
    }
    
    function menuSearch(string memory query) private view returns(int index){
        for(int i = 0; i<int(menu.length);i++){
            if(lib.compareStrings(lib.bytes32ToString(menu[uint(i)].itemName),query)){
                return i;
            }
        }
        return -1;
    }

    function validOrder(bytes32[] memory items) public view returns (bool isValid){
        for(uint i = 0; i < items.length; i++){
            if(menuSearch(lib.bytes32ToString(items[i])) == -1){
                return false;
            }
        }
        return true;
    }
    
    function makeOrder(bytes32[] calldata items) external returns (address orderAddress) {
        //require this comes from a customer smart contract
        require(CustomerFactory(Controller(controllerAddress).customerFactoryAddress()).customerExists(msg.sender));
        

        uint[] memory prices = new uint[](items.length);
        for(uint i = 0; i < items.length; i++)
        {
            string memory a = lib.bytes32ToString(items[i]); 
            int index = menuSearch(a); 
            
            if (index != -1){
                prices[i] = menu[uint(index)].itemCost;
            }
            else{
                revert("Invalid Items");
            }
        }
        

        
		Order newOrder = new Order(totalOrders,restaurantFactoryAddress,items,prices,controllerAddress, msg.sender);
		orders[totalOrders] = order(true,address(newOrder));
        totalOrders ++;
		return orders[totalOrders].orderAddress;       
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