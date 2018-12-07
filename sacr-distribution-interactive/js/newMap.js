//Grab our data from the geojson file via an ajax call,
function getData() {
    // Add States Layer underneath
    $.ajax("data/EPstates.geojson", {
        beforeSend: function(xhr){
            if (xhr.overrideMimeType)
            {
              xhr.overrideMimeType("application/json");
            }
          },
        dataType: "json",
        success: function(response) {
            states = new L.GeoJSON(response,
                {style: { // add style options to layer
                    fillOpacity: 0, //fill opacity
                    color: "#c0c0c0", //outline color
                    weight: 1 // line weight
                    }
                }).addTo(map); // add to leaflet map)
        }
    })

    // Add Circle Data
    $.ajax("data/cbcCircleDataByYear.geojson", {
        beforeSend: function(xhr){
            if (xhr.overrideMimeType)
            {
              xhr.overrideMimeType("application/json");
            }
          },
        dataType: "json",
        success: function(response) {
            // Populate the the GLOBAL variable mydata
            circData = response;
            // console.log(response);
            // use GLOBAL variable info to store some basic, compiled pieces.
            info = dataProcessing(response);
            // console.log(info);
            // //Create the sequence controls (time slider)
            // createSequenceControls(map, info.years);
            //call function to create proportional
            createPropSymbols(info.years, response, map);

        },
        error: function() {
            //Let the user know if they cannot load the data.
            alert('There has been a problem loading the data. filename: bcCircleDataByYear.geojson');
        }
    });

}

// Data processing creates contents for the GLOBAL variable info
//
//  Several items are left intact here but are never used (e.g. min/mx for attributes)
//      I've left them in for futere reference.
function dataProcessing(data) {
    // array of years
    var years = [];
    // min/max years
    var minYear = Infinity;
    var maxYear = -Infinity;
    // max values used to create the proportional symbols.
    var maxSacr = -Infinity;
    var minSacr = Infinity;


    for (var feature in data.features) {
        var properties = data.features[feature].properties;

        for (var attribute in properties) {
            //pull the prefix value (the part before the year)
            // var prefix = attribute.slice(0, attribute.length-4);
            //pull the year from each attribute name (last 4 caracters)
            var year = attribute;

            var value = properties[attribute];

            // loop through data to get a list of the years from the attributes
            if (Number.isInteger(parseInt(year))) {
                // Add each year to the list years
                if ($.inArray(year, years) === -1) {
                    years.push(year);
                }
                //update the minimum year
                if (year < minYear) {
                    minYear = year;
                };
                //update the max year
                if (year > maxYear) {
                    maxYear = year;
                };
                //Cycle through values to calculate the range of values
                // This is used as an alternate way to sumbolize the maps
                //      Possible that this method will not be used.
                if (value < minSacr && value > 0) {
                    minSacr = value;
                };
                if (value > maxSacr) {
                    maxSacr = value;
                };
            }
        }
    }

    return {
        years: years,
        minYear: minYear,
        maxYear: maxYear,
        minSacr: minSacr,
        maxSacr: maxSacr
    }

};

//This Function creates the proportional Symbols. It requires the
function createPropSymbols(years, data, map) {
    //var attribute = type + year
    //create default marker options
    var geojsonMarkerOptions = {
        radius: 8,
        fillColor: "purple",
        color: "white",
        weight: 0.75,
        opacity: 0.6,
        fillOpacity: 0.4
    };

    //create a Leaflet GeoJSON layer and add it to the map
    mylayer = L.geoJson(data, {
        pointToLayer: function(feature, latlng) {
            //create circle markers
            return L.circleMarker(latlng, set_feature_style(userYear)).on({
                mouseover: function(e) {
                    this.openPopup();
                },
                mouseout: function(e) {
                    this.closePopup();
                }
            });

            // return L.popupContent()
        }
    }).addTo(map);


    // // Add the functionality for the data type filters.
    // $('a.menu-ui').on('click', function(e) {
    //     // For each filter link, get the 'data-filter' attribute value.
    //     var filter = $(this).data('filter');
    //     // console.log(filter);
    //     attType=filter;
    //     e.preventDefault();
    //     updatePropSymbols(userYear);
    // });

    updatePropSymbols(userYear);
};

function set_feature_style(attValue) {
    // Calculate the radius of the circles drawn on the map.
    var radius;
    if (attValue == 0 || attValue == null) {
        radius = 2;
    } else if (attValue == 1) {
        radius = 2.5;
    } else if (attValue <= 534) {
        radius = 4;
    } else if (attValue <= 2071) {
        radius = 8;
    } else if (attValue <= 4585) {
        radius = 16;
    } else if (attValue <= 8788) {
        radius = 30;
    } else { radius = 60; }

    // var properties = feature.properties;

    if (attValue == null) {
        var geojsonMarkerOptions = {
            opacity: 0,
            fillOpacity: 0
        };
        return geojsonMarkerOptions;
    } else if (attValue == 0 && toggleState == 1) {
        var geojsonMarkerOptions = {
            radius: radius,
            fillColor: "white",
            color: "gray",
            weight: 0.75,
            opacity: 0.8,
            fillOpacity: 0.8
        };
        return geojsonMarkerOptions;
    } else if (attValue == 0 && toggleState == 0) {
        var geojsonMarkerOptions = {
            radius: 0,
            fillColor: "white",
            // color: "gray",
            // weight: 0.75,
            opacity: 0,
            fillOpacity: 0
        };
        return geojsonMarkerOptions;
    } else {
        var geojsonMarkerOptions = {
            radius: radius,
            fillColor: "purple",
            color: "white",
            weight: 0.75,
            opacity: 0.6,
            fillOpacity: 0.4
        };
        return geojsonMarkerOptions;
    }
}



