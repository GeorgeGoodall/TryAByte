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
	await initEvents();
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

var getOrdersLock = false;
async function getOrders(){
	if(!getOrdersLock){
		getOrdersLock = true;
		orders = [];
		var orderCount = await riderInstance.totalOrders({from: App.account}); // this line can cause an internal JSON RPC error?? 
		console.log("Total Orders: " + orderCount);
		$("#Orders").html("");
		for(var i = 0; i<orderCount;i++){
			(async function(counter){
				await riderInstance.getOrder(counter, {from: App.account}).then(async function(address){
					// change this as order ID isn't unique accross restaurants
					var tempOrder = await new App.contracts.Order(address);
					orders[counter] = tempOrder;
					await printOrder(counter);
				});
				if(counter == orderCount - 1)
				{
					getOrdersLock = false;
				}
			})(i);
		}	
		
	}
}

async function initEvents(){
	// event for when you have a delivery job
	var deliveryOfferedEvent = riderInstance.deliveryOfferedEvent({},{fromBlock: 'latest'});
	
	deliveryOfferedEvent.watch(function(err,result){
		if(!err){
			deliveryAccepted(result.args.orderAddress);
		}else{
			console.log(err);
		}
	});
}

// ToDo: this function is in multiple places
async function printRestaurant(restaurant){
	// toDo: have open orders displayed here

	var name = restaurant.name();
	var address = restaurant.location();
	var id = restaurant.id();
	var totalOrders = restaurant.totalOrders();

	var restaurantVars = await Promise.all([name,address,id,totalOrders]);

	var openOrderCount = 0;

	var html = '<div id=Restaurant1 class="itemTyle" onclick="viewRestaurant('+restaurantVars[2]+')">'+
					'<p style="font-size: 30px" class="text-center"><b>'+restaurantVars[0]+'</b></p>'+
					'<p class="text-center">'+restaurantVars[1]+'</p>'+
					'<p class="text-center" id="openOrderCount'+id+'">Availible Orders: '+openOrderCount+'</p>'+
				'</div>';
	$("#Restaurants").append(html);



	for(var i = 0; i<restaurantVars[3];i++){
		(function(counter){
			restaurant.orders(counter).then(async function(item){
				if(item[0] == true && await new App.contracts.Order(item[1]).rider() == "0x0000000000000000000000000000000000000000"){
					openOrderCount++;
					$("#openOrderCount" + restaurantVars[2]).html('Availible Orders: '+openOrderCount);
				}
			});
		})(i);
	}
}

// needs changing as two orders can have the same ID if from different restaurants
async function printOrder(orderIndex){
	
	var order = orders[orderIndex];
	//var id = await order.id();
	var price = order.getCost();
	var orderTime = order.orderTime();

	var customerStatus = order.customerStatus();
	var restaurantStatus = order.restaurantStatus();
	var riderStatus = order.riderStatus();
	var restaurantAddress = order.restaurant();

	var orderVars = await Promise.all([price,orderTime,customerStatus,restaurantStatus,riderStatus, restaurantAddress]);


	var restaurant = await new App.contracts.Restaurant(orderVars[5]);
	var restaurantName = await restaurant.name();

	var html = 	'<div class="itemTyle" onclick="viewOrder('+orderIndex+')">'+
					'<p>'+restaurantName+'</p>'+
					//'<h3 style="float: right">Status: Delivered</h3>'+
					'<p>Date: '+new Date(orderVars[1]*1000).toLocaleString()+'<br>Price: '+Math.round(orderVars[0]*Math.pow(10,-18)*10000)/10000+' Eth (£'+Math.round(orderVars[0]*Math.pow(10,-18)*App.conversion.currentPrice*100)/100+')<br>customerStatus: '+orderVars[2]+'. restaurantStatus: '+orderVars[3]+'. riderStatus: '+orderVars[4]+'</p>'+
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
					var orderTime = await orders[counter].orderTime();
					var pay = await orders[counter].deliveryFee();
					var depositRequired = await orders[counter].getCost();

					htmlMenu = 	'<div class="itemTyle" onclick="viewOrder('+counter+')">'+
									'<p class="text-center" style="font-size: 20px">OrderID: ' + counter + '</p>'+
									'<p class="text-center" style="font-size: 14px">Order Time: '+new Date(orderTime*1000).toLocaleString()+'</p>'+
									'<p class="text-center" style="font-size: 14px">Pay: '+Math.round(pay*Math.pow(10,-18)*10000)/10000+' Eth (£'+Math.round(pay*Math.pow(10,-18)*App.conversion.currentPrice*100)/100+')</p>'+
									'<p class="text-center" style="font-size: 14px">Deposit Required: '+Math.round(depositRequired*Math.pow(10,-18)*10000)/10000+' Eth (£'+Math.round(depositRequired*Math.pow(10,-18)*App.conversion.currentPrice*100)/100+')</p>'+
								'</div>';
					$("#OrdersArea").append(htmlMenu);
				}
			});
		})(i);
	}
}

