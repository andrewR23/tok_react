import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { select } from 'd3-selection';

const dateScale = d3.scaleLinear(); //.domain([1500, 1950]).range([0, 900])

let delay = 1000; // 1000; 
let duration = 1000; //  4000;

let yHeight = 900; // the height of the date  

import { linkTypes_grouped } from './_datatypes'



const SocialCluster = ({ nodes, layout, baseY, flowselected, daterange, handleLocations, handleNodeRoll, handleNodeRollOut}) => {
      let svgRef = useRef(null);
      const dateScaleRef = useRef(d3.scaleLinear()); //.domain([1500, 1950]).range([0, 900]));
      const [animatedNodes, setAnimatedNodes] = useState([]); // this is the array of nodes to ref which gets updated 

      //const [visGrps, setVisGrps] = useState([]); 
      const [hozSpacing, setHozSpacing] = useState(0); 
      const hoveredXY = useRef([null])

      const [grpLocs, setGrpLocs] =  useState([ ]); 
      let locs = useRef([])
      let subLocs = useRef([]); // an array of sublocs (grouped)

      //let grpItems = useRef([])
      const [grpItems, setGrpItems] = useState([])

      const [scaleState, setScaleState] = useState ([1]);

      let frameW = useRef(1600) // stage is 1000



      const [hoveredId, setHoveredId] = useState(null); // get the id of the rolled item...

      // useEffect (()=> { 
      //   //console.log ("hovered id...", hoveredId)
      // }, [hoveredId])
      
      useEffect(() => { 
          // filter nodes 
          //nodes = [ ]
          drawTimeLine( )
          //console.log ("updated nodes = ", nodes)
          //console.log ('frame W = ', frameW.current)

          // get the XY of the Hovered item -- //  
          const hovereditem = d3.select(svgRef.current).selectAll('.largecircleGrp').filter((d, i) => i === hoveredId);
          if (!hovereditem.empty()) {
              let translateXY= hovereditem.attr('transform').match(/translate\(([^,]+),([^)]+)\)/);
              let xpos = parseFloat (translateXY[1])
              let ypos = parseFloat (translateXY[2])
              hoveredXY.current = [xpos, ypos]
              //console.log ('hovered item', hovereditem.attr('transform'))
              //console.log ("xpos ypos =  ", hoveredXY.current )
          }
        

          setAnimatedNodes ([...nodes])

          let visibleGrps  = nodes.filter (d => d.nodes.length> 0);
          setHozSpacing (frameW.current/visibleGrps.length)
          //console.log ("hoz spacing", hozSpacing)
          //setVisGrps (visibleGrps)



          if (layout == "force")  forceMove();
          if (layout == "linear") linearMove( );
          if (layout == "grid") gridMove( );

          sortByDate(nodes)


          // handle updated locs.. -- // 
          //handleLocations (grpItems)
          drawGroupFrame( ) ; // ** 
         


      }, [nodes, layout, flowselected, baseY, hoveredId])


      // ----// 
      useEffect(() => { 
        let grpItems = [ ];
        grpLocs.forEach ((g, i) => { 
           let locItem = { grpLoc:  grpLocs[i], subLocs: subLocs.current[i]} ; // 
           grpItems.push (locItem);
        }) 

        setGrpItems (grpItems)
        handleLocations (grpItems)

      }, [grpLocs])


      // ---- // 
      useEffect(() => { 
         if (layout == "linear") linearMove( );
         //console.log ("hoz spacing  = ", hozSpacing);
      }, [hozSpacing])


      // ---- // 
      useEffect( ()=> { 
          //console.log ('date range = ', daterange) 
          dateScaleRef.current = d3.scaleLinear().domain([daterange[0], daterange[1]]).range([0, yHeight]);

      }, [daterange])


     function handleSubLocs (locs, id) { 
        subLocs.current[id] = locs; // -- add to array -- / 
      }

     function sortByDate (nodes) { 
        //console.log ('sort by date')
        nodes.forEach (d => {
         if (d.nodes.length > 0) {
            d.nodes = d.nodes.sort((a, b) => a.date_1 - b.date_1); // 
          }
        })
      }


      // -- draw and position the enclosing frame - using baseY - -- //
      function drawGroupFrame ( ) { 
        d3.select(svgRef.current)
          .transition()
          .delay(500)
          .duration(1500)
          .attr ('transform', `translate(${0}, ${baseY}) scale(${scaleState})`)


      }

      function forceMove  () {
          //console.log ("begin force move ... ", nodes)
          let offsetX = 1100;
          // ------------- // 
          locs.current = [ ]; 
          const simulation = d3
              .forceSimulation([...nodes])
              .force("x", d3.forceX(0))
              .force("y", d3.forceY(0))
              .force("charge", d3.forceManyBody().strength(d => d.nodes.length*-40))
              .force("collision", d3.forceCollide(d => d.nodes.length*15))
              //.stop( )
              .on("tick", () => {
                  //setAnimatedNodes([...simulation.nodes()]);
              })

          // ----------------- // 
          // calculate the end positions -- 
          for (let i=0; i<20; ++i) {
              simulation.tick( );
              setAnimatedNodes([...simulation.nodes()]);
          } 

          // -- calc height force here ... get height of the nodes (min max y)
          let minY = Math.min(...animatedNodes.map(function (obj) {return obj.y}));
          let maxY = Math.max(...animatedNodes.map(function (obj) {return obj.y}));
          let height  = (maxY - minY) * 1;    
          //console.log ("minY  = ", minY, ' maxY = ', maxY);
          //console.log ("height ", height);


          // ----------------- // 

          // -- set GROUP position
          d3.select(svgRef.current)
              .selectAll('.largecircleGrp')
              .data(nodes)  
              .attr('class', 'largecircleGrp')
              .transition()
              .delay(delay)
              .duration(duration)
              .attr ('transform', (d, i) => { 
                  let x = d.x + offsetX
                  let y = d.y + height
                  //let y = Math.max(0, Math.min(500, d.y));
                  //console.log ("force POS ; ", i, ' ', [x, y])
                  locs.current.push ([x, y])

                  return `translate(${x}, ${y}) scale(1)`
               }) 
              //.call(updateGroupLocs)

          // -- set CIRCLE size / colour 
          d3.select(svgRef.current)
              .selectAll('.largecircle')
              .data(nodes)  
              .attr('class', 'largecircle')
              .transition()
              .delay(delay)
              .duration(duration)
              .attr('r', d => d.nodes.length * 10)
              //.attr('fill', 'red')
              .attr('opacity', 0.1)


          //simulation.alpha(0.1).restart();

          //console.log ("force locs =", locs);
          setGrpLocs (locs.current)
          return simulation.stop(); // clean up function

      };

      function linearMove ( ) { 
            //let spacing = 10;
            let visCount = 0;// count the no. of nodes visible. 
            //console.log ("linear move hoz spacing ", hozSpacing)
            

            // -- set GROUP position
            locs.current = [ ];
            d3.select(svgRef.current)
              .selectAll('.largecircleGrp')
              //.data(visGrps)  
              .data(nodes)
              .attr('class', 'largecircleGrp')
              .transition()
              .delay(delay)
              .duration(duration)
              //.attr ('transform', (d, i) => { }) 

              .attr('transform', function (d, i) {
                  // -- set x pos
                  let translateXY= this.getAttribute('transform').match(/translate\(([^,]+),([^)]+)\)/);
                  let xpos = parseFloat (translateXY[1])
                  let ypos = parseFloat (translateXY[2])

                  let x = setXPos(visCount, hozSpacing, i, xpos); // visCount * hozSpacing + 50; //  - 550 
                  
                  // -- set y pos --  
                  let y =  d.nodes.length=== 0 ?  20000 : dateScaleRef.current (d.nodes[0].date_1); 
                  
                  // increment vis count // 
                  if (d.nodes.length > 0)  visCount ++; 
                  //console.log ("linear POS ; ", i, ' ', [x, y])
                  locs.current.push ([x, y])
                  return `translate(${x}, ${y}) scale(${1})`



              })
               
             
              //.call(updateGroupLocs)

       

          // -- set CIRCLE size / colour 
          d3.select(svgRef.current)
              .selectAll('.largecircle')
              .data(nodes)  
              .attr('class', 'largecircle')
              .transition()
              .duration(duration)
              .attr('r',  d => d.nodes.length * 5)
              //.attr('fill', 'green')
              .attr('opacity', 0.1)

          // 
          //console.log ("linear locs ", locs)

          setGrpLocs (locs.current)


      }

      function setXPos (visCount, hozSpacing, i, xpos) { 
        //console.log ("item = ", i, ' hoveredId ', hoveredId); 
        //let newx = 0;
        // get the xpos of the rolled item.. 

        // -- if Nothing hovered -- 
        if (hoveredId == null) return visCount * hozSpacing + 50; 

        // -- if item hovered -- // s
        if (i == hoveredId) return xpos; // if hovered- keep at current x pos -- // 
        if (i != hoveredId)  { 
            // if not hovered - recalculate.. 
            // get the distance from i to this... 
            let spacing = 160; 
            let newx = (i - hoveredId) * spacing + hoveredXY.current[0]
            return newx; 
        }



        //return visCount * hozSpacing + 50; 

      }

      function gridMove ( ) { 
        // -- set GROUP position
            locs.current = [ ];
            
            d3.select(svgRef.current)
              .selectAll('.largecircleGrp')
              .data(nodes)  
              .attr('class', 'largecircleGrp')
              .transition()
              .duration(duration)
              // .attr('cx', (d, i) => i * 50 + 60) // cx and cy are used for a circle 
              // .attr('cy', 200)
              .attr ('transform', (d, i) => { 
                  let [x, y] = calcGridPos (d, i);
                  locs.current.push ([x,y])

                  // -- 
                    function calcGridPos(d,  i) { 
                      let colNum = 17;
                      let spacing = 50; //d.nodes.length*10;
                      let itemwidth =  70; //  d.nodes.length*14
                      const column = i % colNum;
                      const row = Math.floor(i / colNum);
                      const left = column * (itemwidth + spacing);
                      const top = row * (itemwidth + spacing);

                      return [left, top]
                  }
                  //let x = i * 50 + 60 
                  //let y = 200

                  return `translate(${x+300}, ${y+100}) scale(1)`
               })
               //.call(updateGroupLocs)

            setGrpLocs (locs.current)
            //console.log ("grid locs ", locs)

      }

      function drawTimeLine ( ) { 
          let x = layout ==     'linear'  ?  -100 :  -800
          let liney = layout == 'linear'  ?  0    :  10000


          // draw date scale- ticks 
          const yDates = d3.axisLeft(dateScaleRef.current)
              .tickFormat(d3.format('d')) // Display years as integers
              .ticks(10); // Adjust the number of ticks as needed

          d3.select(svgRef.current)
                .selectAll('.timelineYAxis')
                // .join('g')
                .transition()
                .delay(0)
                .duration(duration)
                .attr('class', 'timelineYAxis')
                .attr('transform', `translate(${x}, 0) scale(${1})`) // Adjust the horizontal position //`translate(${0}, ${0}) scale(1)`
                .attr ('stroke', 'none')
                .attr ('fill', 'none')
                .call(yDates)
                .selectAll('text') // Select all text elements in the axis
                .style('font-size', '20px') // Adjust the font size as needed
                .attr('fill', 'gray')
                .attr('stroke', 'none')

 

        }

      // ---- // 
      const changeFade = (id) => { 
          d3.select(svgRef.current)
            .selectAll('.largecircle')
            .transition()
            .duration(duration*.25)
            .attr('class', 'largecircle')
            // .attr('fill', 'pink')
            .attr('opacity', (d, i) => { 
              return id === i ? 0.8 : 0.1;
            })

          //--  fade small circle -- 
          d3.select(svgRef.current)
            .selectAll('.smallcircle')
            .transition()
            .duration(duration*.25)
            .attr('class', 'smallcircle')
            .attr('fill', 'red')
            .attr('opacity', (d, i) => { 
                return id === i ? 1 : 0.2;
            })
             .attr('fill', (d, i) => { 
               //return id === i ? 'red' : 'blue';
            })


          
      }

      // ---- //
      function changeScale (id) { 

        const scaleAmt = 1; 
        const scaleAmtSmall = 0.3

         // -- scale rolled item item with selected ID -- //   
           d3.select(svgRef.current)
              .selectAll('.largecircleGrp')
              .attr('class', 'largecircleGrp')
              .transition()
              .duration(1000)
              .attr ('transform', function (d, i) { 
                  let scale = id === i ? scaleAmt : scaleAmtSmall; 
                  // Parse the current transform attribute to extract translate values
                  const tCurrent = this.getAttribute('transform')
                  const tMatch = /translate\(([^)]+)\)/.exec(tCurrent);
                  if (tMatch == null) return
                  const tVals = tMatch[1].split(',').map(parseFloat);
                  const tNew = `translate(${tVals[0]}, ${tVals[1]}) scale(${scale})`;
                  return tNew;
                  
              }) 
          // -- scale the timeline
          // d3.select(svgRef.current)
          //     .selectAll('.timelineYAxis')
          //     .attr('class', 'timelineYAxis')
          //     .transition()
          //     .duration(1000)
          //     .attr ('transform', function (d, i) { 
          //         //let scale = scaleAmt; 
          //         const tCurrent = this.getAttribute('transform')
          //         const tMatch = /translate\(([^)]+)\)/.exec(tCurrent);
          //         if (tMatch == null) return
          //         const tVals = tMatch[1].split(',').map(parseFloat);

          //         const tNew = `translate(${tVals[0]}, ${tVals[1]}) scale(${scaleAmt})`;
          //         return tNew;
                  
          //     }) 



      }

      const resetScale = ( ) => { 

          // -- reset circle scale -- 
          d3.select(svgRef.current)
              .selectAll('.largecircleGrp')
              .attr('class', 'largecircleGrp')
              .transition()
              .duration(1000)
              .attr ('transform', function (d, i) { 
                  let scale =  1
                  // Parse the current transform attribute to extract translate values
                  const tCurrent = this.getAttribute('transform')
                  const tMatch = /translate\(([^)]+)\)/.exec(tCurrent);
                  if (tMatch == null) return
                  const tVals = tMatch[1].split(',').map(parseFloat);
                  const tNew = `translate(${tVals[0]}, ${tVals[1]}) scale(${scale})`;
                  return tNew;
                  
          })


          // d3.select(svgRef.current)
          //     .selectAll('.timelineYAxis')
          //     .attr('class', 'timelineYAxis')
          //     .transition()
          //     .duration(1000)
          //     .attr ('transform', function (d, i) { 
          //         let scale =  1
          //         const tCurrent = this.getAttribute('transform')
          //         const tMatch = /translate\(([^)]+)\)/.exec(tCurrent);
          //         if (tMatch == null) return
          //         const tVals = tMatch[1].split(',').map(parseFloat);
          //         const tNew = `translate(${tVals[0]}, ${tVals[1]}) scale(${scale})`;
          //         return tNew;  
          // })

      }

      // ---- //
      const handleGroupRoll = (id, data) => { 
         console.log ("group roll over. ", id, " : ", event.target.className.baseVal)
         setHoveredId (id);

         // let dateFrom = data[0].date_1;
         // let dateTo = data[data.length-1].date_1;
         // //console.log ("date range = ", dateFrom, " : ", dateTo)

         // // update date scale 
         // dateScaleRef.current = d3.scaleLinear().domain([dateFrom-10, dateTo+10]).range([0, yHeight]);
         // // ----- // 
         // frameW.current = 50000
         // // get the group start end dates ()
         // //changeScale(id)
         // //changeFade(id)

      }

      const handleGroupRollOut = (id) => { 
         console.log ("group roll out. ", id, " : ", event.target.className)
         setHoveredId(null)

        // if roll out onto the main canvas 
        // const relatedTargetID = event.relatedTarget.id;
        // if (relatedTargetID == 'mainpage' || relatedTargetID == 'maincanvas') { 
        //    //resetScale()
        //    // reset date scale 
        //   dateScaleRef.current = d3.scaleLinear().domain([daterange[0], daterange[1]]).range([0, yHeight]);

        //   frameW.current = 2900


        // }

      }

      const handleGroupClick = (id) => { 
        // click on group 
        console.log ('click on group')
      }


      return (
        <g ref={svgRef} 
            key={0}
            id={0}
            className={'socialgroup'}
            transform={`translate(${0}, ${-1000}) scale(${scaleState})`} 
            // onMouseOver={handleOnSVG}
            >


         {/*top line */}
{/*          <line 
            x1={0}
            y1={0}
            x2={2500}
            y2={0}
            stroke="darkGray"
            className={"borderline"}
            strokeWidth={1}
          />*/}

          <TimeLine
            key={0}
            id ={0}
          />


          {/*{console.log("Current data:", nodes.map (d => d)) } */}
          {nodes.map((d, i) => {
            return (
              <CircleLarge
                  key={i}
                  id={i}
                  data={d.nodes}
                  flowselected = {flowselected}
                  links={d.links}
                  layout={layout}
                  handleGroupRoll={handleGroupRoll}
                  handleGroupRollOut={handleGroupRollOut}
                  handleGroupClick={handleGroupClick}
                  handleNodeRoll ={handleNodeRoll}
                  handleNodeRollOut={handleNodeRollOut}
                  dateScale = {dateScaleRef.current}
                  opacity={0.4}
                  // hoverVal={hoveredId === i} // returns true or false... 
                  hoverID = {hoveredId}

              />

            );
          })}
        </g>
      );
};


