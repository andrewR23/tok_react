console.log ('this is module 5: cluster and time sequence  ')
import *  as d3 from 'd3';
import * as  Vec2D from 'victor';
import netClustering from "netclustering";

import * as f1 from './module_1.js';
import * as d3Class from './clusterClassV3C.js'
import * as gui from './index.js';



let svg = d3.select ('svg')
let w =  svg.attr ('width');
let h = svg.attr ('height')

let nodeAlpha = 1; 
let makerCount = 800;

// -- GET ORIGINAL data --//

  import makers from './assets/allmakers_dates.json'; 
  let allmakers = makers.makers;
  let someMakers = allmakers.slice (0, makerCount);

  let linkTypes = ['apprenticed_to', 'associated_with', 'see_also', 'employed_by', 'succeeded_by', 'took_over_from', 'had_apprentice', 'parent_of']

  export let base_nodes = [ ]; 
  let social_links = [ ];


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

 // -- REMOVE links that don't have BOTH source and target ID in ID list -- // 
  let ID_list = base_nodes_copy.map (m => (m.id )); // - array of IDs
  social_links = social_links.filter (l => ID_list.indexOf (l.source)!= -1 && ID_list.indexOf(l.target) != -1)

// -- SORT INTO SOCIAL CLUSTERS (SOCIAL)- - // 
 let social_Clusters = getClusters_social(base_nodes_copy);

console.log ('base nodes ', base_nodes);
console.log ('social_links ', social_links);
console.log ('social_links (filtered) ', social_links);

// GROUP By other means.. // 

  let guilds_list = ['Blacksmith', 'Clockmakers' ]; 
  let instrument_list = ['Steelyard', 'Balance', 'Chonometer', 'Compass']



// -- TEST data -- // 
  let nodesTest = [ 
    { index: 0, name: 'Andrew',   id: 1001},
    { index: 1, name: 'Albert',   id: 1002},
    { index: 2, name: 'Alice',    id: 1003},
    { index: 3, name: 'Arthur',   id: 1004},
    { index: 4, name: 'Aaron',    id: 1005}
  ]

  let nodesV2 = [
    { index: 0, name: 'Andrew',  guild: 'Blacksmith',   known_inst: 'Steelyard',      id: 1001},
    { index: 1, name: 'Andrew',  guild: 'Blacksmith',   known_inst: 'Steelyard',      id: 1002},

    { index: 2, name: 'Andrew',  guild: 'Blacksmith',   known_inst: 'Balance',        id: 1003},
    { index: 3, name: 'Andrew',  guild: 'Blacksmith',   known_inst: 'Balance',        id: 1004},
    { index: 4, name: 'Andrew',  guild: 'Blacksmith',   known_inst: 'Balance',        id: 1005},
    { index: 5, name: 'Andrew',  guild: 'Blacksmith',   known_inst: 'Balance',        id: 1006},

    { index: 6, name: 'Andrew',  guild: 'Clockmakers',  known_inst: 'Chonometer',     id: 1007},
    { index: 7, name: 'Andrew',  guild: 'Clockmakers',  known_inst: 'Chonometer',     id: 1008},
    { index: 8, name: 'Andrew',  guild: 'Clockmakers',  known_inst: 'Chonometer',     id: 1009},

    { index: 9, name: 'Andrew',  guild: 'Clockmakers',  known_inst: 'Compass',        id: 1010}


    ]

  // ---------------- // 
  let clusterDataV1= [
    { 
      name: 'cluster0',
      type: 'cluster', 
      nodes: [ {id: 1001}, {id: 1}],
      size: 10

    },
    { 
      name: 'cluster1',
      type: 'cluster', 
      nodes: [ {id: 1}, {id: 2}, {id: 3}, {id: 4}],
      size : 100 

    },
    { 
      name: 'cluster2',
      type: 'cluster', 
      nodes: [ {id: 1}, {id: 2}, {id: 3}, {id: 4}],
      size : nodesTest.length* 10

    }
  ]


 
  let guild_Clusters = [ ]; 
  let instrument_Clusters = [ ]; 

// -- TEST sort into clusters - by guild -- //

  guilds_list.forEach (guildname => { 
      let nodes = [...nodesV2].filter (n => n.guild == guildname).map (m => ({id: m.id })); // x: Math.random(), y: Math.random()})); 
      // -- new cluster 
      let cluster = { 
          name: guildname,
          type: 'guildcluster',
          nodes: nodes, 
          size: nodes.length *10
      }

      guild_Clusters.push (cluster);
  })

  // -- sort into cluste - by instrument 

  instrument_list.forEach (instrumentname => { 
      let nodes = [...nodesV2].filter (n => n.known_inst == instrumentname).map (m => ({id: m.id})); 
      // -- new cluster 
      let cluster = { 
          name: instrumentname,
          type: 'instrumentcluster',
          nodes: nodes, 
          size: nodes.length * 10
      }
      instrument_Clusters.push (cluster);
  })

console.log ('guild cluster ', guild_Clusters)
console.log ('intrument cluster ', instrument_Clusters)
console.log ('social cluster ', social_Clusters)




