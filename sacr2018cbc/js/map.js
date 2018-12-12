// mpa.js created by Randy Garcia www.randygarcia.xyz
//initialize map

//var sliderControl = null;
var osmMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}); // var that holds the leaflet defenition for OSM

var cartoDark = L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png', {
    attribution: 'Map tiles by Carto, under CC BY 3.0. Data by OpenStreetMap, under ODbL.'
}); // var that holds the leaflet defenition for carto dark basemap

var cartoLight = L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png', {
    attribution: 'Map tiles by Carto, under CC BY 3.0. Data by OpenStreetMap, under ODbL.'
}); // var that holds the leaflet defenition for carto light basemap

var esriSatellite = L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
}); // var that holds the leaflet defenition for Esri Basemap

$(document).ready(function() {
    $('[data-toggle="tooltip"]').tooltip();
}); // jquery that enables bootstrap tooltips


var cbcDataByYear = { 'Empty': L.tileLayer('') }; // declaring e,pty leaflet layer, avoids issues with logic of var not being avaialble

// define map variable that sets the properties of the map
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
var bounds = [
    [49.00, -94.00],
    [25.00, -70.00]
] // define bounds of the map to prevent panning past the relevant area
map.fitBounds(bounds); // sets the map to the bounds
map.setMaxBounds(bounds); // sets the max bounds that can be panned around

var baseMaps = { //variable that containts basemaps for switcher
    "Light Basemap": cartoLight, // add pp label for carto light map
    "Dark Basemap": cartoDark, // add pp label for carto dark map
    "Satellite Imagery": esriSatellite, // add pp label for Esri Satellite Map
    // "Open Street Map": osmMap, // add pp label for open street map
};

//use ajax to read geojson that contains the data for states
var states = new L.GeoJSON.AJAX("data/EPstates.geojson", {
    style: { // add style options to layer
        fillOpacity: 0, //fill opacity
        color: "#c0c0c0", //outline color
        weight: 1 // line weight
    },
    onEachFeature: function(feature, layer) { // binding data to a tool tip that is bound to each object
        content = "<b>Name: " + feature.properties.NAME;
        layer.bindPopup(content);
    }
}).addTo(map); // add to leaflet map


var slider = document.getElementById("myRange"); // declare slider and set it equal to the HTML element
var output = document.getElementById("userYear"); // declare the slider output that is used to display in the html
output.innerHTML = slider.value;

slider.oninput = function() { // define the action of the slider
    output.innerHTML = this.value; //set the value to the the one selected by the user html output
    userYear = this.value; // set the output equal the the userYear variable, determines what data is shown in the map
    updateMap(); //Update the map features
    // map.removeLayer(cbcDataByYear); // remove the prviously shown layer in prep to add a new one
    // // call the update function in the charts.js to add affordances
    // updateLatChart(); // update the Average Latitude Chart to indicate year
    // addData(); // run the addData function that deterimines what is added to the map based on userYear
};
var layerControl = L.control.layers(baseMaps).addTo(map); // add layer control to map

// get all the values in the dataset to create a Jenks Natural Breaks Classification for all data 
var classRanges =[] 
$.getJSON('data/cbcCircleDataByYear_new.geojson', function(data){
    var items = []; 
    var uValues = []; 

    // console.log(data.features)
    $.each(data.features, function(i,feature){
        y = 1965;
        while (y<2013) {
            if (feature.properties[y]>0){
        items.push(feature.properties[y]);}
        y++
    }})
    // console.log(items);
    
    // Seventh serie
    serie7 = new geostats(items);

    var j = serie7.getClassJenks(5)
    var ranges=serie7.ranges
    console.log(j);
    classRanges=j
})

console.log(classRanges)

function addData() { // add data function that sets the data added to the map and how they are displayed
    window.cbcDataByYear = new L.GeoJSON.AJAX("data/cbcCircleDataByYear.geojson", { //ajax request for geojson
        onEachFeature: function(feature, layer) { // function that binds data to the tooltip for each object
            content = "<b>Place: " + feature.properties.circle_name + " \
                            <br><b>Count: </b> " + "<font color='red'>" + feature.properties[userYear] + "</font>" + " \
                            <br><b>Year: </b> " + userYear;
            layer.bindTooltip(content);
            //popName.push(feature.properties.circle_name);
        },
        pointToLayer: function(feature, layer) { // function that defines the color and size of the icons based on the data
            var scaleFactor = .004; // what to sclae the data by
            var radiusFactor = feature.properties[userYear] * scaleFactor; // use the data to craete a radius


            // if (radiusFactor < 3) { radiusFactor = 3 }; // limiting the max size of the radius
            //Natural Breaks Classification for Circles - currently breaks are hard coded.
            if (feature.properties[userYear]==1){
                radiusFactor=2
            } else if (feature.properties[userYear]<=534){
                radiusFactor=3
            } else if (feature.properties[userYear]<=2071){
                radiusFactor=6
            } else if (feature.properties[userYear]<=4585){
                radiusFactor=12
            }else if (feature.properties[userYear]<=8788){
                radiusFactor=24
            } else {radiusFactor = 50}
            return L.circleMarker(layer, { // create circle marker symbol
                fillColor: 'purple',
                color: 'white',
                weight: 1,
                fillOpacity: .4,
                radius: radiusFactor
            })

        },
        filter: function(feature, layer) { // only grab points that have a count greater than zero
            return (feature.properties[userYear] > 0 && feature.properties[userYear] !== null)
        },
    });
    //cbcDataByYear.on('data:loaded', function() {console.log(popName)});
    cbcDataByYear.addTo(map); // add data to map
    cbcDataByYear.bringToFront(); // bring the objects to the front
};

