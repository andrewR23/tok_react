import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { select } from 'd3-selection';

// -- material UI stuff -- // 

import {Button, Icon, IconButton, AddIcon } from '@mui/material';
import AcUnitOutlinedIcon from '@mui/icons-material/AcUnitOutlined';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import ExpandCircleDownOutlinedIcon from '@mui/icons-material/ExpandCircleDownOutlined';
import BubbleChartOutlinedIcon from '@mui/icons-material/BubbleChartOutlined';
import WorkspacesOutlinedIcon from '@mui/icons-material/WorkspacesOutlined';
//
import SwapVertIcon from '@mui/icons-material/SwapVert';
import SwapVerticalCircleIcon from '@mui/icons-material/SwapVerticalCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import ClearIcon from '@mui/icons-material/Clear';
import ArrowCircleDownIcon from '@mui/icons-material/ArrowCircleDown';
import HeightIcon from '@mui/icons-material/Height';

import ExpandCircleDownIcon from '@mui/icons-material/ExpandCircleDown';
import { ThemeProvider, createTheme } from '@mui/material/styles';

const NavBar = ({ data, rowData, handleNavBarBlocks, handleNavBarLayout, handleNavBarMove, handleNavBarRemove}) => {
  let svgRef = useRef(null);
  let scaleAmt = 0.19

  const minSpace = 30;
  const maxSpace = 75;
  const spaceScale = useRef(d3.scaleLinear());
  const yvals = useRef([ ])
  const labels = useRef([])
  const layoutItems = useRef([ ])

  const [selected, setSelected] = useState( null); 


  // -- a custom theme
  const theme = createTheme({
        palette: {
          primary: {
            main: '#ff5722', // Replace with your desired color
            light:'#ff0000' // a test 
          },
        },
  });


  // --- // 
  useEffect(() => {     
      // convert values from data
      yvals.current = [ ]
      yvals.current.push (0) ; // start with 0 
      for (let i=1; i<data.length; i++) { 
          let ydiff = data[i] - data[i-1];
          let val = ydiff > 200 ? maxSpace : minSpace
          yvals.current.push (val + yvals.current[i-1])
      }
      //console.log ("row data = ", rowData)
      //console.log (" navbar data = " , data)
      //console.log ("Y VALUES = ", yvals.current)

      let titles = rowData.map (d => d.query.att)
      labels.current = titles;
      //console.log ("titles = ", labels.current)


      // I need to convert the bar spacing into a max 
      drawBars( )
  }, [data, rowData])

  // --- // 
  useEffect( ()=> { 
    // create an array of layout items 
    layoutItems.current = ['force', 'linear', 'grid']

    // conver the yposition of the bar into a scaled version...
    // spaceScale.current = d3.scaleLinear()
    //                         .domain([0, 8000])
    //                         .range([0, 600]);
    //minSpace = 12; 
    //maxSpace = 50; 


  }, [])


  const drawBars= () => { 

    // -- blocks 
     d3.select(svgRef.current)
          .selectAll('.navblock')
          .data(yvals.current)  
          .transition( )
          .delay(0)
          .duration(2000)
          .attr('class', 'navblock')
          .attr ('y', (d, i)=> { 
            return d;
            //return spaceScale.current(d)
            //return d * scaleAmt
          })

      // -- line connecting blocks -- 
      d3.select(svgRef.current)
          .selectAll('.navline')
          .data(yvals.current)  
          .transition( )
          .delay(0)
          .duration(2000)
          .attr('class', 'navline')
          .attr ('x1', 35)
          .attr ('x2', 35)
          .attr ('y1', (d,i) => { 
              // start y : start at the foot of THIS item
              let ystart = yvals.current [i] + 12 

              return ystart;
             return -20
            })
          .attr ('y2', (d, i)=> { 
            // end y : strt of the NEXT item 
            //console.log ('yvals = ', yvals.current[i])
            let yend = i >= yvals.current.length-1 ? yvals.current [i] + 12 : yvals.current [i+1] ; 
            return yend;

          })


      // -- layout circles -- // 
      d3.select(svgRef.current)
          .selectAll('.layoutcircle')
          .data(layoutItems.current)  
          .attr('class', 'layoutcircle')
          .transition()
          .delay(0)
          .duration(2000)
          .attr ('cy', (d, i) => { 
            return yvals.current[yvals.current.length-1] + ((i+1)*30)+10;
       })

 
      // -- expand / collapse
      d3.select(svgRef.current)
          .selectAll('.expandCollapse')
          .data(yvals.current)  
          .transition( )
          .delay(0)
          .duration(2000)
          .attr('class', 'expandCollapse')
          .attr ('cy', (d, i)=> { 
            return d + 7; 
          })

    // -- remove button -- 
      d3.select(svgRef.current)
          .selectAll('.removeBtn')
          .data(yvals.current)  
          .transition( )
          .delay(0)
          .duration(2000)
          .attr('class', 'removeBtn')
          .attr ('cy', (d, i)=> { 
            return d + 7; 
          })
      //-- expand icon
       d3.select(svgRef.current)
          .selectAll('.expandicon')
          .data(yvals.current)  
          .transition( )
          .delay(0)
          .duration(2000)
          .attr('class', 'expandicon')
          .attr ('y', (d, i)=> { 
            return d -12; 
          })

      //-- remove icon
       d3.select(svgRef.current)
          .selectAll('.removeicon')
          .data(yvals.current)  
          .transition( )
          .delay(0)
          .duration(2000)
          .attr('class', 'removeicon')
          .attr ('y', (d, i)=> { 
            return d -12; 
          })


      // -- text -- //     
      // -- text on a block --
      d3.select(svgRef.current)
          .selectAll('.blockLabel')
          .data(yvals.current)  
          .attr('class', 'blockLabel')
          .transition()
          .delay(0)
          .duration(2000)
          .attr('y', (d, i)=> d+10) 
          .attr('fill', 'gray')
          .text((d, i) => labels.current[i])

      // -- text on layout items --
      d3.select(svgRef.current)
          .selectAll('.layoutLabel')
          .data(layoutItems.current)  
          .attr('class', 'layoutLabel')
          .transition()
          .delay(0)
          .duration(2000)
          .attr('fill', 'black')
          .attr ('y', (d, i) => { 
            return yvals.current[yvals.current.length-1] + (i+1)*30+14;
          })

     

 

  
  }


  return (
    <g ref={svgRef}>


      

      {/* -- rect for the bars --  */}

      {data.map((d, i) => {
        return (




           // --  rectangle for each of the bars.. // 
          <g key={i}>

              {/* -- material icon --  */}
         <ThemeProvider theme={theme}>
            <foreignObject x={-40} y={10} width={2000} height={2000} className='removeicon'>   
                  <IconButton color="primary"   
                              disableRipple ={true}
                              onClick={(event)=>{
                                  setSelected(i)
                                  handleNavBarRemove(i)
                                }

                    }>
                   <CancelIcon sx={{ width: 20, height: 20 }} />
                  </IconButton>
            </foreignObject>


           <foreignObject x={-15} y={10} width={2000} height={2000} className='expandicon'>   
                  <IconButton color="primary" 
                              disableRipple = {true}
                              onClick={(event)=>{
                                  setSelected(i)
                                  handleNavBarBlocks(i+1, false)
                                }
                  } >
                  <ExpandCircleDownIcon sx={{ width: 20, height: 20 }} />
                  </IconButton>
            </foreignObject>

          </ThemeProvider>



            
      
            <rect 
              fill={i === selected ? '#ff5722' : 'PowderBlue'}
              x = {20}
              y = {10}
              width = {30}
              height = {12}
              className="navblock"
                onClick={(event) => {
                  setSelected(i)
                  handleNavBarMove(i, null);
                }}
                onMouseOver={(event) => {
                   event.target.style.cursor = 'pointer';
                }}
                onMouseOut={(event) => {
                    event.target.style.cursor = 'default';
                }}
            />

            <line
              className="navline"
              x1 = {35}
              y1 = {10}
              x2 = {35}
              y2 = {10}
              strokeWidth = {2}
              stroke = {"PowderBlue"}
            />


            <text 
                x = {55}  
                y = {10} 
                className="blockLabel"
                textAnchor={"start"}
                fontSize= {"11px"} 
              >
              {"..."}
            </text>

            {/* -- expand collapse circle --  
            <circle 
              fill={i === selected ? 'Red' : 'PowderBlue'}
              cx = {5}
              cy = {10}
              r = {6}
              className="expandCollapse"
              onClick={(event) => {
                //setSelected(i)
                //handleNavBarBlocks(i+1, false)

              }} // expand bar //
            />

            <circle 
              fill={i === selected ? 'Red' : 'PowderBlue'}
              cx = {-15}
              cy = {10}
              r = {6}
              className="removeBtn"
              onClick={(event) => {
                //setSelected(i)
                //handleNavBarRemove(i)

              }} // expand bar //
            />
            -- */}
         
      
          </g>


        );
      })}


    {/* -- circles to change layout --  */}

    {layoutItems.current.map((d, i) => { 
        return (
          <g key={i+100}>

             {/* <foreignObject x={-24} y={-24+((i*40)+150)} width={100} height={100}>
                <WorkspacesOutlinedIcon    style={{ fill: i === selected ? 'Red' : 'Black',     fontSize: '34px'  }}/>
            </foreignObject>*/}
     

            <circle
              cx ={35}
              cy = {200}
              r ={8}
              className="layoutcircle"
              fill={selected === i+100 ? '#ff5722' : 'PowderBlue'}
              onClick={(event) => {
                setSelected(i+100)
                handleNavBarMove(-1, d)
              }} 
              onMouseOver={(event) => {
                event.target.style.cursor = 'pointer';
              }}
              onMouseOut={(event) => {
                event.target.style.cursor = 'default';
              }}
            />

             <text 
                x = {53}  
                y = {35} 
                className="layoutLabel"
                textAnchor={"start"}
                fontSize= {"11px"} 
                style={{ fontStyle: 'italic' }}
              >
              {d.toLowerCase()}
            </text>

          </g>

        )

      })}

    </g>
  );
};


export default NavBar;


