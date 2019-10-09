Restaurant = {

	name: "Name",
	//address
	country: "Country",
	address: "address",
	town: "Town",
	county: "county",
	postcode: "postcode",


	number: "07987654321",
	logoAddress: "Images/index.png",
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
	console.log("changing: " + variable + " to: " + value);

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
	}else if(variable == 'logo'){
		Restaurant.logoAddress = value;
	}

	updateDisplay();
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