

var menu = [{
	{
		'name':'0',
		'options':{
			0 : {
				'name':'optionA'
			},
			1 : {
				'name':'optionB'
			},
			2 : {
				'name':'optionC'
			},
			3 : {
				'name':'optionD'
			}
		}		
	},
	{
		'name':'1',
		'options':{
			0 : {
				'name':'optionA'
			},
			1 : {
				'name':'optionB'
			},
			2 : {
				'name':'optionC'
			},
			3 : {
				'name':'optionD'
			}
		}
	},
	{
		'name':'2',
		'options':{
			0 : {
				'name':'optionA'
			},
			1 : {
				'name':'optionB'
			},
			2 : {
				'name':'optionC'
			},
			3 : {
				'name':'optionD'
			}
		}
	},
	{
		'name':'3',
		'options':{
			0 : {
				'name':'optionA'
			},
			1 : {
				'name':'optionB'
			},
			2 : {
				'name':'optionC'
			},
			3 : {
				'name':'optionD'
			}
		}
	},
	{
		'name':'4',
		'options':{
			0 : {
				'name':'optionA'
			},
			1 : {
				'name':'optionB'
			},
			2 : {
				'name':'optionC'
			},
			3 : {
				'name':'optionD'
			}
		}
	},
	{
		'name':'5',
		'options':{
			0 : {
				'name':'optionA'
			},
			1 : {
				'name':'optionB'
			},
			2 : {
				'name':'optionC'
			},
			3 : {
				'name':'optionD'
			}
		}
	}
]


function menuRemoveItems(itr,otr,otrf){
	var otri = 0;
	for(var i = itr.length; i >= 0; i--){ // for each item to remove
		if(otrf[i]==0){ // if the corisponding flag is 0
			for(var j = itr[i]; j < menu.length-1; j++){
				menu[j]=menu[j]+1;
			}
			menu[menu.length-1] = null;
		}
		else{

		}
	}
}