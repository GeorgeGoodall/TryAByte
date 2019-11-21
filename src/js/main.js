// this script will handle the rendering of the display

var currentPage = "home";
var loadingPage;

window.onload = function(){
	loadingPage = document.getElementById("loadingpage");
	render("#home");
	window.location.hash = "home";
}

window.onhashchange = function(){
	render(window.location.hash);
};

async function render(hashKey){

	let pages = document.querySelectorAll(".page");

	// hide all pages
	for(let i = 0; i < pages.length; i++){
		pages[i].style.display = 'none';
	}

	switch(hashKey){
		case "#search":
			// display the loading page
			// get the restaurants
			// hide the loading page
			// display the restaurants

			var page = document.getElementById("searchpage");
			if(typeof page != 'undefined'){
				currentPage = "search";
				page.style.display = 'block';
			}
			else{
				currentPage.style.display = "block";
			}
			break;
		case "#settings":
			// display the loading page
			// load the data
			// hide the loading page
			// display the settings page
			loadingPage.style.display = "block";
			await RestaurantSettingsPage.init();
			document.getElementById("settingspage").style.display = 'block';
			loadingPage.style.display = "none";
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