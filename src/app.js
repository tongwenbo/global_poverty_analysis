document.getElementById("name").innerText = "Wenbo Tong";
/////////////////////////////////////////////////////
import * as d3 from 'd3';
import { line } from 'd3';
import {feature} from 'topojson';

// this function creates the legend
function Legend(color, {
  title,
  tickSize = 6,
  width = 400, 
  height = 46 + tickSize,
  marginTop = 18,
  marginBottom = 16 + tickSize,
  ticks = width / 64,
  tickFormat,
  tickValues
} = {}) {

  const svg = d3.select("#map_legend")
      .attr("width", width)
      .attr("height", height);

  let axis= d3.scaleLinear()
      .domain([-1, color.range().length - 1])
      .rangeRound([0, width]);

  svg.append("g")
    .selectAll("rect")
    .data(color.range())
    .join("rect")
      .attr("x", (d, i) => axis(i - 1))
      .attr("y", marginTop)
      .attr("width", (d, i) => axis(i) - axis(i - 1))
      .attr("height", height - marginTop - marginBottom)
      .attr("fill", d => d);
  
  // change these 2 variables to adjust the legend tick
  tickValues = d3.range(color.thresholds().length);
  tickFormat = i => parseInt(color.thresholds()[i]);
  
  svg.append("g")
      .attr("transform", `translate(0,${height - marginBottom})`)
      .call(d3.axisBottom(axis)
        .ticks(ticks)
        .tickFormat(tickFormat)
        .tickSize(tickSize)
        .tickValues(tickValues))
      .call(g => g.append("text")
        .attr("x", 0)
        .attr("y", marginTop + marginBottom - height - 6)
        .attr("fill", "black")
        .attr("text-anchor", "start")
        .attr("font-weight", "bold")
        .attr("font-size", "13px")
        .text(title));

  return svg.node();
}