// //For each feature.. RUN THIS
// function onEachFeature(feature, layer) {

//     //no property named popupContent; instead, create html string with all properties
//     // var popupContent = "";
//     var attribute = focusAttribute;
//     // var for the attribute's YEAR
//     var year = attribute;

//     // format value of attributes depending on the
//     var value = feature.properties[attribute];
//     // popupContent
//     layer.bindPopup(popContent(value, feature.properties.circle_name, year));
// };

// Update the Proportional Symbols after changes.
function updatePropSymbols(year) {
    // console.log(mylayer);
    mylayer.eachLayer(function(layer) {
        // Create a var to get tot eh attributes easily
        var props = layer.feature.properties;

        // Set the style programatically
        layer.setStyle(set_feature_style(props[userYear]))

        // var popupContent = "";
        var attribute = year;

        // format value of attributes depending on the
        var value = props[attribute];
        var myPopup = popContent(value, props.circle_name, year)
        if (myPopup != "unbind") {
            layer.bindPopup(myPopup);
        } else {
            layer.unbindPopup();
        }

    })

    document.getElementById("userYear").innerHTML = userYear;
    document.getElementById("myRange").value = userYear;
    updateLatChart();
    // updateTitle(type, year);
    // updateRankList(mydata, type, year);
};


function popContent(value, circle_name, year) {
    // format value of attributes depending on the
    var popupContent = "";
    var valuestring;
    if (value == null) {
        return "unbind";
        // Do Nothng if null.
    } else if (value == 0 && toggleState == 0) {
        return "unbind";
        // valuestring = "No Sandhill Cranes counted here"
        // popupContent+= '<div id="popup_title">' + circle_name + '</div>'
        // popupContent+= '<div id=popup_content">' + valuestring + ' in '+ year +'</div>';
        // // layer.bindPopup(popupContent);
        // return popupContent;
    } else if (value == 0 && toggleState == 1) {
        valuestring = "No Sandhill Cranes counted here"
        popupContent += '<div id="popup_title">' + circle_name + '</div>'
        popupContent += '<div id=popup_content">' + valuestring + ' in ' + year + '</div>';
        // layer.bindPopup(popupContent);
        return popupContent;
    } else {
        valuestring = value.toLocaleString('en') + ' Sandhill Cranes Counted';
        popupContent += '<div id="popup_title">' + circle_name + '</div>'
        popupContent += '<div id=popup_content">' + valuestring + ' in ' + year + '</div>';
        return popupContent;
        // layer.bindPopup(popupContent);
    }
}

// Calculate the radius of the circles drawn on the map.
function calcPropRadius(attValue) {

    var radius;
    if (attValue == 0 || attValue == null) {
        radius = 1;
    } else if (attValue == 1) {
        radius = 2.5;
    } else if (attValue <= 534) {
        radius = 4;
    } else if (attValue <= 2071) {
        radius = 8;
    } else if (attValue <= 4585) {
        radius = 16;
    } else if (attValue <= 8788) {
        radius = 30;
    } else { radius = 60; }

    return radius;
};


function togglePoints() { //funcion that performs an on or off of data based on its state
    if (!toggle) {
        toggleState = 0 //reports a toggle state for use later
        updatePropSymbols(userYear);
        // map.removeLayer(cbcDataZeroItems); // remove the data is button is selected a second time
    } else {
        toggleState = 1 //reports toggle state for use later
        updatePropSymbols(userYear);
        // map.addLayer(cbcDataZeroItems); // add data if button is selected
    }
    toggle = !toggle; // want toggle to return false to restar the button actions
};

function togglePlay() { // function that plays nicely with the play button, allows me to tell if the user has switched to on and readd the data when necessary
    updatePropSymbols(userYear);
    if (toggleState == 1) {
        // map.removeLayer(cbcDataZeroItems);
        // map.addLayer(cbcDataZeroItems);
    } else { // do nothing if the state is zero
        console.log('0');
    }
}
//testline to delete
function buttonForward() { // defines what should happen when the user selects the forward button
    if (info.minYear <= userYear && userYear < info.maxYear) { // what to do if the selection is whithin bounds of the data
        userYear == userYear++; // increment the userYear var
        updatePropSymbols(userYear); //Update the map features
    } else { // if the data is out of bounds let the user know it is so and don't increment the data userYear var
        document.getElementById("dataText").innerHTML = info.maxYear + " is the latest year with data"
    }
};

