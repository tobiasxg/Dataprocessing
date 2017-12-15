/*Tobias Garritsen, 10779582
This code creates a bar chart and a map that show data about the dutch elections.
The map and chart are interactive with eachother, by interacting with the map,
the bar gets changed to the corresponding data.
http://bl.ocks.org/phil-pedruco/9344373
*/

window.onload = main();

// This is the main function and it loads the data in with queue.
function main() {
	d3.select("svg").remove();
	d3.select("svg").remove();
	queue()
		.defer(d3.json, 'nld.json')
		.defer(d3.json, 'ned_verkiezingen_2017.json')
		.await(setDropdown);
}

// When the map changes to a different party, this function is called.
// Note that even this function and main are fairly similar, the main
// sets the dropdown menu, while this one takes data from it. 
function changeMap() {
	d3.select("svg").remove();
	d3.select("svg").remove();
	queue()
		.defer(d3.json, 'nld.json')
		.defer(d3.json, 'ned_verkiezingen_2017.json')
		.await(getDropdown);
}

// This function creates the map with the corresponding parties colours.
function createMap(nld, data, politicalParty) {
	var width = 700,
	height = 550;

	// This takes an svg object and pushes it in front of the rest.
	d3.selection.prototype.moveToFront = function() {  
		return this.each(function(){
			this.parentNode.appendChild(this);
		});
	};

	// This takes an svg object and pushes it to the back.
	d3.selection.prototype.moveToBack = function() {  
		return this.each(function() { 
			var firstChild = this.parentNode.firstChild; 
			if (firstChild) { 
				this.parentNode.insertBefore(this, firstChild); 
			} 
		});
	};
	
	// Pretty red colour scale.
	scales = ['#ffffff', '#ffe5e5', '#ffcccc', '#ffb2b2', '#ff9999', '#ff7f7f', '#ff6666', '#ff4c4c', '#ff3232', '#ff1919', '#ff0000', '#e50000', '#cc0000', '#b20000', '#990000', '#7f0000', '#660000', '#4c0000', '#330000', '#190000'];

	var colour = d3.scale.linear()
		.domain(linspace(0, 475000, scales.length))
		.range(scales);

	var projection = d3.geo.mercator()
		.scale(1)
		.translate([0, 0]);

	var path = d3.geo.path()
		.projection(projection);

	var svg = d3.select("body").select("#map").append("svg")
		.attr("width", width)
		.attr("height", height);

	var l = topojson.feature(nld, nld.objects.subunits).features[3],
	b = path.bounds(l),
	s = .2 / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height),
	t = [(width - 1.5 * s * (b[1][0] + b[0][0])) / 2, 20+(height - s * (b[1][1] + b[0][1])) / 2];

	// A black rect for showing data in.
	var provinceRect = svg.append("rect")
	      .attr("width", 150)
	      .attr("height", 60)
	      .attr("opacity", 0)
	      .style("border-radius", "2px")
	      .style("fill", "black");

	var nameText = svg.append("text")
		.attr("dy", ".30em")
		.attr("font-size", 13)
		.attr("opacity", 0)
		.style("fill", "white")
		.style("text-anchor", "start");

	var provinceText = svg.append("text")
		.attr("dy", ".30em")
		.attr("font-size", 11)
		.attr("opacity", 0)
		.style("fill", "white")
		.style("text-anchor", "start");

	var votesText = svg.append("text")
		.attr("dy", ".30em")
		.attr("font-size", 11)
		.attr("opacity", 0)
		.style("fill", "white")
		.style("text-anchor", "start");

	projection
		.scale(s)
		.translate(t);

	svg.selectAll("path")
		.data(topojson.feature(nld, nld.objects.subunits)
		.features).enter()
		.append("path")
		.attr("d", path)
		.attr("stroke", "black")
		.attr("stroke-width", 1)
		.attr("fill", function(d, i) {
			// This loop searches the province corresponding Votes 
			// and party for the colour.
			dataProv = data[d.properties.name];
			for(key in dataProv) {
				if (dataProv[key].Partij == politicalParty) {
					return colour(dataProv[key].Stemmen);
				}
			}
		})
		.attr("class", function(d, i) {
			return d.properties.name;
		})
		.on("click", function(d,i) {
			allGraphs = document.querySelectorAll("svg");
			// Remove the second svg graph, so not the map.
			if(allGraphs.length > 1) {
				allGraphs[1].remove();
			}
			// Create corresponding barchart on click.
			createGraph(d.properties.name, data);
			d3.select(this);
			.attr("opacity", 0.5)})
			.on("mousemove", function(d,i) {
				mouse = d3.mouse(this);
				mousex = mouse[0];
				mousey = mouse[1];
				// This loop searches the province corresponding Votes 
				// to display.
				dataProv = data[d.properties.name];
						for(key in dataProv) {
							if (dataProv[key].Partij == politicalParty) {
								votes = dataProv[key].Stemmen;
							}
						}
				// All the data to be displayed on mousemovement.
				provinceRect.attr("x", mousex+10).attr("y", mousey).attr("opacity", 0.8).moveToFront();
				nameText.attr("x", mousex+20).attr("y", mousey+10).attr("opacity", 1).text(politicalParty).moveToFront();
				provinceText.attr("x", mousex+20).attr("y", mousey+30).attr("opacity", 1).text("Provincie: " + d.properties.name).moveToFront();
				votesText.attr("x", mousex+20).attr("y", mousey+50).attr("opacity", 1).text(votes + " Stemmen").moveToFront();
				d3.select(this);
				.attr("opacity", 0.5); })
			.on("mouseout", function(d,i) {
				// Remove (make invisible) the displayed data. 
				nameText.attr("opacity", 0);
				provinceText.attr("opacity", 0);
				votesText.attr("opacity", 0);
				provinceRect.attr("opacity", 0).moveToBack();
				d3.select(this);
				.attr("opacity", 1)
		});

	// Create the legend with the previously mentioned scales (colours).
	var legend = svg.selectAll(".legend")
		.data(colour.domain())
		.enter().append("g")
		.attr("class", "legend")
		.attr("transform", function(d, i) { return "translate(0," + i * 15 + ")"; });

	legend.append("rect")
		.attr("x", 0)
		.attr("y", 20)
		.attr("width", 13)
		.attr("height", 13)
		.style("fill", colour);

	legend.append("text")
		.attr("x", 15)
		.attr("y", 26)
		.attr("dy", ".30em")
		.attr("font-size", 10)
		.style("text-anchor", "start")
		.text(function(d, i) { return (d/1000).toString()+"-"+(25+d/1000).toString(); });
}

