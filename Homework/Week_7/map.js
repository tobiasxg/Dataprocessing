/*Tobias Garritsen, 10779582

*/

window.onload = function create_map() {

var width = 700,
        height = 550;

    var colour = d3.scale.category20();

    var projection = d3.geo.mercator()
        .scale(1)
        .translate([0, 0]);

    var path = d3.geo.path()
        .projection(projection);

    var svg = d3.select("body").append("svg")
        .attr("width", width)
        .attr("height", height);

    d3.json("nld.json", function(error, nld) {

        var l = topojson.feature(nld, nld.objects.subunits).features[3],
            b = path.bounds(l),
            s = .2 / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height),
            t = [(width - s * (b[1][0] + b[0][0])) / 2, (height - s * (b[1][1] + b[0][1])) / 2];

        projection
            .scale(s)
            .translate(t);

        svg.selectAll("path")
            .data(topojson.feature(nld, nld.objects.subunits).features).enter()
            .append("path")
            .attr("d", path)
            .attr("fill", function(d, i) {
		return "grey"
                //return colour(i);
            })
            .attr("class", function(d, i) {
//		console.log(d.properties.name)
                return d.properties.name;
            })
	    .on("click", function(d,i) {
		svg.selectAll("path").style("fill", "grey")
		allGraphs = document.querySelectorAll("svg");
		if(allGraphs.length > 1) {
			allGraphs[1].remove();
		}
		create_graph(d.properties.name)
		d3.select(this)
		.attr("opacity", 0.5 )})
	    .on("mousemove", function(d,i) {
		console.log(d.properties.name)
		d3.select(this)
		.attr("opacity", 0.5); })
	    .on("mouseout", function(d,i) {
		d3.select(this)
		.attr("opacity", 1)
	    });
    });
}



function create_graph(province){
var margin = {top: 20, right: 20, bottom: 200, left: 100},
    width = 800 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;


// set the ranges
var x = d3.scale.ordinal().rangeRoundBands([0, width], .05);

var y = d3.scale.linear().range([height, 0]);

// define the axis
var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom")


var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    .ticks(10);


// add the SVG element
var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", 
          "translate(" + margin.left + "," + margin.top + ")");


// load the data
d3.json("provincie_stemmen_2017(2).json", function(error, data) {
    data = data[province]
    max_votes = 0;
    data.forEach(function(d) {
        d.Partij = d.Partij;
        d.Stemmen = +d.Stemmen;
	if(d.Stemmen > max_votes) {
		max_votes = d.Stemmen;
		winner = d.Partij;
	}
    });

console.log(winner)
	
  // scale the range of the data
  x.domain(data.map(function(d) { return d.Partij; }));
  y.domain([0, d3.max(data, function(d) { return d.Stemmen; })]);

  // add axis
  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
    .selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", "-.55em")
      .attr("transform", "rotate(-90)" );

  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -100)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Stemmen");

  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("x", width*0.5)
      .attr("dy", ".71em")
      .style("text-anchor", "middle")
      .text(province);

var colour = d3.scale.category20();

  // Add bar chart
  svg.selectAll("bar")
      .data(data)
    .enter().append("rect")
      .attr("class", "bar")
      .attr("x", function(d) { return x(d.Partij); })
      .attr("width", x.rangeBand())
      .attr("y", function(d) { return y(d.Stemmen); })
      .attr("height", function(d) { return height - y(d.Stemmen); })
      .attr("fill", function(d, i) {
	return colour(i);
      })
      .on("mousemove", function(d,i) {
	d3.select(this)
	.attr("opacity", 0.5); })
      .on("mouseout", function(d,i) {
	d3.select(this)
	.attr("opacity", 1)
      });

});

//d3.select("svg").remove()

}
