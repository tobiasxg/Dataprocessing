/*Tobias Garritsen, 10779582
The following script creates a graph with three variables.
A crosshair is shown over the graph when hovering with the mouse over it.
A dropdown menu is added and this is used for other datapoints.


https://stackoverflow.com/questions/1085801/get-selected-value-in-dropdown-list-using-javascript
https://jsfiddle.net/xrf1ro1a/
https://bl.ocks.org/basilesimon/29efb0e0a43dde81985c20d9a862e34e
*/

window.onload = set_dropdown();

function create_graph() {
	// set the dimensions and margins of the graph
	var margin = {top: 20, right: 20, bottom: 50, left: 50},
		width = 960 - margin.left - margin.right,
		height = 500 - margin.top - margin.bottom;

	// parse the date / time
	var parseTime = d3.timeParse("%Y");

	// set the ranges
	var x = d3.scaleTime().range([0, width]);
	var y = d3.scaleLinear().range([height, 0]);

	// define the line
	var average_line = d3.line()
		.x(function(d) { return x(d.YYYYMMDD); })
		.y(function(d) { return y(d.TG); });

	// define the line
	var minimum_line = d3.line()
		.x(function(d) { return x(d.YYYYMMDD); })
		.y(function(d) { return y(d.TN); });

	// define the line
	var maximum_line = d3.line()
		.x(function(d) { return x(d.YYYYMMDD); })
		.y(function(d) { return y(d.TX); });

	// append the svg obgect to the body of the page
	// appends a 'group' element to 'svg'
	// moves the 'group' element to the top left margin
	var svg = d3.select("body").append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.append("g")
		.attr("transform","translate(" + margin.left + "," + margin.top + ")");

	function draw(data, station) {

	var data = data[station];

	var legend_title = ["Max temperature", "Avg temperature", "Min temperature"]
	var legend_color = ["red", "green", "blue"]

	// format the data
	data.forEach(function(d) {
		ymd = d.YYYYMMDD
		year = ymd.substring(0,4);
		month = ymd.substring(4,6);
		day = ymd.substring(6,8);
		d.YYYYMMDD = new Date(year, month-1, day);
		d.TG = +d.TG;
		d.TN = +d.TN;
		d.TX = +d.TX;
	});

	// sort years ascending
	data.sort(function(a, b){
		return a["YYYYMMDD"]-b["YYYYMMDD"];
	})

	// Scale the range of the data
	x.domain(d3.extent(data, function(d) { return d.YYYYMMDD; }));

	// Minimal and maximal values for y with extra space for a prettier outlook using floor and ceil
	minimal_y = d3.min(data, function(d) { return Math.min(d.TG, d.TN, d.TX); }); 
	maximal_y = d3.max(data, function(d) { return Math.max(d.TG, d.TN, d.TX); });
	y.domain([Math.floor(minimal_y/100)*100, Math.ceil(maximal_y/100)*100]);

	// Add the three different variables
	svg.append("path")
		.data([data])
		.attr("class", "line")
		.attr("d", average_line)
		.attr('stroke', "green");
	svg.append("path")
		.data([data])
		.attr("class", "line")
		.attr("d", minimum_line)
		.attr('stroke', "blue");
	svg.append("path")
		.data([data])
		.attr("class", "line")
		.attr("d", maximum_line)
		.attr('stroke', "red");

	svg.append("g")
	      .attr("class", "title")
	      .append("text")
		.attr("class", "label")
		.attr("x", width/2)
		.attr("y", 0)
                .attr("font-size", 25)
		.style("text-anchor", "middle")
		.text("Temperature per day 2015");

	// Add the x-axis
	svg.append("g")
		.attr("transform", "translate(0," + height + ")")
		.call(d3.axisBottom(x));

	// Add x-axis label
	svg.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0," + height + ")")
	      .append("text")
		.attr("class", "label")
		.attr("x", width)
		.attr("y", 40)
		.style("text-anchor", "end")
		.text("Time");

	// Add the y-axis
	svg.append("g")
		.call(d3.axisLeft(y));

	// Add y-axis label
	svg.append("g")
	      .attr("class", "y axis")
	    .append("text")
	      .attr("class", "label")
	      .attr("transform", "rotate(-90)")
	      .attr("y", -50)
	      .attr("dy", ".71em")
	      .style("text-anchor", "end")
	      .text("Temperature (in 0.1 degree Celsius)")

	// Create extra field for the crosshair
	var crosshair_svg = svg.append("rect")
		.attr("x", 0)
		.attr("y", 0)
		.attr("width", width)
		.attr("height", height)
		.attr("opacity", 0);

	// Add horizontal crosshair line
	var horizontal_line = svg.append("line")
		.attr("opacity", 0)
		.attr("x1", 0)
		.attr("x2", width)
		.attr("stroke", "black")
		.attr("stroke-width", 1)
		.attr("pointer-events", "none");

	// Add vertical crosshair line
	var vertical_line = svg.append("line")
		.attr("opacity", 0)
		.attr("y1", 0)
		.attr("y2", height)
		.attr("stroke", "black")
		.attr("stroke-width", 1)
		.attr("pointer-events", "none");

	// Create mousemovement on crosshair svg
	// It won't accept .append("text") (in any form)
	crosshair_svg.on("mousemove", function(){
		mouse = d3.mouse(this);
		mousex = mouse[0];
		mousey = mouse[1];
		vertical_line.attr("x1", mousex).attr("x2", mousex).attr("opacity", 1);
		horizontal_line.attr("y1", mousey).attr("y2", mousey).attr("opacity", 1)
		})
		.on("mouseout", function(){  
			vertical_line.attr("opacity", 0);
			horizontal_line.attr("opacity", 0);
		});

	// Add the Legend
	for (i = 0; i < 3; i++) { 
		svg.append("text")
			.attr("x", width*0.85)
			.attr("y", 20*i)
			.attr("class", "legend")
			.style("fill", legend_color[i])
			.text(legend_title[i]);
	}
	}
	// Get the data
	d3.json("KNMI_lely_bilt.json", function(error, data) {
		if (error) throw error;
		// Get right value from the dropdown menu
		var e = document.getElementById("location");
		var location = e.options[e.selectedIndex].text;
		draw(data, location);
	});
}

function get_menu_value() {
	var e = document.getElementById("location");
	var location = e.options[e.selectedIndex].text;
	document.getElementById("location_title").innerHTML=location+" temperatures";
	d3.select("svg").remove();
	create_graph();
}

// First time getting data to store keys in dropdown menu
function set_dropdown(){
	d3.json("KNMI_lely_bilt.json", function(error, data) {
		if (error) throw error;

		var select = document.getElementById("location");
		for(var k in data){
			var option = document.createElement('option');
			option.text = option.value = k;
			select.add(option, 0);
		}
	})
	create_graph();
}
