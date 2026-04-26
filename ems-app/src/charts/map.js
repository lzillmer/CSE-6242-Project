import * as d3 from "d3";
import d3Tip from "d3-tip";

export function map(container, options) {
    console.log(options)
    var borough_map = { "All Boroughs": "All", "Bronx": "Bronx", "Brooklyn": "Brooklyn", "Manhattan": "Manhattan", "Queens": "Queens", "Staten Island": "Staten Island" }
    var borough = borough_map[options["borough"]]

    var severity_map = { "All Levels": "All", "Group 1": "Critical", "Group 2": "Serious", "Group 3": "Low" }
    var severity = severity_map[options["acuity"]]

    d3.select(container).selectAll("*").remove();
    d3.selectAll(".map-tip").remove();

    var margin = { top: 20, right: 20, bottom: 0, left: 20 };
    var width = container.clientWidth;
    var height = container.clientHeight - 50;
    var chart_width = width - margin.left - margin.right
    var chart_height = height - margin.top - margin.bottom
    var boroughs = ["All NYC", "Bronx", "Brooklyn", "Manhattan", "Queens", "Staten Island"];
    var severities = ["All", "Critical", "Serious", "Low"];

    var svg = d3.select(container)
        .append("svg")
        .attr("width", width)
        .attr("height", height);
    
    var chart = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var color = d3.scaleSequential(d3.interpolateViridis);
    var tip = d3Tip()
        .attr("class", "d3-tip map-tip");
    svg.call(tip);

    var projection = d3.geoMercator()
        .center([-74.0060, 40.7128])
        .translate([chart_width / 2, chart_height / 2]);
    var path = d3.geoPath().projection(projection);

    var global_min, global_max;
    var geo_data, overall_data, borough_data;

    Promise.all([
        d3.json("/src/data/nyc_boroughs.json"),
        d3.csv("/src/data/overall_visualization_data.csv", d => load_row(d, "All NYC")),
        d3.csv("/src/data/BRONX_visualization_data.csv", d => load_row(d, "Bronx")),
        d3.csv("/src/data/BROOKLYN_visualization_data.csv", d => load_row(d, "Brooklyn")),
        d3.csv("/src/data/MANHATTAN_visualization_data.csv", d => load_row(d, "Manhattan")),
        d3.csv("/src/data/QUEENS_visualization_data.csv", d => load_row(d, "Queens")),
        d3.csv("/src/data/RICHMOND___STATEN_ISLAND_visualization_data.csv", d => load_row(d, "Staten Island"))
    ]).then(data => {
        geo_data = data[0];
        overall_data = data[1];
        borough_data = data.slice(2).reduce((acc, rows) => acc.concat(rows), []);
        global_min = d3.min(borough_data.concat(overall_data), d => d.response_90th);
        global_max = d3.max(borough_data.concat(overall_data), d => d.response_90th);
        map()
    });

    function load_row(d, borough) {
        var severity_map = { "ALL_SEVERITIES_RESP_90TH": "All", "CRITICAL_RESP_90TH": "Critical", "SERIOUS_RESP_90TH": "Serious", "LOW_ACUITY_RESP_90TH": "Low" }
        var s = severity_map[d.Target_Response_Time]
        return {
            borough: borough,
            severity: s,
            response_90th: +d.Current_Avg_Wait_Time,
            crit_vol: +d.Current_Avg_Crit_Vol,
            ser_vol: +d.Current_Avg_Ser_Vol,
            low_vol: +d.Current_Avg_Low_Vol
        };
    }

    function map() {
        var response_map = {};
        var values = [];
        var tip_map = {};

        borough_data.filter(d => d.severity === severity).forEach(d => {
            response_map[d.borough] = d.response_90th;
            tip_map[d.borough] = d;
        });

        var display_data = geo_data.features;
        if (borough != "All") {
            display_data = geo_data.features.filter(d => d.properties.borough === borough);
        }
        var display_geojson = {
            type: "FeatureCollection",
            features: display_data
        };

        projection = d3.geoMercator().fitExtent([[200, 0], [chart_width, chart_height]], display_geojson);
        path = d3.geoPath().projection(projection);
        color.domain([global_min, global_max]);

        chart.selectAll("#boroughs").remove();

        var boroughs_map = chart.append("g")
            .attr("id", "boroughs")
            .selectAll("path")
            .data(display_data);

        boroughs_map.enter()
            .append("path")
            .merge(boroughs_map)
            .attr("d", path)
            .style("fill", function (d) {
                var val = response_map[d.properties.borough];
                return val ? color(val) : "gray";
            })
            .style("stroke", "#fff")
            .style("stroke-width", 1.5)
            .on("mouseover", function (event, d) {
                tip.html("<strong>" + d.properties.borough + "</strong><br/>" +
                "Call Severity: " + severity + "<br/>" +
                "90th Percentile Response Time: " + tip_map[d.properties.borough].response_90th.toFixed(1) + "s");
                tip.show(d, this);
            })
            .on("mouseout", function (event, d) {
                tip.hide(d, this);
            });

        svg.selectAll("#legend").remove();
        var legend_width = 250;
        var legend_height = 15;
        var legend = svg.append("g")
            .attr("id", "legend")
            .attr("transform", "translate(" + margin.left + "," + (29) + ")");
        legend.append("text")
            .attr("x", 0)
            .attr("y", -10)
            .style("font-size", "12px")
            .style("font-weight", "bold")
            .style("fill", "#fff")
            .text("90th Percentile Response Time (s)");
        legend.append("rect")
            .attr("width", legend_width)
            .attr("height", legend_height)
            .style("fill", "url(#gradient)");

        svg.select("linearGradient").remove();
        var gradient = svg.append("linearGradient")
            .attr("id", "gradient")
            .attr("x1", "0%")
            .attr("x2", "100%")
            .attr("y1", "0%")
            .attr("y2", "0%");
        gradient.selectAll("stop")
            .data(d3.range(0, 1.01, 0.01))
            .enter()
            .append("stop")
            .attr("offset", d => (d * 100) + "%")
            .attr("stop-color", d => color(global_min + d * (global_max - global_min)));

        var tick_values = d3.range(5).map(i =>
            global_min + i * (global_max - global_min) / 4
        );

        var legend_scale = d3.scaleLinear()
            .domain([global_min, global_max])
            .range([0, legend_width]);

        legend.append("g")
            .attr("transform", "translate(0," + legend_height + ")")
            .call(d3.axisBottom(legend_scale)
                .tickValues(tick_values)
                .tickFormat(d3.format(".0f")));

        svg.selectAll("#overallText").remove();

        if (borough === "All") {
            var row = overall_data.find(d => d.severity === severity);
            var group = svg.append("g")
                .attr("id", "overallText")
                .attr("transform", "translate(20,75)");
            group.append("rect")
                .attr("width", 235)
                .attr("height", 70)
                .attr("rx", 10)
                .attr("fill", "#111827")
                .attr("stroke", "white");
            group.append("text")
                .attr("x", 10)
                .attr("y", 20)
                .style("font-size", "12px")
                .style("font-weight", "bold")
                .text("NYC Overall");
            group.append("text")
                .attr("x", 10)
                .attr("y", 40)
                .style("font-size", "12px")
                .text("Severity: " + severity);
            group.append("text")
                .attr("x", 10)
                .attr("y", 55)
                .style("font-size", "12px")
                .text("90th Percentile Response Time: " + row.response_90th.toFixed(1) + "s");
        }
    }
}