import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { select } from 'd3-selection';
// import * as  Vec2D from 'victor';
// import * as f from './functions.js';
import { Tooltip, Typography } from '@mui/material';


let blockH = 40; 


const BlockGroup = ({ data, ypos, index, widths, rowinfo, handleBarData, handleBlockSelection, handleBlockRoll, handleRollOut,
                        removeRow}) => {
  let svgRef = useRef(null);
  
  let locs = useRef ([ ]); // xy loc of blocks (base)
  let subLocs = useRef ( [ ]);
  //let widthsRef = useRef ([ ])




  const [locsState, setLocsState] =  useState([ ]); 
  const [subLocState, setSubLocState] =  useState([ ]); 
  // -- perhaps move this one level up -- 
  //const [widthState, setWidths] = useState([])


  useEffect(() => {   
      //console.log ("block data = ", data)
      drawBlocks( );
      handleBarData(locs.current, subLocs.current, data, index, [...widths]) 
  }, [data])


  useEffect( () =>{


  }, [ ])

  // -- TO REMOVE -- // 
      // function calcWidths (items) { 
      //     let totalWidth = 2000
      //     let widths  = [...items].map (d => d.nodes.length); 
      //     const sumValue = widths.reduce((acc, curr) => acc + curr, 0);
      //     widths = widths.map (d => { 
      //       return Math.ceil (d / sumValue * totalWidth)  ; 
      //     })
      //     return  widths;
      // }

      // -- // 
      // function calcWidth (item) { 
      //     return item.nodes.length * 10;
      // }
      // -- // 


  function handleSubBlocks (sublocs, id) { 
    subLocs.current[id] = sublocs

  }

  function rollTest ( ) { 
    console.log ("roll test ")

  }

  // -- user interaction -- /// 
  // const handleMouseOverBlock = ( ) => {
  //       console.log ("mouse over main block");
  // };

  useEffect(()=> { 
      //console.log ("handle update")
  }, [locsState])



  // -- TO REMOVE -- // 
    // -- calc spacing and update locs -- // 
    // function calcSpacing (data, i) { 
    //     let spacing = 5; 
        
    //     const sum = data
    //         .slice(0, i) // Get the preceding items
    //         .reduce((acc, curr) => acc + spacing + calcWidth(curr), 0);
        
    //     const gx = sum + spacing; 
    //     const gy = ypos

    //     locs.current[i] = [gx, gy]
    //     return [gx, gy]
    // }

  // -- calc spacing from widths -- 
  function calcSpacing (widths, i) { 
      let spacing = 8; 
      const sum = widths
              .slice(0, i)
              .reduce((acc, curr) => acc + spacing + curr, 0); 

      const gx = sum + spacing;  
      const gy = ypos

      locs.current[i] = [gx, gy];
      return [gx, gy];
  }

  // -- draw group positions -- // 
  const drawBlocks = () => { 

      // -- set GROUP position and spacing 
      const groupTransition = d3.select(svgRef.current)
          .selectAll('.blockGroupLrg')
          .data(data)  
          //.data(widths)  
          .attr('class', 'blockGroupLrg')
          .transition()
          .delay(1000)
          .duration(4000) // (2000)
          .attr ('transform', (d, i) => { 
              //let locXY = calcSpacing(data, i);  
              let locXY =  calcSpacing(widths, i);
              return `translate(${locXY[0]}, ${locXY[1]}) scale(${1})`
           }) 


      // -- draw the  -- 
      d3.select(svgRef.current)
          .selectAll('.blockLrg')
          .data(data)  
          //.data (widths)  
          .attr('class', 'blockLrg')
          .transition()
          .delay(1000)
          .duration(4000) // (2000)
          //.attr('width', d => d.nodes.length*10) 
          .attr('width', (d, i) => { 
            return widths[i]; 
            }) //  
          .attr('opacity', 0.3)

  }


  function handleRemoveRow ( ) {
      removeRow( )
  };




  return (
    <g ref={svgRef}>

      <text x = {10}  y = {ypos-10} fontSize= {"36px"} >
        {rowinfo.toUpperCase( )}
      </text>
      <rect 
          x={-80} 
          y={ypos+10} 
          width={50}
          height={5}
          fill={"darkgray"}
          onClick={() => handleRemoveRow( )}

        />


      {data.map((d, i) => {

        let sub_widths = [0, 0, 0]; 
        let total_width = widths[i]
        //console.log ("total width = ", widths[i]);
        //console.log ("total nodes = ", d.nodes.length);

        if (total_width > 0) { 
             d.nodes_sorted.forEach ((n,i) => { 
            let percentWidth = n.length/d.nodes.length * total_width
            sub_widths[i] = percentWidth; //(percentWidth);
          })
        }

        // -- TO REMOVE -- // 
            //console.log (sub_widths)
            //console.log ('---------------')

            // calculate widths for each subblock. 
            // currently length for each subblock is number of makers * 10 

            // I need it to be a percentage (always adding to 100.. )
            // Actually this has to be 3 % values. 

            // -- total width = widths[i] (max)
            // -- total no. of makers = d.nodes.length; 
            // -- 


        return (
          <BlockItemLarge
              key={i}
              id={i}
              index={index}
              ypos={ypos}
              nodes={d.nodes}
              nodes_sorted={d.nodes_sorted}
              sub_widths={sub_widths}
              handleSubBlocks = {handleSubBlocks}
              handleBlockSelection = {handleBlockSelection}
              handleBlockRoll={handleBlockRoll} // handleBlockRoll or rollTest
              handleRollOut={handleRollOut}
          />

        );
      })}

    </g>
  );
};


