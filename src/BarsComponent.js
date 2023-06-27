import React, { useEffect, useRef, useState } from 'react';
import { barChart } from './d3Vis.js';
import * as d3 from 'd3';


// a bar is a row of makers.. each one is build from the row data. 
// one bar = one row of makers -- //
// each bar has a row of makers a data set from the row data.. 
const BarsComponent = ({ data, ypos }) => {
  const svgRef = useRef(null); // this is the thing that gets updated.. 
  // -- 

  useEffect(()=> { 

  }), [ ]

  //--  updated when data is updated // 
  useEffect(() => {
    // --  draw bar chart 
    // -- add interaction -- //

    console.log ('ypos = ', ypos)
    //console.log ("bar data = ", data); // map (m => m.nodes)) // this is the data.. 

    // draw data.. 
    const svg = d3.select(svgRef.current)
    let block = svg.selectAll ('.block').data (data)

   // -- Draw A Block for each data item 

  // -- update --  //I think this should be a group -- 

    // then add each node element into the group !!! 


  
        block
            .attr('y', ypos)
            .transition ( )
            .duration (1000)
            .attr('x', (d, i)  => { 
               const sum = data
                  .slice(0, i) // Get the preceding items
                  .reduce((accumulator, item) => accumulator + item.nodes.length+5, 0);
               return sum + 10
              }) 
          
            .attr('width', d => d.nodes.length + 1)
    
        // -- Enter new groups -- how the first enter -- 
        block
            .enter()
            .append('rect')
            .attr ('class', 'block')
            .attr('x', (d, i)  => { 
               const sum = data
                  .slice(0, i) // Get the preceding items
                  .reduce((accumulator, item) => accumulator + item.nodes.length+5, 0);
               return sum + 10
              }) 
            .attr('y', ypos)
            .attr('width', d => d.nodes.length + 1)
            .attr('height', 20)
            .attr('fill', 'DodgerBlue')

        // -- remove -- how they leave
        block.exit()
           .remove();


    // -- attach rect to each block - according to the number of nodes.. 

  // ------------------------------- // 
// MY GO 
  //  let bGroup = block.selectAll ('.bGroup').data (d => d.nodes)
     // let bGroup = svg.selectAll ('.bGroup').data(data).data(d => d.nodes)

  // bGroup
    //   .attr('x', 0)

    // bGroup.enter ( )
    //   .append('rect')
    //   .attr('class', 'bGroup')
    //   .attr ('x', 100)
    //   .attr ('y', 100)
    //   .attr ('width', 10)
    //   .attr ('height', 10)
    //   .attr ('fill', 'red')


    // bGroup.exit( )
    //     .remove( )
  
  // ------------------------------- // 
// AI2
    // let nodes = block.selectAll('.node')
    //         .data(d => d.nodes)
    //         .enter()
    //         .append('g')
    //         .attr('class', 'node');

    //   nodes.append('circle')
    //       .attr('cx', 100)// Example x-position based on index
    //       .attr('cy', 100) // Example y-position
    //       .attr('r', 10) // Example radius
    //       .attr('fill', 'red')
      
     // nodes.exit ( )
     //  .remove( )

  // ------------------------------- // 
// AI3
// let nodes = svg.selectAll('.node')
//   .data(data)
//   .selectAll('.node')
//   .data(d => d.nodes)
//   .enter()
//   .append('circle')
//   .attr('cx', 20) // Example x-position based on index
//   .attr('cy', 50) // Example y-position
//   .attr('r', 10) // Example radius
//   .style('fill', 'blue'); // Example fill color






  // ------------------------------- // 

    // enter // update // remove // 
    //drawBlocksV1 ( )



  }, [data]);

function drawBlocksV1 ( ) { 
      const svg = d3.select(svgRef.current)

      let block = svg.selectAll ('.block').data (data)

   // -- Draw A Block for each data item update -- 
        block
            .attr('y', ypos)
            .transition ( )
            .duration (1000)
            //.attr ('showdata', d => console.log (d.nodes_sorted))
            .attr('x', (d, i)  => { 
              // Calculate the sum of maker lengths
               const sum = data
                  .slice(0, i) // Get the preceding items
                  .reduce((accumulator, item) => accumulator + item.nodes.length+5, 0);
               return sum + 10
              }) 
          
            .attr('width', d => d.nodes.length + 1)

       
        // -- Enter new groups -- how the first enter -- 
        block
            .enter()
            .append('rect')
            .attr ('class', 'block')
            .attr('x', (d, i)  => { 
              // Calculate the sum of maker lengths
               const sum = data
                  .slice(0, i) // Get the preceding items
                  .reduce((accumulator, item) => accumulator + item.nodes.length+5, 0);
               return sum + 10
              }) 
            .attr('y', ypos)
            .attr('width', d => d.nodes.length + 1)
            .attr('height', 20)
            .attr('fill', 'DodgerBlue')
            // append sub-items here ?? 

        // -- remove -- how they leave
        block.exit()
           .remove();


    // V2-- draw block for each item in nodes_selected. 
    let blockGroup = svg.selectAll ('.blockgroup').data (data)
    console.log ('bg = ', data)
    // for each data item -draw a grou
    //let blockdata = blockGroup 
    blockGroup
            .attr ('x', 0)

     blockGroup.enter()
        //.append('g')
       // .merge(blockGroup)
       // .attr('class', 'blockgroup')
        .each(function (d) {
            d3.select(this)
                .selectAll('.blockitem')
                .data([d.nodes_sorted])
                .enter()
                .append('rect')
                .attr ('class', 'blockitem')
                // .attr('x', (d, i) => i * rectWidth)
                // .attr('y', 0)
                // .attr('width', rectWidth)
                // .attr('height', rectHeight);
        });



}


  return (
    <g ref={svgRef}></g>
  );

};


export default BarsComponent;