// This function is for creating the barchart.
function createGraph(province, data) {

	var margin = {top: 20, right: 20, bottom: 200, left: 100},
		width = 800 - margin.left - margin.right,
		height = 600 - margin.top - margin.bottom;

	// Set the ranges.
	var x = d3.scale.ordinal().rangeRoundBands([0, width], .05);

	var y = d3.scale.linear().range([height, 0]);

	// Define the axis.
	var xAxis = d3.svg.axis()
		.scale(x)
		.orient("bottom");

	var yAxis = d3.svg.axis()
		.scale(y)
		.orient("left")
		.ticks(10);

	// Add the SVG element.
	var svg = d3.select("body").select("#chart").append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	// Get province data.
	data = data[province]
	data.forEach(function(d) {
		d.Partij = d.Partij;
		d.Stemmen = +d.Stemmen;
	});

	// Scale the range of the data.
	x.domain(data.map(function(d) { return d.Partij; }));
	y.domain([0, d3.max(data, function(d) { return d.Stemmen; })]);

	// Add axis.
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

	// Add barchart.
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
			.attr("opacity", 1);
		});
}

// Used for scaling the colours for the legend.
function linspace(start, end, n) {
	var out = [];
	var delta = (end - start) / (n - 1);

	var i = 0;
	while(i < (n - 1)) {
		out.push(start + (i * delta));
		i++;
	}

	out.push(end);
	return out;
}


// First time getting data to store keys in dropdown menu
function setDropdown(error, nld,  data) {
	var select = document.getElementById("party");
		for(var k in data.Nederland) {
			var option = document.createElement("option");
			option.text = option.value = data.Nederland[k].Partij;
			select.add(option, 0);
		}

	// Get the current selected party from dropdown menu.
	var e = document.getElementById("party");
	var party = e.options[e.selectedIndex].text;

	// Create map and chart.
	createMap(nld, data, party);
	createGraph("Nederland", data);
}

// First time getting data to store keys in dropdown menu
function getDropdown(error, nld,  data) {
	
	var e = document.getElementById("party");
	var party = e.options[e.selectedIndex].text;

	createMap(nld, data, party);
	createGraph("Nederland", data);
}
