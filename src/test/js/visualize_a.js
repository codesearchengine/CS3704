
function visualize(results, le)
{
  findMax(results, le);
  clearCanvas();
  $("#V").fadeOut(1);
  $("#V").fadeIn(1500);
  barCharts(results, le);
  piCharts(results);
}


function findMax(arr, le)
{
  var max;
  max = -1;
  for (i = 0; i < le; i++)
  {
    if (arr[i][1] > max)
    {
      max = arr[i][1];
    }
  }
  return max;
}

function clearCanvas()
{
  //Remove : do for as many times you generate charts
  //  rectCanvas = ""; //to prevent old rectangles from living...search script then head
  d3.select("svg").remove(); //clear the canvas so we don't keep appending stuff
  d3.select("svg").remove(); //clear the canvas so we don't keep appending stuff

  console.log(d3.select("svg").length);
  if (d3.select("svg").length> 0) return true;
  else return false;
}



function barCharts(results, le)
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
  rectCanvasHeight = le*(rectHeight + yPosScale);
  // console.log('in bar' + le);
  var max = findMax(results, le);
  rectCanvasWidth = max*rectWidthScale + max * rectWidthScale * .5;

  //adding SVG shapes, 1) make canvas 2) add shape
  var rectCanvas = d3.select("visualization")
  .append("svg")
  .attr("width", rectCanvasWidth) //note these are css elements, use attr for SVG CANVAS
  .attr("height", rectCanvasHeight)
  .attr("align","center");

  //bar chat!!!!!!

  var bars = "";
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
  .attr("transform", "translate(0, 50)");

//  alert(bars.data.length);
  if (bars.data.length > 0)
  {
    return true;
  }
  else
  {
    return false;
  }
  //i = index of element, so now each bar will start below one another
  //  .attr("y", function(d, i) {return i*100;}; //i = index of element}
}

//Pie Charts
function piCharts(results, le)
{
  var max = findMax(results, le);
  var data = new Array(le); //need to be this size for for loop below

  for (i = 0; i < le; i++)
  {
    // console.log(results[i][1])
    data[i] = results[i][1];
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


  if (arcs.data.length > 0)
  {
    return true;
  }
  else
  {
    return false;
  }
}
