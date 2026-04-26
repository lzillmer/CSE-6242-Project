import * as d3 from "d3";
import d3Tip from "d3-tip";

export function simulation(container, options) {
    console.log(options)
    var borough_map = {"All Boroughs": "All NYC", "Bronx": "Bronx", "Brooklyn": "Brooklyn", "Manhattan": "Manhattan", "Queens": "Queens", "Staten Island": "Staten Island"}
    var borough = borough_map[options["borough"]]

    var severity_map = {"All Levels": "All", "Group 1": "Critical", "Group 2": "Serious", "Group 3": "Low"}
    var severity = severity_map[options["acuity"]]

    var call_vol = options["call_vol"]
    var diversion = options["diversion"]

    d3.select(container).selectAll("*").remove();
    d3.selectAll(".simulation-tip").remove();

    var margin = {top: 80, right: 220, bottom: 120, left: 100};
    var width = container.clientWidth;
    var height = container.clientHeight - 50;
    var chart_width = width - margin.left - margin.right
    var chart_height = (height - margin.top - margin.bottom) / 2
    var all_rows;
    var current_row;
    var boroughs = ["All NYC", "Bronx", "Brooklyn", "Manhattan", "Queens", "Staten Island"];
    var severities = ["All", "Critical", "Serious", "Low"];

    var svg = d3.select(container)
        .append("svg")
        .attr("width", width)
        .attr("height", height);
    var chart1 = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    var chart2 = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + (margin.top + height / 2) + ")");
    var tip = d3Tip()
        .attr("class", "d3-tip simulation-tip");
    svg.call(tip);

    Promise.all([
        d3.csv("/src/data/overall_visualization_data.csv", d => load_row(d, "All NYC")),
        d3.csv("/src/data/BRONX_visualization_data.csv", d => load_row(d, "Bronx")),
        d3.csv("/src/data/BROOKLYN_visualization_data.csv", d => load_row(d, "Brooklyn")),
        d3.csv("/src/data/MANHATTAN_visualization_data.csv", d => load_row(d, "Manhattan")),
        d3.csv("/src/data/QUEENS_visualization_data.csv", d => load_row(d, "Queens")),
        d3.csv("/src/data/RICHMOND___STATEN_ISLAND_visualization_data.csv", d => load_row(d, "Staten Island"))
    ]).then(d => {
        all_rows = d.reduce((acc, rows) => acc.concat(rows), []);
        console.log(all_rows)
        update();
    });

    function load_row(d, borough) {
        var severity_data_map = {"ALL_SEVERITIES_RESP_90TH": "All", "CRITICAL_RESP_90TH": "Critical", "SERIOUS_RESP_90TH": "Serious", "LOW_ACUITY_RESP_90TH": "Low"}
        var s = severity_data_map[d.Target_Response_Time]
        return {
            borough: borough,
            severity: s,
            base_response_time: +d.Current_Avg_Wait_Time,
            crit_vol: +d.Current_Avg_Crit_Vol,
            ser_vol: +d.Current_Avg_Ser_Vol,
            low_vol: +d.Current_Avg_Low_Vol,
            crit_coef: +d.CRITICAL_VOL_Coef,
            ser_coef: +d.SERIOUS_VOL_Coef,
            low_coef: +d.LOW_ACUITY_VOL_Coef
        };
    }

    function update() {
        current_row = all_rows.find(d => d.borough === borough && d.severity === severity);
        if (!current_row) { console.error("Missing row for:", borough, severity) }

        var settings = {
            vol_multiplier: call_vol,
            crit_diversion: diversion.g1 ?? 0,
            ser_diversion: diversion.g2 ?? 0,
            low_diversion: diversion.g3 ?? 0,
        };
        simulation_chart(settings);
        contribution_chart(settings);
    }

    function simulation_chart(settings) {
        chart1.selectAll("*").remove();

        var rows = [current_row]
        if (borough === "All NYC") {
            rows = boroughs.map(b => all_rows.find(d => d.borough === b && d.severity === severity)).filter(d => d);
        }

        var data = [];
        rows.forEach(row => {
            var volumes = calculate_call_volumes(row, settings);
            data.push({
                borough: row.borough,
                scenario: "Average Conditions (Baseline)",
                value: Math.max(0, row.base_response_time),
                value: row.base_response_time
            });
            data.push({
                borough: row.borough,
                scenario: "Volume Scaled Estimate",
                value: calculate_estimate(row, volumes.multiplier)
            });
            data.push({
                borough: row.borough,
                scenario: "Post-Diversion Estimate",
                value: calculate_estimate(row, volumes.diversion)
            });
        });

        var scenarios = ["Average Conditions (Baseline)", "Volume Scaled Estimate", "Post-Diversion Estimate"];
        var x0 = d3.scaleBand()
            .domain(rows.map(d => d.borough))
            .range([0, chart_width])
            .padding(0.22);
        var x1 = d3.scaleBand()
            .domain(scenarios)
            .range([0, x0.bandwidth()])
            .padding(0.08);
        var y = d3.scaleLinear()
            .domain([0, d3.max(data, d => Math.max(0, d.value)) * 1.15])
            .nice()
            .range([chart_height, 0]);
        var colors = d3.scaleOrdinal()
            .domain(scenarios)
            .range(["#440154", "#fde725", "#35b779"]);

        chart1.append("text")
            .attr("x", chart_width / 2)
            .attr("y", -35)
            .attr("class", "chart-title chart-title")
            .text("Call Volume/Diversion Response Time Simulation");

        chart1.append("g")
            .attr("class", "grid")
            .call(d3.axisLeft(y)
                .tickSize(-chart_width)
                .tickFormat(""));

        chart1.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(0," + chart_height + ")")
            .call(d3.axisBottom(x0));

        chart1.append("g")
            .attr("class", "axis")
            .call(d3.axisLeft(y).tickFormat(d3.format(".0f")));

        chart1.append("text")
            .attr("transform", "rotate(-90)")
            .attr("x", -chart_height / 2)
            .attr("y", -55)
            .attr("class", "axis-label")
            .text("90th Percentile Response Time (s)");

        chart1.selectAll(".response-bar")
            .data(data)
            .enter()
            .append("rect")
            .attr("class", "response-bar")
            .attr("x", d => x0(d.borough) + x1(d.scenario))
            .attr("y", d => y(Math.max(0, d.value)))
            .attr("width", x1.bandwidth())
            .attr("height", d => chart_height - y(Math.max(0, d.value)))
            .style("fill", d => colors(d.scenario))
            .on("mouseover", function (event, d) {
                tip.html("<strong>" + d.borough + "</strong><br/>" + d.scenario + "<br/>Estimate: " + d.value.toFixed(1) + "s");
                tip.show(d, this);})
            .on("mouseout", function (event, d) {tip.hide(d, this);});

        chart1.selectAll(".response-label")
            .data(data)
            .enter()
            .append("text")
            .attr("class", "response-label")
            .attr("x", d => x0(d.borough) + x1(d.scenario) + x1.bandwidth() / 2)
            .attr("y", d => y(Math.max(0, d.value)) - 5)
            .attr("class", "response-label")
            .text(d => d.value.toFixed(0));

        var legend = chart1.append("g")
            .attr("transform", "translate(" + (chart_width + 30) + ", 20)");

        legend.append("text")
            .attr("x", 0)
            .attr("y", -10)
            .attr("class", "legend-title")
            .text("Scenario");

        var item = legend.selectAll(".scenarioLegendItem")
            .data(scenarios)
            .enter()
            .append("g")
            .attr("class", "scenarioLegendItem")
            .attr("transform", (d, i) => "translate(0," + (i * 20) + ")");

        item.append("rect")
            .attr("class", "legend")
            .attr("width", 12)
            .attr("height", 12)
            .style("fill", d => colors(d));

        item.append("text")
            .attr("x", 18)
            .attr("y", 10)
            .attr("class", "legend-label")
            .text(d => d);
    }

    function calculate_call_volumes(row, settings) {
        var multiplier = settings.vol_multiplier / 100;
        var multiplier_volumes = {
            critical: row.crit_vol * multiplier,
            serious: row.ser_vol * multiplier,
            low: row.low_vol * multiplier
        };
        var diversion_volumes = {
            critical: multiplier_volumes.critical * (1 - settings.crit_diversion / 100),
            serious: multiplier_volumes.serious * (1 - settings.ser_diversion / 100),
            low: multiplier_volumes.low * (1 - settings.low_diversion / 100)
        };
        return {
            multiplier: multiplier_volumes,
            diversion: diversion_volumes
        };
    }

    function calculate_estimate(row, volumes) {
        return row.base_response_time
            + row.crit_coef * (volumes.critical - row.crit_vol)
            + row.ser_coef * (volumes.serious - row.ser_vol)
            + row.low_coef * (volumes.low - row.low_vol);
    }

    function contribution_chart(settings) {
        chart2.selectAll("*").remove();

        var volumes = calculate_call_volumes(current_row, settings);
        var contribution_data = [{
            label: "Critical",
            coefficient: current_row.crit_coef,
            multiplier_volume: volumes.multiplier.critical,
            diversion_volume: volumes.diversion.critical,
            diverted_calls: volumes.multiplier.critical - volumes.diversion.critical,
            time_reduction: current_row.crit_coef * (volumes.multiplier.critical - volumes.diversion.critical)
        },
        {
            label: "Serious",
            coefficient: current_row.ser_coef,
            multiplier_volume: volumes.multiplier.serious,
            diversion_volume: volumes.diversion.serious,
            diverted_calls: volumes.multiplier.serious - volumes.diversion.serious,
            time_reduction: current_row.ser_coef * (volumes.multiplier.serious - volumes.diversion.serious)
        },
        {
            label: "Low-Acuity",
            coefficient: current_row.low_coef,
            multiplier_volume: volumes.multiplier.low,
            diversion_volume: volumes.diversion.low,
            diverted_calls: volumes.multiplier.low - volumes.diversion.low,
            time_reduction: current_row.low_coef * (volumes.multiplier.low - volumes.diversion.low)
        }];

        var x_axis_max = Math.max(d3.max(contribution_data, d => d.time_reduction), 10);
        var x = d3.scaleLinear()
            .domain([0, x_axis_max * 1.5])
            .nice()
            .range([0, chart_width]);
        var y = d3.scaleBand()
            .domain(contribution_data.map(d => d.label))
            .range([0, chart_height])
            .padding(0.3);

        chart2.append("text")
            .attr("x", chart_width / 2)
            .attr("y", -35)
            .attr("class", "chart-title")
            .text("Diversion Contribution to Response Time Reduction");

        chart2.append("g")
            .attr("class", "grid")
            .attr("transform", "translate(0," + chart_height + ")")
            .call(d3.axisBottom(x).tickSize(-chart_height).tickFormat(""));

        chart2.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(0," + chart_height + ")")
            .call(d3.axisBottom(x).tickFormat(d3.format(".0f")));

        chart2.append("g")
            .attr("class", "axis")
            .call(d3.axisLeft(y));

        chart2.append("text")
            .attr("transform", "rotate(-90)")
            .attr("x", -chart_height / 2)
            .attr("y", -55)
            .attr("class", "axis-label")
            .text("Diverted Call Type");

        chart2.selectAll(".bar")
            .data(contribution_data)
            .enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", 0)
            .attr("y", d => y(d.label))
            .attr("width", d => x(d.time_reduction))
            .attr("height", y.bandwidth())
            .attr("class", "bar diversion-bar")
            .on("mouseover", function (event, d) {
                tip.html("<strong>" + d.label + " Calls</strong><br/>" +
                    "Coefficient: " + d.coefficient.toFixed(1) + "s/call<br/>" +
                    "Calls Diverted: " + d.diverted_calls.toFixed(1) + "/hr<br/>" +
                    "Response Time Reduction: " + d.time_reduction.toFixed(1) + "s");
                tip.show(d, this);})
            .on("mouseout", function (event, d) {tip.hide(d, this);});

        chart2.selectAll(".bar-label")
            .data(contribution_data)
            .enter()
            .append("text")
            .attr("class", "bar-label")
            .attr("x", d => x(d.time_reduction) + 6)
            .attr("y", d => y(d.label) + y.bandwidth() / 2 + 4)
            .attr("class", "bar-label")
            .text(d => d.time_reduction.toFixed(1) + "s, " + d.diverted_calls.toFixed(1) + " calls diverted/hr");

        chart2.append("text")
            .attr("x", chart_width / 2)
            .attr("y", chart_height + 50)
            .attr("class", "axis-label")
            .text("90th Percentile Response Time Reduction (s)");
    }
}