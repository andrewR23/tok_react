import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';


// a bar is a row of makers.. each one is build from the row data. 
// one bar = one row of makers -- //
// each bar has a row of makers a data set from the row data.. 
const ColorKeyComponent = ({ colorScale, linkGroups  }) => {
    const chartRef = useRef(null);
    let svg;
    
  

  useEffect(()=> { 
      svg = d3.select(chartRef.current)

      let colourkeys = colorScale.domain( );
        let colourvals = colorScale.range ( );

      const colourKey = svg.append ('g')
          .attr("class", "legend")
          .attr("width", 100)
          .attr("height", 50)
          .attr("transform", "translate(10, 100), rotate(-90, 0, 0)"); // Adjust the positioning as needed

      const keyItems = colourKey.selectAll(".legend-item")
          .data(colourkeys)
          .enter()
          .append("g")
          .attr("class", "legend-item")
          .attr("transform", (d, i) => `translate(20, ${i * 30 })`);

      keyItems.append("rect")
          .attr("x", 0)
          .attr("y", 0)
          .attr("width", 20)
          .attr("height", 20)
          .style("fill", (d, i) => colourvals[i]);

        keyItems.append("text")
                .attr("x", 0)
                .attr("y", 0)
                .text(d => d)
                .style('fill', '#cfd8dc')
                .style('font-size', '16px')
                .style('text-transform', 'lowercase')
                .style('font-family', 'sans-serif')
                .style('visibility', 'visible')
                .attr('transform', 'rotate(30, 0, 0), translate(30, 0)');




  }), []


 


return (
    <g ref={chartRef} transform="translate(2100, 1000) scale(1.2)"></g>
  );

};


export default ColorKeyComponent;