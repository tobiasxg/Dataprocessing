/* Tobias Garritsen, 10779582
* These are all functions necessary for interacting with the graph.
* This is used for a more precise look on the data.
* Code written with help of http://www.html5canvastutorials.com/advanced/html5-canvas-mouse-coordinates/
* Note that this does not return the right day and corresponding temperature,
* but it just returns the point of the axis you are in, thus a date and temperature the cursor is on.
*/

// Get the mouse position values
function getMousePos(canvas, evt) {
	var rect = canvas.getBoundingClientRect();
	return {
		x: evt.clientX - rect.left,
		y: evt.clientY - rect.top
	};
}

// Write the values of the mouse position (on the canvas) to the right place
function interactivity(transformX, transformY){
	var canvas = document.getElementById('myCanvas');
	canvas.addEventListener('mousemove', function(evt) {
		var mousePos = getMousePos(canvas, evt);
		// Get the transform functions
		var [transformY, transformX, numDays, tempDomain, dates] = getTransform();
		// Round for a prettier interface
		valueY = Math.round(transformY(mousePos.y));
		valueX = Math.round(transformX(mousePos.x));
		// Check if it is in the canvas
		if(valueX < numDays && valueX > 0 && valueY <= tempDomain[0] && valueY >= tempDomain[1]){
			// Line to print with date and temperature
			document.getElementById('tempOnDay').innerHTML = 'Temperature is ' + valueY + ' on day ' + dates[valueX];
		}
	}, false);
}

// Get the reversed transforms with the hardcoded temperature domain and the number of days
function getTransform(){
	var data = document.getElementById("dataId").innerHTML;
	var canvas = document.getElementById("myCanvas");
	var ctx = canvas.getContext("2d");
	var tempDomain = [250, -50];
	var numDays = data.split("\n").length;
	var dates = myLoop(data.split("\n"));
	// Get the transform functions, recalculated every step, could be far more efficient
	var transformTemps = createTransform([sideValue,canvas.height-sideValue], tempDomain);
	var transformDates = createTransform([sideValue,canvas.width-sideValue],[0,numDays])
	return [transformTemps, transformDates, numDays, tempDomain, dates[0]];
}
