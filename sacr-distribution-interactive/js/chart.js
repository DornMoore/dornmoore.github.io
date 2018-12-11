/* Adds js logic to the chart section of the project */
/* By Dorn Moore, Jim Cunningham, & Randy Garcia */

// setup
var $graphic = $('#lat_chart_pane');
var graphic_aspect_width = 9;
var graphic_aspect_height = 5;
var mobile_threshold = 1000;

// setup
var margin = {top: 20, right: 20, bottom: 30, left: 40},
    w = 960 - margin.left - margin.right,
    h = 600 - margin.top - margin.bottom;

var parseYear = d3.timeParse("%Y");

// setup x
var xValue = function(d) { return parseInt(d.count_yr);}, // data -> value
    xScale = d3.scaleLinear().range([0, w]), // value -> display
    xMap = function(d) { return xScale(xValue(d));}, // data -> display
    xAxis = d3.axisBottom(xScale);

// setup y
var yValue = function(d) { return parseFloat(d.lat);}, // data -> value
    yScale = d3.scaleLinear().range([h, 0]), // value -> display
    yMap = function(d) { return yScale(yValue(d));}, // data -> display
    yAxis = d3.axisLeft(yScale);

// add the graph canvas to the body of the webpage
var svg = d3.select(".chart")
    .append("svg")
    .attr("width", w + margin.left + margin.right)
    .attr("height", h + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");



// add the tooltip area to the webpage
var tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

// load data
d3.queue()
  .defer(d3.csv, "data/cbc_gmc_by_year_wStdev.csv")
  .defer(d3.csv, "data/qry_cbc_count_by_year.csv")

  .await(callback);

function callback(error, gmc_data, sacr_cir) {
    if(error) throw error;

    // don't want dots overlapping axis, so add in buffer to data domain
    xScale.domain([d3.min(gmc_data, xValue)-1, d3.max(gmc_data, xValue)+1]);
    yScale.domain([d3.min(sacr_cir, yValue)-1, d3.max(sacr_cir, yValue)+1]);

    // console.log(d3.min(gmc_data[count_yr]));

    // x-axis
    svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", "translate(0," + h + ")")
        .call(xAxis.tickFormat(d3.format("")))
      .append("text")
        .attr("class", "label")
        .attr("fill", "currentColor")
        .attr("font-size", 12)
        .attr("x", w)
        .attr("y", -6)
        .style("text-anchor", "end")
        .text("Year");

    // y-axis
    svg.append("g")
        .attr("class", "y-axis")
        .call(yAxis)
      .append("text")
        .attr("class", "label")
        .attr("fill", "currentColor")
        .attr("font-size", 12)
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Latitude");

    // Create the line for the gmc
    var line = d3.line()
        .x(function(d) {return xScale(d.count_yr);})
        .y(function(d) {return yScale(d.lat);})
        .curve(d3.curveMonotoneX);

    // Create the area for the standard deviations
    var area = d3.area()
        .x(function(d) { return xScale(d.count_yr); })
        .y0(function(d) { return yScale(parseFloat(d.lat) - 1*parseFloat(d.wstdev_lat)); })
        .y1(function(d) { return yScale(parseFloat(d.lat) + 1*parseFloat(d.wstdev_lat)); })
        .curve(d3.curveMonotoneX);

    // Draw the stdev area showing the change in GMC each year.
    svg.append("path")
      .datum(gmc_data)
      .attr("class", "stDev")
      .attr("d", area)
      .style("fill", "#4682B4")
      .style("stroke", "none")
      .style("opacity","0.25");


    // draw dots for
    svg.selectAll(".cirdot")
        .data(sacr_cir)
        .enter()
        .append("circle")
        .attr("class", "cirdot")
        .attr("r", function(d){ //set the dot radius
          //use the length of the value as a proxy for classes
          return (d.num_sacr).length * 1.2;
        })
        .attr("cx", xMap)
        .attr("cy", yMap)
        .style("fill", "#C0C0C0")
        .style("stroke", "#F5F5F5")
        .style("stroke-width", "0.25")
        .on("mouseover", function(d) {
            tooltip.transition()
                .duration(100)
                .style("opacity", 0.7);
            tooltip.html(d.circle_name + "</br>"+d.num_sacr+" Cranes")
                .style("left", (50 + parseFloat(d3.select(this).attr("cx")) + "px"))
                .style("top", (30 + parseFloat(d3.select(this).attr("cy")) + "px"));
        })
        .on("mouseout", function(d) {
            tooltip.transition()
                 .duration(200)
                 .style("opacity", 0);
        });

    // Draw the line showing the change in GMC each year.
    svg.append("path")
      .datum(gmc_data)
      .attr("class", "line")
      .attr("d", line)
      .style("fill", "none")
      .style("stroke", "#ffab00")
      .style("stroke-width","3");


    // draw dots for
    svg.selectAll(".gmcdot")
        .data(gmc_data)
        .enter()
        .append("circle")
        .attr("class", "gmcdot")
        .attr("r", 2)
        .attr("cx", xMap)
        .attr("cy", yMap)
        .style("fill", "#ffab00");        ;

    // draw legend
    var legend = svg.selectAll(".legend")
        // .gmc_data(color.domain())
      .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

    // draw legend colored rectangles
    legend.append("rect")
        .attr("x", w - 18)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", "grey");

    // draw legend text
    legend.append("text")
        .attr("x", w - 24)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .text(function(d) { return d;})
};
