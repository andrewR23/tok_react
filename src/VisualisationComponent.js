import React, { useEffect, useRef, useState } from 'react';
import { barChart } from './d3Vis.js';
import * as d3 from 'd3';

const VisualizationComponent = ({ data }) => {
  const svgRef = useRef(null); // this is the thing that gets updated.. 

  // updated when data is updated // 
  useEffect(() => {
    //console.log ('update data')
    const svg = d3.select(svgRef.current)
    // --  draw bar chart 
    barChart(svg, data); 

    // -- add interaction -- //
    svg.selectAll('.bar').on('click', handleClick);

 



  }, [data]);


  const handleClick = (event, d) => {
    // Handle click event here
    console.log('Clicked on bar:', d);
    // Perform any desired action or state update
  };


  return (
    <svg ref={svgRef} width={400} height={200}>
      {/* SVG container for visualization */}
    </svg>
  );
};


export default VisualizationComponent;