// File created for geog575 Fall 2018 by Dorn Moore
// Base file created from Leaflet Tutorial and Lab1 materials from the course
// Significant guidance was provided from 
//  DONOHUE, R., SACK, C., ROTH, R.. Time Series Proportional Symbol Maps with Leaflet and jQuery. 
//      Cartographic Perspectives, North America, 0, oct. 2014. 
//      Available at: <http://www.cartographicperspectives.org/index.php/journal/article/view/cp76-donohue-et-al/1307>. 
//      Date accessed: 12 Oct. 2018.

// -- Functions --

//Grab our data from the geojson file via an ajax call, 
// 	especially useful for big datasets
function getData(){
	
	var mylayer;

	$.ajax("data/pcghg.geojson", {
		dataType: "json",
        success: function(response){
            mydata = response;
            //call function to create proportional symbols
            info = dataProcessing(response);
            createPropSymbols(info.years, info.types, response, map);
            createSliderControls(map, info.years);
            
            rankedList(mydata, 'ghg1970');

        },
        error: function() { 
            alert('There has been a problem loading the data.');
        }
	})
};

function updateRankList(data, type, year){
    var list = rankedList(data, type+year);
    var rank =1;
    var myList = '<ol>';
    for (var i in list) {
        myList += ("<li>" + list[i].name + "</li>");
        rank++;
    };
    myList += '</ol>';

    var tableTitle = 'tableTitle';
    if (type === 'pop') {
        tableTitle = '<div id="sidebar"><div id="sidebar-title">' +year+'\'s Most Populous Population Countries</center></div><div id="rank-list">' + myList +'</div>'
    } else if (type === 'ghg') {
        tableTitle = '<div id="sidebar"><div id="sidebar-title">'+year+'\'s Top Green House Gas Polluters</div><div id="rank-list">' + myList +'</div>'
    } else if (type === 'pcghg') {
        tableTitle = '<div id="sidebar"><div id="sidebar-title"><center>'+year+'\'s Top Per Capita Green House Gas Polluters</center></div><div id="rank-list">' + myList +'</div>'
    };
    
    //console.log(newTitle);
    $('#sidebar').replaceWith(tableTitle);
};

function updateTitle(type, year){
    var newTitle = 'NewTitle';
    if (type === 'pop') {
        newTitle = '<div id="map-title">Population in '+ year+'</div>'
    } else if (type === 'ghg') {
        newTitle = '<div id="map-title">Green House Gas Production in '+ year+'</div>'
    } else if (type === 'pcghg') {
        newTitle = '<div id="map-title">Per Capita Green House Gas Production in '+ year+'</div>'
    };
    //console.log(newTitle);
    $('#map-title').replaceWith(newTitle);
};

function dataProcessing(data){
    // array of years
    var years = [];
    var minYear = Infinity;
    var maxYear = -Infinity;
    var minGhg = Infinity;
    var minPop = Infinity;
    var minPcghg = Infinity;
    var maxGhg = -Infinity;
    var maxPop = -Infinity;
    var maxPcghg = -Infinity;
    var types = ['ghg','pop','pcghg']

    for (var feature in data.features) {
        var properties = data.features[feature].properties;

        for (var attribute in properties) {
            //pull the prefix value (the part before the year)
            var prefix = attribute.slice(0, attribute.length-4);
            //pull the year from each attribute name (last 4 caracters)
            var year = attribute.slice( -( 4 ) );

            var value = properties[attribute];

            // loop through data to get a list of the years from the attributes
            if ($.inArray(prefix, types) != -1) {
                    // Add each year to the list years
                    if ( $.inArray(year, years) === -1 ){
                        years.push(year);
                    }
                    //update the minimum year
                    if (year < minYear ) {
                        minYear = year;
                    };
                    //update the max year
                    if (year > maxYear) {
                        maxYear = year;
                    };
                    //Cycle through values to calculate the range of values
                    // This is used as an alternate way to sumbolize the maps 
                    //      Possible that this method will not be used.
                    if (prefix === 'ghg'){
                        if (value < minGhg && value > 0) {
                        minGhg = value;
                        };
                        if (value > maxGhg ) {
                        maxGhg = value;
                        };
                    } else if (prefix === 'pop') {
                        if (value < minPop && value > 0) {
                        minPop = value;
                        };
                        if (value > maxPop ) {
                        maxPop = value;
                        };
                    } else if (prefix === 'pcghg') {
                        if (value < minPcghg && value > 0) {
                        minPcghg = value;
                        };
                        if (value > maxPcghg ) {
                        maxPcghg = value;
                        };
                    };

                }
            }
        }
    
    return {
        types: types,
        years: years,
        minYear: minYear,
        maxYear: maxYear,
        minGhg: minGhg,
        maxGhg: maxGhg,
        minPop: minPop,
        maxPop: maxPop,
        minPcghg: minPcghg,
        maxPcghg: maxPcghg
        
    }
};


