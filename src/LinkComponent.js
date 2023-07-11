import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';



const LinkComponent = ({ linkdata, pathlinkdata, flowlinkdata, onData } ) => {
  let svgRef = useRef(null); // this is the thing that gets updated.. 
  let svg; 
  // -- 

  // this item needs to get the block DOM from 

  // useEffect(()=> { 

  //   let svg = d3.select(svgRef.current)
  //   let domItem =  svg.append ('circle').attr('cx', 100).attr('cy', 100).attr('r', 100)

  //   handleClick( );

  // }), [ ]


useEffect(() => { 
    svg = d3.select(svgRef.current);

    //drawPath( )    

    if (linkdata!= null) {
    let linkGen = d3.linkVertical();

    // ---------------- // 
    let base_paths = svg.selectAll(".multiLink2").data(linkdata)

    base_paths
        .transition( )
        .duration (1000)
        .attr("d", linkGen)
        .attr("fill", "none")
        .attr("stroke-width", d => d.count)
        .attr("stroke", "PowderBlue")
        .attr("opacity", 0.2)


    base_paths.enter ( )
        .append("path")
        .attr("class", 'multiLink2')
         .transition( )
        .duration (1000)
        .attr("d", linkGen)
        .attr("fill", "none")
        .attr("stroke-width", d => d.count)
        .attr("stroke", "PowderBlue")
        .attr("opacity", 0.2)

     base_paths.exit( )
        .transition( )
        .duration (1000)
        .attr("stroke-width", 0)



    let poss_paths = svg.selectAll(".multiLink3").data(pathlinkdata)

    poss_paths
        .transition( )
        .duration (1000)
        .attr("d", linkGen)
        .attr("fill", "none")
        .attr("stroke-width", d => d.count)
        .attr("stroke", "gold")
        .attr("opacity", 0.5)


    poss_paths.enter ( )
        .append("path")
        .attr("class", 'multiLink3')
         .transition( )
        .duration (1000)
        .attr("d", linkGen)
        .attr("fill", "none")
        .attr("stroke-width", d => d.count)
        .attr("stroke", "gold")
        .attr("opacity", 0.5)

     poss_paths.exit( )
        .transition( )
        .duration (1000)
        .attr("stroke-width", 0)



    let flow_paths = svg.selectAll(".multiLink4").data(flowlinkdata)

    flow_paths
        .transition( )
        .duration (2000)
        .attr("d", linkGen)
        .attr("fill", "none")
        .attr("stroke-width", d => d.count)
        .attr("stroke", "red")
        .attr("opacity", 0.9)


    flow_paths.enter ( )
        .append("path")
        .attr("class", 'multiLink4')
         .transition( )
        .duration (2000)
        .attr("d", linkGen)
        .attr("fill", "none")
        .attr("stroke-width", d => d.count)
        .attr("stroke", "red")
        .attr("opacity", 0.9)

     flow_paths.exit( )
        .transition( )
        .duration (2000)
        .attr("stroke-width", 0)
       

    }



}, [linkdata, pathlinkdata, flowlinkdata]);


function drawPath( ) { 

      const testlinkdata = [
        { source: [0, 0], target: [275, 25], count:10 },
        { source: [10, 0], target: [275, 85], count: 100 },
        { source: [20, 0], target: [2375, 285], count: 2 },
    ];

    console.log (testlinkdata)


    let linkGen = d3.linkHorizontal();
      svg.selectAll(".multiLink")
    .data(testlinkdata)
    .join("path")
    .attr("d", linkGen)
    .attr("fill", "none")
    .attr("class", 'multiLink')
    .attr("stroke-width", d => d.count)
    .attr("stroke", "PowderBlue")
    .attr("opacity", 0.3)



  }

  // generate random number 
  const handleClick = () => {
    const randomNumber = Math.floor(Math.random() * 100);
  //  onData(randomNumber);
  };





 return (
    <g ref={svgRef}transform="translate (50, 0) scale(1)"></g>
  );
};


export default LinkComponent;