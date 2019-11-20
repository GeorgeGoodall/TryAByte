var restaurant;

async function formSubmit(){
	checkLogin().then(function(res){
		if(res){
			makeRestaurant(restaurant);
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



//**********************************************************************************************//
// 			Display controls 
//**********************************************************************************************//
function updateDisplay(restaurant){
	document.getElementById('restaurantName').innerHTML = restaurant.name;
	addressString = restaurant.address + ', ' + restaurant.town + ', ' + restaurant.postcode;
	document.getElementById('restaurantAddress').innerHTML = addressString;
	document.getElementById('restaurantNumber').innerHTML = restaurant.number;
	document.getElementById('restaurantLogo').src = restaurant.logoAddress;

	//updateMenuDisplay(restaurant);
}

totalRows = 0;
totalOptions = [];
function updateMenuDisplay(restaurant){
	document.getElementById('menu').innerHTML = "";

	for(var i = 0; i < restaurant.menu.length; i++){
		item = restaurant.menu[i];
		if(typeof item != "undefined")
			printMenuItem(item);
	}
}

function printMenuItem(item){

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
				var option = item.options[i];
				optionHTML = '<div class="title is-7">'+
							'<span>'+option.name+'</span>'+
							'<span><button class="button is-small itemAddButton">Add</button></span>'+
							'<span class="price">'+option.price+'</span>'+
						'</div>';
				html += optionHTML;
			}
			html += '</div>';
		}
		document.getElementById('menu').insertAdjacentHTML('beforeend',html); 
	}

	
}


function menuStagingAddRow(item = new MenuItem()){
	var html = '<tr id="menuStagingRow'+totalRows+'">'+
				'<th><input onkeyup="restaurant.updateRestaurantMenu(this.id,this.value)" style="min-width: 300px" type="text" class="input is-small" id="itemName,'+totalRows+'" value="'+item.name+'"></th>'+
				'<th><textarea onkeyup="restaurant.updateRestaurantMenu(this.id,this.value)" style="min-width: 400px" name="" id="itemDescription,'+totalRows+'" cols="30" rows="3" class="textarea is-small" value="">'+item.description+'</textarea></th>'+
				'<th style="min-width: 100px; max-width: 300px" id="itemOptions'+totalRows+'">';
	if(item.options.length > 1)
		for(var i = 0; i < item.options.length; i++)
			html +=	'<input onkeyup="restaurant.updateRestaurantMenu(this.id,this.value)" id="itemOption,'+totalRows+','+i+'" type="text" class="input is-small" placeholder="leave empty if no options" value="'+item.options[i].name+'">';
	html += 	'</th>'+
				'<th style="min-width: 100px; max-width: 200px" id="itemPrices'+totalRows+'">';
	if(item.options.length == 0){
		html +=		'<input onkeyup="restaurant.updateRestaurantMenu(this.id,this.value)" id="itemPrice,'+totalRows+'" type="text" class="input is-small" value="">';
	}
	for(var i = 0; i < item.options.length; i++){
		html +=		'<input onkeyup="restaurant.updateRestaurantMenu(this.id,this.value)" id="itemPrice,'+totalRows+','+i+'" type="text" class="input is-small" value="'+item.options[i].price+'">';
	}
	html += 	'</th>'+
				'<th style="width: 20px" id="itemDeletes'+totalRows+'">';
	if(item.options.length != 1)
		for(var i = 0; i < item.options.length; i++)
			html +=		'<div id="itemDelete,'+totalRows+','+i+'" style="height: 27px"><a class="delete" onclick="menuStagingRemoveOption('+totalRows+','+i+')"></a></div>';
	html += 	'</th>';
	if(!item.toBeDeleted){
		html += '<th style="width: 150px"><button class="button" onclick="menuStagingRemoveRow('+totalRows+'); return false;">Remove Item</button><button class="button" onclick="menuStagingAddOption('+totalRows+'); return false;">Add Option</button></th>';
	}
	html += '</tr>';


	if(!item.toBeDeleted){
		totalOptions[totalRows] = item.options.length;
		console.log("Printing menu staging with id: " + totalRows);
		totalRows++;
		document.getElementById('menuBody').insertAdjacentHTML('beforeend',html);
	}
	else{
		document.getElementById('menuToDelete').insertAdjacentHTML('beforeend',html);
	}
	
	return false; // to avoid page reload
}

function menuStagingRemoveRow(id){
	var element = document.getElementById("menuStagingRow"+id);
	element.parentNode.removeChild(element);

	// need to remove the data from the restaurant object
	restaurant.removeMenuItem(id);

	return false; // to avoid page reload
}

function menuStagingAddOption(id){
	optionsCount = totalOptions[id];

	if(optionsCount == 1){ // if you are adding the first option, add the option name and delete button to the item price
		optionHtml = '<input id="itemOption,'+id+','+(optionsCount-1)+'" type="text" class="input is-small" placeholder="leave empty if no options" onkeyup="restaurant.updateRestaurantMenu(this.id,this.value)" value="">'
		deleteButton = '<div id="itemDelete,'+id+','+(optionsCount-1)+'" style="height: 27px"><a class="delete" onclick="menuStagingRemoveOption('+id+','+(optionsCount-1)+')"></a></div>';
		document.getElementById("itemOptions"+id).insertAdjacentHTML('beforeend',optionHtml);
		document.getElementById("itemDeletes"+id).insertAdjacentHTML('beforeend',deleteButton);
	}

	optionHtml = '<input id="itemOption,'+id+','+optionsCount+'" type="text" class="input is-small" placeholder="leave empty if no options" onkeyup="restaurant.updateRestaurantMenu(this.id,this.value)" value="">'
	priceHtml = '<input id="itemPrice,'+id+','+optionsCount+'" type="text" class="input is-small" onkeyup="restaurant.updateRestaurantMenu(this.id,this.value)" value="">';
	deleteButton = '<div id="itemDelete,'+id+','+optionsCount+'" style="height: 27px"><a class="delete" onclick="menuStagingRemoveOption('+id+','+optionsCount+')"></a></div>';


	document.getElementById("itemOptions"+id).insertAdjacentHTML('beforeend',optionHtml);
	document.getElementById("itemPrices"+id).insertAdjacentHTML('beforeend',priceHtml);
	document.getElementById("itemDeletes"+id).insertAdjacentHTML('beforeend',deleteButton);

	totalOptions[id]++;
}

function menuStagingRemoveOption(itemId,optionId){
	console.log("itemOption"+itemId+','+optionId);

	var element = document.getElementById("itemOption,"+itemId+','+optionId);
	element.parentNode.removeChild(element);
	element = document.getElementById("itemPrice,"+itemId+','+optionId);
	element.parentNode.removeChild(element);
	element = document.getElementById("itemDelete,"+itemId+','+optionId);
	element.parentNode.removeChild(element);

	restaurant.removeMenuOption(itemId, optionId);

	totalOptions[itemId]--;
	if(totalOptions[itemId] == 1){
		element = document.getElementById("itemOption,"+itemId+',0');
		element.parentNode.removeChild(element);
		element = document.getElementById("itemDelete,"+itemId+',0');
		element.parentNode.removeChild(element);
	}
}



async function init(){
	restaurant = new Restaurant();
	await restaurant.init();
	updateDisplay(restaurant);
}




$(function() {
  $(window).load(function() {
  	//init();
  });
});