function buttonBack() { // does the same as obove but in reverse for the back button
    if (info.maxYear >= userYear && userYear > info.minYear) { // what to do if the selection is whithin bounds of the data
        userYear == userYear--; // step the useryear var down one each time
        updatePropSymbols(userYear); //Update the map features
    } else { //if the user goes out of the data bounds report that and don't allow for it to be incremented.
        document.getElementById("dataText").innerHTML = info.minYear + " is the earliest year with data";
    }
};

function playData() { // function that progresses through the data automaticlay
    window.startFun = window.setInterval(function() { //sets 400ms as the time to increment through the data
        buttonForward(); //run button forward function to progress through the data
        togglePlay(); // run teh play button for the toggle of zero data
        if (userYear == info.maxYear) { // if the reach 2012 set it back to the begining to create a loop
            userYear = info.minYear;
        };
    }, 600);
};

// var toggle = L.easyButton({ // add leaflet easy button to the map as a way to play the data
//     states: [{ //button is a toggle and performs two seperate actions based on the order of the click
//         stateName: 'startPlay', //name state
//         icon: 'fa fa-play', //play icon
//         title: 'start autoplay', //naming the button
//         onClick: function(control) { //runt the autoplay of the data
//             playData();
//             control.state('endPlay'); //progresses the button to the second state after clicked initially
//         }
//     }, {
//         icon: 'fa fa-pause', //pause icon
//         stateName: 'endPlay', //name the state
//         onClick: function(control) { //stop the autoplay of the data
//             window.clearInterval(startFun); //return to original state
//             control.state('startPlay'); //return the button to its orginial state of play
//         },
//         title: 'stop autoplay' //name the button in tooltip
//     }]
// });
// toggle.addTo(map); //add the toggle easy button to the map

function updateLatChart() {
    // Get the script lat_chart.js
    $.getScript('js/lat_chart.js', function() {
        myYear = userYear; //Update the variable myYear
        updateYear(); // Run the updateYear function
    });
}


//Global Variables
//var for info from dataProcessing()
var info
// var to store teh data
var mydata
// var to store the current yearidx (start with 1970)
var userYear = 2012

var cartoLight = L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png', {
    attribution: 'Data from National Audubon Society. Map tiles by Carto.'
}); // var that holds the leaflet defenition for carto light basemap

var esriSatellite = L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
}); // var that holds the leaflet defenition for Esri Basemap

var cartoDark = L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png', {
    attribution: 'Map tiles by Carto, under CC BY 3.0. Data by OpenStreetMap, under ODbL.'
}); // var that holds the leaflet defenition for carto dark basemap

/* Example from Leaflet Quick Start Guide*/

var map = L.map('map', {
    // center: [38.0, -95.79], //center of the map, near center of data
    zoom: 4, // level of initial zoom defined
    maxZoom: 6, // set max zoom level
    minZoom: 4, // set min zoom level
    zoomSnap: 0.5, // add fractional zoom to map
    layers: [cartoLight], // initial layers to be added to the map
    fullscreenControl: true, // add fullscreen control to map
    fullscreenControlOptions: {
        position: 'topleft'
    } // options to pass to fullscreen add on
});
//add limitations for map extent
var openBounds = [
    [49.00, -94.00],
    [25.00, -70.00]
] 
var extentBounds = [
    [50.00, -96.00],
    [24.00, -65.00]
] 

// define bounds of the map to prevent panning past the relevant area
map.fitBounds(openBounds); // sets the map to the bounds
map.setMaxBounds(extentBounds); // sets the max bounds that can be panned around

var baseMaps = { //variable that containts basemaps for switcher
    "Light Basemap": cartoLight, // add pp label for carto light map
    "Dark Basemap": cartoDark, // add pp label for carto dark map
    "Satellite Imagery": esriSatellite, // add pp label for Esri Satellite Map
    // "Open Street Map": osmMap, // add pp label for open street map
};
var layerControl = L.control.layers(baseMaps).addTo(map); // add layer control to map


document.getElementById("myRange").value = userYear; // report the user year to the HTML range slider
document.getElementById("userYear").innerHTML = userYear; //report userYear to HTML text


window.toggle = false; // declaring a variable for use in button to turn off the zero point locations
window.toggleState = 0 // varaible to detect the state of the button
var toggleState = 0;
var mylayer;

var slider = document.getElementById("myRange"); // declare slider and set it equal to the HTML element
var output = document.getElementById("userYear"); // declare the slider output that is used to display in the html
output.innerHTML = slider.value;

slider.oninput = function() { // define the action of the slider
    output.innerHTML = this.value; //set the value to the the one selected by the user html output
    userYear = this.value; // set the output equal the the userYear variable, determines what data is shown in the map
    updatePropSymbols(userYear); //Update the map features
};

// autoplay Slider
document.addEventListener('DOMContentLoaded', function() {
    var checkbox = document.querySelector('input[type="checkbox"]');

    checkbox.addEventListener('change', function() {
        if (checkbox.checked) {
            // do this
            playData();
            console.log('Checked');
        } else {
            // do that
            window.clearInterval(startFun)
            console.log('Not checked');
        }
    });
});

$(document).ready(
    getData
);