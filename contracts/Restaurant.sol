pragma solidity ^0.5.0;

 //import "./lib.sol";
 import "./Order.sol";
 import "./RestaurantFactory.sol";
 import "./CustomerFactory.sol";
 import "./Controller.sol";
 import "./Menu.sol";

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
	
    Menu menu;

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

        controllerAddress = _controller;
		owner = _owner;
		restaurantFactoryAddress = msg.sender;

        menu = new Menu(_owner);
	}

    function getMenuAddress() public view returns (address) {
        return address(menu);
    }


    function updateLogo(bytes calldata imageURI, bytes32 imageHash) external{
        require(msg.sender == owner);
        logoURI = imageURI;
        logoHash = imageHash;
    }
    
    // menuIndex
    // itemType
    // uint new prices
    // byte32 new text



    // // todo: fix this
    // function getOrderPrice(uint[] memory itemIds) public view returns (uint){
    //     uint price = 0;
    //     for(uint i = 0; i < itemIds.length; i++){
    //         price += menu[itemIds[i]].optionsCost[0];
    //     }
    //     return price;
    // }
    

  //   function makeOrder(uint[] calldata itemIds, uint deliveryFee, bytes32 riderKeyHash) external payable returns (address orderAddress) {
  //       //require this comes from a customer smart contract, maybe worth moving this to the order smart contract
  //       require(CustomerFactory(Controller(controllerAddress).customerFactoryAddress()).customerExists(msg.sender), "Customer doesnt exist");

  //       uint[] memory prices = new uint[](itemIds.length);
  //       bytes32[] memory items = new bytes32[](itemIds.length);
  //       for(uint i = 0; i < itemIds.length; i++)
  //       {
  //           if (itemIds[i] >= 0 && itemIds[i] < menuLength){
  //               // could consider sending itemID and price to reduce gas cost
  //               items[i] = menu[uint(itemIds[i])].itemName; 
  //               prices[i] = menu[uint(itemIds[i])].optionsCost[0];
  //           }
  //           else{
  //               revert("Invalid Items");
  //           }
  //       }
        
		// Order newOrder = (new Order).value(msg.value)(totalOrders,items,prices,deliveryFee, controllerAddress, msg.sender, riderKeyHash);
		// orders[totalOrders] = order(true,address(newOrder));
  //       totalOrders ++;

  //       emit OrderMadeEvent(orders[totalOrders - 1].orderAddress);

		// return orders[totalOrders - 1].orderAddress;       
  //   }

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