ViewPage = {

	restaurant: null,
	trolly: [],

	populatePage: async function(restaurant){

		if(typeof restaurant == "number"){
			restaurant = SearchPage.restaurants[restaurant];
			if(typeof restaurant == 'undefined'){
				renderHome();
			}
		}
		this.insertRestaurantInformation(restaurant);
		document.getElementById("view_menu").innerHTML = "";
		for(let i = 0; i < restaurant.menu.length; i++)
			this.printMenuItem(restaurant.menu[i]);
		this.restaurant = restaurant;
		document.getElementById("backToForm_But").style.display = 'none'

		return true;
	},

	populatePageWithNew: async function(){
		if(RestaurantSettingsPage.restaurant != null){	
			// add a button to go back to the restaurant form
			this.insertRestaurantInformation(RestaurantSettingsPage.restaurant);
			readerPreview = new FileReader();
		    readerPreview.onload = function(e) {
		    	console.log("setting logo preview");
		    	console.log(RestaurantSettingsPage.restaurant.logoFile);
		    	document.getElementById("view_logo").setAttribute('src', e.target.result);
		    }
		    readerPreview.readAsDataURL(RestaurantSettingsPage.restaurant.logoFile);
			document.getElementById("view_menu").innerHTML = "";
			for(let i = 0; i < RestaurantSettingsPage.restaurant.menu.length; i++)
				this.printMenuItem(RestaurantSettingsPage.restaurant.menu[i]);
			this.restaurant = RestaurantSettingsPage.restaurant;		
			document.getElementById("backToForm_But").style.display = 'block';

			return true;
		}
		return false
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
								'<img class="plus image is-16x16" src="images/plus.png" onclick="ViewPage.addToTrolly('+item.id+',0)">'+
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
				html+= 				'<img class="plus image is-16x16" src="images/plus.png" onclick="ViewPage.addToTrolly('+item.id+','+i+')">'+
									'<br>';
			}
			html+=				'</div>'+
							'</div>'+
						'</div>';
		}

		document.getElementById("view_menu").insertAdjacentHTML('beforeend',html);
	},

	// prints an item to trolly
	addToTrolly: function(itemId, option){

		let itemInTrolly = false;
		let itemIndex = null;
		for(let i = 0; i < this.trolly.length; i++){
			if(this.trolly[i].item == itemId && this.trolly[i].option == option){
				this.trolly[i].count ++;
				itemInTrolly = true;
				itemIndex = i;
				break;
			}
		}
		
		let item = this.restaurant.menu[itemId];

		if(!itemInTrolly){
			this.trolly.push({"item": itemId,"option": option, "count": 1});

			let	html = 	'<div class="trollyItem container columns" id="TrollyItem:'+itemId+','+option+'">'+
							'<div class="column is-1">'+
								'<h1 class="title is-6">-</h1>'+
							'</div>'+
							'<div class="column is-7">'+
								'<h1 class="title is-6 itemName">'+item.name+'</h1>'+
								'<h1 class="subtitle is-7">'+item.options[option].name+'</h1>'+
							'</div>'+
							'<div class="column is-2">'+
								'<h1 class="title is-6">'+item.options[option].price+'</h1>'+
							'</div>'+
							'<div class="column is-2">'+
								'<img class="plus image is-16x16" src="images/minus.png" onclick="ViewPage.removeFromTrolly('+itemId+','+option+')">'+
							'</div>'+
						'</div>';

			document.getElementById("trollyItems").insertAdjacentHTML('beforeend',html);	
		}
		else
			document.getElementById("TrollyItem:"+itemId+","+option).children[1].children[0].innerHTML = "X" + this.trolly[itemIndex].count + " " + item.name;

		this.updateTotal();
		
	},

	removeFromTrolly: function(itemId, option){
		let noneLeft = false;
		let itemIndex = null;
		for(let i = 0; i < this.trolly.length; i++){
			if(this.trolly[i].item == itemId && this.trolly[i].option == option){
				if(this.trolly[i].count == 1){
					this.trolly.splice(i,1);
					noneLeft = true;
				}
				else{
					this.trolly[i].count --;
					itemIndex = i;
				}
				break;
			}
		}

		var itemNode = document.getElementById("TrollyItem:"+itemId+","+option);
		if(noneLeft)
			itemNode.parentNode.removeChild(itemNode);
		else{
			let item = this.restaurant.menu[itemId];
			document.getElementById("TrollyItem:"+itemId+","+option).children[1].children[0].innerHTML = "X" + this.trolly[itemIndex].count + " " + item.name;
		}

		this.updateTotal();
	},

	updateTotal: function(){
		let total = 0;
		for(let i = 0; i < this.trolly.length; i++){
			total += this.restaurant.menu[this.trolly[i].item].options[this.trolly[i].option].price * this.trolly[i].count;
		}
		document.getElementById("trollyPaymentArea").children[0].innerHTML = 	'<h1 class="title is-6">Total:</h1>'+
																				'<h1 class="subtitle is-6">ETH: '+total+'</h1>';
	}



}