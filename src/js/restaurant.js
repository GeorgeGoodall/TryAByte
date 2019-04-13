var restaurantInstance;
var menuStaging = [];
var menu = [];
var orders = [];
var currentOrder;

function init(){
	// code copied from https://www.w3schools.com/howto/howto_js_trigger_button_enter.asp
	// Get the input field
	var input = document.getElementById("MenuChange");

	// Execute a function when the user releases a key on the keyboard
	input.addEventListener("keyup", function(event) {
	  // Number 13 is the "Enter" key on the keyboard
	  if (event.keyCode === 13) {
	    // Cancel the default action, if needed
	    event.preventDefault();
	    // Trigger the button element with a click
	    menuModification()
	  }
	}); 
}

async function afterAsync(){
	await getRestaurantInstance();
	await populateData();
	await updateMenu();
	await getOrders();
	document.getElementById("loading").style.display = "none";
	document.getElementById("main").style.display = "block";
	viewOrders();

}

async function populateData(){
	var name = await restaurantInstance.name();
	console.log(name);
	$("#RestaurantName").html(name);
}

async function getRestaurantInstance(){
	console.log(App.account);
	var restaurantAddress = await App.restaurantFactoryInstance.restaurants2(App.account);
	if(restaurantAddress == '0x0000000000000000000000000000000000000000'){
		alert("no restaurantSmartContract assosiated with your address")
		document.location.href = "./login.html";
	}
	else{
		console.log("RestaurantAddress:" + restaurantAddress)
		restaurantInstance = new App.contracts.Restaurant(restaurantAddress);
	}
}

async function printOrder(order){
	var id = await order.id();
	var price = await order.getCost();
	var orderTime = await order.orderTime();

	var customerStatus = await order.customerStatus();
	var restaurantStatus = await order.restaurantStatus();
	var riderStatus = await order.riderStatus();

	var address = await order.restaurant();
	var restaurant = await new App.contracts.Restaurant(address);
	var restaurantName = await restaurant.name();

	var html = 	'<div class="itemTyle" onclick="viewOrder('+id+')">'+
					'<p>'+restaurantName+'</p>'+
					//'<h3 style="float: right">Status: Delivered</h3>'+
					'<p>Date: '+new Date(orderTime*1000).toLocaleString()+' <br>Price: '+Math.round(price*Math.pow(10,-15)*100)/100+' finney<br>customerStatus: '+customerStatus+'. restaurantStatus: '+restaurantStatus+'. riderStatus: '+riderStatus+'</p>'+
				'</div>';


	$("#Orders").append(html);

}

async function getOrders(){
	console.log("getting orders");
	var orderCount = await restaurantInstance.totalOrders({from: App.account}); // this line can cause an internal JSON RPC error?? 

	$("#Orders").html("");

	for(var i = 0; i<orderCount;i++){
		(function(counter){
			restaurantInstance.orders(counter, {from: App.account}).then(async function(order){
				orders[counter] = await new App.contracts.Order(order[1]);
				printOrder(orders[counter]);
			});
		})(i);
	}

}

function viewOrders(){
	document.getElementById("Settings").style.display = "none";
	document.getElementById("Orders").style.display = "block";
	document.getElementById("Order").style.display = "none";
	document.getElementById("main").style.background = "lightblue";
}

function viewSettings(){
	document.getElementById("Settings").style.display = "block";
	document.getElementById("Orders").style.display = "none"
		document.getElementById("Order").style.display = "none";
	document.getElementById("main").style.background = "lightgreen";
}

async function viewOrder(id){
	currentOrder = id;
	await populateOrderView(id);
	//await updateCartView();

	// ToDo: put the set window in its own function
	document.getElementById("Orders").style.display = "none"
	document.getElementById("Settings").style.display = "none";
	document.getElementById("Order").style.display = "block";
	document.getElementById("main").style.background = "lightblue";
}

