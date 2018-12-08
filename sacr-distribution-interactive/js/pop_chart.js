// setup
var $popGraphic = $('#pop_chart_pane');
var pop_graphic_aspect_width = 9;
var pop_graphic_aspect_height = 4;
var mobile_threshold = 1000;

var cbc_year;

// load data
d3.queue()
    .defer(d3.csv, "data/cbc_gmc_by_year_wStdev.csv")

    .await(callback);

 function callback(error, data) {
        if (error) throw error;
        cbc_year = data;
        drawPopChart();
    }

function drawPopChart() {

    var margin = { top: 20, right: 40, bottom: 30, left: 40 };
    // rather than use a fixed width, check the width of the graphic’s container on the page and use that instead.
    var w = $popGraphic.width() - margin.left - margin.right;

    if (w < 400) {
        pop_graphic_aspect_height = 7;
    } else if (w < 800) {
        pop_graphic_aspect_height = 5;
    } else {
        pop_graphic_aspect_height = 4;
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

    // // load data
    // d3.queue()
    //     .defer(d3.csv, "data/cbc_gmc_by_year.csv")

    //     .await(callback);

    // function callback(error, cbc_year) {
        // if (error) throw error;
        // don't want dots overlapping axis, so add in buffer to data domain
        xScale.domain([d3.min(cbc_year, xValue) - 1, d3.max(cbc_year, xValue) + 1]);
        yScale.domain([d3.min(cbc_year, yValue) - 1, d3.max(cbc_year, yValue) + 1]);

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
            .text("Counted Sandhills")
            .style("font-size", "10px");

        // Create the line for the population
        var line = d3.line()
            .x(function(d) { return xScale(d.count_yr); })
            .y(function(d) { return yScale(d.sum_count); })
            .curve(d3.curveMonotoneX);


        // Draw the line showing the population.
        svg.append("path")
            .datum(cbc_year)
            .attr("class", "line")
            .attr("d", line)
            .style("fill", "none")
            .style("stroke", "#919A3E")
            .style("stroke-width", "3");

    // };
}
// drawPopChart();
// window.onresize = drawPopChart;