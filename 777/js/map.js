// Main Mapping Script.
// Created by Dorn Moore, International Crane Foundation
// dorn@savingcranes.org
// Last Updated: 2019-02-27

// Setup some Global Variables
// ----------------------------
// Initialize the Power Variable.
var power = 2.0;
//  Initialize the cell size
var cell = 10.0;

// initialize the IDW parameters
var idwParameters = {
    gridType: 'point',
    property: "nitr_ran",
    units: "kilometers",
    weight: power
};

var gj = []; // We'll use this a lot as our working geojson


var firstSymbolId;  // To store the MapBox Label ID
var tracts; // To store the tracts data
var wells; // To store the well data


// Some Functions to handle the Interface
// --------------------------------------

$(function() {
    // Settings for the Interpolation Power Slider
    $("#powerslider").slider({
        value: 2,
        min: 1,
        max: 10,
        step: 0.1,
        slide: function(event, ui) {
            $("#idwPower").val(ui.value);
        }
    });
    $("#idwPower").val($("#powerslider").slider("value"));

    // Settings for the Cell Size Slider
    $("#cellslider").slider({
        value: 10,
        min: 2.5,
        max: 25,
        step: 2.5,
        slide: function(event, ui) {
            $("#idwCell").val(ui.value);
        }
    });
    $("#idwCell").val($("#cellslider").slider("value"));
});


// Resize the description box so the popups work under it 
function resizeDescription() {
    var fullHeight = $('.description').css('height');
    $('.ui-inner-container').css('height', function() {
        return fullHeight;
    });
}


// Toggle map layers and their legends witht he checkboxes
function toggleLayers(map, layerID) {
    if (map.getLayoutProperty(layerID, 'visibility') === 'visible') {
        $("#" + layerID).prop('checked', false);
        map.setLayoutProperty(layerID, 'visibility', 'none');
        $('#' + layerID + '-legend').hide();
    } else {
        $("#" + layerID).prop('checked', true);
        map.setLayoutProperty(layerID, 'visibility', 'visible');
        $('#' + layerID + '-legend').show();
    }
}


// Turn layers off - used when calcualting the idw to clear the screen for display
function layerOff(map, layerID) {
    $("#" + layerID).prop('checked', false); // uncheck the box
    map.setLayoutProperty(layerID, 'visibility', 'none'); // Turn off the layer on the map
    $('#' + layerID + '-legend').hide(); // Turn off the legend
}


// Use to completely remove a layer - sp. IDW before re-calculating
function removeLayers(map, layer) {
    // console.log(layer)
    try {
        var mapLayer = map.getLayer(layer);

        if (typeof mapLayer !== 'undefined') {
            // Remove map layer & source.
            map.removeLayer(layer).removeSource(layer);
        }
    } catch (err) {}
}


// Calculate range of values for scaling
function minMax(items) {
    return [ss.min(items), ss.max(items)];
}


// Helper function to assing colors and place the hex value in the geojson.
function assignColors(fc, val, scale, range) {
    // Use this function to assign values for colors. 
    //  built to enable quick update of values when features change and to 
    //  facilitate layers matching one another

    // If the user doesn't provide a range, calculate the range of values
    var vals = []
    turf.featureEach(fc, function(each) {
        vals.push(each.properties[val]);
    });

    if (!range) {
        range = minMax(vals);
    }

    var min = ss.min(vals)
    var max = ss.max(vals)
    var mean = ss.mean(vals);
    var sd = ss.standardDeviation(vals)

    console.log(val + "\nmin: " + min + "\nmean: " + mean + "\nsd: " + sd + "\nmax: " + max)

    var colorScale;
    if (val != "residual") {
        if (!scale) { //Default Scale if none provided
            colorScale = chroma
                .scale(['#fff', '#000'])
                .domain([range[0], range[1]])
                // .domain(chroma.limits(vals, 'e', 10))
            ;
        } else { // script provided a scale - this would potentially allow user to switch scales.
            colorScale = chroma
                .scale(scale)
                // .scale('OrRd')
                // .classes([mean - (3 * sd), mean + (3 * sd)])
                // .classes(chroma.limits(vals, 'q', 6))
                // .padding(-0.15)
                .domain([range[0], range[1]])
                // .domain(chroma.limits(vals, 'e', 10))
            ;
        }
    } else {
        colorScale = chroma
            .scale(['#b2182b', '#ef8a62', '#fddbc7', '#d1e5f0', '#67a9cf', '#2166ac'])
            // .scale('OrRd')
            // .classes([max, mean + (3 * sd), mean - (0.25 * sd), min])
            .classes([min, mean - (2.5 * sd), mean - (1.5 * sd), mean - (0.5 * sd), mean + (0.5 * sd), mean + (1.5 * sd), mean + (2.5 * sd), max]);
    }

    // REFACTOR?
    // Sets the outline propery for the layer, really only need this for point though
    turf.featureEach(fc, function(each) {
        var value = each.properties[val]
        var outline;
        // console.log(chroma(colorScale(value).hex()).get("lab.l"));
        if (chroma(colorScale(value).hex()).get("lab.l") > 55) {
            outline = "#808080"
        } else {
            outline = "#bfbfbf"
        }

        each.properties[val + "Color"] = colorScale(value).hex();
        each.properties[val + "Outline"] = outline;
    })
}

