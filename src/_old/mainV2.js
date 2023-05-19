console.log ('this is module 5: cluster and time sequence  ')
import *  as d3 from 'd3';
import * as  Vec2D from 'victor';
import netClustering from "netclustering";

import * as utility from './module_1.js';

import * as d3Class from './layoutV6.js'
import * as sankeyClass from './clustersSankey_V4.js'

import * as gui from './index.js';


let svg = d3.select ('svg')
let w =  svg.attr ('width');
let h = svg.attr ('height')

let nodeAlpha = 1; 
let makerCount = 620;

// -- tool tip -- // 
export let tooltip = document.getElementById("tooltip");
tooltip.style.top  = "-100px";
tooltip.style.left = "-100px";
// tooltip.innerHTML  = "...";

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

      // -- remove spaces from names & replace with underscore _ -- 
      makernode.towns.forEach ((d, i) =>  makernode.towns[i]= d.replace(/\s/g, '_'));
      makernode.known_instruments.forEach ((d, i) =>  makernode.known_instruments[i]= d.replace(/\s/g, '_'));
      makernode.guilds.forEach ((d, i) =>  makernode.guilds[i]= d.replace(/\s/g, '_'));
      makernode.advertised_instruments.forEach ((d, i) =>  makernode.advertised_instruments[i]= d.replace(/\s/g, '_'));

      //console.log ("maker ", makernode)
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
   console.log ('town_Clusters ', town_Clusters)
  // console.log ('base nodes ', base_nodes);
  // console.log ('social_links ', social_links);
  // console.log ('social_links (filtered) ', social_links);
  // console.log ('social cluster ', social_Clusters)


let layouts = [ ]

// -- CLUSTER layouts -- // 
let social_view= new d3Class.Layout  (svg, base_nodes_copy,  social_Clusters, {x: 400, y: 400}, 'red');  
// layouts[1] = new sankeyClass.Layout_Sankey(svg, base_nodes_copy, town_Clusters ); 
// layouts[1] = new d3Class.Layout  (svg, nodesV2, guild_Clusters, {x: 400, y: 300}, 'blue'); 
// layouts[2] = new d3Class.Layout  (svg, nodesV2, instrument_Clusters, {x: 200, y: 300}, 'orange'); 


// -- SANKEY layouts -- //
let town_row =  new sankeyClass.BlockClass (svg, town_Clusters, { x: 0, y: 770});
let guild_row = new sankeyClass.BlockClass (svg, guild_Clusters, { x:0, y: 820});
//let knowninst_row = new sankeyClass.BlockClass (svg, advInst_Clusters, { x:0, y: 820});

// let sankeyLayout3 = new sankeyClass.BlockClass (svg, base_nodes_copy, guild_Clusters, { x: 0, y: 600});
// let sankeyLayout = new sankeyClass.Layout_Sankey (svg, base_nodes_copy, guild_Clusters);


let nodeLinks = [ ];
// let clusterLinkds = [ ];

// links between layouts -- 
//getLinksBetweenLayours (1, 2) ;
function getLinksBetweenLayours (l0, l1 ) { 
    // -- get links between layouts -- // 
   layouts[1].clusterdata.forEach ((c1, count1) => { 

      c1.nodes.forEach (n =>  {
          let sourceIndex = c1.nodes.indexOf (n);

          layouts[2].clusterdata.forEach ((c2, count2) => { 
            //--let found = c2.nodes.find (cn => cn.id == n.id);
            //--console.log ('found ', found);
            const nodeids = c2.nodes.map(node => node.id); // 
            const targetIndex = nodeids.indexOf (n.id); // is node.id in this group of nodes -- // ?

           // console.log ('target index ', targetIndex)
            if (targetIndex != -1) {    
                 // create a link between nodes //     
                 //console.log ('source cluster index ', count1, '  : target cluster index',  count2)  
                 //console.log ('source node index ', sourceIndex, '  : target node index',  targetIndex)
                 let source = layouts[1].clusterdata[count1].nodes[sourceIndex];
                 let target = layouts[2].clusterdata[count2].nodes[targetIndex];

                 let link = { source : source, target : target};
                 //console.log ("link ", link)
                nodeLinks.push (link)
                
            }

          })
       })
    })
}


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

      town_row.filterAndReDraw(gui.slider_date)
      guild_row.filterAndReDraw(gui.slider_date)

      social_view.filterLayout_date(gui.slider_date)
      social_view.updateLayout( )


      //layouts[0].filterLayout_date(gui.slider_date)
      //layouts[0].updateLayout( ); //-- recalculate forces --
      
      //sankeyLayout.filterAndReDraw(gui.slider_date);
      //sankeyLayout3.filterAndReDraw(gui.slider_date);
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

