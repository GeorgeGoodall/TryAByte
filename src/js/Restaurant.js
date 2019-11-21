// menuItemClass
function ItemOption(_id,_name = "",_price = "",_onChain = false){
	this.id = _id;
	this.name = _name;
	this.price = _price;
	this.onChain = _onChain;
	this.toBeDeleted = false;
}

// menuItemClass
function MenuItem(){
	this.name = "";
	this.description = "";
	this.options = [];
	this.options[0] = new ItemOption();
	this.onChain = false;
}

// Restaurant Class
// make this more efficient by running the async calls at the same time
class Restaurant{

	constructor(address = "0x0"){

		// default parameters
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

		this.onChain = false;
	}

	async getRestaurant(address = "0x0"){
		console.log("getting restaurant at address: " + address);
		// if an address was assigned, overwrite the default parameters
		if(address != "0x0"){
			this.onChain = true;
			this.contractAddress = restaurantAddress;
			this.restaurantInstance = await new App.contracts.Restaurant(address);

			this.name = web3.toUtf8(await this.restaurantInstance.name());
			this.address = web3.toUtf8(await this.restaurantInstance.location());
			this.number = web3.toUtf8(await this.restaurantInstance.contactNumber());
			this.logoHash = await this.restaurantInstance.logoHash();
			this.logoAddress = web3.toUtf8(await this.restaurantInstance.logoURI());

			var menuLength = await this.restaurantInstance.menuLength();
			console.log("has a menu length of: " + menuLength);

			for(var i = 0; i < menuLength; i++){
				var menuItem = await this.restaurantInstance.getMenuItem(i);
				this.menu[i] = new MenuItem();
				this.menu[i].name = web3.toUtf8(menuItem[0]);
				this.menu[i].description = web3.toUtf8(menuItem[1]);
				for(var j = 0; j < menuItem[4]; j++){
					this.menu[i].options[j] = new ItemOption(j,web3.toUtf8(menuItem[2][j]),menuItem[3][j],true);
				}
				this.menu[i].onChain = true;
				this.menu[i].id = i;
			}
		}
	}

	

	async setRestaurant(){
		makeRestaurant(this);
	}


	removeMenuItem(id){
		if(id < this.menu.length){
			this.menu[id].toBeDeleted = true;
			for(option in this.menu[id].options){
				option.toBeDeleted = false;
			}
		}
	}


	removeMenuOption(id,optionID){
		if(id < this.menu.length && optionID < this.menu[id].options.length){
			this.menu[id].options[optionID].toBeDeleted = true;
		}
	}

	// combine this and commit logo into one function
	uploadLogo(input) {
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