async function viewOrder(orderIndex){
	currentOrder = orderIndex;
	await populateOrderView(orderIndex);
	//await updateCartView();

	// ToDo: put the set window in its own function
	document.getElementById("RestaurantView").style.display = "none"
	document.getElementById("Settings").style.display = "none";
	document.getElementById("Orders").style.display = "none";
	document.getElementById("Order").style.display = "block";
}

async function populateOrderView(orderIndex){
	console.log("Getting order with index: " + orderIndex)

	var customerState = new Map([[0, 'madeOrder'],[1, 'payed'],[2, 'hasCargo'],]);
	var riderState = new Map([[0, 'unassigned'],[1, 'accepted'],[2, 'hasCargo'],[3, 'Delivered'],]);
	var restaurantState = new Map([[0, 'acceptedOrder'],[1, 'preparingCargo'],[2, 'readyForCollection'],[3, 'HandedOver'],]);



	order = orders[orderIndex];
	var cost = await order.getCost();
	currentOrderCost = cost;
	var orderLength = await order.totalItems();
	var customerStatus = await order.customerStatus();
	var restaurantStatus = await order.restaurantStatus();
	var riderStatus = await order.riderStatus();
	console.log("riderStat: " + riderStatus);
	var rider = await order.rider();
	var orderTime = await order.orderTime();

	var orderRestaurantAddress = await order.restaurant();
	var orderRestaurant = await new App.contracts.Restaurant(orderRestaurantAddress);
	var name = await orderRestaurant.name();
	var restaurantPhysicalAddress = await orderRestaurant.location();

	var orderID = await order.id();
	
	var keySet = await order.keyRiderSet();
	var riderPayed = await order.riderPaid();

	console.log("order length: " + orderLength);

	var html = 	'<h3 class="text-center">Summery of the order</h3>'+
				'<h3 class="text-center">'+name+'</h3>'+
				'<h1 id="OrderID" class="text-center">Order ID: '+orderIndex+'</h1>' +
				'<div id="ItemsArea">'+	
				'</div>'+
				'<p class="text-center" style="font-size: 14px">Order Time: '+new Date(orderTime*1000).toLocaleString()+'</p>'+
				'<p class="text-center" id="payment">Pay: '+Math.round(cost*Math.pow(10,-18)*10000)/10000+' Eth (£'+Math.round(cost*Math.pow(10,-18)*App.conversion.currentPrice*100)/100+')</p>'+
				'<p class="text-center" id="depositRequired">Deposit Required: '+Math.round(cost*Math.pow(10,-15)*100)/100+'</p>'+
				'<h2 id="DeliveryAddress" class="text-center"></h2>' +
				//'<p class="text-center" id="payment" style="margin-bottom: 20px;">Delivery Location: (ToDo)</p>'+
				'<div id="statusArea">'+
					'<h2 class="text-center">OrderStatus</h2>'+
					'<div id="statusContent">'+
						'<h3 class="text-center">Restaurant: '+restaurantState.get(restaurantStatus.c[0])+'</h3>'+ // note .c[0] needs to be used here because an object is returned instead of a uint
						'<h3 class="text-center">Rider: '+riderState.get(riderStatus.c[0])+'</h3>'+
						'<h3 class="text-center">Customer: '+customerState.get(customerStatus.c[0])+'</h3>'+
					'</div>'+
					'<div id="buttonArea" style="margin-left: 45%">'+
					'</div>'+
					'<div id="qrcode" style="margin-left: 45%; margin-top:10px"></div>'+		
					'<h4 class="text-center" id="keyText"></h4>'
				'</div>';

	$("#Order").html(html);

	if(await order.keyRestaurantSet() == true && restaurantStatus.c[0] < 3){
		var paymentKey = localStorage.getItem("keyForRestaurant"+orderID);
		console.log("key: " + paymentKey);
		if(paymentKey != null){
			new QRCode(document.getElementById("qrcode"), paymentKey);
			$("#keyText").html("Payment Key: " + paymentKey);
		}else{
			console.log("ERROR: key for restaurant set but none found in local storage, please make a new one");
		}
	}

	//change displayed buttons based on current rider status
	if(riderStatus.c[0] == "0"){
		$("#buttonArea").html('<button id="offerDelivery" onclick="offerDelivery()" style="">Offer delivery</button><br>');
	}else if(keySet && parseInt(riderStatus.c[0]) > 1){
		var key = localStorage.getItem("keyRider"+orderID);
		if(key == null){
			// add key to localstorage incase of error so payment can be released later
			$("#buttonArea").append('<input type="text" id="keyInput">'+
									'<button id="" onclick="riderAddKey()" style="">Check Key</button><br>');
		}
		else{
			alert("key Found");
		}
	}
	if( parseInt(riderStatus.c[0]) >= 1){
		$("#buttonArea").append('<button id="ShowDeliveryAddress" onclick="ShowDeliveryAddress(\''+order.address+'\')">Request Delivery Address</button><br>');
	}


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

async function offerDelivery(){
	var cost = await order.getCost();
	var random = makeid(12);
	var hash = await App.controllerInstance.getHash(random);
	await riderInstance.offerDelivery(orders[currentOrder].address,hash,{value:cost})
	var orderID = await orders[currentOrder].id()
	localStorage.setItem('keyForRestaurant'+orderID,random);
}

async function deliveryAccepted(orderAddress){
	var order = await new App.contracts.Order(orderAddress);
	var restaurantAddress = await order.restaurant();
	var restaurant = await new App.contracts.Restaurant(restaurantAddress);

	var name = await restaurant.name();
	var deliveryFee = await order.deliveryFee();
	var price = await order.getCost();

	alert("you're deposit of " + Math.round(price * Math.pow(10,-18)*10000)/10000 + " Eth (£"+Math.round(price * Math.pow(10,-18)*App.conversion.currentPrice*100)/100+") for the order made to " + name + " with a payment for delivery of " + Math.round(deliveryFee * Math.pow(10,-18) * 10000) / 10000 + " Eth (£"+Math.round(deliveryFee * App.conversion.currentPrice * Math.pow(10,-18) * 100) / 100+") has been made.");
	$("#recentOrderStatus").html("");
	await getOrders();
	viewOrders();
	// if in orders view and viewing the order you just offered delivery for, switch to your orders

}


function makeid(length) {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < length; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}

async function riderAddKey(){
	var key = document.getElementById("keyInput").value;
	var hash = await order.getHash(key);
	var actualHash = await order.keyHashRider();
	if(actualHash == hash){
		// submit key for payment
		alert("Correct Key");
		order.riderSubmitKey(key);
	}else{
		alert("Incorrect Key");
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

async function ShowDeliveryAddress(orderAddress){
	getAddress(orderAddress,(output) => {alert("Delivery address: " + output); $('#DeliveryAddress').html("Delivery address: " + output);});
}

async function getAddress(orderAddress, callback = 'undefined'){
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
  	async function (err, result) {
  		console.log("requesting address from server for order: " + orderAddress);
  		$.ajax({ 
		      type: 'POST', 
		      url: '/requestAddress',
		      async: true,  
		      data: {
		      			signature: result.result,
		    			orderAddress: orderAddress,
		    		},
		      dataType: 'text',
		      success: function (data) { 
		      	if(data != ''){
		      		callback(data);
		      	}else{

		      	}
		      }
		    });		
  	});
}