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

	constructor(trolly, deliveryFee){
		this.items = trolly;
		makeOrderPrams(this.trolly);
		this.deliveryFee = deliveryFee;
		this.address = "";
	}

	makeOrderPrams(trolly){
		let integers = [];
		this.itemCount = 0;
		trolly.forEach(item => {
			for(let i = 0; i < item.count; i++){
				integers.push(item.item);
				integers.push(item.option);
				integers.push(item.extra.length);
				integers.concat(item.extras);
				this.itemCount++;
			}
		});
		this.paramIntegers = integers;

	}

	getOrder(address){

	}

}