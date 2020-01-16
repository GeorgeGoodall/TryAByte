//**********************************************************************************************//
// Ethereum Interface 
// 		this script is responsible for storing functions that involve interfacing with the blockchain
//**********************************************************************************************//
async function makeRestaurant(restaurant){

	// ensure the restaurant doesn't have any undefined fields
	var errorString = "";
	if(typeof restaurant.name == 'undefined' || restaurant.name == "")
		errorString += "name is undefined\n";
	if(typeof restaurant.country == 'undefined' || restaurant.country ==  "")
		errorString += "country is undefined\n";
	if(typeof restaurant.address == 'undefined' || restaurant.address ==  "")
		errorString += "address is undefined\n";
	if(typeof restaurant.town == 'undefined' || restaurant.town == "")
		errorString += "town is undefined\n";
	if(typeof restaurant.county == 'undefined' || restaurant.county ==  "" )
		errorString += "county is undefined\n";
	if(typeof restaurant.postcode == 'undefined' || restaurant.postcod ==  "")
		errorString += "postcode is undefined\n";
	if(typeof restaurant.number == 'undefined' || restaurant.number ==  "" )
		errorString += "number is undefined\n";
	
	if(restaurant.logoHash == null)
		errorString += "please upload a logo\n";
		
	// should check that the menu is valid

	if(errorString != ""){
		alert(errorString);
	}
	else{

		if(restaurant.contractAddress == null || restaurant.contractAddress == "0x"){
			// make a new restaurant
			console.log("making restaurant");
			App.restaurantFactoryInstance.createRestaurant(web3.fromAscii(restaurant.name),web3.fromAscii(restaurant.address),10,10,restaurant.number,{from: App.account, gas: 6000000}).then(async function(err,result){
		      restaurant.contractAddress = await App.restaurantFactoryInstance.restaurants2(App.account);
		      restaurant.getRestaurant(App.account);
		      
		      restaurant.logoAddress = await commitLogo(restaurant);
		      
		      console.log("Making Manu");
		      await makeMenu(restaurant);
		    });
		}
		else{
			// update existing restaurant (perhapse a solidity funtion should be implemented to reduce the gas cost of this)

			// check each field and if they have changed update them
			if(web3.toAscii(await restaurant.restaurantInstance.name()) != restaurant.name){
				restaurant.restaurantInstance.name()
			}


		}
	}	
}