// ---- LINK TESTS -- add / remove  -- // 

    // let simpleLink = [ 
    //     { source: [10, 10], target: [100, 100]}
    // ]

    // let simpleLinks = [ 
    //     { source : layouts[0].clusterdata[1], target: layouts[1].clusterdata[1] },
    //     { source : layouts[0].clusterdata[1], target: layouts[1].clusterdata[0] },
    //     { source : layouts[0].clusterdata[1], target: layouts[1].clusterdata[0] }
    // ]


    // let nodeLinksTest = [ 
    //   { source : layouts[1].clusterdata[1].nodes[0], target: layouts[2].clusterdata[1].nodes[0], value: 10},
    //   { source : layouts[1].clusterdata[1].nodes[1], target: layouts[2].clusterdata[0].nodes[0], value: 50},
    //   { source : layouts[1].clusterdata[1].nodes[1], target: layouts[2].clusterdata[1].nodes[1], value: 50},
    //   { source : layouts[1].clusterdata[1].nodes[2], target: layouts[2].clusterdata[1].nodes[2], value: 50}
    // ]


    // // update this so that the line moves with the updated values 

    // // let simplePath = svg.selectAll("#simplepath")
    // let linkclusters= svg.selectAll ('#path')
    // let linknodes= svg.selectAll ('#npath')


    // // draw line paths 
    // linkclusters= svg.selectAll ('#path')
    //         .data(simpleLinks)
    //         .enter()
    //         .append("path")
    //         .attr("id", "path")
    //         .attr('stroke', 'red')
    //         .attr('stroke-width', 10)
    //         .attr('opacity', 0.5)
    //         .attr('fill', 'none')

    // linknodes= svg.selectAll ('#npath')
    //         .data(nodeLinks)
    //         .enter()
    //         .append("path")
    //         .attr("id", "npath")
    //         .attr('stroke', 'blue')
    //         .attr('stroke-width', 2)
    //         .attr('opacity', 0.5)
    //         .attr('fill', 'none')

    // //----------------------------// 

    // function updatePaths ( ) {
    //     linkclusters.attr("d", d =>  {  
    //           let p = d3.linkHorizontal()({
    //               source: [d.source.x, d.source.y],
    //               target: [d.target.x, d.target.y]
    //             });
    //           return p;
    //         })
    // }


    // function updateNodePaths ( ) {
    //     linknodes.attr("d", d =>  { 
    //           let sx = d.source.x === undefined ? 0 : d.source.x;
    //           let sy = d.source.y === undefined ? 0 : d.source.y;
    //           let tx = d.target.x === undefined ? 0 : d.target.x;
    //           let ty = d.target.y === undefined ? 0 : d.target.y;
    //          // console.log ("dx ", sx);


    //           let p = d3.linkHorizontal()({ 
    //               source: [d.source.parent_x + sx, d.source.parent_y+ sy],
    //               target: [d.target.parent_x + tx, d.target.parent_y+ ty]
    //             });
    //           return p;
    //         })
    // }

    // //----------------------------// 
    // setInterval (updatePaths, 10); // do this while ticked ?? 
    // setInterval (updateNodePaths, 10); // do this while ticked ?? 

    // ------------------------------------------------ // 

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
  const selection0 = guild_Clusters.find(g => g.name === '_none').nodes; // all 'none' nodes
  const selection1 = guild_Clusters.find(g => g.name === 'Blacksmiths').nodes; // all 'Blacksmith' nodes
  const selection2 = guild_Clusters[8].nodes; // [item 8 in the list - e.g


  //const townSelection = town_Clusters.find (g => g.name === 'London')

