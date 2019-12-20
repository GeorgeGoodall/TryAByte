SearchPage = {

	currentPage: 0,

	restaurants: [],

	initialised: false,

	init: async function(){
		if(!this.initialised){
			await this.getRestaurants();
			await this.printRestaurants();
			this.initialised = true;
		}
	},

	// this should be modified to get restaurants between indexes
	getRestaurants: async function(){
		console.log("getting Restaurants");
		var restaurantCount = await App.restaurantFactoryInstance.restaurantCount();
		for(var i = 0; i<restaurantCount;i++){
			await App.restaurantFactoryInstance.restaurants0(i).then(async function(address){
				console.log("new restaurant");
				SearchPage.restaurants[i] = new Restaurant(address);
				await SearchPage.restaurants[i].getRestaurant(address);
			});
		}
	},

	printRestaurants: function(){
		for(let i = 0; i < this.restaurants.length; i++){
			this.printRestaurant(this.restaurants[i],i);
		}
	},

	printRestaurant: function(restaurant,index){
		let html = 	'<div class="box">'+
						'<a href="/#view/'+index+'">' +
							'<div class="columns">' +
								'<div class="column is-1">' +
									'<figure class="image is-64x64" style="">' +
										'<img src="">' +
									'</figure>' +
								'</div>' +
								'<div class="column is-4">' +
									'<h1 class="title">'+restaurant.name+'</h1>' +
									'<p class="subtitle">'+'</p>' +
								'</div> ' +
								'<div class="column is-4">' +
									'Open Now' +
								'</div> ' +
							'</div>' +
						'</a>' +
					'</div>';

		document.getElementById('restaurantOutput').insertAdjacentHTML('beforeend',html);

		/*

		<div class="box">
			<a href="/#view">
				<div class="columns">
					<div class="column is-1">
						<figure class="image is-64x64" style="">
							<img src="https://d30v2pzvrfyzpo.cloudfront.net/uk/images/restaurants/32681.gif">
						</figure>
					</div>
					<div class="column is-4">
						<h1 class="title">Wiwo</h1>
						<p class="subtitle">chinese - noodles - halal</p>
					</div> 
					<div class="column is-4">
						Open Now
					</div> 
				</div>
			</a>
		</div>

		*/
	},



}