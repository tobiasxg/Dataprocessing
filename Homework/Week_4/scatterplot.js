/*Tobias Garritsen, 10779582
The following script creates a scatterplot with four variables.
Two on the axis, one colour and one the size of the dots.
When hovering over the dots with the mouse, the data name (countries) is shown.

Everything is put in a main function as most part is taken from the given link.
*/

function main() {

	var margin = {top: 20, right: 20, bottom: 30, left: 40},
	    width = 960 - margin.left - margin.right,
	    height = 500 - margin.top - margin.bottom;

	var x = d3.scale.linear()
	    .range([0, width]);

	var y = d3.scale.linear()
	    .range([height, 0]);

	var color = d3.scale.category10();

	var xAxis = d3.svg.axis()
	    .scale(x)
	    .orient("bottom");

	var yAxis = d3.svg.axis()
	    .scale(y)
	    .orient("left");

	var svg = d3.select("body").append("svg")
	    .attr("width", width + margin.left + margin.right)
	    .attr("height", height + margin.top + margin.bottom)
	  .append("g")
	    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	var txtSize = 25;

	d3.csv("data3.csv", function(error, data) {
	  if (error) throw error;

	  data.forEach(function(d) {
	    d.Birth = +d.Birth;
	    d.Death = +d.Death;
	  });

	  x.domain(d3.extent(data, function(d) { return d.Birth; })).nice();
	  y.domain(d3.extent(data, function(d) { return d.Death; })).nice();

	  svg.append("g")
	      .attr("class", "x axis")
	      .attr("transform", "translate(0," + height + ")")
	      .call(xAxis)
	    .append("text")
	      .attr("class", "label")
	      .attr("x", width)
	      .attr("y", -6)
	      .style("text-anchor", "end")
	      .text("Birth rate (per 1000 population)");

	  svg.append("g")
	      .attr("class", "y axis")
	      .call(yAxis)
	    .append("text")
	      .attr("class", "label")
	      .attr("transform", "rotate(-90)")
	      .attr("y", 6)
	      .attr("dy", ".71em")
	      .style("text-anchor", "end")
	      .text("Death rate (per 1000 population)")

	  // This part creates the dots with three initial variables
	  svg.selectAll(".dot")
	      .data(data)
	    .enter().append("circle")
	      .attr("class", "dot")
	      .attr("r", function(d) { return Math.sqrt(d.Income/200)*4; })
	      .attr("cx", function(d) { return x(d.Birth); })
	      .attr("cy", function(d) { return y(d.Death); })
	      .style("fill", function(d) { return color(d.Continent); })
	      // When mouse over a dot, display country name and increase dotsize
	      .on("mouseover", function(d) {
		    d3.select(this)
		    .attr("r", function(d) { return Math.sqrt(d.Income/200)*8; });
		    svg.append("text").attr({
		          // This id makes removing the text easier
		          // I used split and join as spaces create id problems
		          id: "id" + d.Country.split(" ").join(''), 
		          x: x(d.Birth)+Math.sqrt(d.Income/3),
		          y: y(d.Death)
		    })
		    .text(d.Country)
                    .attr("font-size", txtSize);
		    svg.append("text").attr({
		          // This id makes removing the text easier
		          // I used split and join as spaces create id problems
		          id: "id2" + d.Country.split(" ").join(''), 
		          x: x(d.Birth)+Math.sqrt(d.Income/3),
		          y: y(d.Death)+txtSize
		    })
		    .text("$" + d.Income)
                    .attr("font-size", txtSize);})
	      // When mouse not over dot, remove country name and restore dotsize
	      .on("mouseout", function(d) {
		    d3.select(this)
		    .attr("r", function(d) { return Math.sqrt(d.Income/200)*4; });
		    d3.select("#id" + d.Country.split(" ").join('')).remove();
		    d3.select("#id2" + d.Country.split(" ").join('')).remove();
	      });

	  var legend = svg.selectAll(".legend")
	      .data(color.domain())
	    .enter().append("g")
	      .attr("class", "legend")
	      .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

	  legend.append("rect")
	      .attr("x", width - 18)
	      .attr("width", 18)
	      .attr("height", 18)
	      .style("fill", color);

	  legend.append("text")
	      .attr("x", width - 24)
	      .attr("y", 9)
	      .attr("dy", ".35em")
	      .style("text-anchor", "end")
	      .text(function(d) { return d; });

	});
}
