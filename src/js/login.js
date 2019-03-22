App = {
  web3Provider: null,
  contracts: [],
  accounts: [],
  account: '0x0',

  controllerInstance: null,
  restaurantFactoryInstance: null,
  customerFactoryInstance: null,
  riderFactoryInstance: null,
}

async function init(){
	hideAccountCreations();
	var loadedWeb3 = await initWeb3();
	var loadedABIs = await initContracts();	
}

function hideAccountCreations(){
	document.getElementById("RestaurantLoginArea").style.display = "none";
	document.getElementById("CustomerLoginArea").style.display = "none";
	document.getElementById("RiderLoginArea").style.display = "none";
}

async function restaurantClick(){
	// want to check if an account exists with your address
	var mapping = await App.restaurantFactoryInstance.restaurants1(App.account);
	if(mapping != '0x0000000000000000000000000000000000000000')
	{
		// account exists load the restaurant view
		
	}
	else
	{
		hideAccountCreations();
		document.getElementById("RestaurantLoginArea").style.display = "block";
	}	
}

async function customerClick(){
	// want to check if an account exists with user address
	var mapping = await App.customerFactoryInstance.restaurants1(App.account);
	if(mapping != '0x0000000000000000000000000000000000000000')
	{
		// account exists load the customer view
			
	}
	else
	{
		hideAccountCreations();
		document.getElementById("CustomerLoginArea").style.display = "block";
	}
}

async function riderClick(){
	// want to check if an account exists with user address
	var mapping = await App.riderFactoryInstance.restaurants1(App.account);
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

    App.restaurantFactoryInstance.createRestaurant(restaurantName,restaurantAddress,restaurantPhone,{from: App.account, gas: 4000000}).then(function(){
      console.log("restaurant Made");
      // load the restaurant view
    })
  }

async function makeCustomerClick(){
    console.log("makeCustomerClick");

    var customerName = document.getElementById('customerNameInput').value;
    var customerPhone = document.getElementById('customerPhoneInput').value;

    App.customerFactoryInstance.makeCustomer(customerName,customerPhone,{from: App.account, gas: 4000000}).then(function(){
      console.log("customer Made");
      // load the customer view
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

async function initWeb3(){
    if(typeof web3 !== 'undefined'){
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
      web3 = new Web3(App.web3Provider);
    }
    return;
}



async function initContracts() {
	var controllerRequest = $.ajax({
	  url: 'Controller.json',
	  success: function(controller){
	    App.contracts["Controller"] = TruffleContract(controller);
	    App.contracts["Controller"].setProvider(App.web3Provider);
	  }
	});
	var RestaurantFactory = $.ajax({
	  url: 'RestaurantFactory.json',
	  success: function(RestaurantFactory){
	    App.contracts["RestaurantFactory"] = TruffleContract(RestaurantFactory);
	    App.contracts["RestaurantFactory"].setProvider(App.web3Provider);
	  }
	});
	var CustomerFactory = $.ajax({
	  url: 'CustomerFactory.json',
	  success: function(CustomerFactory){
	    App.contracts["CustomerFactory"] = TruffleContract(CustomerFactory);
	    App.contracts["CustomerFactory"].setProvider(App.web3Provider);
	  }
	});
	var RiderFactory = $.ajax({
	  url: 'RiderFactory.json',
	  success: function(RiderFactory){
	    App.contracts["RiderFactory"] = TruffleContract(RiderFactory);
	    App.contracts["RiderFactory"].setProvider(App.web3Provider);
	  }
	});
	var Restaurant = $.ajax({
	  url: 'Restaurant.json',
	  success: function(Restaurant){
	    console.log("success loading restaurant JSON")
	    App.contracts["Restaurant"] = TruffleContract(Restaurant);
	    App.contracts["Restaurant"].setProvider(App.web3Provider);
	  }
	});
	var Customer = $.ajax({
	  url: 'Customer.json',
	  success: function(Customer){
	    console.log("success loading Customer JSON")
	    App.contracts["Customer"] = TruffleContract(Customer);
	    App.contracts["Customer"].setProvider(App.web3Provider);
	  }
	});
	var Rider = $.ajax({
	  url: 'Rider.json',
	  success: function(Rider){
	    console.log("success loading Rider JSON")
	    App.contracts["Rider"] = TruffleContract(Rider);
	    App.contracts["Rider"].setProvider(App.web3Provider);
	  }
	});
	$.when(controllerRequest,RestaurantFactory).done(function(){
	  return initFactories();
	});
}

function initFactories(){
	var accountsRequest = web3.eth.getCoinbase(function(err,account){
      if(err === null){       
        
        App.account = account;
        console.log("success getting account: " + account);
      }
      else{
       	console.log("error getting account: " + account);
      }
    });

	App.contracts.Controller.deployed({from: "App.account"}).then(async function(instance){
		console.log("controllerDeployed");
		var owner = await instance.owner();
		controllerInstance = instance;
		return controllerInstance.restaurantFactoryAddress().then(function(address){
			console.log("restaurantFactoryAddress: " + address);
			return new App.contracts.RestaurantFactory(address);
		}).then(function(instance){
			App.restaurantFactoryInstance = instance;
			return controllerInstance.customerFactoryAddress();
		}).then(function(address){
			console.log("CustomerFactoryAddress: " + address);
			return new App.contracts.CustomerFactory(address);
		}).then(function(instance){
			App.customerFactoryInstance = instance;
			return controllerInstance.riderFactoryAddress();
		}).then(function(address){
			console.log("RiderFactoryAddress: " + address);
			return new App.contracts.RiderFactory(address);
		}).then(function(instance){
			App.riderFactoryInstance = instance;
		});
	});
}




$(function() {
  $(window).load(function() {
    init();
  });
});