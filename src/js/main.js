// this script will handle the rendering of the display

var currentPage = "home";
var loadingPage;

window.onload = function(){
	loadingPage = document.getElementById("loadingpage");

}

window.onhashchange = function(){
	render(window.location.hash);
};


// start loading data in the background
async function main_init(){
	
	// if(){ // if they have a restaurant, prioritise loading the restaurant info and change the become a partner to restaurant settings
			
	// }

	// RestaurantSettingsPage.init().then(function(){
	// 	if(RestaurantSettingsPage.restaurantAddress != null && RestaurantSettingsPage.restaurantAddress != "0x0000000000000000000000000000000000000000"){
	// 		let name = RestaurantSettingsPage.restaurant.name;
	// 		document.getElementById("RestaurantSettingsNavItem").innerHTML = name + "'s Settings";
	// 		document.getElementById("RestaurantSettingsNavItem").href = "#settings";
	// 	}
	// });
	// SearchPage.init();

	// renderHome();

	SearchPage.init();
	var p1 = new Promise(async function(resolve,reject){await RestaurantSettingsPage.init();resolve();});
	

	Promise.all([p1]).then(function(){
		if(RestaurantSettingsPage.restaurantAddress != null && RestaurantSettingsPage.restaurantAddress != "0x0000000000000000000000000000000000000000"){
			let name = RestaurantSettingsPage.restaurant.name;
			document.getElementById("RestaurantSettingsNavItem").innerHTML = name + "'s Settings";
			document.getElementById("RestaurantSettingsNavItem").href = "#settings";
		}
		renderHome();	
	})

}

function renderHome(){
	render("#home");
	window.location.hash = "home";
}

async function render(hashKey){

	let pages = document.querySelectorAll(".page");

	// hide all pages
	for(let i = 0; i < pages.length; i++){
		pages[i].style.display = 'none';
	}

	let url = hashKey.split("/");


	switch(url[0]){
		case "#search":
			// display the loading page
			// get the restaurants
			// hide the loading page
			// display the restaurants
			loadingPage.style.display = "block";
			waitForInitialised(SearchPage,function(){
				var page = document.getElementById("searchpage");
				if(typeof page != 'undefined'){
					currentPage = "search";
					page.style.display = 'block';
				}
				else{
					currentPage.style.display = "block";
				}
				loadingPage.style.display = "none";
			});
			break;
		case "#settings":
			// display the loading page
			// load the data
			// hide the loading page
			// display the settings page
			loadingPage.style.display = "block";
			if(url[1] == "preview"){
				await ViewPage.populatePageWithNew();
				document.getElementById("viewpage").style.display = 'block';
				loadingPage.style.display = "none";
			}
			else{
				waitForInitialised(RestaurantSettingsPage,function(){
					document.getElementById("settingspage").style.display = 'block';
					loadingPage.style.display = "none";
				});
			}
			break;
		case "#view":
			loadingPage.style.display = "block";
			if(typeof url[1] == "undefined"){
				renderHome();
			}
			else{
				let index = parseInt(url[1]);
				if(isNaN(index)){
					renderHome();
				}
				else{
					await ViewPage.populatePage(index);
					document.getElementById("viewpage").style.display = 'block';
					loadingPage.style.display = "none";
				}
			}
			break;
		default:
			var page = document.getElementById(hashKey.substr(1) + "page");
			if(typeof page != 'undefined'){
				currentPage = hashKey.substr(1);
				page.style.display = 'block';
			}
			else{
				currentPage.style.display = "block";
			}
	}
}

var waitForInitialised = function(object, callback){
	console.log("waiting");
	if(object.initialised){
		callback();
	}
	else{
		setTimeout(function(){
			waitForInitialised(object,callback);
		},100);
	}
}