var riderInstance;
var restaurants = [];
var orders = [];
var currentRestaurant;
var currentOrderCost;

function init(){
	document.getElementById("loading").style.display = "block";
	document.getElementById("main").style.display = "none";
}

async function afterAsync(){
	await getRiderInstance();
	await getRestaurants();
	await getOrders();
	document.getElementById("loading").style.display = "none";
	document.getElementById("main").style.display = "block";
	viewRestaurants();
}

async function getRiderInstance(){
	var address = await App.riderFactoryInstance.riders2(App.account);
	if(address == '0x0000000000000000000000000000000000000000'){
		alert("no riderSmartContract assosiated with your address")
		document.location.href = "./login.html";
	}
	else{
		console.log("riderAddress:" + address)
		riderInstance = new App.contracts.Rider(address);
	}
}

async function getRestaurants(){
	console.log("getting Restaurants");
	var restaurantCount = await App.restaurantFactoryInstance.restaurantCount();
	for(var i = 0; i<restaurantCount;i++){
		(function(counter){
			App.restaurantFactoryInstance.restaurants0(i).then(async function(address){
				restaurants[counter] = await new App.contracts.Restaurant(address);
				printRestaurant(restaurants[counter]);
			});
		})(i);
	}
}

async function getOrders(){
	console.log("getting orders");
	console.log(riderInstance);
	var orderCount = await riderInstance.totalOrders({from: App.account}); // this line can cause an internal JSON RPC error?? 

	$("#Orders").html("");

	for(var i = 0; i<orderCount;i++){
		(function(counter){
			riderInstance.getOrder(counter, {from: App.account}).then(async function(address){
				orders[counter] = await new App.contracts.Order(address);
				printOrder(orders[counter]);
			});
		})(i);
	}

}

// ToDo: this function is in multiple places
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

	var customerStatus = await order.customerStatus();
	var restaurantStatus = await order.restaurantStatus();
	var riderStatus = await order.riderStatus();

	var address = await order.restaurant();
	var restaurant = await new App.contracts.Restaurant(address);
	var restaurantName = await restaurant.name();

	var html = 	'<div class="itemTyle" onclick="viewOrder('+id+')">'+
					'<p>'+restaurantName+'</p>'+
					//'<h3 style="float: right">Status: Delivered</h3>'+
					'<p>Date: <br>Price: '+price+' finney<br>customerStatus: '+customerStatus+'. restaurantStatus: '+restaurantStatus+'. riderStatus: '+riderStatus+'</p>'+
				'</div>';


	$("#Orders").append(html);

}

function viewRestaurants(){
	document.getElementById("Restaurants").style.display = "block";
	document.getElementById("Order").style.display = "none";
	document.getElementById("Orders").style.display = "none"
	document.getElementById("Settings").style.display = "none";
	document.getElementById("RestaurantView").style.display = "none";
	document.getElementById("OrderView").style.display = "none";
	document.getElementById("main").style.background = "pink";
}

function viewSettings(){
	document.getElementById("Restaurants").style.display = "none";
	document.getElementById("Order").style.display = "none"
	document.getElementById("Orders").style.display = "none"
	document.getElementById("Settings").style.display = "block";
	document.getElementById("RestaurantView").style.display = "none";
	document.getElementById("OrderView").style.display = "none";
	document.getElementById("main").style.background = "lightgreen";
}

function viewOrders(){
	document.getElementById("Restaurants").style.display = "none";
	document.getElementById("Order").style.display = "none"
	document.getElementById("Orders").style.display = "block"
	document.getElementById("Settings").style.display = "none";
	document.getElementById("RestaurantView").style.display = "none";
	document.getElementById("OrderView").style.display = "none";
	document.getElementById("main").style.background = "lightblue";
}



async function viewRestaurant(id){
	currentRestaurant = id;
	await populateRestaurantView(id);

	document.getElementById("Restaurants").style.display = "none";
	document.getElementById("Settings").style.display = "none";
	document.getElementById("RestaurantView").style.display = "block";
	document.getElementById("OrderView").style.display = "none";
}