// Load our data at the start.
function loadBaseData(token) {
    $.getJSON("geodata/well_nitrate.geojson", function(nitrateJSON) {
        wells = nitrateJSON;
        // ['#fcfbfd', '#3f007d']
        assignColors(wells, "nitr_ran", ['#fcfbfd', '#f0f']);

        $.getJSON("geodata/cancer_tracts.geojson", function(cancer_tracts) {
            tracts = cancer_tracts;
            assignColors(tracts, "canrate", ['#fff5eb', '#d94801']);

            loadComplete();
        })
    })

    function loadComplete() {
        drawMap('map', token);
    }
}

function popupProperties(map, layerID, desc, prop) {
    // Create a popup for Nitrates, but don't add it to the map yet.
    var popup = new mapboxgl.Popup({
        closeButton: false
    });

    map.on('mousemove', layerID, function(e) {
        // Change the cursor style as a UI indicator.
        map.getCanvas().style.cursor = 'pointer';

        // Populate the popup and set its coordinates based on the feature.
        var feature = e.features[0];
        popup.setLngLat(e.lngLat)
            .setHTML(e.features.map(function(feature) {
                return desc + '<br/>' + feature.properties[prop] + '<br /> '
            }))
            .addTo(map);
    });
    map.on('mouseleave', layerID, function() {
        map.getCanvas().style.cursor = '';
        popup.remove();
    });
}

