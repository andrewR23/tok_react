
import React, { useState } from 'react';
import { FormControl, InputLabel, Select, MenuItem, Button } from '@mui/material';
// import './styles.css'; // Import your custom CSS file




const FilterForm = ({ onFilterChange, onFilterReset, onFilterGroups }) => {
  const [selectedType, setSelectedType] = useState('guilds');
  const [selectedValue, setSelectedValue] = useState('_none');

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
        style={{ marginRight: '100px', marginLeft: '100px' , fontSize: '12px', height: '20px'}}>
        Remove small groups
      </Button>
    </div>
  );
};

export default FilterForm;
