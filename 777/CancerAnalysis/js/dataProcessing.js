// This Script handles the geoprocessing of data for the Cancer Analysis App.
// Dorn Moore for geog777 Spring 2019
// dorn@savingcranes.org

console.log("Loaded dataProcessing.js")
// Need to rename this.
function getFile(file){
  // Get the file - it should exist by the time this function is called.
  var idw = fs.readFile(file, function read(err, data){
    if (err) throw err;
    return data=JSON.parse(data);
    // res.send(data);
  })
  
  // Pull the data for the census tracts
  console.log("Pull the data for the census tracts");
  var ct = JSON.parse(fs.readFileSync("public/geodata/cancer_tracts.geojson"));
  // console.log(ct);
  turf.featureEach(ct, function(ct){
    var centroid = turf.centroid(ct);
    // var target = turf.point(centroid);
    
    // Right now, this is broken.
    // var nearest = turf.nearestPoint(centroid, idw);
    // console.log(nearest);
    console.log(centroid);
  })
  // var ctJSON = JSON.parse(ct);
}