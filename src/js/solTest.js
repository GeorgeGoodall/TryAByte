

var menu = [
	{
		'name':'0',
		'options':[
			{'name':'optionA'},
			{'name':'optionB'},
			{'name':'optionC'},
			{'name':'optionD'},	]
	},
	{
		'name':'1',
		'options':[
			{'name':'optionA'},
			{'name':'optionB'},
			{'name':'optionC'},
			{'name':'optionD'}
		]
	},
	{
		'name':'2',
		'options':[
			{'name':'optionA'},
			{'name':'optionB'},
			{'name':'optionC'},
			{'name':'optionD'}
		]
	},
	{
		'name':'3',
		'options':[
			{'name':'optionA'},
			{'name':'optionB'},
			{'name':'optionC'},
			{'name':'optionD'}
		]
	},
	{
		'name':'4',
		'options':[
			{'name':'optionA'},
			{'name':'optionB'},
			{'name':'optionC'},
			{'name':'optionD'}
		]
	},
	{
		'name':'5',
		'options':[
			{'name':'optionA'},
			{'name':'optionB'},
			{'name':'optionC'},
			{'name':'optionD'}
		]
	}
]


// must require that the itemsToRemove are in assending order

function menuRemoveItems(itr,otr,otrf){
	var otri = 0;
	for(var i = itr.length - 1; i >= 0; i--){ // for each item to remove
		console.log("evaluating item to remove: " + i);
		console.log("the index of this item is: " + itr[i]);
		
		if(otrf[i]==0){ // if the corisponding flag is 0, delete the index to delete and move everything else down
			for(var j = itr[i]; j < menu.length-1; j++){  
				menu[j]=menu[j+1];
			}
			menu[menu.length-1] = null;
		}
		else{ // else
			console.log("evaluating options to remove at index " + (otr.length-otri) + " down to index " + (otr.length-otri-otrf[i]));
			for(var j = otr.length-otri; j >= otr.length-otri-otrf[i]; j--){ // for each option set out by the option remove flag
				console.log("the current option to remove is: " + otr[j] + " and the current item to remove it from is at index: " + itr[i]);
				for(var k = otr[j]; k < menu[itr[i]].options.length-1; k++){ // for each option in the current item between the option to remove and the last option 
					console.log("moving option " + (k+1) + " to " + k);
					menu[itr[i]].options[k] = menu[itr[i]].options[k+1];
				}
				console.log("deleting the last index");
				menu[itr[i]].options[menu[itr[i]].options.length-1] = null;
			}
			otri += otrf[i];
		}
	}

	console.log(menu);
}

function run(){
	console.log("running");
	itr = [2,4];
	otr = [2,4,1,2,4];
	otrf = [2,3];

	menuRemoveItems(itr,otr,otrf);
}