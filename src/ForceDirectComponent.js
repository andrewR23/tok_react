import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { select } from 'd3-selection';
import Button from '@mui/material/Button';
import * as  Vec2D from 'victor';




const ForceDirectComponent = ({ data, layout, selection, linktypes, daterange, yRange, selectedItem, onDataClick,  onItemClick }) => {
  
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

  // -- colour scale -- can this be updated depending on context -- // 
  let linkColorScale = d3.scaleOrdinal( )
      .domain(['see_also', 'child_of', 'took_over_from'])
      .range (['red', 'orange', 'blue'])
      .unknown(['black'])
  
  // -- different types of curves --- // 
  let curve = d3.line().curve(d3.curveCatmullRom.alpha(0.5));
  let curve2 = d3.line( ).curve (d3.curveNatural);
  let curve3 = d3.line().curve(d3.curveBasis);

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

  // -- 

  // let scaleRef = useRef(2); 
  // let translateRef  = useRef ([300, 300])

  // -- updated when data is updated // 
  // -- init - create forces  -- //

  function createChildSimulation(d) {
        const simulation = d3.forceSimulation(d.nodes)
            .force("center", d3.forceCenter(0, 0).strength(1)) // Adjust center as needed
            .force("collide", d3.forceCollide(10)) // Adjust radius as needed
            //.force("charge", d3.forceManyBody().strength(-10)) // Adjust strength as needed
            .force("link", d3.forceLink(d.links).id(d => d.id).distance(10)); // link FORCCE.. 
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
      .force('collide', d3.forceCollide(d => d.nodes.length * 6+ 2));

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

  }, [ ])

  // -- 
  // -- forces between children -- // 

  // -- on data AND layout update -- 
  useEffect (() => { 
     // console.log ('incoming data  =', data)
      //console.log ('date range = ', daterange)
      svg = d3.select(chartRef.current)



      groupLrg = svg.selectAll('.grpLarge').data(data);
      groupSmall = groupLrg.selectAll('.child').data(d => d.nodes)
      groupText = groupSmall.selectAll('.label').data(d => [d]); 


      //childLink = groupLrg.selectAll('.childlink').data(d => d.links);
      // -- a group to hoold several lines
      childLinkGroup = groupLrg.selectAll('.childlinkGrp').data(d => d.links);
      childLinkLines = childLinkGroup.selectAll('.childlines').data( d => d.type)

      // -- put group into date order --regardless of whether this is force of date view -- // 
      groupLrg.each (g => { 
          if (g.nodes.length > 0) {
            g.nodes = g.nodes.sort((a, b) => a.date_1 - b.date_1); 
          }
      })

      //----------------------------------//
      // update selection : 
      // let allselected = selection[0].makers;
      // let flowselected = selection[selection.length-1].makers; 
      // console.log ('flow selected = ', flowselected)
      //console.log ('selection = ', selectedMakers.current )

      yearScaleSize.domain([daterange[0], daterange[0]+50]).range([2, 10]); // size 

      dateScaleRef.current.domain([daterange[0], daterange[1]]).range ([0, 1000]) ; // y pos 

      // ------------------------------ // 
      // -- DATE RANGE -- // 
      // set the size of the node according to date -- 
  


      // //let c = svg.append('circle').attr('cx', 100).attr('cy', 100).attr('r', 100)
      // /// -- this sort of works -- // 
      // //yAxis = d3.axisLeft(dateScaleRef.current);
      // //yAxisGroup = svg.append("g").attr('class', 'yaxis').attr("transform", `translate(${100}, ${0})`).call(yAxis);
      // // ----------------------------//


      // //--  Select or create the y-axis group
      // let yAxisGroup = svg.select('.yaxis');
      // if (yAxisGroup.empty()) {
      //   yAxisGroup = svg.append('g').attr('class', 'yaxis');
      // }

      // // Update the y-axis
      // const yAxis = d3.axisLeft(dateScaleRef.current)
      //    //.tickValues(d3.timeYears(new Date(1600, 0, 1), new Date(1920, 0, 1))) // Set the tick values
      //   // .tickFormat(d3.timeFormat('%Y')); // Format ticks as years
   
      // yAxisGroup.attr('transform', `translate(${50}, ${20})`).call(yAxis);
      // -- END DATE RANGE -- // 



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
      drawGroupsLarge( );
      drawGroupsSmallV2( );
      drawLinksSmall2( );

      //-- interaction -- //
      // groupSmall.on('click', handleClick);// 
      // - when clicked -add item to 'selected'
      // groupLrg.on('click', handleClickedGroup); 

     // window.addEventListener('click', resetScale);
       
     // groupLrg.on('click', scaleItem);// dblclick




      // --- // 
      // groupLrg.on('click', function() {
      //     //  onItemClick(this);  // update as selected item. 
      // });

    }, [data, layout, yRange])


  /// - use effect for interactions.. // ?? (All of them ?? )
  useEffect(() => {
      // -- groupLrg.on('click', scaleAndMoveGroup); // -- click on item to move the whole group and zoom in.. 
      groupLrg.on('click', handleClickedGroup); 
      window.addEventListener('click', handleClickedWindow);


    }, []);


  // for yRange only ?? -- not working independently yet.. 
      // useEffect(() => {
      //     dateScaleRef.current.range ([yRange[0], yRange[1]])
      //     // drawGroupsLarge( );
      //     // drawGroupsSmallV2( );
      //     // drawLinksSmall2( );
      //   }, [yRange]);



  // /// -- update / move selected items 

  // useEffect(()=> { 
    //   // svg = d3.select(chartRef.current)
    //   // groupLrg = svg.selectAll('.grpLarge').data(data);
    //   // groupSmall = groupLrg.selectAll('.child').data(d => d.nodes)

    //   // groupSmall.transition( )
    //   //   .duration(2000)
    //   //   .tween ('groupmove', groupTween) 
    //   //   .attr("transform", 'scale(1.0)');

    //   // update selected item.. 
    //     select(selectedItem).transition( )
    //       .duration(2000)
    //       .tween ('groupmove', groupTween) 
    //       .attr("transform", 'scale(2.2)');

    //  },  [selectedItem])


  // ---------------------- // 
  //  --- TICKS (forces)  -- // 
  function tick_large ( ) { 
       // -- update groups (large groups)
        groupLrg
            .transition( )
            .duration(100)
            .tween ('groupmove', groupTween) 
            .attr("transform", d => `translate(${d.x}, ${d.y})`);

  }

  // -- tick small -- // 
  function tick_small ( ) { 
        //console.log ('tick update')
          groupSmall
            .transition( )
            .duration(100)
            .tween ('groupmove', groupTween) // update the gx and gy values -- 
            .attr("transform", d => `translate(${d.x}, ${d.y})`);
        
         // childLink
         //      .transition( )
         //      .duration(100)
         //      .tween ('linemove', lineTween)

        // -- for multiple lines -- (a group with lines situtated within) -- //
        childLinkGroup
            .transition( )
            .duration(100)
            .tween ('linemove', linkGroupTween) ;// **


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

    // LINK lines -- ///
    // const link = svg.selectAll("link")
    //   .data(links)
    //   .enter()
    //   .append("line")
    //   .attr('class', 'link')
    //   .style("stroke", "#999")
    //   .style("stroke-width", "1px");


  }



  function drawGroupsSmallV2( ) { 
      groupSmall
        .attr('gx', d => d.gx)
        .attr('gy', d => d.gy)

      groupSmall
        .enter( )
        .append('g')
        .attr('class', 'child')
        .attr('gx', d => d.gx)
        .attr('gy', d => d.gy)
        .attr ('x', 100)
        .attr ('y', 100)
        .attr('transform', d => `translate(${d.gx},${d.gy})`)

      groupSmall.exit( ).remove( )

      // -- text element 
      //groupSmall.append ('text').attr('x', 0).attr('y', 0).text("text").fill('black')
      //let groupText = groupSmall.selectAll('.label').data(d => [d]); 
      groupText
        .style('visibility', 'hidden')

      groupText.enter( )
          .append('text')
          .attr('class', 'label')
          .attr('x', 5)
          .attr('y', 10)
          .text(function (d) { console.log ( 'd ', d); return d.name})
          .style('fill', 'black')
          .style('font-size', '8px')
          .style('font-family', 'sans-serif')
          .style('color', 'gray')
          .style('visibility', 'hidden')

      groupText.exit( ).remove( );

      // ---- // 
      smallCircle = groupSmall.selectAll('.smallCircle').data(d => [d]); 

      smallCircle
          .transition( )
          .duration(1000)
          .attr('r', d => 5)//yearScaleSize(d.date_1))
            .attr ('fill', d => { 
              if (selectedMakers.current[1].makers.map (m => m.id).includes(d.id)) return 'red'
              if (selectedMakers.current[0].makers.map (m => m.id).includes(d.id)) return 'gold'

              return 'gray'
          })          
          .attr('opacity', 1.1)

      smallCircle
          .enter()
          .append ('circle')
          .attr ('class', 'smallCircle')
           .transition( )
            .duration(1000)
          .attr('r', d => 5)//yearScaleSize(d.date_1))
          .attr ('fill', d => { 
              if (selectedMakers.current[1].makers.map (m => m.id).includes(d.id)) return 'red'
              if (selectedMakers.current[0].makers.map (m => m.id).includes(d.id)) return 'gold'
              return 'gray'
          })
          .attr('opacity', 1.1)

  }



  function drawLinksSmall2 ( ) { 
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
         .attr ('stroke', 'gray') // d => linkColorScale(d))
         .attr('opacity', 0.9)

      // -- using a path instead of a line -- // 
      childLinkLines
          .enter( )
          .append('path') // -- path instead of line.. 
          .attr('class', 'childlines')
          .attr ('stroke', 'gray')// d => linkColorScale(d))
          .style("stroke-width", "1px")
          .style('fill', 'none')
          .attr('opacity', 0.9)


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
      }
    }
  }

  // ------------------- // 
  // -- tween line groups (and all lines inside the group)
  function linkGroupTween (d) { 
      //console.log ("link group ...")
      // -- get ALL the lines (nodes) inside this group -- // 
      let childLines = d3.select(this).node( ).childNodes; 

      // -- each group represent a link between two nodes. 
      // -- each group may have several lines which 
      // get curve -- 
      //console.log ('..line tweening...' )
      //if (d.curve != null) console.log ('curve = ', d.curve)
      //console.log ('this group - parent , ', d3.select(this).node( ).parentNode); 
      //console.log ('selected group ', selectedGroup.current);

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
                  if (i==0) return line.setAttribute("d", curve2([[x1, y1], [x2, y2]]))

                  // -- other lines need a curve amt -- 
                  let curvePath = createCurvePath (x1, y1, x1, y2, i,  0.01 )

                  line.setAttribute("d", curvePath)
              })
        }
  }

  function linkTweenNew (d){ 
    console.log ("this is a tween... ")
  }


  // ------------------- // 

  function forceLayout ( ) { 
      // -- create simulation
      simulation_childRef.current = data.map(createChildSimulation);

      // --update nodes -- ? - this helps to re-calculate positions..  
      simulationRef.current.nodes(data); 
      simulation_childRef.current.forEach ((sim, i) => sim.nodes (data[i].nodes));

      // -- restart  -- if using forces -- 
      simulationRef.current.restart( ).alpha(0.2); // setting alpha(1) restarts the calculation and cause a pause...
      //simulation_childRef.current.forEach (sim => sim.restart ( ).alpha(0.2));
      simulation_parentRef.current.restart( ).alpha(0.2)
      

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
          let xspacing = 15;
          groupLrg
            .transition( )
            .duration(3000)
            .tween ('groupmove', groupTween) 
            .attr('transform', ((d, i) => {
                 // -- sort nodes into date order & get the earliest node -- 
                  if (d.nodes.length > 0) {
                      //d.nodes = d.nodes.sort((a, b) => a.date_1 - b.date_1); // -- not needed if sorted elsewhere -- // --
                      // -- set the baseY for the group -- 
                      d.baseY = dateScaleRef.current(d.nodes[0].date_1); // -- earliest year -- // 
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
              .tween ('linemove', linkGroupTween);// **


  }


  function gridLayout ( ) { 
      
        // start child forces - 
        //simulation_childRef.current.forEach (d => d.on('tick', tick_smallGroups)); 
        simulation_parentRef.current.restart( ).alpha(0.2)
        simulation_parentRef.current.on ('tick', tick_small)



        //tick_smallGroups( )
        //simulation_childRef.current.forEach (sim => sim.stop( ))
        //simulation_childRef.current[0].on("tick", (tick_smallGroups))

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

              //console.log ('left ', left, '    top: ', top)
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
    let spacing = 50; //d.nodes.length*10;
    let itemwidth =  50; //  d.nodes.length*14
    //console.log ('d = ', d)

    const column = i % colNum;
    const row = Math.floor(i / colNum);

    const left = column * (itemwidth + spacing);
    const top = row * (itemwidth + spacing);

    return [left, top]

  }


  // -- SCALE -- // 
  function scaleItem(event, d) {
     //console.log(this);
    dateLayout( );

    const childGroups = select(this).selectAll(".child"); // child nodes (within a group element)
    const linkGroup = select(this).selectAll(".childlinkGrp"); // grouped links

    // -- legacy (old)
    const childLinks  = select(this).selectAll("line")


    // --  SCALE the ENTIRE clicked group  -- 
    select(this)
        .transition( )
        .duration(2000)
        .tween ('groupmove', groupTween) 
        .attr('transform', 'translate(700, -100) scale(2.5)');


    // -- for each line get the makers attached. 
    // childLinks.each (l => { 
    //    console.log ("this link ", l); 
    // })


  // --- START THE GROUPING elements - sort and apply xsort --- // 
    // a group is items which are close to one another in terms of date.. 
    const groupedElements = [];
    let tempArray = [];
    let threshold = 15; // date tolerance

    // sort into groups by date 
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
        item.sortedX = i * 50; // give each a sortedX value
      })
    })

  // -- SET XY of items -- // 
    childGroups.transition( )
          .duration(3000)
          .tween ('groupmove', groupTween) 
          .attr("transform", function (d, i)   { 
                  let tx = d.sortedX; //i*40 + d.sortedX; 
                  let ty = d.gy 
                  let scale = 1.2 
                  return `translate(${tx},${ty}) scale(${scale})`;

                }); // move and scale the group (with the circle in it ...)
     // ------ // 
     // childLinks
     //      .transition( )
     //      .duration(3000)
     //      .tween ('linemove', lineTween) // update the line pos to match the groupx and y 

      // linkGroup
      //     .transition( )
      //     .duration(3000)
      //     .tween ('linemove', linkGroupTween) 




    // -- UPDATE COLOUR -- // 
        // // -- Fade OUT ALL items 
        // groupSmall.selectAll ('circle').attr('opacity', '0.4')
        // groupLrg.selectAll ('line').attr('opacity', function (d) {  
        //   //console.log ("line data = ", this)
        //   return '.4'})


        // // -- Fade IN selected item 
        // // -- change COLOUR of other circles in the  group
        // childGroups.selectAll("circle")
        //   .attr("fill", function(d) {
        //     console.log ("line data2 = ", this)
        //     return ('orangered')
        //     //return d3.select(this) === scaleItem ? 'red' : "gray";
        //   })
        //   .attr('opacity', 0.5)

        // childLinks
        //       .attr('opacity', function (d) {  
        //         //console.log ("line data = ", this)
        //         return 0.9})
        //       .attr('stroke', 'orangered')

        // -- add childLinks groups -- // 


  }



  // -- movement and scale .. move the entire group... 
  function scaleAndMoveGroup (group) { 
      console.log ("item is clicked: scale and move the group... ")

      console.log (d3.select (group))
      console.log (group.getAttribute('gx'))

      //selectedGroup = this;

      let gx = group.getAttribute('gx');
      let gy = group.getAttribute('gy');
      let scale = 1; 
      // -- centre : 1000 x 500 (half width and half height) --
      let cx = 1000/scale; 
      let cy = 500/scale;
      // -- target position -- 
      let tx = (cx - gx)*scale; //* (1 - scale); 
      let ty = (cy - gy)*scale; // * (1 - scale);

      // --- // 
      d3.select(chartRef.current)
      .transition()
      .duration(2000)
      .attr ('transform', `translate(${tx}, ${ty}), scale(${scale})`); 

      // childLinkGroup
      //       .transition( )
      //       .duration(100)
      //       .tween ('linemove', linkGroupTween) ;// **

      // translate and transform this -- // 

      // -- save the element that has been selected.. 

      // also scale up the selected element
      // select(this)
      //   .transition( )
      //   .duration(500)
      //   .tween ('groupmove', groupTween) 
      //   .attr('transform', `scale(${1})`);

  }

  // -- fade out all elements -- (non selected )-- (also de-scale ?? )

  function fadeGroups(selected) { 

      groupLrg.each(function (group) { 
          // -- items NOT selected -- // 
        if (this !== selected) {
             // 
             // FADE NON_SELECTED inner elements 
            let largecircle=  select(this).selectAll('.largeCircle');
            let smallcircles = select(this).selectAll('.smallCircle');
            let paths = select(this).selectAll('.childlines');
            // -- alter opacity and fade -- // 
            largecircle.attr('opacity', 0.1)//.attr('fill', 'pink').
            smallcircles.attr('opacity', 0.1)//.attr('fill', 'red')
            paths.attr('opacity', 0.1)//.attr('stroke', 'cream')



        } else { 
          // -- ITEMS that ARE selected -- // 
          let largecircle=  select(this).selectAll('.largeCircle');
          let smallcircles = select(this).selectAll('.smallCircle');
          let paths = select(this).selectAll('.childlines');


          largecircle.attr('fill', 'gray').attr('opacity', 0.1)
          smallcircles.attr('r', d => 5)//yearScaleSize(d.date_1))
                      //.attr ('fill', 'red')
                      .attr('opacity', 1.1)

          paths.attr('class', 'childlines')
                  .attr ('stroke', 'gray') // d => linkColorScale(d))
                  .style("stroke-width", "1px")
                  .style('fill', 'none')
                  .attr('opacity', 0.9)

            /// -- move tihs ?/ 
            select(this)
                .transition( )
                 .duration(2000)
                //.tween ('groupmove', groupTween) 
                .attr('transform', d => { 
                  return `translate(${d.gx}, ${d.gy}) scale(1.5)`
                })
               // .attr('transform', 'translate(700, -100) scale(2.5)');


        }


      })

  }


  // -- CLICKS interactions -- // 

  // -- do something with the clicked group -- //

  function handleClickedGroup ( ) { 
      selectedGroup.current= this; 

      // -- OTHER THINGS -- // 
     scaleAndMoveGroup(selectedGroup.current); // move all based on group click -- // 
     fadeGroups (selectedGroup.current)
     event.stopPropagation(); // prevent window click --


      // -- do something with selection -- // 
      // -- get all the circles (each inside child group)
      const childGroups = select(this).selectAll(".child"); // child nodes (within a group element) -circle + text 
      const childLinkGroups = select(this).selectAll(".childlinkGrp");
      //const childText = select(this).selectAll('.label')

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
      //  console.log ("child group label = ", select(this).node( ).firstChild); 
        //select(this).node( ).firstChild.text('new label')

        d3.select(this).select('text').style('visibility', 'visible');


      })

      // -- SPREAD -- // 

      // -- SET XY of groups (and circle inside) -- //      
      childGroups.transition( )
        .duration(1000)
        .tween ('groupmove', groupTween) 
        .attr ('p', function (d) {
          console.log ('this = ', select(this).node( ))
          return 100
        })
        .attr("transform", function (d, i)   { 
                let tx = d.sortedX; //i*40 + d.sortedX; 
                let ty = d.gy 
                let scale = 1.2 
                return `translate(${tx},${ty}) scale(${scale})`;
          }); // move and scale the group (with the circle in it ...)


      // -- RE-CALCULATE LINES -- // 
        childLinkGroups
            .transition( )
            .duration(1000)
            .tween("position", function() {

                    let lines = d3.select(this).node( ).childNodes; 
                    console.log (lines, '')

                    return function(t) {

                     //console.log ('tweeeeen') // get the source and target transform position.. 
                      // get the movement of the source and target items 
                     let linegrp = select(this); 
                     let source = linegrp.datum().source; 
                     let target = linegrp.datum().target;
                    // console.log (source.gx, ' : ', source.gy, " ... ", target.gx, ', ', target.gy);
                    let x1 = source.gx; 
                    let y1 = source.gy 
                    let x2 = target.gx; 
                    let y2 = target.gy; 


                    this.setAttribute('gx1', x1)
                    this.setAttribute('gy1', y1)
                    this.setAttribute('gx2', x2)
                    this.setAttribute('gy2', y2)

                    // get the lines inside the group.. which will have the same start and end point.. 

                    lines.forEach ( function (line, i) {   
                              line.setAttribute ('x1', x1)
                              line.setAttribute ('y1', y1)
                              line.setAttribute ('x2', x2)
                              line.setAttribute ('y2', y2)

                              if (i==0) return line.setAttribute("d", curve2([[x1, y1], [x2, y2]]))

                            // -- other lines need a curve amt -- 
                           let curvePath = createCurvePath (0, 0, x2, y2, i,  0.1 )
                          line.setAttribute("d", curvePath)
                     })
              };
        
        })

      // -- now update the links inside // -- 
        //console.log(childLinkGroup.size()); // Check the number of selected elements
        //console.log(childLinkGroup.nodes()); // Log the array of selected DOM nodes
        //console.log (childLinkGroup.transition( ))

       // childLinkGroup
       //       .transition( )
       //       .duration(10000)
       //      .tween ('linemove', linkTweenNew) ;// **



  }





  function handleClickedGroup3() {
    console.log ('hello world')

     var clickedGroup = d3.select(this);

    // Select all nested childlinkGrp elements within the clicked group
    var childlinkGrps = clickedGroup.selectAll(".childlinkGrp");

    // Iterate over each childlinkGrp element
    childlinkGrps.each(function() {
    var childlinkGrp = d3.select(this);

    // Select all paths within the current childlinkGrp element
    var paths = childlinkGrp.selectAll("path.childlines");

    paths
      .style('stroke-width', 10)
      .transition( )
      .duration(1000)
      .attr('fill', 'red')


    // Log each path element to the console
    paths.each(function() {
          var pathElement = d3.select(this);
          console.log(pathElement.node()); // Logs the path element in the DOM


      
        });
    });


  }


  function handleClickedGroup2 ( ) { 
      selectedGroup.current= this; 
    //  //selectedGroup.current.curve = 0.5; 

    //  // -- 1. get all the paths inside the group

    // //const childGroups = select(this).selectAll(".child"); // child nodes (within a group element)
    // const linkGroups = select(this).selectAll(".childlinkGrp"); // grouped links
    // const lineGroups = linkGroups.selectAll('.childlines')
    
    // const paths = lineGroups.selectAll('path')

    // lineGroups.each (function (line, i){ 
    //   console.log ('line ', d3.select (line).selectAll('path') )
    // })

  var clickedGroup = d3.select(this);
   // Select all nested childlinkGrp elements within the clicked group
  var childlinkGrps = clickedGroup.selectAll(".childlinkGrp");
  
  // Iterate over each childlinkGrp element
  childlinkGrps.each(function(g ) {
    var childlinkGrp = d3.select(g);
    //console.log ('clg ', childlinkGrp)
    
    // // Select all paths within the current childlinkGrp element
    var paths = childlinkGrp.selectAll("path.childlines");
    console.log ('paths', paths)
    
    // // Code to alter the attributes of each path
    // paths.attr("fill", "green"); // Example alteration, change as needed
  });



    // for each group : get the inner lines.. 
    // linkGroups.each (function (group, i) { 
    //       console.log ('group : ', select (group));
    //       let lines = select (this).selectAll ('.childlines')
    //       console.log ('lines = ', lines)


    // }) 


    // console.log ('line groups', lineGroups)
    //     console.log ('paths ', paths)

    console.log ('---------------')



     // -- GET THE INNER LINES and ALTER the CURVE -- // 

    //  // get all the inner links inside the selected group and update curve.. 
    // let childGroups = d3.select(selectedGroup.current).node( ).childNodes; 

    // console.log ('selected group ', selectedGroup.current)
    // console.log ('inner line groups ', childGroups)

    // // let childLines = d3.select(this).selectAll('.childLinkGroup');//.selectAll('.childlines')

    // // childLines.forEach (function (line, i){ 
    // //     console.log ('line = ', line )
    // // })

    // // re-draw the curves on childlines.. 

    // childGroups.forEach ( function (group, i) {   
    //       console.log ('group =', group)

    //       // // -- the first line is straight -- 
    //       // if (i==0) return line.setAttribute("d", curve2([[x1, y1], [x2, y2]]))

    //       // // -- other lines need a curve amt -- 
    //       // let curvePath = createCurvePath (x1, x2, y1, y2, i,  0.5 )

    //       // line.setAttribute("d", curvePath)
    //   })


    // -- OTHER THINGS -- // 
    //scaleAndMoveGroup(selectedGroup.current); // move all based on group click -- // 
     // fadeGroups (selectedGroup.current)
     event.stopPropagation(); // prevent window click -- 
  }

  // ---------------------------- // 
  
  function handleClickedWindow(event) {
    console.log ("window is clicked ")

    //console.log (selectedGroup)
   // if (selectedGroup != null) selectedGroup.curve = 0; 


    // return all elements to original position -- 

    if (!chartRef.current.contains(event.target)) {
      d3.select(chartRef.current)
        .transition()
        .duration(2000)
        .attr('transform', 'translate(0, 0), scale(1)');
    }
    // restore the colour values of all objects.. 

  }


  // ------------------- // 

  const handleClick = (event, d) => {
        // Handle click event here
        console.log('Clicked on bar:', event); // how do I send this data back to the main app ? 
        onDataClick(d);
        // Perform any desired action or state update
    };




