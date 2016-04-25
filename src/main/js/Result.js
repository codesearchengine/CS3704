var Result = function() {
	this.resultType == undefined;
	this.textValue = undefined;
	this.matchPosition = undefined;
	this.urlString = undefined;
}

Result.prototype.getResultType = function() {
	return this.resultType;
}

Result.prototype.setResultType = function(type) {
	this.resultType = type;
	return this;
}

Result.prototype.getTextValue = function() {
	return this.textValue;
}

Result.prototype.setTextValue = function(text) {
	if(this.matchPosition === undefined) {
		throw "Must set match position before setting text value.";
	}
	var tempPos = text.substring(0, this.getMatchPosition());
	this.matchPosition += 3 * (tempPos.split(/<|>/).length - 1);
	this.textValue = text.split("<").join("&lt;").split(">").join("&gt;");
	return this;
}

Result.prototype.getMatchPosition = function() {
	return this.matchPosition;
}

Result.prototype.setMatchPosition = function(position) {
	this.matchPosition = position;
	return this;
}

Result.prototype.getUrlString = function() {
	return this.urlString;
}

Result.prototype.setUrlString = function(url) {
	this.urlString = url;
	return this;
}

Result.prototype.matches = function(param, value) {
	if(param === "type" && this.resultType === value) {
		return true;
	}
	if(param === "text" == this.textValue === value) {
		return true;
	}
	if(param === "position" && this.matchPosition === value) {
		return true;
	}
	if(param === "url" && this.urlString === value) {
		return true;
	}
	return false;
}