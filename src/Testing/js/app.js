App = {
  web3Provider: null,
  contracts: [],
  accounts: [],
  account: '0x0',

  test: null,

  init: function(){
  	console.log("Initialising App")
  	//web3.currentProvider.publicConfigStore.on('update', App.initAccount());
	var loadedWeb3 = App.initWeb3();
	return App.initContracts();
  },

  initWeb3: function (){
    if(typeof web3 !== 'undefined'){
      App.web3Provider = web3.currentProvider;
      console.log(App.web3Provider);
      web3 = new Web3(web3.currentProvider);
    } else {
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
      web3 = new Web3(App.web3Provider);
    }
    return;
  },

	initHDWallet: function (){
		App.web3Provider = new WHDWalletProvider(process.env.MNEMONIC,'https://ropsten.infura.io/'+process.env.INFURA_API_KEY);
	    return;
	},


  initContracts: function () {
  	console.log("1");
	var testRequest = $.ajax({
	  url: 'Test.json',
	  async: false,
	  success: function(controller){
	  	console.log("here");
	    App.contracts["Test"] = TruffleContract(controller);
	    App.contracts["Test"].setProvider(App.web3Provider);
	  },
	  error: function(err){
	  	console.log(err);
	  }
	});
	
	return App.initFactories();
	
},

initFactories: function(){
	App.initAccount();

	App.contracts.Test.deployed().then(function(instance){
		App.test = instance;
	});

	// App.contracts.Test.deployed().then(async function(instance){
	// 	console.log("testDeployed");
	// 	testInstance = instance;
	// 	return;
	// };

},


initAccount: function(){
	
	var accountsRequest = web3.eth.getCoinbase(function(err,account){
      if(err === null){       
        App.account = account;
        console.log("success getting account: " + account);
      }
      else{
       	console.log("error getting account: " + account);
      }
    });

},

}

$(function() {
  $(window).load(function() {
  	App.init();
  });
});

