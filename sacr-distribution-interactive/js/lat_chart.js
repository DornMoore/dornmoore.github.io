// setup
var $graphic = $('#lat_chart_pane');
var graphic_aspect_width = 9;
var graphic_aspect_height = 5;
var mobile_threshold = 1000;

var gmc_data; // Set Global variable for GMC data
var sacr_cir; // Set Global variable for Circle data
var myYear;

var lats;

d3.queue()
        .defer(d3.csv, "data/cbc_gmc_by_year_wStdev.csv")
        .defer(d3.csv, "data/qry_cbc_count_by_year.csv")

        .await(callback);

function callback(error, gmc, cir) {
    if (error) throw error;
    gmc_data = gmc;
    sacr_cir = cir;
    yrData = d3.map(gmc_data,function(d){return d.count_yr; });

    drawLatChart();
}



function drawLatChart() {
    var margin = { top: 20, right: 40, bottom: 30, left: 40 };
    // rather than use a fixed width, check the width of the graphic’s container on the page and use that instead.
    var w = $graphic.width() - margin.left - margin.right;

    if (w < 400) { graphic_aspect_height = 9; } else if (w < 700) { graphic_aspect_height = 7; }

    // Based on that width, use the aspect ratio values to calculate what the graphic’s height should be.
    var h = Math.ceil((w * graphic_aspect_height) / graphic_aspect_width) - margin.top - margin.bottom;

    // clear out existing graphics
    $graphic.empty();

    // setup x
    var xValue = function(d) { return parseInt(d.count_yr); }, // data -> value
        xScale = d3.scaleLinear().range([0, w]), // value -> display
        xMap = function(d) { return xScale(xValue(d)); }, // data -> display
        xAxis = d3.axisBottom(xScale);

    // setup y
    var yValue = function(d) { return parseFloat(d.lat); }, // data -> value
        yScale = d3.scaleLinear().range([h, 0]), // value -> display
        yMap = function(d) { return yScale(yValue(d)); }, // data -> display
        yAxis = d3.axisLeft(yScale);

    // add the graph canvas to the body of the webpage
    var svg = d3.select("#lat_chart_pane")
        .append("svg")
        .attr("width", w + margin.left + margin.right)
        .attr("height", h + margin.top + margin.bottom)
        .attr("align", "center")
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // svg.append("text")
    //     .attr("x", (w / 2))
    //     .attr("y", 0 - (margin.top/3))
    //     .attr("text-anchor", "middle")
    //     .style("font-family", "serif")
    //     .style("font-size", "20px")
    //     .text("Average Latitude of Sandhill Cranes Recorded in Christmas Bird Count");

    // add the tooltip area to the webpage
    var tooltip = d3.select("#lat_chart_pane").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    // don't want dots overlapping axis, so add in buffer to data domain
    xScale.domain([d3.min(gmc_data, xValue) - 1, d3.max(gmc_data, xValue) + 1]);
    yScale.domain([d3.min(sacr_cir, yValue) - 1, d3.max(sacr_cir, yValue) + 1]);

    // console.log(d3.min(gmc_data[count_yr]));

    // x-axis
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + h + ")")
        .call(xAxis.tickFormat(d3.format("")))
        .append("text")
        .attr("class", "label")
        .attr("fill", "#111")
        .attr("x", w)
        .attr("y", -6)
        .style("text-anchor", "end")
        .text("Year")
        .style("font-size", "10px");

    // y-axis
    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
        .attr("class", "label")
        .attr("fill", "#111")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Latitude")
        .style("font-size", "10px");

    // Create the line for the gmc
    var line = d3.line()
        .x(function(d) { return xScale(d.count_yr); })
        .y(function(d) { return yScale(d.lat); })
        .curve(d3.curveMonotoneX);

    // Create the area for the standard deviations
    var area = d3.area()
        .x(function(d) { return xScale(d.count_yr); })
        .y0(function(d) { return yScale(parseFloat(d.lat) - 1 * parseFloat(d.wstdev_lat)); })
        .y1(function(d) { return yScale(parseFloat(d.lat) + 1 * parseFloat(d.wstdev_lat)); })
        .curve(d3.curveMonotoneX);


    // Draw the stdev area showing the change in GMC each year.
    svg.append("path")
        .datum(gmc_data)
        .attr("class", "stDev")
        .attr("d", area)
        .style("fill", "#4682B4")
        .style("stroke", "none")
        .style("opacity", "0.25");


    if (w >= 700) {
        // draw dots for
        svg.selectAll(".cirdot")
            .data(sacr_cir)
            .enter()
            .append("circle")
            .attr("class", "cirdot")
            .attr("r", function(d) { //set the dot radius
                //use the length of the value as a proxy for classes
                return (d.num_sacr).length * 1.2+0.5;
            })
            .attr("cx", xMap)
            .attr("cy", yMap)
            .style("fill", "#C0C0C0")
            .style("stroke", "#F5F5F5")
            .style("stroke-width", "0.25")
            .on("mouseover", function(d) {
                tooltip.transition()
                    .duration(200)
                    .style("opacity", 0.8);
                tooltip.html(d.circle_name + "</br>" + d.num_sacr + " Cranes")
                    /* .style("left", (d3.event.pageX + 5) + "px")
                    .style("top", (d3.event.pageY - 28) + "px"); */
                    .style("left", (50 + parseFloat(d3.select(this).attr("cx")) + "px"))
                    .style("top", (1 + parseFloat(d3.select(this).attr("cy")) + "px"));
            })
            .on("mouseout", function(d) {
                tooltip.transition()
                    .duration(400)
                    .style("opacity", 0);
            });
    }

        // Draw the line showing the change in GMC each year.
        svg.append("path")
            .datum(gmc_data)
            .attr("class", "line")
            .attr("d", line)
            .style("fill", "none")
            .style("stroke", "#E37F1C")
            .style("stroke-width", "3");


        // draw dots for
        svg.selectAll(".gmcdot")
            .data(gmc_data)
            .enter()
            .append("circle")
            .attr("class",  function(d) {
                  return "gmcdot" + xValue(d);
              })
            .attr("r", 2)
            .attr("cx", xMap)
            .attr("cy", yMap)
            .style("fill", "#ffab00");

        // draw decription for current year
        var label = svg.append("text")
            .attr("class", "labelYear")
            .attr("x", "30")
            .attr("y", "30")
            .attr("text-anchor", "left")
            .style("background-color", "white")
            .style("font-family","serif")
            .style("font-size", function(){
                if (w<350) {return "16"}
                else { return "20"}
            })
            // .style("font-weight","400")
            .style("fill","#E37F1C")
            .text(function(d){return "Mean latitude in "});

        // Use the append("tspan") to change styles withing a text element.
        label.append("tspan")
            .style("font-weight","bold")
            .text(function(d){return userYear});

        label.append("tspan")
            .style("font-weight", "normal")
            .text(" was ");

        label.append("tspan")
            .style("font-weight","bold")
            .text(function(){return parseFloat(yrData["$"+userYear].lat).toFixed(2)});


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
            .text(function(d) { return d; })
            .style("color", "black");

        updateYear(w);
    // };
}