function addZero() { // same as the above function but for points with a value of zero
    window.cbcDataZeroItems = new L.GeoJSON.AJAX("data/cbcCircleDataByYear.geojson", { //ajax request for geojson
        onEachFeature: function(feature, layer) { //function that binds data to a tooltip for each point
            content = "<b>Place: " + feature.properties.circle_name + " \
                            <br><b>Count: </b> " + "<font color='red'>" + feature.properties[userYear] + "</font>" + " \
                            <br><b>Year: </b> " + userYear;
            layer.bindTooltip(content);
            //popName.push(feature.properties.circle_name);
        },
        pointToLayer: function(feature, layer) { // set the visual properties for each point, all the same for this
            return L.circleMarker(layer, {
                fillColor: 'white',
                color: 'gray',
                weight: 0.5,
                fillOpacity: 1,
                radius: 2
            })
        },
        filter: function(feature, layer) { // only select objects whose count is zero
            return (feature.properties[userYear] == 0)
        }
    });
    //cbcDataByYear.on('data:loaded', function() {console.log(popName)});
    cbcDataZeroItems.addTo(map);
};

addZero(); //run the zero item function
map.removeLayer(cbcDataZeroItems); //remove the layers with the no count locations

addData(); //run the cbc count function

window.toggle = false; // declaring a variable for use in button to turn off the zero point locations
window.toggleState = 0 // varaible to detect the state of the button

function togglePoints() { //funcion that performs an on or off of data based on its state
    if (!toggle) {
        map.removeLayer(cbcDataZeroItems); // remove the data is button is selected a second time
        toggleState = 0 //reports a toggle state for use later
    } else {
        map.addLayer(cbcDataZeroItems); // add data if button is selected
        toggleState = 1 //reports toggle state for use later
    }
    toggle = !toggle; // want toggle to return false to restar the button actions 
};



var userYear = 2012; //set the intial user year to 2012 
document.getElementById("myRange").value = userYear; // report the user year to the HTML range slider
document.getElementById("userYear").innerHTML = userYear; //report userYear to HTML text


function togglePlay() { // function that plays nicely with the play button, allows me to tell if the user has switched to on and readd the data when necessary
    if (toggleState == 1) {
        map.removeLayer(cbcDataZeroItems);
        map.addLayer(cbcDataZeroItems);
    } else { // do nothing if the state is zero
        console.log('0');
    }
}
//testline to delete
function buttonForward() { // defines what should happen when the user selects the forward button
    if (1965 <= userYear && userYear < 2012) { // what to do if the selection is whithin bounds of the data
        userYear == userYear++; // increment the userYear var
        updateMap(); //Update the map features
    } else { // if the data is out of bounds let the user know it is so and don't increment the data userYear var
        document.getElementById("dataText").innerHTML = "2012 is the latest year with data"
    }
};

function buttonBack() { // does the same as obove but in reverse for the back button
    if (2012 >= userYear && userYear > 1965) { // what to do if the selection is whithin bounds of the data
        userYear == userYear--; // step the useryear var down one each time
        updateMap(); //Update the map features
    } else { //if the user goes out of the data bounds report that and don't allow for it to be incremented.
        document.getElementById("dataText").innerHTML = "1965 is the earliest year with data";
    }
};

function playData() { // function that progresses through the data automaticlay
    window.startFun = window.setInterval(function() { //sets 400ms as the time to increment through the data
        buttonForward(); //run button forward function to progress through the data
        togglePlay(); // run teh play button for the toggle of zero data
        if (userYear == 2012) { // if the reach 2012 set it back to the begining to create a loop
            userYear = 1965;
        };
    }, 600);//time interval
};

var toggle = L.easyButton({ // add leaflet easy button to the map as a way to play the data
    states: [{ //button is a toggle and performs two seperate actions based on the order of the click
        stateName: 'startPlay', //name state
        icon: 'fa fa-play', //play icon
        title: 'start autoplay', //naming the button
        onClick: function(control) { //runt the autoplay of the data
            playData();
            control.state('endPlay'); //progresses the button to the second state after clicked initially
        }
    }, {
        icon: 'fa fa-pause', //pause icon
        stateName: 'endPlay', //name the state
        onClick: function(control) { //stop the autoplay of the data
            window.clearInterval(startFun); //return to original state
            control.state('startPlay'); //return the button to its orginial state of play
        },
        title: 'stop autoplay' //name the button in tooltip
    }]
});
toggle.addTo(map); //add the toggle easy button to the map

function updateLatChart() {
    // Get the script lat_chart.js
    $.getScript('js/lat_chart.js', function() {
        myYear = userYear; //Update the variable myYear
        updateYear(); // Run the updateYear function
    });
};

function updateMap() {
    document.getElementById("userYear").innerHTML = userYear; // report the user year var
    map.removeLayer(cbcDataByYear); // remove the data in the map
    if (toggleState == 1) { // if the user has turned on the display for locaton with a count of zero, also show them changing
        map.removeLayer(cbcDataZeroItems); //remove the layer
        addZero(); //run the functon that adds them to the map
    }
    addData(); // run the function that adds the data to the map
    cbcDataByYear.bringToFront(); //bring the items to the top of the leaflet map.
    document.getElementById("myRange").value = userYear; //report the user year to the range slider so it stays in sync with the buttons
    updateLatChart(); // update the Average Latitude Chart to indicate year
};