// this function creates the tree
Promise.all(
  [
    d3.json("./data/tree.json"),
    d3.csv("./data/line.csv")
  ]
).then(function([data, tree_data]){
    const margin = {top: 20, right: 20, bottom: 20, left: 20};
    const width = 900 - margin.left - margin.right;
    const height = 900 - margin.top - margin.bottom;
    // var index = "headcount_ratio_lower_mid_income_povline";

    const tree_svg = d3.select(".tree_vis")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    const tree_g = tree_svg.append("g")
      .attr("transform",
              `translate(${margin.left}, ${margin.top})`);
    
    tree_g.append("text")
          .text("Asia")
          .attr("x", 2)
          .attr("y", 50)   
          .text('Asia')
          .attr("font-size", "22px")
          .attr("fill", "blue")
    tree_g.append("text")
          .attr("x", 2)
          .attr("y", 245)   
          .text('Europe')
          .attr("font-size", "22px")
          .attr("fill", "orange")
    tree_g.append("text")
          .attr("x", 620)
          .attr("y", 50)   
          .text('Africa')
          .attr("font-size", "22px")
          .attr("fill", "green")
    tree_g.append("text")
          .attr("x", 620)
          .attr("y", 288)   
          .text('Oceania')
          .attr("font-size", "20px")
          .attr("fill", "red")
    tree_g.append("text")
          .text("South America")
          .attr("x", 730)
          .attr("y", 288)   
          .attr("font-size", "18px")
          .attr("fill", "purple")
    tree_g.append("text")
          .attr("x", 620)
          .attr("y", 593)   
          .text('North America')
          .attr("font-size", "22px")
          .attr("fill", "brown")
    
    // provide zoom function
    tree_svg.call(d3.zoom().on('zoom', (event) => {
      tree_g.attr('transform', event.transform);
    }));

    const root = d3.hierarchy(data).sum(function(d){ return d.median}) 
    // here the size of each leave is given as the median of each input data

    // then d3.treemap computes the position of each element of the hierarchy
    d3.treemap()
      .size([width, height])
      .paddingTop(28)
      .paddingRight(6)
      .paddingInner(3)      // Padding between each rectangle
      //.paddingOuter(1)
      //.padding(20)
      (root)
    
    const color = d3.scaleOrdinal(d3.schemeCategory10);
    const opacity = d3.scaleLinear()
        .domain([1, 69])
        .range([0.2, 1]);
    
    const cell = tree_g.selectAll("g")
        .data(root.leaves())
        .join("g")
          .attr("transform", function(d) { return "translate(+" + d.x0 + "," + d.y0 + ")"; })
   
    // tooltip setup
    var tree_tooltip = d3.select(".tree_vis")
        .append("div")
        .style("opacity", 0)
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "2px")
        .style("border-radius", "5px")
        .style("padding", "5px")

    const mouseover = function(event, d) {
      tree_tooltip
        .style("opacity", 1)
      d3.select(this)
        .style("stroke", "black")
        .style("stroke-width", 3)
    }
  
    const mousemove = function(event, d) {
      tree_tooltip
        .html("Country: " + d.data.name + "   Median: $" + d.data.median.toFixed(2))
        .style("left", (event.x)/2 + "px")
        .style("top", (event.y)/2 + "px")
    }
  
    // A function that change this tooltip when the leaves a point: just need to set opacity to 0 again
    const mouseleave = function(event,d) {
      tree_tooltip
        .style("opacity", 0)
      d3.select(this)
        .style("stroke", "black")
        .style("stroke-width", 1)
    }
    
    cell.append("rect")
        // .attr('x', function (d) { return d.x0; })
        // .attr('y', function (d) { return d.y0; })
        .attr("id", function(d) { return d.data.median; })
        .attr("class", function(d) { return "tree_" + d.data.name; })
        .attr('width', function (d) { return d.x1 - d.x0; })
        .attr('height', function (d) { return d.y1 - d.y0; })
        .style("stroke", "black")
        .style("fill", function(d){ return color(d.parent.data.name)})
        .style("opacity", function(d){ return opacity(d.data.median)})
        // uncomment following 2 lines to see another tooltip
        // .append('title')
        //   .text(d => d.data.name + ": $" + d.data.median.toFixed(2))
        .on("mouseover", mouseover )
        .on("mousemove", mousemove )
        .on("mouseleave", mouseleave )
        // uncomment onclick function to see possible interactions through graphs
          // .on("click", function(event){
          //   console.log(this.classList.value.substring(5))
          //   var countryN = this.classList.value.substring(5);
          //   updateLine(tree_data, countryN, index)
          // })
          // .on("click", function(event){
          //    return tree_tooltip
          //             .html("Country: " + this.classList.value.substring(5))
          //             .style("left", (event.x) + "px")
          //             .style("top", (event.y) + "px")
          //             .style("opacity", 1)
          // })

    // a unique id for clipPath in order to solve text conflict
    cell.append("clipPath")
        .attr("id", function(d) { return "clip-" + d.data.median; })
      .append("use")
        .attr("xlink:href", function(d) { return "#" + d.data.median; });

    // add country names with respect to clippath
    cell.append("text")
        .attr("clip-path", function(d) { return "url(#clip-" + d.data.median + ")"; })
      .selectAll("tspan")
      .data(function(d) { return d.data.name.split(/(?=[A-Z][^A-Z])/g); })
      .join("tspan")
          .attr("x", 4)    // +10 to adjust position (more right)
          .attr("y", function(d, i) { return 13 + i * 10; })   // +20 to adjust position (lower)
          .text(function(d){ return d })
          .attr("font-size", "10px")
          .attr("fill", "black")
    
    // cell.append('text')
    //   .data(root.descendants().filter(function(d){return d.depth==1}))
    //     .attr("x", function(d){ return d.x0})
    //     .attr("y", function(d){ return d.y0-30})
    //     .text(function(d){ return d.data.name })
    //     .attr("font-size", "19px")
    //     .attr("fill",  function(d){ return color(d.data.name)} )

});