function createSliderControls(map, timestops) {
    var sliderControl = L.Control.extend( { 
        options: {
            position: 'topright'
        },
        onAdd: function(map) {
            var slider = L.DomUtil.create('input', 'range-slider');
      
            L.DomEvent.addListener(slider, 'mousedown', function(e) { 
                L.DomEvent.stopPropagation(e); 
                map.dragging.disable();
            });

            L.DomEvent.addListener(slider, 'mouseout', function(e) { 
                map.dragging.enable();
            });

            $(slider)
                .attr({'type':'range', 
                    'max': timestops[timestops.length-1], 
                    'min': timestops[0], 
                    'step': 1})
                .on('input change', function() {
                //console.log($(this).val().toString());
                updatePropSymbols(attType,$(this).val().toString());
                updateTitle(attType,$(this).val().toString());
            });

            return slider;
        }
    });
    //sliderControl.addTo(map)
    map.addControl(new sliderControl());
};



//For each feature...
function onEachFeature(feature, layer) {
    if (feature.properties[attribute] == null){
        continue;
    }
    //no property named popupContent; instead, create html string with all properties
    var popupContent = "";
    var attribute = focusAttribute;
    // var for the attribute's YEAR
    var year = attribute.slice( -( 4 ) );
    // var for the attribute's prefix - indicating the type of value it represents.
    var prefix = attribute.slice(0,attribute.length-4);
    
    // format value of attributes depending on the 
    if (prefix=='ghg'){
        // convert to megaton
        var value = Math.round(Number(feature.properties[attribute]/1000000));
        var valuestring = value.toLocaleString('en')  + ' megatons of CO2 ';
    } else if (prefix=='pcghg') {
        // values are in kilotons
        var value = Number(feature.properties[attribute]).toFixed(2);
        var valuestring = value.toLocaleString('en')  + ' metric tons of CO2 per person ';
    } else if (prefix=='pop') {
        // values are people
        var value = Math.round(Number(feature.properties[attribute]));
        var valuestring = value.toLocaleString('en')  + ' people ';
    } else {
        var value = Math.round(Number(feature.properties[attribute]));
    }

    if (feature.properties) {
        //loop to add feature property names and values to html string
        popupContent+= '<div id="popup_title">' + feature.properties['country_name'] + '</div>'
        popupContent+= '<div id=popup_content">' + valuestring + 'in '+ year +'</div>';
        layer.bindPopup(popupContent);
    };
};

function classes(min, max, attValue){
    var range = max - min;
    var c1Bnd = min + (range/6);
    var c3Bnd = max - (range/6);

    var attClass = 2;
    if (attValue <= c1Bnd){
        attClass = 3;
    } else if (attValue >= c3Bnd){
        attClass = 25;
    } else {attClass = 15;}

    return attClass;
};



