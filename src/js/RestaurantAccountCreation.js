Restaurant = {

	name: "Name",
	//address
	country: "Country",
	address: "address",
	town: "Town",
	county: "county",
	postcode: "postcode",

	contractAddress: null,
	restaurantInstance: null,


	number: "07987654321",

	logoAddress: "Images/index.png",
	logoHash: null,

	menu: [],

	init: function(){
		console.log("initialising new Restaurant");
		return this;
	},



}

// var MenuItem = {
// 	name: null,
// 	description: null,
// 	options: [],
// 	prices: [],

// 	init: function(){
		
// 	},

// 	addOption: function(option, price){

// 	},
// }

function MenuItem(){
	this.name = null;
	this.description = null;
	this.options = [];
	this.prices = [];
}

function updateRestaurantObject(variable, value){
	// update object
	if(variable == 'name'){
		Restaurant.name = value;
	}else if(variable == 'country'){
		Restaurant.country = value;
	}else if(variable == 'address'){
		Restaurant.address = value;
	}else if(variable == 'town'){
		Restaurant.town = value;
	}else if(variable == 'county'){
		Restaurant.county = value;
	}else if(variable == 'postcode'){
		Restaurant.postcode = value;
	}else if(variable == 'number'){
		Restaurant.number = value;
	}

	updateDisplay();
}

async function formSubmit(){
	checkLogin().then(function(res){
		if(res){
			makeRestaurant();
			return false;
		  }
	});
	return false;
}

async function checkLogin(){
	if(App.account == "0x0" || App.account == null){
		App.login().then(function(result){
			if(result){
				alert("logged in as: " + App.account);
				return true;

			}else{
				alert("could not log you in:");
				return false;
			}
		})
	}

	return true;
}

async function getRestaurant(){
	if(typeof App.address == "undefined" || App.address == null)
		App.login();

	Restaurant.contractAddress = await App.restaurantFactoryInstance.restaurants2(App.account);
	Restaurant.restaurantInstance = await new App.contracts.Restaurant(Restaurant.contractAddress);
}

async function makeRestaurant(){

	// get all inputs and check they ok
	var name = document.getElementById('name').value;
	var country = document.getElementById('country').value;
	var address = document.getElementById('address').value;
	var town = document.getElementById('town').value;
	var county = document.getElementById('county').value;
	var postcode = document.getElementById('postcode').value;
	var number = document.getElementById('number').value;

	//ToDo: checks on input
	//ToDo: get coordinates from address using google reverse map thing

	var _address =  address  + "," + town + "," + county + "," + country + "," + postcode;
	var errorString = "";
	if(typeof name == 'undefined')
		errorString += "name is undefined\n";
	if(typeof country == 'undefined')
		errorString += "country is undefined\n";
	if(typeof address == 'undefined')
		errorString += "address is undefined\n";
	if(typeof town == 'undefined')
		errorString += "town is undefined\n";
	if(typeof county == 'undefined')
		errorString += "county is undefined\n";
	if(typeof postcode == 'undefined')
		errorString += "postcode is undefined\n";
	if(typeof number == 'undefined')
		errorString += "number is undefined\n";
	if(Restaurant.logoHash == null)
		errorString += "please upload a logo\n";
	// should check that a logo has been uploaded
		
	// should check that the menu is valid

	if(errorString != ""){
		alert(errorString);
	}
	else{
		// make restaurant
		console.log("making restaurant");
		App.restaurantFactoryInstance.createRestaurant(name,web3.fromAscii(_address),10,10,number,{from: App.account, gas: 4000000}).then(async function(err,result){
	      console.log(err);
	      console.log(result);


	      Restaurant.contractAddress = await App.restaurantFactoryInstance.restaurants2(App.account);
	      Restaurant.restaurantInstance = await new App.contracts.Restaurant(Restaurant.contractAddress);
	      console.log("restaurant Made at: " + Restaurant.contractAddress);
	      
	      console.log("commit Logo");
	      await commitLogo();
	      
	      // add the restaurant menu



	    });

	}

	
}

