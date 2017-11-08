
function getData(){
	var list = document.getElementById("dataId").innerHTML.split("\n");
	var data = myLoop(list);
	return data;
}

function myLoop(list) {
	var dates = [];
	var temps = [];
	for (i = 0; i < list.length-1; i++) {
		curr = list[i];
		curr = curr.replace(/\s/g,'');
		curr_s = curr.split(",");
//		days[i] = curr_s[1];
		temps[i] = Number(curr_s[2]);

//		document.getElementById("demo2").innerHTML = curr_s[0];
		year = curr_s[1].substring(0,4);
		month = curr_s[1].substring(4,6);
		day = curr_s[1].substring(6,8);
		var date = new Date(year+'-'+month+'-'+day)
//		var date = new Date(year, month, day)
		dates[i] = date
//		console.log(dates[i])
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
	// domain is a two-element array of the data bounds [domain_min, domain_max]
	// range is a two-element array of the screen bounds [range_min, range_max]
	// this gives you two equations to solve:
	// range_min = alpha * domain_min + beta
	// range_max = alpha * domain_max + beta
	// a solution would be:

	var domainMin = domain[0]
	var domainMax = domain[1]
	var rangeMin = range[0]
	var rangeMax = range[1]

	// formulas to calculate the alpha and the beta
	var alpha = (rangeMax - rangeMin) / (domainMax - domainMin)
	var beta = rangeMax - alpha * domainMax

	// returns the function for the linear transformation (y= a * x + b)
	return function(x){
		return alpha * x + beta;
	}
}


function canvasFunction(dates, temps){
	var canvas = document.getElementById("myCanvas");
	var ctx = canvas.getContext("2d");
	var maxTemp = Math.max.apply(Math,temps);
	var minTemp = Math.min.apply(Math,temps);
	canvas.width = 800;
	canvas.height = 400;
	oldPoint = 0;
	oldDatePoint = 0;

	var transformTemps = createTransform([-38,236], [0,canvas.height])
	var transformDates = createTransform([0,dates.length], [0,canvas.width])

	for (i = 0; i < dates.length; i++) {
		//var newPoint = transformPoints(temps[i], maxTemp, minTemp, canvas.height);
		//var datePoint = transformPoints(i, dates.length, 0, canvas.width);

		var newPoint = transformTemps(temps[i]);
		var datePoint = transformDates(i);

		console.log(dates[i])
		console.log(dates[i].getDay())
		console.log(dates[i].getMonth())
		console.log(dates[i].getYear())

//		if (dates.getDay())

//		console.log(temps[i])
//		console.log(newPoint);
		ctx.moveTo(oldDatePoint,oldPoint);
		ctx.lineTo(datePoint,newPoint);
		ctx.stroke();
		oldPoint = newPoint;
		oldDatePoint = datePoint;
	}
}

//function drawCanvasText(canvas, dates){
//	ctx.strokeText(text, x, y [, maxWidth]);
//}

function main(){
	var data = getData();
	var dates = data[0];
	var temps = data[1];
	canvasFunction(dates, temps);
}

