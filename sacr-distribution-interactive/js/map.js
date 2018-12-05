//initialize map
//this is for a test commit

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

// I worry about licensing on this one. Might need to find an alternative, I know it is free for school projects but the ICF project part gets meerky
var esriSatellite = L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
}); // var that holds the leaflet defenition for Esri Basemap

$(document).ready(function(){
    $('[data-toggle="tooltip"]').tooltip();   
});

var cbcDataByYear = { 'Empty': L.tileLayer('') };

// define map variable that sets the properties of the map
var map = L.map('map', {
    // center: [38.0, -95.79], //center of the map, near center of data
    zoom: 4, // level of initial zoom defined
    maxZoom: 6,
    minZoom: 4,
    zoomSnap: 0.5,
    layers: [cartoLight], // initial layers to be added to the map
    fullscreenControl: true,
    fullscreenControlOptions: {
        position: 'topleft'
    }
});

//add limitations for map extent
var bounds = [[49.00,-94.00], [25.00,-70.00]]
map.fitBounds(bounds);
map.setMaxBounds(bounds);

var baseMaps = { //variable that containts basemaps for switcher
    "Light Basemap": cartoLight, // add pp label for carto light map
    "Dark Basemap": cartoDark, // add pp label for carto dark map
    "Satellite Imagery": esriSatellite, // add pp label for Esri Satellite Map
    // "Open Street Map": osmMap, // add pp label for open street map
};

var states = new L.GeoJSON.AJAX("data/EPstates.geojson", {
    iconURL: "lib/images/layers.png",
    style: {
        fillOpacity: 0,
        color: "#c0c0c0",
        weight: 1
    },
    onEachFeature: function(feature, layer) {
        content = "<b>Name: " + feature.properties.NAME;
        layer.bindPopup(content);
        //popName.push(feature.properties.circle_name);
    }}).addTo(map);


var zeroCountIcon = L.icon({
    iconUrl: 'img/x_gray.png',
    iconSize: [6, 6], // size of the icon // size of the shadow
});

var slider = document.getElementById("myRange");
var output = document.getElementById("userYear");
output.innerHTML = slider.value;

slider.oninput = function() {
    output.innerHTML = this.value;
    userYear = this.value;
    map.removeLayer(cbcDataByYear);
    // call the update function in the charts.js to add affordances
    $.getScript('js/charts.js', function () {          
        updateCharts(userYear);  
    });   
    addData();
};
var layerControl = L.control.layers(baseMaps).addTo(map); // add layer control to map


function addData() {
    window.cbcDataByYear = new L.GeoJSON.AJAX("data/cbcCircleDataByYear.geojson", {
        iconURL: "lib/images/layers.png",
        onEachFeature: function(feature, layer) {
            content = "<b>Place: " + feature.properties.circle_name + " \
                            <br><b>Count: </b> " +"<font color='red'>" +feature.properties[userYear] + "</font>" +" \
                            <br><b>Year: </b> " + userYear;
            layer.bindTooltip(content);
            //popName.push(feature.properties.circle_name);
        },
        pointToLayer: function(feature, layer) {
            var scaleFactor = .01;
            //consider switching the radidus to a scaled classification (eg 0-100 =x 101-500 = y... )
            var radiusFactor = feature.properties[userYear] * scaleFactor;
            if(radiusFactor < 3){radiusFactor=3};
            return L.circleMarker(layer, {
                fillColor: 'orange',
                color: 'white',
                weight: 1,
                fillOpacity: .4,
                radius: radiusFactor
            })

        },
        filter: function(feature, layer) {
            return (feature.properties[userYear] > 0 && feature.properties[userYear] !== null)
        },
    });
    //cbcDataByYear.on('data:loaded', function() {console.log(popName)});
    cbcDataByYear.addTo(map);
     cbcDataByYear.bringToFront();
};

function addZero() {
    window.cbcDataZeroItems = new L.GeoJSON.AJAX("data/cbcCircleDataByYear.geojson", {
        iconURL: "lib/images/layers.png",
        onEachFeature: function(feature, layer) {
            content = "<b>Place: " + feature.properties.circle_name + " \
                            <br><b>Count: </b> " +"<font color='red'>" +feature.properties[userYear] + "</font>" + " \
                            <br><b>Year: </b> " + userYear;
            layer.bindTooltip(content);
            //popName.push(feature.properties.circle_name);
        },
        pointToLayer: function(feature, layer) {
            var scaleFactor = .01;
            var radiusFactor = feature.properties[userYear] * scaleFactor;
            /* return L.marker(layer, {
                icon: zeroCountIcon
            }); */
            return L.circleMarker(layer, {
                fillColor: 'white',
                color: 'gray',
                weight: 0.5,
                fillOpacity: 1,
                radius: 2
            })
        },
        filter: function(feature, layer) {
            return (feature.properties[userYear] == 0)
        }
    });
    //cbcDataByYear.on('data:loaded', function() {console.log(popName)});
    //cbcDataZeroItems.addTo(map);
};

addZero();
addData();

var userYear = 2012; //Set to 2012 for our testeing purposes - will want at 1965 for final?
document.getElementById("myRange").value = userYear;
document.getElementById("userYear").innerHTML = userYear;
var dataYears = [];
for (var i = 1965; i <= 2012; i++) {
    dataYears.push(i);
}

function buttonForward() {
    if (1965 <= userYear && userYear < 2012) {
        userYear == userYear++;
        document.getElementById("userYear").innerHTML = userYear;
        document.getElementById("dataText").innerHTML = "";
        map.removeLayer(cbcDataByYear);
        addData();
        cbcDataByYear.bringToFront();
        document.getElementById("myRange").value = userYear;
        //document.getElementById('range').range = userYear;
    } else {
        document.getElementById("dataText").innerHTML = "2012 is the latest year with data"
    }
};

function buttonBack() {
    if (2012 >= userYear && userYear > 1965) {
        userYear == userYear--;
        document.getElementById("userYear").innerHTML = userYear;
        document.getElementById("dataText").innerHTML = "";
        map.removeLayer(cbcDataByYear);
        document.getElementById("myRange").value = userYear;
        addData()
        cbcDataByYear.bringToFront();
        //document.getElementById('range').range = userYear;
    } else {
        document.getElementById("dataText").innerHTML = "1965 is the earliest year with data";
    }
};

function playData(){
/*     userYear = yearOnStart;
 */    window.startFun = window.setInterval(function () {
        buttonForward();
        if (userYear == 2012){
            userYear = 1965;
        };
      }, 300);
};

window.toggle = false;
function togglePoints() {
    if(!toggle) {
      map.addLayer(cbcDataZeroItems);
    } else {
      map.removeLayer(cbcDataZeroItems);
    }
    toggle = !toggle;
  };

/*   document.addEventListener('DOMContentLoaded', function () {
    var checkbox = document.querySelector('input[type="checkbox"]');
  
    checkbox.addEventListener('change', function () {
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
  }); */

  var toggle = L.easyButton({
    states: [{
      stateName: 'startPlay',
      icon: 'fa fa-play',
      title: 'start autoplay',
      onClick: function(control) {
        playData();
        console.log('start');
        control.state('endPlay');
      }
    }, {
      icon: 'fa fa-pause',
      stateName: 'endPlay',
      onClick: function(control) {
        window.clearInterval(startFun);
        console.log('stop');
        control.state('startPlay');
      },
      title: 'stop autoplay'
    }]
  });
  toggle.addTo(map);