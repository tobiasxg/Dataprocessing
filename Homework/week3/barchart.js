/* Tobias Garritsen, 10779582
* These are all functions necessary to load the d3 chart of a json file in the 
* html file for the assignment of the third week.
* This code uses certain keys from the JSON files and these keys should be
* changed when using different JSON files.
* http://bl.ocks.org/phil-pedruco/9032348
* https://www.youtube.com/watch?v=ljeKVFsaYBg
*/

// Main function done all within one, as it is mostly initialising variables
function main(){

	// Margins of the graph
	var margin = {
		top: 20,
		left: 20
	},
		width = 850,
		height = 5310 - margin.top;

	// Margin of the rectangles
	var rectWidth = 35;

	// Values y and x for axis
	var y = d3.scale.ordinal()
		.rangeRoundBands([9, height], .1);
	var x = d3.scale.linear()
		.range([0, width]);

	// Scaler function for x axis
	var xScaling = d3.scale.linear()
		.domain([0,width])
		.range([0,width])

	// The actual x axis variable
	var xAxis = d3.svg.axis()
		.scale(x)
		.orient("top")
		.ticks(10)
		.scale(xScaling);

	// The actual y axis variable
	var yAxis = d3.svg.axis()
		.scale(y)
		.orient("left");

	// The svg in which the chart is drawn
	var svg = d3.select("body").append("svg")
		.attr("width", width + margin.left)
		.attr("height", height + margin.top)
		.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	// Reading in the json file
	d3.json("Original_Pokemon.json", function (data) {
		// Drawing the rectangles on the right place and mouse events
		svg.selectAll("rect")
			.data(data)
			.enter()
				.append("rect")
				.attr("width", function (d) { return d.Total; })
				.attr("height", 30)
				.attr("y", function (d, i) { return i * rectWidth; })
				.attr("fill", "blue")
				.attr("transform", "translate(0,10)")
				.on("mouseover", function() {
					d3.select(this)
					.attr("fill", "red");
				})
				.on("mouseout", function() {
					d3.select(this)
					.attr("fill", "blue");
				})

		// Writing the text in the charts, corresponding to the data
		svg.selectAll("text")
			.data(data)
			.enter()
				.append("text")
				.attr("fill", "white")
				.attr("transform", "translate(0," + rectWidth + ")")
				.attr("y", function (d, i) { return i * rectWidth ; })
				.text(function (d) {return d.Name; })

		// Append the y axis to the chart
		svg.append("g")
			.attr("class", "y axis")
			.call(yAxis);

		// Append the x axis to the chart
		svg.append("g")
			.attr("class", "x axis")
			.attr("transform", "translate(0,15)")
			.call(xAxis)
			.append("text")
			.attr("transform", "translate(0,-20)")
			.text("Total");		
	})
}
