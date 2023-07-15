import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';


// a bar is a row of makers.. each one is build from the row data. 
// one bar = one row of makers -- //
// each bar has a row of makers a data set from the row data.. 
const KeyComponent = ({ daterange,  }) => {
    const chartRef = useRef(null);
    let svg;
    
  

  useEffect(()=> { 
      svg = d3.select(chartRef.current)



  }), [daterange]


 


return (
    <g ref={chartRef} transform="translate(0, 100) scale(0.9)"></g>
  );

};


export default KeyComponent;