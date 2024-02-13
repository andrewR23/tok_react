import React, { useEffect, useRef, useState } from 'react';
import { Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material';
import './styles.css'; // 

// import { makeStyles } from '@material-ui/core/styles';


const MakerTable = ({flowselected}) => {

  let selectedRef = useRef([ ])
  let flowRef = useRef([ ])

  let commonmakers = [ ];
  let remaining = [ ];


    useEffect(() => { 
      flowRef.current = flowselected[0]
      selectedRef.current = flowselected[1]
      filter( )


        ///flowRef = [{ id: 1, name: 'John' } ];

    }, [ ])

    useEffect(() => {       
      //console.log ("update maker table", flowselected)
      //console.log ("maker table ", flowselected);

     flowRef.current = flowselected[0]
     selectedRef.current = flowselected[1]
     filter ( )

    }, [flowselected])

    function filter ( ) { 
      commonmakers = selectedRef.current.filter (d => flowRef.current.includes (d)== true);
      remaining = selectedRef.current.filter (d => flowRef.current.includes (d)== false);


    }





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
          <TableRow key={row.id} className="flowRow">
              <TableCell className="id_col table_cell">{row.id}</TableCell>            
              <TableCell className="table_cell">{row.name}</TableCell>
          </TableRow>
        ))}

        {/*{selectedRef.current.map((row) => (
          <TableRow key={row.id}className="selectedRow">
              <TableCell className="id_col table_cell">{row.id}</TableCell>            
              <TableCell className="table_cell">{row.name}</TableCell>
         </TableRow>
         ))}*/}

  
      </TableBody>
    </Table>
    </div>
  );
};

export default MakerTable;
