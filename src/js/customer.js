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
	getRestaurants();
	await getCustomerInstance();
	getOrders();
	initiateEvents();
	document.getElementById("loading").style.display = "none";
	document.getElementById("main").style.display = "block";
}

async function printRestaurant(restaurant){
	var name = restaurant.name();
	var address = restaurant.location();
	var id = restaurant.id();

	var RestaurantDeets = await Promise.all([name,address,id]);

	var html = '<div id=Restaurant1 class="itemTyle" onclick="viewRestaurant('+RestaurantDeets[2]+')">'+
					'<p style="font-size: 30px" class="text-center"><b>'+RestaurantDeets[0]+'</b></p>'+
					'<p class="text-center">'+RestaurantDeets[1]+'</p>'+
				'</div>';
	$("#Restaurants").append(html);
}

async function printOrder(orderIndex){
	var order = orders[orderIndex];

	var id = order.id();
	var price = order.getCost();
	var deliveryFee = order.deliveryFee();
	var orderTime = order.orderTime();

	var customerStatus = order.customerStatus();
	var restaurantStatus = order.restaurantStatus();
	var riderStatus = order.riderStatus();

	var address = order.restaurant();

	var orderVars = await Promise.all([id,price,deliveryFee,orderTime,customerStatus,restaurantStatus,riderStatus, address]);

	var restaurant = await new App.contracts.Restaurant(orderVars[7]);
	var restaurantName = await restaurant.name();

	var total = parseFloat(orderVars[1]) + parseFloat(orderVars[2]);

	var html = 	'<div class="itemTyle" onclick="viewOrder('+orderIndex+')">'+
					'<p>'+restaurantName+'</p>'+
					//'<h3 style="float: right">Status: Delivered</h3>'+
					'<p>Date: '+new Date(orderVars[3]*1000).toLocaleString()+'<br>Price: '+Math.round(total*Math.pow(10,-18) * 1000) / 1000 +' (£'+ Math.round(total*Math.pow(10,-18) * App.conversion.currentPrice * 100) / 100+')<br>customerStatus: '+orderVars[4]+'. restaurantStatus: '+orderVars[5]+'. riderStatus: '+orderVars[6]+'</p>'+
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

async function initiateEvents(){

	var orderMadeEvent = customerInstance.OrderMadeEvent({},{fromBlock: 'latest'});
	
	orderMadeEvent.watch(function(err,result){
		console.log("event found");
		if(!err){
			afterOrderMade(result.args.orderAddress);
		}else{
			console.log(err);
		}
	});
	console.log("Events Initiated");
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
				printOrder(counter);
			});
		})(i);
	}

}

