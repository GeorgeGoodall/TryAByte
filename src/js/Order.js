function orderItem(itemId, _optionId, _extraIds, _itemName, _optionName, _price, _extraNames, _extraPrices){
	// essential values
	this.itemId = _itemId;
	this.optionId = _optionId; 
	this.extraIds = _extraIds;


	// optional values
	this.itemName = _itemName;
	this.optionName = _optionName;
	this.price = _price;
	this.extraNames = _extraNames;
	this.extraPrices = _extraPrices;
}



class Order {
	constructor(trolly, deliveryFee, price){
		this.deliveryFee = deliveryFee;
		this.riderKey = "";
		this.address = "";

		this.restaurantAddress = "";
		this.orderTime = "";
		this.price = price;

		this.items = [];
		if(typeof trolly != "undefined"){
			this.items = trolly;
			this.makeOrderPrams(this.items);
		}
	}

	makeOrderPrams(trolly){
		let integers = [];
		this.itemCount = 0;
		trolly.forEach(item => {
			for(let i = 0; i < item.count; i++){
				integers.push(item.item);
				integers.push(item.option);
				integers.push(item.extras.length);
				integers = integers.concat(item.extras);
				this.itemCount++;
			}
		});
		this.paramIntegers = integers;

	}

	async getOrder(address, fullDeetails = false){
		this.address = address;
		this.orderInstance = await new App.contracts.Order(address);
		const p1 = this.orderInstance.restaurant();
		const p2 = this.orderInstance.riderStatus();
		const p3 = this.orderInstance.restaurantStatus();
		const p4 = this.orderInstance.customerStatus();
		const p5 = this.orderInstance.creationTime();
		const p6 = this.orderInstance.pickupTime();
		const p7 = this.orderInstance.deliveryTime();
		const p8 = this.orderInstance.getCost();
		const p9 = this.orderInstance.keyHashRider();
		const p10 = this.orderInstance.keyHashRestaurant();



		await Promise.all([p1,p2,p3,p4,p5,p6,p7,p8,p9,p10]).then((res)=>{
			this.restaurantAddress = res[0]; 
			this.riderStatus = res[1];
			this.restaurantStatus = res[2];
			this.customerStatus = res[3];
			this.creationTime = this.getDateString(res[4]);
			this.pickupTime = this.getDateString(res[5]);
			this.deliveryTime = this.getDateString(res[6]);
			this.cost = res[7];
			this.riderHash = res[8];
			this.restaurantHash = res[9];
		});


		this.restaurant = new Restaurant();
		await this.restaurant.getRestaurant(this.restaurantAddress);

		if(fullDeetails){
			this.itemCount = await this.orderInstance.totalItems();
			
			let promises = [];
			for(let i = 0; i < this.itemCount; i++){
				promises.push(this.orderInstance.getItemRaw(i));
			}
			await Promise.all(promises).then((items)=>{
				items.forEach(item=>{
					let itemName = this.restaurant.menu[item[0]].name;

					let optionIndex = this.restaurant.menu[item[0]].itemOptions[item[1]]["c"][0] - 1;
					let optionName = this.restaurant.options.values[optionIndex].name;
					let optionPrice = this.restaurant.options.values[optionIndex].price;

					let extraNames = [];
					let extraPrices = [];
					for(let i = 0; i < item[2].length; i++){
						let extraIndex = this.restaurant.menu[item[0]].itemExtras[item[2][i]]["c"][0] - 1;
						extraNames.push(this.restaurant.extras.values[extraIndex].name);
						extraPrices.push(this.restaurant.extras.values[extraIndex].price);
					}

					this.items.push({"item": item[0],"option": item[1],"extras":item[2], "count": 1, "itemName": itemName, "optionName": optionName, "price": optionPrice, "extraNames": extraNames, "extraPrices": extraPrices});
				});
			});
		}

	}

	getStatus() {
		let status = "";

		if(this.restaurantStatus == 0 && this.customerStatus <= 1){
			return "Requested";
		}
		else if(this.restaurantStatus == 1 && this.customerStatus <= 1){
			status = "Preparing";
		}
		else if(this.restaurantStatus == 2 && this.customerStatus <= 1){
			status = "Finished Preparing";
		}
		if(this.riderStatus == 0){
			status += " - No delivery organised";
		}
		else if(this.riderStatus == 1){
			status += " - delivery organised";
		}
		if(this.restaurantStatus == 3 && this.riderStatus == 2){
			status = "Out for delivery";
		}
		else if(this.restaurantStatus == 3 && this.riderStatus == 3 && this.customerStatus == 2){
			status = "Delivered";
		}
		return status;
	}

	getDateString(unixTimestamp){
		var monthNames = [
		    "January", "February", "March",
		    "April", "May", "June", "July",
		    "August", "September", "October",
		    "November", "December"
		];

		let date = new Date(unixTimestamp * 1000);
		var hours = date.getHours();
		var minutes = date.getMinutes();
		var seconds = date.getSeconds();
		var day = date.getDate();
		var monthIndex = date.getMonth();
		var year = date.getFullYear();

		return day + ' ' + monthNames[monthIndex] + ' ' + year + " - " + hours + ":" + minutes;
	}

}

