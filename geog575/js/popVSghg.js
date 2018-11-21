// File created for geog575 Fall 2018 by Dorn Moore
// Base file created from Leaflet Tutorial and Lab1 materials from the course
// Significant guidance was provided from 
//  DONOHUE, R., SACK, C., ROTH, R.. Time Series Proportional Symbol Maps with Leaflet and jQuery. 
//      Cartographic Perspectives, North America, 0, oct. 2014. 
//      Available at: <http://www.cartographicperspectives.org/index.php/journal/article/view/cp76-donohue-et-al/1307>. 
//      Date accessed: 12 Oct. 2018.

// -- Functions --

//Grab our data from the geojson file via an ajax call, 
function getData(){
	
	var mylayer;

	$.ajax("data/pcghg.geojson", {
		dataType: "json",
        success: function(response){
            // Populate the the GLOBAL variable mydata
            mydata = response;
            // use GLOBAL variable info to store some basic, compiled pieces.
            info = dataProcessing(response);
            //Create teh sequence controls (time slider)
            createSequenceControls(map, info.years);
            //call function to create proportional 
            createPropSymbols(info.years, info.types, response, map);

        },
        error: function() { 
            //Let the user know if they cannot load the data.
            alert('There has been a problem loading the data.');
        }
	})
};

//Update the ranked value list that shows in the sidebar
function updateRankList(data, type, year){
    var list = rankedList(data, type+year);

    //create the ordered list to add to the end of the string
    var myList = '<ol>';
    for (var i in list) {
        myList += ("<li>" + list[i].name + "</li>");
    };
    myList += '</ol>';

    var tableTitle = '';
    var top10 = '';
    //  Check the type being shown and change the text accordingly
    if (type === 'pop') {
        tableTitle = '<div id="sidebar-title">' +year+'\'s Most Populous Countries</center></div>'
        top10='<div id="rank-list">' + myList +'</div>'
    } else if (type === 'ghg') {
        tableTitle = '<div id="sidebar-title">'+year+'\'s Worst Total CO2 Polluters</div>'
        top10='<div id="rank-list">' + myList +'</div>'
    } else if (type === 'pcghg') { 
        tableTitle = '<div id="sidebar-title">'+year+'\'s Highest Per Capita CO2 Polluters</div>'
        top10='<div id="rank-list">' + myList +'</div>'
    };
    
    // Push the table title and list to the page
    $('#sidebar-title').replaceWith(tableTitle);
    $('#rank-list').replaceWith(top10);
};


// Create the Ranked List of the to 10 values - used to create teh list on the right
function rankedList(data, attribute){
    // Create a subset of the data with just the country and the attribute of interest.
    var expected_result = data.features.map(function (el) {
        return {name: el.properties.country_name, value: el.properties[attribute]};
    });

    // Order the list returning all of the values
    var list =getTopN(expected_result,'value',216);

    //Filter the list to remove empty/null/undefined values.
    //      Tried Null instead of >=1 and it didn't work for me 
    const filtered = list.filter(value => value.value >= 1);
    
    // Get teh top 10 values.
    list =getTopN(filtered,'value',10);
    
    return list;
};


// Update the title of the map.
function updateTitle(type, year){
    var newTitle = 'NewTitle';
    if (type === 'pop') {
        newTitle = '<div id="map-title">'+ year +' Population</div>'
    } else if (type === 'ghg') {
        newTitle = '<div id="map-title">'+ year +' CO2 Production</div>'
    } else if (type === 'pcghg') {
        newTitle = '<div id="map-title">'+ year +' Per Capita CO2 Production</div>'
    };
    //console.log(newTitle);
    $('#map-title').replaceWith(newTitle);
};