// Draw the map on the Landing page
function drawMap(mapContainer, token) {

    mapboxgl.accessToken = token;
    var bounds = new mapboxgl.LngLatBounds();
    // Use turf.js to get the bounding box
    bounds = turf.bbox(tracts);

    var map = new mapboxgl.Map({
        container: mapContainer,
        style: 'mapbox://styles/mapbox/light-v9', // replace this with your style URL
        fitBounds: bounds,
        maxZoom: 12,
        attributionControl: false,
        // maxBounds: maxBounds
    });

    map.fitBounds(bounds, {
        // Add some padding to make sure all the dots show.
        padding: { top: 40, bottom: 40, left: 320, right: 20 }
    });

    // Add zoom and rotation controls to the map.
    map.addControl(new mapboxgl.NavigationControl());


    // Create a popup for Nitrates, but don't add it to the map yet.
    var popupNitrate = new mapboxgl.Popup({
        closeButton: false
    });
    // Create a popup for wells, but don't add it to the map yet.
    var popupWells = new mapboxgl.Popup({
        closeButton: false
    });


    map.on('load', function() {
        var layers = map.getStyle().layers;
        // Find the index of the first symbol layer in the map style so we can put stuff under it

        for (var i = 0; i < layers.length; i++) {
            if (layers[i].type === 'symbol') {
                firstSymbolId = layers[i].id;
                break;
            }
        }

        // Add the layer once the asynchrounous task is done.
        map.addSource("tracts", {
            type: "geojson",
            data: tracts
        });

        map.addLayer({
            visibility: 'visible',
            id: "tracts",
            type: "fill",
            source: "tracts",
            layout: {
                'visibility': 'none'
            },
            paint: {
                'fill-color': ["get", "canrateColor"],
                'fill-outline-color': "white",
                'fill-opacity': 0.65
            }
        }, firstSymbolId);

        // Set the inital visibility
        $("#tracts").prop('checked', false);

        // Call function to draw popup
        popupProperties(map, "tracts", "<strong>Cancer Rate: </strong>", "canrate")

        // Add the layer once the asynchrounous task is done.
        map.addSource("wells", {
            type: "geojson",
            data: wells
        });

        function checkLuminance(fill) {
            if (chroma(fill).get('lab.l') > .65) {
                return '#666666'
            } else {
                return '#333333'
            }
        }

        map.addLayer({
            id: "wells",
            type: "circle",
            source: "wells",
            layout: {
                'visibility': 'visible'
            },
            paint: {
                'circle-radius': 3,
                'circle-color': ["get", "nitr_ranColor"],
                'circle-opacity': 1,
                'circle-stroke-color': ["get", "nitr_ranOutline"],
                'circle-stroke-width': 1,
                'circle-stroke-opacity': .9

            }
        });
        $("#wells").prop('checked', true);

        // toggle layers when box is checked
        $("#wells").change(function() {
            toggleLayers(map, 'wells');
        })

        $("#tracts").change(function() {
            toggleLayers(map, 'tracts');
        })

        $("#residuals").change(function() {
            toggleLayers(map, 'residuals');
        })
        $("#predicted").change(function() {
            toggleLayers(map, 'predicted');
        })
    });


    // Call function to draw popup
    // popupProperties(map, "residuals", "<strong>Predicted value - Observed Value</strong><br><em>negative number indicates model under estimate</em> ", "residualColor")


    $(window).resize(function() {
        resizeDescription();
    });

    $(document).ready(function() {
        resizeDescription();

        $("#idwRecalculate").click(function() {
            cell = $("#idwCell").val()
            var power = $("#idwPower").val()
            power = parseFloat(power);
            var idwParameters = {
                gridType: 'point',
                property: "nitr_ran",
                units: "kilometers",
                weight: power
            }
            $(".overlay").show();
            $("#spinner").show();
            genIDW(wells, cell, idwParameters, gj, map);

        })

    });
};


