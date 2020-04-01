import React, { Component } from 'react';
import Web3 from 'web3'
import TruffleContract from 'truffle-contract'

// ContractABI imports
import order from '../../build/contracts/Order.json';
import restaurantFactory from '../../build/contracts/RestaurantFactory.json';
import restaurant from '../../build/contracts/Restaurant.json';
import customerFactory from '../../build/contracts/CustomerFactory.json';
import customer from '../../build/contracts/Customer.json';
import riderFactory from '../../build/contracts/RiderFactory.json';
import rider from '../../build/contracts/Rider.json';
import controller from '../../build/contracts/Controller.json';
import menu from '../../build/contracts/Menu.json';

// controller address import
import appConfig from '../../AppConfig.json';

class App extends Component{


  constructor(props) {
    super(props);

    if (typeof web3 != 'undefined') {
      this.web3Provider = web3.currentProvider
    } else {
      this.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545')
    }

    this.web3 = new Web3(this.web3Provider);

    this.contracts = {};

    this.contracts.order = TruffleContract(order);
    this.contracts.restaurantFactory = TruffleContract(restaurantFactory);
    this.contracts.restaurant = TruffleContract(restaurant);
    this.contracts.customerFactory = TruffleContract(customerFactory);
    this.contracts.customer = TruffleContract(customer);
    this.contracts.riderFactory = TruffleContract(riderFactory);
    this.contracts.rider = TruffleContract(rider);
    this.contracts.controller = TruffleContract(controller);
    this.contracts.menu = TruffleContract(menu);

    for(const key in this.contracts){
      this.contracts[key].setProvider(this.web3Provider);
    }
    
    this.initFactories(appConfig.controllerAddress);

    //this.watchEvents = this.watchEvents.bind(this)


    this.login();
  }

  async login(){

    if(typeof web3.eth.accounts[0] == 'undefined'){
      this.account = '0x0';
        await ethereum.enable().then(function(res){
          if(web3.eth.accounts[0] !== this.account && typeof web3.eth.accounts[0] != 'undefined'){
            this.account = web3.eth.accounts[0];
            return true;
          }
        })
    }else{
      if(web3.eth.accounts[0] !== this.account && typeof web3.eth.accounts[0] != 'undefined'){
        if(this.local){
          var accountID = prompt("please enter the account index", "[0-10]");
          this.account = web3.eth.accounts[accountID];
        }
        else
          this.account = web3.eth.accounts[0];
        return true;
      }
    }

  }

  async initFactories(controllerAddress){
    console.time("init initFactories");
    this.controllerInstance = await new this.contracts.controller(controllerAddress);

    const p1 = this.controllerInstance.restaurantFactoryAddress();
    const p2 = this.controllerInstance.customerFactoryAddress();
    const p3 = this.controllerInstance.riderFactoryAddress();

    await Promise.all([p1,p2,p3]).then((values)=>{
      this.restaurantFactoryInstance = new this.contracts.restaurantFactory(values[0]);
      this.customerFactoryInstance = new this.contracts.customerFactory(values[1]);
      this.riderFactoryInstance = new this.contracts.riderFactory(values[2]);
    });

    console.timeEnd("init initFactories");
  }



  componentDidMount() {
   
  }

  watchEvents() {
    // TODO: trigger event when vote is counted, not when component renders
    
  }
}

export default App;