async function makeMenu(){
	var itemNames = [];
	var itemDescriptions = [];
	var optionNames = [];
	var optionPrices = [];
	var optionFlags = []; // this will store the lengths of each grouping of options in the 1D array

	for(var i = 0; i < Restaurant.menu.length; i++){
		itemNames.push(web3.fromAscii(Restaurant.menu[i].name));
		itemDescriptions.push(web3.fromAscii(Restaurant.menu[i].description));
		for(var j = 0; j < Restaurant.menu[i].options.length; j++){
			optionNames.push(web3.fromAscii(Restaurant.menu[i].options[j]));
		}
		for(var j = 0; j < Restaurant.menu[i].prices.length; j++){
			optionPrices.push(Restaurant.menu[i].prices[j]);
		}
		optionFlags.push(Restaurant.menu[i].options.length);
	}

	console.log(itemNames,itemDescriptions,optionNames,optionPrices,optionFlags);

	Restaurant.restaurantInstance.menuAddItems(itemNames,itemDescriptions,optionNames,optionPrices,optionFlags,{from: App.account, gas: 4000000}).then(function(err,result){
	      console.log(err);
	      console.log(result);
	})
}

async function commitLogo(){
	var messageToSign = 'Request to commit logo to storage to be used by contract at ' + Restaurant.contractAddress;

	const msgParams = [
	{
	    type: 'string',      	// Any valid solidity type
	    name: 'restaurantAddress',   // Any string label you want
	    value: messageToSign, 
	}];

	await web3.currentProvider.sendAsync(
	{
	    method: 'eth_signTypedData',
	    params: [msgParams, App.account],
	    from: App.account,
  	}, 
  	async function (err, result) {

  		console.log("requesting logo update to server for restaurant at: " + Restaurant.contractAddress);
  		
  		console.log(result);

  		$.ajax({ 
		      type: 'POST', 
		      url: '/commitLogo',
		      async: true,
		      data: {
		      			signature: result.result,
		    			contractAddress: Restaurant.contractAddress,
		    		},
		      dataType: 'json',
		      success: function (data) {
		      	console.log(data);
		      	Restaurant.logoAddress = data.location;
		      	Restaurant.restaurantInstance.updateLogo(Restaurant.logoAddress, Restaurant.logoHash,{from: App.account, gas: 4000000})
		      	.then(function(result){
		      		console.log(result);
		      	});		      },
		      error: function (error){
		      	if(error.status == 503){
		      		alert("No Logo Found, please upload one");
		      	}
		      	else{
		      		alert("Failed to commit logo");
		      	}
		      	
		      }
		    });		
  	});
	
}

async function uploadLogo(input) {

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
	      	Restaurant.logoHash = hashString;
	      	console.log("setting logo hash");
	    }
	    
	    // upload image to server
	    data = new FormData();
	    data.append( 'file', logoInput.files[0] );
	    data.append( 'userAddress', App.account );
	    console.log("updating image from " + App.account);

	    var messageLock = false;

	    xhr = new XMLHttpRequest();
	    xhr.open( 'POST', '/uploadTemp', true );
	    xhr.onreadystatechange = function ( response ) {
	    	if(response.target.responseText != "" && !messageLock){
	    		messageLock = true;
		    	if(response.target.status != 200){
		    		alert("Error: " + response.target.responseText);
		    	}else{
		    		// initiate display of image
		    		readerPreview.readAsDataURL(logoInput.files[0]);
		    		// initiate getting image hash
		    		readerRaw.readAsArrayBuffer(logoInput.files[0]);
		    	}
	    	}
	    };
	    xhr.send(data);
	  }
}

function updateRestaurantMenu(_variable, value){
	

	// parse the variable id
	variable = _variable.split(",");

	console.log("updateing menu index:" + variable[1] + " with option " + variable[2]);

	if(typeof(Restaurant.menu[variable[1]]) == 'undefined')
		Restaurant.menu[variable[1]] = new MenuItem();

	




	if(variable[0] == 'itemName'){
		Restaurant.menu[variable[1]].name = value;
	}else if(variable[0] == 'itemDescription'){
		Restaurant.menu[variable[1]].description = value;
	}else if(variable[0] == 'itemOption'){
		Restaurant.menu[variable[1]].options[variable[2]] = value;
	}else if(variable[0] == 'itemPrice'){
		Restaurant.menu[variable[1]].prices[variable[2]] = value;
	}

	updateMenuDisplay();
}