// ------------------------ // 
// this is like a cluster group which contains sub ndata
const CircleLarge = ({id, data, flowselected, links, layout, dateScale, hoverID,
                      handleGroupRoll, handleGroupRollOut, handleGroupClick, handleNodeRoll, handleNodeRollOut}) => {
  let groupRef = useRef(null);
  const [animatedNodes, setAnimatedNodes] = useState([]); // this is the array of nodes to ref which gets updated 
  const [animatedLinks, setAnimatedLinks] = useState(links); // this is the array of nodes to ref which gets updated 

  // -- sub locs -- // 
  let locs = useRef([ ]);
  //let spread = useRef(false) 
  //let subLocs = useRef ([ ]); // xy loc of blocks (base)
  
  let [subLocState, setSubLocState] = useState([])
  let mappedLinks = useRef([ ])

  // -- set colour scale from linkedgroups data 
  let hoverVal = useRef (false)
  const alpha = useRef(1)
  const linkColorScale = useRef(
      d3.scaleOrdinal()
          .domain(Object.keys(linkTypes_grouped))
          .range(['rgb(215,48,39)',
                  'rgb(244,109,67)',
                  'rgb(253,174,97)', 
                  'rgb(254,224,144)',
                  'rgb(255,255,191)',
                  'rgb(224,243,248)',
                  'rgb(171,217,233)',
                  'rgb(116,173,209)',
                  'rgb(69,117,180)'])
      );
  //console.log ('link colour scale ', linkColorScale.current.domain( ))


  useEffect(()=> {  
      //console.log ('new hover value ', hoverVal)
      // -- remap the links : create a data element for each TYPE in the link
      // -- flattens the array of links -- // 
      // -- returns an array of objects ({type, source, target})
      mappedLinks.current = links.flatMap(d => d.type.map(type => (
        { type, source: d.source, target: d.target })
      ));


      // set alpha from hoverID ()

      if (hoverID == null) { 
         hoverVal.current = false
         alpha.current = 0.7; // default for all (nothing selected)

      }

      if (hoverID != null && hoverID == id) { 
          hoverVal.current = true; 
          alpha.current = 1;  // highlight selected
      } 

      if (hoverID != null && hoverID != id) { 
          hoverVal.current = false
          alpha.current = 0.2; // 

      }



      // --- // 
      if (layout == "force") forceMoveSmall();
      //--- // 

      if (layout == "grid") forceMoveSmall( );
      //--- // 

       if (layout == "linear") linearMoveSmall( );
      //--- //


  },[data, layout, flowselected, links, hoverID])

  useEffect (() => { 
      // send the updated values -- //
      // log updated values -- // 
      // console.log ('current locs = ', subLocState)
      //handleSubLocs (subLocState, id );//
  }, [subLocState])




  // -- draw small groups by force
  function forceMoveSmall () {

      const simulation = d3
          .forceSimulation([...data])
          .force("x", d3.forceX(0))
          .force("y", d3.forceY(0))
          .force("charge", d3.forceManyBody().strength(-60))
          .force("link", d3.forceLink(links))
          .stop( )

      // -- add link forces and draw links.. 
      for (let i = 0; i < 40; ++i) {
            simulation.tick();
            setAnimatedNodes([...simulation.nodes()]);
      } 

      locs.current = [ ];

      // -- small circle 
      let circles = d3.select(groupRef.current)
          .selectAll('.smallcircle')
          .data(data)  
          .attr('class', 'smallcircle')
          .transition()
          //.delay(3000)
          .duration(3000)
          .attr('cx', ((d, i) => {
            locs.current.push ({id: d.id, loc: [d.x, d.y]}); 
            return d.x }))
          .attr('cy', ((d, i) => {
            return d.y }))
          .attr('r', circleSmallSize)
          .attr('fill', circleSmallFill)
          .attr('opacity', alpha.current)

      setSubLocState(locs.current)

      // -- draw lines links 
      let lines = d3.select(groupRef.current)
          .selectAll('.linksmall')
          .data(mappedLinks.current)
          .attr('class', 'linksmall')
          .transition()
          //.delay(3000)
          .duration(3000)
          .attr('x1', (d => d.source.x))
          .attr('y1', (d => d.source.y))
          .attr('x2', (d => d.target.x))
          .attr('y2', (d => d.target.y))
          .attr('stroke', d => { 
            //console.log ("d type = ", d.type); // use type for colour.. 
            let col = 'black';
            let linkType = Object.entries(linkTypes_grouped).find(([group, types]) => types.includes(d.type))?.[0];
            if (linkType) {
               col = linkColorScale.current(linkType);
            }
            return col;
          })
          .attr('opacity', alpha.current)



       simulation.alpha(0.1).restart();
       return simulation.stop(); // clean up function

  };

  // -- draw small groups (linear) -- // 
  function linearMoveSmall ( ) { 
        locs.current = [ ] ;
        let linespace = 0;
        let rootY = 0; // the 'top item' //
        // --- // 
        let offset =0;
        let dir= 1; 
        let spreadAmt = 100;

        let dateProximity = 20

        
        if (data.length>0) rootY = dateScale(data[0].date_1)        

        let circles = d3.select(groupRef.current)
          .selectAll('.smallcircle')
          .data(data)  
          .attr('class', 'smallcircle')
          .transition( )
          .duration(400)
          .attr('r', circleSmallSize)
          .attr('cx',  (d, i) => setXYPos(d, i)[0])
          .attr('cy',  (d, i) => setXYPos(d, i)[1]) 
          .attr ('fill', circleSmallFill)
          .attr('opacity', alpha.current)


      // --  spread when rolled  -- // 
      // Calculate XY pos of each circle by Date 
      // and UPDATE current.locs... (!!)    
      function setXYPos (d, i) { 
          let x = 0;
          let y = 0; 

          offset = 0; // x offset -- 
          //--  get previous item to find the date proximity 
          if (i > 0 ) { 
              // get date diff between this and previous item -- 
              let datediff = d.date_1 - data[i-1].date_1;
              if (datediff < dateProximity) { 
                offset = spreadAmt * dir; 
                dir *= -1; 
              } 
          }

          if (hoverVal.current == true)  x=offset
          y = (dateScale (d.date_1)) - rootY; //

          // look for existing id elements in the list -- // 
          let existingIDs = locs.current.filter (item => item.id == d.id)
          if (existingIDs.length ==0) {
            locs.current.push ({id: d.id, loc: [x, y]});
          }
          return [x, y]
      }


      // -- update links -- // 
      let updatedLinks = [...animatedLinks];

      setSubLocState(locs.current)
      //console.log ("locs current = ", locs.current);


      // --- draw the links: for the date line view -- // 
     let lines = d3.select(groupRef.current)
        .selectAll('.linksmall')
        .data(mappedLinks.current)
        .attr('class', 'linksmall')
        .transition()
        .duration(400)
        .attr('x1', d=> getSourceLocXY(d)[0]) // d => setXYPos(d)[0]) getSourceLoc)
        .attr('y1', d=> getSourceLocXY(d)[1])
        .attr('x2', d=> getTargetLocXY(d)[0])
        .attr('y2', d=> getTargetLocXY(d)[1])
        .attr('opacity', alpha.current)



      // -- get XY values from locs.current..
      function getSourceLocXY (d, i) { 
            let sourceId = d.source.id; 
            let sourceLoc = locs.current.find (d => d.id == sourceId);
            //console.log ("id = ", sourceId, "  loc ", sourceLoc)
            return [sourceLoc.loc[0], sourceLoc.loc[1]]
      }

      function getTargetLocXY (d, i) { 
            let targetId = d.target.id; 
            let targetLoc = locs.current.find (d => d.id == targetId);
            return [targetLoc.loc[0], targetLoc.loc[1]]
      }


  }

  // 
  function circleSmallFill (d, i) { 
      //console.log ("small circle data = ", selectedmakers)
      if (flowselected[0].map (m=>m.id).includes (d.id)) return 'red'
      if (flowselected[1].map (m=>m.id).includes (d.id)) return 'PowderBlue'
      return 'gray'// 'lightgray' // darkGray' // PowderBlue' //
  }

  function circleSmallSize (d, i) { 
     return 6;
  }

 
  function updateSubLocs (selection) {
    // -- update locs -- // 
    selection.each(function(d) {
        const cx =  parseFloat (d3.select(this).attr('cx'));
        const cy =  parseFloat (d3.select(this).attr('cy'));
        locs.push([cx, cy])
    });

    //console.log ('locs ', locs.length)
    //setSubLocState(locs)

  }

  // function for mouse over small circle
  // const handleMouseOverSmall = (id) => {
  //     // Handle mouse over event for a specific bar
  //       //console.log('Mouse over circle with ID:', id);

  // };



  return (
    // the main 'cluster'
    <g 
        transform={`translate(${0}, ${0}) scale(1)`} 
        ref={groupRef} 
        className="largecircleGrp"
        onMouseOver={(event) => handleGroupRoll(id, data)}
        onMouseOut ={(event) => handleGroupRollOut(id)} 
        onClick    ={(event) => handleGroupClick(id)} >
        {/*// */}

      <circle
        key={id}
        cx={0}
        cy={0}
        r={1}
        fill="darkGray" // PowderBlue"
        className ="largecircle" // this is the cluster circle.. large.. 
        // onMouseOver={(event) => handleGroupRoll(id)}
        // onMouseOut ={(event) => handleGroupRollOut(id)}


      />
        {/*create an array of small circles inside */}
      { data.map ((d, i) => {
            return <CircleSmall 
                      key={d.id} 
                      id={d.id}
                      handleNodeRoll = {handleNodeRoll}
                      handleNodeRollOut = {handleNodeRollOut}
                      // handleMouseOut = {handleMouseOut}
                      // handleMouseOverSmall={handleMouseOverSmall} 

                   />
        }) }

      {
        links.map((d, i) => { 
            //console.log ("links added = ", d); 
            // add a link for each 'type' of connections. 
            // return<LinkSmall key={i} id={i} />
            // ONE group... contains multiple links ... 

            return (
                <g className="linksmallGRP" key={i}>
              
                    { d.type.map ((d, n) => {
                        //console.log ("type. ", n)
                        //console.log ('key =', `${i}${n}`)
                        let key = `${i}${n}`
                        return  <line
                                    key={key}
                                    x1={0}
                                    y1={0}
                                    x2={5}
                                    y2={5}
                                    stroke="red"//PowderBlue"
                                    strokeWidth={3}
                                    opacity={.1}
                                    className="linksmall"
                                />

                      }) 
                    }

  
                </g>
          );
        })

      }

    </g>
    );
};

