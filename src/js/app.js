App = {
  web3Provider: null,
  contracts: [],
  accounts: [],
  account: '0x0',

  init: async function() {
    return await App.initWeb3();
  },

  initWeb3: async function(){
    if(typeof web3 !== 'undefined'){
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
      web3 = new Web3(App.web3Provider);
    }
    App.initContract();
    return;
  },

  initContract: function() {
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
    App.renderInitial();
  });
    
    
    
    
    // $.getJSON("Customer.json",function(customer){
    //   App.contracts.Customer = TruffleContract(customer);
    //   App.contracts.Customer.setProvider(App.web3Provider);
    //   return;
    // });

    // $.getJSON("RiderFactory.json",function(riderFactory){
    //   App.contracts.RiderFactory = TruffleContract(riderFactory);
    //   App.contracts.RiderFactory.setProvider(App.web3Provider);
    // });
    // $.getJSON("Rider.json",function(rider){
    //   App.contracts.Rider = TruffleContract(rider);
    //   App.contracts.Rider.setProvider(App.web3Provider);
    // });

    // $.getJSON("RestaurantFactory.json",function(restaurantFactory){
    //   App.contracts.RestaurantFactory = TruffleContract(restaurantFactory);
    //   App.contracts.RestaurantFactory.setProvider(App.web3Provider);
    // });
    // $.getJSON("Restaurant.json",function(restaurant){
    //   App.contracts.Restaurant = TruffleContract(restaurant);
    //   App.contracts.Restaurant.setProvider(App.web3Provider);
    // });

    // $.getJSON("Order.json",function(order){
    //   App.contracts.Order = TruffleContract(order);
    //   App.contracts.Order.setProvider(App.web3Provider);
    // });    
    // return App.render();
  },

  renderInitial: function() {

    var controllerInstance;

    var restaurantFactoryInstance;
    var customerFactoryInstance;
    var riderFactoryInstance;

    var restaurantInstance;
    var customerInstance;
    var riderInstance;

    var orderInstance;

    // get accounts and print account selection
    web3.eth.getAccounts(function(err,_accounts){
      if(err === null){
        App.accounts = _accounts;
        $('#accountAddress').append("<h2 class='text-center'>Accounts:</h2>");
        for(var i = 0; i<App.accounts.length; i++){
          if(App.accounts[i] !== null){
            $('#accountAddress').append('<input type="radio" name="currentAccount" value="'+App.accounts[i]+'" onclick="setAddress()"> ' + App.accounts[i] + ' <br>');
          }
        }
      }
      else{
        $('#accountAddress').append("Error: " + err);
      }
    });

    

    // get factory instances
    App.contracts.Controller.deployed().then(function(instance){
      $('#factoryOwners').append('<h2 class="text-centre">FactoryAddress:</h2>');
      controllerInstance = instance;
      return controllerInstance.restaurantFactoryAddress().then(function(restaurantFactoryAddress){
        $('#factoryOwners').append('restaurantFactoryAddress: '+ restaurantFactoryAddress +' <br>');
        //return new web3.eth.Contract(App.contracts.RestaurantFactory.abi,restaurantFactoryAddress);
        return new App.contracts.RestaurantFactory(restaurantFactoryAddress);
      }).then(function(instance){
        App.restaurantFactoryInstance = instance;
        return controllerInstance.customerFactoryAddress();
      }).then(function(address){
        $('#factoryOwners').append('CustomerFactoryAddress: '+ address +' <br>');
        //return new web3.eth.Contract(CustomerFactory.abi,address);
        return new App.contracts.CustomerFactory(address);
      }).then(function(instance){
        App.customerFactoryInstance = instance;
        return controllerInstance.riderFactoryAddress();
      }).then(function(address){
        $('#factoryOwners').append('RiderFactoryAddress: '+ address +' <br>');
        //return new web3.eth.Contract(RiderFactory.abi,address);
        return new App.contracts.RiderFactory(address);
      }).then(function(instance){
        App.riderFactoryInstance = instance;
        App.renderRestaurant();
        App.renderCustomer();
      });
    });

    ;
  },

  render: function(){

  },

  renderRestaurant: async function(){
    var restaurantCount;
    
    
    restaurantCount = await App.restaurantFactoryInstance.restaurantCount();

    $("#restaurantAreaTitle").html("<b>Restaurants</b> (count "+ restaurantCount+"):");

    $('#restaurantArea').html("");

    for(var i = 0; i < restaurantCount; i++){
      App.restaurantFactoryInstance.restaurants(i).then(function(address){
        return new App.contracts.Restaurant(address);
      }).then(async function(instance){
        var id = await instance.id();
        var name = await instance.name();
        var location = await instance.location();
        var contactNumber = await instance.contactNumber();
        var address = await instance.address;
        var owner = await instance.owner();
        

        $('#restaurantArea').append("<p>id: "+id+"<br>name: " + name + "<br>location: " + location + "<br>contact number: " + contactNumber + "<br>address: " + address + "<br>owner: " + owner + "</p>");
        $('#restaurantArea').append("<div>"+
                                      "<h3>Menu</h3>"+
                                      "<div id='menuDisplay"+id+"' style='float: left; width: 150px; height:250px; padding: 10px'></div>"+
                                      "<textarea id='menuEdit"+id+"' rows='10' columns='20'></textarea>"+
                                      "<div id='menuControlls"+id+"'>"+
                                        "<button id='menuAddBut"+id+"'>Add</button>"+
                                        "<button id='menuRemoveBut"+id+"'>Remove</button>"+
                                      "</div>"+
                                    "</div><br>");
        $('#restaurantArea').append("");

        var menuLength = await instance.menuLength();
        for(var j = 0; j < menuLength; j++){
          var item = await iteminstance.getManuItem(j);
          $('#menuDisplay').append(item[0] + ": " + item[1] + "<br>");
        }
      })
    }
  },

  renderCustomer: async function(){
    var customerCount;
    
    customerCount = await App.customerFactoryInstance.customerCount();

    $("#customerAreaTitle").html("<b>customers</b> (count "+ customerCount+"):");

    $('#customerArea').html("");

    for(var i = 0; i < customerCount; i++){
      App.customerFactoryInstance.customers0(i).then(function(address){
        return new App.contracts.Customer(address);
      }).then(async function(instance){
        var id = await instance.id();
        var address = await instance.address;
        $('#customerArea').append("<p>ID: " + id + "<br>Address: " + address + "</p>");
      })
    }
  },

  renderRider: async function(){
    console.log("riderRender");

    var riderCount;
    
    riderCount = await App.riderFactoryInstance.riderCount();

    $("#riderAreaTitle").html("<b>riders</b> (count "+ riderCount+"):");

    $('#riderArea').html("");

    for(var i = 0; i < riderCount; i++){
      App.riderFactoryInstance.riders0(i).then(function(address){
        return new App.contracts.Rider(address);
      }).then(async function(instance){
        var id = await instance.id();
        var address = await instance.address;
        $('#riderArea').append("<p>ID: " + id + "<br>Address: " + address + "</p>");
      })
    }
  },

  renderAccountCreation: function(){
    // add ability to create restaurant/customer/rider
    var restaurantCreationHTML = ""
  },

  makeRestaurantClick: async function(){
    console.log("makeRestaurantClick");

    var restaurantName = document.getElementById('restaurantNameInput').value;
    var restaurantAddress = document.getElementById('restaurantAddressInput').value;
    var restaurantPhone = document.getElementById('restaurantPhoneInput').value;

    App.restaurantFactoryInstance.createRestaurant(restaurantName,restaurantAddress,restaurantPhone,{from: App.account, gas: 4000000}).then(function(){
      console.log("restaurant Made");
      App.renderRestaurant();
    })
  },

  makeCustomerClick: async function(){
    console.log("makeCustomerClick");

    var customerName = document.getElementById('customerNameInput').value;
    var customerPhone = document.getElementById('customerPhoneInput').value;

    App.customerFactoryInstance.makeCustomer(customerName,customerPhone,{from: App.account, gas: 4000000}).then(function(){
      console.log("customer Made");
      App.renderCustomer();
    })
  },

  makeRiderClick: async function(){
    console.log("makeRiderClick");

    var riderName = document.getElementById('riderNameInput').value;
    var riderPhone = document.getElementById('riderPhoneInput').value;

    App.riderFactoryInstance.makeRider(riderName,riderPhone,{from: App.account, gas: 4000000}).then(function(){
      console.log("rider Made");
      App.renderRider();
    })
  },
};

$(function() {
  $(window).load(function() {
    App.init();
  });
});

function setAddress(){
  var radioValue = $("input[name='currentAccount']:checked").val();
    if(radioValue){
      App.account = radioValue;
      alert("Your are now using account - " + radioValue);
  }
}
