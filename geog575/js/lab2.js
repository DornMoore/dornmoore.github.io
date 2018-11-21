// Create encompassing function for memory cleanup
(function(){

  // define variable for updating from csv file
  var attrArray = ["Wetlands", "Open Water", "Cultivated"];
  // set the variable the map is focused on
  var focus = attrArray[1];

  // serupt default id
  var id='AE-56';

  var sourceData=[];
  var habs =[];
  var keys = [];

  //Set variables for use inthe chart inside the svg
  var margin = {top: 20, right: 20, bottom: 30, left: 40};
  //Width and height
  var w = 500;
  var h = 500;
  var width = ((window.innerWidth*0.8-w)- margin.left - margin.right);
  var height = h - margin.top-margin.bottom;

  //Set variables for use inthe chart inside the svg
  var margin = {top: 20, right: 20, bottom: 30, left: 40};
  //append group g used a a group for the chart
  
  // console.log("G is Done")

  //Create SVG element
  var map = d3.select(".map")
      .append("svg")
      // .attr("class", "map")
      .attr("width", w)
      .attr("height", h);

  var chart = d3.select(".chart")
      .append("svg")
      // .attr("class","chart")
      .attr("width", width +margin.left+margin.right)
      .attr("height", h);
      // .attr("width", chartWidth - margin.left - margin.right )
      // .attr("height", h  - margin.top - margin.bottom);

  var g = chart.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")").attr("class","group");

  window.onload = setMap();

  function setMap(){
      // var margin = {top: 20, right: 20, bottom: 30, left: 40}
    
    // Define the projection variables. Placing them here for easy changing later
    var projection = d3.geoAlbers()
        .rotate([89, 0])
        .center([0, 43])
        .parallels([40, 50])
        .scale(2000)
        .translate([w / 2, h / 2])
        .precision(.1);

    // //Create SVG element
    // var map = d3.select("body")
    //     .append("svg")
    //     .attr("class", "map")
    //     .attr("width", w)
    //     .attr("height", h);

    //Define path generator, using the Albers USA projection
    var path = d3.geoPath()
           .projection(projection);

    d3.queue()
          // .defer(d3.json, "data/us-states.json")
          .defer(d3.json, "data/hexTiles.topojson")
          .defer(d3.csv,"data/sa2_hex_data.csv", function(d, i, columns) {
            for (var i = 1, n = columns.length; i < n; ++i) d[columns[i]] = +d[columns[i]];
            return d;
          })

          .await(callback);

    function callback(error, hex, chartData){
      if(error) throw error;
      // console.log(ddata);

      habs = (chartData.columns.slice(1));

      sourceData=chartData;

      setGraticule(map, path);

      var hexs = topojson.feature(hex, hex.objects.hexTiles).features;

      var cells = map.selectAll(".sa2_hex_data")
          .data(hexs)
          .enter()
          .append("path")
          .attr("class", function(d){
            return "sa2_hex_data " + d.properties.ta_sa2_GRI;
          })
          .attr("d", path);

      //loop through csv to assign each set of csv attribute values to geojson region
      var hexData = joinData(hexs, chartData);
      // console.log(hexData);

      var colorScale = makeQuantileScale(chartData);

      setEnumerationUnits(hexData,map, path, colorScale);

      setChartArea(processData(chartData,id),keys);
      
      }; //end callback
    
    }; //end setMap()


  // set up the background graticule
  function setGraticule(map, path) {
    // Create the Graticule
    var graticule = d3.geoGraticule()
        .step([15,15]); //Set the spacing of the graticule

    var gratBackground = map.append("path")
        .datum(graticule.outline()) //bind graticule background
        .attr("class", "gratBackground") //assign class for styling
        .attr("d", path);

    var gratLines = map.selectAll(".gratLines")
        .data(graticule.lines())
        .enter()
        .append("path")
        .attr("class", "gratLines")
        .attr("d", path);
  };


  // Join data from CSV to the topojson or geojson
  function joinData(layer, csvData){
    for (var i=0; i<csvData.length; i++){
      var csvRegion = csvData[i]; //the current region
      var csvKey = csvRegion.hexID; //the CSV primary key
      

      //loop through geojson regions to find correct region
      for (var a=0; a<layer.length; a++){

        var geojsonProps = layer[a].properties; //the current region geojson properties
        var geojsonKey = geojsonProps.ta_sa2_GRI; //the geojson primary key

        //where primary keys match, transfer csv data to geojson properties object
        if (geojsonKey == csvKey){

          //assign all attributes and values
          attrArray.forEach(function(attr){
              var val = parseFloat(csvRegion[attr]); //get csv attribute value
              geojsonProps[attr] = val; //assign attribute and value to geojson properties
          });
        };
      };

    };
    // console.log(layer);
    return layer;
  };


  function makeEqualIntervalScale(data){
    var colorClasses = [
        "#eff3ff",
        "#bdd7e7",
        "#6baed6",
        "#3182bd",
        "#08519c"
    ];

    //create color scale generator
    var colorScale = d3.scaleQuantile()
        .range(colorClasses);

   //build two-value array of minimum and maximum expressed attribute values
    var minmax = [
        d3.min(data, function(d) { return parseFloat(d[focus]); }),
        d3.max(data, function(d) { return parseFloat(d[focus]); })
    ];
    //assign two-value array as scale domain
    colorScale.domain(minmax);

    return colorScale;
  };


  function setEnumerationUnits(hexs, map, path, colorScale){
    
    //add hex to map
    var regions = map.selectAll(".regions")
        .data(hexs)
        .enter()
        .append("path")
        .attr("class", function(d){
            return "regions " + d.properties.ta_sa2_GRI;
        })
        .attr("d", path)
        .style("fill", function(d){
            // return choropleth(d.properties, colorScale);
            var wet = d.properties.Wetlands * 255;
            var water = d.properties['Open Water'] * 255;
            var cult = d.properties.Cultivated*255;
            return "rgb("+cult+","+wet+","+water+")";
        })
        .on('click', function(d,i){
          d3.select('.bars')
            .style("fill", "#d7191c");
        })
        .on("mouseout", function(d){
            d3.select(this)
              .style("fill", function(d){
               var wet = d.properties.Wetlands * 255;
                var water = d.properties['Open Water'] * 255;
                var cult = d.properties.Cultivated*255;
                return "rgb("+cult+","+wet+","+water+")";
              })
        })
        .on("mouseover", function(d,i){
          d3.select(this)
            .style("fill", "yellow");
          //set the id for use next 
          id = d.properties.ta_sa2_GRI;
          // Update teh chart based on the mouseover
          update(processData(sourceData, id),keys);
        });
  };

  function makeNBScale(data){ //Natural Breaks Scale
    var colorClasses = [
        "#eff3ff",
        "#bdd7e7",
        "#6baed6",
        "#3182bd",
        "#08519c"
    ];

    //create color scale generator
    var colorScale = d3.scaleThreshold()
        .range(colorClasses);

    //build array of all values of the expressed attribute
    var domainArray = [];
    for (var i=0; i<data.length; i++){
        var val = parseFloat(data[i][focus]);
        domainArray.push(val);
    };

    //cluster data using ckmeans clustering algorithm to create natural breaks
    var clusters = ss.ckmeans(domainArray, 5);
    //reset domain array to cluster minimums
    domainArray = clusters.map(function(d){
        return d3.min(d);
    });
    //remove first value from domain array to create class breakpoints
    domainArray.shift();

    //assign array of last 4 cluster minimums as domain
    colorScale.domain(domainArray);

    return colorScale;
  };


  function makeQuantileScale(data){
    var colorClasses = [
       "#eff3ff",
        "#bdd7e7",
        "#6baed6",
        "#3182bd",
        "#08519c"
    ];

    //create color scale generator
    var colorScale = d3.scaleQuantile()
        .range(colorClasses);

    //build array of all values of the expressed attribute
    var domainArray = [];
    for (var i=0; i<data.length; i++){
        var val = parseFloat(data[i][focus]);
        domainArray.push(val);
    };

    //assign array of expressed values as scale domain
    colorScale.domain(domainArray);

    return colorScale;
  };



  function choropleth(props, colorScale){
    //make sure attribute value is a number
    var val = parseFloat(props[focus]);
    //if attribute value exists, assign a color; otherwise assign gray
    if (typeof val == 'number' && !isNaN(val)){
        return colorScale(val);
    } else {
        return "#FFF";
    };
  };



function setChartArea(data, keys){

    var x0 = d3.scaleBand() //scaleBand splits the range into n bands
        .rangeRound([0, width])
        .paddingInner(0.1)
        .paddingOuter(0.1) ; //provides a gap before start and end

    var x1 = d3.scaleBand()
        .padding(0.05);

    var y = d3.scaleLinear()
        .rangeRound([height, 0]);

    var z = d3.scaleOrdinal()
        // .range(["#d0743c", "#ff8c00"])
        .range(['rgba(125,125,125,1)','rgba(125,125,125,0.5)','#a6cee3','#1f78b4','#b2df8a','#33a02c','#fb9a99','#e31a1c','#fdbf6f','#ff7f00','#cab2d6','#6a3d9a'])
        ;

    var legend = g.append("g")
      .attr("font-family", "sans-serif")
      .attr("font-size", 14)
      .attr("text-anchor", "end")
    .selectAll("g")
    .data(keys.slice().reverse())
    .enter().append("g")
      .attr("class","legend")
      .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

  legend.append("rect")
      .attr("class", function(d){return d})
      .attr("x", width - 19)
      .attr("width", 19)
      .attr("height", 19);
      // .attr("fill", z);

  legend.append("text")
      .attr("class", "text")
      .attr("x", width - 24)
      .attr("y", 9.5)
      .attr("dy", "0.32em")
      .text(function(d) { return d; });

  // console.log(data)
  update(data, keys);
};


function processData(data, id) {
  
  myFilter = data.filter(function(d) { return d.hexID == id });


  myData=[]
  for(i=0; i< habs.length; i++){
    // myData.push(i);
    var myJson = {};
    var val =habs[i];
    myJson["Habitat"] = val;
    myJson["Regional Average"] = d3.mean(data, function(d) { return d[val]; });
    myJson["Selected Hex"] = myFilter[0][val];
    myData.push(myJson);
  }
// console.log(myData);
  myData.columns=["Habitat", "Selected Hex", "Regional Average"];

  keys = myData.columns.slice(1);
  // console.log(keys);

  return myData;
  
};


function update(data,keys){
  var x0 = d3.scaleBand() //scaleBand splits the range into n bands
      .rangeRound([0, width])
      .paddingInner(0.1)
      .paddingOuter(0.1) ; //provides a gap before start and end

  var x1 = d3.scaleBand()
      .padding(0.05);

  var y = d3.scaleLinear()
      .rangeRound([height, 0]);

  var z = d3.scaleOrdinal()
        // .range(["#d0743c", "#ff8c00"])
        .range(['rgba(125,125,125,1)','rgba(125,125,125,0.5)','#a6cee3','#1f78b4','#b2df8a','#33a02c','#fb9a99','#e31a1c','#fdbf6f','#ff7f00','#cab2d6','#6a3d9a'])
        ;

  // console.log(data[0][keys[0]]);
  x0.domain(data.map(function(d) { return d.Habitat; }));
  x1.domain(keys).rangeRound([0, x0.bandwidth()]);
  y.domain([0,1]);

  // Clear out any existing bars.
  var bars = g.selectAll(".bar")
      .remove()
      .exit();
     
  g.append("g")
    .selectAll("g")
    .data(data)
    .enter().append("g")
      .attr("transform", function(d) { return "translate(" + x0(d.Habitat) + ",0)"; })
      .attr("class",function(d) { return d.Habitat; })
    .selectAll("rect")
    .data(function(d) { return keys.map(function(key) { return {key: key, value: d[key]}; }); })
    .enter().append("rect")
      .attr("class",function(d) { return "bar "+ d.key})
      .attr("x", function(d) { return x1(d.key); })
      .attr("y", function(d) { return y(d.value); })
      .attr("width", x1.bandwidth())
      .attr("height", function(d) { return height - y(d.value); });
      // .attr("fill", function(d) { return z(d.key); });
  
  g.selectAll(".axis").remove().exit();

  g.append("g")
      .attr("class", "axis")
      .style("font-size", 14)
      .attr("transform", "translate(0," + height+ ")")
      .call(d3.axisBottom(x0));

  g.append("g")
      .attr("class", "axis")
      .style("font-size", 12)
      .call(d3.axisLeft(y).ticks(null, "s"))
    .append("text")
      .attr("x", 2)
      .attr("y", y(y.ticks().pop()) + 0.5)
      .attr("dy", "0.32em")
      .attr("fill", "#000")
      .attr("font-weight", "bold")
      .attr("text-anchor", "start")
      .text("Percent");
};

})()
