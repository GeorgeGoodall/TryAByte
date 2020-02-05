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
	
	const searchPagePromise = SearchPage.init();
	const RestaurantSettingsPagePromise = RestaurantSettingsPage.init();
	const CustomerAccountPromise = Customer.getCustomer();
	const RiderAccountPromise = Rider.getRider();
	

	await Promise.all([RestaurantSettingsPagePromise, searchPagePromise, CustomerAccountPromise, RiderAccountPromise]).then(async function(){
		let promises = [];

		if(RestaurantSettingsPage.restaurantAddress != null && RestaurantSettingsPage.restaurantAddress != "0x0000000000000000000000000000000000000000"){
			let name = RestaurantSettingsPage.restaurant.name;
			document.getElementById("RestaurantSettingsNavItem").innerHTML = name + "'s Settings";
			document.getElementById("RestaurantSettingsNavItem").href = "#settings";
			document.getElementById("nav_links").insertAdjacentHTML('afterbegin','<a href="/#orders/recived" class="navbar-item">Orders recived</a>');
		}
		if(Rider.address != "0x0000000000000000000000000000000000000000" && Rider.address != null){
			document.getElementById("nav_links").insertAdjacentHTML('afterbegin','<a href="/#orders/taken" class="navbar-item">Your jobs</a>');
			document.getElementById("nav_links").insertAdjacentHTML('afterbegin','<a href="/#jobs" class="navbar-item">View jobs</a>');
			promises.push(JobsPage.init());
			promises.push(Rider.getOrders());
		}
		renderHome();
		console.timeEnd("loading View");
		
		promises.push(Customer.init());

		await Promise.all(promises).then(()=>{
			console.log("test");
			if(Customer.address != "0x0000000000000000000000000000000000000000" && Customer.address != null){
				document.getElementById("nav_links").insertAdjacentHTML('afterbegin','<a href="/#orders/made" class="navbar-item">Your orders</a>');
			}
			console.timeEnd("overAll");
		});
	});

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

	window.scrollTo(0,0);


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
		case "#orders":
			loadingPage.style.display = "block";
			if(url[1] == "made"){
				OrderListPage.init(Customer.orders, false);
				document.getElementById("orderlistpage").style.display = 'block';
				loadingPage.style.display = "none";
			}
			else if(url[1] == "recived"){
				OrderListPage.init(RestaurantSettingsPage.restaurant.orders, true);
				document.getElementById("orderlistpage").style.display = 'block';
				loadingPage.style.display = "none";
			}
			else if(url[1] == "taken"){
				OrderListPage.init(Rider.orders, false ,true);
				document.getElementById("orderlistpage").style.display = 'block';
				loadingPage.style.display = "none";
			}
			else{
				renderHome();
			}
			break;
		case "#order":
			loadingPage.style.display = "block";
			
			document.getElementById("orderpage").style.display = 'block';
			loadingPage.style.display = "none";
			break;
		case "#jobs":
			loadingPage.style.display = "block";
			
			document.getElementById("jobslistpage").style.display = 'block';
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

var waitForInitialised = function(object, callback){
	if(object.initialised){
		callback();
	}
	else{
		setTimeout(function(){
			waitForInitialised(object,callback);
		},100);
	}
}