OrderPage = {

	restaurant: null,
	order: null,

	// order can be: requested, accepted/preparing, rider found/not found, finished preparing, onrout, delivered,

	loadOrder: function(orderFrom,orderId,restaurantId){


		this.removeAllItems();


		

		if(orderFrom == "restaurant")
			this.order = RestaurantSettingsPage.restaurant.orders[orderId];
		else if(orderFrom == "job")
			this.order = SearchPage.restaurants[restaurantId].orders[orderId];
		else if(orderFrom == "rider")
			this.order = Rider.orders[orderId];
		else
			this.order = Customer.orders[orderId];

		this.loadStatus(this.order, orderFrom);
		this.loadRestaurant(this.order);
		this.printItems(this.order);
	},

	loadRestaurant: function(order){
		document.getElementById("orderPage_restaurant_name").innerHTML = order.restaurant.name;
	},

	loadStatus: function(order, orderFrom){
		document.getElementById("orderPage_status").innerHTML = order.getStatus();
		let html = "";
		if(orderFrom == "restaurant"){
			switch(order.restaurantStatus["c"][0]){
				case 0:
					html = '<button class="button" onclick="OrderPage.acceptOrder()">Accept Order</button>';
					break;

				case 1:
					html = '<button class="button" onclick="OrderPage.setReadyForCollection()">Mark Order Ready To Collect</button>';
					break;

				case 2:
					html = 	'<input type="text" class="input" id="keyInput" placeholder="Enter the riders key" style="width:300px; max-width: 85%">' + 
							'<button class="button" onclick="OrderPage.scanRiderKey()">Authenticate rider</button>';
					break;

				case 3:
					break;
			}
		}
		else if(orderFrom == "job" || orderFrom == "rider"){
			switch(order.riderStatus["c"][0]){
				case 0:
					html = '<button class="button" onclick="OrderPage.offerDelivery()">Offer Delivery</button>';
					break;

				case 1:
					html = 	'<div id="qrcode" style="margin-top:10px; margin-bottom:10px"></div>'+		
							'<h4 class="text-center" id="keyText"></h4>';
					var paymentKey = localStorage.getItem("riderKey"+order.address);
					break;

				case 2:
					html = 	'<input type="text" class="input" id="keyInput" placeholder="Enter the riders key" style="width:300px; max-width: 85%">' + 
							'<button class="button" onclick="OrderPage.scanCustomerKey()">Authenticate customer</button>';
					break;

				case 3:
					break;
			}
		}
		else if(orderFrom == "customer"){
			html = 	'<div id="qrcode" style="margin-top:10px; margin-bottom:10px"></div>'+		
					'<h4 class="text-center" id="keyText"></h4>';
			var paymentKey = localStorage.getItem("customerKey"+order.address);
		}
		document.getElementById("order_actions").innerHTML = html;
		if(typeof paymentKey != "undefined"){
			console.log("key: " + paymentKey);
			if(paymentKey != null){
				new QRCode(document.getElementById("qrcode"), paymentKey);
				$("#keyText").html("Payment Key: " + paymentKey);
			}else{
				console.log("ERROR: key for rider set but none found in local storage, please make a new one");
			}
		}
	},

	printItems: function(order){

		console.log(order);

		order.items.forEach(item => {
		
			html = '<div class="columns" style="border-bottom: grey 1px dashed; padding: 5px; padding-top: 5px; padding-bottom: 5px">'+
					'<div class="column is-1">'+
						'<h1 class="title is-6">-</h1>'+
					'</div>'+
					'<div class="column is-9">'+
						'<h1 class="title is-6 itemName">'+item.itemName+' - '+item.optionName+'</h1>'+
						'<h1 class="subtitle is-7">';
							
			item.extraNames.forEach(option => {
				html += option +'<br>';
			});				

			html +=		'</h1>'+
					'</div>'+
					'<div class="column is-2">'+
						'<h1 class="title is-6">'+item.price+'</h1>'+
						'<h1 class="subtitle is-7">';
			
			item.extraPrices.forEach(price => {
				html += price+'<br>';
			});

 			html += 	'</h1>'+
					'</div>'+
				'</div>'

			document.getElementById("orderItems").insertAdjacentHTML("beforeEnd", html);


		});

		

	},

	offerDelivery: function(){
		Rider.offerDelivery(this.order);
	},

	removeAllItems: function(){
		document.getElementById("orderItems").innerHTML = "";
	},

	acceptOrder: function(){
		this.order.orderInstance.setOrderStatus(1).then(function(res){
			console.log(res);
		});
	},

	setReadyForCollection: function(){
		this.order.orderInstance.setOrderStatus(2).then(function(res){
			console.log(res);
		});
	},

	scanRiderKey: async function(){
		let enteredKey = document.getElementById("keyInput").value;
		let hash = await App.controllerInstance.getHash(enteredKey);
		console.log(this.order.restaurantHash, hash);
		if(hash == this.order.restaurantHash){
			await this.order.orderInstance.restaurantSubmitKey(web3.fromAscii(document.getElementById("keyInput").value));
		}
		else{
			alert("keys are different");
		}
	},

	scanCustomerKey: async function(){
		let enteredKey = document.getElementById("keyInput").value;
		let hash = await App.controllerInstance.getHash(enteredKey);
		if(hash == this.order.riderHash){
			await this.order.orderInstance.riderSubmitKey(web3.fromAscii(document.getElementById("keyInput").value));
		}
		else{
			alert("keys are different");
		}
	},
}