// this function creates the map
Promise.all(
  [
    d3.csv("./data/50m.csv"),
    d3.json('https://unpkg.com/world-atlas@1.1.4/world/50m.json')
  ]
).then(function([csv_data, json_data]){
    console.log(csv_data);
    const map_svg = d3.select("#map_svg");
    const map_g = map_svg.append('g');
    
    // uses the set of green
    const map_color = d3.scaleQuantize([0,100], d3.schemeGreens[9]);
    const projection = d3.geoNaturalEarth1();
    const pathGenerator = d3.geoPath().projection(projection);

    const row_id = {};
    csv_data.forEach(d=>{
      row_id[d.iso_n3] = d;
    })

    map_g.append('path')
    .attr('class', 'sphere')
    .attr('d', pathGenerator({type: 'Sphere'}));

    map_svg.call(d3.zoom().on('zoom', (event) => {
      // console.log('zoom');
      // console.log(event);
      // d3.event is only used in d3 version befor v6
      map_g.attr('transform', event.transform);
    }));

    const countries = feature(json_data, json_data.objects.countries);
    console.log(countries);
    countries.features.forEach(d=>{
      Object.assign(d.properties, row_id[Number(d.id)]);
    });

    map_g.selectAll('path').data(countries.features)
      .enter().append('path')
        .attr('class', 'country')
        .attr('d', pathGenerator)
        .attr("id", d=> "map_for_" + d.properties.name)
        .attr('fill', d => 
          d.properties["lessThan550"] == 0 ? "grey" : map_color(d.properties["lessThan550"]))
      .append('title')
        .text(d => d.properties.name + ": " + d.properties["lessThan550"] + "%")
    
    Legend(d3.scaleQuantize([0, 100], d3.schemeGreens[9]), {
      title: "percentage of people living under $5.5 per day (%)"
    });
});