//console.log ('selection 0 (guilds = none) ', selection0);
 //social_view.queryClusterBySelection(selection0)
 // layouts[0].queryClusterBySelection(selection2)


// - SOME SELECTIONS -- // 
// -- make some query / selections -- and apply to ALL layouts -- 
// what sort of selection types are there ?? -- and what do each of the layouts need ?? -- // 
// make a selection by getting nodes. 

// -- selection of towns -- // 
let london_selection = town_Clusters.find (d => d.name === 'London').nodes.flat ( );
let birm_selection = town_Clusters.find (d => d.name === 'Birmingham').nodes.flat ( );
//console.log ('london = ', london_selection);
//console.log ('birmingham = ', birm_selection);

// -- selection of guilds -- // 
let clock_selection = guild_Clusters.find (d => d.name === 'Clockmakers').nodes.flat ( );
let join_selection = guild_Clusters.find  (d => d.name === 'Joiners').nodes.flat ( );
//console.log ('clockmakers = ', clock_selection);
//console.log ('joiners = ', join_selection);

// test find. 
//console.log ('node = ', base_nodes.find (n=> n.id == 6061))

//  filter (only works with clusters? )
let sel = clock_selection
// town_row.splitBlockBySelection(sel)
// guild_row.splitBlockBySelection(sel)
// social_view.queryClusterBySelection(sel)

export let testSelection1 = london_selection
export let testSelection2 = birm_selection;



export function showSelection ( selection) { 
    // console.log ('this selection = ', selection.map (n => n.id))
    //console.log ('clock selection = ', sel)

    // selection = selection.map (n => n.id)
    town_row.splitBlockBySelection(selection) // cumul - filtering 'selected ndoes -' not filtering all nodes.. 
    guild_row.splitBlockBySelection(selection)
    social_view.queryClusterBySelection(selection)



}

// -- new -- // 
export let selectedMakers = [ ]; // the makers  to show in the diagram -- // 

export function addToSelection (selection ) { 
   // -- CREATE OVERALL SELECTION -- // 
  let type = 'add'

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

    // -- HIGHLIGHT selected makers in layout -- 
    social_view.clusterlist.forEach (c => { 
        c.selectedNodes = c.nodes.filter ( n => selectedMakers.includes (n.id)); 

        c.selectedLinks = c.links.filter (l => selectedMakers.includes (l.source.id) && selectedMakers.includes (l.target.id) )
        c.drawShapeNodes( )
    })


    // -- HIGHLIGHT selected makers in blocks -- 
    town_row.blocks.forEach (b => { 
      let nodesToView = b.nodes.filter (n =>selectedMakers.includes (n) == true)
      let nodesToHide =  b.nodes.filter (n =>selectedMakers.includes (n) == false)
      b.selected_base = nodesToView;
      b.data.nodeGroup.selected = nodesToView
       b.unselected_base = nodesToHide;
      b.data.nodeGroup.unselected = nodesToHide
      b.drawGroup( )
    })


    guild_row.blocks.forEach (b => { 
      let nodesToView = b.nodes.filter (n =>selectedMakers.includes (n) == true)
      let nodesToHide =  b.nodes.filter (n =>selectedMakers.includes (n) == false)
      b.selected_base = nodesToView;
      b.data.nodeGroup.selected = nodesToView
       b.unselected_base = nodesToHide;
      b.data.nodeGroup.unselected = nodesToHide
      b.drawGroup( )
    })

}






























