Customer = {

	address: null,
	orders: null,

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
		return true;
	},

	makeCustomer: async function(){
		await App.customerFactoryInstance.makeCustomer();
		return this.getCustomer();
	},


}