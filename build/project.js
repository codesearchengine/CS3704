/* FileSaver.js
 * A saveAs() FileSaver implementation.
 * 1.1.20160328
 *
 * By Eli Grey, http://eligrey.com
 * License: MIT
 *   See https://github.com/eligrey/FileSaver.js/blob/master/LICENSE.md
 */

/*global self */
/*jslint bitwise: true, indent: 4, laxbreak: true, laxcomma: true, smarttabs: true, plusplus: true */

/*! @source http://purl.eligrey.com/github/FileSaver.js/blob/master/FileSaver.js */

var saveAs = saveAs || (function(view) {
	"use strict";
	// IE <10 is explicitly unsupported
	if (typeof navigator !== "undefined" && /MSIE [1-9]\./.test(navigator.userAgent)) {
		return;
	}
	var
		  doc = view.document
		  // only get URL when necessary in case Blob.js hasn't overridden it yet
		, get_URL = function() {
			return view.URL || view.webkitURL || view;
		}
		, save_link = doc.createElementNS("http://www.w3.org/1999/xhtml", "a")
		, can_use_save_link = "download" in save_link
		, click = function(node) {
			var event = new MouseEvent("click");
			node.dispatchEvent(event);
		}
		, is_safari = /Version\/[\d\.]+.*Safari/.test(navigator.userAgent)
		, webkit_req_fs = view.webkitRequestFileSystem
		, req_fs = view.requestFileSystem || webkit_req_fs || view.mozRequestFileSystem
		, throw_outside = function(ex) {
			(view.setImmediate || view.setTimeout)(function() {
				throw ex;
			}, 0);
		}
		, force_saveable_type = "application/octet-stream"
		, fs_min_size = 0
		// the Blob API is fundamentally broken as there is no "downloadfinished" event to subscribe to
		, arbitrary_revoke_timeout = 1000 * 40 // in ms
		, revoke = function(file) {
			var revoker = function() {
				if (typeof file === "string") { // file is an object URL
					get_URL().revokeObjectURL(file);
				} else { // file is a File
					file.remove();
				}
			};
			/* // Take note W3C:
			var
			  uri = typeof file === "string" ? file : file.toURL()
			, revoker = function(evt) {
				// idealy DownloadFinishedEvent.data would be the URL requested
				if (evt.data === uri) {
					if (typeof file === "string") { // file is an object URL
						get_URL().revokeObjectURL(file);
					} else { // file is a File
						file.remove();
					}
				}
			}
			;
			view.addEventListener("downloadfinished", revoker);
			*/
			setTimeout(revoker, arbitrary_revoke_timeout);
		}
		, dispatch = function(filesaver, event_types, event) {
			event_types = [].concat(event_types);
			var i = event_types.length;
			while (i--) {
				var listener = filesaver["on" + event_types[i]];
				if (typeof listener === "function") {
					try {
						listener.call(filesaver, event || filesaver);
					} catch (ex) {
						throw_outside(ex);
					}
				}
			}
		}
		, auto_bom = function(blob) {
			// prepend BOM for UTF-8 XML and text/* types (including HTML)
			if (/^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i.test(blob.type)) {
				return new Blob(["\ufeff", blob], {type: blob.type});
			}
			return blob;
		}
		, FileSaver = function(blob, name, no_auto_bom) {
			if (!no_auto_bom) {
				blob = auto_bom(blob);
			}
			// First try a.download, then web filesystem, then object URLs
			var
				  filesaver = this
				, type = blob.type
				, blob_changed = false
				, object_url
				, target_view
				, dispatch_all = function() {
					dispatch(filesaver, "writestart progress write writeend".split(" "));
				}
				// on any filesys errors revert to saving with object URLs
				, fs_error = function() {
					if (target_view && is_safari && typeof FileReader !== "undefined") {
						// Safari doesn't allow downloading of blob urls
						var reader = new FileReader();
						reader.onloadend = function() {
							var base64Data = reader.result;
							target_view.location.href = "data:attachment/file" + base64Data.slice(base64Data.search(/[,;]/));
							filesaver.readyState = filesaver.DONE;
							dispatch_all();
						};
						reader.readAsDataURL(blob);
						filesaver.readyState = filesaver.INIT;
						return;
					}
					// don't create more object URLs than needed
					if (blob_changed || !object_url) {
						object_url = get_URL().createObjectURL(blob);
					}
					if (target_view) {
						target_view.location.href = object_url;
					} else {
						var new_tab = view.open(object_url, "_blank");
						if (new_tab === undefined && is_safari) {
							//Apple do not allow window.open, see http://bit.ly/1kZffRI
							view.location.href = object_url
						}
					}
					filesaver.readyState = filesaver.DONE;
					dispatch_all();
					revoke(object_url);
				}
				, abortable = function(func) {
					return function() {
						if (filesaver.readyState !== filesaver.DONE) {
							return func.apply(this, arguments);
						}
					};
				}
				, create_if_not_found = {create: true, exclusive: false}
				, slice
			;
			filesaver.readyState = filesaver.INIT;
			if (!name) {
				name = "download";
			}
			if (can_use_save_link) {
				object_url = get_URL().createObjectURL(blob);
				setTimeout(function() {
					save_link.href = object_url;
					save_link.download = name;
					click(save_link);
					dispatch_all();
					revoke(object_url);
					filesaver.readyState = filesaver.DONE;
				});
				return;
			}
			// Object and web filesystem URLs have a problem saving in Google Chrome when
			// viewed in a tab, so I force save with application/octet-stream
			// http://code.google.com/p/chromium/issues/detail?id=91158
			// Update: Google errantly closed 91158, I submitted it again:
			// https://code.google.com/p/chromium/issues/detail?id=389642
			if (view.chrome && type && type !== force_saveable_type) {
				slice = blob.slice || blob.webkitSlice;
				blob = slice.call(blob, 0, blob.size, force_saveable_type);
				blob_changed = true;
			}
			// Since I can't be sure that the guessed media type will trigger a download
			// in WebKit, I append .download to the filename.
			// https://bugs.webkit.org/show_bug.cgi?id=65440
			if (webkit_req_fs && name !== "download") {
				name += ".download";
			}
			if (type === force_saveable_type || webkit_req_fs) {
				target_view = view;
			}
			if (!req_fs) {
				fs_error();
				return;
			}
			fs_min_size += blob.size;
			req_fs(view.TEMPORARY, fs_min_size, abortable(function(fs) {
				fs.root.getDirectory("saved", create_if_not_found, abortable(function(dir) {
					var save = function() {
						dir.getFile(name, create_if_not_found, abortable(function(file) {
							file.createWriter(abortable(function(writer) {
								writer.onwriteend = function(event) {
									target_view.location.href = file.toURL();
									filesaver.readyState = filesaver.DONE;
									dispatch(filesaver, "writeend", event);
									revoke(file);
								};
								writer.onerror = function() {
									var error = writer.error;
									if (error.code !== error.ABORT_ERR) {
										fs_error();
									}
								};
								"writestart progress write abort".split(" ").forEach(function(event) {
									writer["on" + event] = filesaver["on" + event];
								});
								writer.write(blob);
								filesaver.abort = function() {
									writer.abort();
									filesaver.readyState = filesaver.DONE;
								};
								filesaver.readyState = filesaver.WRITING;
							}), fs_error);
						}), fs_error);
					};
					dir.getFile(name, {create: false}, abortable(function(file) {
						// delete file if it already exists
						file.remove();
						save();
					}), abortable(function(ex) {
						if (ex.code === ex.NOT_FOUND_ERR) {
							save();
						} else {
							fs_error();
						}
					}));
				}), fs_error);
			}), fs_error);
		}
		, FS_proto = FileSaver.prototype
		, saveAs = function(blob, name, no_auto_bom) {
			return new FileSaver(blob, name, no_auto_bom);
		}
	;
	// IE 10+ (native saveAs)
	if (typeof navigator !== "undefined" && navigator.msSaveOrOpenBlob) {
		return function(blob, name, no_auto_bom) {
			if (!no_auto_bom) {
				blob = auto_bom(blob);
			}
			return navigator.msSaveOrOpenBlob(blob, name || "download");
		};
	}

	FS_proto.abort = function() {
		var filesaver = this;
		filesaver.readyState = filesaver.DONE;
		dispatch(filesaver, "abort");
	};
	FS_proto.readyState = FS_proto.INIT = 0;
	FS_proto.WRITING = 1;
	FS_proto.DONE = 2;

	FS_proto.error =
	FS_proto.onwritestart =
	FS_proto.onprogress =
	FS_proto.onwrite =
	FS_proto.onabort =
	FS_proto.onerror =
	FS_proto.onwriteend =
		null;

	return saveAs;
}(
	   typeof self !== "undefined" && self
	|| typeof window !== "undefined" && window
	|| this.content
));
// `self` is undefined in Firefox for Android content script context
// while `this` is nsIContentFrameMessageManager
// with an attribute `content` that corresponds to the window

