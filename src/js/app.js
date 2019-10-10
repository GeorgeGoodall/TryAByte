var controllerAddress = "0xAfcA2cA5270C46af7C0462aA530A3B31b729e92b"; // updated order event to emit key hash, also added reset function
//"0x0C65a3108b992F01FCeb6354990BB83e43d80FC7" // changed customer address to public in order
//"0xD3528B260364497a29f6b344D24b866E4B58C2f5"; // addresses stored in mongodb
//"0xF9531f71247903B6e108CfF44858Af561EaAe101"; // addresses stored in order contract


App = {
  web3Provider: null,
  contracts: [],
  accounts: [],
  account: '0x0',

  controllerInstance: null,
  restaurantFactoryInstance: null,
  customerFactoryInstance: null,
  riderFactoryInstance: null,

  conversion: 130,

  accountInterval: null,

  initialised: false,

  loginLock: false,



  init: function(){
  	console.log("Initialising App");

  	account = '0x0';
  	
  },

  login: function(){
  	if(typeof web3 != 'undefined'){
		if(App.web3Provider != web3.currentProvider){
			App.initWeb3();
		}
		if(typeof web3.eth.accounts[0] == 'undefined' && !App.loginLock){
			App.loginLock = true;
			App.account = '0x0';
  			ethereum.enable().then(function(res){
  				App.loginLock = false;
  			})
  		}
  		if(web3.eth.accounts[0] !== account && typeof web3.eth.accounts[0] != 'undefined'){
  			App.account = web3.eth.accounts[0];
  			if(!App.initialised){
  				App.getEthPrice();
				App.initContracts();
				App.initialised = true;
			}
  		}
  	}
  },

  initWeb3: function (){
    if(typeof web3 !== 'undefined'){
      App.web3Provider = web3.currentProvider;
      console.log(App.web3Provider);
      console.log("Found Web3 Provider");
      web3 = new Web3(web3.currentProvider);
      return true;
    } else {
      console.log("No Web3 Provider Found, attemting to connect to localhost. please install metamask");
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
      web3 = new Web3(App.web3Provider);   
  	}
  },

	initHDWallet: function (){
		App.web3Provider = new WHDWalletProvider(process.env.MNEMONIC,'https://ropsten.infura.io/'+process.env.INFURA_API_KEY);
	    return;
	},


  initContracts: async function () {
  	console.log("Init Contracts");
	var controllerRequest = $.ajax({
	  url: '/Contracts/Controller.json',
	  async: false,
	  success: function(controller){
	    App.contracts["Controller"] = TruffleContract(controller);
	    App.contracts["Controller"].setProvider(App.web3Provider);
	  },
	  error: function(xhr,status,error){
	  	console.log("Error Finding controller: " + error);
	  }
	});
	var RestaurantFactoryRequest = $.ajax({
	  url: '/Contracts/RestaurantFactory.json',
	  async: false,
	  success: function(RestaurantFactory){
	    App.contracts["RestaurantFactory"] = TruffleContract(RestaurantFactory);
	    App.contracts["RestaurantFactory"].setProvider(App.web3Provider);
	  }
	});
	var CustomerFactoryRequest = $.ajax({
	  url: '/Contracts/CustomerFactory.json',
	  async: false,
	  success: function(CustomerFactory){
	    App.contracts["CustomerFactory"] = TruffleContract(CustomerFactory);
	    App.contracts["CustomerFactory"].setProvider(App.web3Provider);
	  }
	});
	var RiderFactoryRequest = $.ajax({
	  url: '/Contracts/RiderFactory.json',
	  async: false,
	  success: function(RiderFactory){
	    App.contracts["RiderFactory"] = TruffleContract(RiderFactory);
	    App.contracts["RiderFactory"].setProvider(App.web3Provider);
	  }
	});
	var RestaurantRequest = $.ajax({
	  url: '/Contracts/Restaurant.json',
	  async: true,
	  success: function(Restaurant){
	    console.log("success loading restaurant JSON")
	    App.contracts["Restaurant"] = TruffleContract(Restaurant);
	    App.contracts["Restaurant"].setProvider(App.web3Provider);
	  }
	});
	var CustomerRequest = $.ajax({
	  url: '/Contracts/Customer.json',
	  async: true,
	  success: function(Customer){
	    console.log("success loading Customer JSON")
	    App.contracts["Customer"] = TruffleContract(Customer);
	    App.contracts["Customer"].setProvider(App.web3Provider);
	  }
	});
	var RiderRequest = $.ajax({
	  url: '/Contracts/Rider.json',
	  async: true,
	  success: function(Rider){
	    console.log("success loading Rider JSON")
	    App.contracts["Rider"] = TruffleContract(Rider);
	    App.contracts["Rider"].setProvider(App.web3Provider);
	  }
	});
	var OrderRequest = $.ajax({
	  url: '/Contracts/Order.json',
	  async: true,
	  success: function(Order){
	    console.log("success loading Order JSON")
	    App.contracts["Order"] = TruffleContract(Order);
	    App.contracts["Order"].setProvider(App.web3Provider);
	  }
	});
	//return App.initFactories(); modified after controller migration changed

	
	await App.initFactories();
	return afterAsync();

},


initFactories2: async function(){

	await App.contracts.Controller.deployed().then(async function(instance){
		console.log("controller Deployed at " + instance.address);
		var owner = await instance.owner();
		App.controllerInstance = instance;
		console.log(instance);
		return;
	});
	await App.contracts.RestaurantFactory.deployed().then(function(instance){
			App.restaurantFactoryInstance = instance;
			console.log("restaurantFactory Deployed at " + instance.address);
			return;
	});
	await App.contracts.CustomerFactory.deployed().then(function(instance){
		App.customerFactoryInstance = instance;
		console.log("customerFactory Deployed at " + instance.address);
		return;
	});
	await App.contracts.RiderFactory.deployed().then(function(instance){
		App.riderFactoryInstance = instance;
		console.log("riderFactory Deployed at " + instance.address);
		return;
	})
},

initFactories: async function(){

	App.controllerInstance = await new App.contracts.Controller(controllerAddress);

	await App.controllerInstance.restaurantFactoryAddress().then(function(address){
		console.log("restaurantFactoryAddress: " + address);
		return new App.contracts.RestaurantFactory(address);
	}).then(function(instance){
		App.restaurantFactoryInstance = instance;
		return App.controllerInstance.customerFactoryAddress();
	}).then(function(address){
		console.log("CustomerFactoryAddress: " + address);
		return new App.contracts.CustomerFactory(address);
	}).then(function(instance){
		App.customerFactoryInstance = instance;
		return App.controllerInstance.riderFactoryAddress();
	}).then(function(address){
		console.log("RiderFactoryAddress: " + address);
		return new App.contracts.RiderFactory(address);
	}).then(function(instance){
		App.riderFactoryInstance = instance;
	});
},

getEthPrice: function(){
	var your_calculated_array = []; // Set your calculated array here
    $.ajax({ 
      type: 'GET', 
      url: '/EthPrice',  
      dataType: 'json',
      success: function (data) { 
      	if(data != 'NA'){
      		App.conversion = data;
      	}else{

      	}
      }
    });
},

// 	rp(requestOptions).then(function(err,response){
// 		if(!err){
// 			console.log("Response: " + response);
// 		}
// 		else{
// 			console.log("Error: " + err);
// 		}
// 	})
// },


}

$(function() {
  $(window).load(function() {
  	App.init();
  });
});

