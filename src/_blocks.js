import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { select } from 'd3-selection';

// import * as  Vec2D from 'victor';
// import * as f from './functions.js';

// material icons -- 
import { Tooltip, Typography } from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';


let blockH = 60; 
let delay = 500 * 1; 
let duration = 1500 * 1; 


const BlockGroup = ({ data, ypos, prevY, index, widths, rowinfo, rowSelection, handleBarData, handleBlockSelection, handleBlockRoll, handleRollOut,
                         handleUIClick, handleBarDataV2}) => {
  let svgRef = useRef(null);

  
  let locs = useRef ([ ]); // xy loc of blocks (base)
  let subLocs = useRef ( [ ]);
  //let widthsRef = useRef ([ ])
  let rowTextItems = useRef ([])


  const [locsState, setLocsState] =  useState([ ]); 
  const [subLocState, setSubLocState] =  useState([ ]); 
  // -- perhaps move this one level up -- 
  //const [widthState, setWidths] = useState([])

  const [yPos, setYpos] = useState(ypos)
  const [yPosPrev, setYposPrev] = useState(prevY)


  useEffect(() => {   
      //console.log ("block data = ", data)
      //console.log ('row info =', rowinfo)
      //console.log ("widths = ", widths)
      //console.log ('row selection = ', rowSelection); // row selection is more important...

      rowTextItems.current = rowinfo.values.split(' '); 
      //console.log ("items", rowTextItems.current)



      drawBlocks( ); // calc spacing...
      handleBarData(locs.current, subLocs.current, data, index, [...widths], rowSelection) 

      // -- when data is updated the bar is update
      //handleBarDataV2( ) 
  }, [data])


  useEffect( () =>{
      //handleBarDataV2( ) 
      setYpos (ypos)
      setYposPrev (prevY)

      drawBlocks( ); // calc spacing...

      //console.log ("rowInfo  ", rowinfo)
  }, [ypos])



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

       // d3.select(svgRef.current)
       //    .selectAll('.blockTextBackground')
       //    .attr('class', 'blockTextBackground')
       //    .transition()
       //    .delay(delay)
       //    .duration(duration) // (2000)
       //    .attr('x', 0)
       //    .attr('y', ypos + 10 *2) // ypos+blockH*.8)
       //    .attr('fill', 'blue')

      d3.select(svgRef.current)
          .selectAll('.blockText')
          .attr('class', 'blockText')
          .transition()
          .delay(delay)
          .duration(duration) // (2000)
          .attr('x', 0)
          .attr('y', ypos + blockH*1.7) // (ypos+blockH *2)-20) // ypos+blockH*.8)
          .attr('fill', 'black')


     d3.select(svgRef.current)
          .selectAll('.groupTextSelection')
          .attr('class', 'groupTextSelection')
          .transition()
          .delay(delay)
          .duration(duration) // (2000)
          .attr('transform', (d, i)=> { 
            return `translate(${100}, ${ypos-7}) rotate(-30)`
          })



    // d3.select(svgRef.current)
    //       .selectAll('.blockTextSelections')
    //       .attr('class', 'blockTextSelections')
    //       .transition()
    //       .delay(delay)
    //       .duration(duration) // (2000)
    //       .attr('x', 0) // x y is set by the group.
    //       .attr('y', 0) //+blockH*1.5)
    //       .attr('fill', 'black')
    //       .attr('opacity', (d, i)=> { 
    //         let yDiff =  ypos - prevY; 
    //         let alpha = yDiff < 200 ? 0 : 1 
    //         return alpha
    //       })



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


        d3.select(svgRef.current)
          .selectAll('.buttonRemove')
          .attr('class', 'buttonRemove')
          .transition()
          .delay(delay)
          .duration(duration) // (2000)
          .attr('x',-60) //2500+800+0)
          .attr('y', ypos)


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

     {/*  <rect
        className="blockTextBackground"
        x = {0}  
        y = {40} 
        width= {200}
        height={100}
        fill= 'red'
      />
*/}
      <text 
        x = {-1000}  
        y = {-10} 
        className="blockText"
        // style={{ fontFamily: 'Arial', fontSize: '144px', fontWeight: 'bold', fill: 'red'}}
        textAnchor={"start"}
        fill='black'
        >
        {rowinfo.title.toUpperCase( )}
      </text>


{/*
        {rowTextItems.current.map((d, i) => {

          return (
            <g transform={'translate(0, 0) rotate(0)'} className='rowTextGrp' key={i}>

                <text 
                  x = {230}  
                  y = {100} 
                  className="rowTextItem"
                  fontSize= {"36px"} 
                  >
                  {"some text"}
                </text>
                <rect
                  key={i}
                  x={0}
                  y={100}
                  width={60}
                  height={20}
                  fill={'blue'}
                />
            </g>
          );
        })}*/}


      {/*THIS WAS THE SELECTED TEXT */}
      
      {/*     
        <g transform={'translate(0, 0) rotate(0)'} className='groupTextSelection'>
        <text 
          x = {-1000}  
          y = {-10} 
          className="blockTextSelections"
          fontSize= {"36px"} 
          >
          {rowinfo.values.toUpperCase( )}
        </text>
        </g>
      */}

     
        {/* UI ELEMENTS (removed) */}
        {/* <circle
        cx ={-1000}
        cy = {0}
        r ={blockH/2}
        // height = {blockH}
        className="buttonExpand"
        fill = {"darkgray"}
        onClick={(event) => handleUIClick( 'buttonExpand', index, rowSelection)} // buttonExpand 
        />

        <circle
          cx ={-1000}
          cy = {0}
          r ={blockH/2}
          // height = {blockH}
          className="buttonHide"
          fill = {"gray"}
          //onClick={() => clickRect( )}
          onClick={(event) => handleUIClick('buttonHide', index, rowSelection)} // buttonHide
        />*/}

        {/* the 'remove' box */}
        {/* <rect
          x ={-1000}
          y = {0}
          width ={blockH}
          height = {blockH}
          // height = {blockH}
          className="buttonRemove"
          fill = {"dimGray"}
          //onClick={() => clickRect( )}
          onClick={(event) => handleUIClick('buttonRemove', index, rowSelection)} // buttonHide
        />*/}


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
              yPos={yPos}
              yPosPrev={yPosPrev}
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


const BlockItemLarge = ({id, index, yPos, yPosPrev, nodes, nodes_sorted, sub_widths, blockVal, rowValues,
          handleSubBlocks, handleBlockSelection, handleBlockRoll, handleRollOut} ) => {
  let groupRef = useRef(null);
  let sublocs = useRef ([ ]); // xy loc of blocks (base)

  // get the row selection (array)


      // ---------- // 

      useEffect( () => { 
        //console.log ("blockVal = ", blockVal)
        //console.log ("rowValues = ", rowValues)
       // console.log ('nodes sorted ', nodes_sorted, 'nodes,', nodes, '  id ', id)
        // console.log ('sub_widths  = ', sub_widths)
        // console.log ("row values: ", rowValues); // a string of user selected items in row ... // 
        // console.log ("block val ", blockVal); // the 'type' value (e.g. 'microscope' or 'London')
        drawBlockItems( );
        // send sub-block values - do this with wid values
        handleSubBlocks(sublocs.current, id)
      
      },[nodes_sorted])

      useEffect( () => { 
          //console.log ("UPDATE Y // PREV Y")
          drawBlockItems( );

      },[yPosPrev, yPos])


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


          // -- draw the text on the section 
          d3.select(groupRef.current)
              .selectAll('.sectionTextGrp')
              .attr('class', 'sectionTextGrp')
              .transition( )
              .delay(delay)
              .duration(duration)
              .attr ('transform', (d, i) =>{ 
                   return `translate(${-10}, ${-10}) rotate(${-90})`;
              })
              .attr ('fill', (d, i) => { 
                  //console.log ('vals ', blockVal, ' ', rowValues
                  if (nodes.length == 0) return 'white'
                  if (rowValues.includes(blockVal)) return 'black'
                  return 'gray'                  
              })
              .attr('opacity', (d, i)=> { 
                  if (nodes.length == 0) return 0
                  
                  // -- HIDE when rows are close -- 
                  //  let baseAlpha =0.8;
                  // if (!rowValues.includes(blockVal)) baseAlpha = 0.0
                  // let yDiff =  yPos - yPosPrev; 
                  // let alpha = yDiff < 200 ? 0 : baseAlpha

                  // -- NO HIDE -- // 
                  let alpha = 1; 
                  if (!rowValues.includes(blockVal)) alpha = 0.0
                  return alpha
              })

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
         //console.log ("mouse over bar");
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
      // -- a block group -- the entire block / section -- 
    <g>
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

        {/* text items for each of the sections */}
        <g transform={`translate(${-2000}, ${0}) rotate(${0})`} className='sectionTextGrp'>
          <text 
            x = {0}  
            y = {0} 
            className="sectionText"
            fontSize= {"38px"} 
            >
            {blockVal}
          </text>
        </g>



        { nodes_sorted.map ((d, i) => {
              //console.log ('id = ', id)
              let n = parseFloat(`${id}${i}`)
              return <BlockItem key={n} id={n} grpIndex={id} subIndex={i} handleMouseOver={handleMouseOver}  
                                        handleMouseClick={handleMouseClick} handleMouseOut={handleMouseOut} />
          }) }
      </g>
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
        onClick={() => {
              handleMouseClick(grpIndex, subIndex)
          }}
        onMouseOver={(event) => {
              event.target.style.cursor = 'pointer';
              handleMouseOver(grpIndex, subIndex, event)
          }}
        onMouseLeave={()  => {
              event.target.style.cursor = 'default';
              handleMouseOut(id)
        }}
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






