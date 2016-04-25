var results = new ResultList();
var query = new Query();
var issueCount = 0;
var issueCommentCount = 0;
var fileContentCount = 0;

function processData(data)
{
    results.clear();
    var i = 0;
    var objUrl;
    $.each(data.items, function(i, field){
        $.each(field, function(key, val){
            if(key == "text_matches")
            {
                var fragment;
                var start;
                $.each(val, function(x, y) {
                    $.each(y, function(a, b) {
                        if(a == "object_url") {
                            objUrl = b;
                        }
                        if(a == "object_type") {
                            switch(b) {
                            case "Issue":
                                issueCount++;
                                break;
                            case "IssueComment":
                                issueCommentCount++;
                                break;
                            case "FileContent":
                                fileContentCount++;
                                break;
                            }
                        }
                        if(a == "fragment") {
                            fragment = b;
                        }
                        if(a == "matches") {
                            $.each(b, function(index, object){
                                $.each(object, function(matchKey, matchValue){
                                    if(matchKey == "indices")
                                    {
                                      start = matchValue[0];
                                      results.add(new Result().setResultType("FileContent").setMatchPosition(start).setTextValue(fragment).setUrlString(objUrl));
                                      i++;
                                    }
                                });
                            });
                        }
                    });
                });
            }
        });
    });

    $("#results").empty();
    alert(JSON.stringify(results, null, 2));
    for(i = 0;i<results.results.length;i++) {
        var result = results.get(i);
        var position = result.getMatchPosition();
        var formattedString = result.getTextValue().substring(0, position) + "<b>" + 
            result.getTextValue().substring(position, position + query.getQuery().length) + 
            "</b>" + result.getTextValue().substring(position + query.getQuery().length, result.getTextValue().length);
        formattedString += "<br><br>";
        $("#results").append(formattedString);
    }
}

function getData(URL) {
    $.ajax({
        url: URL,
        headers: {'Accept': 'application/vnd.github.v3.text-match+json'},
        complete: function(xhr) {
            processData(xhr.responseJSON);
        }
    });
}

function getResults() {
    query.setRepo($('#repo').val());
    query.setQuery($('#query').val());
    alert(JSON.stringify(query.getQuery()));
    var URL = "https://api.github.com/search/code?q=" + query.getQuery() + "+repo:" + query.getRepo();
    // for testing: https://api.github.com/search/code?q=signal+repo:torvalds/linux
    // NOTE: this url ^ won't get the text-matches since the header isn't set if you
    // simply access the url via a browser. Must set header via JQuery.
    // console.log(URL);
    getData(URL);
}

function dothings() {
    getResults();
}