async function populateRestaurantView(id){
	restaurant = restaurants[id];
	var name = await restaurant.name();
	var address = await restaurant.location();
	
	// currently getting all orders and filtering out complete ones, this could be done better
	var totalOrders = await restaurant.totalOrders();

	var html = 	'<h1 id="RestaurantTitle" class="text-center">'+name+'</h1>' +
					'<p id="RestaurantAddress" class="text-center">'+address+'</p>'+
					'<div id="OrdersArea">'+
						'<h2 class="text-center">Open Orders</h2>'+
					'</div>';
					
	$("#RestaurantView").html(html);



	var htmlMenu = "";
	for(var i = 0; i<totalOrders;i++){
		(function(counter){
			restaurant.orders(counter).then(async function(item){
				orders[counter] = await new App.contracts.Order(item[1]);
				if(item[0] == true && await orders[counter].rider() == "0x0000000000000000000000000000000000000000"){
					htmlMenu = 	'<div class="itemTyle" onclick="viewOrder('+counter+')">'+
									'<p class="text-center" style="font-size: 20px">OrderID: ' + counter + '</p>'+
									'<p class="text-center" style="font-size: 14px">Delivery Location: (needs adding in)</p>'+
									'<p class="text-center" style="font-size: 14px">Delivery Time: (needs adding in)</p>'+
									'<p class="text-center" style="font-size: 14px">Pay: (needs adding in)</p>'+
									'<p class="text-center" style="font-size: 14px">Deposit: (needs adding in)</p>'+
								'</div>';
					$("#OrdersArea").append(htmlMenu);
				}
			});
		})(i);
	}
}

async function viewOrder(id){
	currentOrder = id;
	await populateOrderView(id);
	//await updateCartView();

	// ToDo: put the set window in its own function
	document.getElementById("RestaurantView").style.display = "none"
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
	currentOrderCost = cost;
	var orderLength = await order.totalItems();
	var customerStatus = await order.customerStatus();
	var restaurantStatus = await order.restaurantStatus();
	var riderStatus = await order.riderStatus();
	var rider = await order.rider();


	var orderRestaurantAddress = await order.restaurant();
	var orderRestaurant = await new App.contracts.Restaurant(orderRestaurantAddress);
	var name = await orderRestaurant.name();
	var address = await orderRestaurant.location();
	
	
	console.log("order length: " + orderLength);

	var html = 	'<h3 class"text-center">Summery of the order</h3>'+
				'<h1 id="OrderID" class="text-center">Order ID: '+id+'</h1>' +
				'<div id="ItemsArea">'+	
				'</div>'+
				'<p class="text-center" id="payment" style="margin-bottom: 20px;">Pay: (ToDo)</p>'+
				'<p class="text-center" id="depositRequired" style="margin-bottom: 20px;">Deposit Required: '+Math.round(cost*Math.pow(10,-15)*100)/100+'</p>'+
				'<p class="text-center" id="payment" style="margin-bottom: 20px;">Delivery Location: (ToDo)</p>'+
				'<div id="statusArea">'+
					'<h2 class="text-center">OrderStatus</h2>'+
					'<div id="statusContent">'+
						'<h3 class="text-center">Restaurant: '+restaurantState.get(restaurantStatus.c[0])+'</h3>'+ // note .c[0] needs to be used here because an object is returned instead of a uint
						'<h3 class="text-center">Rider: '+riderState.get(riderStatus.c[0])+'</h3>'+
						'<h3 class="text-center">Customer: '+customerState.get(customerStatus.c[0])+'</h3>'+
					'</div>'+
					'<button id="markPreparing" onclick="updateStatus(1)" style="margin-left: 50%">Offer delivery</button>'+
					'<button id="markComplete" onclick="updateStatus(2)" style="margin-left: 50%">mark Collected</button>'+
					'<button id="markHandover" onclick="updateStatus(3)" style="margin-left: 50%">hand Over</button>'+
				'</div>';

	$("#Order").html(html);

	// if rider has accepted this delivery, print out food items
	if(rider == App.account){
		var htmlMenu = '<h2 class="text-center">Ordered Items</h2>';
		for(var i = 0; i<orderLength;i++){
			(function(counter){
				order.getItem(counter).then(function(item){
					htmlMenu = 	'<div class="item" onclick="addToCart('+counter+')">'+
									'<p class="text-center" style="font-size: 20px">'+web3.toAscii(item[0])+': '+item[1]+'</p>'+
								'</div>';
					$("#ItemsArea").append(htmlMenu);
				});
			})(i);
		}
	}
}

async function updateStatus(status){
	if(status == 1)
	{
		await riderInstance.offerDelivery(orders[currentOrder].address,{from: App.account, value: currentOrderCost});
	}
	else
	{
		await riderInstance.setStatus(orders[currentOrder].address,status,{from: App.account});
	}
	await viewOrder(currentOrder);
}