// menuItemClass
function ItemExtra(_id,_name = "",_price = "",_onChain = false){
	this.id = _id;
	this.name = _name;
	this.price = _price;
	this.onChain = _onChain;
	this.toBeDeleted = false;
}

function ItemOption(_id,_name = "",_price = "",_onChain = false){
	this.id = _id;
	this.name = _name;
	this.price = _price;
	this.onChain = _onChain;
	this.toBeDeleted = false;
}

// menuItemClass
function MenuItem(){
	this.id;
	this.name = "";
	this.description = "";
	this.options = [];
	this.itemExtras = []; // int array pointing to extras IDs
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

		this.menuAddress = null,
		this.menuInstance = null,

		this.menu = [];
		this.extrasIdCap = 0;
		this.extras = [];

		this.onChain = false;
	}

	async getRestaurant(address = "0x0"){
		console.log("getting restaurant at address: " + address);
		// if an address was assigned, overwrite the default parameters
		if(address != "0x0000000000000000000000000000000000000000"){
			this.onChain = true;
			this.contractAddress = restaurantAddress;
			this.restaurantInstance = await new App.contracts.Restaurant(address);

			this.name = web3.toUtf8(await this.restaurantInstance.name());
			this.address = web3.toUtf8(await this.restaurantInstance.location());
			this.number = web3.toAscii(await this.restaurantInstance.contactNumber());
			this.logoHash = await this.restaurantInstance.logoHash();
			this.logoAddress = web3.toUtf8(await this.restaurantInstance.logoURI());

			this.menuAddress = await this.restaurantInstance.getMenuAddress();
			console.log("got menu at address: " + this.menuAddress);
			this.menuInstance = await new App.contracts.Menu(this.menuAddress);


			let currentItem = await this.menuInstance.getEntry(0);
			let i = 0;

			// should come up with a better way of knowing when the menu has been traversed
			while(currentItem[0] != "0x0000000000000000000000000000000000000000000000000000000000000000" && currentItem[1] != "0x0000000000000000000000000000000000000000000000000000000000000000"){
				console.log(currentItem);
				this.menu[i] = new MenuItem();
				this.menu[i].id = i;
				this.menu[i].name = web3.toUtf8(currentItem[0]);
				this.menu[i].description = web3.toUtf8(currentItem[1]);
				for(var j = 0; j < currentItem[2].length; j++){
					this.menu[i].options[j] = new ItemOption(j,web3.toUtf8(currentItem[2][j]),currentItem[3][j],true);
				}
				this.menu[i].onChain = true;
				this.menu[i].id = i;

				i++;
				currentItem = await this.menuInstance.getEntry(i);
			}
		}
	}

	getExtrasList(){
		let extras = [];
		for(let i = 0; i < this.extras.length; i++){
			extras.push(this.extras[i].name + " : " + this.extras[i].price);
		}
		return extras;
	}

	async setRestaurant(){
		makeRestaurant(this);
	}

	getExtraFromNameAndPrice(name,price){
		for(let i = 0; i < this.extras.length; i++){
			if(this.extras[i].name == name.trim() && this.extras[i].price == price.trim()){
				return this.extras[i];
			}
		}
		return false;
	}

	addExtraToItem(_itemId, _extraId){
		if(!this.menu[_itemId].itemExtras.includes(_extraId)){
			this.menu[_itemId].itemExtras.push(_extraId);
			this.menu[_itemId].onChain = false;
			return true;
		}
		return false;
	}

	unassignExtra(_itemId,_extraId){
		let index = this.menu[_itemId].itemExtras.indexOf(_extraId);
		if(index != null){
			this.menu[_itemId].itemExtras.splice(index,1);
			return true;
		}
		return false;
	}

	addMenuExtra(_name = "",_price = "",_onChain = false){

		_name = _name.trim();
		_price = _price.trim();

		let extraExists = false;
		for(let i = 0; i < this.extras.length; i++){
			if(this.extras[i].name == _name && this.extras[i].price == _price){
				extraExists = true;
				break;
			}
		}

		if(!extraExists){
			this.extras.push(new ItemExtra(this.extrasIdCap,_name,_price,_onChain));
			this.extrasIdCap++;
			return true;
		}
		return false;
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