// ------------------------ // 

const CircleSmall = ({id, handleNodeRoll, handleNodeRollOut}) => {
 //let svgRef = useRef(null);

    return (
      // -- nested circle
      <circle
        key={id}
        cx={0}
        cy={0}
        r={0}  
        opacity={.1}
        className="smallcircle"
        onMouseOver={(event) => handleNodeRoll(id)} ///handleMouseOverSmall(id)}
        onMouseOut= {(event) => handleNodeRollOut()}


       />
    );
};

const LinkSmall = ({id}) => {
 //let svgRef = useRef(null);

  return (
    <g className="linksmallGRP">
      <line
        key={id}
        x1={0}
        y1={0}
        x2={5}
        y2={5}
        stroke="red"//PowderBlue"
        strokeWidth={3}
        opacity={1}
        className="linksmall"
      />
    </g>
    );
};

// return LinkSmallGroup 

const LinkSmallGroup = ( {id} )  => { 

    return (

      <line
        key={id}
        x1={0}
        y1={0}
        x2={5}
        y2={5}
        stroke="red"//PowderBlue"
        strokeWidth={3}
        opacity={1}
        className="linksmallold"
      />
    )


}


const TimeLine = ({id}) => { 

    return (
      // -- link to 

      <g className="timelineYAxis" >
   {/*     <rect
          key={id}
          x={10}
          y={0}
          width={10}
          height={1000}
          className ="timeline" 
        />*/}

      </g>
      
    );

};






export default SocialCluster;



