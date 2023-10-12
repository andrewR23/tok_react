import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { select } from 'd3-selection';

let blockH = 20; 


const Paths = ({ data, index, handlePathRoll, handleRollOut}) => {
  let svgRef = useRef(null);
  //let offsetRef = useRef (offsets)

  //let links = useRef ([])
  const [links, setLinks] = useState ([])

  let linkdata = [ ]

  // -- generate links from data 
  useEffect(() => {     
        // --console.log ("1" , offsetRef.current)
        // console.log ("path data " , data)
        // console.log ("path offsets", offsets)
        // console.log ("path index ", index)
        // console.log ('-----------------')

        // -- x offsets - count the makers -- // 
        let offset_tally_source = [ ]; 
        let offset_tally_target = [ ]; 

        // init -- // 
        for (let i=0; i<100; i++) { 
            let init_src = [0, 0, 0]
            let init_trg = [0, 0, 0]
            offset_tally_source.push(init_src)
            offset_tally_target.push(init_trg); // are these different lengths YES
        }


        // -- populate link data -- // 
        linkdata = [ ];
        data.forEach (d => { 
          let count = d.makers.length;
          let sx = d.sourceLoc[0] + d.sourceLocSorted[d.sourceGrp_sorted]; 
          let sy = d.sourceLoc[1] + blockH; 
          let tx = d.targetLoc[0] + d.targetLocSorted[d.targetGrp_sorted]; 
          let ty = d.targetLoc[1]; 

          // apply offset.. 
          //console.log ('sourgroup = ', d.sourceGrp, ' sourceGrp sorted = ', d.sourceGrp_sorted)

          sx += offset_tally_source [d.sourceGrp] [d.sourceGrp_sorted] // source[0] block 0, subblock 2
          tx += offset_tally_target [d.targetGrp] [d.targetGrp_sorted] // source[0] block 0, subblock 2

          // get the source and target widths:
          // console.log ('src block width = ', d.sourceWidth)
          // console.log ('trg block width = ', d.targetWidth)
          // console.log ('src makers (all) = ', d.sourceAllMakers)
          // console.log ('trg makers (all) = ', d.targetAllMakers)
          // console.log ('makers =', d.makers.length);
          // console.log ('--------------------------')

          // -- path width -- 
          let percentWidthSource = d.makers.length / d.sourceAllMakers * d.sourceWidth;
          let percentWidthTarget = d.makers.length / d.targetAllMakers * d.targetWidth; 
          let pathWidth =     percentWidthTarget/2
          // -- add to tally offset (source)-- 
          offset_tally_source [d.sourceGrp] [d.sourceGrp_sorted]+= pathWidth;  //add to source tally 
          offset_tally_target [d.targetGrp] [d.targetGrp_sorted]+= pathWidth;  //add to source tally 

          // set path type 0 1 2 
         // console.log ('source grp ', d.sourceGrp_sorted, '  target grp ', d.targetGrp_sorted)
          let pathType = Math.max (d.sourceGrp_sorted, d.targetGrp_sorted)
          //if (pathType == null) pathType = 2; 

          const obj = { source : [sx+pathWidth/2, sy], target: [tx+pathWidth/2, ty], pathWidth:pathWidth, pathType:pathType}
          // const obj = { source : [sx+count*10/2, sy], target: [tx+count*10/2, ty], count:count}

          linkdata.push (obj)
        })

        // -- result of offset tallys - 
        // console.log ("Result of offsets source =>  ", offset_tally_source )
        setLinks (linkdata)
  }, [data])

  // -draw paths when links are updated --
  useEffect( ()=> { 
    drawPaths( )
  }, [links])

  function calcPathWith ( ) { 
    return 1; 
  }

  const drawPaths= () => { 

    let linkGen = d3.linkVertical();

    // links.sort((a, b) => b.pathType - a.pathType);// !!

     d3.select(svgRef.current)
          .selectAll('.path')
          .data(links)  
          .transition( )
          .delay(3000)
          .duration(2000)
          .attr('class', 'path')
          .attr ('d', linkGen)
          .attr('stroke-width', d => d.pathWidth) //d => d.count*10)
          .attr('stroke', (d, i) => { 
            //console.log ('path type = ', d.pathType)
            return d.pathType=== 0 ?  "OrangeRed"  : d.pathType === 1 ? "PowderBlue" : d.pathType === 2 ? "lightgray" : 'gray' ;

            //return d.pathType=== 0 ?  "OrangeRed"  : d.pathType === 1 ? "Gold" : d.pathType === 2 ? "lightgray" : 'gray' ;
          })
          .attr('opacity', (d, i) => { 
            return d.pathType=== 0 ?  0.6  : d.pathType === 1 ? 0.4 : d.pathType === 2 ? 0.2 : 0.2 ;
          })
          //.attr('opacity', 0.5)
          //.each(function(d) {
               // console.log(d3.select(this).attr('d'));
          //});
     

   
  }


  return (
    <g ref={svgRef}>

      {links.map((d, i) => {
        //console.log ("this is the path data...", d)
        return (
            <path 
              key={i}
              d = {`M -10, ${d.source[1]}, 20, ${d.source[1]}, -30, ${d.target[1]}, -140, ${d.target[1]}`}
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

































































