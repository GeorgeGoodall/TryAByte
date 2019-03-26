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
    console.log("currentProvider" + window.web3.currentProvider)
    web3.version.getNetwork(function(err,res){console.log("error: " + err);console.log("result: " + res)});
    return App.initContract();
    
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
  },

  renderInitial: async function() {

    var controllerInstance;

    var restaurantFactoryInstance;
    var customerFactoryInstance;
    var riderFactoryInstance;

    var restaurantInstance;
    var customerInstance;
    var riderInstance;

    var orderInstance;

    // // get accounts and print account selection
    // var accountsRequest = web3.eth.getAccounts(function(err,_accounts){
    //   if(err === null){
    //     App.accounts = _accounts;
        
    //     $('#accountAddress').append('<p name="currentAccount" onclick="setAddress()"> Account: ' + App.accounts[0] + ' <br>');
    //     App.account = App.accounts[0];

    //   }
    //   else{
    //     $('#accountAddress').append("Error: " + err);
    //   }
    // });

        // get accounts and print account selection
    var accountsRequest = web3.eth.getCoinbase(function(err,account){
      if(err === null){       
        
        App.account = account;
        $('#accountAddress').append('<p> Account: ' + App.account + '</p> <br>');
      }
      else{
        $('#accountAddress').append("Error: " + err);
      }
    });

    

    // get factory instances
    console.log("deploying controller");
    console.log(App.account);
    App.contracts.Controller.deployed({from: "App.account"}).then(async function(instance){
      console.log(instance);
      var owner = await instance.owner();
      console.log("owner: " + owner);
      console.log("deploying controller");
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
        App.renderRider();
      });
    });

    
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
                                      "<h3 id='MenuTitle'>Menu</h3>"+
                                      "<div id='menuDisplay"+id+"' style='float: left; width: 150px; height:250px; padding: 10px'></div>"+
                                      "<textarea id='menuEdit"+id+"' rows='10' columns='20'></textarea>"+
                                      "<div id='menuControlls"+id+"'>"+
                                        "<button id='menuAddBut"+id+"' onclick='App.menuAddItems("+id+")'>Add</button>"+
                                        "<button id='menuRemoveBut"+id+"' onclick='App.menuRemoveItems("+id+")'>Remove</button>"+
                                      "</div>"+
                                    "</div><br>");
        $('#restaurantArea').append("");

        var menuLength = await instance.getMenuLength();
        $('#MenuTitle').html("Menu (Count:"+menuLength+")");
        for(var j = 0; j < menuLength; j++){
          var item = await instance.getMenuItem(j);
          $('#menuDisplay'+id).append(web3.toAscii(item[0]) + ": " + item[1] + "<br>");
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
        $('#customerArea').append("<div>"+
                                      "<h3 id='OrderHere'>Menu</h3>"+
                                      "RestaurantAddress: <input id='orderAddress"+id+"'><br>"+
                                      "OrderItems:<br><textarea id='orderItems"+id+"' rows='6' columns='20'></textarea>"+
                                      "<div id='menuControlls"+id+"'>"+
                                        "<button id='orderButton"+id+"' onclick='App.makeOrder("+id+")'>Order Items</button>"+
                                      "</div>"+
                                    "</div><br>");
        var owner = await instance.owner();
        var orderCount = instance.getTotalOrders({from: owner, gas: 4000000});

        for(var j = 0; j < orderCount; j++){
            instance.getOrder(j,{from: owner, gas: 4000000}).then(function(address){
              return new App.contracts.Order(address);
            }).then(async function(instance){
              var orderid = await instance.id();
              var cost = await instance.getCost();
              var totalItems = await instance.totalItems();
              $('#customerArea').append("<p>id: "+orderid+"<br>cost: "+cost+"<br>Total Items: "+totalItems+"</p>");
            })
        }
        
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

  menuRemoveItems: function(id){
    console.log("Removing items from menu");
    items = App.parseMenuInput("menuEdit" + id)[0];
    console.log(items);
    for(var i = 0; i < items.length; i++){
      console.log(items[i]);
      items[i] = web3.fromAscii(items[i]);
    }
    App.restaurantFactoryInstance.restaurants(id).then(function(address){
      return new App.contracts.Restaurant(address);
    }).then(function(instance){
      instance.menuRemoveItems(items,{from: App.account, gas: 4000000});
    });
    App.renderRestaurant();
  },

  menuAddItems: function(id){
    console.log("Adding items to menu");
    items = App.parseMenuInput("menuEdit" + id);
    App.restaurantFactoryInstance.restaurants(id).then(function(address){
      return new App.contracts.Restaurant(address);
    }).then(function(instance){
      instance.menuAddItems(items[0],items[1],{from: App.account, gas: 4000000});
    });
    App.renderRestaurant();
  },

  orderItems: function(id){
    console.log("making an order");
    items = App.parseMenuInput("orderItems"+id)[0];
    for(var i = 0; i < items.length; i++){
      console.log(items[i]);
      items[i] = web3.fromAscii(items[i]);
    }
    App.customerFactoryInstance.customers0(id).then(function(address){
      return new App.contracts.Customer(address);
    }).then(function(instance){
      instance.makeOrder(items,{from: App.account, gas: 4000000});
    });
    App.renderCustomer();
  },

  parseMenuInput: function(id){
    var menuInput = document.getElementById(id).value;
    var items = menuInput.split("\n");
    var itemNames = [];
    var itemPrices = [];
    var count = 0;
    for(var i = 0; i < items.length; i++){
      if(typeof items[i] !== 'undefined'){
        item = items[i].split(":");
        if(typeof item[0] != 'undefined' && item[0].trim() != ""){
          itemNames[count] = item[0].trim();
          if(typeof item[1] != 'undefined')
            itemPrices[count] = item[1].trim();
          count++;
        }
      }
    }
    return [itemNames, itemPrices];
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
