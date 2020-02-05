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
		      await restaurant.getRestaurant(restaurant.contractAddress);
		      
		      restaurant.logoAddress = await commitLogo(restaurant);
		      
		      // console.log("Making Manu");
		      // await makeMenu(restaurant);
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

	// vars for adding extras
	let optionsToCommit_names = [];
	let optionsToCommit_prices = [];

	// vars for removing extras
	let optionsToDelete = [];

	// vars for removing items
	var itemsToRemove = [];

	// vars for adding items
	var itemToAdd_Index = [];
	var itemToAdd_Names = [];
	var itemToAdd_Descriptions = [];


	// vars for unassigning options
	var optionsToUnassign_itemId = [];
	var optionsToUnassign_optionId = [];
	var optionsToUnassign_flags = [];
	
	// vars for assigning options
	var optionsToAssign_itemId = [];
	var optionsToAssign_optionId = [];
	var optionsToAssign_flags = [];

	// vars for unassigning extras
	var extrasToUnassign_itemId = [];
	var extrasToUnassign_optionId = [];
	var extrasToUnassign_flags = [];

	// vars for assigning extras
	var extrasToAssign_itemId = [];
	var extrasToAssign_optionId = [];
	var extrasToAssign_flags = [];


	let extrasIdsUsed = []; // temp array
	for(let i = 0; i < restaurant.menu.length; i++){
		for(let j = 0; j < restaurant.menu[i].itemExtras.length; j++){
			if(restaurant.menu[i].onChain && !restaurant.menu[i].toBeDeleted || !restaurant.menu[i].onChain && !restaurant.menu[i].toBeDeleted)
				extrasIdsUsed[restaurant.menu[i].itemExtras[j]-1] = true;
		}
	}

	for(let i = 0; i < extrasIdsUsed.length; i++){
		if(extrasIdsUsed[i] == true && !restaurant.extras.values[i].onChain){
			extrasToCommit_names.push(web3.fromAscii(restaurant.extras.values[i].name));
			extrasToCommit_prices.push(restaurant.extras.values[i].price);
		}
		else if(extrasIdsUsed[i] != true && restaurant.extras.values[i].onChain){
			extrasToDelete.push(i);
		}
		
	}

	let optionsIdsUsed = []; // temp array
	for(let i = 0; i < restaurant.menu.length; i++){
		for(let j = 0; j < restaurant.menu[i].itemOptions.length; j++){
			if(restaurant.menu[i].onChain && !restaurant.menu[i].toBeDeleted || !restaurant.menu[i].onChain && !restaurant.menu[i].toBeDeleted)
				optionsIdsUsed[restaurant.menu[i].itemOptions[j]-1] = true;
		}
	}

	for(let i = 0; i < optionsIdsUsed.length; i++){
		if(optionsIdsUsed[i] == true && !restaurant.options.values[i].onChain){
			optionsToCommit_names.push(web3.fromAscii(restaurant.options.values[i].name));
			optionsToCommit_prices.push(restaurant.options.values[i].price);
		}
		else if(optionsIdsUsed[i] != true && restaurant.options.values[i].onChain){
			optionsToDelete.push(i);
		}
		
	}

	for(var i = 0; i < restaurant.menu.length; i++){
		if(typeof restaurant.menu[i] != "undefined"){
			
			// get all items that have to been deleted and are on chain
			if(restaurant.menu[i].name != "" && restaurant.menu[i].description != "" && restaurant.menu[i].onChain && restaurant.menu[i].toBeDeleted){
				itemsToRemove.push(restaurant.menu[i].id);
				break;
			}

			// get all items that have been added that are not onchain
			if(restaurant.menu[i].name != "" && restaurant.menu[i].description != "" && !restaurant.menu[i].onChain && !restaurant.menu[i].toBeDeleted){
				itemToAdd_Index.push(i);
				itemToAdd_Names.push(web3.fromAscii(restaurant.menu[i].name));
				itemToAdd_Descriptions.push(web3.fromAscii(restaurant.menu[i].description));
			}

			// if the item is onchain or to be put on chain loop through its options and extras
			if(!restaurant.menu[i].toBeDeleted){
				let optionsToUnassign = 0;
				let optionsToAssign = 0;
				for(var j = 0; j < restaurant.menu[i].itemOptions.length; j++){
					if(restaurant.menu[i].itemOptionToDelete[j] && restaurant.menu[i].itemOptionsOnChain[j]){
						optionsToUnassign_optionId.push(restaurant.menu[i].itemOptions[j]);
						optionsToUnassign++;
					}
					else if(!restaurant.menu[i].itemOptionToDelete[j] && !restaurant.menu[i].itemOptionsOnChain[j]){
						optionsToAssign_optionId.push(restaurant.menu[i].itemOptions[j]);
						optionsToAssign++;
					}
				}
				if(optionsToUnassign > 0){
					optionsToUnassign_itemId.push(i);
					optionsToUnassign_flags.push(optionsToUnassign);
				}
				if(optionsToAssign > 0){
					optionsToAssign_itemId.push(i);
					optionsToAssign_flags.push(optionsToAssign);
				}

				let extrasToUnassign = 0;
				let extrasToAssign = 0;
				for(var j = 0; j < restaurant.menu[i].itemExtras.length; j++){
					if(restaurant.menu[i].itemExtrasToDelete[j] && restaurant.menu[i].itemExtrasOnchain[j]){
						extrasToUnassign_optionId.push(restaurant.menu[i].itemExtras[j]);
						extrasToUnassign++;
					}
					else if(!restaurant.menu[i].itemExtrasToDelete[j] && !restaurant.menu[i].itemExtrasOnchain[j]){
						extrasToAssign_optionId.push(restaurant.menu[i].itemExtras[j]);
						extrasToAssign++;
					}
				}
				if(extrasToUnassign > 0){
					extrasToUnassign_itemId.push(i);
					extrasToUnassign_flags.push(extrasToUnassign);
				}
				if(extrasToAssign > 0){
					extrasToAssign_itemId.push(i);
					extrasToAssign_flags.push(extrasToAssign);
				}
			}
		}
	}

	var intArray = [];
	var intFlags = [];

	var strArray = [];
	var strFlags = [];

	intArray = intArray.concat(
		extrasToDelete,extrasToCommit_prices,
		optionsToDelete, optionsToCommit_prices,
		itemsToRemove,
		itemToAdd_Index,
		optionsToUnassign_itemId,optionsToUnassign_optionId,optionsToUnassign_flags,
		optionsToAssign_itemId,optionsToAssign_optionId,optionsToAssign_flags,
		extrasToUnassign_itemId,extrasToUnassign_optionId,extrasToUnassign_flags,
		extrasToAssign_itemId,extrasToAssign_optionId,extrasToAssign_flags,
	);

	intFlags.push(
		extrasToDelete.length,extrasToCommit_prices.length,
		optionsToDelete.length, optionsToCommit_prices.length,
		itemsToRemove.length,
		itemToAdd_Index.length,
		optionsToUnassign_itemId.length,optionsToUnassign_optionId.length,optionsToUnassign_flags.length,
		optionsToAssign_itemId.length,optionsToAssign_optionId.length,optionsToAssign_flags.length,
		extrasToUnassign_itemId.length,extrasToUnassign_optionId.length,extrasToUnassign_flags.length,
		extrasToAssign_itemId.length,extrasToAssign_optionId.length,extrasToAssign_flags.length
	);

	strArray = strArray.concat(
		extrasToCommit_names,
		optionsToCommit_names,
		itemToAdd_Names,itemToAdd_Descriptions
	);
	strFlags.push(
		extrasToCommit_names.length,
		optionsToCommit_names.length,
		itemToAdd_Names.length,itemToAdd_Descriptions.length
	);

	console.log(extrasToCommit_names, extrasToCommit_prices);
	console.log(optionsToCommit_names, optionsToCommit_prices);

	console.log(intArray, intFlags, strArray, strFlags);

	restaurant.menuInstance.updateMenu(intArray,intFlags,strArray,strFlags).then(function(err,res){
		console.log(err);
		console.log(res);
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


