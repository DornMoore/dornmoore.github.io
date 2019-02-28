// Using d3 to create teh chart
// https://beta.observablehq.com/@hydrosquall/simple-linear-regression-scatterplot-with-d3

var data = [];

$.getJSON("geodata/cancer_tracts.geojson", function(cts) {
    turf.featureEach(cts, function(ct) {

            data.push({ "x": ct.properties.nitrate, "y": ct.properties.canrate, geoid: ct.properties.GEOID10 })
        })
        // console.log([d3.min(data, d => d.x), d3.max(data, d => d.x)])
    callback();
})

function callback() {
    // console.log(data)
    var height = 500;
    var width = 800;
    var margin = ({ top: 20, right: 20, bottom: 20, left: 50 })

    var svg = d3.select("body").append("svg").attr("class", "chart").attr("width", width).attr("height", height);

    var xScale = d3.scaleLinear()
        .domain([d3.min(data, d => d.x), d3.max(data, d => d.x)])
        .range([margin.left, width - margin.right])

    var yScale = d3.scaleLinear()
        .domain([d3.min(data, d => d.y), d3.max(data, d => d.y)])
        .range([height - margin.bottom, margin.top])

    var xAxis = g => g
        .attr('transform', 'translate(0,' + (height - margin.bottom) + ')')
        .attr("class", "xAxis")
        .call(d3.axisBottom(xScale))

    var yAxis = g => g.attr('transform', 'translate(' + margin.left + ', 0)')
        .attr("class", "yAxis")
        .call(d3.axisLeft(yScale))

    var linearRegression = ss.linearRegression(data.map(d => [d.x, d.y]));
    var linearRegressionLine = ss.linearRegressionLine(linearRegression);


    function rPoints() {
        const firstX = d3.min(data, d => d.x);
        const lastX = d3.max(data, d => d.x)
        const xCoordinates = [firstX, lastX];

        return xCoordinates.map(d => ({
            x: d, // We pick x and y arbitrarily, just make sure they match d3.line accessors
            y: linearRegressionLine(d)
        }));

    }
    var regressionPoints = rPoints();
    // console.log(regressionPoints);

    var line = d3.line()
        .x(d => xScale(d.x))
        .y(d => yScale(d.y))

    var chart = svg.append()



    svg.selectAll('circle')
        .data(data)
        .enter().append('circle')
        .attr('r', 3)
        .attr('cx', d => xScale(d.x))
        .attr('cy', d => yScale(d.y));

    // Next, we'll draw the regression line
    svg.append('path')
        .classed('regressionLine', true)
        .datum(regressionPoints)
        .attr('d', line);

    // Lastly, we add the axes!
    svg.append('g')
        .call(xAxis);
    svg.append('g')
        .call(yAxis);



}