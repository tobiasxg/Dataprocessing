/*Tobias Garritsen, 10779582
The following script loads in the test.svg in the html file.
*/

window.onload = function() {
	d3.xml("test.svg", "image/svg+xml", function(error, xml) {
	    if (error) throw error;    
	    document.body.appendChild(xml.documentElement);    
	});
}
