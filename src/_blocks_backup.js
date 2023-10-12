import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { select } from 'd3-selection';
// import * as  Vec2D from 'victor';
// import * as f from './functions.js';


let blockH = 40; 


const BlockGroup = ({ data, ypos, index, handleBarData, handleBlockSelection}) => {
  let svgRef = useRef(null);
  
  let locs = useRef ([ ]); // xy loc of blocks (base)
  let subLocs = useRef ( [ ]);
  let widthsRef = useRef ([ ])


  const [locsState, setLocsState] =  useState([ ]); 
  const [subLocState, setSubLocState] =  useState([ ]); 
  // -- perhaps move this one level up -- 
  const [widthState, setWidths] = useState([])


  useEffect(() => { 
       //console.log ('block data ', data)
      // map data into widths... normalise
      
      // let widtharray = calcWidths(data); /// create array of widths
      // widthsRef.current = widtharray;
      // setWidths (widtharray)
  
      drawBlocks( );
      handleBarData(locs.current, subLocs.current, data, index) 
  }, [data])


  useEffect( () =>{


  }, [ ])





  function calcWidths (items) { 
      let totalWidth = 2000
      let widths  = [...items].map (d => d.nodes.length); 

      const sumValue = widths.reduce((acc, curr) => acc + curr, 0);
      widths = widths.map (d => { 
        return Math.ceil (d / sumValue * totalWidth)  ; 
      })
      return  widths;
  }

  // -- // 
  function calcWidth (item) { 
      return item.nodes.length * 10;
  }

    // -- // 


  function handleSubBlocks (sublocs, id) { 
    subLocs.current[id] = sublocs

  }

  useEffect(()=> { 
      //console.log ("handle update")
  }, [locsState])




  // -- calc spacing and update locs -- // 
  function calcSpacing (data, i) { 
      let spacing = 5; 
      
      const sum = data
          .slice(0, i) // Get the preceding items
          .reduce((acc, curr) => acc + spacing + calcWidth(curr), 0);
      
      const gx = sum + spacing; // i * 300 + 60 
      const gy = ypos

      locs.current[i] = [gx, gy]
      return [gx, gy]
  }

  // -- calc spacing from widths -- 
  function calcSpacing2 (data, i) { 
      //console.log ("width data = ", data);
      let spacing = 5; 
      const sum = data
              .slice(0, i)
              .reduce((acc, curr) => acc + spacing + curr, 0); 

      const gx = sum + spacing; // i * 300 + 60 
      const gy = ypos

      locs.current[i] = [gx, gy]; // SAVE LOCS
      return [gx, gy];
  }

  // -- draw group positions -- // 
  const drawBlocks = () => { 



      // -- set GROUP position (ORG view)
      const groupTransition = d3.select(svgRef.current)
          .selectAll('.blockGroupLrg')
          .data(data)  
          //.data(widthsRef.current)  
          .attr('class', 'blockGroupLrg')
          .transition()
          .duration(2000)
          .attr ('transform', (d, i) => { 
              let locXY = calcSpacing(data, i);  
              //let locXY =  calcSpacing2(widthsRef.current, i);
              d.width = locXY[0];
              return `translate(${locXY[0]}, ${locXY[1]}) scale(${1})`
           }) 


      // -- draw the rectangles -- 
      d3.select(svgRef.current)
          .selectAll('.blockLrg')
          .data(data)  
          //.data (widthsRef.current)  /// draw from width arary
          .attr('class', 'blockLrg')
          .transition()
          .duration(2000)
          .attr('width', d => d.nodes.length*10) 
          //.attr('width', d => d) //  
          .attr('opacity', 0.3)

  }


  return (
    <g ref={svgRef}>

      {data.map((d, i) => {
        //console.log ("something...")
        return (
          <BlockItemLarge
              key={i}
              id={i}
              index={index}
              ypos={ypos}
              nodes={d.nodes}
              nodes_sorted={d.nodes_sorted}
              width={10}
              handleSubBlocks = {handleSubBlocks}
              handleBlockSelection = {handleBlockSelection}
          />

        );
      })}
    </g>
  );
};


const BlockItemLarge = ({id, index, ypos, nodes, nodes_sorted, width, handleSubBlocks, handleBlockClick, handleBlockSelection} ) => {
  let groupRef = useRef(null);
  let sublocs = useRef ([ ]); // xy loc of blocks (base)


      // ---------- // 

      useEffect( () => { 
        // the data 
        //console.log ('my width = ', width)
        drawBlockItems( );

        // send sub-block values - do this with wid values
        handleSubBlocks(sublocs.current, id)
      
      },[nodes_sorted])


      function calcWidth (item ) { 
        return item.length * 10
      }



      function calcXPos (nodes_data, i) { 
          const xsum = nodes_data
              .slice(0, i) // Get the preceding items
              .reduce((acc, curr) => acc + calcWidth(curr), 0);

          sublocs.current[i] = xsum
          return  xsum;
      }

      // draw a block for each of the nodes_sorted elements
      const drawBlockItems = ( ) => { 
           d3.select(groupRef.current)
              .selectAll('.blockitem')
              .data(nodes_sorted)  
              .attr('class', 'blockitem')
              .transition( )
              .duration(2000)
              .attr('x', (d, i)  => { return calcXPos(nodes_sorted, i) })
              .attr('y', 0)
              .attr('width', d => d.length*10)
              .attr('height', blockH)
              .attr ('fill', (d,i)  => { 
                    // 0 = flow, 1 = paths 3 = none
                    return i === 0 ?  "OrangeRed"  : i === 1 ? "Gold" : i === 2 ? "PowderBlue" : "black";
              })
              .attr('opacity', 0.8)
      }

      // set the position of the sub items - the block items -- // 
      // ---- //
      const handleMouseOver = (id) => {
        console.log ("mouse over bar", nodes_sorted) 
      };

      function handleMouseClick(n, i) {
        // console.log ("bar index = ", index )
        // console.log ("group index = ", id)
        // console.log ('item index', i)
        // console.log ('----------------')
        handleBlockSelection(index, id,  i, nodes_sorted[i]);
 
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
      />

      { nodes_sorted.map ((d, i) => {
            let n = parseFloat(`${id}${i}`)
            return <BlockItem key={n} id={n}  handleMouseOver={handleMouseOver}  handleMouseClick={handleMouseClick} i={i}/>
        }) }
    </g>
    );
};


const BlockItem = ({id, handleMouseOver, handleMouseClick,  i}) => {
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
        onMouseOver={() => handleMouseOver(id)}
        onClick={() => handleMouseClick(id, i)}

      />
    );
};




export default BlockGroup;






