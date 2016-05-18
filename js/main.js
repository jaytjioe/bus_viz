var all, route, routes, compareRoutes, hr, rides, speed, direction, day;
var heatmapData, ridesData, speedData, busStopData, busStopMapping;

d3.csv("data/bus_stops.csv", function(error, data) {
    if (error) throw error;
    busStopMapping = {};
    busStopData = d3.nest()
        .key(function(d) { return d.direction; })
        .entries(data)
        .map(function(d) {
            var items = [];
            var mapping = {};
            d.values.forEach(function(e) {
                mapping[e.id] = +e.seq;
                items.push({'id': e.id, 'seq': e.seq, 'desc': e.description, 'road': e.road, 'station': e.station});
            });
            busStopMapping[d.key] = mapping;
            return items;
        });

    d3.csv("data/week.csv", function(error, data) {
        if (error) throw error;

        data.forEach(function(d, i) {
            d.route = d.src + "-" + d.dst;
            d.hr = +d.hr;
            d.min = +d.min;
            d.km = +d.km;
            d.pax = +d.pax;
            d.direction = +d.direction;
        });

        data = crossfilter(data);
        all = data.groupAll();
        route = data.dimension(function(d) { return d.route; });
        routes = route.group().reduceSum(function(d) { return d.pax; });
        hr = data.dimension(function(d) { return d.hr; });
        rides = hr.group().reduceSum(function(d) { return d.pax; });
        speed = hr.group().reduce(
            function reduceAdd(p, v, nf) {
              p.count += p.count;
              p.total += v.min;
              p.value = p.total/p.count;
              return p;
            },

            function reduceRemove(p, v, nf) {
              p.count -= p.count;
              p.total -= v.total;
              p.value = p.total/p.count;
              return p;
            },

            function reduceInitial() {
              return {count: 0, total: 0, value: 0};
            }
        );
        direction = data.dimension(function(d) { return d.direction; });
        day = data.dimension(function(d) { return d.day; });

        day.filterAll();
        direction.filterAll();
        day.filter('Weekday');
        direction.filter(0);

        heatmapData = generateHeatmapData(routes.all());
        var barchartData = generateBarchartData(route.top(Infinity));
        ridesData = barchartData[0];
        speedData = barchartData[1];

        generateHeatmap(heatmapData, busStopData, busStopMapping, 'Weekday', 0);
        generateBarchart(ridesData, false, 'Weekday');
    });
});

var generateHeatmapData = function(data) {
    data = data.map(function(d) {
        var route = d.key.split('-');
        return {"src": route[0], "dst": route[1], "value": d.value};
    });

    return data;
};

var generateBarchartData = function(data) {
    var dataArray = [];

    dataArray[0] = d3.nest()
        .key(function(d) { return d.hr; })
        .key(function(d) { return d.day; })
        .rollup(function(leaves) { return d3.sum(leaves, function(d) { return parseInt(d.pax); }); })
        .entries(data)
        .map(function(d) {
            var hr = d.key;
            var days = d.values.map(function(e) {
                var name = e.key;
                var value = e.values;
                return {'name': name, 'value': value};
            });

            return {'hr': hr, 'days': days};
        });

    dataArray[1] = d3.nest()
        .key(function(d) { return d.hr; })
        .key(function(d) { return d.day; })
        .rollup(function(leaves) { return d3.sum(leaves, function(d) { return d.km; })/d3.sum(leaves, function(d) { return d.min/60; }); })
        .entries(data)
        .map(function(d) {
            var hr = d.key;
            var days = d.values.map(function(e) {
                var name = e.key;
                var value = e.values;
                return {'name': name, 'value': value};
            });

            return {'hr': hr, 'days': days};
        });

    return dataArray;
};

document.getElementById("weekdayto").onclick = function() {
    day.filterAll();
    direction.filterAll();
    day.filter('Weekday');
    direction.filter(0);

    heatmapData = generateHeatmapData(routes.all());
    var barchartData = generateBarchartData(route.top(Infinity));
    ridesData = barchartData[0];
    speedData = barchartData[1];

    generateHeatmap(heatmapData, busStopData, busStopMapping, 'Weekday', 0);
    generateBarchart(ridesData, false, 'Weekday');
    
    return false;
};

document.getElementById("weekendto").onclick = function() {
    day.filterAll();
    direction.filterAll();
    day.filter('Weekend');
    direction.filter(0);

    heatmapData = generateHeatmapData(routes.all());
    var barchartData = generateBarchartData(route.top(Infinity));
    ridesData = barchartData[0];
    speedData = barchartData[1];

    generateHeatmap(heatmapData, busStopData, busStopMapping, 'Weekend', 0);
    generateBarchart(ridesData, false, 'Weekend');
    return false;
};

document.getElementById("weekdayfrospeed").onclick = function() {
    day.filterAll();
    direction.filterAll();
    day.filter('Weekday');
    direction.filter(1);

    var barchartData = generateBarchartData(route.top(Infinity));
    ridesData = barchartData[0];
    speedData = barchartData[1];

    generateBarchart(speedData, false, 'Weekday', true);
    
    return false;
};

document.getElementById("compareto").onclick = function() {
    day.filterAll();
    direction.filterAll();
    direction.filter(0);

    heatmapData = generateHeatmapData(routes.all());
    var barchartData = generateBarchartData(route.top(Infinity));
    ridesData = barchartData[0];
    speedData = barchartData[1];

    generateBarchart(ridesData, true, 'Weekday');
    return false;
};