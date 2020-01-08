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
			App.restaurantFactoryInstance.createRestaurant(restaurant.name,web3.fromAscii(restaurant.address),10,10,restaurant.number,{from: App.account, gas: 4000000}).then(async function(err,result){
		      restaurant.contractAddress = await App.restaurantFactoryInstance.restaurants2(App.account);
		      restaurant.restaurantInstance = await new App.contracts.Restaurant(restaurant.contractAddress);
		      console.log("restaurant Made at: " + restaurant.contractAddress);
		      
		      console.log("commit Logo");
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
	// vars for adding items
	var itemAddAtIndex = [];
	var itemNames = [];
	var itemDescriptions = [];
	var optionNames = [];
	var optionPrices = [];
	var optionFlags = []; // this will store the lengths of each grouping of options in the 1D array

	// vars for removing
	var itemsToRemove = [];
	var optionsToRemove = [];
	var optionsToRemoveFlags = [];

	// vars for adding options 
	var itemsForNewOptionsIds = [];
	var addOptionNames = [];
	var addOptionPrices = [];
	var addOptionFlags = [];

	for(var i = 0; i < restaurant.menu.length; i++){
		if(typeof restaurant.menu[i] != "undefined"){
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

			// get all items that have to been deleted and are on chain
			if(restaurant.menu[i].name != "" && restaurant.menu[i].description != "" && restaurant.menu[i].onChain && restaurant.menu[i].toBeDeleted){
				itemsToRemove.push(restaurant.menu[i].id);
				optionsToRemoveFlags.push(0);
			}
			
			var optionsToDeleteTemp = [];
			var optionsToAddTemp = [];

			console.log();

			for(var j = 0; j < restaurant.menu[i].options.length; j++){
				var option = restaurant.menu[i].options[j];
				console.log(option);
				// gets all options that have to be deleted that are on chain
				if(restaurant.menu[i].onChain && option.toBeDeleted && option.onChain){	
					optionsToDeleteTemp.push(option.id);
				}
				// if the option is a new option
				if(restaurant.menu[i].onChain && !option.toBeDeleted && !option.onChain){
					optionsToAddTemp.push(option)
				}


				// hack solution for now, ideally this would be resolved by instead of simply deleting, the option name would be updated
				var deleteFirstOption = true;
				if(restaurant.menu[i].onChain && option.onChain){
					deleteFirstOption = false;
				}
			}
			if(deleteFirstOption){
				optionsToDeleteTemp = [0].concat(optionsToDeleteTemp);
			}
			if(optionsToDeleteTemp.length > 0){
				itemsToRemove.push(restaurant.menu[i].id);
				optionsToRemove = optionsToRemove.concat(optionsToDeleteTemp);
				optionsToRemoveFlags.push(optionsToDeleteTemp.length);
			}
			if(optionsToAddTemp.length > 0){
				itemsForNewOptionsIds.push(restaurant.menu[i].id);
				for(var k = 0; k <optionsToAddTemp.length; k++){
					console.log(optionsToAddTemp[k]);
					addOptionNames.push(optionsToAddTemp[k].name);
					addOptionPrices.push(optionsToAddTemp[k].price);
				}
				addOptionFlags.push(optionsToAddTemp.length);
			}
			
			// get new extras and add them

			// get new item extra links and add them


		}
	}

	console.log(itemNames, itemDescriptions, optionNames, optionPrices, optionFlags);
	console.log(itemsToRemove, optionsToRemove, optionsToRemoveFlags);
	console.log(itemsForNewOptionsIds, addOptionNames, addOptionPrices, addOptionFlags);

	restaurant.menuInstance.addMultipleItems(itemAddAtIndex, itemNames, itemDescriptions, optionNames, optionPrices, optionFlags,{from: App.account, gas: 4000000}).then(function(err,result){
		console.log(err);
		console.log(result);
	});


	// restaurant.restaurantInstance.updateMenu(itemNames,itemDescriptions,optionNames,optionPrices,optionFlags,
	// 										itemsToRemove,optionsToRemove,optionsToRemoveFlags,
	// 										itemsForNewOptionsIds, addOptionNames, addOptionPrices, addOptionFlags,
	// 										{from: App.account, gas: 4000000}).then(function(err,result){
	//       console.log(err);
	//       console.log(result);
	// })
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


