pragma solidity ^0.5.0;

 import "./lib.sol";
 import "./Order.sol";
 import "./RestaurantFactory.sol";

contract Restaurant {

    using lib for bytes32;

	uint id;
	string public name;
	string public location;
	string public contactNumber;
	uint public rating;
	address owner;
	address restaurantFactoryAddress;
	address CustomerFactory;

	uint totalOrders;
	mapping(uint => address) orders;
	
	struct Item{
		bytes32 itemName;
		uint itemCost; // in wei (10^-18 Eth)
	}
	
	Item[] public menu;
	

	constructor(uint _id, string memory _name,string memory _address,string memory _contactNumber) public {
		id = _id;
		name = _name;
		location = _address;
		contactNumber = _contactNumber;
		totalOrders = 0;
		owner = tx.origin; // assign owner of the order to the account that called the restaurant factory 
		restaurantFactoryAddress = msg.sender;
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
            //result = lib.strConcat(result,lib.strConcat(lib.bytes32ToString(itemNames[i]),":"));
            //int index = menuSearch(lib.bytes32ToString(itemNames[i]));
            int index = 0;
            if(index!=-1){
                delete menu[uint(index)];
                menu[uint(index)] = menu[menu.length-1];
                delete menu[menu.length-1];
                //result = lib.strConcat(result," Removed Sucessfully");
                menu.length--;
            }
            else{
                int a = 5;
                //result = lib.strConcat(result, " Error, could not find in menu");
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
    
    function makeOrder(bytes32[] calldata items) external returns (address orderAddress) {
        //require this comes from a customer smart contract
        require(RestaurantFactory(restaurantFactoryAddress).restaurantExists(msg.sender));
        

        uint[] memory prices = new uint[](items.length);
        for(uint i = 0; i < items.length; i++)
        {
            string memory a = lib.bytes32ToString(items[i]); 
            int index = menuSearch(a); 
            
            if (index != -1){
                prices[i] = menu[uint(index)].itemCost;
            }
            else{
                revert();
            }
        }
        

        totalOrders ++;
		Order newOrder = new Order(totalOrders,items,prices);
		orders[totalOrders] = address(newOrder);
		return orders[totalOrders];       
    }
    
    function getMenuItem(uint itemId)public view returns(bytes32 itemname, uint cost){
        return (menu[id].itemName,menu[id].itemCost);
    }
    
}