async function addOrder(address){
	console.log("adding order at: " + address);
	var newOrder = await new App.contracts.Order(address);
	var orderIndex = orders.length;
	orders[orderIndex] = newOrder;
	printOrder(orderIndex);
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
	cart = [];
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

	var html = 	'<h2 id="recentOrderStatus" class="text-center"></h2>' +
				'<h1 id="RestaurantTitle" class="text-center">'+name+'</h1>' +
					'<p id="RestaurantAddress" class="text-center">'+address+'</p>'+
					'<div id="MenuArea">'+
						'<h2 class="text-center">Menu</h2>'+
						'<div id="MenuContent"></div>'+
					'</div>'+
					'<div id="cart">'+
						'<h2 class="text-center">Cart</h2>'+
						'<div id="cartContent"></div>'+
						'Delivery Fee: <input id="deliveryFee" style="width: 80px" value="0.02" onKeyUp="updatePrice()">'+
						'<button onclick="checkout()" style="float: right; margin-right: 10px">Checkout</button><br>'+
						'<h3 class="text-center" id="priceTag" style="float: right; margin-right: 10px">Price: 0 finney</h3>'+
					'</div>';

	$("#RestaurantView").html(html);

	console.log(menu);

	var htmlMenu = "";
	for(var i = 0; i<menuLength;i++){
		(function(counter){
			restaurant.menu(counter).then(function(item){
				menu[counter] = item;
				htmlMenu = 	'<div class="item" onclick="addToCart('+counter+')">'+
								'<p class="text-center" style="font-size: 20px">'+web3.toAscii(item[0])+': '+Math.round(item[1]*Math.pow(10,-18)*10000)/10000+' (£'+ Math.round(item[1]*Math.pow(10,-18) * App.conversion.currentPrice * 100) / 100+')</p>'+
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

	console.log("Viewing Order at: "+order.address);

	var cost =  order.getCost();
	var orderLength =  order.totalItems();
	var orderID =  order.id();
	var orderTime =  order.orderTime();
	var customerStatus =  order.customerStatus();
	var restaurantStatus =  order.restaurantStatus();
	var riderStatus =  order.riderStatus();
	var orderRestaurantAddress =  order.restaurant();

	var orderVars = await Promise.all([
									orderID,
									cost,
									orderLength,
									orderTime,
									customerStatus,
									restaurantStatus,
									riderStatus,
									orderRestaurantAddress]);

	var orderRestaurant = await new App.contracts.Restaurant(orderVars[7]);
	var name = await orderRestaurant.name();
	var address = await orderRestaurant.location();
	

	console.log("order length: " + orderLength);

	var html = 	'<h3 class="text-center">Summery of your order</h3>'+
				'<h1 id="RestaurantTitle" class="text-center">'+name+'</h1>' +
				'<p id="RestaurantAddress" class="text-center">'+address+'</p>'+
				'<p class="text-center">Time: '+new Date(orderVars[3]*1000).toLocaleString()+'</p>'+
				'<div id="ItemsArea">'+
					'<h2 class="text-center">Ordered Items</h2>'+
					'<div id="OrderItems"></div>'+
				'</div>'+
				'<h3 class="text-center" id="priceTag" style="margin-bottom: 20px;">Total Price: '+Math.round(orderVars[1]*Math.pow(10,-18)*10000)/10000+' Eth (£'+Math.round(orderVars[1]*App.conversion.currentPrice*Math.pow(10,-18)*100)/100+')</h3><br>'+
				'<button id="updateAddressBut" onclick="saveAddress(\''+order.address+'\')" style="margin-left: 45%;"">Update Address</button>'+
				'<div id="statusArea">'+
					'<h2 class="text-center">OrderStatus</h2>'+
					'<div id="statusContent">'+
						'<h3 class="text-center">Restaurant: '+restaurantState.get(orderVars[5].c[0])+'</h3>'+ // note .c[0] needs to be used here because an object is returned instead of a uint
							'<h3 class="text-center">Rider: '+riderState.get(orderVars[6].c[0])+'</h3>'+
							'<h3 class="text-center">Customer: '+customerState.get(orderVars[4].c[0])+'</h3>'+
					'</div>'+
					'<div id="qrcode" style="margin-left: 45%; margin-top:10px"></div>'+		
					'<h4 class="text-center" id="keyText"></h4>'
				'</div>';

	$("#OrderView").html(html);

	if(await order.keyRiderSet() == true){
		var paymentKey = localStorage.getItem("customerKey"+orderID);
		console.log("key: " + paymentKey);
		if(paymentKey != null){
			new QRCode(document.getElementById("qrcode"), paymentKey);
			$("#keyText").html("Payment Key: " + paymentKey);
		}else{
			console.log("ERROR: key for rider set but none found in local storage, please make a new one");
		}
	}



	var htmlMenu = "";
	for(var i = 0; i<orderLength;i++){
		(function(counter){
			order.getItem(counter).then(function(item){
				var priceEth = item[1]*Math.pow(10,-18);
				htmlMenu = 	'<div class="item">'+
								'<p class="text-center" style="font-size: 20px">'+web3.toAscii(item[0])+": " + Math.round(priceEth*10000)/10000 + ' (£'+ Math.round(priceEth * App.conversion.currentPrice * 100) / 100+')</p>'+
							'</div>';
				$("#ItemsArea").append(htmlMenu);
			});
		})(i);
	}
}

async function checkout(){
	// todo, resolve what you doing with delivery fee
	var toSend = updatePrice();
	var deliveryFee = document.getElementById("deliveryFee").value * Math.pow(10,18);
	console.log("toSend: " + toSend + " + " + deliveryFee);
	var toSend = toSend + deliveryFee;

	var totalOrders = await customerInstance.getTotalOrders();
	var totalOrders = parseInt(totalOrders);
	var random = makeid(12);
	var hash = await App.controllerInstance.getHash(random);
	customerInstance.makeOrder(restaurants[currentRestaurant].address,cart,deliveryFee,hash,{from: App.account, value:toSend}).then(function(err,res){console.log(res);});
	localStorage.setItem('customerKey'+(totalOrders),random);
	localStorage.setItem('Address'+(totalOrders),random);


	afterOrderRequested();

	
}

async function afterOrderRequested(){
	$("#cartContent").html("");
	cart = [];
	$("#recentOrderStatus").html("You're order made at " + new Date().toLocaleTimeString() + " is being processed");
	// change to notify that an order is being made
}

// to be called after an order make event has been created.
async function afterOrderMade(orderAddress){

	console.log("OrderMade at: " + orderAddress)

	var address = null;
	var hasAddress = false;

	saveAddress(orderAddress);
	
	var order = await new App.contracts.Order(orderAddress);
	var restaurantAddress = await order.restaurant();
	var restaurant = await new App.contracts.Restaurant(restaurantAddress);

	var name = await restaurant.name();
	var deliveryFee = await order.deliveryFee();
	var price = await order.getCost();

	alert("you're order costing approximatly " + Math.round(price * Math.pow(10,-18)*10000)/10000 + " Ethereum (£"+ Math.round(price * Math.pow(10,-18) * App.conversion.currentPrice * 100) / 100+") with a deliveryFee of " + deliveryFee * Math.pow(10,-18) + " Ethereum (£"+ Math.round(deliveryFee* Math.pow(10,-18)* App.conversion.currentPrice * 100) / 100+") to " + name + " has been made.");
	$("#recentOrderStatus").html("");
	addOrder(orderAddress);
}

async function saveAddress(orderAddress){
	address = prompt("Please enter the delivery address", "13 Fake Address, CF2FAKE, Cardiff");
		
	if(address == null || address == ""){
		return saveAddress(orderAddress);
	}

	const msgParams = [
	{
	    type: 'string',      // Any valid solidity type
	    name: 'orderAddress',     // Any string label you want
	    value: orderAddress  // The value to sign, this should be changed
	}];

	await web3.currentProvider.sendAsync(
	{
	    method: 'eth_signTypedData',
	    params: [msgParams, App.account],
	    from: App.account,
  	}, 
  	function (err, result) {
  		console.log("test");
	    if(err){
	    	console.error(err);
	    	return saveAddress(orderAddress);
	    }
	    if(result.error) {
	      console.error(result.error);
	      return saveAddress(orderAddress);
	    }else{
	    	console.log("posting address to server: " + address);
			$.ajax({ 
		      type: 'POST', 
		      url: '/saveOrderAddress',  
		      data: {
		      			signature: result.result,
		    			physicalAddress: address,
		    			orderAddress: orderAddress,
		    		},
		      dataType: 'json',
		      success: function (data) { 
		      	if(data != 'NA'){
		      		return address;
		      	}else{
		      		console.log(data);
		      		return saveAddress(orderAddress);
		      	}
		      }
		    });
	    }
  	});
}

async function getAddress(orderAddress){
	const msgParams = [
	{
	    type: 'string',      // Any valid solidity type
	    name: 'orderAddress',     // Any string label you want
	    value: orderAddress  // The value to sign, this should be changed
	}];

	await web3.currentProvider.sendAsync(
	{
	    method: 'eth_signTypedData',
	    params: [msgParams, App.account],
	    from: App.account,
  	}, 
  	function (err, result) {
  		console.log("requesting address from server for order: " + orderAddress);
  		$.ajax({ 
		      type: 'POST', 
		      url: '/requestAddress',  
		      data: {
		      			signature: result.result,
		    			orderAddress: orderAddress,
		    		},
		      dataType: 'json',
		      success: function (data) { 
		      	if(data != 'NA'){
		      		console.log(data);
		      		return data;
		      	}else{
		      		console.log(data);
		      	}
		      }
		    });
  	});
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
		console.log();
	}
	var priceEth = price*Math.pow(10,-18);
	var deliveryFee = document.getElementById("deliveryFee").value;
	var total =  parseFloat(priceEth) + parseFloat(deliveryFee);

	var html = 	'<div class="text-center" id="priceTag" style="float: right; margin-right: 10px">Price: ' + Math.round(priceEth*10000)/10000 + ' (£'+ Math.round(priceEth * App.conversion.currentPrice * 100) / 100+')</div>'+
				'<br>'+
				'<div class="text-center" id="priceTag" style="float: right; margin-right: 10px">Delivery Fee: '+Math.round(deliveryFee*10000)/10000+' (£'+ Math.round(deliveryFee * App.conversion.currentPrice * 100) / 100+')</div>'+
				'<br>'+
				'<div class="text-center" id="priceTag" style="float: right; margin-right: 10px">Total: '+Math.round(total*10000)/10000+' (£'+ Math.round(total * App.conversion.currentPrice * 100) / 100+')</div>';


	$("#priceTag").html(html);
	console.log(total);
	return priceEth * Math.pow(10,18);
}

function updateCartView(){
	$("#cartContent").html("");
	for(var i = 0; i<cart.length;i++){
		
		
		htmlMenu = 	'<div class="item" onclick="removeFromCart('+i+')">'+
						'<p class="text-center" style="font-size: 20px">'+web3.toAscii(menu[cart[i]][0])+': '+Math.round(menu[cart[i]][1]*Math.pow(10,-18) * 100) / 100+'</p>'+
					'</div>';
		$("#cartContent").append(htmlMenu);
	}	
	updatePrice();
}

function makeid(length) {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < length; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}



$(function() {
  $(window).load(function() {
    init();
  });
});

//=================================================
// this is tester code for serverside account verification


const msgParams = [
  {
    type: 'string',      // Any valid solidity type
    name: 'Message',     // Any string label you want
    value: 'test'  // The value to sign, this should be changed
 }//,
 // {   
 //   type: 'uint32',
 //      name: 'A number',
 //      value: '1337'
 //  }
] 

function signMsg(msgParams, from) {

  web3.currentProvider.sendAsync({
    method: 'eth_signTypedData',
    params: [msgParams, from],
    from: from,
  }, function (err, result) {
  	console.log("message Signed");
    if (err) return console.error(err)
    if (result.error) {
      return console.error(result.error.message)
    }else{
    	console.log("posting: " + result.result);
    	$.ajax({ 
	      type: 'POST', 
	      url: '/db',  
	      data: {
        			message: result.result,
        			signedNumberValue: msgParams[1].value,
        		},
	      dataType: 'json',
	      success: function (data) { 
	      	if(data != 'NA'){
	      		console.log("success");
	      	}else{

	      	}
	      }
	    });
    }


  })
}

function test(){
	signMsg(msgParams, web3.eth.defaultAccount);
}



