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
	var margin = {top: 20, right: 180, bottom: 50, left: 50},
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

	// empty lists to be filled, useful for finding data later
	var TG_list = [];
	var TN_list = [];
	var TX_list = [];
	var day_list = [];
	var d_i = 0;

	// format the data and lists
	data.forEach(function(d) {
		ymd = d.YYYYMMDD
		year = ymd.substring(0,4);
		month = ymd.substring(4,6);
		day = ymd.substring(6,8);
		d.YYYYMMDD = new Date(year, month-1, day);
		d.TG = +d.TG;
		d.TN = +d.TN;
		d.TX = +d.TX;
		TG_list[d_i] = d.TG;
		TN_list[d_i] = d.TN;
		TX_list[d_i] = d.TX;
		day_list[d_i] = d.YYYYMMDD;
		d_i++;
	});

	// sort years ascending
	data.sort(function(a, b){
		return a["YYYYMMDD"]-b["YYYYMMDD"];
	})

	// scale the range of the data
	x.domain(d3.extent(data, function(d) { return d.YYYYMMDD; }));

	// minimal and maximal values for y with extra space for a prettier outlook using floor and ceil
	minimal_y = d3.min(data, function(d) { return Math.min(d.TG, d.TN, d.TX); }); 
	maximal_y = d3.max(data, function(d) { return Math.max(d.TG, d.TN, d.TX); });
	y.domain([Math.floor(minimal_y/100)*100, Math.ceil(maximal_y/100)*100]);

	// add the three different variables
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
		.text(station+ " Temperature per day 2015");

	// add the x-axis
	svg.append("g")
		.attr("transform", "translate(0," + height + ")")
		.call(d3.axisBottom(x));

	// add x-axis label
	svg.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0," + height + ")")
	      .append("text")
		.attr("class", "label")
		.attr("x", width)
		.attr("y", 40)
		.style("text-anchor", "end")
		.text("Time");

	// add the y-axis
	svg.append("g")
		.call(d3.axisLeft(y));

	// add y-axis label
	svg.append("g")
	      .attr("class", "y axis")
	    .append("text")
	      .attr("class", "label")
	      .attr("transform", "rotate(-90)")
	      .attr("y", -50)
	      .attr("dy", ".71em")
	      .style("text-anchor", "end")
	      .text("Temperature (in 0.1 graden Celsius)")

	// create extra field for the crosshair
	var crosshair_svg = svg.append("rect")
		.attr("x", 0)
		.attr("y", 0)
		.attr("width", width)
		.attr("height", height)
		.attr("opacity", 0);

	// add horizontal crosshair line
	var horizontal_line = svg.append("line")
		.attr("opacity", 0)
		.attr("x1", 0)
		.attr("x2", width)
		.attr("stroke", "black")
		.attr("stroke-width", 1)
		.attr("pointer-events", "none");

	// add vertical crosshair line
	var vertical_line = svg.append("line")
		.attr("opacity", 0)
		.attr("y1", 0)
		.attr("y2", height)
		.attr("stroke", "black")
		.attr("stroke-width", 1)
		.attr("pointer-events", "none");

	// works similar to the vertical/horizontal lines but with text
	var day_text = svg.append("text")
		.attr("opacity", 0)
		.attr("stroke", "black")
		.attr("stroke-width", 1);
	var max_text = svg.append("text")
		.attr("opacity", 0)
		.attr("stroke", "red")
		.attr("stroke-width", 1);
	var avg_text = svg.append("text")
		.attr("opacity", 0)
		.attr("stroke", "green")
		.attr("stroke-width", 1);
	var min_text = svg.append("text")
		.attr("opacity", 0)
		.attr("stroke", "blue")
		.attr("stroke-width", 1);


	// create mousemovement on crosshair svg
	crosshair_svg.data(data)
		.on("mousemove", function(data,i){
			mouse = d3.mouse(this);
			mousex = mouse[0];
			mousey = mouse[1];
			index_calc = Math.round(mousex/(width/d_i))
			processed_day = day_list[index_calc].toString().split(" 00:00:00")[0]
			day_text.attr("x",mousex).attr("y",mousey+20).attr("opacity", 1).text(processed_day)
			max_text.attr("x",mousex).attr("y",mousey+40).attr("opacity", 1).text(TX_list[index_calc])
			avg_text.attr("x",mousex).attr("y",mousey+60).attr("opacity", 1).text(TG_list[index_calc])
			min_text.attr("x",mousex).attr("y",mousey+80).attr("opacity", 1).text(TN_list[index_calc])
			vertical_line.attr("x1", mousex).attr("x2", mousex).attr("opacity", 1);
			horizontal_line.attr("y1", mousey).attr("y2", mousey).attr("opacity", 1)
		})
		.on("mouseout", function(){
			day_text.attr("opacity", 0);
			max_text.attr("opacity", 0);
			avg_text.attr("opacity", 0);
			min_text.attr("opacity", 0);
			vertical_line.attr("opacity", 0);
			horizontal_line.attr("opacity", 0);
		});

	// add the Legend
	for (i = 0; i < 3; i++) { 
		svg.append("text")
			.attr("x", width*0.85)
			.attr("y", 20*i)
			.attr("class", "legend")
			.style("fill", legend_color[i])
			.text(legend_title[i]);
	}
	}
	// get the data
	d3.json("KNMI_lely_bilt.json", function(error, data) {
		if (error) throw error;
		// Get right value from the dropdown menu
		var e = document.getElementById("location");
		var location = e.options[e.selectedIndex].text;
		draw(data, location);
	});
}

// Set the location_title to the chosen item from the menu
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
