/* Example from Leaflet Quick Start Guide*/

var map = L.map('mapid', {
	center: [20,0],
	zoom: 2,
	maxZoom: 4,
	minZoom: 2
});

// map.dragging.disable();
// map.touchZoom.disable();
// map.doubleClickZoom.disable();
// map.scrollWheelZoom.disable();

//add tile layer...replace project id and accessToken with your own
L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Data from World Bank. Base Layer by <a href="http://mapbox.com">Mapbox</a>',
    //Use the light theme for the map layers
    id: 'light-v9',
    accessToken: 'pk.eyJ1IjoiZG9ybm1vb3JlIiwiYSI6ImNpc2h3MHdmbDAwOGEyb2xzenV5aDNmaGoifQ.kuZDCRIvE_BQbpUl6KxwbQ'
}).addTo(map);

