var exportResults = function(openDialog = true) {
    var blob = new Blob([JSON.stringify(results, null, 2)], {type: "application/json"});
   	if(openDialog === true) {
   		saveAs(blob, "resultSet.json");
   	}
   	return blob;
}