ViewPage = {



	init: function(restaurantIndex){
		let rest = searchPage.getRestaurant(restaurantIndex);
		console.log(rest);
		this.populatePage(rest);
	},

	populatePage: async function(restaurant){

		this.insertRestaurantInformation(restaurant);
		document.getElementById("view_menu").innerHTML = "";
		for(let i = 0; i < restaurant.menu.length; i++)
			this.printMenuItem(restaurant.menu[i]);


		return true;
	},

	insertRestaurantInformation: function(restaurant){
		document.getElementById("view_logo").src = restaurant.logoAddress;
		document.getElementById("view_name").innerHTML = restaurant.name;
		document.getElementById("view_address").innerHTML = restaurant.address;
	},

	printMenuItem: function(item){
		
		if(item.options.length == 1){
			var html = 	'<div class="product columns">'+
							'<div class="information column is-8">'+
								'<h1 class="title is-6">'+item.name+'</h1>'+
								'<h1 class="subtitle is-6">'+item.description+'</h1>	'+
							'</div>'+
							'<div class="column is-3">'+
								'<h1 class="title is-6" style="text-align: right">'+item.options[0].price+'</h1>'+
							'</div>'+
							'<div class="column is-1">'+
								'<img class="plus image is-16x16" src="images/plus.png">'+
							'</div>'+
						'</div>'
		}

		else{
			var html = 	'<div class="product">'+
							'<div class="information">'+
								'<h1 class="title is-6">'+item.name+'</h1>'+
								'<h1 class="subtitle is-6">'+item.description+'</h1>'+
							'</div>'+
							'<br>'+
							'<div class="options columns">'+
								'<div class="column is-8">';

			for(let i = 0; i < item.options.length; i++)
				html+=				'<h1 class="title is-6">'+item.options[i].name+'</h1>';
			html+=				'</div>'+
								'<div class="column is-3">';
			for(let i = 0; i < item.options.length; i++)
				html+=				'<h1 class="title is-6" style="text-align: right">'+item.options[i].price+'</h1>';
				html+=			'</div>'+
								'<div class="column is-1">';
			for(let i = 0; i < item.options.length; i++){
				html+= 				'<img class="plus image is-16x16" src="images/plus.png">'+
									'<br>';
			}
			html+=				'</div>'+
							'</div>'+
						'</div>';
		}

		document.getElementById("view_menu").insertAdjacentHTML('beforeend',html);
	},



}