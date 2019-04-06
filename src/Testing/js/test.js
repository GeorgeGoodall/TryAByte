async function getHash(){
	console.log(App.contracts.Test);
	var toHash = document.getElementById("toHash").value;
	alert(toHash);
	var hashed = await App.test.getHash(toHash);
	alert(hashed);
}