// menuItemClass
function MenuItem(){
	this.name = "";
	this.description = "";
	this.options = [""];
	this.prices = [""];
	this.onChain = false;
	this.toBeDeleted = false;
}

// Restaurant Class
function Restaurant(address){
	this.name = "";
	this.country = "";
	this.address = "";
	this.town = "";
	this.county = "";
	this.postcode = "";
	this.fullAddress = "";
	this.number = "",

	this.logoAddress = "Images/index.png",
	this.logoHash = null,
	this.logoFile = null,
	
	this.contractAddress = null,
	this.restaurantInstance = null,

	this.menu = [];

	this.init = async function(){
		await this.getRestaurant();
	}

	this.getRestaurant = async function(){
		if(typeof App.address == "undefined" || App.address == null)
			await App.login();


		var restaurantAddress = await App.restaurantFactoryInstance.restaurants2(App.account);
		if(restaurantAddress != "0x"){
			console.log("Found restaurant at: " + restaurantAddress)
			this.contractAddress = restaurantAddress;
			this.restaurantInstance = await new App.contracts.Restaurant(this.contractAddress);

			this.name = web3.toUtf8(await this.restaurantInstance.name());
			this.address = web3.toUtf8(await this.restaurantInstance.location());
			this.number = web3.toUtf8(await this.restaurantInstance.contactNumber());
			this.logoHash = await this.restaurantInstance.logoHash();
			this.logoAddress = web3.toUtf8(await this.restaurantInstance.logoURI());

			var menuLength = await this.restaurantInstance.menuLength();
			console.log("has a menu length of: " + menuLength);

			for(var i = 0; i < menuLength; i++){
				var menuItem = await this.restaurantInstance.getMenuItem(i);
				this.updateRestaurantMenu("itemName,"+i,web3.toUtf8(menuItem[0]));
				this.updateRestaurantMenu("itemDescription,"+i,web3.toUtf8(menuItem[1]));
				for(var j = 0; j < menuItem[2].length; j++){
					this.updateRestaurantMenu("itemOption,"+i+","+j,web3.toUtf8(menuItem[2][j]));
				}
				for(var j = 0; j < menuItem[2].length; j++){
					this.updateRestaurantMenu("itemPrice,"+i+","+j,menuItem[3][j]);
				}
				this.updateRestaurantMenu("onChain,"+i,true);
				menuStagingAddRow(this.menu[i]);
			}

			updateMenuDisplay(this);

		}
	}

	this.setRestaurant = async function(){
		makeRestaurant(this);
	}

	this.updateRestaurantObject = function(variable, value){
		if(variable == 'name'){
			this.name = value;
		}else if(variable == 'country'){
			this.country = value;
			this.fullAddress =  this.address  + "," + this.town + "," + this.county + "," + this.country + "," + this.postcode;
		}else if(variable == 'address'){
			this.address = value;
			this.fullAddress =  this.address  + "," + this.town + "," + this.county + "," + this.country + "," + this.postcode;
		}else if(variable == 'town'){
			this.town = value;
			this.fullAddress =  this.address  + "," + this.town + "," + this.county + "," + this.country + "," + this.postcode;
		}else if(variable == 'county'){
			this.county = value;
			this.fullAddress =  this.address  + "," + this.town + "," + this.county + "," + this.country + "," + this.postcode;
		}else if(variable == 'postcode'){
			this.postcode = value;
			this.fullAddress =  this.address  + "," + this.town + "," + this.county + "," + this.country + "," + this.postcode;
		}else if(variable == 'number'){
			this.number = value;
		}
	}

	this.updateRestaurantMenu = function(_variable, value){
		console.log("updating " + _variable + " to " + value);

		variable = _variable.split(",");
		if(typeof(this.menu[variable[1]]) == 'undefined')
			this.menu[variable[1]] = new MenuItem();

		if(variable[0] == 'itemName'){
			this.menu[variable[1]].name = value;
		}else if(variable[0] == 'itemDescription'){
			this.menu[variable[1]].description = value;
		}else if(variable[0] == 'itemOption'){
			this.menu[variable[1]].options[variable[2]] = value;
		}else if(variable[0] == 'itemPrice'){
			this.menu[variable[1]].prices[variable[2]] = value;
		}else if(variable[0] == 'onChain'){
			this.menu[variable[1]].onChain = value;
		}
		updateMenuDisplay(this);
	}

	this.removeMenuItem = function(id){
		if(id < this.menu.length)
			this.menu[id].toBeDeleted = true;
	}

	// combine this and commit logo into one function
	this.uploadLogo = async function(input) {
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
		      	this.logoHash = hashString;
		      	console.log("setting logo hash");
		    }

		    this.logoFile = logoInput.files[0];


		    readerPreview.readAsDataURL(logoInput.files[0]);
		    readerRaw.readAsArrayBuffer(logoInput.files[0]);

		    
		}
	}
}
