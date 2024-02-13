
import React, { useState } from 'react';

// materialUI 
import { FormControl, InputLabel, Select, MenuItem, Button, Icon, IconButton } from '@mui/material';
import { grey } from '@mui/material/colors';
import { blueGrey } from '@mui/material/colors';

// icons materialUI 
import DeleteIcon from '@mui/icons-material/Delete';

// styles 
import { createTheme, ThemeProvider } from '@mui/material/styles';
import './styles.css'; // Import your custom CSS file

// import SwitchCameraIcon from '@mui/icons-material/SwitchCamera';


const FilterForm = ({ onFilterChange, onFilterReset, onFilterGroups, onAddRow}) => {
  const [selectedType, setSelectedType] = useState('guilds');
  const [selectedValue, setSelectedValue] = useState('_none');
  const [selectedRow, setSelectedRow] = useState('');


  // const guitheme = createTheme({
  //     palette: {
  //       primary: { main: grey[200]},
  //       secondary: {main: '#11cb5f'},
  //     },
  //   });


  const handleTypeChange = (event) => {
    setSelectedType(event.target.value);
  };

  const handleValueChange = (event) => {
    setSelectedValue(event.target.value);
  };

  const handleFilterClick = () => {
    onFilterChange(selectedType, selectedValue);
  };

  const handleResetClick = () => {
    onFilterReset( ); 
  };

  const handleGroupsClick = ( ) => { 
    onFilterGroups(2, 100); // min - max
  }

  const handleAddRow = ( event) => { 
    //console.log ('add item', event.target.value)
    onAddRow(event.target.value )
  }

  return (

    <div>
          <div  className="dropdown-container">
      {/*      <ThemeProvider theme={guitheme}>*/}
            <FormControl>
              {/*<InputLabel>Type</InputLabel>
                <Select value={selectedType} className="dropdown-menu" onChange={handleTypeChange}>
                  <MenuItem value="guilds" className="menu-item">Guilds</MenuItem>
                  <MenuItem value="advertised_instruments"  className="menu-item">Ad Inst</MenuItem>
                  <MenuItem value="known_instruments"  className="menu-item">Known Instr</MenuItem>
                </Select>
            </FormControl>

            <FormControl>
              {/*<InputLabel>Value</InputLabel>*/}


                <Select 
                    value={selectedValue} 
                    className="dropdown-menu" 
                    onChange={handleValueChange}
                  >
                    <MenuItem value="_none"           className="menu-item">None</MenuItem>
                    <MenuItem value="Blacksmiths"     className="menu-item">Blacksmiths</MenuItem>
                    <MenuItem value="Clockmakers"     className="menu-item">Clockmakers</MenuItem>
                    <MenuItem value="Spectaclemakers" className="menu-item">Spectaclemakers</MenuItem>
                </Select>
           

            </FormControl>

              <Button 
                  variant="outlined" 
                  startIcon={<DeleteIcon/>}
                  className="formButton" 
                  onClick={handleFilterClick}
                  >
                   Filter
              </Button>
              <Button 
                  variant="outlined" 
                  color="primary" 
                  className="formButton" 
                  onClick={handleResetClick}
                  >
                  Undo Filter
              </Button>
              <Button 
                  variant="outlined" 
                  color="primary" 
                  className="formButton" 
                  onClick={handleGroupsClick}
                  // style={{ marginLeft: '40px', marginRight: '130px' }}
                  >
                  Remove small groups
              </Button>





{/*
              <FormControl>
                  <Select 
                    value={selectedRow} 
                    className="dropdown-menu" 
                    onChange={handleAddRow}
                  >
                    <MenuItem value="" disabled>  Add Row Type</MenuItem>
                    <MenuItem value="towns" className="menu-item">Towns</MenuItem>
                    <MenuItem value="guilds" className="menu-item">Guilds</MenuItem>
                    <MenuItem value="advertised_instruments" className="menu-item">Advertised Instruments</MenuItem>
                    <MenuItem value="known_instruments" className="menu-item">Known Instruments</MenuItem>
                  </Select>
             </FormControl>*/}

          {/*   <Button variant="contained" color="primary" className="formButton" onClick={handleAddRow}
              style={{ marginRight: '10px', marginLeft: '10px' }}>
              + Row
            </Button>*/}

            {/*</ThemeProvider>*/}

          </div>
    </div>
  );
};

export default FilterForm;
