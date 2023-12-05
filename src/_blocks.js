import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { select } from 'd3-selection';
// import * as  Vec2D from 'victor';
// import * as f from './functions.js';
import { Tooltip, Typography } from '@mui/material';
// import {AddIcon} from '@material-ui/icons/Add';
// import AddIcon from '@mui/icons-material/Add';


let blockH = 40; 
let delay = 500; 
let duration = 1500


const BlockGroup = ({ data, ypos, index, widths, rowinfo, rowSelection, handleBarData, handleBlockSelection, handleBlockRoll, handleRollOut,
                        removeRow, handleUIClick}) => {
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
      //console.log ('row info =', rowinfo)
      //console.log ('row selection = ', rowSelection); // row selection is more important...

      drawBlocks( );
      handleBarData(locs.current, subLocs.current, data, index, [...widths], rowSelection) 
  }, [data])


  useEffect( () =>{

  }, [ ])



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
          .attr('class', 'blockGroupLrg')
          .transition()
          .delay(delay)
          .duration(duration) // (2000)
          .attr ('transform', (d, i) => { 
              let locXY =  calcSpacing(widths, i);
              return `translate(${locXY[0]}, ${locXY[1]}) scale(${1})`
           }) 


      // -- draw the BLOCK (rect)  inside the GROUP -- // 
      d3.select(svgRef.current)
          .selectAll('.blockLrg')
          .data(data)  
          .attr('class', 'blockLrg')
          .transition()
          .delay(delay)
          .duration(duration) // (2000)
          .attr('width', (d, i) => { 
            return widths[i]; 
            }) //  
          .attr('opacity', 0.3)



      // -- draw the BLOCK Tet)  inside the GROUP -- // 
      d3.select(svgRef.current)
          .selectAll('.blockText')
          .attr('class', 'blockText')
          .transition()
          .delay(delay)
          .duration(duration) // (2000)
          .attr('x', 0)
          .attr('y', ypos+blockH*.8)
          .attr('fill', 'gray')



    d3.select(svgRef.current)
          .selectAll('.blockTextSelections')
          .attr('class', 'blockTextSelections')
          .transition()
          .delay(delay)
          .duration(duration) // (2000)
          .attr('x', 10)
          .attr('y', ypos-7)
          .attr('fill', 'gray')


        d3.select(svgRef.current)
          .selectAll('.buttonExpand')
          .attr('class', 'buttonExpand')
          .transition()
          .delay(delay)
          .duration(duration) // (2000)
          .attr('cx',2500+900)
          .attr('cy', ypos+blockH/2 )

        d3.select(svgRef.current)
          .selectAll('.buttonHide')
          .attr('class', 'buttonHide')
          .transition()
          .delay(delay)
          .duration(duration) // (2000)
          .attr('cx',2500+900+60)
          .attr('cy', ypos+blockH/2 )


  }


  function handleRemoveRow ( ) {
      removeRow( )
  };

  function clickRect ( ) { 

    //console.log ("clicked rect");
    //ypos += 100
  }




  return (
    <g ref={svgRef}>

      <text 
        x = {-1000}  
        y = {-10} 
        className="blockText"
        fontSize= {"36px"} 
        textAnchor={"end"}>
        {rowinfo.title.toUpperCase( )}
      </text>

      <text 
        x = {-1000}  
        y = {-10} 
        className="blockTextSelections"
        fontSize= {"36px"} 
        >
        {rowinfo.values.toUpperCase( )}
      </text>

      <circle
        cx ={-1000}
        cy = {0}
        r ={blockH/2}
        // height = {blockH}
        className="buttonExpand"
        fill = {"gray"}
        onClick={(event) => handleUIClick( 'buttonExpand', index, rowSelection)}

        />

        <circle
        cx ={-1000}
        cy = {0}
        r ={blockH/2}
        // height = {blockH}
        className="buttonHide"
        fill = {"darkgray"}
        //onClick={() => clickRect( )}
        onClick={(event) => handleUIClick('buttonHide', index, rowSelection)}


        />


      {data.map((d, i) => {

        let sub_widths = [0, 0, 0]; 
        let total_width = widths[i]
        //console.log ("total width = ", widths[i]);
        //console.log ("total nodes = ", d.nodes.length);
        //console.log ("data for block = ", d)

        if (total_width > 0) { 
             d.nodes_sorted.forEach ((n,i) => { 
            let percentWidth = n.length/d.nodes.length * total_width
            sub_widths[i] =  percentWidth; //(percentWidth);
          })
        }


        return (

          <BlockItemLarge
              key={i}
              id={i}
              index={index}
              ypos={ypos}
              nodes={d.nodes}
              nodes_sorted={d.nodes_sorted}
              blockVal={d.value}
              rowValues = {rowSelection.values}
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


const BlockItemLarge = ({id, index, ypos, nodes, nodes_sorted, sub_widths, blockVal, rowValues,
          handleSubBlocks, handleBlockSelection, handleBlockRoll, handleRollOut} ) => {
  let groupRef = useRef(null);
  let sublocs = useRef ([ ]); // xy loc of blocks (base)

  // get the row selection (array)


      // ---------- // 

      useEffect( () => { 
        //console.log ('sub_widths  = ', sub_widths)
        //console.log ("row values: ", rowValues); // a string of user selected items in row ... // 
       // console.log ("block val ", blockVal); // the 'type' value (e.g. 'microscope' or 'London')
        drawBlockItems( );

        // send sub-block values - do this with wid values
        handleSubBlocks(sublocs.current, id)
      
      },[nodes_sorted])


      // function calcWidth (item ) { 
      //   return item.length * 10
      // }



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

      // -- draw a block for each of the nodes_sorted elements
      const drawBlockItems = ( ) => { 
           d3.select(groupRef.current)
              .selectAll('.blockitem')
              .data(nodes_sorted)  
              .attr('class', 'blockitem')
              .transition( )
              .delay(delay)
              .duration(duration) //(2000)
              .attr('x', (d, i)  => { return calcXPos2(sub_widths, i)}) // { return calcXPos(nodes_sorted, i) })
              .attr('y', 0)
              .attr('width', (d,i) => sub_widths [i]) // d.length*10)
              .attr('height', blockH)
              .attr ('fill', (d,i)  => { 
                    // 0 = flow, 1 = paths 3 = none
                    let vals = rowValues.split(" ") 
                    let hasValue = vals.includes (blockVal)

                    let c0 = "OrangeRed" //"OrangeRed"
                    let c1 = "PowderBlue"
                    let c2 = "lightgray"

                    if (hasValue == false) c0 = "Gray"
                    return i === 0 ?  c0  : i === 1 ? c1 : i === 2 ? c2 : "black";
                    //return i === 0 ?  "OrangeRed"  : i === 1 ? "Gold" : i === 2 ? "PowderBlue" : "black";
              })
              .attr('opacity', 0.8)


          // d3.select(groupRef.current)
          //     .selectAll('.blockitemLine')
          //     .data(nodes_sorted)  
          //     .attr('class', 'blockitemLine')
          //     .transition( )
          //     .delay(delay)
          //     .duration(duration) //(2000)
          //     .attr('x1', (d, i)  => { return calcXPos2(sub_widths, i)})
          //     .attr('x2', (d, i)  => { return calcXPos2(sub_widths, i) + sub_widths [i]})
          //     .attr('stroke', (d, i)=> { 
          //           // 0 = flow, 1 = paths 3 = none
          //           let vals = rowValues.split(" ") 
          //           let hasValue = vals.includes (blockVal)

          //           let c0 = "OrangeRed"
          //           let c1 = "PowderBlue"
          //           let c2 = "lightgray"

          //           if (hasValue == false) c0 = "DodgerBlue"
          //           return i === 0 ?  c0  : i === 1 ? c1 : i === 2 ? c2 : "black";

          //           //return "red"
          //     })
            



      }

      // set the position of the sub items - the block items -- // 
      // ---- //
      const handleMouseOver = (grp, sub, event) => {
         //console.log ("bar index = ", index )
         //console.log ("group index = ", grp)
         console.log ("mouse over bar");
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
    <g transform={`translate(${0}, ${0})`} ref={groupRef} className="blockGroupLrg">
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

    <g>
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

    {/*  <line
        key={id+1000}
        x1={0}
        y1={blockH+20}
        x2={50}
        y2={blockH+20}
        className="blockitemLine"
        stroke={"black"}
        strokeWidth={10}
        />
*/}


     </g>
    );
};




export default BlockGroup;






