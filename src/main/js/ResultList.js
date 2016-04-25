var ResultList = function() {
    this.results = [];
}

ResultList.prototype.clear = function() {
    this.results = [];
}

ResultList.prototype.add = function(result) {
    if(result instanceof Result) {
        this.results.push(result);
    }
    else {
        throw "Can only add Result objects.";
    }
}

// Finds a result based on some criteria. I don't know how exactly result items will be built, so...
ResultList.prototype.find = function(param, value) {
    resultList = [];
    this.results.forEach(function (element, index, array) {
        if(element.matches(param, value)) {
            resultList.push(element);
        }
    });
    return resultList;
}

ResultList.prototype.get = function(index) {
    return this.results[index];
}

ResultList.prototype.parse = function(json) {
    try {
        this.results = JSON.parse(json);
    }
    catch (SyntaxError) {
        alert("File could not be parsed as a valid result set.");
    }
}
