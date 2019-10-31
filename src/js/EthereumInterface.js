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
		      restaurant.logoAddress = await commitLogo();
		      
		      console.log("Making Manu");
		      await makeMenu();
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
	var itemNames = [];
	var itemDescriptions = [];
	var optionNames = [];
	var optionPrices = [];
	var optionFlags = []; // this will store the lengths of each grouping of options in the 1D array

	for(var i = 0; i < restaurant.menu.length; i++){
		if(typeof restaurant.menu[i] != "undefined"){
			if(restaurant.menu[i].name != "" && restaurant.menu[i].description != "" && !restaurant.menu[i].onChain){
				itemNames.push(web3.fromAscii(restaurant.menu[i].name));
				itemDescriptions.push(web3.fromAscii(restaurant.menu[i].description));
				for(var j = 0; j < restaurant.menu[i].options.length; j++){
					optionNames.push(web3.fromAscii(restaurant.menu[i].options[j]));
				}
				for(var j = 0; j < restaurant.menu[i].prices.length; j++){
					optionPrices.push(restaurant.menu[i].prices[j]);
				}
				optionFlags.push(restaurant.menu[i].options.length);
			}
		}
	}

	console.log(itemNames,itemDescriptions,optionNames,optionPrices,optionFlags);

	// get the current menu and compare to decide what items need deleting or store a record of what items have been deleted and input that

	restaurant.restaurantInstance.updateMenu(itemNames,itemDescriptions,optionNames,optionPrices,optionFlags,[],{from: App.account, gas: 4000000}).then(function(err,result){
	      console.log(err);
	      console.log(result);
	})
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


