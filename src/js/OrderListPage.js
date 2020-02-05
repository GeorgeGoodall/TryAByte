OrderListPage = {

	isRestaurant: null,
	isRider: null,

	init: function(orders, isRestaurant = false, isRider = false){
		
		this.clearOrders();

		if(isRestaurant && !isRider)
			this.ordersFrom = "restaurant";
		else if(!isRestaurant && !isRider)
			this.ordersFrom = "customer";
		else if(!isRestaurant && isRider)
			this.ordersFrom = "rider";

		let i = 0;
		orders.forEach(order => {
			this.printOrder(order,i);
			i++;
		});
	},


	printOrder: function(order,i){

		html = '<div class="box" style="width: 60%" onclick="OrderPage.loadOrder(\''+this.ordersFrom+'\','+i+')">'+
					'<a href="/#order">'+
						'<div class="columns">'+
							'<div class="column is-2">'+
								'<figure class="image is-128x128" style="">'+
									'<img src="Images/burger.jpg">'+
								'</figure>'+
							'</div>'+
							'<div class="column is-6">'+
								'<h1 class="title is-4">'+order.restaurant.name+'</h1>'+
								'<p class="subtitle">'+order.creationTime+'</p>'+
							'</div>'+
							'<div class="column is-4">'+
							'</div> '+
						'</div>'+
					'</a>'+
				'</div>';

		if(order.getStatus() == "Delivered")
			document.getElementById("previousOrdersList").insertAdjacentHTML("beforeend",html);
		else
			document.getElementById("currentOrdersList").insertAdjacentHTML("beforeend",html);

	},

	clearOrders: function(){
		document.getElementById("currentOrdersList").innerHTML = "";
		document.getElementById("previousOrdersList").innerHTML = "";
	}


}