Customer = {

	address: null,
	orders: [],
	customerInstance: null,

	getCustomer: async function(address){
		if(typeof address == "undefined")
			address = App.account;

		this.address = await App.customerFactoryInstance.customers2(address);
		if(this.address == "0x0000000000000000000000000000000000000000"){
			if(await App.customerFactoryInstance.customers2(address) != "0x0000000000000000000000000000000000000000"){
				this.address = address;
			}else{
				return false;
			}
		}

		this.customerInstance = await new App.contracts.Customer(this.address);
		return true;
	},

	makeCustomer: async function(){
		await App.customerFactoryInstance.makeCustomer();
		return this.getCustomer();
	},

	getOrders: async function(){
		console.time("getting orders");
		this.totalOrders = await this.customerInstance.getTotalOrders();
		let addressPromises = [];
		let getOrderPromises = [];
		for(let i = 0; i < this.totalOrders; i++){
			addressPromises.push(this.customerInstance.getOrder(i));
		}
		await Promise.all(addressPromises).then(async (values)=>{
			for(let i = 0; i < values.length; i++){
				
				let o = new Order();
				await o.getOrder(values[i],true);
				this.orders.push(o);
			}

		});
		
	},


	init: async function(){
		console.log("init customer");
		if(App.account != "0x0000000000000000000000000000000000000000" && this.customerInstance != null){
			await this.getOrders();
		}
	}


}