async function populateOrderView(id){
	console.log("Getting order with id: " + id)

	var customerState = new Map([[0, 'madeOrder'],[1, 'payed'],[2, 'hasCargo'],]);
	var riderState = new Map([[0, 'unassigned'],[1, 'accepted'],[2, 'hasCargo'],[3, 'Delivered'],]);
	var restaurantState = new Map([[0, 'acceptedOrder'],[1, 'preparingCargo'],[2, 'readyForCollection'],[3, 'HandedOver'],]);



	order = orders[id];
	var cost = await order.getCost();
	var orderLength = await order.totalItems();
	var orderTime = await order.orderTime();
	var customerStatus = await order.customerStatus();
	var restaurantStatus = await order.restaurantStatus();
	var riderStatus = await order.riderStatus();


	var orderRestaurantAddress = await order.restaurant();
	var orderRestaurant = await new App.contracts.Restaurant(orderRestaurantAddress);
	var name = await orderRestaurant.name();
	var address = await orderRestaurant.location();

	var keySet = await order.keyRestaurantSet();
	
	
	console.log("order length: " + orderLength);

	var html = 		'<h3 class="text-center">Summery of the order</h3>'+
					'<h1 id="OrderID" class="text-center">Order ID: '+id+'</h1>' +
					'<h2 id="OrderTime" class="text-center">Order time: '+new Date(orderTime*1000).toLocaleString()+'</h2>' +
					'<div id="ItemsArea">'+
						'<h2 class="text-center">Ordered Items</h2>'+
						'<div id="OrderItems"></div>'+
					'</div>'+
					'<h3 class="text-center" id="priceTag" style="margin-bottom: 20px;">Total Price: '+Math.round(cost*Math.pow(10,-15)*100)/100+' finney</h3><br>'+
					'<div id="statusArea">'+
						'<h2 class="text-center">OrderStatus</h2>'+
						'<div id="statusContent">'+
							'<h3 class="text-center">Restaurant: '+restaurantState.get(restaurantStatus.c[0])+'</h3>'+ // note .c[0] needs to be used here because an object is returned instead of a uint
  							'<h3 class="text-center">Rider: '+riderState.get(riderStatus.c[0])+'</h3>'+
  							'<h3 class="text-center">Customer: '+customerState.get(customerStatus.c[0])+'</h3>'+
						'</div>'+
						'<div id="buttonArea" style="margin-left: 45%">'+
						'</div>'+
					'</div>';

	$("#Order").html(html);

	if(restaurantStatus.c[0] == 0){
		$("#buttonArea").html('<button id="acceptOrder" onclick="updateStatus(1)">Accept Order</button>');
	}else if(restaurantStatus.c[0] == 1){
		$("#buttonArea").html('<button id="readyForCollection" onclick="updateStatus(2)">notify ready for collection</button>');
	}

	//change displayed buttons based on current rider status
	if(keySet && parseInt(restaurantStatus.c[0]) > 1){
		var key = localStorage.getItem("keyRestaurant"+id);
		if(key == null){
			// add key to localstorage incase of error so payment can be released later
			$("#buttonArea").append('<input type="text" id="keyInput">'+
									'<button id="" onclick="checkKey()" style="">Submit Key</button><br>');
		}
	}

	var htmlMenu = "";
	for(var i = 0; i<orderLength;i++){
		(function(counter){
			order.getItem(counter).then(function(item){
				htmlMenu = 	'<div class="item">'+
								'<p class="text-center" style="font-size: 20px">'+web3.toAscii(item[0])+': '+Math.round(item[1]*Math.pow(10,-15)*100)/100+'</p>'+
							'</div>';
				$("#ItemsArea").append(htmlMenu);
			});
		})(i);
	}
}

async function checkKey(){
	var key = document.getElementById("keyInput").value;
	var hash = await order.getHash(key);
	var actualHash = await order.keyHashRestaurant();
	if(actualHash == hash){
		// submit key for payment
		alert("Correct Key");
		// ToDo, have status state payment processing until EVENT fired
		await order.restaurantSubmitKey(key);
		populateOrderView(currentOrder);
	}else{
		alert("Incorrect Key");
	}
}

async function updateStatus(status){
	await restaurantInstance.setStatus(currentOrder,status,{from: App.account});
	await populateOrderView(currentOrder);
}

function stageMenuItem(item){

	if(item[0].length > 32){
		alert("itemName can't be longer than 32 bits");
	}
	else{
		$("#menuStaging").append('<p class="text-center" id="'+item[0]+'" style="font-size: 30px">'+item[0]+': '+item[1]+'</p>');		
		menuStaging.push([item[0].trim(),item[1].trim()]);
	}
}

// ToDo: Consider having functioality to set menu order
function menuModification(){
	var item = document.getElementById("MenuChange").value;
	var re = /.+\s*[:\s*\d+]?/;

	var item = item.split(":");
	item[0] = item[0].trim();
	item[1] = item[1].trim();

	var complete = false;
	// if item is in either menu
	for(var i = 0; i < menuStaging.length; i++){
		if(menuStaging[i][0].includes(item[0])){
			menuStaging[i] = menuStaging[0];
			menuStaging.shift();
			$("#"+item[0]).remove();
			complete = true;
			break;
		}
	}


	//else
	if(!complete && item.length == 2 && !isNaN(item[1]) && item[0].length > 0 && !item[0].includes("#")){
		stageMenuItem(item);
	}
	//add
	

}

function clearStaging(){
	menuStaging = [];
	$("#menuStaging").html("");
}

async function commitMenuStaging(){
	itemNames = [];
	itemPrices = [];

	for(var i = 0; i< menuStaging.length; i++){
		// convert names to bytes32
		itemNames[i] = web3.fromAscii(menuStaging[i][0]);
		// change value from finney (10^-3 eth) to wei (10^-18 eth)
		itemPrices[i] = menuStaging[i][1] * Math.pow(10,15);
	}
	await restaurantInstance.menuAddItems(itemNames,itemPrices);
	updateMenu();
}

async function deleteFromMenu(){
	var toDelete = [];
	var menuLength = await restaurantInstance.menuLength();
	for(var i = 0; i<menuLength;i++){
		if(document.getElementById("itemDelete"+i).checked == true){
			toDelete.push(i);
		}
	}
	await restaurantInstance.menuRemoveItems(toDelete);
	updateMenu();
}

async function updateMenu(){
	$("#menuList").html("");
	var menuLength = await restaurantInstance.menuLength();
	for(var i = 0; i<menuLength;i++){
		(function(counter){
			restaurantInstance.menu(counter).then(async function(item){
				menu[i] = [web3.toAscii(item[0]),item[1]];
				$("#menuList").append('<div><label class="text-center" style="margin-left: 30%;font-size: 30px">'+web3.toAscii(item[0])+': '+Math.round(item[1]*Math.pow(10,-15) * 100)/100+'</label><input type="checkbox" id="itemDelete'+counter+'" name="deleteCheckbox" style="">delete</div>')
			});
		})(i);
	}
}





$(function() {
  $(window).load(function() {
    init();
  });
});
