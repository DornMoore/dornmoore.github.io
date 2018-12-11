/* Adds js logic to the chart section of the project */
/* By Dorn Moore, Jim Cunningham, & Randy Garcia */

// setup
var $graphic = $('#lat_chart_pane');
var graphic_aspect_width = 9;
var graphic_aspect_height = 5;
var mobile_threshold = 1000;
var latChart_w;
var latChart_h;

var $popGraphic = $('#pop_chart_pane');
var pop_graphic_aspect_width = 9;
var pop_graphic_aspect_height = 4;


function updateCharts(value) {
    console.log(value);
    var margin = { top: 20, right: 40, bottom: 30, left: 40 };
    // rather than use a fixed width, check the width of the graphic’s container on the page and use that instead.
    var w = $graphic.width() - margin.left - margin.right;
    console.log(w);

    if (w < 400) { graphic_aspect_height = 9; } else if (w < 700) { graphic_aspect_height = 7; }

    // Based on that width, use the aspect ratio values to calculate what the graphic’s height should be.
    var h = Math.ceil((w * graphic_aspect_height) / graphic_aspect_width) - margin.top - margin.bottom;

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
}


function drawLatChart(myYear) {
    myYear=2000;

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

    // load data
    d3.queue()
        .defer(d3.csv, "data/cbc_gmc_by_year_wStdev.csv")
        .defer(d3.csv, "data/qry_cbc_count_by_year.csv")

        .await(callback);

    function callback(error, gmc_data, sacr_cir) {
        if (error) throw error;

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

        var yearLine = d3.line()
            .x(function(myYear){return xScale(myYear);})
            .y(function(h){return h;});

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
            .style("opacity", "0.25")
            // // Create a mouseover event to label the envelope when graph is small.
            // .on("mouseover", function(d){
            //     // show a tooltip on the envelope if size is smaller.
            //     if (w<700){
            //         tooltip.transition()
            //             .duration(200)
            //             .style("opacity", 0.7);
            //         tooltip.html("About 68% of recorded <br>Sandhill Cranes in each<br> year were within <br>the blue envelope." )
            //             .style("left", (d3.event.pageX + 5) + "px")
            //             .style("top", (d3.event.pageY - 28) + "px");
            //     }
            // })
            // .on("mouseout", function(d) {
            //         tooltip.transition()
            //             .duration(400)
            //             .style("opacity", 0);
            //     })
            ;


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
                        .style("top", (30 + parseFloat(d3.select(this).attr("cy")) + "px"));
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
            .style("stroke", "#ffab00")
            .style("stroke-width", "3");

        // Draw the line showing the change in GMC each year.
        svg.append("yearLine")
            .style("stroke", "#ffab00")
            .style("stroke-width", "3");


        // draw dots for
        svg.selectAll(".gmcdot")
            .data(gmc_data)
            .enter()
            .append("circle")
            .attr("class", "gmcdot")
            .attr("r", 2)
            .attr("cx", xMap)
            .attr("cy", yMap)
            .style("fill", "#ffab00");;



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
    };
}

function drawPopChart() {

    var margin = { top: 20, right: 40, bottom: 30, left: 40 };
    // rather than use a fixed width, check the width of the graphic’s container on the page and use that instead.
    var w = $popGraphic.width() - margin.left - margin.right;

    if (w < 400) {
        pop_graphic_aspect_height = 6;
    } else if (w < 900) {
        pop_graphic_aspect_height = 5;
    } else {
        pop_graphic_aspect_height = 5;
    }

    // Based on that width, use the aspect ratio values to calculate what the graphic’s height should be.
    var h = Math.ceil((w * pop_graphic_aspect_height) / pop_graphic_aspect_width) - margin.top - margin.bottom;

    // clear out existing graphics
    $popGraphic.empty();

    var parseYear = d3.timeParse("%Y");

    // setup x
    var xValue = function(d) { return parseInt(d.count_yr); }, // data -> value
        xScale = d3.scaleLinear().range([0, w]), // value -> display
        xMap = function(d) { return xScale(xValue(d)); }, // data -> display
        xAxis = d3.axisBottom(xScale);

    // setup y
    var yValue = function(d) { return parseFloat(d.sum_count); }, // data -> value
        yScale = d3.scaleLinear().range([h, 0]), // value -> display
        yMap = function(d) { return yScale(yValue(d)); }, // data -> display
        yAxis = d3.axisLeft(yScale);

    // add the graph canvas to the body of the webpage
    var svg = d3.select("#pop_chart_pane")
        .append("svg")
        .attr("width", w + margin.left + margin.right)
        .attr("height", h + margin.top + margin.bottom)
        .attr("align", "center")
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");



    // add the tooltip area to the webpage
    var tooltip = d3.select("#pop_chart_pane").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    // load data
    d3.queue()
        .defer(d3.csv, "data/cbc_gmc_by_year.csv")

        .await(callback);

    function callback(error, cbc_year) {
        if (error) throw error;
        // don't want dots overlapping axis, so add in buffer to data domain
        xScale.domain([d3.min(cbc_year, xValue) - 1, d3.max(cbc_year, xValue) + 1]);
        yScale.domain([d3.min(cbc_year, yValue) - 1, d3.max(cbc_year, yValue) + 1]);

        // console.log(d3.min(gmc_data[count_yr]));

        // x-axis
        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + h + ")")
            .call(xAxis.tickFormat(d3.format("")).ticks(5))
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
            .call(yAxis.ticks(5))
            .append("text")
            .attr("class", "label")
            .attr("fill", "#111")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text("CBC Sandhills")
            .style("font-size", "10px");

        // Create the line for the gmc
        var line = d3.line()
            .x(function(d) { return xScale(d.count_yr); })
            .y(function(d) { return yScale(d.sum_count); })
            .curve(d3.curveMonotoneX);


        // Draw the line showing the change in GMC each year.
        svg.append("path")
            .datum(cbc_year)
            .attr("class", "line")
            .attr("d", line)
            .style("fill", "none")
            .style("stroke", "#ffab00")
            .style("stroke-width", "3");

    };
}
drawLatChart();
drawPopChart();

$(window).resize(function(e) {drawLatChart(e); drawPopChart(e);});
