var Query = function() {
	this.repo = undefined;
	this.query = undefined;
}

Query.prototype.getRepo = function() {
	return this.repo;
}

Query.prototype.setRepo = function(repo) {
	this.repo = repo;
	return this;
}

Query.prototype.getQuery = function() {
	return this.query
}

Query.prototype.setQuery = function(query) {
	this.query = query;
	return this;	
}