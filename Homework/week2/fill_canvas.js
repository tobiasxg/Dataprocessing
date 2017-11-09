/* Tobias Garritsen, 10779582
* These are all functions necessary to load the graph of temperatures in the 
* html file for the assignment of the second week. This is done with the help
* of canvas.
*/


// This function finds all dates and temperatures with a loop over the data
function myLoop(list) {
	var dates = [];
	var temps = [];

	for (i = 0; i < list.length-1; i++) {
		curr = list[i];
		curr = curr.replace(/\s/g,'');
		curr_s = curr.split(",");
		temps[i] = Number(curr_s[2]);
		year = curr_s[1].substring(0,4);
		month = curr_s[1].substring(4,6);
		day = curr_s[1].substring(6,8);
		var date = new Date(year+'-'+month+'-'+day)
		dates[i] = date
	}
	console.log();
	return [dates, temps];
}

// temporarily unused
function transformPoints(point, maxValue, minValue, canvasDim){
	var absMin = Math.abs(minValue);
	var absMax = Math.abs(maxValue);
	var absTot = absMin+absMax;
	var newPoint = canvasDim/absTot*point;
	var newPoint = canvasDim/(maxValue+minValue)*point;
	return newPoint;	
}

function createTransform(domain, range){
	// Domain is a two-element array of the data bounds [domain_min, domain_max]
	// Range is a two-element array of the screen bounds [range_min, range_max]
	// This gives you two equations to solve:
	// Range_min = alpha * domain_min + beta
	// Range_max = alpha * domain_max + beta
	// A solution would be:

	var domainMin = domain[0]
	var domainMax = domain[1]
	var rangeMin = range[0]
	var rangeMax = range[1]

	// Formulas to calculate the alpha and the beta
	var alpha = (rangeMax - rangeMin) / (domainMax - domainMin)
	var beta = rangeMax - alpha * domainMax

	// Returns the function for the linear transformation (y= a * x + b)
	return function(x){
		return alpha * x + beta;
	}
}


// The main canvas function for drawing the graph
function canvasFunction(dates, temps){
	// Initialize the canvas and the begin and end points
	var canvas = document.getElementById("myCanvas");
	var ctx = canvas.getContext("2d");
	var maxTemp = Math.max.apply(Math,temps);
	var minTemp = Math.min.apply(Math,temps);

	// The sideValue is the space around the entire graph
	sideValue = 50;
	canvas.width = 800+sideValue+sideValue;
	canvas.height = 400+sideValue+sideValue;
	oldPoint = sideValue;
	oldDatePoint = sideValue;

	// Hardcoded temperature domain (all temperatures are within this range)
	var tempDomain = [250, -50];

	// Get the transform functions
	var transformTemps = createTransform(tempDomain, [sideValue,canvas.height-sideValue])
	var transformDates = createTransform([0,dates.length], [sideValue,canvas.width-sideValue])

	// Impossible month to start at a new month
	var prevMonth = 876;

	// Loop that goes over all days and draws the line at the right temperatures
	for (i = 0; i < dates.length; i++) {
		//Var newPoint = transformPoints(temps[i], maxTemp, minTemp, canvas.height);
		//Var datePoint = transformPoints(i, dates.length, 0, canvas.width);

		// Find the new necessary points for the next line to draw
		var newPoint = transformTemps(temps[i]);
		var datePoint = transformDates(i);

		// For every time the current month is different than the previous (thus new),
		// draw a tick
		if (dates[i].getMonth()!= prevMonth){
			drawTicks(canvas, datePoint, transformDates, dates[i].getMonth(),sideValue)
		}
		prevMonth = dates[i].getMonth()

		// Draw the lines of the temperatures
		ctx.moveTo(oldDatePoint,oldPoint);
		ctx.lineTo(datePoint,newPoint);
		ctx.stroke();
		oldPoint = newPoint;
		oldDatePoint = datePoint;
	}

	// Draw the ticks for the temperature
	tempTicks(canvas, tempDomain, sideValue);
}


// Draw the ticks and text on the vertical axis of the temperature
function tempTicks(canvas, tempDomain, sideValue){
	var ctx = canvas.getContext("2d");
	ctx.moveTo(sideValue, sideValue);
	ctx.lineTo(sideValue, canvas.height-sideValue);
	ctx.stroke();
	ctx.moveTo(sideValue, canvas.height-sideValue);
	ctx.lineTo(canvas.width-sideValue, canvas.height-sideValue);
	ctx.stroke();

	var transFunction = createTransform(tempDomain, [sideValue,canvas.height-sideValue])

	// Draw ticks for the right temperatures
	for(i=tempDomain[0]; i>=tempDomain[1]; i=i-50) {
		var tick = transFunction(i)
		ctx.moveTo(sideValue-15, tick);
		ctx.lineTo(sideValue, tick);
		ctx.stroke();
		ctx.fillText(i, sideValue-35, tick);
	}

	// Write the title
	ctx.font="30px Verdana";
	ctx.fillText("Maximum Temperature in De Bilt (NL)",canvas.width/3,40, canvas.width/3*2-canvas.width/3);
}
// Draw the ticks on the horizontal axis
function drawTicks(canvas, point, transformDates, monthNum, sideValue){
	var ctx = canvas.getContext("2d");
	var month
	// Translate the numerical values of each date to their linguistic form
	switch(monthNum) {
		case 0:
			month = 'January'
			break;
		case 1:
			month = 'February'
			break;
		case 2:
			month = 'March'
			break;
		case 3:
			month = 'April'
			break;
		case 4:
			month = 'May'
			break;
		case 5:
			month = 'June'
			break;
		case 6:
			month = 'July'
			break;
		case 7:
			month = 'August'
			break;
		case 8:
			month = 'September'
			break;
		case 9:
			month = 'October'
			break;
		case 10:
			month = 'November'
			break;
		case 11:
			month = 'December'
			break;
		default:
			month = 'ERROR'
	}

	// Write and draw the ticks and texts
	ctx.moveTo(point, canvas.height-sideValue);
	ctx.lineTo(point, canvas.height-sideValue+15);
	ctx.stroke();
	ctx.fillText(month, point+10, canvas.height-sideValue+25)

}


// This functions start the with getting the data and drawing the function
function mainGraph(raw){
	var list = raw.split("\n")
	var data = myLoop(list);
	canvasFunction(data[0], data[1]);
}

// Function that should wait on loading the KNMI.txt and afterwards creating the graph
function main() {
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			document.getElementById("dataId").innerHTML =
			this.responseText;
			mainGraph(this.responseText);
		}
	};
	xhttp.open("GET", "KNMI.txt", true);
	xhttp.send();
}