// this function creates checkbox and their callback functions
function createCheckBox(data, line_data, index){
    d3.select(".line_sss").selectAll("input")
    .data(data)
    .enter()
    .append("label")
      .text(d => d.country)
      .attr("class", "CountryOption")
    .append("input")
      .attr("type", "checkbox")
      .attr("id", d => 'check' + d.country)
      .attr('class', d => 'check' + d.country.replace(/\s+|'/g,""))
      .on("change", function(){
          console.log(this)
          var CN = this.id.substring(5)
          console.log(CN)

          if(this.checked){
            console.log(index)
            updateLine(line_data, CN, index)
          }
          else{
            d3.selectAll('#'+CN.replace(/\s+|'/g,"")).remove()
          }
        })
};

// global variables for the line chart
var lmargin = {top: 50, right: 50, bottom: 20, left: 50};
var lwidth = 1250 - lmargin.left - lmargin.right;
var lheight = 800 - lmargin.top - lmargin.bottom;

var line_svg = d3.select(".line_vis")
    .append("svg")
    .attr("id", "delete")
    .attr("width", lwidth + lmargin.left + lmargin.right)
    .attr("height", lheight + lmargin.top + lmargin.bottom)
    .append("g")
    .attr("transform",
          `translate(${lmargin.left}, ${lmargin.top})`);

var lx = d3.scaleLinear()
    .domain(['1980', '2020'])
    .range([0, lwidth]);
var ly = d3.scaleLinear()
    .domain( [0,100])
    .range([ lheight, 0 ]);

// draw the background of the linechart
function drawLineBG(){
  var line_svg = d3.select("#delete")

  line_svg.append("g")
      .attr("transform",
            `translate(${lmargin.left}, ${lmargin.top})`);

  const x_axis = d3.axisBottom(lx).ticks(15)
    .tickFormat(lx => `${lx.toFixed(0)}`);  // to aviod dots in the Year number

  line_svg.append("g")
    .attr("transform", `translate(${lmargin.left+10}, ${lheight+lmargin.top})`)
    .call(x_axis)
    .style("font-size", "15px");
  
  line_svg.append("g")
    .attr("transform", `translate(${lmargin.left+10}, ${lmargin.top})`)
    .call(d3.axisLeft(ly).ticks(15))
    .style("font-size", "15px");

}

// this function is called each time when the tickbox of one country is selected
function updateLine(data, countryName, index){
  var line_svg = d3.select("#delete")
  const color = '#' + Math.floor(Math.random()*16777215).toString(16);
  
  console.log(index)
  const line = d3.line()
    .x(d => lx(d.year))
    .y(d => ly(d[index]))

  line_svg.append("path")  // add line
    .attr("transform", `translate(${lmargin.left+10}, ${lmargin.top})`)
    .datum(data.filter((d) => d.country == countryName && d.ppp_version == "2017"))
    .attr("id", countryName.replace(/\s+|'/g,""))  // solve the problem of country names with spaces
      .attr("fill", "none")
      .attr("stroke", color)
      .attr("stroke-width", 3)
      .attr("d", line)
  
  // add country name with the line
  line_svg .data(data.filter((d) => d.country == countryName && d.ppp_version == "2017"))
    .append('text')
    .attr("transform", `translate(${lmargin.left}, ${lmargin.top-10})`)
    .attr('id', countryName.replace(/\s+|'/g,""))
    .attr('text-anchor', 'middle')
    .attr("x", d => lx(d.year))
    .attr("y", d => ly(d[index]))
    .text(countryName)
    .style("font-size" , "19px")
    .attr("fill", color)

  // add dots
  line_svg.append("g") 
    .selectAll("dot")
    .data(data.filter((d) => d.country == countryName && d.ppp_version == "2017"))
    .join("circle")
    .attr("transform", `translate(${lmargin.left+10}, ${lmargin.top})`)
    .attr("id", d => d.country.replace(/\s+|'/g,""))
      .attr("cx", d => lx(d.year))
      .attr("cy", d => ly(d[index]))
      .attr("r", 5)
      .attr("fill", color)
      .append('title')
      .text(d => d.country + ", " + d.year + ": " + Number(d[index]).toFixed(2) + "%")
}

// main function to draw line
Promise.all(
  [
    d3.csv("./data/umap.csv"),
    d3.csv("./data/line.csv")
  ]
).then(function([umapData , data]){
    var index = "headcount_ratio_lower_mid_income_povline";

    drawLineBG();
    createCheckBox(umapData, data, index);

    d3.select("#line_s1")
      .on("change", ()=>{
        var selected = d3.select('#line_s1').node().value;
        if(selected == 'percentage of people living under lower middle poverty line'){
            // console.log(selected)
            index = "headcount_ratio_lower_mid_income_povline"
            d3.select("#delete").remove()
            d3.select("label").remove()
            var line_svg = d3.select(".line_vis")
              .append("svg")
              .attr("id", "delete")
              .attr("width", lwidth + lmargin.left + lmargin.right)
              .attr("height", lheight + lmargin.top + lmargin.bottom)
              .append("g")
              .attr("transform",
                    `translate(${lmargin.left}, ${lmargin.top})`);
            drawLineBG()
            console.log(index)
            createCheckBox(umapData, data, index);
        }
        else if(selected == "percentage of people living under upper middle poverty line"){
            //console.log(selected)
            index = "headcount_ratio_upper_mid_income_povline"
            d3.select("#delete").remove()
            d3.selectAll("label").remove()
            var line_svg = d3.select(".line_vis")
              .append("svg")
              .attr("id", "delete")
              .attr("width", lwidth + lmargin.left + lmargin.right)
              .attr("height", lheight + lmargin.top + lmargin.bottom)
              .append("g")
              .attr("transform",
                    `translate(${lmargin.left}, ${lmargin.top})`);
            drawLineBG()
            console.log(index)
            createCheckBox(umapData, data, index);
          }
          else if(selected == "percentage of people living United Nations poverty line"){
            console.log(selected)
            index = "headcount_ratio_international_povline"
            d3.select("#delete").remove()
            d3.selectAll("label").remove()
            var line_svg = d3.select(".line_vis")
              .append("svg")
              .attr("id", "delete")
              .attr("width", lwidth + lmargin.left + lmargin.right)
              .attr("height", lheight + lmargin.top + lmargin.bottom)
              .append("g")
              .attr("transform",
                    `translate(${lmargin.left}, ${lmargin.top})`);
            drawLineBG()
            createCheckBox(umapData, data, index);
        }
          else if(selected == "percentage of people living under $1 a day"){
            console.log(selected)
            index = "headcount_ratio_100"
            d3.select("#delete").remove()
            d3.selectAll("label").remove()
            var line_svg = d3.select(".line_vis")
              .append("svg")
              .attr("id", "delete")
              .attr("width", lwidth + lmargin.left + lmargin.right)
              .attr("height", lheight + lmargin.top + lmargin.bottom)
              .append("g")
              .attr("transform",
                    `translate(${lmargin.left}, ${lmargin.top})`);
            drawLineBG()
            createCheckBox(umapData, data, index);
        }
          else if(selected == "percentage of people living under $1 a day"){
            console.log(selected)
            index = "headcount_ratio_100"
            d3.select("#delete").remove()
            d3.selectAll("label").remove()
            var line_svg = d3.select(".line_vis")
              .append("svg")
              .attr("id", "delete")
              .attr("width", lwidth + lmargin.left + lmargin.right)
              .attr("height", lheight + lmargin.top + lmargin.bottom)
              .append("g")
              .attr("transform",
                    `translate(${lmargin.left}, ${lmargin.top})`);
            drawLineBG()
            createCheckBox(umapData, data, index);
        }
          else if(selected == "percentage of people living under $10 a day"){
            console.log(selected)
            index = "headcount_ratio_1000"
            d3.select("#delete").remove()
            d3.selectAll("label").remove()
            var line_svg = d3.select(".line_vis")
              .append("svg")
              .attr("id", "delete")
              .attr("width", lwidth + lmargin.left + lmargin.right)
              .attr("height", lheight + lmargin.top + lmargin.bottom)
              .append("g")
              .attr("transform",
                    `translate(${lmargin.left}, ${lmargin.top})`);
            drawLineBG()
            createCheckBox(umapData, data, index);
        }
          else if(selected == "percentage of people living under $20 a day"){
            console.log(selected)
            index = "headcount_ratio_2000"
            d3.select("#delete").remove()
            d3.selectAll("label").remove()
            var line_svg = d3.select(".line_vis")
              .append("svg")
              .attr("id", "delete")
              .attr("width", lwidth + lmargin.left + lmargin.right)
              .attr("height", lheight + lmargin.top + lmargin.bottom)
              .append("g")
              .attr("transform",
                    `translate(${lmargin.left}, ${lmargin.top})`);
            drawLineBG()
            createCheckBox(umapData, data, index);
        }
      })

      updateCheckbox();
});

function updateCheckbox(){
    // the selected countries will come to the top of the list
    var list = $("ul"),
    origOrder = list.children();

    list.on("click", ":checkbox", function() {
        var i, checked = document.createDocumentFragment(),
            unchecked = document.createDocumentFragment();
        for (i = 0; i < origOrder.length; i++) {
            if (origOrder[i].getElementsByTagName("input")[0].checked) {
                checked.appendChild(origOrder[i]);
            } else {
                unchecked.appendChild(origOrder[i]);
            }
        }
        list.append(checked).append(unchecked);
    });
    
    // add searchbox to let it be more user-friendly
    var searchBox = document.getElementById("cInput").addEventListener("keyup", keyUp)

    function keyUp(){
      var input, filter, ul, li, i, txtValue;
      input = document.getElementById('cInput');
      filter = input.value.toUpperCase();
      ul = document.getElementById('myUl');
      li = ul.getElementsByTagName('label');

      for (i = 0; i < li.length; i++) {
        //a = li[i].getElementsByTagName("a")[0];
        txtValue = li[i].textContent || li[i].innerText;
        if (txtValue.toUpperCase().indexOf(filter) > -1) {
          li[i].style.display = "";
        } else {
          li[i].style.display = "none";
        }
      }
    }
}

// main function to create scatterplot
Promise.all([
  d3.csv("./data/umap.csv"),
  d3.csv("./data/mds.csv")
]).then(function([umap_data, mds_data]){

  draw_dr(umap_data, ".dr_UMAP");
  draw_dr(mds_data, ".dr_MDS");

});

// this function is the creation of dr scatterplot
function draw_dr(data, path){
  const margin = {top: 20, right: 5, bottom: 20, left: 42};
  const width = 550 - margin.left - margin.right;
  const height = 550 - margin.top - margin.bottom;
  const xValue = (d) => {return +d["0"]};
  const yValue = (d) => {return +d["1"]};

  // uncomment following lines to see the brush effect
  // const brush = d3.brush()
  //     // .extent([ [0, 0], [400, 400] ])
  //     .on("start brush end", brushed)

  const svg = d3.select(path)
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
          `translate(${margin.left}, ${margin.top})`);
  
  // Add X axis
  const x = d3.scaleLinear()
    .domain([d3.min(data, xValue), d3.max(data, xValue)])
    .range([ 0, width ]);
  svg.append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(x));

  // Add Y axis
  const y = d3.scaleLinear()
    .domain([d3.min(data, yValue), d3.max(data, yValue)])
    .range([ height, 0]);
  svg.append("g")
    .call(d3.axisLeft(y));

  // Add a tooltip div. It cannot be seen by default.
  const tooltip = d3.select(path)
    .append("div")
    .style("opacity", 0)
    .attr("class", "tooltip")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "1px")
    .style("border-radius", "5px")
    .style("padding", "10px")

  // A function that change this tooltip when the user hover a point, use opacity to show it.
  const mouseover = function(event, d) {
    tooltip
      .style("opacity", 1)
    d3.select(this)
      .style("stroke", "black")
      .style("opacity", 1)
      .style("fill", "black")
    d3.selectAll('#dot_for_' + d.country.replace(/\s+|'/g,""))
      .style("stroke", "black")
      .style("opacity", 1)
      .style("fill", "black")
  }

  const mousemove = function(event, d) {
    tooltip
      .html("Country: " + d.country)
      .style("left", (event.x) + "px")
      .style("top", (event.y) + "px")
  }

  // A function that change this tooltip when the leaves a point: just need to set opacity to 0 again
  const mouseleave = function(event,d) {
    tooltip
      .style("opacity", 0)
    d3.select(this)
      .style("stroke", "white")
      .style("opacity", 0.6)
      .style("fill", "red")
    d3.selectAll('#dot_for_' + d.country.replace(/\s+|'/g,""))
      .style("stroke", "white")
      .style("opacity", 0.6)
      .style("fill", "red")
  }

  // Add dots
  const circle = svg.append('g')
    .attr("id", "dr_gs")
    .selectAll("circle")
    .data(data)
    .join("circle")
      .attr("cx", function (d) { return x(d["0"]); } )
      .attr("cy", function (d) { return y(d["1"]); } )
      .attr("r", 5)
      .attr('id', function (d) { return 'dot_for_' + d.country.replace(/\s+|'/g,""); })
      .attr("class", "dr_circle")
      .style("fill", 'red')
      .style("opacity", 0.6)
      .style("stroke", "white")
  
  // add tooltips for mouse movement
  d3.selectAll('.dr_circle')
    .on("mouseover", mouseover )
    .on("mousemove", mousemove )
    .on("mouseleave", mouseleave )
  
  // uncomment the following lines to see brush effect
  // svg.call(brush)

  // function brushed({selection}) {
  //   let value = [];
  //   if (selection) {
  //     const [[x0, y0], [x1, y1]] = selection;
  //     value = circle
  //       .style("stroke", "gray")
  //       .filter(d => x0 <= x(d.x) && x(d.x) < x1 && y0 <= y(d.y) && y(d.y) < y1)
  //       .style("stroke", "steelblue")
  //       .data();
  //   } else {
  //     circle.style("stroke", "steelblue");
  //   }
  //   svg.property("value", value).dispatch("input");
  // }
};
