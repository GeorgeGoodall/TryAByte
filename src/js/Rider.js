Rider = {

	makeRider: async function(){
		await App.riderFactoryInstance.makeRider();
		if(await this.getRider())
			await this.getOrders();
	},

	address: null,
	orders: [],
	riderInstance: null,

	getRider: async function(address){
		if(typeof address == "undefined")
			address = App.account;

		this.address = await App.riderFactoryInstance.riders2(address);
		if(this.address == "0x0000000000000000000000000000000000000000"){
			if(await App.riderFactoryInstance.riders2(address) != "0x0000000000000000000000000000000000000000"){
				this.address = address;
			}else{
				return false;
			}
		}

		this.riderInstance = await new App.contracts.Rider(this.address);
		return true;
	},

	getOrders: async function(){
		this.totalOrders = await this.riderInstance.totalOrders();
		let promises = [];
		for(let i = 0; i < this.totalOrders; i++){
			promises.push(this.riderInstance.getOrder(i));
		}
		await Promise.all(promises).then(async (values)=>{
			for(let i = 0; i < values.length; i++){
				let o = new Order();
				await o.getOrder(values[i],true);
				this.orders.push(o);
			}
		});
	},

	offerDelivery: async function(order){
		let orderAddress = order.address;
		// need to save this key
		let key = makeid(12);
		let hash = await App.controllerInstance.getHash(key);
		console.log(orderAddress,hash);
		this.riderInstance.offerDelivery(orderAddress,hash,{value:order.cost}).then(()=>{
			localStorage.setItem('riderKey'+order.address,key);
		});
	},

}

function makeid(length) {
	var text = "";
  	var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  	for (var i = 0; i < length; i++)
    	text += possible.charAt(Math.floor(Math.random() * possible.length));

  	return text;
}