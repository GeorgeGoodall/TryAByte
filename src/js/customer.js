var customerInstance;
var menu = [];
var restaurants = [];
var orders = [];
var currentRestaurant;
var cart = [];



function init(){
	document.getElementById("loading").style.display = "block";
	document.getElementById("main").style.display = "none";
}

async function afterAsync(){
	await getCustomerInstance();
	getRestaurants();
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

	var customerStatus = await order.customerStatus();
	var restaurantStatus = await order.restaurantStatus();
	var riderStatus = await order.riderStatus();

	var address = await order.restaurant();
	var restaurant = await new App.contracts.Restaurant(address);
	var restaurantName = await restaurant.name();

	var html = 	'<div class="itemTyle" onclick="viewOrder('+id+')">'+
					'<p>'+restaurantName+'</p>'+
					//'<h3 style="float: right">Status: Delivered</h3>'+
					'<p>Date: <br>Price: '+price+'<br>customerStatus: '+customerStatus+'. restaurantStatus: '+restaurantStatus+'. riderStatus: '+riderStatus+'</p>'+
				'</div>';


	$("#Orders").append(html);

}

function parseStatus(customer,restaurant,rider){

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
	console.log(customerInstance);
	var orderCount = await customerInstance.getTotalOrders();
	console.log(">" + orderCount);

	$("#Orders").html("");

	for(var i = 0; i<orderCount;i++){
		(function(counter){
			console.log("gettings order at "+i+": ");
			customerInstance.getOrder(counter).then(async function(address){
				console.log(address);
				orders[counter] = await new App.contracts.Order(address);
				
				console.log(orders[counter]);
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
	document.getElementById("main").style.background = "lightblue";
}

function viewOrders(){
	document.getElementById("Restaurants").style.display = "none";
	document.getElementById("Orders").style.display = "block";
	document.getElementById("Settings").style.display = "none";
	document.getElementById("RestaurantView").style.display = "none";
	document.getElementById("main").style.background = "lightgreen";
}

function viewSettings(){
	document.getElementById("Restaurants").style.display = "none";
	document.getElementById("Orders").style.display = "none"
	document.getElementById("Settings").style.display = "block";
	document.getElementById("RestaurantView").style.display = "none";
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
						'<h3 class="text-center" id="priceTag" style="float: right; margin-right: 10px">Price: 0</h3><br>'+
						'<button onclick="checkout()" style="float: right; margin-right: 10px">Checkout</button>'+
					'</div>';

	$("#RestaurantView").html(html);



	var htmlMenu = "";
	for(var i = 0; i<menuLength;i++){
		(function(counter){
			restaurant.menu(counter).then(function(item){
				console.log(item);
				menu[counter] = item;
				htmlMenu = 	'<div class="item" onclick="addToCart('+counter+')">'+
								'<p class="text-center" style="font-size: 20px">'+web3.toAscii(item[0])+': '+item[1]+'</p>'+
							'</div>';
				$("#MenuContent").append(htmlMenu);
			});
		})(i);
	}
}

async function checkout(){
	alert(restaurants[currentRestaurant].address + " : " +cart);
	console.log(customerInstance);
	var toSend = updatePrice() + 3000;
	console.log(toSend);
	await customerInstance.makeOrder(restaurants[currentRestaurant].address,cart,{from: App.account, value:toSend});
	getOrders();
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

function updatePrice(){
	var price = 0;
	for(var i = 0; i<cart.length; i++){
		price += parseInt(menu[cart[i]][1]);
	}
	$("#priceTag").html("Price: " + price);
	return price;
}

function updateCartView(){
	$("#cartContent").html("");
	for(var i = 0; i<cart.length;i++){
		
		
		htmlMenu = 	'<div class="item" onclick="removeFromCart('+i+')">'+
						'<p class="text-center" style="font-size: 20px">'+web3.toAscii(menu[cart[i]][0])+': '+menu[cart[i]][1]+'</p>'+
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