function updateMenuDisplay(){

	document.getElementById('menu').innerHTML = "";
	for(var i = 0; i < Restaurant.menu.length; i++){
		item = Restaurant.menu[i];
		printMenuItem(item);
	}
}

function updateDisplay(){
	document.getElementById('restaurantName').innerHTML = Restaurant.name;
	

	addressString = Restaurant.address + ', ' + Restaurant.town + ', ' + Restaurant.postcode;

	document.getElementById('restaurantAddress').innerHTML = addressString;
	document.getElementById('restaurantNumber').innerHTML = Restaurant.number;
	document.getElementById('restaurantLogo').src = Restaurant.logoAddress;
}

function printMenuItem(item){

	if(item.options.length <= 1)
		html = 
			'<div class="product">'+
				'<h1 class="title is-7">'+
					'<span>'+item.name+'</span>'+
					'<span><button class="button is-small itemAddButton">Add</button></span>'+
					'<span class="price">'+item.prices[0]+'</span>'+
				'</h1>'+
				'<h1 class="subtitle is-7" style="margin-right: 150px;">'+item.description+'</h1>'+
			'</div>';
	else{
		html = 
			'<div class="product">'+
				'<h1 class="title is-7">'+item.name+'</h1>'+
				'<h1 class="subtitle is-7" style="margin-right: 150px; margin-bottom: 50px;">'+item.description+'</h1>';
				
		for(var i = 0; i < item.options.length; i++){
			option = '<div class="title is-7">'+
						'<span>'+item.options[i]+'</span>'+
						'<span><button class="button is-small itemAddButton">Add</button></span>'+
						'<span class="price">'+item.prices[i]+'</span>'+
					'</div>';
			html += option;
		}
		html += '</div>';
	}


	

	document.getElementById('menu').insertAdjacentHTML('beforeend',html); 
}

totalRows = 0;
totalOptions = [];

function menuStagingAddRow(){
	html = '<tr>'+
				'<th><input onkeyup="updateRestaurantMenu(this.id,this.value)" style="min-width: 300px" type="text" class="input is-small" id="itemName,'+totalRows+'"></th>'+
				'<th><textarea onkeyup="updateRestaurantMenu(this.id,this.value)" style="min-width: 400px" name="" id="itemDescription,'+totalRows+'" cols="30" rows="3" class="textarea is-small"></textarea></th>'+
				'<th style="min-width: 100px; max-width: 300px" id="itemOptions'+totalRows+'"><input onkeyup="updateRestaurantMenu(this.id,this.value)" id="itemOption,'+totalRows+',0" type="text" class="input is-small" placeholder="leave empty if no options"></th>'+
				'<th style="min-width: 100px; max-width: 200px" id="itemPrices'+totalRows+'"><input onkeyup="updateRestaurantMenu(this.id,this.value)" id="itemPrice,'+totalRows+',0" type="text" class="input is-small"></th>'+
				'<th><button class="button" onclick="menuStagingAddOption('+totalRows+'); return false;">Add Option</button></th>'+
			'</tr>';

	totalOptions[totalRows] = 1;
	totalRows++;

	document.getElementById('menuBody').insertAdjacentHTML('beforeend',html);
	return false; // to avoid page reload
}

function menuStagingAddOption(id){
	optionsCount = totalOptions[id];
	optionHtml = '<input id="itemOption,'+id+','+optionsCount+'" type="text" class="input is-small" placeholder="leave empty if no options" onkeyup="updateRestaurantMenu(this.id,this.value)">'
	priceHtml = '<input id="itemPrice,'+id+','+optionsCount+'" type="text" class="input is-small" onkeyup="updateRestaurantMenu(this.id,this.value)">';

	document.getElementById("itemOptions"+id).insertAdjacentHTML('beforeend',optionHtml);
	document.getElementById("itemPrices"+id).insertAdjacentHTML('beforeend',priceHtml);

	totalOptions[id]++;
}

function init(){
	Restaurant.init();
	updateDisplay();
}




$(function() {
  $(window).load(function() {
  	init();
  });
});