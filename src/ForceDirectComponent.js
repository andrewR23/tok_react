import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { select } from 'd3-selection';
import Button from '@mui/material/Button';
import * as  Vec2D from 'victor';
import * as f from './functions.js';





const ForceDirectComponent = ({ data, layout, selection, linkGroups, daterange, colorScale, sliderState, selectedItem, onDataClick,  onItemClick }) => {
  
  // -- dom elements -- 
  const chartRef = useRef(null);
  let svg

  // -- force simulations 
  let simulationRef = useRef(null); // Ref for storing the simulation instance
  
  let simulation_childRef = useRef ([ ]); // an array of simulation objects.. // 
  let simulation_parentRef = useRef ([ ]); // an array of simulation objects.. // 


  // -- scales 
  const dateScaleRef = useRef(null);
  let yearScaleSize = d3.scaleLinear()

 //-- link colours -- // 
 let groupColorScale = colorScale; // from parent app 
 // d3.scaleOrdinal()
 //   .domain(Object.keys(linkGroups))
 //   .range(['red', 'orange', 'blue', 'green', 'purple', 'yellow', 'pink', 'brown', 'gray', 'cyan']);
 //let colourkeys = groupColorScale.domain( );
  //let colourvals = groupColorScale.range ( );

  // -- selections 
  let groupLrg;
  let groupSmall;
  let groupText;

  let largeCircle; 
  let smallCircle;
  let childLink, childLinkGroup, childLinkLines;

  //let yAxisGroup, yAxis;
  let yAxisRef = useRef(null);


  // -- clicked group -- 
  let selectedGroup = useRef(null)
  let selectedMakers = useRef (selection)
  let hasScaled = false;  // ??


  // -- init - create forces  -- //
  function createChildSimulation(d) {
        const simulation = d3.forceSimulation(d.nodes)
            .force("center", d3.forceCenter(0, 0).strength(1)) // Adjust center as needed
            .force("collide", d3.forceCollide(30)) // Adjust radius as needed
            //.force("charge", d3.forceManyBody().strength(-10)) // Adjust strength as needed
            .force("link", d3.forceLink(d.links).id(d => d.id).distance(30)); // link FORCCE..(set link to closeness in date ? ) 
        return simulation;
  }

  // --- USE EFFECT -- // 
  useEffect(() => { 

    // -- create a parent ref for the child nodes 
    simulation_parentRef.current= d3.forceSimulation( );

    // -- create: group simulation -- // 
    simulationRef.current = d3
      .forceSimulation(data)
      .force('center', d3.forceCenter(1000, 500).strength(1))
      .force('charge', d3.forceManyBody().strength(1))
      .force('collide', d3.forceCollide(d => d.nodes.length * 14+ 2));

    // -- create child simulation -- //
    simulation_childRef.current = data.map(createChildSimulation);

    // -- start tick -- // 
    simulation_parentRef.current.on ('tick', tick_small)
    simulationRef.current.on('tick', tick_large);
    //simulation_childRef.current.forEach (d => d.on('tick', tick));

    // -- set date ref scale -- //
    dateScaleRef.current = d3.scaleLinear()
                            .domain([1600, 1900])
                            .range([0, 1000]);

    let yrspan = 10;                     
    yearScaleSize.domain([daterange[1]-50, daterange[1], daterange[1]+yrspan]).range([3, 10, 3]); // size (min max min)
    //yearScaleSize.domain([daterange[1]-(daterange[1]-daterange[0]), daterange[1], daterange[1]+(daterange[2]-daterange[1])]).range([1, 10, 1]); // size (min max min)



  }, [ ])

  // -- forces between children -- // 
  // -- on data AND layout update -- 
  useEffect (() => { 
      //console.log ('incoming data  =', data)
      console.log ('date range = ', daterange)
      svg = d3.select(chartRef.current)

      groupLrg = svg.selectAll('.grpLarge').data(data);
      groupSmall = groupLrg.selectAll('.child').data(d => d.nodes)
      groupText = groupSmall.selectAll('.label').data(d => [d]); 


      //childLink = groupLrg.selectAll('.childlink').data(d => d.links);
      // -- a group to hoold several lines
      childLinkGroup = groupLrg.selectAll('.childlinkGrp').data(d => d.links);
      childLinkLines = childLinkGroup.selectAll('.childlines').data( d => d.type); // a line (path)

      // -- put group into date order --regardless of whether this is force of date view -- // 
      groupLrg.each (g => { 
          if (g.nodes.length > 0) {
            g.nodes = g.nodes.sort((a, b) => a.date_1 - b.date_1); 
          }
      })

      //----------------------------------//

      // this should not be in two places..!
      yearScaleSize.domain([daterange[1]-50, daterange[1], daterange[1]+50]).range([4, 12, 4]); // size (min max min)
      // set size of date scale
      dateScaleRef.current.domain([daterange[0], daterange[2]]).range ([0, 1000]) ; // y pos 


      if (layout == 'force') {
          forceLayout( )
      }

      if (layout == 'date') { 
          dateLayout( );
      }

      if (layout == 'grid') { 
          gridLayout( );
      }


      // --draw shapes -- //
      drawLinksSmall( );
      drawGroupsLarge( );
      drawGroupsSmall( );

      // -- interaction -- //
      // groupSmall.on('click', handleClick);// 
      // - when clicked -add item to 'selected'
      // groupLrg.on('click', handleClickedGroup); 
      // window.addEventListener('click', resetScale); 
      // groupLrg.on('click', scaleItem);// dblclick


    }, [data, layout])


  /// - use effect for interactions.. // ?? (All of them ?? )
  useEffect(() => {
      // -- groupLrg.on('click', scaleAndMoveGroup); // -- click on item to move the whole group and zoom in.. 
      //groupLrg.on('click', handleClickedGroup); 

      window.addEventListener('click', handleClickedWindow);
    


    }, []);

  useEffect (() =>  { 
      // on slider move.. 
    //console.log ('slider state ', sliderState)
    if (sliderState == true) { 
      simulationRef.current.stop( );
      simulation_parentRef.current.stop( ); // 
    }


  }), [ sliderState]



  // ---------------------- // 
  //  --- TICKS (forces)  -- // 
  function tick_large ( ) { 
      console.log ('tick large')
       // -- update groups (large groups)
        groupLrg
            .transition( )
            .duration(100)
            .tween ('groupmove', groupTween) 
            .attr("transform", d => `translate(${d.x}, ${d.y})`);

  }

  // -- tick small -- // 
  function tick_small ( ) { 
        //console.log ('tick small')
          groupSmall
            .transition( )
            .duration(200)
            .tween ('groupmove', groupTween) // update the gx and gy values -- 
            .attr("transform", d => `translate(${d.x}, ${d.y})`);
        
       
        // -- for multiple lines -- (a group with lines situtated within) -- //
        
          childLinkGroup
              .transition( )
              .duration(200)
              .tween  ('pathmove', function (d) {   
                    let childLines = d3.select(this).selectAll('.childlines');

                    return function (t) { 
                          // -- get the  xy positions of the group 
                          let x1 = d.source.gx; 
                          let y1 = d.source.gy; 
                          let x2 = d.target.gx; 
                          let y2 = d.target.gy; 

                          let sr = d.source.gr; // source radius
                          let tr = d.source.gr; // target radius

                          // -- UPDATE PATHS TWEEN -- // paths --
                          childLines.each ( function (p, i) {  
                              // // -- the first line is straight -- 
                              let path = d3.select(this).attr("d", f.curve2([[x1, y1], [x2, y2]]))

                              // also need to draw a shape around the path...
                          })

                          // -- add a BLOB  path around the whole thing... during forces! 
                          let group = d3.select(this) 
                          let blob = group.selectAll ('.blobpath').data ([d])
                          

                          let sourceloc  = {x:x1, y:y1}
                          let targetloc  = {x:x2, y:y2}
                          let radius = { source: sr, target: tr}

                          // on update -- 
                          blob
                            .transition( )
                            .duration(100)
                            .attr('d', d => { 
                                let blobshape = ""
                                //if (sourceloc.x != undefined) {
                                    //console.log ('source loc undefined = ', sourceloc)
                                    //blobshape = f.createPathShape(sourceloc, targetloc, radius);  
                                //} 
                                return blobshape
                            })

                          // on enter -no defined -- 
                          blob.enter ()
                            .append ('path')
                            .attr('class', 'blobpath')
                            .attr('d', d => { 
                                let blobshape = ""
                                return blobshape

                            })
                            .attr('fill', 'PowderBlue')
                            .attr('opacity', 0.4)


                    }
            })
    }



  // --- DRAW GROUPS  -- // 

  function drawGroupsLarge ( ) { 
    //groupLrg = svg.selectAll('.grpLarge').data(data)

    //console.log ('draw large groups')
    // -- CREATE GROUPS -- / 
    // Update existing groups 
     groupLrg
        .attr('gx', d => d.gx)
        .attr('gy', d => d.gy)

    // Enter new groups -- how the first enter -- 
    groupLrg
        .enter()
        .append('g')
        .attr ('class', 'grpLarge')
        .attr("groupID", (d, i) => { 
          d.groupID = i; 
          return i;
        })
        .attr('gx', d => d.gx)
        .attr('gy', d => d.gy)
        .attr('transform', (d => 'translate(0,0)'))
        .on('click', handleClickedGroup); // Add onclick event listener

    // -- remove -- how they leave
    //groupLrg.exit()
      //  .remove();


    // -------------------------------------- // 
    // -- ATTACH CIRCLES to each LargeGROUP  -- 
    largeCircle = groupLrg.selectAll('.largeCircle')
        .data(d => [d]); // bind each circle to the data of each group.

    // -- Update existing groups 
    largeCircle
        .transition( )
        .duration(2000)
        .attr('r', d => d.nodes.length * 5)
        .attr ('fill', 'PowderBlue')
        .attr('opacity', 0.2)
        //.attr ('dosomething', d => console.log ("update "))

    // -- Enter new groups -- how the first enter -- 
    largeCircle
        .enter()
        .append ('circle')
        .attr ('class', 'largeCircle')
        .attr('r', d => d.nodes.length * 5)
        .attr ('fill', 'PowderBlue')
        .attr('opacity', 0.2)
        //.attr ('dosomething', d => console.log ("enter ")

    // -- remove -- how they leave
    //largeCircle.exit()
      //  .remove();
    // ---------------------- //


  }



  function drawGroupsSmall( ) { 
      groupSmall
        .attr('gx', d => d.gx)
        .attr('gy', d => d.gy)
        .attr('gr', d => {
            d.gr = (Math.max (yearScaleSize(d.date_1), 0))+2 ;// -- this is a dupicate - add as separate function -- // 
       })

      groupSmall
        .enter( )
        .append('g')
        .attr('class', 'child')
        .attr('gx', d => d.gx)
        .attr('gy', d => d.gy)
        .attr('gr', d =>  d.gr = (Math.max (yearScaleSize(d.date_1), 0))+3)
        .attr('transform', d => `translate(${d.gx},${d.gy})`)


      groupSmall.exit( ).remove( )

      // ---- // 
      smallCircle = groupSmall.selectAll('.smallCircle').data(d => [d]); 

      smallCircle
          .transition( )
          .duration(1000)
          .attr('r', d =>  (Math.max (yearScaleSize(d.date_1), 0))+3)
            .attr ('fill', d => { 
              if (selectedMakers.current[1].makers.map (m => m.id).includes(d.id)) return 'red'
              if (selectedMakers.current[0].makers.map (m => m.id).includes(d.id)) return 'gold'
              return 'PowderBlue'
          })          
          .attr('opacity', 0.7)

      smallCircle
          .enter()
          .append ('circle')
          .attr ('class', 'smallCircle')
           .transition( )
            .duration(1000)
          .attr('r', d =>  (Math.max (yearScaleSize(d.date_1), 0))+3)
          .attr ('fill', d => { 
              if (selectedMakers.current[1].makers.map (m => m.id).includes(d.id)) return 'red'
              if (selectedMakers.current[0].makers.map (m => m.id).includes(d.id)) return 'gold'
              return 'PowderBlue'
          })
          .attr('opacity', 0.7);



           // -- text element 
      //groupSmall.append ('text').attr('x', 0).attr('y', 0).text("text").fill('black')
      //let groupText = groupSmall.selectAll('.label').data(d => [d]); 
      groupText
        .style('visibility', 'hidden')

      groupText.enter( )
          .append('text')
          .attr('class', 'label')
          .attr('x', 0)
          .attr('y', 0)
          .text(function (d) {
              let titlecase = d.name.charAt(0).toUpperCase() +d.name.substring(1).toLowerCase();
              return titlecase;
          })
          .style('fill', '#cfd8dc') // material bluegrey 100
          .style('font-size', '10px')
          .style('text-transform', 'lowercase')
          .style('text-transform', 'capitalize')
          .style('font-family', 'sans-serif')
          .style('visibility', 'hidden')
          .attr('transform', 'rotate(-30, 0, 0), translate(12, 4)');

      groupText.exit( ).remove( );

  }



  function drawLinksSmall ( ) { 
      // for MULTIPLE LINES -- // 
      childLinkGroup
          .attr('class', 'childlinkGrp')

      childLinkGroup
          .enter( )
          .append('g')
          .attr('class', 'childlinkGrp')
     

      childLinkGroup
            .exit( )
            .remove( )


      // APPEND a line for each "type" in the link
      //childLinkLines = childLinkGroup.selectAll('.childlines').data( d => d.type)
      childLinkLines
         .style("stroke-width", "1px")
         .attr ('stroke',  d => {
            let col = 'black'
            let linkGrpNum = Object.entries(linkGroups).find(([group, type]) => type.includes(d))?.[0];
            if (linkGrpNum == undefined)  return col;
            col = groupColorScale (linkGrpNum)
            return col;
            //return linkColorScale(d)

        })
         //.style('opacity', 0.5)

      // -- using a path instead of a line -- // 
      childLinkLines
          .enter( )
          .append('path') // -- path instead of line.. 
          .attr('class', 'childlines')
          .attr ('stroke', d =>  { 
            let col = 'black'
            let linkGrpNum = Object.entries(linkGroups).find(([group, type]) => type.includes(d))?.[0];
            if (linkGrpNum == undefined)  return col;
            col = groupColorScale (linkGrpNum)
            return col;
            //return linkColorScale(d)

          })
          .style("stroke-width", "1px")
          .style('fill', 'none')
          .style('opacity', 0.5)


      childLinkLines.exit( ).remove( );


  }


  // -- TWEENS -- // 
  function groupTween (d) {               
    return function (t) { 

      // -- extract the transform translate values & update data on group
     //console.log ('group tweening', this)
      const transformAttribute = this.getAttribute('transform')
      const translateValues = transformAttribute.match(/translate\((.*?), (.*?)\)/);
      if (translateValues) { 
          const [ , translateX, translateY ] = transformAttribute.match(/translate\((.*?), (.*?)\)/).map(parseFloat);
          this.setAttribute ('gx', translateX) // Update the GX and GY values -- // 
          this.setAttribute ('gy', translateY)
          d.gx  = translateX
          d.gy  = translateY
          //d.gr = 10001; // -- update the data -- // 
      }
    }
  }

  // ------------------- // 
  // -- tween line groups (and all lines inside the group)
  function linkGroupTween (d) { 
      //console.log ("link group ...")
      // -- get ALL the lines (nodes) inside this group -- // 
      let childLines = d3.select(this).node( ).childNodes; 

      // if this line connection is in the selected group : then set its curve..
      let lineParent = d3.select(this).node( ).parentNode; 
      let curveAmt = 0.1

      if (selectedGroup.current == lineParent) { 
        curveAmt = 0.9
      } 
       
        return function (t) { 
              // -- get the  xy positions of the two nodes (source - target)
              let x1 = d.source.gx; 
              let y1 = d.source.gy; 
              let x2 = d.target.gx; 
              let y2 = d.target.gy; 

              //console.log ('gx ', d.source.gx)


              this.setAttribute ('x1', x1)
              this.setAttribute ('y1', y1)
              this.setAttribute ('x2', x2)
              this.setAttribute ('y2', y2)

              // -- LINE TWEEN -- // 
              childLines.forEach ( function (line, i) {   
                   line.setAttribute ('x1', x1)
                   line.setAttribute ('y1', y1)
                   line.setAttribute ('x2', x2)
                   line.setAttribute ('y2', y2)

                  // -- the first line is straight -- 
                  if (i==0) return line.setAttribute("d", f.curve2([[x1, y1], [x2, y2]]))

                  // -- other lines need a curve amt -- 
                  let curvePath = f.createCurvePath (x1, y1, x1, y2, i,  0.01 )

                  line.setAttribute("d", curvePath)
              })
        }
  }

  function linkTweenNew (d){ 
    console.log ("this is a tween... ")
  }


  // ------------------- // 

  function forceLayout ( ) { 
      //console.log ("do force layout..")
      // -- create simulation
      simulation_childRef.current = data.map(createChildSimulation);

      // --update nodes -- ? - this helps to re-calculate positions..  
      simulationRef.current.nodes(data); 
      simulation_childRef.current.forEach ((sim, i) => sim.nodes (data[i].nodes));

      // -- restart  -- if using forces -- 
      let aStart = 0.1 ; // start point
      let aDecay = 0.0228; // decay rate. 
      //simulationRef.current.alpha(aStart).restart( );
      simulation_parentRef.current.alpha(aStart).restart( ); 

      simulationRef.current.restart( ); // 
      //simulation_parentRef.current.restart( ); 
      

      // -- re draw  // 
      simulation_parentRef.current.on ('tick', tick_small)
      simulationRef.current.on('tick', tick_large); // can this act as a parent to the child nodes.. 
      //simulation_childRef.current.forEach (d => d.on('tick', tick)); 

      // ------ //

  }


  function dateLayout ( ) { 

        //console.log(childLinkGroup.size()); // Check the number of selected elements
        //console.log(childLinkGroup.nodes()); // Log the array of selected DOM nodes
        //console.log (childLinkGroup.transition( ))

          simulation_parentRef.current.stop( )
          simulationRef.current.stop( )
          //simulation_childRef.current.forEach (sim => sim.stop( ))

          // move items -- 
          let xspacing = 55;
          groupLrg
            .transition( )
            .duration(3000)
            .tween ('groupmove', groupTween) 
            .attr('transform', ((d, i) => {
                 // -- sort nodes into date order & get the earliest node -- 
                  if (d.nodes.length > 0) {
                      //d.nodes = d.nodes.sort((a, b) => a.date_1 - b.date_1); // -- not needed if sorted elsewhere -- // --
                      // -- set the baseY for the group -- 
                      d.baseY =  dateScaleRef.current(d.nodes[0].date_1); // -- earliest year -- // 
                  }
                  let xpos = i *xspacing + 100;
                 return 'translate('+xpos+','+ d.baseY+')'
            })) // set the destination values.. 

         

          groupSmall
            .transition( )
            .duration(3000)
            .tween ('groupmove', groupTween) // update gx gy
            .attr('transform', function (d, i)  {
                // -------- // 
                // -get parent group -- // 
                let parentY = select(this.parentNode).datum( ).baseY; // group (parent) pos
                let ypos = dateScaleRef.current(d.date_1)-parentY;


                return 'translate('+0+','+ypos+')'
            })// set the destination values.. 


            // ---------- // should these be two separate functions // ?? 
            childLinkGroup
              .transition( )
              .duration(3000)
              //.tween ('linemove', linkGroupTween);// (OLD)
                            .tween  ('pathmove', function (d) {   
                    let childLines = d3.select(this).selectAll('.childlines');

                    return function (t) { 
                          // -- get the  xy positions of the group 
                          let x1 = d.source.gx; 
                          let y1 = d.source.gy; 
                          let x2 = d.target.gx; 
                          let y2 = d.target.gy; 

                          let sr = d.source.gr; // source radius
                          let tr = d.source.gr; // target radius

                          // -- UPDATE PATHS TWEEN -- // paths --
                          childLines.each ( function (p, i) {  
                              // // -- the first line is straight -- 
                              let path = d3.select(this).attr("d", f.curve2([[x1, y1], [x2, y2]]))

                              // also need to draw a shape around the path...
                          })

                          // -- add a BLOB  path around the whole thing... during forces! 
                          let group = d3.select(this) 
                          let blob = group.selectAll ('.blobpath').data ([d])
                          

                          let sourceloc  = {x:x1, y:y1}
                          let targetloc  = {x:x2, y:y2}
                          let radius = { source: sr, target: tr}

                          // on update -- 
                          blob
                            .transition( )
                            .duration(100)
                            .attr('d', d => { 
                                let blobshape = ""
                                //if (sourceloc.x != undefined) {
                                    //console.log ('source loc undefined = ', sourceloc)
                                    //blobshape = f.createPathShape(sourceloc, targetloc, radius);  
                                //} 
                                return blobshape
                            })

                          // on enter -no defined -- 
                          blob.enter ()
                            .append ('path')
                            .attr('class', 'blobpath')
                            .attr('d', d => { 
                                let blobshape = ""
                                return blobshape

                            })
                            .attr('fill', 'PowderBlue')
                            .attr('opacity', 0.4)

                          //console.log (`source gr: ${d.source.gr}, target gr: ${d.target.gr}`)
                        
                          
                          //console.log ('source loc... ', sourceloc)

                          // if (sourceloc.x != undefined) {
                          //       //console.log ('source loc undefined = ', sourceloc)
                          //       let blobshape = f.createPathShape(sourceloc, targetloc, radius); 
                          //       blob.transition( ).duration(500).attr("d", blobshape).attr('fill', 'gray').attr('opacity', 0.5)
                          // } 

                          // create the path from the two radius elements and 
                    }
            })



  }


  function gridLayout ( ) { 
      
        // start child forces - 
        // simulation_childRef.current.forEach (d => d.on('tick', tick_smallGroups)); 
        simulation_parentRef.current.restart( ); // .alpha(0.2)
        simulation_parentRef.current.on ('tick', tick_small)



        // tick_smallGroups( )
        // simulation_childRef.current.forEach (sim => sim.stop( ))
        // simulation_childRef.current[0].on("tick", (tick_smallGroups))

        // stop group forces// 
          simulationRef.current.stop( )

          let n = 100
          let colNum = 10
          let space = 20;
          let w = 50
          for (let i = 0; i < n; i++) {
              // const object = document.createElement('div');
              // object.style.width = objectWidth + 'px';
              // object.style.height = objectHeight + 'px';
              // object.style.position = 'absolute';

              const column = i % colNum;
              const row = Math.floor(i / colNum);

              const left = column * (w + space);
              const top = row * (w + space);

              // console.log ('left ', left, '    top: ', top)
              // object.style.left = left + 'px';
              // object.style.top = top + 'px';
              // container.appendChild(object);
        }

         groupLrg
                .transition( )
                .duration(3000)
                .tween ('groupmove', groupTween) 
                .attr('transform', ((d, i) => {
                   // 
                  let xpos = 500 + i* 40; 
                  let ypos = 0; 
                  
                  let [x, y] = calcGridPos(d, i)

                  return `translate(${x+200}, ${y+100})`

                }))

  }

  function calcGridPos (d, i) { 
      let colNum = 15
      let spacing = 100; //d.nodes.length*10;
      let itemwidth =  70; //  d.nodes.length*14
      //console.log ('d = ', d)

      const column = i % colNum;
      const row = Math.floor(i / colNum);

      const left = column * (itemwidth + spacing);
      const top = row * (itemwidth + spacing);

      return [left, top]

    }


  // -- SCALE -- // 

  // -- spread child items (circles / text) -- // 
  function spreadChildItems (selectedgroup, itemScale) { 

        // -- do something with selection -- // 
        // -- get all the circles (each inside child group)
        const childGroups = select(selectedgroup).selectAll(".child"); // child nodes (within a group element) -circle + text 
        const childLinkGroups = select(selectedgroup).selectAll(".childlinkGrp");
        //const childText = select(this).selectAll('.label')

        // -- get the height of the group -- 
        //let grpSize = select(this).node( ).getBoundingClientRect( );
        //console.log ('group size = ', grpSize.height)


        // -- large circle // 
        //  circles.each (function (c,i){ 
        //            let circle = d3.select(this).attr('opacity', 0.1)
        //        })
        //const largeCircle = select(this).selectAll ('.largeCircle').attr('cx', 100).attr('cy', 100).attr('opacity', 0.5).attr('r', 200) 

        //largeCircle.attr('r', 500)
        
        // -- SPREAD NODES TO NEW POSITIONS -- // 
        // sort into date groups -- 
        const groupedElements = [];
        let tempArray = [];
        let threshold = 15; // date tolerance
        // 
        childGroups.each (function (g, i) { 
        const currentMaker= g
        const prevMaker = tempArray[tempArray.length - 1];
        // --------- // 
        if (!prevMaker || currentMaker.date_1 - prevMaker.date_1 <= threshold) {
                tempArray.push(currentMaker); // add to temp array
            } else {
                groupedElements.push(tempArray); // add temp array to group
                tempArray = [currentMaker]; // start new temp array with current item
            }
            // -------------------------- /// 
            if (i == childGroups.size( )-1) {
                groupedElements.push(tempArray);
            }
        })
        // --- END OF Grouping --- // 
        // -- Sort groups into X positions -- // 
        groupedElements.forEach ( group => { 
          // -- apply a sort to the group.. to appy an x value spread -- //
          group.forEach ((item, i) => { 
              item.sortedX = i * 50; // give each a sortedX value spacing
          })
        })

        // -- LABELS make visible -- // 
        childGroups.each (function (g, i) { 
          d3.select(this).select('text').style('visibility', 'visible');

        })

        // -- SPREAD CHILD ITEMS -- // 

        // -- SET XY of groups (and circle inside) -- //      
        childGroups.transition( )
          .duration(1000)
          .tween ('groupmove', groupTween) 
          .attr("transform", function (d, i)   { 
                  let tx = d.sortedX; //i*40 + d.sortedX; 
                  let ty = d.gy 
                  return `translate(${tx},${ty}) scale(${itemScale})`;
            }); // move and scale the group (with the circle in it ...)


        // -- RE-CALCULATE LINES of the selected group -- // 
          childLinkGroups
              .transition( )
              .duration(1000)
              .tween ('newposition', function(d) { 
                  let childlines = d3.select(this).selectAll('.childlines')

                  return function (t) { 
                      let x1 = d.source.gx; 
                      let y1 = d.source.gy; 
                      let x2 = d.target.gx; 
                      let y2 = d.target.gy; 
                      //console.log (`new:x1, ${x1} , y1 ${y1},  x2 ${x2}  y2${y2}}`)

                      childlines.each (function (p, i){ 
                          let path = d3.select(this)
                          //console.log ("i = ", i) // no. of paths in a single link.. 
                          if (i==0) return path.attr("d", f.curve2([[x1, y1], [x2, y2]])) ; // if first line draw straight path..
                          let curve = f.createCurvePath (0, 0, x2, y2, i,  0.1 )
                          path.attr("d", curve)


                      })
                  }
              })
  }

  // -- move and scale all (entire svg group) --  put the seleted item in the middle.. 
  function moveAndScaleAll(selectedgroup, scale) { 

      let grp = select(selectedgroup).node( )

        let grpSize = grp.getBoundingClientRect( );
        console.log ('group size = ', grpSize)
        let targetHeight = 500; // scale to a target height 
        let grpScale =  targetHeight / grpSize.height;  
        scale = Math.min (grpScale, 2.5); //constrain the scale value; 
        //console.log ("current scale = ", scale)

        let gx = selectedgroup.getAttribute('gx');
        let gy = selectedgroup.getAttribute('gy');         
        // -- centre : 1000 x 500 (half width and half height) --
        // get group diment
        // is there a max scale... 
        
        // position to move to -- 
        let leftmargin = 800; 
        let topmargin = 300; 
        let cx = leftmargin/scale; // centre of canvas -- 
        let cy = topmargin/scale; // put at the top
        // -- target position -- 
        let tx = (cx - gx)*scale; //* (1 - scale); 
        let ty = (cy - gy)*scale; // * (1 - scale);

        // --- // 
        d3.select(chartRef.current)
        .transition()
        .duration(1500)
        .attr ('transform', `translate(${tx}, ${ty}), scale(${scale})`); 

        // -- change  large circle  - move around the group -- 
        //let groupNode = select(selectedgroup).node( )
        let largeCircle = select(grp).selectAll ('.largeCircle').node( )

        //console.log ('large Circle = ', select (largeCircle).node( ))

        d3.select (largeCircle)
                .transition( )
                .duration(1000)
                .style ('opacity', 0.05)
                .style ('fill', 'white')
                .attr('cx', grpSize.width)
                .attr('cy', grpSize.height)
                .attr('r',  grpSize.height*1.5)

        
      


    }

  // --- change scale of group and fade out others -- 
  function fadeGroupsScaleItem (selected, scale) {

        // --  get all groups selected -- //
        const allgroups = d3.selectAll ('.grpLarge'); // get all groups in the DOM
        //let scale = 1.0

        allgroups.each (function (g,i){ 

            // -- get all the circles and paths inside each  group 
            let circles = d3.select (this).selectAll ('.child circle');
            let paths = d3.select (this).selectAll ('.childlinkGrp path');
            let text = d3.select (this).selectAll ('.child text');
            let largeCircle = d3.select(this).select('.largeCircle')

            // -- if this group is NOT selected  FADE OUT-- // 
            if (this != selected) { 
                //-- if NOT selected
                circles.each (function (c,i){ 
                    let circle = d3.select(this).attr('opacity', 0.1)
                })

                paths.each (function (p, i){ 
                    let path = d3.select(this).style('opacity', 0.1)
                })

                text.each (function (p, i){ 
                    let text = d3.select(this).style('visibility', 'hidden')
                })

                largeCircle.transition().duration(1000).style('opacity', 0.01)

                let grp = d3.select(this)
                    .transition( )
                    .duration(2000)
                    .attr('transform', d => (`translate(${d.gx}, ${d.gy}) scale(1.0)`))

            } else { 
                // -- if IS selected
                circles.each (function (c,i){ 
                    let circle = d3.select(this).attr('opacity', 1.0)
                })

                paths.each (function (p, i){ 
                    let path = d3.select(this).style('opacity', 1.0)
                })

                text.each (function (p, i){ 
                    let text = d3.select(this).style('visibility', 'visible')
                })

                let grp = d3.select(this)
                    .transition( )
                    .duration(2000)
                    .attr('transform', d => (`translate(${d.gx}, ${d.gy}) scale(${scale})`))

            }

        })

    }


  // -- restore child items -- // 
  function restoreChildItems (selectedgroup) { 
      const childGroups = select(selectedGroup.current).selectAll(".child"); // 
      const childLinkGroups = select(selectedGroup.current).selectAll(".childlinkGrp");
      //const childGroups = d3.selectAll(".child"); // 
      //const childLinkGroups = d3.selectAll(".childlinkGrp");

         // -- LABELS make Invisi -- // 
        childGroups.each (function (g, i) { 
          d3.select(this).select('text').style('visibility', 'hidden');

        })

      // -- move child groups back to position
      childGroups.transition( )
          .duration(1000)
          .tween ('groupmove', groupTween) 
          .attr("transform", function (d, i)   { 
                  let tx = 0; //d.sortedX; //i*40 + d.sortedX; 
                  let ty = d.gy 
                  return `translate(${tx},${ty}) scale(${1})`;
            }); // move and scale the group (with the circle in it ...)

        // -- make the paths straight again 
        childLinkGroups
              .transition( )
              .duration(1000)
              .tween ('newposition', function(d) { 
                  let childlines = d3.select(this).selectAll('.childlines')

                  return function (t) { 
                      let x1 = d.source.gx; 
                      let y1 = d.source.gy; 
                      let x2 = d.target.gx; 
                      let y2 = d.target.gy; 

                      childlines.each (function (p, i){ 
                          let path = d3.select(this)
                          // straight path -- 
                          return path.attr("d", f.curve2([[x1, y1], [x2, y2]])) ;

                      })
                  }
              })
        // -- //
  }

  function restoreAllColours () { 

    const allgroups = d3.selectAll ('.grpLarge'); // get all groups in the DOM
        //let scale = 1.0

        allgroups.each (function (g,i){ 
            // -- get all the circles and paths inside each  group 
            let circles = d3.select (this).selectAll ('.child circle');
            let paths = d3.select (this).selectAll ('.childlinkGrp path');
            let text = d3.select (this).selectAll ('.child text');
            let largeCircle = d3.select (this).selectAll ('.largeCircle');


            // ---- 
            circles.each (function (c,i){ 
                let circle = d3.select(this).transition().duration(3000).attr('opacity', 1.0)
            })

            paths.each (function (p, i){ 
                let path = d3.select(this).transition().duration(3000).style('opacity', 0.5)
            })

            text.each (function (p, i){ 
                let text = d3.select(this).style('visibility', 'hidden')
            })

            // large circle - restore position --
            largeCircle.transition( ).duration(1000)
            .style('fill', 'PowderBlue')
            .style('opacity', 0.1)
            .attr ('r', d => d.nodes.length* 5)
            .attr ('cx', 0)
            .attr ('cy', 0)

            //let grp = d3.select(this)
              //  .transition( )
                //.duration(2000)
                //.attr('transform', d => (`translate(${d.gx}, ${d.gy}) scale(1.0)`))

        })

              
 }





// ---------------------------- // 
// -- CLICKS interactions -- // 

function handleClickedGroup ( ) { 
      selectedGroup.current= this; 

      let itemScale = 1.0
      let grpScale = 1.0;

      spreadChildItems (selectedGroup.current, 1); // child items
      fadeGroupsScaleItem (selectedGroup.current, 1) // fade others and scale selected 
      moveAndScaleAll(selectedGroup.current, 1); // move everything based on group click -- // 

      hasScaled = true;
      event.stopPropagation(); // prevent window click --
  }

function handleClickedWindow(event) {
    //console.log ("window is clicked ")

    //console.log (selectedGroup)
    // if (selectedGroup != null) selectedGroup.curve = 0; 


    // return all elements to original position -- 
    //if (hasScaled) {
        if (!chartRef.current.contains(event.target)) {
          d3.select(chartRef.current)
            .transition()
            .duration(2000)
            .attr('transform', 'translate(0, 0), scale(1)');
        }
        // restore the colour values of all objects.. 
        restoreChildItems( );
        if (hasScaled) {
            restoreAllColours( );
            hasScaled = false;
        }

      
    //

  }


const handleClick = (event, d) => {
        // Handle click event here
        console.log('Clicked on bar:', event); // how do I send this data back to the main app ? 
        onDataClick(d);
        // Perform any desired action or state update
    };





// -- RETURN -- // 
return (
    <g ref={chartRef} transform="translate(0, 100) scale(0.9)"></g>

  );


};


export default ForceDirectComponent;
























































