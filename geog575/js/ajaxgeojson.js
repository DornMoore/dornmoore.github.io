
//Grab our data from the geojson file via an ajax call, 
// 	especially useful for big datasets
function getData(){
	
	var mydata;

	$.ajax("data/pcghg.geojson", {
		dataType: "json",
        success: function(response){
            //call function to create proportional symbols
            createPropSymbols(response, map);
        }

	});
};

//added at Example 2.3 line 20...function to attach popups to each mapped feature
function onEachFeature(feature, layer) {
    //no property named popupContent; instead, create html string with all properties
    var popupContent = "";
    var attribute = "pcghg2012";
    if (feature.properties) {
        //loop to add feature property names and values to html string
        //for (var property in feature.properties){
        //    popupContent += "<p>" + property + ": " + feature.properties[property] + "</p>";
        //}
        popupContent+= "<p> Country: " + feature.properties["country_name"] + "<br>"
        popupContent+= attribute + ": " + Number(feature.properties[attribute]) + "</p>";
        layer.bindPopup(popupContent);
    };
};

function calcPropRadius(attValue){
    //scale factor to adjust symbol size evenly
    var scaleFactor = 10;
    //area based on attribute value and scale factor
    var area = attValue * scaleFactor;
    //radius calculated based on area
    var radius = Math.sqrt(area/Math.PI);

    return radius;
};

function createPropSymbols(data, map){
    var attribute = "pcghg2012"
    //create marker options
    var geojsonMarkerOptions = {
        radius: 8,
        fillColor: "#ff7800",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    };

    //create a Leaflet GeoJSON layer and add it to the map
     L.geoJson(data, {
        onEachFeature: onEachFeature,
        pointToLayer: function (feature, latlng) {
            //Step 5: For each feature, determine its value for the selected attribute
            var attValue = Number(feature.properties[attribute]);

            geojsonMarkerOptions.radius=calcPropRadius(attValue);
            //examine the attribute value to check that it is correct
            console.log(feature.properties, attValue);

            //create circle markers
            return L.circleMarker(latlng, geojsonMarkerOptions);

            return L.popupContent()
        }
    }).addTo(map);
};


$(document).ready(getData);
