var controllerAddressRemote = "0xe4C5DBc6B66d39B0BaC25283893BF2541aCBad4a";
var controllerAddressLocal = "0xe4C5DBc6B66d39B0BaC25283893BF2541aCBad4a";



App = {
  web3Provider: null,
  contracts: [],
  accounts: [],
  account: '0x0',

  controllerInstance: null,
  controllerAddress: null,
  restaurantFactoryInstance: null,
  customerFactoryInstance: null,
  riderFactoryInstance: null,

  conversion: 130,

  accountInterval: null,

  initialised: false,

  local: false,



  init: async function(){
  	if(App.local)
  		App.controllerAddress = controllerAddressLocal;
  	else
  		App.controllerAddress = controllerAddressRemote;


  	if(!App.initialised){
	  	if(typeof web3 != 'undefined'){
			if(App.web3Provider != web3.currentProvider){
				App.initWeb3();
			}
		}
		else{
			alert("no web3 provider found");
		}
	  	App.getEthPrice();
		await App.initContracts();
		App.initialised = true;
	}
  },

  login: async function(){
  	if(typeof web3 != 'undefined'){
		if(App.web3Provider != web3.currentProvider){
			App.initWeb3();
		}
		if(typeof web3.eth.accounts[0] == 'undefined'){
			App.account = '0x0';
  			await ethereum.enable().then(function(res){
  				if(web3.eth.accounts[0] !== App.account && typeof web3.eth.accounts[0] != 'undefined'){
  					App.account = web3.eth.accounts[0];
  					return true;
  				}
  			})
  		}else{
  			if(web3.eth.accounts[0] !== App.account && typeof web3.eth.accounts[0] != 'undefined'){
  				if(App.local){
  					var accountID = prompt("please enter the account index", "[0-10]");
  					App.account = web3.eth.accounts[accountID];
  				}
  				else
  					App.account = web3.eth.accounts[0];
  				return true;
  			}
  		}

  	}
  	else{
  		alert("no web3 provider found");
  	}
  	return false;
  },

  checkLogin: async function (){
	if(App.account == "0x0" || App.account == null){
		App.login().then(function(result){
			if(result){
				console.log("logged in as: " + App.account);
				return true;

			}else{
				console.log("could not log you in:");
				return false;
			}
		})
	}

	return true;
},

  initWeb3: function (){
    if(typeof web3 !== 'undefined' && !App.local){
      App.web3Provider = web3.currentProvider;
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


  // lots of redundent code, could clean this up
  initContracts: async function () {
  	console.time("Init Contracts");

	var controllerRequest = $.ajax({
	  url: '/Contracts/Controller.json',
	  async: true,
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
	  async: true,
	  success: function(RestaurantFactory){
	  	
	    App.contracts["RestaurantFactory"] = TruffleContract(RestaurantFactory);
	    App.contracts["RestaurantFactory"].setProvider(App.web3Provider);
	  }
	});
	var CustomerFactoryRequest = $.ajax({
	  url: '/Contracts/CustomerFactory.json',
	  async: true,
	  success: function(CustomerFactory){
	  	
	    App.contracts["CustomerFactory"] = TruffleContract(CustomerFactory);
	    App.contracts["CustomerFactory"].setProvider(App.web3Provider);
	  }
	});
	var RiderFactoryRequest = $.ajax({
	  url: '/Contracts/RiderFactory.json',
	  async: true,
	  success: function(RiderFactory){
	  	
	    App.contracts["RiderFactory"] = TruffleContract(RiderFactory);
	    App.contracts["RiderFactory"].setProvider(App.web3Provider);
	  }
	});

	var RestaurantRequest = $.ajax({
	  url: '/Contracts/Restaurant.json',
	  async: true,
	  success: function(Restaurant){
	    
	    App.contracts["Restaurant"] = TruffleContract(Restaurant);
	    App.contracts["Restaurant"].setProvider(App.web3Provider);
	  }
	});
	var RestaurantRequest = $.ajax({
	  url: '/Contracts/Menu.json',
	  async: true,
	  success: function(Menu){
	    
	    App.contracts["Menu"] = TruffleContract(Menu);
	    App.contracts["Menu"].setProvider(App.web3Provider);
	  }
	});
	var CustomerRequest = $.ajax({
	  url: '/Contracts/Customer.json',
	  async: true,
	  success: function(Customer){
	    
	    App.contracts["Customer"] = TruffleContract(Customer);
	    App.contracts["Customer"].setProvider(App.web3Provider);
	  }
	});
	var RiderRequest = $.ajax({
	  url: '/Contracts/Rider.json',
	  async: true,
	  success: function(Rider){
	    
	    App.contracts["Rider"] = TruffleContract(Rider);
	    App.contracts["Rider"].setProvider(App.web3Provider);
	  }
	});
	var OrderRequest = $.ajax({
	  url: '/Contracts/Order.json',
	  async: true,
	  success: function(Order){
	    
	    App.contracts["Order"] = TruffleContract(Order);
	    App.contracts["Order"].setProvider(App.web3Provider);
	  }
	});
	await Promise.all([controllerRequest,RestaurantFactoryRequest,CustomerFactoryRequest,RiderFactoryRequest,RestaurantRequest,RestaurantRequest,CustomerRequest,RiderRequest,OrderRequest]);
	console.timeEnd("Init Contracts");

	if(!App.local)
		await App.initFactories();
	else
		await App.initFactories();
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
	console.time("init initFactories");
	App.controllerInstance = await new App.contracts.Controller(App.controllerAddress);

	const p1 = App.controllerInstance.restaurantFactoryAddress();
	const p2 = App.controllerInstance.customerFactoryAddress();
	const p3 = App.controllerInstance.riderFactoryAddress();

	await Promise.all([p1,p2,p3]).then((values)=>{
		App.restaurantFactoryInstance = new App.contracts.RestaurantFactory(values[0]);
		App.customerFactoryInstance = new App.contracts.CustomerFactory(values[1]);
		App.riderFactoryInstance = new App.contracts.RiderFactory(values[2]);
	});

	console.timeEnd("init initFactories");
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
  $(window).load(async function() {
  	console.time("overAll");
  	console.time("loading View");
  	await App.checkLogin();
  	console.time("Init");
  	await App.init();
  	await main_init();
  	console.timeEnd("Init");
  });
});

