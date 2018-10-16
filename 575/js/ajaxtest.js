

function debugCallback(response, status, jqHCRobject){
	
	$(mydiv).append('GeoJSON data: <br>' + JSON.stringify(response));
};

function debugAjax(){
	
	var mydata;

	$.ajax("data/pop_places.geojson", {
		dataType: "json",
		success: debugCallback
		
	});

	//$(mydiv).append('<br>GeoJSON data:<br>' + JSON.stringify(mydata));
};

//$(mydiv).append('GeoJSON data: ' + JSON.stringify(mydata));

$(document).ready(debugAjax);