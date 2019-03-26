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
	addUserCounts();
	document.getElementById("loading").style.display = "none";
	document.getElementById("main").style.display = "block";
}

async function addUserCounts(){
	var restaurantCount = await App.restaurantFactoryInstance.restaurantCount();
	var customerCount = await App.customerFactoryInstance.customerCount();
	var riderCount = await App.riderFactoryInstance.riderCount();

	document.getElementById("restaurantButton").append("<br>(Count: " + restaurantCount + ")");
	document.getElementById("customerButton").append("<br>(Count: " + customerCount + ")");
	document.getElementById("riderButton").append("<br>(Count: " + riderCount + ")");
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
	var mapping = await App.riderFactoryInstance.rider2(App.account);
	if(mapping != '0x0000000000000000000000000000000000000000')
	{
		// account exists load the rider view
			
	}
	else
	{
		hideAccountCreations();
		document.getElementById("RiderLoginArea").style.display = "block";
	}
}

async function makeRestaurantClick(){
    console.log("makeRestaurantClick");

    var restaurantName = document.getElementById('restaurantNameInput').value;
    var restaurantAddress = document.getElementById('restaurantAddressInput').value;
    var restaurantPhone = document.getElementById('restaurantPhoneInput').value;

    console.log(App.restaurantFactoryInstance);

    App.restaurantFactoryInstance.createRestaurant(restaurantName,restaurantAddress,restaurantPhone,{from: App.account, gas: 4000000}).then(function(){
      console.log("restaurant Made");
      // load the restaurant view
      document.location.href = "./RestaurantHome.html";
    })
  }

async function makeCustomerClick(){
    console.log("makeCustomerClick");

    var customerName = document.getElementById('customerNameInput').value;
    var customerPhone = document.getElementById('customerPhoneInput').value;

    App.customerFactoryInstance.makeCustomer(customerName,customerPhone,{from: App.account, gas: 4000000}).then(function(){
      console.log("customer Made");
      document.location.href = "./CustomerView.html";
    })
  }

async function makeRiderClick(){
    console.log("makeRiderClick");

    var riderName = document.getElementById('riderNameInput').value;
    var riderPhone = document.getElementById('riderPhoneInput').value;

    App.riderFactoryInstance.makeRider(riderName,riderPhone,{from: App.account, gas: 4000000}).then(function(){
      console.log("rider Made");
      // load the rider view
    })
  }

$(function() {
  $(window).load(function() {
  	initLogin();
  });
});










