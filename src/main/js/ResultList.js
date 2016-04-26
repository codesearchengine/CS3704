var ResultList = function() {
    this.results = [];
    this.query = undefined;
}

ResultList.prototype.clear = function() {
    this.results = [];
}

ResultList.prototype.add = function(result) {
    if(result instanceof Result) {
        this.results.push(result);
        return this;
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

ResultList.prototype.getQuery = function() {
    return this.query;
}

ResultList.prototype.setQuery = function(query) {
    this.query = query;
}

ResultList.prototype.getResults = function() {
    return this.results;
}

ResultList.prototype.setResults = function(results) {
    this.results = results;
}

ResultList.prototype.parse = function(json) {
    this.results = [];
    try {
        var temp = JSON.parse(json);
        for(item of temp.results) {
            this.results.push(new Result().setResultType(item.resultType).setMatchPosition(item.matchPosition).setTextValue(item.textValue).setUrlString(item.urlString));
        }
        this.query = new Query().setQuery(temp.query.query).setRepo(temp.query.repo);
    }
    catch (SyntaxError) {
        alert("File could not be parsed as a valid result set.");
    }
}