if (typeof module !== "undefined" && module.exports) {
  module.exports.saveAs = saveAs;
} else if ((typeof define !== "undefined" && define !== null) && (define.amd !== null)) {
  define([], function() {
    return saveAs;
  });
}

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
    alert(JSON.stringify(results, null, 2));
    for(i = 0;i<results.results.length;i++) {
        var result = results.get(i);
        var query = results.getQuery();
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
    var query = new Query().setRepo($('#repo').val()).setQuery($('#query').val());
    results.setQuery(query);
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

function visualize()
{
  findMax();
  clearCanvas();
  $("#V").fadeOut(1);
  $("#V").fadeIn(1500);
  barCharts();
  piCharts();
}

var max;
function findMax()
{
  max = -1;
  for (result of results.results)
  {
    if (result.getMatchPosition() > max)
    {
      max = result.getMatchPosition();
    }
  }
}

function clearCanvas()
{
  //Remove : do for as many times you generate charts
  //  rectCanvas = ""; //to prevent old rectangles from living...search script then head
  d3.select("svg").remove(); //clear the canvas so we don't keep appending stuff
  d3.select("svg").remove(); //clear the canvas so we don't keep appending stuff
}



function barCharts()
{
  //alert('in barCharts()!');
  //var dataArray = [20, 40, 50];
  //  var dataArray = [20, 10];
  var rectCanvasHeight; //global so you can output in console
  var rectCanvas;
  var rectWidthScale = 10;
  var rectHeight = 25;
  var yPosScale = 50; //index * yPosScale ...to represent spacing between rects
  var indexNumericalData = 1;


  var dataArray = results;
  //(num results * rectheight + numresults*yPosScale) + overhead
  rectCanvasHeight = results.length*(rectHeight + yPosScale)  ;
  rectCanvasWidth = max*rectWidthScale + max * rectWidthScale * .5;

  //adding SVG shapes, 1) make canvas 2) add shape
  var rectCanvas = d3.select("visualization")
  .append("svg")
  .attr("width", rectCanvasWidth) //note these are css elements, use attr for SVG CANVAS
  .attr("height", rectCanvasHeight)
  .attr("align","center");

  //bar chat!!!!!!

  var bars = rectCanvas.selectAll("rect")
  //bars are rectangles, since there are no rectangles on our page
  //this variable returns an empty selection (array)
  .data(dataArray) //binds our dataArray to an empty selection of rectangles
  .enter() //returns a selection of  placeholders for each data element
  .append("rect") //for each data element we append a rectangle
  .attr("width", function(d){ return d[indexNumericalData]*rectWidthScale;})
  //makes width of EACH rectangle depend on the data in the array
  //in this case each input is the output, so our rects will be of width 20, 40, 50
  .attr("height", rectHeight)
  .attr("x", 10)
  .attr("y", function(d, i) {return i*yPosScale;})
  .text("poo")
  .attr("fill", "red")
  .attr("transform", "translate(0, 50)")
  //i = index of element, so now each bar will start below one another
  //  .attr("y", function(d, i) {return i*100;}; //i = index of element}
}

//Pie Charts
function piCharts()
{
  var data = new Array(results.results.length); //need to be this size for for loop below

  for (i = 0; i < results.results.length; i++)
  {
    // console.log(results[i][1])
    data[i] = results.get(i).getMatchPosition();
  }

  var r = 200;


  //oridinal means the input might not be a continious domain
  var color = d3.scale.ordinal()
  .domain([0, max*2]) //*2 to scale better
  .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

  var canvas = d3.select("visualization").append("svg") //TODO: visualization or body?
  .attr("width", 410)
  .attr("height", 410);

  var group = canvas.append("g")
  .attr("transform", "translate(200, 200)");


  //Donut chart code:
  // var arc = d3.svg.arc() //arc path generator (see tutorial 12)
  // .innerRadius(r-100)
  // .outerRadius(r);

  //Pie chart code:
  var arc = d3.svg.arc() //arc path generator (see tutorial 12)
  .innerRadius(0)
  .outerRadius(r);

  //to invoke pie we do pie()
  var pie = d3.layout.pie()
  .value(function(d){ return d;});

  var arcs = group.selectAll(".arc") //select everything that is of class "arc"
  .data(pie(data)) //bind our data to the selection,
  // but pass it through the pie layout (returns an object with start and end angle)
  .enter() //so we don't need a for loop
  //Returns the enter selection: placeholder nodes for each data element for
  //which no corresponding existing DOM element was found in the current selection
  .append("g") //appends group for each data element
  .attr("class", "arc"); //see notes at 1) for what happens at this point in the console...
  //each data element has had an arc path generated

  arcs.append("path") //appends a path to each data element
  .attr("d", arc)
  //d  being an element in the array
  // will fetch the path data from the arc path generator (inner and outer radius)
  //and the arc generator will also get the start and end angle from .data(pie(data))
  .attr("fill", function(d){ return color(d.data);}); //d.data being the value of the array element
  //d[1].data vs d[1]??? TODO -----------------

  //moving the whole thing to a position:
  arcs.attr("transform", "translate(0, 0)");

  //appending text to each arc
  arcs.append("text")
  .attr("transform", function(d){ return "translate(" + arc.centroid(d) +")";})
  //centroid returns the center of each arc in our data
  .attr("text-anchor", "middle") //centers it better
  .attr("font-size", ".6em")
  .text(function(d){ return d.data;});
}

var reader = new FileReader();

var fileSelectChange = function(evnt) {
    evnt.stopPropagation();
    evnt.preventDefault();
    if(evnt.target.files[0]) {
        reader.readAsText(evnt.target.files[0], "utf-8");
    }
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

var exportResults = function() {
    var blob = new Blob([JSON.stringify(results, null, 2)], {type: "application/json"});
    saveAs(blob, "resultSet.json");
}