var restaurantInstance;
var menuStaging = [];
var menu = [];

function init(){
	document.getElementById("Settings").style.display = "none";
	document.getElementById("Orders").style.display = "block";

	// code copied from https://www.w3schools.com/howto/howto_js_trigger_button_enter.asp
	// Get the input field
	var input = document.getElementById("MenuChange");

	// Execute a function when the user releases a key on the keyboard
	input.addEventListener("keyup", function(event) {
	  // Number 13 is the "Enter" key on the keyboard
	  if (event.keyCode === 13) {
	    // Cancel the default action, if needed
	    event.preventDefault();
	    // Trigger the button element with a click
	    menuModification()
	  }
	}); 
}

async function afterAsync(){
	await getRestaurantInstance();
	await populateData();
	await updateMenu();
	document.getElementById("loading").style.display = "none";
	document.getElementById("main").style.display = "block";
}

async function populateData(){
	var name = await restaurantInstance.name();
	console.log(name);
	$("#RestaurantName").html(name);
}

async function getRestaurantInstance(){
	var restaurantAddress = await App.restaurantFactoryInstance.restaurants2(App.account);
	if(restaurantAddress == '0x0000000000000000000000000000000000000000'){
		alert("no restaurantSmartContract assosiated with your address")
		document.location.href = "./login.html";
	}
	else{
		console.log("RestaurantAddress:" + restaurantAddress)
		restaurantInstance = new App.contracts.Restaurant(restaurantAddress);
	}
}

function viewOrders(){
	document.getElementById("Settings").style.display = "none";
	document.getElementById("Orders").style.display = "block";
}

function viewSettings(){
	document.getElementById("Settings").style.display = "block";
	document.getElementById("Orders").style.display = "none"
}

function stageMenuItem(item){

	if(item[0].length > 32){
		alert("itemName can't be longer than 32 bits");
	}
	else{
		$("#menuStaging").append('<p class="text-center" id="'+item[0]+'" style="font-size: 30px">'+item[0]+': '+item[1]+'</p>');		
		menuStaging.push([item[0].trim(),item[1].trim()]);
	}
}

// ToDo: Consider having functioality to set menu order
function menuModification(){
	var item = document.getElementById("MenuChange").value;
	var re = /.+\s*[:\s*\d+]?/;

	var item = item.split(":");
	item[0] = item[0].trim();
	item[1] = item[1].trim();

	var complete = false;
	// if item is in either menu
	for(var i = 0; i < menuStaging.length; i++){
		if(menuStaging[i][0].includes(item[0])){
			menuStaging[i] = menuStaging[0];
			menuStaging.shift();
			$("#"+item[0]).remove();
			complete = true;
			break;
		}
	}


	//else
	if(!complete && item.length == 2 && !isNaN(item[1]) && item[0].length > 0 && !item[0].includes("#")){
		stageMenuItem(item);
	}
	//add
	

}

function clearStaging(){
	menuStaging = [];
	$("#menuStaging").html("");
}

async function commitMenuStaging(){
	itemNames = [];
	itemPrices = [];

	for(var i = 0; i< menuStaging.length; i++){
		itemNames[i] = web3.fromAscii(menuStaging[i][0]);
		itemPrices[i] = menuStaging[i][1];
	}
	await restaurantInstance.menuAddItems(itemNames,itemPrices);
	updateMenu();
}

async function deleteFromMenu(){
	var toDelete = [];
	var menuLength = await restaurantInstance.menuLength();
	for(var i = 0; i<menuLength;i++){
		if(document.getElementById("itemDelete"+i).checked == true){
			toDelete.push(i);
		}
	}
	await restaurantInstance.menuRemoveItems(toDelete);
	updateMenu();
}

async function updateMenu(){
	$("#menuList").html("");
	var menuLength = await restaurantInstance.menuLength();
	for(var i = 0; i<menuLength;i++){
		(function(counter){
			restaurantInstance.menu(counter).then(async function(item){
				menu[i] = [web3.toAscii(item[0]),item[1]];
				$("#menuList").append('<div><label class="text-center" style="margin-left: 30%;font-size: 30px">'+web3.toAscii(item[0])+': '+item[1]+'</label><input type="checkbox" id="itemDelete'+counter+'" name="deleteCheckbox" style="">delete</div>')
			});
		})(i);
	}
}





$(function() {
  $(window).load(function() {
    init();
  });
});
