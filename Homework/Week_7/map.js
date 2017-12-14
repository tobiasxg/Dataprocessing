/*Tobias Garritsen, 10779582

*/

window.onload = main()

function main(){
	d3.select("svg").remove();
	d3.select("svg").remove();
	queue()
		.defer(d3.json, 'nld.json')
		.defer(d3.json, 'ned_verkiezingen_2017.json')
		.await(set_dropdown);
}

function change_map(){
	d3.select("svg").remove();
	d3.select("svg").remove();
	queue()
		.defer(d3.json, 'nld.json')
		.defer(d3.json, 'ned_verkiezingen_2017.json')
		.await(get_dropdown);
}

function create_map(nld, data, political_party) {
	var width = 700,
	height = 550;

	d3.selection.prototype.moveToFront = function() {  
		return this.each(function(){
			this.parentNode.appendChild(this);
		});
	};


	d3.selection.prototype.moveToBack = function() {  
		return this.each(function() { 
			var firstChild = this.parentNode.firstChild; 
			if (firstChild) { 
				this.parentNode.insertBefore(this, firstChild); 
			} 
		});
	};

	//scales = ['#7f3b08', '#b35806', '#e08214', '#fdb863', '#fee0b6', '#f7f7f7', '#d8daeb', '#b2abd2', '#8073ac', '#542788', '#2d004b'];
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

	var province = svg.append("text")
		.attr("opacity", 0)
		.attr("x", width*0.3)
		.attr("y",20)
		.attr("stroke-width", 1);


	var provinceRect = svg.append("rect")
	      .attr("width", 80)
	      .attr("height", 30)
	      .attr("opacity", 0)
	      .attr("offset",[-10,0])
	      .style("border-radius", "2px")
	      .style("fill", "black");


	projection
		.scale(s)
		.translate(t);

	svg.selectAll("path")
		.data(topojson.feature(nld, nld.objects.subunits).features).enter()
		.append("path")
		.attr("d", path)
		.attr("stroke", "black")
		.attr("stroke-width", 1)
		.attr("fill", function(d, i) {
			dataProv = data[d.properties.name]
			tempMax = 0;
			for(key in dataProv){
				if (dataProv[key].Partij == political_party) {
					return colour(dataProv[key].Stemmen)
				}
			}
		})
		.attr("class", function(d, i) {
			return d.properties.name;
		})
		.on("click", function(d,i) {
			allGraphs = document.querySelectorAll("svg");
			if(allGraphs.length > 1) {
				allGraphs[1].remove();
			}
			create_graph(d.properties.name, data)
			d3.select(this)
			.attr("opacity", 0.5)})
			.on("mousemove", function(d,i) {
				//console.log(d.properties.name)
				mouse = d3.mouse(this);
				mousex = mouse[0];
				mousey = mouse[1];
						//console.log(d.geometry.coordinates[0][0][0])
						//console.log(d3.select(this)[0][0])
						//console.log(d3.select(this).attr("d"))//.split(","))
						//for(point in d3.select(this).attr("d").split(",")){
						//	console.log(d3.select(this).attr("d").split(",")[point])
						//}
						//var t = document.createTextNode("This is a paragraph.");      // Create a text node
						//d3.select(this).appendChild(t);
						console.log(d3.select(this))
				provinceRect.attr("x", 251).attr("y",162).attr("opacity", 1).moveToFront()
				province.attr("opacity", 1).text(d.properties.name)
				d3.select(this)
				.attr("opacity", 0.5); })
			.on("mouseout", function(d,i) {
				province.attr("opacity", 0)
				provinceRect.attr("opacity", 0).moveToBack()
				d3.select(this)
				.attr("opacity", 1)
		});

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

function create_graph(province, data){

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
	var svg = d3.select("body").select("#chart").append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

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
}

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
function set_dropdown(error, nld,  data){
	var select = document.getElementById("party");
		for(var k in data.Nederland){
		var option = document.createElement('option');
		option.text = option.value = data.Nederland[k].Partij;
		select.add(option, 0);
	}

	var e = document.getElementById("party");
	var party = e.options[e.selectedIndex].text;

	create_map(nld, data, party);
	create_graph("Nederland", data);
	//get_data();
}

// First time getting data to store keys in dropdown menu
function get_dropdown(error, nld,  data){
	
	var e = document.getElementById("party");
	var party = e.options[e.selectedIndex].text;

	create_map(nld, data, party);
	create_graph("Nederland", data);
}

function get_data(){
	d3.select("svg").remove();
	d3.select("svg").remove();
	queue()
		.defer(d3.json, 'nld.json')
		.defer(d3.json, 'ned_verkiezingen_2017.json')
		.await(set_dropdown);
}

function visualize_data(){
	if (error) {
		alert(error);
		throw error;
	}

	var e = document.getElementById("party");
	var party = e.options[e.selectedIndex].text;

	create_map(nld, data, party);
	create_graph("Nederland", data);
}