const BlockItemLarge = ({id, index, ypos, nodes, nodes_sorted, sub_widths, handleSubBlocks, 
                             handleBlockSelection, handleBlockRoll, handleRollOut} ) => {
  let groupRef = useRef(null);
  let sublocs = useRef ([ ]); // xy loc of blocks (base)


      // ---------- // 

      useEffect( () => { 
        //console.log ('sub_widths  = ', sub_widths)
        drawBlockItems( );

        // send sub-block values - do this with wid values
        handleSubBlocks(sublocs.current, id)
      
      },[nodes_sorted])


      function calcWidth (item ) { 
        return item.length * 10
      }



      function calcXPos (nodes_data, i) { 
          const xpos = nodes_data
              .slice(0, i) // Get the preceding items
              .reduce((acc, curr) => acc + calcWidth(curr), 0);

          sublocs.current[i] = xpos
          return  xpos; 
      }



      function calcXPos2 (nodes_data, i) { 
          const xpos = nodes_data
              .slice(0, i) // Get the preceding items
              .reduce((acc, curr) => acc + curr, 0);

          sublocs.current[i] = xpos
          return  xpos;
      }

      // draw a block for each of the nodes_sorted elements
      const drawBlockItems = ( ) => { 
           d3.select(groupRef.current)
              .selectAll('.blockitem')
              .data(nodes_sorted)  
              .attr('class', 'blockitem')
              .transition( )
              .delay(1000)
              .duration(4000) //(2000)
              .attr('x', (d, i)  => { return calcXPos2(sub_widths, i)}) // { return calcXPos(nodes_sorted, i) })
              .attr('y', 0)
              .attr('width', (d,i) => sub_widths [i]) // d.length*10)
              .attr('height', blockH)
              .attr ('fill', (d,i)  => { 
                    // 0 = flow, 1 = paths 3 = none
                    return i === 0 ?  "OrangeRed"  : i === 1 ? "PowderBlue" : i === 2 ? "lightgray" : "black";

                    //return i === 0 ?  "OrangeRed"  : i === 1 ? "Gold" : i === 2 ? "PowderBlue" : "black";
              })
              .attr('opacity', 0.8)
      }

      // set the position of the sub items - the block items -- // 
      // ---- //
      const handleMouseOver = (grp, sub, event) => {
         //console.log ("bar index = ", index )
         //console.log ("group index = ", grp)
         //console.log ("mouse over bar", nodes_sorted);
         handleBlockRoll( index, grp, sub, event);

      };

      const handleMouseOut = (id) => {
          //console.log (" ROLL OUT start ")
          handleRollOut( );
      }

      function handleMouseClick(n, i) {
         //console.log ("bar index = ", index )
         //console.log ("group index = ", id)
         //console.log ('item index', i)
        // console.log ('----------------')
         handleBlockSelection(index, id,  i, nodes_sorted[i]); // update the selection the rows.. 
 
      };

  // --------- // 
  return (
      // -- a block group -- 
    <g transform={`translate(${0}, ${ypos})`} ref={groupRef} className="blockGroupLrg">
      <rect
        key={id}
        x={0}
        y={0}
        width={0} 
        height={blockH}
        fill="gray"
        className="blockLrg"
        onMouseOver={() => handleMouseOver(id)}

      />
      { nodes_sorted.map ((d, i) => {
            //console.log ('id = ', id)
            let n = parseFloat(`${id}${i}`)
            return <BlockItem key={n} id={n} grpIndex={id} subIndex={i} handleMouseOver={handleMouseOver}  
                                      handleMouseClick={handleMouseClick} handleMouseOut={handleMouseOut} />
        }) }
    </g>
    );
};


const BlockItem = ({id,  subIndex, grpIndex, handleMouseOver, handleMouseClick, handleMouseOut}) => {
 //let svgRef = useRef(null);

  return (
      // -- nested block (rect)
      <rect
        key={id}
        x={0}
        y={0}
        width={0}  
        height={blockH}
        fill="red"
        className="blockitem"
        onClick={() => handleMouseClick(grpIndex, subIndex)}
        onMouseOver={(event) => handleMouseOver(grpIndex, subIndex, event)}
       onMouseLeave={()  => handleMouseOut(id)}
      />
    );
};




export default BlockGroup;






