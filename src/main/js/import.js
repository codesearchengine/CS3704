var reader = new FileReader();

var fileSelectChange = function(evnt) {
    evnt.stopPropagation();
    evnt.preventDefault();
    if(evnt.target.files[0]) {
        reader.readAsText(evnt.target.files[0], "utf-8");
    }
}

var checkResults = function() {
    alert(JSON.stringify(results.results));
}

var parseText = function(evnt) {
    results.parse(reader.result);
};

reader.onload = parseText;
document.getElementById("fileSelect").addEventListener("change", fileSelectChange, false);
