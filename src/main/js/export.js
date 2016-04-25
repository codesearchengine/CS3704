var makeFile = function() {
    var blob = new Blob([JSON.stringify(results.results, null, 2)], {type: "application/json"});
    saveAs(blob, "resultSet.json");
}