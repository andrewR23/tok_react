import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { select } from 'd3-selection';

// -- material UI stuff -- // 
import {FormControl, Box, Select, MenuItem, Button, Icon, IconButton, AddIcon, InputLabel, Typography } from '@mui/material';


import AcUnitOutlinedIcon from '@mui/icons-material/AcUnitOutlined';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import ExpandCircleDownOutlinedIcon from '@mui/icons-material/ExpandCircleDownOutlined';
import BubbleChartOutlinedIcon from '@mui/icons-material/BubbleChartOutlined';
import WorkspacesOutlinedIcon from '@mui/icons-material/WorkspacesOutlined';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

import { ThemeProvider, createTheme } from '@mui/material/styles';


const FloatingNavBar = ({ypos, onAddRow}) => {
  let svgRef = useRef(null);

  let delay = 500 * 1; 
  let duration = 1500 * 1; 
  let xpos = 1600; // /2 * (1/3); 
  
  const [selectedValue, setSelectedValue] = useState('_none');


    // -- a custom theme
  const theme = createTheme({
        palette: {
          primary: {
            main: '#ff5722', // Replace with your desired color
          },
        },
  });



   const handleChange = (e) => {
    setSelectedValue(e.target.value);
  };

  const handleAddRow = (event) => {
      console.log ("event = ", event)
     //setSelectedValue(event.target.value);
    onAddRow(selectedValue); // event.target.value )
    // setSelectedValue('')

  };
 

  useEffect(()=> { 
    drawNavItem ( )
  }, [ypos])



  const drawNavItem= () => { 

      // -- draw circle -- 
      d3.select(svgRef.current)
          .selectAll('.navCircle')
          .attr('class', 'navCircle')
          .transition()
          .delay(delay)
          .duration(duration) // (2000)
          .attr('cy', ypos+200) 
          .attr('cx', xpos)

      d3.select(svgRef.current)
          .selectAll('.navGroup')
          .attr('class', 'navGroup')
          .transition()
          .delay(delay)
          .duration(duration) // (2000)
          .attr ('transform', `translate(${xpos}, ${ypos}) scale(${2.2})`)




     
  }


  return (
      <g ref={svgRef}  key={'navgroup'} >


        <g 
            className={'navGroup'} 
            transform={`translate(${0}, ${0}) scale(3)`} >
         <ThemeProvider theme={theme}>

            {<foreignObject x={0} y={0} width={2000} height={2000}>   

                  <Box sx={{ width: '1000px', padding: 2, margin: 2 }}> 
                    <FormControl sx={{width:'150px'}}>
                      
                        <InputLabel id="dropdown-label">
                                Add New Row
                        </InputLabel>                        
                        
                        <ThemeProvider theme={theme}>
                        <Select 
                            label="Select New Row"
                            value={selectedValue} 
                           // onChange={handleAddRow}
                            onChange={handleChange}
                          >
                            <MenuItem value="" disabled>  Select New Row</MenuItem>
                            <MenuItem value="towns" className="menu-item">Towns</MenuItem>
                            <MenuItem value="guilds" className="menu-item">Guilds</MenuItem>
                            <MenuItem value="advertised_instruments" className="menu-item">Advertised Instruments</MenuItem>
                            <MenuItem value="known_instruments" className="menu-item">Known Instruments</MenuItem>
                         </Select>
                          </ThemeProvider>
                </FormControl>


                <IconButton color="primary" onClick={handleAddRow}>
                            <AddCircleIcon sx={{ width: 40, height: 40 }} />
                </IconButton>
              </Box>
            </foreignObject>}
                    </ThemeProvider>


        </g>



      </g>
  );

}

export default FloatingNavBar;


