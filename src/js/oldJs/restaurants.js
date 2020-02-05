
function printRestaurant(restaurant){

	html = '<div class="box">'+
						'<div class="columns">'+
							'<div class="column is-1">'+
								'<figure class="image is-64x64" style="">'+
									'<img src="'+restaurant.logo+'">'+
								'</figure>'+
							'</div>'+
							'<div class="column is-4">'+
								'<h1 class="title">'+restaurant.name+'</h1>'+
								'<p class="subtitle">'+restaurant.address+'</p>'+
							'</div> '+
							'<div class="column is-4">'+
								'Open Now'+
							'</div> '+
						'</div>'+
					'</div>';

	document.getElementById('restaurantOutput').insertAdjacentHTML('beforeend',html);
}