function createCurvePath (x1, y1, x2, y2, i, curveAmt) { 

    let v0 = new Vec2D (x1, y1);
    let v1 = new Vec2D (x2, y2);

    let diffVector = v1.subtract (v0);
    let dist = diffVector.magnitude( );

    let midPoint = v0.add (diffVector.multiply (new Vec2D (0.5, 0.5)));

    let norm = diffVector.clone( ).normalize( ) 
    let ang = diffVector.angleDeg( )

     // -- add perp points.. (90 degrees from midpoint) -- // 
    let pLength = dist * (i * curveAmt); // dist * 0.2; // (dist * i* 0.5) +1; // (i*.2); 
    let pDirection = i%2 == 0 ? 90 : -90

    let perp= norm.clone( ).rotateDeg(pDirection).multiply (new Vec2D(pLength, pLength)).add (midPoint);

    // -- calculate control points -- // 
    let cpX = perp.x; 
    let cpY = perp.y;

    let curve = curve2([[x1, y1], [cpX, cpY], [x2, y2]])

    return curve;



}


  // -- RETURN -- // 
  return (
    // <g ref={chartRef} transform={`translate(${translateRef.current[0]}, ${translateRef.current[1]}) scale(${scaleRef.current})`}>
    //   {console.log("Logging something...", scaleRef.current)}
    // </g>

    <g ref={chartRef} transform="translate(0, 100) scale(1)"></g>

  );


};


export default ForceDirectComponent;




















