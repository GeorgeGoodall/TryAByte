App = {
  web3Provider: null,
  contracts: [],
  accounts: [],
  account: '0x0',

  controllerInstance: null,
  restaurantFactoryInstance: null,
  customerFactoryInstance: null,
  riderFactoryInstance: null,

  init: function(){
  	console.log("Initialising App")
	var loadedWeb3 = App.initWeb3();
	return App.initContracts();
  },

  initWeb3: function (){
    if(typeof web3 !== 'undefined'){
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
      web3 = new Web3(App.web3Provider);
    }
    return;
  },

  initContracts: function () {
	var controllerRequest = $.ajax({
	  url: 'Controller.json',
	  async: false,
	  success: function(controller){
	    App.contracts["Controller"] = TruffleContract(controller);
	    App.contracts["Controller"].setProvider(App.web3Provider);
	  }
	});
	var RestaurantFactory = $.ajax({
	  url: 'RestaurantFactory.json',
	  async: false,
	  success: function(RestaurantFactory){
	    App.contracts["RestaurantFactory"] = TruffleContract(RestaurantFactory);
	    App.contracts["RestaurantFactory"].setProvider(App.web3Provider);
	  }
	});
	var CustomerFactory = $.ajax({
	  url: 'CustomerFactory.json',
	  async: false,
	  success: function(CustomerFactory){
	    App.contracts["CustomerFactory"] = TruffleContract(CustomerFactory);
	    App.contracts["CustomerFactory"].setProvider(App.web3Provider);
	  }
	});
	var RiderFactory = $.ajax({
	  url: 'RiderFactory.json',
	  async: false,
	  success: function(RiderFactory){
	    App.contracts["RiderFactory"] = TruffleContract(RiderFactory);
	    App.contracts["RiderFactory"].setProvider(App.web3Provider);
	  }
	});
	var Restaurant = $.ajax({
	  url: 'Restaurant.json',
	  async: false,
	  success: function(Restaurant){
	    console.log("success loading restaurant JSON")
	    App.contracts["Restaurant"] = TruffleContract(Restaurant);
	    App.contracts["Restaurant"].setProvider(App.web3Provider);
	  }
	});
	var Customer = $.ajax({
	  url: 'Customer.json',
	  async: false,
	  success: function(Customer){
	    console.log("success loading Customer JSON")
	    App.contracts["Customer"] = TruffleContract(Customer);
	    App.contracts["Customer"].setProvider(App.web3Provider);
	  }
	});
	var Rider = $.ajax({
	  url: 'Rider.json',
	  async: false,
	  success: function(Rider){
	    console.log("success loading Rider JSON")
	    App.contracts["Rider"] = TruffleContract(Rider);
	    App.contracts["Rider"].setProvider(App.web3Provider);
	  }
	});
	var Order = $.ajax({
	  url: 'Order.json',
	  async: false,
	  success: function(Order){
	    console.log("success loading Order JSON")
	    App.contracts["Order"] = TruffleContract(Order);
	    App.contracts["Order"].setProvider(App.web3Provider);
	  }
	});
	return App.initFactories();
	
},

initFactories: function(){
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
			afterAsync();
		});
	});
},
}

$(function() {
  $(window).load(function() {
  	App.init();
  });
});