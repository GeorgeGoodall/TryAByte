var customerInstance;
var menu = [];
var restaurants = [];
var orders = [];
var currentOrder;
var currentRestaurant;
var cart = [];



function init(){
	document.getElementById("loading").style.display = "block";
	document.getElementById("main").style.display = "none";
}

async function afterAsync(){
	await getCustomerInstance();
	await getRestaurants();
	await getOrders();
	document.getElementById("loading").style.display = "none";
	document.getElementById("main").style.display = "block";
}

async function printRestaurant(restaurant){
	var name = await restaurant.name();
	var address = await restaurant.location();
	var id = await restaurant.id();

	var html = '<div id=Restaurant1 class="itemTyle" onclick="viewRestaurant('+id+')">'+
					'<p style="font-size: 30px" class="text-center"><b>'+name+'</b></p>'+
					'<p class="text-center">'+address+'</p>'+
				'</div>';
	$("#Restaurants").append(html);
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
					'<p>Date: '+orderTime+'<br>Price: '+Math.round(price*Math.pow(10,-15) * 100) / 100+' finney<br>customerStatus: '+customerStatus+'. restaurantStatus: '+restaurantStatus+'. riderStatus: '+riderStatus+'</p>'+
				'</div>';


	$("#Orders").append(html);

}

async function getCustomerInstance(){
	var address = await App.customerFactoryInstance.customers2(App.account);
	if(address == '0x0000000000000000000000000000000000000000'){
		alert("no customerSmartContract assosiated with your address")
		document.location.href = "./login.html";
	}
	else{
		console.log("customerAddress:" + address)
		customerInstance = new App.contracts.Customer(address);
	}
}

async function getRestaurants(){
	console.log("getting Restaurants");
	var restaurantCount = await App.restaurantFactoryInstance.restaurantCount();
	for(var i = 0; i<restaurantCount;i++){
		(function(counter){
			App.restaurantFactoryInstance.restaurants0(i).then(async function(address){
				console.log("new restaurant");
				restaurants[counter] = await new App.contracts.Restaurant(address);
				printRestaurant(restaurants[counter]);
			});
		})(i);
	}
}

async function getOrders(){
	console.log("getting orders");
	var orderCount = await customerInstance.getTotalOrders({from: App.account}); // this line can cause an internal JSON RPC error?? 

	$("#Orders").html("");

	for(var i = 0; i<orderCount;i++){
		(function(counter){
			customerInstance.getOrder(counter, {from: App.account}).then(async function(address){
				orders[counter] = await new App.contracts.Order(address);
				printOrder(orders[counter]);
			});
		})(i);
	}

}

function viewRestaurants(){
	document.getElementById("Restaurants").style.display = "block";
	document.getElementById("Orders").style.display = "none";
	document.getElementById("Settings").style.display = "none";
	document.getElementById("RestaurantView").style.display = "none";
	document.getElementById("OrderView").style.display = "none";
	document.getElementById("main").style.background = "lightblue";
}

function viewOrders(){
	document.getElementById("Restaurants").style.display = "none";
	document.getElementById("Orders").style.display = "block";
	document.getElementById("Settings").style.display = "none";
	document.getElementById("RestaurantView").style.display = "none";
	document.getElementById("OrderView").style.display = "none";
	document.getElementById("main").style.background = "lightgreen";
}

function viewSettings(){
	document.getElementById("Restaurants").style.display = "none";
	document.getElementById("Orders").style.display = "none"
	document.getElementById("Settings").style.display = "block";
	document.getElementById("RestaurantView").style.display = "none";
	document.getElementById("OrderView").style.display = "none";
	document.getElementById("main").style.background = "pink";
}


async function viewRestaurant(id){
	currentRestaurant = id;
	await populateRestaurantView(id);
	await updateCartView();

	document.getElementById("Restaurants").style.display = "none";
	document.getElementById("Orders").style.display = "none"
	document.getElementById("Settings").style.display = "none";
	document.getElementById("RestaurantView").style.display = "block";
	document.getElementById("OrderView").style.display = "none";
}

async function viewOrder(id){
	currentOrder = id;
	await populateOrderView(id);
	//await updateCartView();

	// ToDo: put the set window in its own function
	document.getElementById("Restaurants").style.display = "none";
	document.getElementById("Orders").style.display = "none"
	document.getElementById("Settings").style.display = "none";
	document.getElementById("RestaurantView").style.display = "none";
	document.getElementById("OrderView").style.display = "block";
}

