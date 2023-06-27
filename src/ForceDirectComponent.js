import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { select } from 'd3-selection';
import Button from '@mui/material/Button';


const ForceDirectComponent = ({ data, layout, selectedItem, onDataClick,  onItemClick }) => {
  const chartRef = useRef(null);
  let simulationRef = useRef(null); // Ref for storing the simulation instance
  let simulation_childRef = useRef ([ ]);

  const dateScaleRef = useRef(null);


  let groupLrg;
  let groupSmall;

  let largeCircle; 
  let smallCircle;

  let childLink;

  let svg
  // -- updated when data is updated // 
  // -- init - create forces  -- //
  useEffect(() => { 
    // -- create: group simulation -- // 
    simulationRef.current = d3
      .forceSimulation(data)
      .force('center', d3.forceCenter(0, 0).strength(1))
      .force('charge', d3.forceManyBody().strength(1))
      .force('collide', d3.forceCollide(d => d.nodes.length * 15+ 2));

    // -- create child simulation -- //
    simulation_childRef.current = data.map(createChildSimulation);

    // -- start tick -- // 
    simulationRef.current.on('tick', tick);
    //simulation_childRef.current.forEach (d => d.on('tick', tick));

    // -- set date ref scale -- //
    dateScaleRef.current = d3.scaleLinear()
                            .domain([1600, 1900])
                            .range([10, 400]);

  }, [ ])

  // -- forces between children -- // 
 function createChildSimulation(d) {
        const simulation = d3.forceSimulation(d.nodes)
            .force("center", d3.forceCenter(0, 0).strength(1)) // Adjust center as needed
            .force("collide", d3.forceCollide(10)) // Adjust radius as needed
            //.force("charge", d3.forceManyBody().strength(-10)) // Adjust strength as needed
            .force("link", d3.forceLink(d.links).id(d => d.id).distance(90)); // link FORCCE.. 
        return simulation;
  }



// -- on data AND layout update -- 
useEffect (() => { 
    //console.log ('incoming data  =', data)
    svg = d3.select(chartRef.current)

    groupLrg = svg.selectAll('.grpLarge').data(data);
    groupSmall = groupLrg.selectAll('.child').data(d => d.nodes)
    childLink = groupLrg.selectAll('.childlink').data(d => d.links);
  
    if (layout == 'force') {
        // -- create simulation
        simulation_childRef.current = data.map(createChildSimulation);

        // --update nodes -- ? - this helps to re-calculate positions..  
        simulationRef.current.nodes(data); 
        simulation_childRef.current.forEach ((sim, i) => sim.nodes (data[i].nodes));

        // -- restart  -- if using forces -- 
        simulationRef.current.restart( ).alpha(0.2); // setting alpha(1) restarts the calculation and cause a pause...
        simulation_childRef.current.forEach (sim => sim.restart ( ).alpha(0.2));

        // -- re draw  // 
        simulationRef.current.on('tick', tick);
        //simulation_childRef.current.forEach (d => d.on('tick', tick)); 

        // ------ //
    }

    if (layout == 'date') { 
        // ------- // 
        simulationRef.current.stop( )
        simulation_childRef.current.forEach (sim => sim.stop( ))

        // move items -- 
        groupLrg
          .transition( )
          .duration(3000)
          .tween ('groupmove', groupTween) 
          .attr('transform', ((d, i) => {
               // -- sort nodes into date order & get the earliest node -- 
                let ypos = 0;
                if (d.nodes.length > 0) {
                    d.nodes = d.nodes.sort((a, b) => a.date_1 - b.date_1); 
                    console.log ('early date = ', d.nodes[0].date_1)
                    // this is the base line
                    ypos = 100 ; //dateScaleRef.current(1732); // d.nodes[0].date_1); // -- earliest year -- // 
                }
               return 'translate('+(i*50+10)+','+ypos+')'
          })) // set the destination values.. 

        groupSmall
          .transition( )
          .duration(3000)
          .tween ('groupmove', groupTween) // update gx gy
          .attr('transform', ((d, i) => {
              // -------- // 
              console.log ('node date = ', d.date_1)
              // these are relative to other values --// 
              let ypos = 0; //dateScaleRef.current(1732) ; // d.date_1); // -- year -- // 


               return 'translate('+0+','+ypos+')'
          })) // set the destination values.. 

        childLink
          .transition( )
          .duration(3000)
          .tween ('linemove', lineTween)

      }

    // --draw shapes -- //
    drawGroupsLarge( )
    drawGroupsSmall( )

    //-- interaction -- //
    //groupSmall.on('click', handleClick);// 
   // groupLrg.on('click', scale2);// 

    groupLrg.on('click', function() {
          onItemClick(this);  
    });

  }, [data, layout])



  /// -- update / move selected items 
  useEffect(()=> { 
    // svg = d3.select(chartRef.current)
    // groupLrg = svg.selectAll('.grpLarge').data(data);
    // groupSmall = groupLrg.selectAll('.child').data(d => d.nodes)

    // groupSmall.transition( )
    //   .duration(2000)
    //   .tween ('groupmove', groupTween) 
    //   .attr("transform", 'scale(1.0)');

    // update selected item.. 
      select(selectedItem).transition( )
        .duration(2000)
        .tween ('groupmove', groupTween) 
        .attr("transform", 'scale(2.2)');

   },  [selectedItem])



// --- // 
function tick ( ) { 
      //console.log ('tick update')
      // ** for some reason removing this lets node collision forces to be re-calcutated.. 
      //simulationRef.current.nodes(data); // ***

     // -- update groups (large groups)
      groupLrg
          .transition( )
          .duration(100)
          .tween ('groupmove', groupTween) 
          .attr("transform", d => `translate(${d.x}, ${d.y})`);


      // -- update child positions -- // 
      //simulation_childRef.current.forEach (sim => sim.stop( ))
      simulation_childRef.current[1].on("tick", () => {
        groupSmall
          .transition( )
          .duration(100)
          .tween ('groupmove', groupTween) // update the gx and gy values -- 
          .attr("transform", d => `translate(${d.x}, ${d.y})`);
      
      childLink
            .transition( )
            .duration(100)
            .tween ('linemove', lineTween)
      });
  }


// ---- // 



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
  largeCircle = groupLrg.selectAll('circle')
      .data(d => [d]); // bind each circle to the data of each group.

  // -- Update existing groups 
  largeCircle
      .transition( )
      .duration(2000)
      .attr('r', d => d.nodes.length * 5)
      .attr ('fill', 'gray')
      .attr('opacity', 0.9)
      //.attr ('dosomething', d => console.log ("update "))

  // -- Enter new groups -- how the first enter -- 
  largeCircle
      .enter()
      .append ('circle')
      .attr('r', d => d.nodes.length * 5)
      .attr ('fill', 'gray')
      .attr('opacity', 0.8)
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



function drawGroupsSmall ( ) { 

  groupSmall = groupLrg.selectAll('.child')
    .data(d=>{ 
        //console.log ('d nodes ', d)
        return d.nodes})
    .join('g')
    .attr('class', 'child')
    .attr('gx', d => d.gx)
    .attr('gy', d => d.gy)
    .attr ('x', 100)
    .attr ('y', 100)
    .attr('transform', d => `translate(${d.gx},${d.gy})`);

  groupSmall
    .append('circle')
    .attr('r', 10)
    .attr('fill', 'blue')
    .attr('name', 'maker')


  // --  add child link lines
  childLink = groupLrg.selectAll('.childlink')
      .data(d=>{ 
        console.log ("draw child link")
        return d.links})

      .join ('line')
      .attr('class', 'childlink')
      .attr ('stroke', 'red')
      .style("stroke-width", "2px")
      .attr('name', d => { 
          // console.log ('link data ', d.source.gx)
          return "name"
      })
}


function drawGroupsSmallV2( ) { 

  groupSmall = groupLrg.selectAll('.child')
       .data(d => d.nodes);

  groupSmall
    .attr('gx', d => (d.gx = 0))
    .attr('gy', d => (d.gy = 0))
    .attr('transform', d => `translate(${d.gx},${d.gy})`);

   // groupSmall = groupLrg.selectAll('.child')
   //   .data(d=>d.nodes)
   groupSmall.enter( )
    .append('g')
    .attr('class', 'child')
    .attr('gx', d => (d.gx = 0))
    .attr('gy', d => (d.gy = 0))
    .attr('transform', d => `translate(${d.gx},${d.gy})`)
    .attr('r', 10)
    .attr('fill', 'blue');

  groupSmall.exit().remove();

}


// ------------------- // 

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

function lineTween (d) { 
    return function (t) { 
      // console.log ('is tweening...')
      // if using ID find the source items 
      this.setAttribute ('x1', d.source.gx)
      this.setAttribute ('y1', d.source.gy)
      this.setAttribute ('x2', d.target.gx)
      this.setAttribute ('y2', d.target.gy)
    }
}

// ------------------- // 

  const handleClick = (event, d) => {
      // Handle click event here
      console.log('Clicked on bar:', event); // how do I send this data back to the main app ? 
      onDataClick(d);
      // Perform any desired action or state update
  };

// ------------------- // 

function scale2(event, d) {
  //console.log(this);
  //select(this).attr('transform', 'translate(300,300)');
   select(this).transition( )
        .duration(2000)
        .tween ('groupmove', groupTween) 
        .attr("transform", 'scale(2.2)');
}



// ------------------- // 

  // -- return the svg element -- // 
  return (
    <g ref={chartRef} transform="translate(500, 50)"></g>
  );


};


export default ForceDirectComponent;