// Generate the IDW values
function genIDW(points, cell, parameters, gj, map) {

    // Dim the background and display the Spinner.
    $(".overlay").show();
    $("#spinner").show();

    // Clear any existing values in the gj 
    gj = [];
        // Create a regression array to run the regression with
    var regressionArray = [];
    var vals = [];

    // Remove Layers and trun off others

    removeLayers(map, 'residuals');
    layerOff(map, 'wells');
    layerOff(map, 'tracts');

    // Load the well data 
    $.getJSON("geodata/well_nitrate.geojson", function(nitrateJSON) {

        // Interpolate values based on the cell size and powr provided
        var idw = turf.interpolate(nitrateJSON, cell, parameters);

        // Load the data for the census tracts
        $.getJSON("geodata/cancer_tracts.geojson", function(cts) {

            // Cycle through features and generate values
            turf.featureEach(cts, function(ct) {
                // turf/collect requires the polygon to be a FC
                ct_fc = turf.featureCollection([ct]);

                var agg = turf.collect(ct_fc, idw, "nitr_ran", "nitr_ran_val");

                // Create array of values collected
                var arr = agg.features[0].properties['nitr_ran_val'];

                // if our array of idw points comes back with values, average them
                if (arr.length > 0) {
                    ct.properties.avg_nit = ss.mean(arr);
                    // set the nitr_ran_val to the count used.
                    ct.properties.nitr_pt_count = arr.length;
                    // Push the data to my place holder
                    gj.push(ct);

                } else { // If array array of idw points is empty, use nearest value

                    // find the center of mass of the tract
                    var targetPoint = turf.centerOfMass(ct);
                    // find the nearest point to the center of mass of the tract
                    var nearest = turf.nearestPoint(targetPoint, idw);

                    // Set teh value to match the nearest point
                    ct.properties.avg_nit = nearest.properties.nitr_ran;
                    // Set the count of averaged values to zero
                    ct.properties.nitr_ran_count = 0;
                    // Store the distance to the point used from the centroid
                    ct.properties.nearpt = nearest.properties.distanceToPoint;
                    // Push the data to my place holder 
                    gj.push(ct);

                }
                // push the interpolated nitrate value and the cancer rate to ta regression array
                regressionArray.push([ct.properties.avg_nit, ct.properties.canrate])

            })

            var lr = ss.linearRegression(regressionArray);
            var lrl = ss.linearRegressionLine(lr);

            // Let's get the r2 of this thing
            var rs = ss.rSquared(regressionArray, lrl);


            // Convert this to a feature collection
            gj = turf.featureCollection(gj);
            // add predicted cancer rate to gj
            turf.featureEach(gj, function(gj) {
                var prediction = lrl(gj.properties.avg_nit)
                gj.properties.pred_canrate = prediction;
                gj.properties.residual = (prediction - gj.properties.canrate);
                vals.push(gj.properties.residual);
            });

            // Call function to draw popup
            var min = ss.min(vals);
            var max = ss.max(vals);
            var mean = ss.mean(vals);
            var sd = ss.standardDeviation(vals);


            // Assign colors to the data and store values in geojson
            //  No great reason to do it this way but found it easier than getting
            //  Mapbox to work the way I wanted it to. It make the geojson larger but it appears to work.
            assignColors(gj, 'avg_nit');
            assignColors(gj, 'pred_canrate');
            assignColors(gj, 'residual')

            // Add the layer once the asynchrounous task is done.
            map.addSource("residuals", {
                type: "geojson",
                data: gj
            });

            map.addLayer({
                id: "residuals",
                type: "fill",
                layout: {
                    'visibility': 'none'
                },
                source: "residuals",
                paint: {
                    'fill-color': ["get", "residualColor"],
                    'fill-outline-color': "light gray",
                    'fill-opacity': 0.65
                }
            }, firstSymbolId); // Put the layer under the MapBox Labels - We got this value earlier

            // Call function to draw popup
            // popupProperties(map, "residuals", "<strong>Predicted value - Observed Value</strong><br><em>negative number indicates model under estimate</em> ", "residualColor")
            residualProperties(map);
            function residualProperties(map) {
                // Create a popup for Nitrates, but don't add it to the map yet.
                var popup = new mapboxgl.Popup({
                    closeButton: false
                });
            
                map.on('mousemove', "residuals", function(e) {
                    // Change the cursor style as a UI indicator.
                    map.getCanvas().style.cursor = 'pointer';
            
                    // Populate the popup and set its coordinates based on the feature.
                    // var feature = e.features[0];
                    popup.setLngLat(e.lngLat)
                        .setHTML(e.features.map(function(feature) {
                            var desc = '';
                            var color = feature.properties.residualColor;
                            var group = (feature.properties.residual - mean )/sd;
                            if (group > 0.5){
                                desc += 'The model <strong><font style="color:'+color+';">under estimates</font></strong> the <br/>observed Cancer rate by <br/>'
                            } else if (group <-0.5) {
                                desc += 'The model <strong><font style="color:'+color+';">over estimates</font></strong> the <br/>observed cancer rate by <br/>'
                            } else { 
                                desc = 'The model estimate matches observed <br>cancer rate within <b>1 standard deviation</b><br/>.'};

                            if (Math.abs(group)>0.5  && Math.abs(group) <=1.5){ 
                                desc += '<b><font style="color:'+color+';">0.5 to 1.5 standard deviations.</b></font>'
                            } else if (Math.abs(group)>1.5  && Math.abs(group) <=2.5){
                                desc+='<b><font style="color:'+color+';">1.5 to 2.5 standard deviations.</b></font>'
                            } else if (Math.abs(group)>2.5){
                                desc += '<b><font style="color:'+color+';">more than 2.5 standard deviations.</b></font>'
                            };

                            return '<strong>Model Fit</strong><br/>' + desc + '<br /> '
                        }))
                        .addTo(map);
                });
                map.on('mouseleave', "residuals", function() {
                    map.getCanvas().style.cursor = '';
                    popup.remove();
                });
            }

            // Show the Layer Control
            $("label#residuals").show();
            $("input#residuals").show();
            toggleLayers(map, 'residuals');

            // Hide the Spinner
            $("#spinner").hide();
            $(".overlay").hide();
            // console.log(data)

        })

    });
};