// Data processing creates contents for the GLOBAL info variable
// 
//  Several items are left intact here but are never used (e.g. min/mx for attributes)
//      I've left them in for futere reference - There were originally an attempt to 
//      create a different scalling system where circles were in classified categories
//      In the end, I preferred the radius approach as it showed changes better.
function dataProcessing(data){
    // array of years
    var years = [];
    // min/max years
    var minYear = Infinity;
    var maxYear = -Infinity;
    // list of possible types
    var types = ['ghg','pop','pcghg']
    // max values used to create the proportional symbols.
    var maxGhg = -Infinity;
    var maxPop = -Infinity;
    var maxPcghg = -Infinity;

    var minGhg = Infinity;
    var minPop = Infinity;
    var minPcghg = Infinity;

    

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


// Create the Sequence Controls for the time Slider
function createSequenceControls(map, timestops){
    // Add the previous button
    $('#controls').append('<button class="skip" id="reverse">Previous</button>');
    // Add the slider
    $('#controls').append('<input class="range-slider" type="range">');

    //set slider attributes
    $('.range-slider').attr({
        max: timestops[timestops.length-1],
        min: 0,
        min: timestops[0], 
        step: 1
    });
    // Add the next button
    $('#controls').append('<button class="skip" id="forward">Next</button>');
    // Convert the previous and next buttons to icons
    $('#reverse').html('<i class="fas fa-arrow-circle-left"></i>');
    $('#forward').html('<i class="fas fa-arrow-circle-right"></i>');
    
    // Handle the control when the slider is moved manually
    $('.range-slider').mousemove(function(){
        yearidx = $('.range-slider').val();

        // Update the symbols based on the new yearidx
        updatePropSymbols(attType, yearidx);

    });

    // Handle the usage of teh previous and next buttons
    $('.skip').click(function() {
        yearidx = $('.range-slider').val();
        
        // increment or decrement depending on button clicked
        if ($(this).attr('id') == 'forward'){
            yearidx++;
            yearidx = yearidx > timestops[timestops.length-1] ? timestops[0] : yearidx;
        } else if ($(this).attr('id') == 'reverse'){
            yearidx--;
            // if past the first attribute, wrap around to last attribute
            yearidx = yearidx < timestops[0] ? timestops[timestops.length-1] : yearidx;
        };
        $('.range-slider').val(yearidx);

        updatePropSymbols(attType, yearidx);
    });

};


//For each feature.. RUN THIS
function onEachFeature(feature, layer) {
    
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
        // var value = Math.round(Number(feature.properties[attribute]));
    };

    if (feature.properties) {
        //loop to add feature property names and values to html string
        popupContent+= '<div id="popup_title">' + feature.properties['country_name'] + '</div>'
        popupContent+= '<div id=popup_content">' + valuestring + 'in '+ year +'</div>';
        layer.bindPopup(popupContent);
    }; 
};


// Update the Proportional Symbols after changes.
function updatePropSymbols(type, year){

    mylayer.eachLayer(function(layer) {
        // Create a var to get tot eh attributes easily
        var props = layer.feature.properties;
        // calculate the radius
        var radius = calcPropRadius(type, year, props[type+year]);

        layer.setRadius(radius);

        var popupContent = "";
        var attribute = type+year;
        
        // SECTION BELOW SHOULD BE REFACTORED as it appears in the previous area. 

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
            popupContent+= '<div id="popup_title">' + props['country_name'] + ' - ' +year+'</div>'
            popupContent+= '<div id=popup_content">' + valuestring + '</div>';
            layer.bindPopup(popupContent);
        };
    })
    updateTitle(type, year);
    updateRankList(mydata, type, year);

};


// Calculate the radius of the circles drawn on the map.
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
        // adjust teh scale factor slightly for this type
        scaleFactor = 2500;
    }
    //area based on attribute value and scale factor
    var area = r * scaleFactor;
    
    //radius calculated based on area
    var radius = Math.sqrt(area/Math.PI);

    // use 1.5 as the minimum radius, smaller than this and it gets hard to click
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
                }                
            });

            return L.popupContent()
        }
    }).addTo(map);

    // Add the functionality for the data type filters.
    $('a.menu-ui').on('click', function() {
        // For each filter link, get the 'data-filter' attribute value.
        var filter = $(this).data('filter');
        // console.log(filter);
        attType=filter;
        
        updatePropSymbols(attType, yearidx);
    });

     updatePropSymbols(attType, years[0]);
};


// Get the top N values from an array
function getTopN(arr, prop, n) {
    // clone before sorting, to preserve the original array
    var clone = arr.slice(0); 

    // sort descending
    clone.sort(function(x, y) {
        if (x[prop] == y[prop]) return 0;
        else if (parseInt(x[prop]) < parseInt(y[prop])) return 1;
        else return -1;
    });

    return clone.slice(0, n || 1);
};


//Global Variables
//var for info from dataProcessing()
var info
// var to store teh data
var mydata
// var to store the current yearidx (start with 1970)
var yearidx=1970

// start var for type
var attType = 'pop';


$(document).ready(
    getData
    );