function updatePropSymbols(type, year){

    mylayer.eachLayer(function(layer) {

        var props = layer.feature.properties;

        //skip this element if there is a null value.
        

        var radius = calcPropRadius(type, year, props[type+year]);

        layer.setRadius(radius);

        var popupContent = "";
        var attribute = type+year;
        
        // format value of attributes depending on the 
        if (type=='ghg'){
            // convert to megaton
            var value = Math.round(Number(props[attribute]/1000000));
            var valuestring = value.toLocaleString('en')  + ' megatons of CO2 ';
        } else if (type=='pcghg') {
            // values are in kilograms
            var value = Number(props[attribute]).toFixed(2);
            var valuestring = value.toLocaleString('en')  + ' metric tons of CO2 per person ';
        } else if (type=='pop') {
            // values are people
            var value = Math.round(Number(props[attribute]));
            var valuestring = value.toLocaleString('en')  + ' people ';
        } else {
            var value = Math.round(Number(props[attribute]));
        }
        

        if (props) {
            //loop to add feature property names and values to html string
            popupContent+= '<div id="popup_title">' + props['country_name'] + '</div>'
            popupContent+= '<div id=popup_content">' + valuestring + 'in '+ year +'</div>';
            layer.bindPopup(popupContent);
        };
    })
    updateTitle(type, year);
    updateRankList(mydata, type, year);

};

function calcPropRadius(type, year, attValue){
    
    //scale factor to adjust symbol size evenly
    var scaleFactor = 5000;
    var r = 1
    //
    if (type === 'pop') {
        r = (attValue/info.maxPop);
    } else if (type === 'ghg' ) {
        r = (attValue/info.maxGhg);
    } else if (type === 'pcghg' ) {
        r = (attValue/info.maxPcghg);
        scaleFactor = 2500;
    }
    //area based on attribute value and scale factor
    var area = r * scaleFactor;
    
    //radius calculated based on area
    var radius = Math.sqrt(area/Math.PI);

    if (radius < 1.5){radius=1.5;}

    return radius;
};


//This Function creates the proportional Symbols. It requires the 
function createPropSymbols(years, types, data, map){
    //var attribute = type + year
    //create marker options
    var geojsonMarkerOptions = {
        //radius: 8,
        fillColor: "#007800",
        color: "#888888",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.6
    };

    //create a Leaflet GeoJSON layer and add it to the map
     mylayer = L.geoJson(data, {
        pointToLayer: function (feature, latlng) {
            
            //create circle markers
            return L.circleMarker(latlng, geojsonMarkerOptions).on({
                mouseover: function(e){
                    this.openPopup();
                },
                mouseout: function(e) {
                    this.closePopup();
                },
                // click: function(e){
                //     $("#sidebar").html(e.popupContent();
                // }
            });


            return L.popupContent()
        }
    }).addTo(map);

     updatePropSymbols(attType, years[0]);
};

function getTopN(arr, prop, n) {
    // clone before sorting, to preserve the original array
    var clone = arr.slice(0); 
    // var clone = arr[prop].filter(function (el) {
    //     return el != null
    // });

    // sort descending
    clone.sort(function(x, y) {
        if (x[prop] == y[prop]) return 0;
        else if (parseInt(x[prop]) < parseInt(y[prop])) return 1;
        else return -1;
    });

    return clone.slice(0, n || 1);
};


function rankedList(data, attribute){
    var expected_result = data.features.map(function (el) {
        return {name: el.properties.country_name, value: el.properties[attribute]};
    });

    var list =getTopN(expected_result,'value',40);
    //console.log(list);

    const filtered = list.filter(value => value.value >0);
    // console.log(filtered);

    list =getTopN(filtered,'value',10);
    // console.log(list);

    return list;
};


//Global Variables
//var for info from dataProcessing()
var info
var mydata

// start var for type
var attType = 'pcghg';


$(document).ready(
    getData,
    //updateTitle()
    );
