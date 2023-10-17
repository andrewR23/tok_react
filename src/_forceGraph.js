import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { select } from 'd3-selection';

const dateScale = d3.scaleLinear(); //.domain([1500, 1950]).range([0, 900])



const SocialCluster = ({ nodes, layout, flowselected, daterange, handleLocations }) => {
      let svgRef = useRef(null);
      const dateScaleRef = useRef(d3.scaleLinear().domain([1500, 1950]).range([0, 900]));
      const [animatedNodes, setAnimatedNodes] = useState([]); // this is the array of nodes to ref which gets updated 

      //const [visGrps, setVisGrps] = useState([]); 
      const [hozSpacing, setHozSpacing] = useState(0); 

      const [grpLocs, setGrpLocs] =  useState([ ]); 
      let locs = useRef([])
      let subLocs = useRef([]); // an array of sublocs (grouped)

      //let grpItems = useRef([])
      const [grpItems, setGrpItems] = useState([])


      
      useEffect(() => { 
          setAnimatedNodes ([...nodes])
          if (layout == "force")  forceMove();
          if (layout == "linear") linearMove( );
          if (layout == "grid") gridMove( );

          sortByDate(nodes)

          let visibleGrps  = nodes.filter (d => d.nodes.length> 0);
          //setVisGrps (visibleGrps)

          //console.log ('UPDATE social groups:  ')
          //console.log ("visible groups = ", visibleGrps);
          //setGrpCount (nodes.length) 
          //console.log ('grp locs = ', grpLocs)

          //
          let frameW = 2900; 
          setHozSpacing (frameW/visibleGrps.length)

          // handle updated locs.. -- // 
          //handleLocations (grpItems)

      }, [nodes, layout, flowselected])


      // --- -// 
      useEffect(() => { 
        let grpItems = [ ];
        //console.log ('group locs = ', grpLocs)
        //console.log ('subLocs locs = ', subLocs.current)
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




     useEffect( ()=> { 
          // show date range & use date range to set the height range 
          // console.log ('date range = ', daterange) 
          dateScaleRef.current = d3.scaleLinear().domain([daterange[0], daterange[1]]).range([0, 900*2]);
          //dateScale == d3.scaleLinear().domain([daterange[0], daterange[1]]).range([0, 200]);

      }, [daterange])


      function handleSubLocs (locs, id) { 
        subLocs.current[id] = locs; // -- add to array -- / 
      }



     function sortByDate (nodes) { 
        console.log ('sort by date')
        nodes.forEach (d => {
         if (d.nodes.length > 0) {
            d.nodes = d.nodes.sort((a, b) => a.date_1 - b.date_1); // 
          }
        })
      }


      // -- draw  -- //
      function forceMove  () {
          let offsetX = 1500;
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
          for (let i=0; i<20; ++i) {
              simulation.tick( );
              setAnimatedNodes([...simulation.nodes()]);
          } 

          // -- calc height force here ... get height of the nodes (min max y)
          let minY = Math.min(...animatedNodes.map(function (obj) {return obj.y}));
          let maxY = Math.max(...animatedNodes.map(function (obj) {return obj.y}));
          let height  = (maxY - minY) * 0.5;    
          //console.log ("minY  = ", minY, ' maxY = ', maxY);
          //console.log ("height ", height);


          // ----------------- // 

          // -- set GROUP position
          d3.select(svgRef.current)
              .selectAll('.largecircleGrp')
              .data(nodes)  
              .attr('class', 'largecircleGrp')
              .transition()
              .delay(3000)
              .duration(4000)
              .attr ('transform', (d, i) => { 
                  let x = d.x + offsetX
                  let y = d.y + height
                  //let y = Math.max(0, Math.min(500, d.y));
                  //console.log ("force POS ; ", i, ' ', [x, y])
                  //console.log ('helloforce')
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
              .delay(3000)
              .duration(4000)
              .attr('r', d => d.nodes.length * 10)
              //.attr('fill', 'red')
              .attr('opacity', 0.1)


          //simulation.alpha(0.1).restart();

          //console.log ("force locs =", locs);
          setGrpLocs (locs.current)
          return simulation.stop(); // clean up function

      };

      function linearMove ( ) { 
            let spacing = 10;
            let visCount = 0;// count the no. of nodes visible. 
            // -- set GROUP position
            locs.current = [ ];
            d3.select(svgRef.current)
              .selectAll('.largecircleGrp')
              //.data(visGrps)  
              .data(nodes)
              .attr('class', 'largecircleGrp')
              .transition()
              .delay(3000)
              .duration(4000)
              .attr ('transform', (d, i) => { 
                  let x = visCount * hozSpacing + 50; //  - 550 
                  let y =  d.nodes.length=== 0 ?  20000 : dateScaleRef.current (d.nodes[0].date_1); 
                  // increment vis count // 
                  if (d.nodes.length > 0)  visCount ++; 
                  //console.log ("linear POS ; ", i, ' ', [x, y])
                  //console.log ('hellolinear')
                  locs.current.push ([x, y])
                  // -- updte values here ?? 
                  return `translate(${x}, ${y}) scale(${1})`
               }) 
              //.call(updateGroupLocs)

       

          // -- set CIRCLE size / colour 
          d3.select(svgRef.current)
              .selectAll('.largecircle')
              .data(nodes)  
              .attr('class', 'largecircle')
              .transition()
              .duration(4000)
              .attr('r',  d => d.nodes.length * 2)
              //.attr('fill', 'green')
              .attr('opacity', 0.1)

          // 
          //console.log ("linear locs ", locs)

          setGrpLocs (locs.current)


      }

      function gridMove ( ) { 
        // -- set GROUP position
            locs.current = [ ];
            
            d3.select(svgRef.current)
              .selectAll('.largecircleGrp')
              .data(nodes)  
              .attr('class', 'largecircleGrp')
              .transition()
              .duration(4000)
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

      // ---- // 
      const changeFade = (id) => { 
          d3.select(svgRef.current)
            .selectAll('.largecircle')
            .transition()
            .duration(1000)
            .attr('class', 'largecircle')
            // .attr('fill', 'pink')
            .attr('opacity', (d, i) => { 
              return id === i ? 0.8 : 0.2;
            })
      }

      const changeScale = (id) => { 
          d3.select(svgRef.current)
              .selectAll('.largecircleGrp')
              .attr('class', 'largecircleGrp')
              .transition()
              .duration(1000)
              .attr ('transform', function (d, i) { 
                  let scale = id === i ? 3 : 0.9; 
                  // Parse the current transform attribute to extract translate values
                  const tCurrent = this.getAttribute('transform')
                  const tMatch = /translate\(([^)]+)\)/.exec(tCurrent);
                  if (tMatch == null) return

                  const tVals = tMatch[1].split(',').map(parseFloat);
                  const tNew = `translate(${tVals[0]}, ${tVals[1]}) scale(${scale})`;
                  return tNew;
                  
               }) 
      }

      const reset = ( ) => { 

          // -- reset group scale -- 
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

          // -- reset circle opacity -- 
          d3.select(svgRef.current)
            .selectAll('.largecircle')
            .transition()
            .duration(1000)
            .attr('class', 'largecircle')
            // .attr('fill', 'green')
            .attr('opacity', 0.4)


      }


      function updateGroupLocs (selection) { 
        // get the group pos for the large circle. 
        // let locs = [ ] 
        // //console.log ('update group loc')
        // selection.each(function(d) {
        //   //console.log ("group data = ", d)
        //   let transform  = d3.select(this).attr ('transform')
        //   const match = transform.match(/translate\(([^,]+),([^)]+)\)/);
        //   const tX = parseFloat(match[1]);
        //   const tY = parseFloat(match[2]);
        //   console.log ('transform =', tX, ' ', tY)
        //   locs.push ([tX, tY])

        // });

        //setGrpLocs (locs)

      }

      // ---- //
      const handleMouseOver = (id) => {
        //changeFade(id)
        //changeScale(id)
      };

      const handleMouseOut = (id) => {
        // reset ( ); // opacity (1. scale 1)
      };




      return (
        <g ref={svgRef} transform={"translate(0, 0) scale(1)"}>
          {/*{console.log("Current data:", nodes.map (d => d)) } visGroup OR nodes*/}
          {nodes.map((d, i) => {
            return (
              <CircleLarge
                  key={i}
                  id={i}
                  data={d.nodes}
                  flowselected = {flowselected}
                  links={d.links}
                  layout={layout}
                  handleMouseOver={handleMouseOver}
                  handleMouseOut ={handleMouseOut}
                  handleSubLocs = {handleSubLocs}
                  dateScale = {dateScaleRef.current}
                  opacity={0.4}


              />

            );
          })}
        </g>
      );
};


// ------------------------ // 
// this is like a cluster group which contains sub ndata
const CircleLarge = ({id, data, flowselected,links, layout, dateScale, handleMouseOver, handleMouseOut, handleSubLocs}) => {
  let groupRef = useRef(null);
  const [animatedNodes, setAnimatedNodes] = useState([]); // this is the array of nodes to ref which gets updated 
  const [animatedLinks, setAnimatedLinks] = useState(links); // this is the array of nodes to ref which gets updated 

  // -- sub locs -- // 
  let locs = useRef([ ]); 
  //let subLocs = useRef ([ ]); // xy loc of blocks (base)
  let [subLocState, setSubLocState] = useState([])


  useEffect(()=> {  
      // --- // 
      if (layout == "force") forceMoveSmall();
      //--- // 

      if (layout == "grid") forceMoveSmall( );
      //--- // 

      if (layout == "linear") linearMoveSmall( );
      //--- //

      //handleSubLocs (subLocState, id );//

  },[data, layout, flowselected])

  useEffect (() => { 
     // send the updated values -- //
      handleSubLocs (subLocState, id );//
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

    // add link forces and draw links.. 

      for (let i = 0; i < 40; ++i) {
            simulation.tick();
            setAnimatedNodes([...simulation.nodes()]);
            //setAnimatedLinks([...simulation.links( )])
            const updatedLinks = links.map(link => ({
                  source: { x: link.source.x, y: link.source.y },
                  target: { x: link.target.x, y: link.target.y }
            }));
            //const linkForce = simulation.force("link");
            //const linksnew = linkForce.links( );
            //setAnimatedLinks([...linksnew]);
            // -- END --- // 
      } 

      locs.current = [ ];
      // -- small circle 
      let selection = d3.select(groupRef.current)
          .selectAll('.smallcircle')
          .data(data)  
          .attr('class', 'smallcircle')
          .transition()
          //.delay(3000)
          .duration(3000)
          .attr('cx', ((d, i) => {
            //console.log ("force xy ", d.x, ': ',  d.y)
            locs.current.push ({id: d.id, loc: [d.x, d.y]}); 
            return d.x }))
          .attr('cy', ((d, i) => {
            return d.y }))
          .attr('r', circleSmallSize)
          .attr('fill', circleSmallFill)
          //.call (updateSubLocs)

      //updateSubLocs (selection)
      //console.log ('locs', locs)
      setSubLocState(locs.current)


      // // -- draw lines.. 
       d3.select(groupRef.current)
          .selectAll('.linksmall')
          .data(links)  
          .attr('class', 'linksmall')
          .transition()
          //.delay(3000)
          .duration(3000)
          .attr('x1', (d => d.source.x))
          .attr('y1', (d => d.source.y))
          .attr('x2', (d => d.target.x))
          .attr('y2', (d => d.target.y))


      simulation.alpha(0.1).restart();

      return simulation.stop(); // clean up function

  };

  // -- draw small groups (linear) -- // 
  function linearMoveSmall ( ) { 
        locs.current = [ ] ;
        let linespace = 0;
        let rootY = 0;
        if (data.length>0) rootY = dateScale(data[0].date_1)
        //console.log ("root Ypos  = ", rootY);
        // -- console.log -- //
        let selection = d3.select(groupRef.current)
          .selectAll('.smallcircle')
          .data(data)  
          .attr('class', 'smallcircle')
          .transition( )
          //.duration(4000)
          .attr('r', circleSmallSize)
          .attr('cx', 0)
          .attr('cy', (d, i) => {
            let y = dateScale (d.date_1); //
            //console.log ("line xy ", [0, y-rootY])
            locs.current.push ({id: d.id, loc: [0, y-rootY]}); //([0, y-rootY])
            return y - rootY;

          })
          .attr ('fill', circleSmallFill)
          // .call (updateSubLocs)

      // -- update links -- // 
      let updatedLinks = [...animatedLinks];

      //updateSubLocs (selection)
      //console.log ('locs', locs)
      setSubLocState(locs.current)


      // --- draw the links... // 
      d3.select(groupRef.current)
        .selectAll('.linksmall')
        .data(links)
        .attr('class', 'linksmall')
        .transition()
        .duration(4000)
        .attr('x1', 0)
        .attr('y1', d => { 
            // this locates them in number order = not a good way :( 
            // get the date 
            let sourceIndex = data.findIndex( i => i.id == d.source.id) ;// get (index, i)
            const dateValue = data[sourceIndex]?.date_1;
            //console.log ('date source val = ', dateValue)
            //console.log ("... ", d, " D = " , data[sourceIndex].date_1)
            return dateScale (dateValue) - rootY
            //return sourceIndex +300 
        })
        .attr('x2', 0)
        .attr('y2', d => { 
             let targetIndex = data.findIndex( i => i.id == d.target.id)
             const dateValue = data[targetIndex]?.date_1;
             //console.log ('date targ val = ', dateValue)
             return dateScale (dateValue) - rootY
             //return targetIndex + 0;
        })


  }

  // 
  function circleSmallFill (d, i) { 
      //console.log ("small circle data = ", selectedmakers)
      if (flowselected[0].map (m=>m.id).includes (d.id)) return 'red'
      if (flowselected[1].map (m=>m.id).includes (d.id)) return 'PowderBlue'
      return 'lightgray' // darkGray' // PowderBlue' //
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
  const handleMouseOverSmall = (id) => {
      // Handle mouse over event for a specific bar
        console.log('Mouse over circle with ID:', id);

  };



  return (
    // the main 'cluster'
    <g transform={`translate(${0}, ${0}) scale(1)`} ref={groupRef} className="largecircleGrp">
      <circle
        key={id}
        cx={0}
        cy={0}
        r={1}
        fill="darkGray" // PowderBlue"
        className ="largecircle" // this is the cluster circle.. large.. 
        onMouseOver={() => handleMouseOver(id)}
        onMouseOut ={() => handleMouseOut(id)}


      />
        {/*create an array of small circles inside */}
      { data.map ((d, i) => {
            return <CircleSmall 
                      key={d.id} 
                      id={d.id} 
                      handleMouseOverSmall={handleMouseOverSmall} 
                   />
        }) }

      {
        data.map((d, i) => { 
            return<LinkSmall key={i} id={i} />
        })

      }

    </g>
    );
};

// ------------------------ // 

const CircleSmall = ({id, handleMouseOverSmall}) => {
 //let svgRef = useRef(null);




  return (
      // -- nested circle
      <circle
        key={id}
        cx={0}
        cy={0}
        r={0}  
        //fill="orangered"
        // opacity={0.8}
        className="smallcircle"
        onMouseOver={() => handleMouseOverSmall(id)}

      />
    );
};

const LinkSmall = ({id}) => {
 //let svgRef = useRef(null);

  return (
      // -- link to 
      <line
        key={id}
        x1={0}
        y1={0}
        x2={0}
        y2={0}
        stroke="darkGray"//PowderBlue"
        strokeWidth={3}
        opacity={1}
        className="linksmall"
      />
    );
};






export default SocialCluster;



