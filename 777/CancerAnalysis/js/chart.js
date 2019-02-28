// Original script by Evan Sadler
// http://bl.ocks.org/easadler/edae96ae440aa0361a4d
// minor modifications by Dorn Moore

// https://beta.observablehq.com/@hydrosquall/simple-linear-regression-scatterplot-with-d3

//Global Variables
var data = [];
var resids = [];


//D3 Set up
var width = 750,
    height = 500,
    margin = 50;

// var xDomain = minMax(data, "x");
var xDomain = [-0.605, 15.2186]
    // console.log(xDomain)
    // var yDomain = minMax(data, "y")
var yDomain = [0, 1.01]
    // console.log(yDomain)
var rDomain = [0, 0.25]
    // console.log(data)
    //makes scales
    // console.log(xDomain)
var svg = d3.select("body").append("svg").attr("width", width).attr("height", height);
var x = d3.scale.linear().domain(xDomain).range([margin, width - margin]);
var y = d3.scale.linear().domain(yDomain).range([height - margin, margin]);
var r = d3.scale.linear().domain(rDomain).range([20, 20]);
// var o = d3.scale.linear().domain([10000, 100000]).range([.5, 1]);
// var c = d3.scale.category10().domain(["Africa", "America", "Asia", "Europe", "Oceania"]);

// Calculate range of values for scaling
function minMax(d, value) {
    var items = []
    for (var i = 0; i < d.length; i++) {
        items.push(d[i][value]);
    }

    return items.reduce((acc, val) => {
        acc[0] = (acc[0] === undefined || val < acc[0]) ? val : acc[0]
        acc[1] = (acc[1] === undefined || val > acc[1]) ? val : acc[1]
        return acc;
    }, []);
}

$.getJSON("geodata/cancer_tracts.geojson", function(cts) {
    turf.featureEach(cts, function(ct) {
        data.push({ "x": ct.properties.nitrate, "y": ct.properties.canrate, "radius": 20 })
    })
    callback();
})


function callback() {
    // var xDomain = minMax(data, "x");
    // var xDomain = [-0605, 15.2186]
    // console.log(xDomain)
    // var yDomain = minMax(data, "y")
    // var yDomain = [0, 1.01]
    // console.log(yDomain)
    // var rDomain = [0, 0.25]
    //     // console.log(data)
    //     //makes scales
    //     // console.log(xDomain)
    // var svg = d3.select("body").append("svg").attr("width", width).attr("height", height);
    // var x = d3.scale.linear().domain(xDomain).range([margin, width - margin]);
    // var y = d3.scale.linear().domain(yDomain).range([height - margin, margin]);
    // var r = d3.scale.linear().domain(rDomain).range([0, 20]);
    // // var o = d3.scale.linear().domain([10000, 100000]).range([.5, 1]);
    // // var c = d3.scale.category10().domain(["Africa", "America", "Asia", "Europe", "Oceania"]);

    //create axis
    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left");

    //draw axis
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + (height - margin) + ")")
        .call(xAxis);

    svg.append("text")
        .attr("y", height + margin)
        .attr("x", (width / 2))
        .style("text-anchor", "middle")
        .text("Nitrate Level");

    svg.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate(" + margin + ",0)")
        .call(yAxis);

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1.2em")
        .style("text-anchor", "middle")
        .text("Cancer Rate");

    // //draw dashed lines
    // svg.selectAll(".h").data(d3.range(0, 10, 2)).enter()
    //     .append("line").classed("h", 1)
    //     .attr("x1", margin).attr("x2", height - margin)
    //     .attr("y1", y).attr("y2", y)

    // svg.selectAll(".v").data(d3.range(0, 10, 2)).enter()
    //     .append("line").classed("v", 1)
    //     .attr("y1", margin).attr("y2", width - margin)
    //     .attr("x1", x).attr("x2", x)

    //select each circle and append the data
    var selection = svg.selectAll("circle").data(data)

    //update selection and draw new circle
    selection.enter()
        .append("circle")
        .attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; })
        .attr("r", function(d) { return r(d.radius); })
        .style("fill", function(d) { return "green"; })
        // .style("opacity", function(d) {
        //     if (residview) {
        //         return 0;
        //     } else {
        //         return o(+d.opacity);
        //     }
        // })

    //exit selection
    selection.exit().remove()
    svg.selectAll("circle")
        .style("opacity", 0)


    residview = true;
    drawresiduals(data);
    // console.log(data)

    // if (data.length == 2) {
    //     drawline(data);
    // } else if (data.length > 2) {
    //     transitionline(data);
    //     resids = drawresiduals(data);

    // }


    // var residview = true;

    // d3.select('#resid_button').on('click', function() {

    //     if (residview) {
    //         svg.selectAll('path.resline').remove();
    //         svg.selectAll('path.halfcirc').remove();
    //         svg.selectAll("circle")
    //             .style("opacity", 1)
    //         residview = false;
    //     } else {
    //         svg.selectAll("circle")
    //             .style("opacity", 0)


    //         residview = true;
    //         drawresiduals(data);
    //         console.log(data)

    //     }
    // });

    // d3.select('#reset_button').on('click', function() {


    //     svg.selectAll('path.resline').remove();
    //     svg.selectAll('path.halfcirc').remove();
    //     svg.selectAll('circle').remove();
    //     svg.selectAll('path').remove();
    //     residview = false;
    //     data = []
    //     resids = []

    // });
}


// //click event: draw new circle
// svg.on('click', function(){
//   if(d3.mouse(this)[0] > (50 + r(200)) && d3.mouse(this)[0] < (450 - r(200)) && d3.mouse(this)[1] > (50 + r(200)) && d3.mouse(this)[1] < (450 - r(200))){
//     //push new data point to data array
//     data.push({"x": d3.mouse(this)[0], "y": d3.mouse(this)[1], "radius": 200, "fill": "Europe", "opacity": 90000});

//     //select each circle and append the data
//     var selection = svg.selectAll("circle").data(data)

//     //update selection and draw new circle
//     selection.enter()
//     .append("circle")
//     .attr("cx",function(d) {return d.x;})
//     .attr("cy",function(d) {return d.y;})
//     .attr("r",function(d) {return r(d.radius);})
//     .style("fill",function(d) {return "green";})
//     .style("opacity",function(d) {
//       if(residview){
//         return 0;
//       } else {
//         return o(+d.opacity);
//       }
//     })

//     //exit selection
//     selection.exit().remove()

//     if(data.length == 2){
//       drawline(data);
//     } else if(data.length > 2){
//       transitionline(data);
//       if(residview){
//         resids = drawresiduals(data);
//       }
//     }
//   }
// })