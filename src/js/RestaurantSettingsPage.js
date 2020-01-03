// this class represents the restaurant settings page
RestaurantSettingsPage = {
	
	restaurant: null,
	restaurantAddress: null,
	totalRows: 0, // stores the total items in the menu staging
	totalOptions: [], // stores the total options for each item in the menu staging
	initialised: false,

	checkHasRestaurant: async function(){
		this.restaurantAddress = await App.restaurantFactoryInstance.restaurants2(App.account);
		if(this.restaurantAddress != "0x0000000000000000000000000000000000000000")
			return true;
		return false;
	},

	init: async function(){
		if(typeof this.restaurant == "undefined" || this.restaurant == null){
			this.restaurant = new Restaurant();
			console.log("test");
			console.log(this.restaurant);
			if(this.restaurantAddress == null || this.restaurantAddress == "0x0000000000000000000000000000000000000000")
				this.restaurantAddress = await App.restaurantFactoryInstance.restaurants2(App.account);
			await this.restaurant.getRestaurant(this.restaurantAddress);
		}
		this.updateDisplay();
		this.updateMenuStagingDisplay();
		this.initialised = true;
		return true;
	},
	
	makeRestaurant: async function(){
		App.checkLogin().then(function(res){
			if(res){
				makeRestaurant(RestaurantSettingsPage.restaurant);
				return false;
			  }
		});
		return false;
	},

	makeMenu: async function(){
		App.checkLogin().then(function(res){
			if(res){
				makeMenu(RestaurantSettingsPage.restaurant);
				return false;
			  }
		});
		return false;
	},

	//**********************************************************************************************//
	// 			Events caused by user input 
	//**********************************************************************************************//

	updateRestaurantObject: function(variable, value){
		if(variable == 'name'){
			this.restaurant.name = value;
		}else if(variable == 'country'){
			this.restaurant.country = value;
			this.restaurant.fullAddress =  this.restaurant.address  + "," + this.restaurant.town + "," + this.restaurant.county + "," + this.restaurant.country + "," + this.restaurant.postcode;
		}else if(variable == 'address'){
			this.restaurant.address = value;
			this.restaurant.fullAddress =  this.restaurant.address  + "," + this.restaurant.town + "," + this.restaurant.county + "," + this.restaurant.country + "," + this.restaurant.postcode;
		}else if(variable == 'town'){
			this.restaurant.town = value;
			this.restaurant.fullAddress =  this.restaurant.address  + "," + this.restaurant.town + "," + this.restaurant.county + "," + this.restaurant.country + "," + this.restaurant.postcode;
		}else if(variable == 'county'){
			this.restaurant.county = value;
			this.restaurant.fullAddress =  this.restaurant.address  + "," + this.restaurant.town + "," + this.restaurant.county + "," + this.restaurant.country + "," + this.restaurant.postcode;
		}else if(variable == 'postcode'){
			this.restaurant.postcode = value;
			this.restaurant.fullAddress =  this.restaurant.address  + "," + this.restaurant.town + "," + this.restaurant.county + "," + this.restaurant.country + "," + this.restaurant.postcode;
		}else if(variable == 'number'){
			this.restaurant.number = value;
		}

		this.updateRestaurantDeetailsDisplay();
	},

	updateRestaurantMenu: function(_variable, value){
		console.log("updating " + _variable + " to " + value);

		variable = _variable.split(",");
		if(typeof(this.restaurant.menu[variable[1]]) == 'undefined'){
			this.restaurant.menu[variable[1]] = new MenuItem();
		}
	
		if(typeof variable[2] != 'undefined')
			if(typeof(this.restaurant.menu[variable[1]].options[variable[2]]) == 'undefined')
				this.restaurant.menu[variable[1]].options[variable[2]] = new ItemOption(variable[2]);

		var optionIndex = 0;
		if(typeof variable[2] != 'undefined')
			optionIndex = variable[2];
		
		if(variable[0] == 'itemName'){
			this.restaurant.menu[variable[1]].name = value;
		}else if(variable[0] == 'itemDescription'){
			this.restaurant.menu[variable[1]].description = value;
		}else if(variable[0] == 'itemOption'){
			this.restaurant.menu[variable[1]].options[optionIndex].name = value;
			if(this.restaurant.initialised)
				this.restaurant.menu[variable[1]].options[optionIndex].onChain = false;
		}else if(variable[0] == 'itemPrice'){
			this.restaurant.menu[variable[1]].options[optionIndex].price = value;
		}else if(variable[0] == 'onChain'){
			this.restaurant.menu[variable[1]].onChain = value;
		}
		this.updateMenuDisplay();
	},

	uploadLogo: function(input) {
		App.login();

		// set image
		var preview = document.getElementById("restaurantLogo");
		var reader;

		var logoInput = document.getElementById("logoInput");

		if (logoInput.files && logoInput.files[0]) {
		    // display the image
		    readerPreview = new FileReader();
		    readerPreview.onload = function(e) {
		    	  preview.setAttribute('src', e.target.result);
		    }
		    
		    // hash the image
		    readerRaw = new FileReader();
		    readerRaw.onload = async function(e) {
		      	var arrayBuffer = e.target.result
		      	var digestBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
		      	var byteArray = new Uint8Array(digestBuffer);
		      	console.log(byteArray);
		      	var hashString = "0x";
		      	for(var i = 0; i < byteArray.length; i++){
		      		var currentByte = byteArray[i].toString(16);
		      		if(currentByte.length == 1)
		      			currentByte = "0"+currentByte;
		      		hashString+=currentByte;

		      	}
		      	RestaurantSettingsPage.restaurant.logoHash = hashString;
		      	console.log("setting logo hash");
		    }

		    RestaurantSettingsPage.restaurant.logoFile = logoInput.files[0];


		    readerPreview.readAsDataURL(logoInput.files[0]);
		    readerRaw.readAsArrayBuffer(logoInput.files[0]);

		    
		}
	},

	//**********************************************************************************************//
	// 			Display controls 
	//**********************************************************************************************//
	updateDisplay: function(){
		this.updateRestaurantDeetailsDisplay();
		this.updateMenuDisplay();
	},


	updateRestaurantDeetailsDisplay: function(){

		document.getElementById('restaurantName').innerHTML = this.restaurant.name;
		addressString = this.restaurant.address + ', ' + this.restaurant.town + ', ' + this.restaurant.postcode;
		document.getElementById('restaurantAddress').innerHTML = addressString;
		document.getElementById('restaurantNumber').innerHTML = this.restaurant.number;
		document.getElementById('restaurantLogo').src = this.restaurant.logoAddress;
	},


	updateMenuDisplay: function(){
		document.getElementById('menu').innerHTML = "";

		for(var i = 0; i < this.restaurant.menu.length; i++){
			item = this.restaurant.menu[i];
			if(typeof item != "undefined"){
				this.printMenuItem(item);
			}
		}
	},

	updateMenuStagingDisplay: function(){
		document.getElementById('menuBody').innerHTML = "";
		for(var i = 0; i < this.restaurant.menu.length; i++){
			item = this.restaurant.menu[i];
			if(typeof item != "undefined"){
				this.menuStagingAddRow(item);
			}
		}
	},

	printMenuItem: function(item) {

		console.log("printing menu item: " + item.name);
		if(item.toBeDeleted){
			
		}
		else{
			// print item to left menu display
			if(item.options.length <= 1)
				html = 
					'<div class="product">'+
						'<h1 class="title is-7">'+
							'<span>'+item.name+'</span>'+
							'<span><button class="button is-small itemAddButton">Add</button></span>'+
							'<span class="price">'+item.options[0].price+'</span>'+
						'</h1>'+
						'<h1 class="subtitle is-7" style="margin-right: 150px;">'+item.description+'</h1>'+
					'</div>';
			else{
				html = 
					'<div class="product">'+
						'<h1 class="title is-7">'+item.name+'</h1>'+
						'<h1 class="subtitle is-7" style="margin-right: 150px; margin-bottom: 50px;">'+item.description+'</h1>';
						
				for(var i = 0; i < item.options.length; i++){
					if(!item.options[i].toBeDeleted){
						var option = item.options[i];
						optionHTML = '<div class="title is-7">'+
									'<span>'+option.name+'</span>'+
									'<span><button class="button is-small itemAddButton">Add</button></span>'+
									'<span class="price">'+option.price+'</span>'+
								'</div>';
						html += optionHTML;
					}
				}
				html += '</div>';
			}
			document.getElementById('menu').insertAdjacentHTML('beforeend',html); 
		}	
	},


	menuStagingAddRow: function(item = new MenuItem()){
		var html = '<tr id="menuStagingRow'+this.totalRows+'">'+
					'<th><input onkeyup="RestaurantSettingsPage.updateRestaurantMenu(this.id,this.value)" style="min-width: 300px" type="text" class="input is-small" id="itemName,'+this.totalRows+'" value="'+item.name+'"></th>'+
					'<th><textarea onkeyup="RestaurantSettingsPage.updateRestaurantMenu(this.id,this.value)" style="min-width: 400px" name="" id="itemDescription,'+this.totalRows+'" cols="30" rows="3" class="textarea is-small" value="">'+item.description+'</textarea></th>'+
					'<th style="min-width: 100px; max-width: 300px" id="itemOptions'+this.totalRows+'">';
		if(item.options.length > 1)
			for(var i = 0; i < item.options.length; i++)
				html +=	'<input onkeyup="RestaurantSettingsPage.updateRestaurantMenu(this.id,this.value)" id="itemOption,'+this.totalRows+','+i+'" type="text" class="input is-small" placeholder="leave empty if no options" value="'+item.options[i].name+'">';
		html += 	'</th>'+
					'<th style="min-width: 100px; max-width: 200px" id="itemPrices'+this.totalRows+'">';
		if(item.options.length == 0){
			html +=		'<input onkeyup="RestaurantSettingsPage.updateRestaurantMenu(this.id,this.value)" id="itemPrice,'+this.totalRows+'" type="text" class="input is-small" value="">';
		}
		for(var i = 0; i < item.options.length; i++){
			html +=		'<input onkeyup="RestaurantSettingsPage.updateRestaurantMenu(this.id,this.value)" id="itemPrice,'+this.totalRows+','+i+'" type="text" class="input is-small" value="'+item.options[i].price+'">';
		}
		html += 	'</th>'+
					'<th style="width: 20px" id="itemDeletes'+this.totalRows+'">';
		if(item.options.length != 1)
			for(var i = 0; i < item.options.length; i++)
				html +=		'<div id="itemDelete,'+this.totalRows+','+i+'" style="height: 27px"><a class="delete" onclick="RestaurantSettingsPage.menuStagingRemoveOption('+this.totalRows+','+i+')"></a></div>';
		html += 	'</th>';
		if(!item.toBeDeleted){
			html += '<th style="width: 150px"><button class="button" onclick="RestaurantSettingsPage.menuStagingRemoveRow('+this.totalRows+'); return false;">Remove Item</button><button class="button" onclick="RestaurantSettingsPage.menuStagingAddOption('+this.totalRows+'); return false;">Add Option</button></th>';
		}
		html += '</tr>';


		if(!item.toBeDeleted){
			this.totalOptions[this.totalRows] = item.options.length;
			console.log("Printing menu staging with id: " + this.totalRows);
			this.totalRows++;
			document.getElementById('menuBody').insertAdjacentHTML('beforeend',html);
		}
		else{
			document.getElementById('menuToDelete').insertAdjacentHTML('beforeend',html);
		}
		
		return false; // to avoid page reload
	},

	menuStagingRemoveRow: function(id){
		var element = document.getElementById("menuStagingRow"+id);
		element.parentNode.removeChild(element);

		// need to remove the data from the restaurant object
		this.restaurant.removeMenuItem(id);
		this.updateDisplay();

		return false; // to avoid page reload
	},

	menuStagingAddOption: function(id){
		optionsCount = this.totalOptions[id];

		if(optionsCount == 1){ // if you are adding the first option, add the option name and delete button to the item price
			optionHtml = '<input id="itemOption,'+id+','+(optionsCount-1)+'" type="text" class="input is-small" placeholder="leave empty if no options" onkeyup="RestaurantSettingsPage.updateRestaurantMenu(this.id,this.value)" value="">'
			deleteButton = '<div id="itemDelete,'+id+','+(optionsCount-1)+'" style="height: 27px"><a class="delete" onclick="menuStagingRemoveOption('+id+','+(optionsCount-1)+')"></a></div>';
			document.getElementById("itemOptions"+id).insertAdjacentHTML('beforeend',optionHtml);
			document.getElementById("itemDeletes"+id).insertAdjacentHTML('beforeend',deleteButton);
		}

		optionHtml = '<input id="itemOption,'+id+','+optionsCount+'" type="text" class="input is-small" placeholder="leave empty if no options" onkeyup="RestaurantSettingsPage.updateRestaurantMenu(this.id,this.value)" value="">'
		priceHtml = '<input id="itemPrice,'+id+','+optionsCount+'" type="text" class="input is-small" onkeyup="RestaurantSettingsPage.updateRestaurantMenu(this.id,this.value)" value="">';
		deleteButton = '<div id="itemDelete,'+id+','+optionsCount+'" style="height: 27px"><a class="delete" onclick="RestaurantSettingsPage.menuStagingRemoveOption('+id+','+optionsCount+')"></a></div>';


		document.getElementById("itemOptions"+id).insertAdjacentHTML('beforeend',optionHtml);
		document.getElementById("itemPrices"+id).insertAdjacentHTML('beforeend',priceHtml);
		document.getElementById("itemDeletes"+id).insertAdjacentHTML('beforeend',deleteButton);

		this.totalOptions[id]++;
	},

	menuStagingRemoveOption: function(itemId,optionId){
		console.log("itemOption"+itemId+','+optionId);

		var element = document.getElementById("itemOption,"+itemId+','+optionId);
		element.parentNode.removeChild(element);
		element = document.getElementById("itemPrice,"+itemId+','+optionId);
		element.parentNode.removeChild(element);
		element = document.getElementById("itemDelete,"+itemId+','+optionId);
		element.parentNode.removeChild(element);

		this.restaurant.removeMenuOption(itemId, optionId);

		this.totalOptions[itemId]--;
		if(this.totalOptions[itemId] == 1){
			element = document.getElementById("itemOption,"+itemId+',0');
			element.parentNode.removeChild(element);
			element = document.getElementById("itemDelete,"+itemId+',0');
			element.parentNode.removeChild(element);
		}
		this.updateDisplay();
	},
}




