var reader = new FileReader();

var fileSelectChange = function(evnt) {
    evnt.stopPropagation();
    evnt.preventDefault();
    if(evnt.target.files[0]) {
    	readFile(evnt.target.files[0]);
    }
}

var readFile = function(file) {
	reader.readAsText(file, "utf-8");
}

var importResults = function() {
	$("#fileSelect").trigger('click');
}

var parseText = function(evnt) {
    results.parse(reader.result);
    showResultSet();
};

reader.onload = parseText;
$("#fileSelect")[0].addEventListener("change", fileSelectChange, false);
