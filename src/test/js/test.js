QUnit.module("Objects")

// Ensures that Query objects are created as expected.
QUnit.test("Create Query object.", function(assert) {
  var query = new Query();
  assert.notEqual(query, undefined, "Query is not undefined.");

});

// Ensures that Query objects behave as expected when altered.
QUnit.test("Alter query object..", function(assert) {
  var query = new Query();
  assert.notEqual(query, undefined, "Query is not undefined.");
  var test = query.setRepo("codesearchengine/CS3704");
  assert.equal(query.getRepo(), "codesearchengine/CS3704", "Repo name is what it should be after first set.");
  assert.equal(test, query, "Query returns itself after seting repo.");
  test = query.setQuery("query");
  assert.equal(query.getQuery(), "query", "Query string is what it should be after first set.");
  assert.equal(test, query, "Query returns itself after setting query.");
  query.setRepo("torvalds/linux");
  assert.equal(query.getRepo(), "torvalds/linux", "Repo is what it should be after second set.");
  query.setQuery("signal");
  assert.equal(query.getQuery(), "signal", "Query string is what it should be after second set.");
});

//Ensure that Result objects are created as expected.
QUnit.test("Create Result object", function(assert) {
  var result = undefined;
  result = new Result();
  assert.notEqual(result, undefined, "Result is not null.");
});

// Ensure that Result objects behave as expected when altered.
QUnit.test("Alter Result object.", function(assert) {
  var result = new Result();
  assert.equal(result.getResultType(), undefined, "ResultType begins as undefined.");
  result.setResultType("FileContent");
  assert.equal(result.getResultType(), "FileContent", "resultType is set as expected.");
  assert.equal(result.getTextValue(), undefined, "textValue begins as undefined.")
  assert.equal(result.getMatchPosition(), undefined, "matchPosition begins as undefined.");
  assert.throws(function() {
      result.setTextValue("This is some text.")
    },
    "Trying to set text value before setting match position throws an error.");
  result.setMatchPosition(13);
  assert.equal(result.getMatchPosition(), 13, "matchPosition is set as expected.");
  result.setTextValue("This is some text.");
  assert.equal(result.getTextValue(), "This is some text.", "textValue is set as expected.");
  result.setUrlString("https://github.com");
  assert.equal(result.getUrlString(), "https://github.com", "urlString is set as expected.");
});

// Ensures that ResultList objects are created properly.
QUnit.test("Create ResultList object.", function(assert) {
  var list = undefined;
  list = new ResultList();
  assert.notEqual(list, undefined, "ResultList is not null.");
});

// Ensures that ResultList objects behave as expected when altered.
QUnit.test("Add to and alter ResultList object.", function(assert) {
  var list = new ResultList();
  var query = new Query().setRepo("codesearchengine/CS3704").setQuery("query");
  var temp = list.setQuery(query);
  assert.equal(temp, undefined, "Return nothing when adding query to ResultList.");
  assert.equal(list.getQuery(), query, "The query is added correctly.");
  var res = new Result().setResultType("FileContent").setMatchPosition(13).setTextValue("012345678911 query string").setUrlString("Https://guthub.com");
  assert.notEqual(res, undefined, "Result is not undefined.");
  list.add(res);
  assert.equal(list.results.length, 1, "Result properly added to list.");
  var resFind1 = list.find("type", "FileContent");
  assert.equal(resFind1.length, 1, "Search returns one of one results.");
  list.add(new Result().setResultType("Issue").setMatchPosition(13).setTextValue("012345678911 query string").setUrlString("Https://guthub.com"));
  var resFind2 = list.find("type", "FileContent");
  assert.equal(resFind2.length, 1, "Search returns one of two results.");
  assert.deepEqual(resFind1[0], res, "Result returned is the correct one.");
});

// Sets up Mockjax before the AJAX module begins; this will let tests run even without internet connectivity.
QUnit.moduleStart(function(details) {
  if(details.name === "AJAX") {
    $.mockjax({
      url: "https://api.github.com/search/code?q=signal+repo:torvalds/linux",
      status: "success",
      responseTime: 20,
      contentType: "text/json",
      responseText: {
        items: [
        {
          text_matches: [
          {
            object_url: "https://api.github.com/repositories/2325298/contents/arch/microblaze/include/uapi/asm/signal.h?ref=9256d5a308c95a50c6e85d682492ae1f86a70f9b",
            object_type: "FileContent",
            fragment: "#include <asm-generic/signal.h>\n",
            matches: [
              { 
                text: "signal",
                indices: [
                  22,
                  28
                ]
              }
            ]
          }
        ]
      }
      ]
    }
    });
    $.mockjax({
      url: "https://api.github.com/search/code?q=+repo:",
      status: "success",
      responseTime: 20,
      contentType: "text/json",
      responseText: {
        message: "Validation Failed",
        errors: [
          {
            message: "Must include at least one user, organization, or repository",
            resource: "Search",
            field: "q",
            code: "invalid"
          }
        ],
        documentation_url: "https://developer.github.com/v3/search/#search-code"
      }
    });
  }
});

// Define setup and teardown methods for the AJAX module of tests.
QUnit.module("AJAX", {
  beforeEach: function(assert) {
    results = new ResultList();
  },
  afterEach: function(assert) {
    $(document).unbind('ajaxComplete')
  }
});

// Ensures that AJAX calls go where they should, and return results.
QUnit.test("Test getData", function(assert){
  var done1 = assert.async();
  $(document).ajaxComplete(function() {
    assert.equal(fileContentCount, 1);
    done1();
  });
  results.setQuery(new Query().setQuery("signal").setRepo("torvalds/linux"));
  getData("https://api.github.com/search/code?q=signal+repo:torvalds/linux");
});

// Ensures that results are properly added to ResultList object.
QUnit.test("Test resultsReturned", function(assert){
  var done2 = assert.async();
  $(document).ajaxComplete(function() {
    assert.equal(results.getResults().length, 1, "Added results to the ResultList object.");
    done2();
  });
  results.setQuery(new Query().setQuery("signal").setRepo("torvalds/linux"));
  getData("https://api.github.com/search/code?q=signal+repo:torvalds/linux");
});

// Ensures we have no results if no parameters are set.
QUnit.test("test noSearchParameters", function(assert){
  var done3 = assert.async();
  $(document).ajaxComplete(function() {
    assert.equal(results.getResults().length, 0, "No results from null query.");
    done3();
  });
  $("#repo").val("");
  $("#query").val("");
  getResults();
  
});

// Ensures submitting the form doesn't change the page.
QUnit.test("test noRedirect", function(assert){
  results.setQuery(new Query().setQuery("signal").setRepo("torvalds/linux"));
  var urlBefore = window.location.href;
  doThings();
  var urlAfter = window.location.href;
  var done4 = assert.async();
  $(document).ajaxComplete(function() {
    assert.equal(urlBefore, urlAfter, "URL does not change.");
    done4();
  });
});