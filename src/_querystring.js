
import React, { useState, useEffect } from 'react';
import './styles.css'; // Import your custom CSS file


const QueryString = ( {querystring} ) => {
  // State to hold the dynamic text
  const [dynamicText, setDynamicText] = useState('');


   useEffect (( ) => { 
       setDynamicText (querystring)


    }, [querystring])






  return (

    // <div className="query-string">
    // {dynamicText}
    // </div>
    <g className="query-string">
    <text x = {10}  y = {25} >
      {dynamicText}
    </text>
    </g>

  );
};

export default QueryString;
