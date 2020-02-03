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
		this.restaurant = restaurant;
		this.insertRestaurantInformation(restaurant);
		document.getElementById("view_menu").innerHTML = "";
		for(let i = 0; i < restaurant.menu.length; i++)
			this.printMenuItem(restaurant.menu[i]);
		document.getElementById("backToForm_But").style.display = 'none'

		return true;
	},

	populatePageWithNew: async function(){
		if(RestaurantSettingsPage.restaurant != null){	
			// add a button to go back to the restaurant form
			this.insertRestaurantInformation(RestaurantSettingsPage.restaurant);
		    if(RestaurantSettingsPage.restaurant.logo != null && typeof RestaurantSettingsPage.restaurant.logo != 'undefined'){
				readerPreview = new FileReader();
			    readerPreview.onload = function(e) {
			    	console.log("setting logo preview");
			    	console.log(RestaurantSettingsPage.restaurant.logoFile);
			    	document.getElementById("view_logo").setAttribute('src', e.target.result);
			    }
		    	readerPreview.readAsDataURL(RestaurantSettingsPage.restaurant.logoFile);
		    }
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
		
		if(item.itemOptions.length == 1){
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

			for(let i = 0; i < item.itemOptions.length; i++){
				console.log(item.itemOptions[i]);
				html+=				'<h1 class="title is-6">'+this.restaurant.options.values[item.itemOptions[i]-1].name+'</h1>';
			}
			html+=				'</div>'+
								'<div class="column is-3">';
			for(let i = 0; i < item.itemOptions.length; i++)
				html+=				'<h1 class="title is-6" style="text-align: right">'+this.restaurant.options.values[item.itemOptions[i]-1].price+'</h1>';
				html+=			'</div>'+
								'<div class="column is-1">';
			for(let i = 0; i < item.itemOptions.length; i++){
				html+= 				'<img class="plus image is-16x16" src="images/plus.png" onclick="ViewPage.addToTrolly('+item.id+','+i+')">'+
									'<br>';
			}
			html+=				'</div>'+
							'</div>'+
						'</div>';
		}

		document.getElementById("view_menu").insertAdjacentHTML('beforeend',html);
	},

	currentItemId: null,
	currentOptionId: null,
	currentExtrasSelected: [],

	openExtrasPopup: function(itemId, optionId){

		this.currentItemId = itemId;
		this.currentOptionId = optionId;

		document.getElementById("extra_popup_item_name").innerHTML = this.restaurant.menu[itemId].name + " - " + this.restaurant.options.values[this.restaurant.menu[itemId].itemOptions[optionId]-1].name;
		document.getElementById("extra_popup_extra_list").innerHTML = "";

		for(let i = 0; i < this.restaurant.menu[itemId].itemExtras.length; i++){
			let extraText = this.restaurant.extras.values[this.restaurant.menu[itemId].itemExtras[i]-1].name + " : " + this.restaurant.extras.values[this.restaurant.menu[itemId].itemExtras[i]-1].price;
			let html = '<a id="extra_popup_extra_list_item_'+i+'" class="list-item" onclick="ViewPage.extraPopupExtraClick('+i+')">'+
					   		extraText+
					  	'</a>';
			document.getElementById("extra_popup_extra_list").insertAdjacentHTML("beforeend",html);
		}

		document.getElementById("popup").style.display = "block";
		document.getElementsByTagName("body")[0].style.overflow ="hidden";
	},

	extraPopupExtraClick: function(id){
		let item = document.getElementById("extra_popup_extra_list_item_"+id);
		if(item.classList.contains("is-active")){
			item.classList.remove("is-active");
			this.currentExtrasSelected = this.currentExtrasSelected.filter(function(ele){	return ele != id; });
		}else{
			item.classList.add("is-active");
			this.currentExtrasSelected.push(id);
		}
	},

	submitPopup: function(){
		console.log(this.currentItemId);
		this.addToTrolly(this.currentItemId,this.currentOptionId,true,this.currentExtrasSelected);
		this.currentItemId = null;
		this.currentOptionId = null;
		this.currentExtrasSelected = [];
		this.closePopup();
	},

	closePopup: function(){
		document.getElementById("popup").style.display = "none";
		document.getElementsByTagName("body")[0].style.overflow ="auto";
	},

	// prints an item to trolly
	addToTrolly: function(itemId, option, withExtras, extras){

		// if the item has potential extras open a popup
		console.log(itemId, option);
		if(this.restaurant.menu[itemId].itemExtras.length > 0 && !withExtras){
			this.openExtrasPopup(itemId,option);
			return;
		}

		let itemInTrolly = false;
		let itemIndex = null;
		for(let i = 0; i < this.trolly.length; i++){
			if(this.trolly[i].item == itemId && this.trolly[i].option == option && arraysEqual(this.trolly[i].extras, extras)){
				this.trolly[i].count ++;
				itemInTrolly = true;
				itemIndex = i;
				break;
			}
		}

		if(typeof extras == "undefined")
			extras = [];
		
		let item = this.restaurant.menu[itemId];

		if(!itemInTrolly){
			this.trolly.push({"item": itemId,"option": option,"extras":extras, "count": 1});

			let	html = 	'<div class="trollyItem container columns" id="TrollyItem:'+itemId+','+option+'">'+
							'<div class="column is-1">'+
								'<h1 class="title is-6">-</h1>'+
							'</div>'+
							'<div class="column is-7">'+
								'<h1 class="title is-6 itemName">'+item.name+' - '+this.restaurant.options.values[item.itemOptions[option]-1].name+'</h1>'+
								'<h1 class="subtitle is-7">';
			
			for(let i = 0; i<extras.length; i++){
				html += this.restaurant.extras.values[this.restaurant.menu[itemId].itemExtras[extras[i]]-1].name + "<br>";
			}


			html+=				'</h1>'+
							'</div>'+
							'<div class="column is-2">'+
								'<h1 class="title is-6">'+this.restaurant.options.values[item.itemOptions[option]-1].price+'</h1>'+
								'<h1 class="subtitle is-7">';

			for(let i = 0; i<extras.length; i++){
				html += this.restaurant.extras.values[this.restaurant.menu[itemId].itemExtras[extras[i]]-1].price + "<br>";
			}

			html+= 				'</h1>'+			
							'</div>'+
							'<div class="column is-2">'+
								'<img class="plus image is-16x16" src="images/minus.png" onclick="ViewPage.removeFromTrolly('+itemId+','+option+')">'+
							'</div>'+
						'</div>';

			document.getElementById("trollyItems").insertAdjacentHTML('beforeend',html);	
		}
		else
			document.getElementById("TrollyItem:"+itemId+","+option).children[1].children[0].innerHTML = "X" + this.trolly[itemIndex].count + " " + item.name +' - '+this.restaurant.options.values[item.itemOptions[option]-1].name;

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

			let item = this.restaurant.getItem(this.trolly[i].item);

			console.log(item);

			total +=   item.options[this.trolly[i].option].price * this.trolly[i].count;

			for(let j = 0; j < this.trolly[i].extras.length; j++){
				total += item.extras[this.trolly[i].extras[j]].price * this.trolly[i].count;
			}
		}
		document.getElementById("trollyPaymentArea").children[0].innerHTML = 	'<h1 class="title is-6">Total:</h1>'+
																				'<h1 class="subtitle is-6">ETH: '+total+'</h1>';
	},

	// function to checkout
	checkout: async function(){
		// check if the user has a customer smart contract
		if(!await Customer.getCustomer()){
			if(confirm("you have no customer account, would you like to make one now?")){
				if(await Customer.makeCustomer()){
					alert("success");
				}
				else{
					alert("you require an account to make orders");
					return;
				}
			}
		}

		alert("checking out");
		let order = new Order(this.trolly,2000000000000000);
		this.restaurant.makeOrder(order);		

	}



}

function arraysEqual(a, b) {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (a.length != b.length) return false;

  // If you don't care about the order of the elements inside
  // the array, you should sort both arrays here.
  // Please note that calling sort on an array will modify that array.
  // you might want to clone your array first.

  for (var i = 0; i < a.length; ++i) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}