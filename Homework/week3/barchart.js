/* Tobias Garritsen, 10779582
* These are all functions necessary to load the graph of temperatures in the 
* html file for the assignment of the second week. This is done with the help
* of canvas.
*/


// 
function main() {
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			document.getElementById("dataId").innerHTML =
			this.responseText;
			mainGraph(this.responseText);
		}
	};
	xhttp.open("GET", "epldata_final.json", true);
	xhttp.send();
}
