// Demensions and margins of the graph are set
var margin = {top: 40, right: 60, bottom: 60, left: 60},
    width = 1000 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom,
    tooltip = {width: 100, height: 100, x: 10, y: -30};

// svg element is added
var svg = d3.select("#birthday").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform","translate(" + margin.left + "," + margin.top + ")");

// Data are read
d3.csv("data/geburten_clean_sex_separated.csv", function(error, data) {
    if (error) throw error;
    // Sex is read of the group
    var allGroup = d3.map(data, function(d) {
        return (d.sex)
    }).keys()

    // The choices of the button are set
    d3.select("#button_sex")
        .selectAll('myOptions')
        .data(allGroup)
        .enter()
        .append('option')
        .text(function(d) {
            return d;
        })
        .attr("value", function(d) {
            return d;
        })

    // Color scheme is set by d3-scale-chromatic
    var myColor = d3.scaleOrdinal()
        .domain(allGroup)
        .range(d3.schemeSet1);

    // x axis is set
    var x = d3.scaleLinear()
        .domain(d3.extent(data, function(d) {
            return d.year;
        }))
        .range([0, width]);
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));
    svg.append("g")
        .attr("class", "grid")
        .attr("transform", "translate(0," + height + ")")
        .style("stroke-dasharray", ("2, 2"))
        .call(d3.axisBottom(x).ticks(20).tickSize(-height - 8).tickFormat(""));

    // y axis is set
    var y = d3.scaleLinear()
        .domain([0, d3.max(data, function(d) {
            return + d.people;
        })])
        .range([height, 0]);
    svg.append("g")
        .call(d3.axisLeft(y));
    svg.append("g")
        .attr("class", "grid")
        .style("stroke-dasharray", ("2, 2"))
        .call(d3.axisLeft(y).tickSize(-width - 8).tickFormat(""));
    
    // text label is set for the x axis
    svg.append("text")
        .attr("transform", "translate(" + (width / 2) + " ," + (height + margin.top) + ")")
        .style("text-anchor", "middle")
        .text("Jahr");

    // text label is set for the y axis
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Geburte");

    // Line is initialize for the selected group
    var line = svg.append('g')
        .append("path")
        .datum(data.filter(function(d) {
            return d.sex == allGroup[0]
        }))
        .attr("d", d3.line()
            .x(function(d) {
                return x(d.year)
            })
            .y(function(d) {
                return y(d.people)
            })
        )
        .attr("stroke", function(d) {
            return myColor("valueA")
        })
        .style("stroke-width", 4)
        .style("fill", "none")

    var bisect = d3.bisector(function(d) { return d.year; }).left;

    var focus = svg.append("g")
        .attr("class", "focus")
        .style("display", "none");

    focus.append("circle")
        .attr("r", 5)
        .attr("fill", myColor("valueA"));

    focus.append("rect")
        .attr("class", "tooltip")
        .attr("width", 100)
        .attr("height", 50)
        .attr("x", 20)
        .attr("y", -30)
        .attr("rx", 4)
        .attr("ry", 4);

    focus.append("text")
        .attr("class", "tooltip-text")
        .attr("x", 18)
        .attr("y", -2)
        .text("Jahr:");

    focus.append("text")
        .attr("class", "tooltip-year")
        .attr("x", 90)
        .attr("y", -2);

    focus.append("text")
        .attr("class", "tooltip-text")
        .attr("x", 18)
        .attr("y", 18)
        .text("Geburte:");

    focus.append("text")
        .attr("class", "tooltip-people")
        .attr("x", 90)
        .attr("y", 18);
    
    // update of the line chart and of tooltip
    function update(selectedGroup) {
        var dataFilter = data.filter(function(d) {
            return d.sex == selectedGroup
        })

        focus.select("circle")
            .datum(dataFilter)
            .transition()
            .duration(1000)
            .attr("fill", function(d) {
                return myColor(selectedGroup)
            })
            
        line
            .datum(dataFilter)
            .transition()
            .duration(1000)
            .attr("d", d3.line()
                .x(function(d) {
                    return x(d.year)
                })
                .y(function(d) {
                    return y(d.people)
                })
            )
            .attr("stroke", function(d) {
                return myColor(selectedGroup)
            })
    }

    svg.append("rect")
        .attr("class", "overlay")
        .attr("width", width)
        .attr("height", height)
        .on("mouseover", function mouseover() { focus.style("display", null);})
        .on("mousemove", mousemove)
        .on("mouseout", function mouseout() { focus.style("display", "none");});

    function mousemove() {
        var x0 = x.invert(d3.mouse(this)[0]);
        var i = bisect(data, x0, 1);
        selectedData = data[i];
        focus
            .attr("cx", x(selectedData.year))
            .attr("cy", y(selectedData.people))
            .attr("x", x(selectedData.year) + 15)
            .attr("y", y(selectedData.people) + 15)
            .attr("transform", "translate(" + x(selectedData.year) + "," + y(selectedData.people) + ")")
        focus.select(".tooltip-year").text(selectedData.year)
        focus.select(".tooltip-people").text(selectedData.people);
    }

    // button to update the line chart
    d3.select("#button_sex").on("change", function(d) {
        var selectedOption = d3.select(this).property("value")
        update(selectedOption)
    })
});