test("Query object success.", function() {
  var query = new Query();
  ok(query != undefined);
  var test = query.setRepo("codesearchengine/CS3704");
  ok(query.getRepo() === "codesearchengine/CS3704");
  ok(test == query);
  test = query.setQuery("query");
  ok(query.getQuery() == "query");
  ok(test == query);
});

test("Query object fail.", function() {
  var query = new Query();
  ok(query != undefined);
  var test = query.setRepo("codesearchengine/CS3704");
  ok(query.getRepo() === "codesearchengine/CS3704");
  notOk(test == undefined);
  test = query.setQuery("query");
  ok(query.getQuery() == "query");
  notOk(test == undefined);
});

test("Create ResultList object.", function() {
  var list = undefined;
  list = new ResultList();
  ok(list !== undefined);
});

test("Add query to result list.", function() {
  var list = new ResultList();
  var query = new Query().setRepo("codesearchengine/CS3704").setQuery("query");
  var temp = list.setQuery(query);
  ok(temp === undefined);
  ok(list.getQuery() === query);
});

// Ensures we have no results if no parameters are set.
test("test noSearchParameters", function(){
  results.setQuery(undefined);
  getResults();
  ok(results.results.length == 0);
});

// Ensures submitting the form doesn't change the page.
test("test noRedirect", function(){
  var urlBefore = window.location.href;
  doThings();
  var urlAfter = window.location.href;
  ok(urlBefore === urlAfter);
});