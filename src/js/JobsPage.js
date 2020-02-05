JobsPage = {
	init: function(){
		// get all restaurants (eventually in local area)
		let i = 0;
		SearchPage.restaurants.forEach((restaurant) => {
			restaurant.getOrders().then(()=>{
				let j = 0;
				restaurant.orders.forEach((order)=>{
					if(order.riderStatus == 0){
						this.printOrder(order,i,j);
					}
					j++;
				});
				i++;
			});
		});
	},

	printOrder: function(order,i,j){

		html = '<div class="box" style="width: 60%" onclick="OrderPage.loadOrder(\'job\','+j+','+i+')">'+
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

		document.getElementById("currentJobsList").insertAdjacentHTML("beforeend",html);

	},
}