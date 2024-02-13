import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { select } from 'd3-selection';

let blockH = 20; 
let delay = 500; // 3000; 
let duration = 1300;

const Paths = ({ data, rowsY, index, handlePathRoll, handleRollOut}) => {
  let svgRef = useRef(null);
  //let offsetRef = useRef (offsets)

  //let links = useRef ([])
  const [links, setLinks] = useState ([])

  let linkdata = [ ]

  useEffect (()=> { 
    //console.log ("path data is updated ")
  }, [data])

  // useEffect(() => { 
  //       console.log ("update rows ", rowsY, " ", index)
  //       console.log ("links ", links)
  //       let linkstemp = [...links]

  //       linkstemp.forEach (link => { 
  //         link.source [1] = 0; 
  //         link.target [1] = 4000; 
  //       })
  //       console.log ("linkstemp ", linkstemp)

  //       //setLinks (linkstemp)
  //      // drawPaths( )
  //      //console.log ("update ypos = ", ypos ); // update ypos  -- 
  //      // update links.. (but just ypos elements.. )
  //      //let linkdataTemp = [...linkdata]


  // }, [rowsY])

  // -- generate links from data (& when rows are updated.. )
  useEffect(() => {     
        // --console.log ("1" , offsetRef.current)
         //data.forEach (d => console.log ('d = ', d.sourceLoc))
        //console.log ("path data " ,  data); // .map (d => { d.sourceLoc})); 

        // get the ROW that this path is from and to.. 

        // console.log ("path offsets", offsets)
        // console.log ("path index ", index)
        // console.log ('-----------------')

        // -- x offsets - count the makers -- // 
        let offset_tally_source = [ ]; 
        let offset_tally_target = [ ]; 

        // -- also keep a tally of the makers in each group -- // 
        let makers_tally_source = [ ] // keep a track of the numbers of makers in each group
        //let makers_tally_target = [ ]

        let makers_tally_target = [ ]

        // init -- // 
        for (let i=0; i<100; i++) { 
            let init_src = [0, 0, 0]
            let init_trg = [0, 0, 0]
            offset_tally_source.push(init_src)
            offset_tally_target.push(init_trg); // are these different lengths 
            // -- // 
            makers_tally_source.push ([[ ], [ ], [ ]]);
            //makers_tally_target.push ([ ]);

            makers_tally_target.push ([[ ], [ ], [ ]]);

        }


        // -- populate link data -- // 
        linkdata = [ ];

        data.forEach ((d, i) => { 
          //console.log ("this is the date:: ", d)
          let count = d.makers.length;
          
          /// - the base x y pos for source and target -- 
          let sx = d.sourceLoc[0] + d.sourceLocSorted[d.sourceGrp_sorted]; 
          let sy =  d.sourceLoc[1] + blockH - 0;  // ypos[0] + blockH; //
          let tx = d.targetLoc[0] + d.targetLocSorted[d.targetGrp_sorted]; 
          let ty = d.targetLoc[1]- 0 //ypos[1]; //

          let makerids = d.makers.map (d => d.id);  // map maker ids 

          // -- UNIT WIDTH = 'the width of 1 Maker' (to calculate offsets) -- // 
          let unitWidth =  d.targetWidth / d.targetAllMakers;
          let unitWidthSrce = d.sourceWidth / d.sourceAllMakers;



          // -- calculate offset. - do this per grouping... -- / 
          // let makersmapped = d.makers.map (d => d.id)
          //let offsettest = makers_tally_targetV2[d.targetGrp].filter (item => makersmapped.includes(item) == false);

          let offset_Target = [ ];
          let offset_Source = [ ]; 
          if (d.targetGrp_sorted != null) {
              offset_Target = makers_tally_target[d.targetGrp][d.targetGrp_sorted].filter (item => makerids.includes(item) == false);
          }

          if (d.sourceGrp_sorted != null) {
              offset_Source = makers_tally_source[d.sourceGrp][d.sourceGrp_sorted].filter (item => makerids.includes(item) == false);
          }

          //console.log ('offsettest  = ', offset_Target)

          let offsetTargetAmt = offset_Target.length * unitWidth
          let offsetSourceAmt = offset_Source.length * unitWidthSrce

        
          if (d.targetGrp_sorted != null) {
              makers_tally_target[d.targetGrp] [d.targetGrp_sorted] = [...new Set (makers_tally_target[d.targetGrp] [d.targetGrp_sorted].concat(...d.makers.map(d => d.id)))]
          }

          if (d.sourceGrp_sorted != null) {
              makers_tally_source[d.sourceGrp] [d.sourceGrp_sorted] = [...new Set (makers_tally_source[d.sourceGrp] [d.sourceGrp_sorted].concat(...d.makers.map(d => d.id)))]
          }

          // -- path width --  (no. of makers as percentage of all amkers )
          let percentWidthSource = d.makers.length  / d.sourceAllMakers * d.sourceWidth;
          let percentWidthTarget = d.makers.length /  d.targetAllMakers * d.targetWidth; 
          let pathWidth =   percentWidthTarget

          // -- apply offset.. 
          sx += offsetSourceAmt
          tx += offsetTargetAmt


          // set path type 0 1 2 (which is the higher value )
          let pathType = Math.max (d.sourceGrp_sorted, d.targetGrp_sorted)
          //if (pathType == null) pathType = 2; 

          // get the values of source block and the values of the target block -- // 
          // Is this a primary or a secondary path ?? 
          //console.log ("ROW FROM VALUES ", d.rowFrom, " : ROW TO VALUES  ", d); // this is the overall row values 
          //console.log ("row values:  FROM ", d.rowValues.from, " TO: ", d.rowValues.to);
          //console.log ("path values: FROM ", d.pathValues.from, " TO: ", d.pathValues.to);
          //console.log ("----------------------------------------------");

          // SO if this PATH  

          // -- get user selections -- // 
          let selectedFrom  = d.rowValues.from.split (" ");
          let selectedTo  = d.rowValues.to.split(" ");

          // -- get path selections 
          let pathFrom = d.pathValues.from;
          let pathTo  = d.pathValues.to;

          let hasValFrom = selectedFrom.includes (pathFrom)
          let hasValTo = selectedFrom.includes (pathFrom)


          // ROW values show the CORE SELECTION... 
          // a PATH is A MAIN PATH IF 
          let mainFlow = false 
          if (hasValFrom === true && hasValTo === true) mainFlow = true

          //let vals = rowValues.split(" ") 
          //let hasValue = vals.includes (blockVal)

          // -- create the object that will go 
          let ystart = sy; 
          let yend = ty; 
          ystart = rowsY[index] ; //0 * (index+1)
          yend = rowsY[index + 1]; //  * (index+1)
          const obj = { source : [sx+pathWidth/2, ystart], target: [tx+pathWidth/2, yend], pathWidth:pathWidth, pathType:pathType, mainFlow: mainFlow }

          linkdata.push (obj)
        })

        // -- result of offset tallys - 
        //console.log ("result of collections source: ",makers_tally_source )
      //console.log ("result of collections target: ",makers_tally_target )

        // console.log ("Result of offsets source =>  ", offset_tally_source )
        setLinks (linkdata)
  }, [data, rowsY])

  // -draw paths when links are updated --
  useEffect( ()=> { 
    drawPaths( )
  }, [links])

  function calcPathWith ( ) { 
    return 1; 
  }

  const drawPaths= () => { 
    //console.log ("Links to draw ", links)
    let linkGen = d3.linkVertical();
   // links.sort((a, b) => b.pathType - a.pathType);// TRY and sort to be stacked in order. 



     d3.select(svgRef.current)
          .selectAll('.path')
          .data(links)  
          .transition( )
          .delay(delay)
          .duration(duration)
          .attr('class', 'path')
          .attr ('d', linkGen)
          .attr('stroke-width', d => {
                return d.pathType === 2 ?  0  : d.pathWidth ;

                //return d.pathWidth

          }) //d => d.count*10)
          .attr('stroke', (d, i) => { 
            //return d.pathType=== 0 ?  "OrangeRed"  : d.pathType === 1 ? "PowderBlue" : d.pathType === 2 ? "lightgray" : 'gray' ;
            // get the distance between sourceLoc[1] and targetLoc[1] -- // 
            //let verticalDist = d.targetLoc[1] - d.sourceLoc[1];

            // path 0 = orange / dark blue 
            // path 1 = light blue 
            // path 2 = grey 


            //console.log ('path data = ', d)
            return d.pathType === 0
                            ? d.mainFlow === true
                              ? "OrangeRed"
                            : d.mainFlow === false
                              ? "Gray"
                              : "Black"
                  : d.pathType === 1 ? "PowderBlue"
                  : d.pathType === 2 ? "lightgray" : "gray";

          })
          .attr('opacity', (d, i) => { 

            // -- SET THE OPACITY TO THE HEIGHT -- // 
            //console.log ('path vertical height ', d.target[1] - d.source[1])
            let verticalDist = d.target[1] - d.source[1];

            let mainFlowAlpha1 =  verticalDist <=150 ? 0 :  0.7
            let mainFlowAlpha2 = verticalDist  <=150 ? 0 :  0.3
            let secondFlowAlpha = verticalDist <=150 ? 0 :  0.4

            return d.pathType === 0
                            ? d.mainFlow === true
                              ? mainFlowAlpha1
                            : d.mainFlow === false
                              ? mainFlowAlpha2
                              : undefined
                  : d.pathType === 1 ? secondFlowAlpha
                  : d.pathType === 2 ? 0.0 : 0.0;

            //return d.pathType=== 0 ?  0.6  : d.pathType === 1 ? 0.4 : d.pathType === 2 ? 0.2 : 0.2 ;
          })

     

   
  }


  return (
    <g ref={svgRef}>

      {links.map((d, i) => {
        //console.log ("this is the path data...", d)
        return (
            <path 
              key={i}
              //d = {`M -10, ${d.source[1]}, 20, ${d.source[1]}, -30, ${d.target[1]}, -140, ${d.target[1]}`}
              // d = {`M -1000, ${d.source[1]}, -1000, ${d.source[1]}, -1000, ${d.target[1]}, -1000, ${d.target[1]}`}

              fill = "none"
              stroke ="lightgray"
              className="path"
              onMouseOver={(event) => handlePathRoll(data[i], d, event)}
              onMouseLeave={()  => handleRollOut( )}

            />


        );
      })}
    </g>
  );
};


export default Paths;

































































