console.log ('this is module 5: cluster and time sequence  ')
import *  as d3 from 'd3';
import * as  Vec2D from 'victor';
import netClustering from "netclustering";

import * as utility from './module_1.js';

import * as d3Class from './layout.js'
import * as sankeyClass from './clustersSankey.js'

import * as gui from './index.js';


let svg = d3.select ('svg')
let w =  svg.attr ('width');
let h = svg.attr ('height')

let nodeAlpha = 1; 
let makerCount = 3220 ; // 1220;

// -- tool tip -- // 
export let tooltip = document.getElementById("tooltip");
tooltip.style.top  = "-100px";
tooltip.style.left = "-100px";
// tooltip.innerHTML  = "...";

//console.log ('this is new ')

//

// -- GET ORIGINAL data --//
  import makers from './assets/allmakers_dates.json'; 
  let allmakers = makers.makers;
  let someMakers = allmakers.slice (0, makerCount);

// 1. update link types..  links types 
  let linkTypes = ['apprenticed_to', 'associated_with', 'see_also', 'employed_by', 'succeeded_by', 'took_over_from', 'had_apprentice', 'parent_of']

  export let base_nodes = [ ]; 
  export let social_links = [ ];


//-- POPULATE base_nodes and social links -- // 
  someMakers.forEach (m => { 

    // -- POPULATE NODES -- // 
    // -- only add makers which have any of the relational links -- 
    let hasRelations = Object.keys (m).some( item => linkTypes.includes(item))

    //hasRelations = true; // -- override
    if (hasRelations) {
      let makernode = m; // { id:m.id, name:m.name};

      // -- convert date 1 and date 2 to useable values 
      m.date_1 =  parseFloat (m.date_1.slice(0, 4)); 
      m.date_2 =  parseFloat (m.date_2.slice(0, 4)); 

      // -- remove spaces, commas and apostrophes from names & replace with underscore _ -- 
      makernode.towns.forEach ((d, i) =>  makernode.towns[i]= d.replace(/[' ,]/g, '_'));
      makernode.known_instruments.forEach ((d, i) =>  makernode.known_instruments[i]= d.replace(/[' ,]/g, '_'));
      makernode.guilds.forEach ((d, i) =>  makernode.guilds[i]= d.replace(/[' ,]/g, '_'));
      makernode.advertised_instruments.forEach ((d, i) =>  makernode.advertised_instruments[i]= d.replace(/[' ,]/g, '_'));//replace(/\s/g, '_'));


      // console.log ("maker ", makernode)
      // makernode.guilds.forEach (d => console.log ('guilds ', d))
      // makernode.advertised_instruments.forEach (d => console.log ('ad i ', d))

      //------------------------------------------------------// 

      // -- add values for dx dy (x y locs to follow the force location)
      // -- locx locy are the 'shadow locs'
      makernode.locx = 0; 
      makernode.locy = 0; 
      // add other values 
      makernode.alpha =  nodeAlpha; // starting alpha value.. 

      let duplicate = base_nodes.filter (n => n.id == m.id)
      // -- if (duplicate.length > 0) console.log ('duplicate found = ', duplicate)
      // -- see if it already exists - if so
      if (duplicate.length == 0) base_nodes.push (makernode); 
      if (duplicate.length > 0) nodes_duplicated.push (makernode);
    }

    // -- links

    // -- POPULATE LINKS -- // 
    linkTypes.forEach ( linkType => { 

         // only include nodes which have a link type 
        if (m [linkType] != undefined ) {
          //console.log (m.apprenticed_to);


          m [linkType] [0].forEach (target_id => { 
            // -- Ignore links to self -- // 
            if (m.id != target_id) {
            
              // look for any exisiting links (match in reverse) -- or duplicates -- // 
              let foundInverse =  social_links.filter (link => link.source == target_id && link.target == m.id  && link.type == linkType);
              let foundMatch =  social_links.filter (link => link.source == m.id && link.target == target_id  && link.type == linkType);

              // -- if none found - add a new link
              if (foundInverse.length == 0 && foundMatch.length == 0) {
                let newLink = { source:m.id, target: target_id, count:1, type:linkType};
                social_links.push (newLink);
              } 

              // -- if found a match -- add to 
              if (foundInverse.length > 0)  foundInverse[0].count +=1;
              if (foundMatch.length > 0)    foundMatch[0].count +=1;

            }
          })

        }

      })

  })

//--  sort by ID and COPY
  base_nodes.sort((a, b) => {return a.id - b.id; });

 let base_nodes_copy = [...base_nodes];

 console.log ('base nodes ', base_nodes_copy)

 // -- REMOVE links that don't have BOTH source and target ID in ID list -- // 
  let ID_list = base_nodes_copy.map (m => (m.id )); // - array of IDs
  social_links = social_links.filter (l => ID_list.indexOf (l.source)!= -1 && ID_list.indexOf(l.target) != -1)


// -- SORT INTO SOCIAL CLUSTERS (SOCIAL)- - // 
//let social_Clusters = getClusters_social(base_nodes_copy);
 let social_Clusters = utility.getClusters_social(base_nodes_copy, base_nodes, social_links);
console.log ('social clusters ', social_Clusters  )


// -- get ALL the guild types.. 
 //console.log ('some makers = ', someMakers)
 console.log ('base makers = ', base_nodes_copy)

// -- GET LISTS of the ATTRIBUTE NAME (in some makers) -- // 
  const guilds = someMakers.map(maker => maker.guilds).flat(); // flattens the array of arrays into a single array
  const adv_instruments = someMakers.map (maker => maker.advertised_instruments).flat( ); 
  const known_instruments = someMakers.map (maker => maker.known_instruments).flat( ); 
  const towns = someMakers.map (maker => maker.towns).flat( ); 
  // -- don't know if these are needed now -- // 
  const guildNames = [...new Set(guilds)]; // creates a new Set to remove duplicate names, and then converts back to an array
  const advInstruments = [...new Set (adv_instruments)];
  const knownInstruments = [...new Set (known_instruments)];
  const townNames = [...new Set (towns)];

   // console.log("guild names ", guildNames); // 
   // console.log("advertised instruments = ", advInstruments);// 
   // console.log("known instruments = ", knownInstruments);// 
   // console.log("towns = ", townNames);// 
 //  console.log("social clusters = ", social_Clusters);
  console.log ('social links = ', social_links);


// --  SORT by Attributes (guild, adverstised instr, known intst, town)
  //-- TEMP REMOVE -- 
  let guild_Clusters = utility.sort_by_guild(base_nodes_copy);
  let advInst_Clusters = utility.sort_by_advertisedInstrument(base_nodes_copy);
  let knownInst_Clusters = utility.sort_by_knownInstrument (base_nodes_copy);
  let town_Clusters = utility.sort_by_town (base_nodes_copy);

  // -- clone -- // 


  // console.log ('guild_Clusters ', guild_Clusters)
  // console.log ('advInst_Clusters ', advInst_Clusters)
  // console.log ('knownInst_Clusters ', knownInst_Clusters)
  // console.log ('town_Clusters ', town_Clusters)
  // console.log ('base nodes ', base_nodes);
  // console.log ('social_links ', social_links);
  // console.log ('social_links (filtered) ', social_links);
  // console.log ('social cluster ', social_Clusters)


//let layouts = [ ]

// -- CLUSTER layouts -- // 
let socialGroup = svg.append ('g').attr ('id', 'socialGroup'); // the element to add clusters
socialGroup.attr("transform", "translate(0, 0) scale (0.6, 0.6)")


// 1300 / 500
let social_view= new d3Class.Layout  (socialGroup, base_nodes_copy,  social_Clusters, {x: 1300, y: 500}, 'red');  




// -- SANKEY layouts -- //
let sankeyGroup =  svg.append ('g').attr ('id', 'sankeyGroup'); // the element to add clusters
sankeyGroup.attr ('width', '400px')
sankeyGroup.attr("transform", "translate(0, 630) scale (0.7, 0.7)");


// -- test transitions -- // 
// socialGroup.transition()
//   .duration(4000) // Set the duration of the animation in milliseconds
//   .attr("transform", "translate(500, 500) scale (0.3, 0.3)");

// sankeyGroup.transition()
//   .duration(1000) // Set the duration of the animation in milliseconds
//   .attr("transform", "translate(0, 630) scale (0.7, 0.7)");


// -- animate lines -- // 
// var linktest = [
//   { source: { x: 50, y: 50 }, target: { x: 200, y: 200 } },
//   { source: { x: 100, y: 100 }, target: { x: 500, y: 300 } }
// ];

// let links = svg.selectAll(".link")
//   .data(linktest)
//   .enter()
//   .append("line")
//   .attr("class", "link")
//   .attr("x1", function(d) { return d.source.x; })
//   .attr("y1", function(d) { return d.source.y; })
//   .attr("x2", function(d) { return d.source.x; })
//   .attr("y2", function(d) { return d.source.y; })
//   .attr("stroke", "steelblue") // Set the line color
//   .attr("stroke-width", 2);   // Set the line width


// links.transition()
//   .duration(3000) // Animation duration in milliseconds
//   .attr("x2", function(d) { return d.target.x; })
//   .attr("y2", function(d) { return d.target.y; });



let town_row =  new sankeyClass.BlockClass ('towns', sankeyGroup, town_Clusters, { x: 0, y: 0}, 0);
let guild_row = new sankeyClass.BlockClass ('guilds', sankeyGroup, guild_Clusters, { x:0, y: 20}, 1);
let knowninst_row = new sankeyClass.BlockClass ('known instru', sankeyGroup, knownInst_Clusters, { x:0, y: 40}, 2);
let adinst_row = new sankeyClass.BlockClass ('ad inst. ', sankeyGroup, advInst_Clusters, { x:0, y: 60}, 3);


let rows = [ ]; 
rows[0] = town_row;
rows[1] = guild_row;
rows[2] = knowninst_row;
rows[3] = adinst_row;

let activeRow = 0; 

// -------------------------- //


let nodeLinks = [ ];




//-- seevalues( );
function seevalues ( ){ 
  let interval; 

  function trackdata ( ){ 
    //console.log ('do something ')
    // get DATA values -- // 
    let layout = layouts[1];
    let cluster = layout.clusterdata[1];
    let name = cluster.name; 
    let type = cluster.type;
    let loc =  {x: cluster.x, y: cluster.y } ; 
    //console.log ("cluster ",  name, ' : ', type, ' : ', loc );


    let nodes = cluster.nodes; // node data linked to cluster data
    let n0 = cluster.nodes[0]
    //et nLoc = { x: n0.x, y:n0.y}
    console.log ("node0 : loc " , n0.x, ":", n0.y, " : ", n0.parent_x, " : ", n0.parent_y)
  }

  //interval = setInterval (trackdata, 5000)

}


// -- GUI FUNCTIONS -- // 
// -- DATE SLIDER -- 
  export function showSliderDate ( ) {

      rows[0].filterAndReDraw(gui.slider_date)
      rows[1].filterAndReDraw(gui.slider_date)
      rows[2].filterAndReDraw(gui.slider_date)
      rows[3].filterAndReDraw(gui.slider_date)

      social_view.filterLayout_date(gui.slider_date)
      social_view.updateLayout( )


      // -- get nodes that are visible and selected... 
      listMakers( )

  }

  export function updateDatePositions ( ) { 
    social_view.updateLayout( ); 
    social_view.dateScale = setDateScale (1600, 1990, 10, gui.range_output);
  }

// -- DATE VIEW // 
  export function moveToTimeLineView ( ) { 
      social_view.type = 'date'
      social_view.updateLayout( );
      //layouts[0].moveClusterLayoutXY( );
  }

// -- FORCE (NETWORK) VIEW //
  export function moveToForceView ( ) { 
      social_view.type = 'force'
      social_view.updateLayout( );
  }



// ----- FUNCTIONS ---- /// 

// ---- DATE SCALE ---- /// 
export function setDateScale (minDate, maxDate, minY, maxY) { 
    let scale = d3.scaleLinear( ).domain ([minDate, maxDate]).range ([minY, maxY]) ; // date scale
    return scale; 
}

// -- GET NODES -- 
export function getNodesfromIDlist (nodelist, idlist) { 
  let nodes = [ ];
  idlist.forEach ( id => { 
     let n = nodelist.find (n => n.id == id)
  })
  return nodes; 
}


// -- TEST QUERY -- // 
function query ( ) { 
  const result = makers.filter((maker) => {
    maker.towns.includes(town) && maker.trades.includes(trade)
  });

}

function filterMakers(makers, town, trade) {
  return makers.filter((maker) => {
    const townMatch =  !town ||  maker.towns.includes(town);
    const tradeMatch = !trade || maker.trades.includes(trade);
    return townMatch && tradeMatch;
  });
}


// ** -- QUERY -- **  ** -- QUERY -- ** ** -- QUERY -- ** // 
//console.log ('guild clisters = ', guild_Clusters);

// -- Query by ATTRIBUTE (e.g. towns) (Cumulative!)
  //layouts[0].queryClustersByAttribute('towns', 'Birmingham' );
 // layouts[0].queryClustersByAttribute('towns', 'London' );
 // layouts[0].queryClustersByAttribute ('towns', 'Manchester')

// -- Query by SELECTION (Cumulative )
  // const selection0 = guild_Clusters.find(g => g.name === '_none').nodes; // all 'none' nodes
  // const selection1 = guild_Clusters.find(g => g.name === 'Blacksmiths').nodes; // all 'Blacksmith' nodes
  // const selection2 = guild_Clusters[8].nodes; // [item 8 in the list - e.g


  //const townSelection = town_Clusters.find (g => g.name === 'London')

//console.log ('selection 0 (guilds = none) ', selection0);
 //social_view.queryClusterBySelection(selection0)
 // layouts[0].queryClusterBySelection(selection2)


// - SOME SELECTIONS -- // 
// -- make some query / selections -- and apply to ALL layouts -- 
// what sort of selection types are there ?? -- and what do each of the layouts need ?? -- // 
// make a selection by getting nodes. 

// -- selection of towns -- // 
// let london_selection = town_Clusters.find (d => d.name === 'London').nodes.flat ( );
// let birm_selection = town_Clusters.find (d => d.name === 'Birmingham').nodes.flat ( );
// //console.log ('london = ', london_selection);
//console.log ('birmingham = ', birm_selection);

// -- selection of guilds -- // 
// let clock_selection = guild_Clusters.find (d => d.name === 'Clockmakers').nodes.flat ( );
// let join_selection = guild_Clusters.find  (d => d.name === 'Joiners').nodes.flat ( );
//console.log ('clockmakers = ', clock_selection);
//console.log ('joiners = ', join_selection);

// test find. 
//console.log ('node = ', base_nodes.find (n=> n.id == 6061))

//  filter (only works with clusters? )
// let sel = clock_selection
// town_row.splitBlockBySelection(sel)
// guild_row.splitBlockBySelection(sel)
// social_view.queryClusterBySelection(sel)

// export let testSelection1 = london_selection
// export let testSelection2 = birm_selection;





// -- ****** -- // 
export let selectedMakers = [ ]; // the makers  to show in the SANKEY -- // 
let selectedMakers_social = [ ];

export let flowMakers = [ ]; 
let flowItems = [ ]; 


let makersToShow = selectedMakers_social;


export function showSelection (selection) { 
    // selection = selection.map (n => n.id)
    town_row.splitBlockBySelection(selection) // cumul - filtering 'selected ndoes -' not filtering all nodes.. 
    guild_row.splitBlockBySelection(selection)
    social_view.queryClusterBySelection(selection)

}

export function addToSelection (selection ) { 
   // -- CREATE OVERALL SELECTION -- // 
  let type = 'notadd'

   if (type == 'add' || selectedMakers.length == 0) { 
        // -- ADDITIVE - ADD TO current selection to selectedMakers -- 
        selectedMakers = [...new Set(selectedMakers.concat(selection))]; 
        selectedMakers.sort((a, b) => a - b);
        //console.log ('ALL  = ', selectedMakers)

    } else {  
        // -- SUBTRACTIVE 
        let shared = selectedMakers.filter (n => selection.includes (n))
        selectedMakers = shared;
    }

    //-------------------------------------------------------- // 

    // -- SHOW SELCTION in VIZ -- // 
    // this should work on the 'next row'


    // -- HIGHLIGHT selected makers in layout -- 
    social_view.clusterlist.forEach (c => { 
        c.selectedNodes = c.nodes.filter ( n => selectedMakers.includes (n.id)); 

        c.selectedLinks = c.links.filter (l => selectedMakers.includes (l.source.id) && selectedMakers.includes (l.target.id) )
        c.drawShapeNodes( )
    })

    // -- block should work on the 'next' row each time -- //

    // rows to view 0 and 1 
    // let activeRow = 0; 
//activeRow = 1; 
    for (let i=0; i<=activeRow+1; i++) { 
        // -- HIGHLIGHT selected makers in blocks -- 
        rows[i].blocks.forEach (b => { 
          let nodesToView = b.nodes.filter (n =>selectedMakers.includes (n) == true)
          let nodesToHide =  b.nodes.filter (n =>selectedMakers.includes (n) == false)
          // show selected -- 
          b.selected_base = nodesToView;
          b.data.nodeGroup.selected = nodesToView

          // show unselected -- 
          b.unselected_base = nodesToHide;
          b.data.nodeGroup.unselected = nodesToHide
          b.drawGroup( )
        })


    }

    activeRow = 1; 

}



// ------------------------------ //

export function addToSelection_Social (selection, toAdd) { 
    clearSelection_Sankey( )
    // --------------- // 
    flowMakers = [ ];

    let type = 'add'
   // -- Update Makers -- // 

    // -- add to makers -- //

   if (toAdd == true) {
     if (type == 'add' || selectedMakers_social.length == 0) { 
          // -- ADDITIVE - ADD TO current selection to selectedMakers -- 
          selectedMakers_social = [...new Set(selectedMakers_social.concat(selection))]; 
          selectedMakers_social.sort((a, b) => a - b);
      } else {  
          // -- SUBTRACTIVE 
          let shared = selectedMakers_social.filter (n => selection.includes (n))
          selectedMakers_social = shared;
      }
    }

    // -- remove selction from makers -- // 
    if (toAdd == false) { 
      selectedMakers_social = selectedMakers_social.filter (n => selection.includes(n)== false)


    }


    // -- HIGHLIGHT selected makers in CLUSTERS -- 
    social_view.clusterlist.forEach (c => { 
        c.selectedNodes = c.nodes.filter ( n => selectedMakers_social.includes (n.id)); 
        c.selectedLinks = c.links.filter ( l => selectedMakers_social.includes (l.source.id) && selectedMakers_social.includes (l.target.id) )
        c.drawShapeNodes( )
    })

    // -- HIGHLIGHT in BLOCKS -- //
    rows.forEach (row => { 
        row.blocks.forEach (b => { 
          //let nodesToView =  b.nodes.filter (n =>selectedMakers_social.includes (n) == true)
          //let nodesToHide =  b.nodes.filter (n =>selectedMakers_social.includes (n) == false)

          // elements to view (base and filter)
          let nodes_view_base = b.nodes_base.filter (n =>selectedMakers_social.includes (n) == true)
          let nodes_view_filter = b.data.nodes.filter (n =>selectedMakers_social.includes (n) == true)

          // elements to hide (base and filter)
          let nodes_hide_base = b.nodes_base.filter (n =>selectedMakers_social.includes (n) == false)
          let nodes_hide_filter = b.data.nodes.filter (n =>selectedMakers_social.includes (n) == false)

          // show selected -- (base and filter)
          b.selected_base = nodes_view_base; //nodesToView;
          b.data.nodeGroup.selected = nodes_view_filter ; //nodesToView

          // show unselected -- (base and filter)
          b.unselected_base = nodes_hide_base; //nodesToHide;
          b.data.nodeGroup.unselected = nodes_hide_filter; //nodesToHide
          b.drawGroup( )
        })
    })

    listMakers ()


}
// ------------------------------ //
export function addToSelection_Sankey (selection, item) { 
  let type = 'add'
  
  if (selectedMakers.length ==0) { 
     clearSelection_Sankey( )
  }

   // -- add block to list of flow items 
   flowItems.push (item); 
   

   // -- update SelectedMakers -- 
   if (type == 'add') {      //|| selectedMakers.length == 0) { 
        // -- ADDITIVE - ADD TO current selection to selectedMakers -- 
        selectedMakers = [...new Set(selectedMakers.concat(selection))];  // remove duplicates
        selectedMakers.sort((a, b) => a - b);
        //console.log ('ALL  = ', selectedMakers)
    } else {  
        // -- SUBTRACTIVE 
        let shared = selectedMakers.filter (n => selection.includes (n))
        selectedMakers = shared;
    }

    // -- update FLOW LIST (common elements in highlighted blocks)
    if (flowMakers.length == 0) { 
      flowMakers = selection; // on first selection - add all makers 
    } else { 
      // -- subsequent selections - filter the flowmakers to find common items 
      flowMakers = flowMakers.filter (n => selection.includes (n))
    }


    //console.log ('flow items ', flowItems)
    //console.log ('flow makers ', flowMakers); 
    //console.log ('selected makers = ', selectedMakers)
    //console.log ('clicked items ', selection)
    //-------------------------------------------------------- // 

    // -- HIGHLIGHT selected makers in layout -- 
    social_view.clusterlist.forEach (c => { 
        c.flowNodes = c.nodes.filter ( n => flowMakers.includes (n.id)); 
        c.selectedNodes = c.nodes.filter ( n => selectedMakers.includes (n.id)); 
        c.selectedLinks = c.links.filter (l => selectedMakers.includes (l.source.id) && selectedMakers.includes (l.target.id) )
        c.drawShapeNodes( )
    })

    // -- block should work on the 'next' row each time -- //
    // -- HIGLIGHT the first row - highlight new items -- // use all selected makers 

    if (activeRow ==0) { 
          rows[0].blocks.forEach (b => { 

            // update base nodes from selection
            let selected_base =    b.nodes_base.filter       (n =>selectedMakers.includes (n) == true)
            let unselected_base =  b.nodes_base.filter    (n =>selectedMakers.includes (n) == false)

            // update (filter) shown nodes (filter)
            let selected_filter =   b.data.nodes.filter    (n =>selectedMakers.includes (n) == true)
            let unselected_filter = b.data.nodes.filter    (n =>selectedMakers.includes (n) == false)

            //console.log ('filtered = ', b.data.nodes.length)
            //console.log ('base = ', b.nodes_base.length)
            //console.log ('-------------------------')

            // update selected -- 
            b.selected_base = selected_base;
            b.data.nodeGroup.selected = selected_filter

            // update unselected -- 
            b.unselected_base = unselected_base;
            b.data.nodeGroup.unselected = unselected_filter

          // -- filter the (BASE) nodes in this.data.nodeGroup
                  // let selectedNodes =    b.nodes.filter    (n =>selectedMakers.includes (n) == true)
                  // let unselectedNodes =  b.nodes.filter    (n =>selectedMakers.includes (n) == false)
                  
                  // // update selected -- 
                  // b.selected_base = selectedNodes;
                  // b.data.nodeGroup.selected = selectedNodes

                  // // update unselected -- 
                  // b.unselected_base = unselectedNodes;
                  // b.data.nodeGroup.unselected = unselectedNodes

            // draw -- 
              b.drawGroup( )

            })
    }
    //--- ******* ---- //
    // -- HIGHLIGHT NEXT ROW DOWN -- from CLICKED SELECTION 
    rows[activeRow+1].blocks.forEach (b => { 
        // -- NEW -- // 
          console.log (rows[activeRow+1].rowindex)
            // update base nodes from selection
            let selected_base =    b.nodes_base.filter    (n =>selection.includes (n) == true)
            let unselected_base =  b.nodes_base.filter    (n =>selection.includes (n) == false)

            // update (filter) shown nodes (filter)
            let selected_filter =   b.data.nodes.filter    (n =>selection.includes (n) == true)
            let unselected_filter = b.data.nodes.filter    (n =>selection.includes (n) == false)

             // update selected -- 
            b.selected_base = selected_base;
            b.data.nodeGroup.selected = selected_filter

            // update unselected -- 
            b.unselected_base = unselected_base;
            b.data.nodeGroup.unselected = unselected_filter


          // -- OLD -- // 
              // let selectedNodes =    b.nodes.filter (n =>selection.includes (n) == true)
              // let unselectedNodes =  b.nodes.filter (n =>selection.includes (n) == false)
              
              // // update selected -- 
              // b.selected_base = selectedNodes;
              // b.data.nodeGroup.selected = selectedNodes

              // // update unselected -- 
              // b.unselected_base = unselectedNodes;
              // b.data.nodeGroup.unselected = unselectedNodes
        
          // draw -- 
          b.drawGroup( )
    })

    // HIGHLIGHT FLOWS - flow should get smaller - and be filterd 
    flowItems.forEach (b => { 

        // -- get all the base nodes -- // 
        let allbase_nodes = b.selected_base.concat (b.flow_base)
        let all_filter_nodes = b.data.nodeGroup.selected.concat (b.data.nodeGroup.flow)

        let flow_base =   allbase_nodes.filter (n => flowMakers.includes (n)== true)
        let select_base = allbase_nodes.filter (n => flowMakers.includes (n)== false)

        let flow_filter =   all_filter_nodes.filter    (n =>flowMakers.includes (n) == true)
        let select_filter = all_filter_nodes.filter    (n =>flowMakers.includes (n) == false)
        
        // -- update flow (base and filtered)
        b.flow_base = flow_base;
        b.data.nodeGroup.flow = flow_filter

        // -- update selected (base and filtered)
        b.selected_base = select_base;
        b.data.nodeGroup.selected = select_filter






        // // -- get both selected and flow nodes 
        // let allnodes  = b.data.nodeGroup.selected.concat (b.data.nodeGroup.flow); 

        // let flowNodes = allnodes.filter (n => flowMakers.includes (n)== true)
        // let selectNodes = allnodes.filter (n => flowMakers.includes (n)== false)
        



        // // -- update selected 
        // b.data.nodeGroup.selected =  selectNodes; // b.data.nodeGroup.selected.filter (n => flowMakers.includes(n)== false)
        // b.selected_base =  selectNodes; //  b.selected_base.filter (n => flowMakers.includes(n)== false)
        
        // // -- update flow nodes 
        // b.data.nodeGroup.flow = flowNodes; 
        // b.flow_base = flowNodes; 

        b.drawGroup( )

    })

 // -- 
    //rows[2].setLocations( )
    //rows[2].drawBlocks( );

    if (activeRow < 2)activeRow ++; 
    //if (activeRow < rows.length-1) activeRow += 1; 
    listMakers ()


}


// -- clear sankey selection -- // 
export function clearSelection_Sankey( ) { 
  activeRow = 0;
  selectedMakers = [ ]; // the makers  to show in the diagram -- // 
  flowMakers = [ ]; 
  flowItems = [ ]; 

  // remove selected from rows -- // 
  rows.forEach (row => { 
      row.blocks.forEach (b => { 
        // all selected and filtered nodes 
        let allnodes_filtered = b.data.nodeGroup.selected.concat (b.data.nodeGroup.flow)
        let allnodes_base = b.nodes_base.concat (b.flow_base)
        // - move all filtered nodes 
        b.data.nodeGroup.unselected = b.data.nodeGroup.unselected.concat (allnodes_filtered);
        b.unselected_base = b.unselected_base.concat (allnodes_base)

        // UNselected REMAIN the SAME -- 
        b.selected_base = [ ]
        b.data.nodeGroup.selected = [ ]
        
        b.data.nodeGroup.flow = [ ]; 
        b.flow_base = [ ]
        b.drawGroup( );
      })
  })

  social_view.clusterlist.forEach (c => { 
        c.flowNodes = [ ]
        c.selectedNodes = [ ]
        c.selectedLinks = [ ]; //c.links.filter (l => selectedMakers.includes (l.source.id) && selectedMakers.includes (l.target.id) )
        c.drawShapeNodes( )
    })
}


export function clearSelection_Social ( ) { 



}

// --------------------------------- // 
// let makerList = document.getElementById('makerlist')
// makerList.innerHTML = "this is some text ...."

let makerTable = document.querySelector("#makerTable tbody");


function listMakers ( ) { 
  let makers = social_view.getSelectedMakers( )
  // -- get all visible makers - and put into html // 

  let selected_names = base_nodes.filter (n => makers.selected.includes (n.id))
  let flow_names = base_nodes.filter (n => makers.flows.includes(n.id))

  flow_names.forEach( n =>  n.flow = true ); // flag flow itesms
  selected_names.forEach( n =>  n.flow = false ); // flag flow itesms

  // flow_names.forEach (n => { 
  //      console.log ('flow  item', n.name, ' , ', n.flow)
  // })

  // selected_names.forEach (n => { 
  //      console.log ('selected ', n.name, ' , ', n.flow)
  // })

  //console.log ('--------------------')


  let allnames = flow_names.concat (selected_names)

  //console.log ('selected makers = ', selected_names.map (n => n.name))
  //console.log ('flow makers = ', flow_names.map (n => n.name))

  makerTable.innerHTML = ""; // -- clear existing table --

  allnames.forEach (maker => { 
        // -- populate table with maker data-- // 
       // console.log ('maker = ', maker.name, ' , ', maker.flow)

        // -- create a new row --
        let row = document.createElement("tr");
        // -- add cells to the row 
        let nameCell = document.createElement("td");
        let locationCell = document.createElement("td");
        let guildCell = document.createElement("td");
        let knownInstCell = document.createElement("td");

        //  -- populate cells -- 
        nameCell.textContent =  maker.name //"Andrew" ; // person.name;
        locationCell.textContent = maker.towns; // person.location;
        guildCell.textContent = maker.guilds ; // person.trade;
        knownInstCell.textContent = maker.known_instruments ; // person.trade;
        
        //console.log (maker.towns)
        if (maker.flow == true) {
          nameCell.classList.add("table-highlight");
        }

        // -- add to cells to row  -- 
        row.appendChild(nameCell);
        row.appendChild(locationCell);
        row.appendChild(guildCell);
        row.appendChild(knownInstCell);
        //  -- add row to table
        makerTable.appendChild(row);
    })

}

// Add event listener to the table elemennts for click events
document.querySelector("#makerTable").addEventListener("click", function(event) {
  var target = event.target;

  // Check if the click occurred on a table cell
  if (target.tagName.toLowerCase() === "td") {
    var cellValue = target.textContent;
    handleClick(cellValue);
  }
});

function handleClick(value) {
  // Handle the click event here
  console.log("Clicked:", value);
}


// --------------------------------- // 




      // export function addToSelectionV3 (selection, item ) { 
      //   let type = 'add'

      //    //console.log ('clicked block = ', item)
      //    flowItems.push (item)
         

      //    // -- update SelectedMakers -- 
      //    if (type == 'add' ) {      //|| selectedMakers.length == 0) { 
      //         // -- ADDITIVE - ADD TO current selection to selectedMakers -- 
      //         selectedMakers = [...new Set(selectedMakers.concat(selection))];  // remove duplicates
      //         selectedMakers.sort((a, b) => a - b);
      //         //console.log ('ALL  = ', selectedMakers)
      //     } else {  
      //         // -- SUBTRACTIVE 
      //         let shared = selectedMakers.filter (n => selection.includes (n))
      //         selectedMakers = shared;
      //     }

      //     // -- update FLOW (common elements in highlighted blocks)
      //     if (flowMakers.length == 0) { 
      //       // add makers to array (initially)
      //       flowMakers = selection;
      //     } else { 
      //       // filter flow makers -- find the common makers -- a subtractive selection -- //
      //       flowMakers = flowMakers.filter (n => selection.includes (n))
      //     }


      //     //console.log ('flow items ', flowItems)
      //     //console.log ('flow makers ', flowMakers); 
      //     console.log ('selected makers = ', selectedMakers)
      //     //console.log ('clicked items ', selection)
      //     //-------------------------------------------------------- // 

      //     // -- HIGHLIGHT selected makers in layout -- 
      //     social_view.clusterlist.forEach (c => { 
      //         c.flowNodes = c.nodes.filter ( n => flowMakers.includes (n.id)); 
      //         c.selectedNodes = c.nodes.filter ( n => selectedMakers.includes (n.id)); 
      //         c.selectedLinks = c.links.filter (l => selectedMakers.includes (l.source.id) && selectedMakers.includes (l.target.id) )
      //         c.drawShapeNodes( )
      //     })

      //     // -- block should work on the 'next' row each time -- //
      //     // -- HIGLIGHT the first row - highlight new items -- // use all selected makers 

      //     //if (activeRow ==0) { 
      //     rows[0].blocks.forEach (b => { 
      //                 let selectedNodes =    b.nodes.filter    (n =>selectedMakers.includes (n) == true)
      //                 let unselectedNodes =  b.nodes.filter    (n =>selectedMakers.includes (n) == false)
                      
      //                 // update selected -- 
      //                 b.selected_base = selectedNodes;
      //                 b.data.nodeGroup.selected = selectedNodes

      //                 // update unselected -- 
      //                 b.unselected_base = unselectedNodes;
      //                 b.data.nodeGroup.unselected = unselectedNodes

      //                 // draw -- 
      //                 b.drawGroup( )

      //       })
      //     //}
      //     //--- ******* ---- //
      //     // next row - active 0 next = 1 // active = 1

      //     // -- HIGHLIGHT OTHER ROWS  -- from CLICKED SELECTION 
      //     //for (let i=1; i<=activeRow+1; i++) { 
      //     rows[activeRow+1].blocks.forEach (b => { 
      //           let selectedNodes =    b.nodes.filter (n =>selection.includes (n) == true)
      //           let unselectedNodes =  b.nodes.filter (n =>selection.includes (n) == false)
                
      //           // update selected -- 
      //           b.selected_base = selectedNodes;
      //           b.data.nodeGroup.selected = selectedNodes

      //           // update unselected -- 
      //           b.unselected_base = unselectedNodes;
      //           b.data.nodeGroup.unselected = unselectedNodes
              
      //           // draw -- 
      //           b.drawGroup( )
      //     })
      //   //}

      //     // HIGHLIGHT FLOWS - flow should get smaller - and be filterd 
      //     /// go through flow list -and update flow - and update blocks..
      //     // update flow items with FLOW MAKERS data -- 

      //     flowItems.forEach (b => { 
      //         let allnodes  = b.data.nodeGroup.selected.concat (b.data.nodeGroup.flow)

      //         let flowNodes = allnodes.filter (n => flowMakers.includes (n)== true)
      //         let selectNodes = allnodes.filter (n => flowMakers.includes (n)== false)
              
      //         // -- update selected 
      //         b.data.nodeGroup.selected =  selectNodes; // b.data.nodeGroup.selected.filter (n => flowMakers.includes(n)== false)
      //         b.selected_base =  selectNodes; //  b.selected_base.filter (n => flowMakers.includes(n)== false)
              
      //         // -- update flow nodes 
      //         b.data.nodeGroup.flow = flowNodes; 
      //         b.flow_base = flowNodes; 
              
      //        // console.log ('flow item - updated', b.data.nodeGroup)
      //        // console.log ('------------------------------------')

      //         b.drawGroup( )


      //     })


      //     activeRow = 1; 
      //     //if (activeRow < rows.length-1) activeRow += 1; 


      // }


