async function makeMenu(restaurant){
	// vars for adding extras
	let extrasToCommit_names = [];
	let extrasToCommit_prices = [];

	// vars for removing extras
	let extrasToDelete = [];

	// vars for adding items
	var itemAddAtIndex = [];
	var itemNames = [];
	var itemDescriptions = [];
	var optionNames = [];
	var optionPrices = [];
	var optionFlags = []; // this will store the lengths of each grouping of options in the 1D array
	var extrasIdsForNewItem = [];
	var extrasFlagsForNewItem = [];

	// vars for removing items
	var itemsToRemove = [];

	// vars for removing options
	var itemIdsForOptionRemoval = [];
	var optionsToRemove = [];
	var optionsToRemoveFlags = [];

	// vars for adding options 
	var itemsForNewOptionIds = [];
	var insertOptionAtIndex = [];
	var addOptionNames = [];
	var addOptionPrices = [];

	// vars for assigning extras
	var itemIdsForNewExtra = [];
	var newExtraIds = [];
	var newExtraFlags = [];

	// vars for unassigning extras
	var itemIdsForExtraRemoval = [];
	var extraIdsToRemove = [];
	var removeExtraFlags = [];

	let extrasIdsUsed = []; // temp array
	for(let i = 0; i < restaurant.menu.length; i++){
		for(let j = 0; j < restaurant.menu[i].itemExtras.length; j++){
			if(restaurant.menu[i].onChain)
				extrasIdsUsed[restaurant.menu[i].itemExtras[j]] = true;
		}
	}

	for(let i = 0; i < extrasIdsUsed.length; i++){
		if(extrasIdsUsed[i] == true && !restaurant.extras[i].onChain){
			console.log(restaurant.extras[i].name);
			extrasToCommit_names.push(web3.fromAscii(restaurant.extras[i].name));
			extrasToCommit_prices.push(restaurant.extras[i].price);
		}
		else if(extrasIdsUsed[i] != true && restaurant.extras[i].onChain){
			extrasToDelete.push(i);
		}
		
	}

	for(var i = 0; i < restaurant.menu.length; i++){
		if(typeof restaurant.menu[i] != "undefined"){
			
			// get all items that have to been deleted and are on chain
			if(restaurant.menu[i].name != "" && restaurant.menu[i].description != "" && restaurant.menu[i].onChain && restaurant.menu[i].toBeDeleted){
				itemsToRemove.push(restaurant.menu[i].id);
			}

			// get all items that have been added that are not onchain
			if(restaurant.menu[i].name != "" && restaurant.menu[i].description != "" && !restaurant.menu[i].onChain && !restaurant.menu[i].toBeDeleted){
				itemAddAtIndex.push(0);
				itemNames.push(web3.fromAscii(restaurant.menu[i].name));
				itemDescriptions.push(web3.fromAscii(restaurant.menu[i].description));
				for(var j = 0; j < restaurant.menu[i].options.length; j++){
					optionNames.push(web3.fromAscii(restaurant.menu[i].options[j].name));
					optionPrices.push(restaurant.menu[i].options[j].price);
				}
				optionFlags.push(restaurant.menu[i].options.length);
			}

			
			// options to remove and add
			var optionsToDeleteTemp = [];
			var optionsToAddTemp = [];

			for(var j = 0; j < restaurant.menu[i].options.length; j++){
				var option = restaurant.menu[i].options[j];
				
				// gets all options that have to be deleted that are on chain
				if(restaurant.menu[i].onChain && option.toBeDeleted && option.onChain){
					optionsToDeleteTemp.push(option.id);
				}
				// if the option is a new option
				if(restaurant.menu[i].onChain && !option.toBeDeleted && !option.onChain){
					itemsForNewOptionIds.push(i);
					insertOptionAtIndex.push(0); // ToDo
					addOptionNames.push(web3.fromAscii(option.name));
					addOptionPrices.push(option.price);
				}


				// hack solution for now, ideally this would be resolved by instead of simply deleting, the option name would be updated
				var deleteFirstOption = true;
				if(restaurant.menu[i].onChain && option.onChain || !restaurant.menu[i].onChain){
					deleteFirstOption = false;
				}
			}
			if(deleteFirstOption){
				optionsToDeleteTemp = [0].concat(optionsToDeleteTemp);
			}
			if(optionsToDeleteTemp.length > 0){
				itemIdsForOptionRemoval.push(restaurant.menu[i].id);
				optionsToRemove = optionsToRemove.concat(optionsToDeleteTemp);
				optionsToRemoveFlags.push(optionsToDeleteTemp.length);
			}
			
			// extras
			let extrasFlagValue = 0;
			let newExtrasTmp = [];
			for(let j = 0; j < restaurant.menu[i].itemExtras.length; j++){
				// for new items
				if(!restaurant.menu[i].itemExtrasOnchain[j] && !restaurant.menu[i].onChain){
					extrasIdsForNewItem.push(restaurant.menu[i].itemExtras[j]);
					extrasFlagValue++;
				}
				else if(!restaurant.menu[i].itemExtrasOnchain[j] && restaurant.menu[i].onChain){
					newExtrasTmp.push(restaurant.menu[i].itemExtras[j]);
				}
			}
			if(!restaurant.menu[i].onChain)
				extrasFlagsForNewItem.push(extrasFlagValue);
			if(newExtrasTmp.length > 0){
				itemIdsForNewExtra.push(i);
				newExtraIds = newExtraIds.concat(newExtrasTmp);
				newExtraFlags.push(newExtrasTmp.length);
			}

			// unassigning extras 
			if(restaurant.menu[i].itemExtrasToDelete.length > 0){
				itemIdsForExtraRemoval.push(i);
				extraIdsToRemove = extraIdsToRemove.concat(restaurant.menu[i].itemExtrasToDelete);
				removeExtraFlags.push(restaurant.menu[i].itemExtrasToDelete.length);
			}
		}
	}

	var intArray = [];
	var intFlags = [];

	var strArray = [];
	var strFlags = [];

	intArray = intArray.concat(extrasToDelete,extrasToCommit_prices,itemsToRemove,
					itemAddAtIndex,optionPrices,optionFlags,extrasIdsForNewItem,extrasFlagsForNewItem,
					itemIdsForOptionRemoval,optionsToRemove,optionsToRemoveFlags,
					itemsForNewOptionIds,insertOptionAtIndex,addOptionPrices,
					itemIdsForExtraRemoval,extraIdsToRemove,removeExtraFlags,
					itemIdsForNewExtra,newExtraIds,newExtraFlags);
	intFlags.push(extrasToDelete.length,extrasToCommit_prices.length,itemsToRemove.length,
					itemAddAtIndex.length,optionPrices.length,optionFlags.length,extrasIdsForNewItem.length,extrasFlagsForNewItem.length,
					itemIdsForOptionRemoval.length,optionsToRemove.length,optionsToRemoveFlags.length,
					itemsForNewOptionIds.length,insertOptionAtIndex.length,addOptionPrices.length,
					itemIdsForExtraRemoval.length,extraIdsToRemove.length,removeExtraFlags.length,
					itemIdsForNewExtra.length,newExtraIds.length,newExtraFlags.length);

	strArray = strArray.concat(extrasToCommit_names,itemNames,itemDescriptions,optionNames,addOptionNames);
	strFlags.push(extrasToCommit_names.length,itemNames.length,itemDescriptions.length,optionNames.length,addOptionNames.length);

	console.log(extrasToDelete,extrasToCommit_prices,itemsToRemove,itemAddAtIndex,optionPrices,extrasIdsForNewItem,
					extrasFlagsForNewItem,itemIdsForOptionRemoval,optionsToRemove,optionsToRemoveFlags,
					itemsForNewOptionIds,insertOptionAtIndex,addOptionPrices,
					itemIdsForExtraRemoval,extraIdsToRemove,removeExtraFlags,
					itemIdsForNewExtra,newExtraIds,newExtraFlags);
	console.log(extrasToCommit_names,itemNames,itemDescriptions,optionNames,addOptionNames);
	
	console.log(intArray);	
	console.log(intFlags);
	console.log(strArray);
	console.log(strFlags);

	restaurant.menuInstance.updateMenu(intArray,intFlags,strArray,strFlags).then(function(err,res){
		console.log(err);
		console.log(result);
	});

	// console.log(itemNames, itemDescriptions, optionNames, optionPrices, optionFlags);
	// console.log(itemsToRemove, optionsToRemove, optionsToRemoveFlags);
	// console.log(itemsForNewOptionsIds, addOptionNames, addOptionPrices, addOptionFlags);

	// restaurant.menuInstance.addMultipleItems(itemAddAtIndex, itemNames, itemDescriptions, optionNames, optionPrices, optionFlags, extrasIdsForNewItem, extrasFlagsForNewItem, {from: App.account, gas: 4000000}).then(function(err,result){
	// 	console.log(err);
	// 	console.log(result);
	// });

	// remove extras  [indexes int] 1
    // add extras     [names string, prices int] 2
    // remove items   [itemindexes int] 1
    // add items      [addAtIndex int, itemnames sting, itemDescription string, optionnames string, price int, optionFlags int, extraIds int, extraFlags int] 2
    // remove options [itemIdss int, optionids int, flags int] 1
    // add options    [itemids int, addAtIndex int, optionNames string, _prices] 2
    // unassign extras[itemids int, extrasids int, flags int] 1
    // assign extras  [itemids int, extrasids int, flags int] 1

	//var intArray = ;


	// restaurant.restaurantInstance.updateMenu(itemNames,itemDescriptions,optionNames,optionPrices,optionFlags,
	// 										itemsToRemove,optionsToRemove,optionsToRemoveFlags,
	// 										itemsForNewOptionsIds, addOptionNames, addOptionPrices, addOptionFlags,
	// 										{from: App.account, gas: 4000000}).then(function(err,result){
	//       console.log(err);
	//       console.log(result);
	// })
}

