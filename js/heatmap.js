var heatMargin = { top: 125, right: 0, bottom: 100, left: 125 },
    heatWidth = 700 - heatMargin.left - heatMargin.right,
    heatHeight = 700 - heatMargin.top - heatMargin.bottom;

var heatSvg = d3.select("#heatmap").append("svg")
    .attr("width", heatWidth + heatMargin.left + heatMargin.right)
    .attr("height", heatHeight + heatMargin.top + heatMargin.bottom)
    .append("g")
    .attr("transform", "translate(" + heatMargin.left + "," + heatMargin.top + ")");

var generateHeatmap = function(data, busStopData, busStopMapping, day, direction) {
    d3.selectAll('.srcLabel').remove();
    d3.selectAll('.dstLabel').remove();
    d3.selectAll('.src').remove();

    data = data.filter(function(d) {
        return !isNaN(busStopMapping[direction][d.dst]) & d.value > 0;
    });

    var colors,
        stops = busStopData[direction],
        gridSize = Math.floor(heatWidth / stops.length),
        legendElementWidth = gridSize * 5,
        buckets = 9,
        median = d3.median(data, function(d) {
            return d.value;
        });

    console.log(day)
    if(day == 'Weekday') {
        colors = colorbrewer.Blues[buckets - 1];
    } else if(day == 'Weekend') {
        colors = colorbrewer.Reds[buckets - 1];
    } else {
        buckets = 12;
        colors = colorbrewer.RdBu[buckets - 1];
    }

    var departLabels = heatSvg.selectAll(".srcLabel")
        .data(stops)
        .enter().append("text")
        .text(function (d) { return d.desc; })
        .attr("x", 0)
        .attr("y", function (d, i) { return i * gridSize; })
        .style("text-anchor", "end")
        // .attr("transform", "translate(-15," + gridSize / 1 + ")");
        .attr("transform", "translate(-12, 0)");

    var arriveLabels = heatSvg.selectAll(".dstLabel")
        .data(stops)
        .enter().append("text")
        .text(function(d) { return d.desc; })
        // .attr("x", function(d, i) { console.log(i * gridSize); return i * gridSize; })
        .attr("y", 0)
        .style("text-anchor", "start")
        .attr("transform", function(d, i) {
            return "translate(" + (i * gridSize) + ", -12)  rotate(-90)";
        });

    var colorScale = d3.scale.quantile()
      .domain([0, median, d3.max(data, function (d) { return d.value; })])
      .range(colors);

    var cards = heatSvg.selectAll(".src")
      .data(data, function(d) { return d.src+':'+d.dst; });

    cards.append("title");

    cards.enter().append("rect")
        .attr("x", function(d) { 
            var id = busStopMapping[direction][d.dst];
            if(!isNaN(id)) {
                return (id - 1) * gridSize;
            } 
        })
        .attr("y", function(d) { 
            var id = busStopMapping[direction][d.src];
            if(!isNaN(id)) {
                return (id - 1) * gridSize; 
            } 
        })
        .attr("rx", 4)
        .attr("ry", 4)
        .attr("class", "bordered")
        .attr("width", gridSize)
        .attr("height", gridSize)
        .style("fill", colors[0]);

    cards.transition().duration(1000)
        .style("fill", function(d) { return colorScale(d.value); });

    cards.select("title").text(function(d) { return d.value; });

    cards.exit().remove();

    var legend = heatSvg.selectAll(".legend")
        .data([0].concat(colorScale.quantiles()), function(d) { return d; });

    legend.enter().append("g")
        .attr("class", "legend");

    legend.append("rect")
        .attr("x", function(d, i) { return legendElementWidth * i; })
        .attr("y", heatHeight + heatMargin.bottom/2)
        .attr("width", legendElementWidth)
        .attr("height", gridSize * 1.5)
        .style("fill", function(d, i) { return colors[i]; });

    legend.append("text")
        .attr("class", "mono")
        .text(function(d) { return "≥ " + Math.round(d); })
        .attr("x", function(d, i) { return legendElementWidth * i; })
        .attr("y", heatHeight + heatMargin.bottom/2 + gridSize * 3);

    legend.exit().remove();
};