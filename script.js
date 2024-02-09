// Load the data files
const EDUCATION_FILE =
  "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json";
const COUNTY_FILE =
  "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json";

Promise.all([d3.json(COUNTY_FILE), d3.json(EDUCATION_FILE)])
  .then((data) => ready(data[0], data[1]))
  .catch((err) => console.log(err));

function ready(us, education) {
  const svg = d3.select("svg");
  const path = d3.geoPath();

  // Define the color scale
  const colorScale = d3
    .scaleQuantize()
    .domain([0, 100])
    .range(d3.schemeGreens[9]);

  // Append counties to the SVG
  svg
    .append("g")
    .attr("class", "counties")
    .selectAll("path")
    .data(topojson.feature(us, us.objects.counties).features)
    .enter()
    .append("path")
    .attr("class", "county")
    .attr("data-fips", (d) => d.id)
    .attr("data-education", (d) => {
      const result = education.find((obj) => obj.fips === d.id);
      return result ? result.bachelorsOrHigher : 0;
    })
    .attr("fill", (d) => {
      const educationValue =
        education.find((obj) => obj.fips === d.id)?.bachelorsOrHigher || 0;
      return colorScale(educationValue);
    })
    .attr("d", path)
    .on("mouseover", function (event, d) {
      // Show tooltip on mouseover
      const tooltip = d3.select("body").append("div").attr("id", "tooltip");
      tooltip.transition().duration(200).style("opacity", 0.9);
      tooltip
        .html(() => {
          const result = education.find((obj) => obj.fips === d.id);
          if (result) {
            return `${result.area_name}, ${result.state}: ${result.bachelorsOrHigher}%`;
          }
          return "Data not available";
        })
        .style("left", event.pageX + "px")
        .style("top", event.pageY + "px")
        .attr("data-education", () => {
          const result = education.find((obj) => obj.fips === d.id);
          return result ? result.bachelorsOrHigher : 0;
        }); // Add data-education attribute
    })
    .on("mouseout", function () {
      // Hide tooltip on mouseout
      d3.select("#tooltip").remove();
    });

  // Create legend
  const legend = svg
    .append("g")
    .attr("id", "legend")
    .attr("transform", "translate(575, 15)");

  const legendWidth = 300;
  const legendHeight = 15;

  const legendScale = d3.scaleLinear().domain([0, 100]).range([0, legendWidth]);

  const legendAxis = d3
    .axisBottom(legendScale)
    .tickValues(colorScale.domain()) // Use color scale domain as tick values
    .tickFormat((d) => `${d}%`);

  legend
    .append("g")
    .attr("transform", `translate(0, ${legendHeight})`) // Adjusted y position
    .call(legendAxis)
    .select(".domain")
    .remove();

  legend
    .selectAll("rect")
    .data(colorScale.range())
    .enter()
    .append("rect")
    .attr("x", (d, i) => i * (legendWidth / 9))
    .attr("y", 0) // Adjusted y position
    .attr("width", legendWidth / 9)
    .attr("height", legendHeight)
    .attr("fill", (d) => d);
}