async function commitExtras(restaurant){
	// iterate through all the extras being used, find the ones that need to be added to the chain
	// commit them to the chain
	// update the ids to reflect those that are onchain

	let extrasIdsUsed = [];
	let extrasToCommit_names = [];
	let extrasToCommit_prices = [];

	for(let i = 0; i < restaurant.menu.length; i++){
		for(let j = 0; j < restaurant.menu[i].itemExtras.length; j++){
			extrasIdsUsed[restaurant.menu[i].itemExtras[j]] = true;
		}
	}

	console.log("Commiting extras:");
	for(let i = 0; i < extrasIdsUsed.length; i++){
		if(extrasIdsUsed[i] == true && !restaurant.extras[i].onChain){
			console.log(restaurant.extras[i].name);
			extrasToCommit_names.push(web3.fromAscii(restaurant.extras[i].name));
			extrasToCommit_prices.push(restaurant.extras[i].price);
		}
	}
	console.log("end commiting extras:");



	restaurant.menuInstance.addExtras(extrasToCommit_names,extrasToCommit_prices,{from: App.account, gas: 4000000}).then(function(err,result){
		console.log(err);
		console.log(result);
	});	
}

// ToDo combine commit logo and upload logo together
// returns the logo uri
async function commitLogo(restaurant){

	// sign a message
	var messageToSign = 'Request to commit logo with a hash of: "'+ restaurant.logoHash +'" to be used by contract at: "' + restaurant.contractAddress +'"';
	console.log("message: " + messageToSign);
	const msgParams = [
	{
	    type: 'string',      	// Any valid solidity type
	    name: 'message',   // Any string label you want
	    value: messageToSign, 
	}];

	await web3.currentProvider.sendAsync(
	{
	    method: 'eth_signTypedData',
	    params: [msgParams, App.account],
	    from: App.account,
  	}, 
  	async function (err, result) {
		
  		// upload image and signed message
	    console.log("updating image from " + App.account);

    	data = new FormData();
	    data.append('file', restaurant.logoFile);
	    data.append('userAddress', App.account );
	    data.append('signature', result.result);
	    data.append('message', messageToSign);

	    var messageLock = false;

	    xhr = new XMLHttpRequest();
	    xhr.open( 'POST', '/uploadImage', true );
	    xhr.onreadystatechange = function ( response ) {
	    	if(response.target.responseText != "" && !messageLock){
	    		messageLock = true;
		    	if(response.target.status != 200){
		    		alert("Error: " + response.target.responseText);
		      	}else{
		    		console.log("image upladed successfully")
		    		restaurant.restaurantInstance.updateLogo(restaurant.logoAddress, restaurant.logoHash,{from: App.account, gas: 4000000})
		      			.then(function(result){
		      				console.log(result);
		      				return data.location;
		      		});
		    	}
	    	}
	    };

	    xhr.send(data);
	
  	});	
}


