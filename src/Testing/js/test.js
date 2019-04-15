async function getHash(){
	console.log(App.contracts.Test);
	var toHash = document.getElementById("toHash").value;
	alert(toHash);
	var hashed = await App.test.getHash(toHash);
	alert(hashed);
}

async function emitTest(){
	console.log("adding listener to test");
	var event = App.test.testEvent();

	event.watch(function(error,result){
		if(!error)
			console.log(result);
	})

	App.test.emitEvent();

	// web3.eth.subscribe('logs', options, function (error, result) {
	//     if (!error)
	//         console.log(result);
	// })
	//     .on("data", function (log) {
	//         console.log(log);
	//     })
	//     .on("changed", function (log) {
	// });

	// var event = App.contracts.Test.testEvent("MyEvent", 
	// 	{

	// 	}, (error,event) => {console.log(event);});
	// instructorEvent.watch(function(err,res){
	// 	if(!err){
	// 		alert("Win");
	// 	}
	// });
	// console.log("getting ready to emitTest");
	// await App.contracts.Test.emitEvent();

}