function updateYear(w) {
    // add the tooltip area to the webpage
    var tooltip = d3.select("#lat_chart_pane").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    // add the graph canvas to the body of the webpage
    gmc_data.forEach(function(d) {
        // console.log(".gmcdot"+d.count_yr);
        d3.select("circle.gmcdot"+d.count_yr)
            .attr("r",function(d){
                // console.log(xValue(d));
                if(w<500){
                    if(d.count_yr != myYear) {return "2";} //get rid of the dot for not myYear
                else {return "4";}
                } else {
                    if(d.count_yr != myYear) {return "4";} //get rid of the dot for not myYear
                    else {return "5";}
                }
            })
            .style("fill", function(d){
                // console.log(xValue(d));
                if(d.count_yr != myYear) {return "#E37F1C";}
                else {return "#E37F1C";}
            })
            .style("stroke", function(d){
                // console.log(xValue(d));
                if(d.count_yr != myYear) {return "white";}
                else {return "black";}
            })
            .style("stroke-width", function(d){
                // console.log(xValue(d));
                if(w<600){
                    if(d.count_yr != myYear) {return "0";} //get rid of the dot for not myYear
                else {return ".5";}
                } else {
                    if(d.count_yr != myYear) {return ".5";} //get rid of the dot for not myYear
                    else {return "1";}
                }
            })
            .on("mouseover", function(d) {
                tooltip.transition()
                    .duration(200)
                    .style("opacity", 1);
                tooltip.html("The average latitude in <br><strong>"+ d.count_yr +"</strong> was <strong>" + parseFloat(d.lat).toFixed(2) +"</strong>")
                    .style("left", (50 + parseFloat(d3.select(this).attr("cx")) + "px"))
                    .style("top", (30 + parseFloat(d3.select(this).attr("cy")) + "px"));
            })
            .on("mouseout", function(d) {
                tooltip.transition()
                    .duration(400)
                    .style("opacity", 0);
            })
            .on("click", function(d){
                updateMap(d.count_yr);

            });
    })
}

function updateMap(year) {
    // Get the script lat_chart.js
    $.getScript('js/newMap.js', function() {
        userYear = year; //Update the variable myYear
        updatePropSymbols(userYear); // Run the updateYear function
    });
}
