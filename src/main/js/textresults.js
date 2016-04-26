var results = new ResultList();
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
    showResultSet();
}

function showResultSet() {
    $("#results").empty();
    var query = results.getQuery();
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
    return $.ajax({
        url: URL,
        headers: {'Accept': 'application/vnd.github.v3.text-match+json'},
        complete: function(xhr) {
            processData(xhr.responseJSON);
        }
    });
}

function getResults() {
    var query = new Query().setRepo($('#repo').val()).setQuery($('#query').val());
    results.setQuery(query);
    var URL = "https://api.github.com/search/code?q=" + query.getQuery() + "+repo:" + query.getRepo();
    getData(URL);

}

function doThings() {
    getResults();
}