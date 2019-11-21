searchPage = {

	currentPage: 0,

	restaurants: [],

	// this should be modified to get restaurants between indexes
	getRestaurants: async function(){
		console.log("getting Restaurants");
		var restaurantCount = await App.restaurantFactoryInstance.restaurantCount();
		for(var i = 0; i<restaurantCount;i++){
			(function(counter){
				App.restaurantFactoryInstance.restaurants0(i).then(async function(address){
					console.log("new restaurant");
					searchPage.restaurants[counter] = new Restaurant(address);
					await searchPage.restaurants[counter].getRestaurant(address);
				});
			})(i);
		}
	},

	printRestaurants: function(){

	}

	printRestaurant: function(){
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