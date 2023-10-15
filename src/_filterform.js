
import React, { useState } from 'react';
import { FormControl, InputLabel, Select, MenuItem, Button } from '@mui/material';
import './styles.css'; // Import your custom CSS file


const FilterForm = ({ onFilterChange, onFilterReset, onFilterGroups, onAddRow}) => {
  const [selectedType, setSelectedType] = useState('guilds');
  const [selectedValue, setSelectedValue] = useState('_none');
  const [selectedRow, setSelectedRow] = useState('');

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
    onFilterGroups(1, 20)
  }

  const handleAddRow = ( event) => { 
    console.log ('add item', event.target.value)
    onAddRow(event.target.value )
  }

  const butstyle = { 
    padding: '1px', fontSize: '12px', height: '20px', width: '100px'
  }

  return (
    <div  className="dropdown-container">
      <FormControl>
        {/*<InputLabel>Type</InputLabel>*/}
        <Select value={selectedType} className="dropdown-menu" onChange={handleTypeChange}
         style={butstyle}>
          <MenuItem value="guilds" className="menu-item">Guilds</MenuItem>
          <MenuItem value="advertised_instruments"  className="menu-item">Ad Inst</MenuItem>
          <MenuItem value="known_instruments"  className="menu-item">Known Instr</MenuItem>

        </Select>
      </FormControl>

      <FormControl>
        {/*<InputLabel>Value</InputLabel>*/}
        <Select value={selectedValue} className="dropdown-menu" onChange={handleValueChange}
         style={butstyle}>
          <MenuItem value="_none"  className="menu-item">None</MenuItem>
          <MenuItem value="Blacksmiths" className="menu-item">Blacksmiths</MenuItem>
          <MenuItem value="Clockmakers" className="menu-item">Clockmakers</MenuItem>
          <MenuItem value="Spectaclemakers" className="menu-item">Spectaclemakers</MenuItem>
        </Select>
      </FormControl>

      <Button variant="contained" color="primary" className="formButton" onClick={handleFilterClick}
      style={butstyle}>
       Apply Filter
      </Button>
      <Button variant="contained" color="primary" className="formButton" onClick={handleResetClick}
      style={butstyle}>
       Undo Filter
      </Button>
      <Button variant="contained" color="primary" className="formButton" onClick={handleGroupsClick}
        style={ { marginRight: '130px', marginLeft: '40px' , fontSize: '12px', height: '20px'} }>
        Remove small groups
      </Button>

        <FormControl>
        {/*<InputLabel>Value</InputLabel>*/}
        <Select value={selectedRow} className="dropdown-menu" onChange={handleAddRow}>
          <MenuItem value="" disabled>  Add Row Type</MenuItem>
          <MenuItem value="towns" className="menu-item">Towns</MenuItem>
          <MenuItem value="guilds" className="menu-item">Guilds</MenuItem>
          <MenuItem value="advertised_instruments" className="menu-item">Advertised Instruments</MenuItem>
          <MenuItem value="known_instruments" className="menu-item">Known Instruments</MenuItem>

        </Select>
      </FormControl>
    {/*   <Button variant="contained" color="primary" className="formButton" onClick={handleAddRow}
        style={{ marginRight: '10px', marginLeft: '10px' }}>
        + Row
      </Button>*/}
    </div>
  );
};

export default FilterForm;
