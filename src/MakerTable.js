import React, { useEffect, useRef, useState } from 'react';
import { Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material';
import './table.css'; // Import your custom CSS file
// import styled from 'styled-components';

// import { makeStyles } from '@material-ui/core/styles';


const MakerTable = ({selectedmakers, flowmakers}) => {

  let pathsRef = useRef([ ])
  let flowRef = useRef([ ])

    let data = [
      { id: 1, name: 'John', age: 25 },
      { id: 2, name: 'Jane', age: 30 },
      { id: 3, name: 'Bob', age: 40 },
    ];

    useEffect(() => { 
        flowRef = [{ id: 1, name: 'John' } ];

    }, [ ])

    useEffect(() => { 
      pathsRef.current = selectedmakers
      flowRef.current = flowmakers
      console.log ('selectedmakers ',  pathsRef.current)
      console.log ('flowmaker ', flowRef.current)


    }, [selectedmakers, flowmakers])





  return (
    <div className="table_container">
    <Table className="my_table"> 
      <TableHead>
        <TableRow>
          <TableCell className="id_col table_cell">ID</TableCell>
          <TableCell className="table_cell">Name</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {flowRef.current.map((row) => (
          <TableRow key={row.id}>
              <TableCell className="id_col table_cell">{row.id}</TableCell>            
              <TableCell className="table_cell">{row.name}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
    </div>
  );
};

export default MakerTable;
