function initLogin(){
	console.log("initLogin");
	hideAccountCreations();

}

function hideAccountCreations(){
	document.getElementById("RestaurantLoginArea").style.display = "none";
	document.getElementById("CustomerLoginArea").style.display = "none";
	document.getElementById("RiderLoginArea").style.display = "none";
}

function afterAsync(){
	//addUserCounts();
	initiateEvents();
	document.getElementById("loading").style.display = "none";
	document.getElementById("main").style.display = "block";

}

async function initiateEvents(){

	var restaurantMade = App.restaurantFactoryInstance.RestaurantMade({},{fromBlock: 'latest'});	
	restaurantMade.watch(function(err,result){
		if(!err){
			document.location.href = "./RestaurantHome.html";
		}else{
			console.log(err);
		}
	});

	var riderMade = App.riderFactoryInstance.RiderMade({},{fromBlock: 'latest'});	
	riderMade.watch(function(err,result){
		if(!err){
			document.location.href = "./RiderView.html";
		}else{
			console.log(err);
		}
	});

	var customerMade = App.customerFactoryInstance.CustomerMade({},{fromBlock: 'latest'});	
	customerMade.watch(function(err,result){
		if(!err){
			document.location.href = "./CustomerView.html";
		}else{
			console.log(err);
		}
	});
}

async function addUserCounts(){
	var restaurantCount =  App.restaurantFactoryInstance.restaurantCount();
	var customerCount =  App.customerFactoryInstance.customerCount();
	var riderCount =  App.riderFactoryInstance.riderCount();

	var counts = await Promise.all([restaurantCount, customerCount, riderCount]);

	document.getElementById("restaurantButton").append(" (Count: " + counts[0] + ")");
	document.getElementById("customerButton").append(" (Count: " + counts[1] + ")");
	document.getElementById("riderButton").append(" (Count: " + counts[2] + ")");
}



async function restaurantClick(){
	// want to check if an account exists with your address
	var mapping = await App.restaurantFactoryInstance.restaurants2(App.account);
	if(mapping != '0x0000000000000000000000000000000000000000')
	{
		// account exists load the restaurant view
		document.location.href = "./RestaurantHome.html";
	}
	else
	{
		hideAccountCreations();
		document.getElementById("RestaurantLoginArea").style.display = "block";
	}	
}

async function customerClick(){
	// want to check if an account exists with user address
	var mapping = await App.customerFactoryInstance.customers2(App.account);
	if(mapping != '0x0000000000000000000000000000000000000000')
	{
		// account exists load the customer view
		document.location.href = "./CustomerView.html";
	}
	else
	{
		hideAccountCreations();
		document.getElementById("CustomerLoginArea").style.display = "block";
	}
}

async function riderClick(){
	// want to check if an account exists with user address
	var mapping = await App.riderFactoryInstance.riders2(App.account);
	if(mapping != '0x0000000000000000000000000000000000000000')
	{
		// account exists load the rider view
		document.location.href = "./RiderView.html";
			
	}
	else
	{
		hideAccountCreations();
		document.getElementById("RiderLoginArea").style.display = "block";
	}
}


//ToDo: change so the page shows a message and redirects after account is created using an event
async function makeRestaurantClick(){
    console.log("makeRestaurantClick");

    var restaurantName = document.getElementById('restaurantNameInput').value;
    var restaurantAddress = document.getElementById('restaurantAddressInput').value;
    var restaurantPhone = document.getElementById('restaurantPhoneInput').value;

    console.log(App.restaurantFactoryInstance);

    App.restaurantFactoryInstance.createRestaurant(restaurantName,restaurantAddress,restaurantPhone,{from: App.account, gas: 4000000}).then(function(){
      console.log("restaurant Made");
    });
  }

async function makeCustomerClick(){
    console.log("makeCustomerClick");


    App.customerFactoryInstance.makeCustomer({from: App.account, gas: 4000000}).then(function(){
      console.log("customer Made");
    });
  }

async function makeRiderClick(){
    console.log("makeRiderClick");


    App.riderFactoryInstance.makeRider({from: App.account, gas: 4000000}).then(function(){
      console.log("rider Made");
    });
  }

$(function() {
  $(window).load(function() {
  	initLogin();
  });
});