async function populateRestaurantView(id){
	restaurant = restaurants[id];
	var name = await restaurant.name();
	var address = await restaurant.location();
	
	var menuLength = await restaurant.menuLength();
	console.log("menu length: " + menuLength);

	var html = 	'<h1 id="RestaurantTitle" class="text-center">'+name+'</h1>' +
					'<p id="RestaurantAddress" class="text-center">'+address+'</p>'+
					'<div id="MenuArea">'+
						'<h2 class="text-center">Menu</h2>'+
						'<div id="MenuContent"></div>'+
					'</div>'+
					'<div id="cart">'+
						'<h2 class="text-center">Cart</h2>'+
						'<div id="cartContent"></div>'+
						'Delivery Fee: <input id="deliveryFee" style="width: 40px" value="20" onchange="updatePrice()">'+
						'<button onclick="checkout()" style="float: right; margin-right: 10px">Checkout</button><br>'+
						'<h3 class="text-center" id="priceTag" style="float: right; margin-right: 10px">Price: 0 finney</h3>'+
					'</div>';

	$("#RestaurantView").html(html);



	var htmlMenu = "";
	for(var i = 0; i<menuLength;i++){
		(function(counter){
			restaurant.menu(counter).then(function(item){
				console.log(item);
				menu[counter] = item;
				htmlMenu = 	'<div class="item" onclick="addToCart('+counter+')">'+
								'<p class="text-center" style="font-size: 20px">'+web3.toAscii(item[0])+': '+Math.round(item[1]*Math.pow(10,-15)*100)/100+'</p>'+
							'</div>';
				$("#MenuContent").append(htmlMenu);
			});
		})(i);
	}
}

async function populateOrderView(id){
	console.log("Getting order with id: " + id)

	var customerState = new Map([[0, 'madeOrder'],[1, 'payed'],[2, 'hasCargo'],]);
	var riderState = new Map([[0, 'unassigned'],[1, 'accepted'],[2, 'hasCargo'],[3, 'Delivered'],]);
	var restaurantState = new Map([[0, 'acceptedOrder'],[1, 'preparingCargo'],[2, 'readyForCollection'],[3, 'HandedOver'],]);



	order = orders[id];
	var cost = await order.getCost();
	var orderLength = await order.totalItems();
	var customerStatus = await order.customerStatus();
	var restaurantStatus = await order.restaurantStatus();
	var riderStatus = await order.riderStatus();


	var orderRestaurantAddress = await order.restaurant();
	var orderRestaurant = await new App.contracts.Restaurant(orderRestaurantAddress);
	var name = await orderRestaurant.name();
	var address = await orderRestaurant.location();
	
	
	console.log("order length: " + orderLength);

	var html = 		'<h3 class"text-center">Summery of your order</h3>'+
					'<h1 id="RestaurantTitle" class="text-center">'+name+'</h1>' +
					'<p id="RestaurantAddress" class="text-center">'+address+'</p>'+
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
						'<button id="markDelivered" onclick="markDelivered()" style="margin-left: 50%">Mark Delivered</button>'+
					'</div>';

	$("#OrderView").html(html);



	var htmlMenu = "";
	for(var i = 0; i<orderLength;i++){
		(function(counter){
			order.getItem(counter).then(function(item){
				htmlMenu = 	'<div class="item" onclick="addToCart('+counter+')">'+
								'<p class="text-center" style="font-size: 20px">'+web3.toAscii(item[0])+': '+Math.round(item[1]*Math.pow(10,-15)*100)/100+'</p>'+
							'</div>';
				$("#ItemsArea").append(htmlMenu);
			});
		})(i);
	}
}

async function markDelivered(status){
	await customerInstance.signalDelivered(orders[currentOrder].address,{from: App.account});
	await viewOrder(currentOrder);
}

async function checkout(){
	// todo, resolve what you doing with delivery fee
	var deliveryFee = document.getElementById("deliveryFee").value * Math.pow(10,15);
	var toSend = updatePrice() + deliveryFee;
	console.log("Cost Sending: "+toSend);
	var address = prompt("Please enter the delivery address", "13 Fake Address, CF2FAKE, Cardiff");
	if(address != null){
		await customerInstance.makeOrder(restaurants[currentRestaurant].address,cart,deliveryFee,web3.fromAscii(address),{from: App.account, value:toSend});
		getOrders();
		viewOrders();
	}
}

function addToCart(id){
	cart.push(id);
	updateCartView();
}

function removeFromCart(id){
	console.log(id);
	for(var i = id; i<cart.length - 1; i++){
		cart[i] =  cart[i+1];
	}
	cart.length --;
	updateCartView();
}


// todo, have price print to a number of d.p
function updatePrice(){
	var price = 0;
	for(var i = 0; i<cart.length; i++){
		price += parseInt(menu[cart[i]][1]);
	}
	$("#priceTag").html("Price: " + (Math.round(price*Math.pow(10,-15) * 100) / 100) + " + DF: " + document.getElementById("deliveryFee").value + "finney");
	return price;
}

function updateCartView(){
	$("#cartContent").html("");
	for(var i = 0; i<cart.length;i++){
		
		
		htmlMenu = 	'<div class="item" onclick="removeFromCart('+i+')">'+
						'<p class="text-center" style="font-size: 20px">'+web3.toAscii(menu[cart[i]][0])+': '+Math.round(menu[cart[i]][1]*Math.pow(10,-15) * 100) / 100+'</p>'+
					'</div>';
		$("#cartContent").append(htmlMenu);
		
		
	}	
	updatePrice();
}



$(function() {
  $(window).load(function() {
    init();
  });
});