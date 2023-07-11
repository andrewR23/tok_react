import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';


// a bar is a row of makers.. each one is build from the row data. 
// one bar = one row of makers -- //
// each bar has a row of makers a data set from the row data.. 
const DateComponent = ({ daterange }) => {
   const chartRef = useRef(null);
  let svg;
  // -- 
  //let yAxisGroup, yAxis;
  let yAxisRef = useRef(null);
const dateScaleRef = useRef(null);

  

  useEffect(()=> { 
      svg = d3.select(chartRef.current)
     console.log ('date range!! = ', daterange)

      dateScaleRef.current = d3.scaleLinear()

      // set the size of the node according to date -- 
      dateScaleRef.current.domain([daterange[0], daterange[1]]).range ([0, 1000]) ; // y pos 


      //let c = svg.append('circle').attr('cx', 100).attr('cy', 100).attr('r', 100)
      /// -- this sort of works -- // 
      //yAxis = d3.axisLeft(dateScaleRef.current);
      //yAxisGroup = svg.append("g").attr('class', 'yaxis').attr("transform", `translate(${100}, ${0})`).call(yAxis);
      // ----------------------------//


      //--  Select or create the y-axis group
      let yAxisGroup = svg.select('.yaxis');
      if (yAxisGroup.empty()) {
        yAxisGroup = svg.append('g').attr('class', 'yaxis');
      }

      // Update the y-axis
      const yAxis = d3.axisLeft(dateScaleRef.current)
         //.tickValues(d3.timeYears(new Date(1600, 0, 1), new Date(1920, 0, 1))) // Set the tick values
        // .tickFormat(d3.timeFormat('%Y')); // Format ticks as years
   
      yAxisGroup.attr('transform', `translate(${50}, ${20})`).call(yAxis);

  }), [daterange ]





return (
    <g ref={chartRef} transform="translate(0, 100) scale(1)"></g>
  );

};


export default DateComponent;