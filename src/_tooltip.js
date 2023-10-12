// Tooltip.js
import React from 'react';
import { Paper, Typography } from '@mui/material';
// import { Tooltip, Typography } from '@mui/material';


const Tooltip = ({ x, y, content }) => {
  return (
    <Paper style={{ position: 'absolute', left: x, top: y, padding: '4px' }}>
      <Typography variant="caption">{content}</Typography>
    </Paper>
  );
};

export default Tooltip;
