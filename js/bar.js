var dayNames = ['Weekday', 'Weekend'];

var barMargin = {top: 20, right: 20, bottom: 30, left: 40},
    barWidth = 960 - barMargin.left - barMargin.right,
    barHeight = 500 - barMargin.top - barMargin.bottom;

var x0 = d3.scale.ordinal()
    .rangeRoundBands([0, barWidth], 0.1);

var x1 = d3.scale.ordinal();

var y = d3.scale.linear()
    .range([barHeight, 0]);

var color = {'Weekday': colorbrewer.Blues[3][2], 'Weekend': colorbrewer.Reds[3][2]};

var legendColor = d3.scale.ordinal()
    .range([colorbrewer.Blues[3][2], colorbrewer.Reds[3][2]]);

var xAxis = d3.svg.axis()
    .scale(x0)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    .tickFormat(d3.format(".2s"));

var svg = d3.select("#barchart").append("svg")
    .attr("width", barWidth + barMargin.left + barMargin.right)
    .attr("height", barHeight + barMargin.top + barMargin.bottom)
    .append("g")
        .attr("transform", "translate(" + barMargin.left + "," + barMargin.top + ")");

var generateBarchart = function(data, isCompare, day, dataType) {
    d3.selectAll(".axis").remove();
    d3.selectAll(".hr").remove();
    d3.selectAll(".legend").remove();

    x0.domain([4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 0, 1, 2, 3]);
    if(isCompare) {
        x1.domain(dayNames).rangeRoundBands([0, x0.rangeBand()]);
    }
    y.domain([0, d3.max(data, function(d) { return d3.max(d.days, function(d) { return d.value; }); })]);

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + barHeight + ")")
        .call(xAxis);

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
      .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text(function() {
            if(dataType) {
                return 'Speed (Km/h)';
            }
            return 'Passengers';
        });

    var hour = svg.selectAll(".hr")
        .data(data)
      .enter().append("g")
        .attr("class", "hr")
        .attr("transform", function(d) { return "translate(" + x0(d.hr) + ",0)"; });

    // Codes for Dual Bar
    if(isCompare) {
        hour.selectAll("rect")
            .data(function(d) { return d.days; })
          .enter().append("rect")
            .attr("width", x1.rangeBand())
            .attr("x", function(d) { return x1(d.name); })
            .attr("y", function(d) { return y(d.value); })
            .attr("height", function(d) { return barHeight - y(d.value); })
            .style("fill", function(d) { return color[d.name]; });
    } else {
        hour.selectAll("rect")
            .data(function(d) { return d.days; })
          .enter().append("rect")
          .filter(function(d) { return d.name == day; })
            .attr("width", x0.rangeBand())
            .attr("x", function(d) { return x0(d.name); })
            .attr("y", function(d) { return y(d.value); })
            .attr("height", function(d) { return barHeight - y(d.value); })
            .style("fill", function(d) { return color[d.name]; });
    }

    var legend = svg.selectAll(".legend")
        .data(dayNames)
      .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

    legend.append("rect")
        .attr("x", barWidth - 18)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", legendColor);

    legend.append("text")
        .attr("x", barWidth - 24)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .text(function(d) { return d; });
};