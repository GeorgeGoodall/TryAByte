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
	this.itemExtras = []; // int array pointing to extras IDs
	this.itemExtrasOnchain = [];
	this.itemExtrasToDelete = []; // int array of extra ID's to remove from the blockchain
	this.itemOptions = [];
	this.itemOptionsOnChain = [];
	this.itemOptionToDelete = [];
	this.toBeDeleted = false;
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
		this.extrasIdCap = 1;
		this.optionsIdCap = 1;
		this.extras = {
			values : [],
		};
		this.options = {
			values : [],
		};

		this.onChain = false;
	}

	async getRestaurant(address = "0x0"){
		console.time('getting restaurant ' + address);
		console.log("getting restaurant at address: " + address);
		// if an address was assigned, overwrite the default parameters
		if(address != "0x0000000000000000000000000000000000000000"){

			this.onChain = true;
			this.contractAddress = address;
			this.restaurantInstance = await new App.contracts.Restaurant(address);

			const namePromise = this.restaurantInstance.name();
			const addressPromise = this.restaurantInstance.location();
			const contactNumberPromise = this.restaurantInstance.contactNumber();
			const logoHashPromise = this.restaurantInstance.logoHash();
			const logoURIPromise = this.restaurantInstance.logoURI();
			const menuAddressPromise = this.restaurantInstance.getMenuAddress();

			let result = await Promise.all([namePromise,addressPromise,contactNumberPromise,logoHashPromise,logoURIPromise,menuAddressPromise]);

			this.name = web3.toUtf8(result[0]);
			this.address = web3.toUtf8(result[1]);
			this.number = result[2];
			this.logoHash = result[3];
			this.logoAddress = web3.toUtf8(result[4]);
			this.menuAddress = result[5];

			this.menuInstance = await new App.contracts.Menu(this.menuAddress);

			this.getRestaurantExtras();
			this.getRestaurantOptions();	
			const length = await this.menuInstance.length();


			
			let menuItemPromises = [];
			for(let i = 0; i < length; i++){
				const menuPromise = this.menuInstance.getEntry(i);
				menuItemPromises.push(menuPromise);
			}

			await Promise.all(menuItemPromises).then((values)=>{
				for(let i = 0; i < values.length; i++){
					this.menu[i] = new MenuItem();
					this.menu[i].id = i;
					this.menu[i].name = web3.toUtf8(values[i][0]);
					this.menu[i].description = web3.toUtf8(values[i][1]);
					for(var j = 0; j < values[i][2].length; j++){
						this.addOptionToItem(i,values[i][2][j]);
					}
					for(var j = 0; j < values[i][3].length; j++){
						this.addExtraToItem(i,values[i][3][j]);
					}
					this.menu[i].onChain = true;
				}
				console.timeEnd('getting restaurant ' + address);
			});

			
		}
	}

	async getRestaurantExtras(){
		this.extrasIdCap = await this.menuInstance.getExtraHead();
		this.extrasIdCap = this.extrasIdCap["c"][0];

		let promiseArray = [];
		for(let i = 1 ; i < this.extrasIdCap; i++){
			let currentExtraPromise = this.menuInstance.getExtra(i);
			promiseArray.push(currentExtraPromise);
		}

		Promise.all(promiseArray).then((values)=>{
			for(let i = 0; i < values.length; i++){
				if(values[i][2] == true){// if extra is active
					this.addMenuExtra(web3.toUtf8(values[i][0]),values[i][1]["c"][0],i+1,true);
				}
			}
		});

	}

	async getRestaurantOptions(){
		this.optionsIdCap = await this.menuInstance.getOptionHead();
		this.optionsIdCap = this.optionsIdCap["c"][0];

		let promiseArray = [];
		for(let i = 1 ; i < this.optionsIdCap; i++){
			let currentOptionPromise = this.menuInstance.getOption(i);
			promiseArray.push(currentOptionPromise);
		}

		Promise.all(promiseArray).then((values)=>{
			for(let i = 0; i < values.length; i++){
				if(values[i][2] == true){// if extra is active
					this.addMenuOption(web3.toUtf8(values[i][0]),values[i][1]["c"][0],i+1,true);
				}
			}
		});
	}

	async setRestaurant(){
		makeRestaurant(this);
	}

	getExtraFromNameAndPrice(name,price){
		for(let i = 0; i < this.extras.values.length; i++){
			if(this.extras.values[i].name == name.trim() && this.extras.values[i].price == price.trim()){
				return this.extras.values[i];
			}
		}
		return false;
	}

	addExtraToItem(_itemId, _extraId){
		if(this.menu[_itemId].itemExtrasToDelete.includes(_extraId)){
			// delete from to delete array
			let index = this.menu[_itemId].itemExtrasToDelete.indexOf(_extraId);
			this.menu[_itemId].itemExtrasToDelete.splice(index,1);
			// add back in with onchain
			if(!this.menu[_itemId].itemExtras.includes(_extraId)){
				this.menu[_itemId].itemExtras.push(_extraId);
				this.menu[_itemId].itemExtrasOnchain.push(true); // maybe should check here
				return true;
			}
			else{
				index = this.menu[_itemId].itemExtras.indexOf(_extraId);
				this.menu[_itemId].itemExtrasOnchain[index] = true;
				return true;
			}

		}
		else if(!this.menu[_itemId].itemExtras.includes(_extraId)){
			this.menu[_itemId].itemExtras.push(_extraId);
			this.menu[_itemId].itemExtrasOnchain.push(false);
			return true;
		}
		return false;
	}

	unassignExtra(_itemId,_extraId){
		let index = this.menu[_itemId].itemExtras.indexOf(_extraId);
		if(index != null){

			if(this.menu[_itemId].itemExtrasOnchain[index]){
				this.menu[_itemId].itemExtrasToDelete.push(_extraId);
			}

			this.menu[_itemId].itemExtras.splice(index,1);
			this.menu[_itemId].itemExtrasOnchain.splice(index,1);
			return true;
		}
		return false;
	}

	addMenuExtra(_name = "",_price = "",_id=null,_onChain = false){

		_name = _name.trim();
		if(typeof _price == 'string'){
			_price = _price.trim();
			_price = parseInt(_price);
		}


		let extraExists = false;
		for(let i = 0; i < this.extras.values.length; i++){
			if(this.extras.values[i].name == _name && this.extras.values[i].price == _price){
				extraExists = true;
				break;
			}
		}

		if(!extraExists){
			if(_id == null){
				_id = this.extrasIdCap
			}
			if(_id >= this.extrasIdCap){
				console.log("===============");
				console.log(typeof _id, _id);
				console.log(typeof this.extrasIdCap, this.extrasIdCap);
				this.extrasIdCap = _id + 1;
			}
			this.extras.values[_id-1] = new ItemExtra(_id,_name,_price,_onChain);
			return true;
		}
		return false;
	}

	getOptionFromNameAndPrice(name,price){
		for(let i = 0; i < this.options.values.length; i++){
			if(this.options.values[i].name == name.trim() && this.options.values[i].price == price.trim()){
				return this.options.values[i];
			}
		}
		return false;
	}

	addOptionToItem(_itemId, _optionId){
		if(this.menu[_itemId].itemOptionToDelete.includes(_optionId)){
			// delete from to delete array
			let index = this.menu[_itemId].itemOptionToDelete.indexOf(_optionId);
			this.menu[_itemId].itemOptionToDelete.splice(index,1);
			// add back in with onchain
			if(!this.menu[_itemId].itemOptions.includes(_optionId)){
				this.menu[_itemId].itemOptions.push(_optionId);
				this.menu[_itemId].itemOptionsOnChain.push(true); // maybe should check here
				return true;
			}
			else{
				index = this.menu[_itemId].itemOptions.indexOf(_optionId);
				this.menu[_itemId].itemOptionsOnChain[index] = true;
				return true;
			}

		}
		else if(!this.menu[_itemId].itemOptions.includes(_optionId)){
			this.menu[_itemId].itemOptions.push(_optionId);
			this.menu[_itemId].itemOptionsOnChain.push(false);
			return true;
		}
		return false;
	}

	unassignOption(_itemId,_optionId){
		let index = this.menu[_itemId].itemOptions.indexOf(_optionId);
		if(index != null){

			if(this.menu[_itemId].itemOptionsOnChain[index]){
				this.menu[_itemId].itemOptionToDelete.push(_optionId);
			}

			this.menu[_itemId].itemOptions.splice(index,1);
			this.menu[_itemId].itemOptionsOnChain.splice(index,1);
			return true;
		}
		return false;
	}

	addMenuOption(_name = "",_price = "",_id=null,_onChain = false){

		_name = _name.trim();
		if(typeof _price == 'string'){
			_price = _price.trim();
			_price = parseInt(_price);
		}


		let optionExists = false;
		for(let i = 0; i < this.options.values.length; i++){
			if(this.options.values[i].name == _name && this.options.values[i].price == _price){
				optionExists = true;
				break;
			}
		}

		if(!optionExists){
			if(_id == null){
				_id = this.optionsIdCap;
			}
			if(_id >= this.optionsIdCap){
				console.log("===============");
				console.log(typeof _id, _id);
				console.log(typeof this.optionsIdCap, this.optionsIdCap);
				this.optionsIdCap = _id + 1;
			}
			this.options.values[_id - 1] = new ItemOption(_id,_name,_price,_onChain);
			return true;
		}
		return false;
	}


	removeMenuItem(id){
		if(id < this.menu.length){
			this.menu[id].toBeDeleted = true;
			for(option in this.menu[id].options.values){
				option.toBeDeleted = false;
			}
		}
	}


	removeMenuOption(id,optionID){
		if(id < this.menu.length && optionID < this.menu[id].options.values.length){
			this.menu[id].options.values[optionID].toBeDeleted = true;
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

	getItem(itemId) {
		let item = this.menu[itemId];
		if(typeof item == "undefined")
			return null;
		let options = [];
		let extras = [];
		for(let i = 0; i < item.itemOptions.length; i++){
			options.push(this.options.values[item.itemOptions[i]-1]);
		}
		for(let i = 0; i < item.itemExtras.length; i++){
			extras.push(this.extras.values[item.itemExtras[i]-1]);
		}
		return {"item":item, "options":options, "extras":extras};
	}

	makeOrder(order){
		if(Customer.getCustomer()){
			Customer.customerInstance.makeOrder(this.contractAddress, order.paramIntegers, order.itemCount, order.deliveryFee, );
		}
		else{
			alert("no customer account");
		}
	}
}
