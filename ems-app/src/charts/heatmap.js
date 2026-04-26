import * as d3 from "d3";
import d3Tip from "d3-tip";

export function heatmap(container, options) {
    console.log(options)
    var borough_map = { "All Boroughs": "All NYC", "Bronx": "Bronx", "Brooklyn": "Brooklyn", "Manhattan": "Manhattan", "Queens": "Queens", "Staten Island": "Staten Island" }
    var borough = borough_map[options["borough"]]

    var severity_map = { "All Levels": "All", "Group 1": "Critical", "Group 2": "Serious", "Group 3": "Low" }
    var severity = severity_map[options["acuity"]]

    d3.select(container).selectAll("*").remove();
    d3.selectAll(".heatmap-tip").remove();

    var margin = { top: 20, right: 300, bottom: 30, left: 80 };
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

    var tip = d3Tip()
        .attr("class", "d3-tip heatmap-tip");
    svg.call(tip);

    var all_rows;

    var coef_columns = [{ key: "crit_coef", label: "Critical" },
    { key: "ser_coef", label: "Serious" },
    { key: "low_coef", label: "Low" }];

    var color = d3.scaleSequential(d3.interpolateViridis);

    Promise.all([
        d3.csv("/src/data/overall_visualization_data.csv", d => load_row(d, "All NYC")),
        d3.csv("/src/data/BRONX_visualization_data.csv", d => load_row(d, "Bronx")),
        d3.csv("/src/data/BROOKLYN_visualization_data.csv", d => load_row(d, "Brooklyn")),
        d3.csv("/src/data/MANHATTAN_visualization_data.csv", d => load_row(d, "Manhattan")),
        d3.csv("/src/data/QUEENS_visualization_data.csv", d => load_row(d, "Queens")),
        d3.csv("/src/data/RICHMOND___STATEN_ISLAND_visualization_data.csv", d => load_row(d, "Staten Island"))
    ]).then(data => {
        all_rows = data.reduce((acc, rows) => acc.concat(rows), []);
        heatmap();
    });

    function load_row(d, borough) {
        var severity_map = { "ALL_SEVERITIES_RESP_90TH": "All", "CRITICAL_RESP_90TH": "Critical", "SERIOUS_RESP_90TH": "Serious", "LOW_ACUITY_RESP_90TH": "Low" }
        var s = severity_map[d.Target_Response_Time]
        return {
            borough: borough,
            severity: s,
            response_90th: +d.Current_Avg_Wait_Time,
            crit_coef: +d.CRITICAL_VOL_Coef,
            ser_coef: +d.SERIOUS_VOL_Coef,
            low_coef: +d.LOW_ACUITY_VOL_Coef
        };
    }

    function heatmap() {
        chart.selectAll("*").remove();
        svg.selectAll("#legend").remove();
        svg.selectAll(".chart-title").remove();

        var rows = all_rows.filter(d => d.borough === borough);
        if (severity !== "All") {
            rows = rows.filter(d => d.severity === severity);
        }
        rows = rows.sort((a, b) =>
            severities.indexOf(a.severity) - severities.indexOf(b.severity)
        );

        var cells = [];
        rows.forEach(row => {
            coef_columns.forEach(col => {
                cells.push({
                    borough: row.borough,
                    severity: row.severity,
                    volumeType: col.label,
                    coefficient: row[col.key],
                    response_90th: row.response_90th
                });
            });
        });

        var max_coef = d3.max(all_rows, d => d3.max([d.crit_coef, d.ser_coef, d.low_coef]));
        color.domain([0, max_coef]);

        var x = d3.scaleBand()
            .domain(rows.map(d => d.severity))
            .range([0, chart_width])
            .padding(0.05);

        var y = d3.scaleBand()
            .domain(coef_columns.map(d => d.label))
            .range([0, chart_height])
            .padding(0.05);

        chart.append("g")
            .attr("class", "axis")
            .call(d3.axisLeft(y));

        chart.append("text")
            .attr("class", "axis-label")
            .attr("transform", "rotate(-90)")
            .attr("x", -chart_height / 2)
            .attr("y", -55)
            .attr("text-anchor", "middle")
            .style("font-size", "12px")
            .text("Call Severity");

        chart.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(0," + chart_height + ")")
            .call(d3.axisBottom(x));

        chart.append("text")
            .attr("class", "axis-label")
            .attr("x", chart_width / 2)
            .attr("y", chart_height + 50)
            .attr("text-anchor", "middle")
            .style("font-size", "12px")
            .text("Reponse Time Target Severity");

        chart.selectAll(".heatmap-cell")
            .data(cells)
            .enter()
            .append("rect")
            .attr("class", "heatmap-cell")
            .attr("x", d => x(d.severity))
            .attr("y", d => y(d.volumeType))
            .attr("width", x.bandwidth())
            .attr("height", y.bandwidth())
            .style("fill", d => color(d.coefficient))
            .style("stroke", "#111")
            .style("stroke-width", 2)
            .on("mouseover", function (event, d) {
                tip.html("<strong>" + d.borough + "</strong><br/>" +
                    "Target Severity: " + d.severity + "<br/>" +
                    "Call Severity: " + d.volumeType + "<br/>" +
                    "Response Time Coefficient: " + d.coefficient.toFixed(2) + " sec/call<br/>" +
                    "Baseline 90th Percentile Response Time: " + Math.round(d.response_90th) + " sec");
                tip.show(d, this);
            })
            .on("mouseout", function (event, d) {
                tip.hide(d, this);
            });

        chart.selectAll(".cell-label")
            .data(cells)
            .enter()
            .append("text")
            .attr("class", "cell-label")
            .attr("x", d => x(d.severity) + x.bandwidth() / 2)
            .attr("y", d => y(d.volumeType) + y.bandwidth() / 2 + 4)
            .attr("text-anchor", "middle")
            .style("font-size", "12px")
            .style("font-weight", "bold")
            .text(d => d.coefficient.toFixed(1));

        var legend_width = 250;
        var legend_height = 15;
        var legend = svg.append("g")
            .attr("id", "legend")
            .attr("transform", "translate(" + (width - margin.right + 20) + "," + (margin.top + 20) + ")");
        legend.append("text")
            .attr("x", 0)
            .attr("y", -10)
            .style("font-size", "12px")
            .style("font-weight", "bold")
            .text("Response Time Coefficient");
        legend.append("rect")
            .attr("width", legend_width)
            .attr("height", legend_height)
            .style("fill", "url(#coef-gradient)");

        svg.select("linearGradient").remove();
        var gradient = svg.append("linearGradient")
            .attr("id", "coef-gradient")
            .attr("x1", "0%")
            .attr("x2", "100%")
            .attr("y1", "0%")
            .attr("y2", "0%");
        gradient.selectAll("stop")
            .data(d3.range(0, 1.01, 0.01))
            .enter()
            .append("stop")
            .attr("offset", d => (d * 100) + "%")
            .attr("stop-color", d => color(d * max_coef));

        var legend_scale = d3.scaleLinear()
            .domain([0, max_coef])
            .range([0, legend_width]);

        var tick_values = d3.range(5).map(i => i * max_coef / 4);

        legend.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(0," + legend_height + ")")
            .call(
                d3.axisBottom(legend_scale)
                    .tickValues(tick_values)
                    .tickFormat(d3.format(".1f"))
            );
    }
}