// ---------------- // 


// a LAYOUT is a group of clusters -- // 
// -- STRUCTURE -- >> Layout  [Center X Y]-- >> ClusterData [Clusters]

let layouts = [ ]

layouts[0] = new d3Class.Layout  (svg, base_nodes_copy,  social_Clusters, {x: 400, y: 400}, 'red');  



// layouts[1] = new d3Class.Layout  (svg, nodesV2, guild_Clusters, {x: 400, y: 300}, 'blue'); 
// layouts[2] = new d3Class.Layout  (svg, nodesV2, instrument_Clusters, {x: 200, y: 300}, 'orange'); 



let nodeLinks = [ ];
let clusterLinkds = [ ];

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


//seevalues( );
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
    layouts[0].filterLayout_date(gui.slider_date)
     //layouts[0].type = 'force'
    layouts[0].updateLayout( ); //-- recalculate forces --

    // -- restart FORCES in layout -- 
    // layouts[0].setForces_layout( )
    // layouts[0].restartForces ( );

}

export function updateDatePositions ( ) { 
  //console.log ("update layout dATE POS ", gui.range_output)
  layouts[0].updateLayout( ); 
  layouts[0].dateScale = setDateScale (1600, 1990, 10, gui.range_output);
}

// -- DATE VIEW // 
export function moveToTimeLineView ( ) { 
    //layouts[0].updateLayout ('date')
   // set xy pos - first 
    layouts[0].type = 'date'
    layouts[0].updateLayout( );
    //layouts[0].moveClusterLayoutXY( );
}

// -- FORCE (NETWORK) VIEW //
export function moveToForceView ( ) { 
   // layouts[0].updateLayout ('force')
    layouts[0].type = 'force'
    layouts[0].updateLayout( );
}


// -- LINK TESTS -- add / remove // -- // 

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








// ----- FUNCTIONS ---- /// 

// --- DATE SCALE -- 
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


// --SORT into SOCIAL CLUSTERS -- 
function getClusters_social (n_list) {
        // -- netclustering test -- // 
        // format links into a format that can be used 
        let linksnew = social_links.map ( item =>  { 
            // --- //
            let sourcenode = n_list.find (n => n.id == item.source); 
            let targetnode = n_list.find (n => n.id == item.target);
            let sourceIndex = n_list.indexOf (sourcenode)
            let targetIndex = n_list.indexOf (targetnode)

            //console.log ('source ', sourceIndex, ' target : ', targetIndex)
            return { source: sourceIndex, target: targetIndex}
        })
        //console.log ("linksnew : ", linksnew)

        let clustersNEW = [ ];
        let clustertest = netClustering.cluster(n_list, linksnew); // this give each node a new cluster property.. 

        // nodes.forEach ( n => n.cluster = 'cluster_' + n.cluster)
        //console.log ('cluter test ', clustertest)
        // -- FLATTEN any arrays that are returned 
        clustertest.forEach ((c, i) => { 
          // flatten and sub arrays 
           if (Array.isArray (c[0])) { 
              clustertest[i] = clustertest[i].flat ( )
           }

           // non linked items - need to be sorted into their own clusters -- 
           let nodeindex = c[0];// first node in the cluster (as a test)
           let clusternode = n_list[nodeindex];
           //console.log ('i', nodeindex)
           //console.log ('cnode ', clusternode)

           // --  if this not in a link - make all items separate clusters 
          if (clusternode != undefined) { 
            let foundLink = social_links.find (l => l.source == clusternode.id || l.target == clusternode.id)
            //console.log ('in links ? ', foundLink)
            if (foundLink == undefined ) { 
                clustertest.splice (i, 1)
                splitIntoChunk (c, 1, clustertest)
            }
          }

        })

        //---------------------------- // 
        clustertest.forEach ((cluster, i) => { 
            // -- format into clusters with node IDs -- 
            let nodeIds = []; 

            // may not be a flat array of values  -- //
            cluster.forEach (id => {
                let isArray = Array.isArray (id);
                // id may be array of id's. 
                if (isArray == false)  {
                    nodeIds.push ({id: base_nodes[id].id}); // error here.
                }
                // if this a nested array 
                if (isArray) { 
                  id.forEach (d => {
                    nodeIds.push ({id: base_nodes[d].id}); // error here nodes
                  })
                }
            }); 

            // create new cluster object 
            let clusterObj = { 
              name : 'social',
              type : 'socialcluster',
              nodes: nodeIds,
              size : nodeIds.length * 5,
              col : 0,
              alpha : 0.2
            }
            //console.log ('new obj ', clusterObj)
            clustersNEW.push (clusterObj);

        })

        n_list.forEach ( n => n.cluster = 'cluster_' + n.cluster)
        return clustersNEW;

        // -- chunk array into sub array -- // 
        function splitIntoChunk(arr, chunk, arrayToAddTo) {
            for (let i=0; i < arr.length; i += chunk) {
                let tempArray;
                tempArray = arr.slice(i, i + chunk);
                //console.log(tempArray);
                arrayToAddTo.push (tempArray)
            }
        }
        // ---------------------------- // 
  }



















