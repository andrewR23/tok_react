import makers from './assets/allmakers_dates.json'; 
import netClustering from 'netclustering';

// -- generate ROWS from QUERY STRING -- // 

const queryString = 'towns=London&guilds=Clockmakers'; // 'towns=London&date>1800';
const url = 'https://example.com/data?location%21%3DLondon%26date%3E1800';
const string = 'location%21%3DLondon%26date%3E1800'



// the PARENT dataset for . 
const makerDataset = { 
   allmakers  : [ ],
   selected   : [ ], 
   flow       : [ ]
}

// should there also be a date-filtered version

const rowsDataset = [ ]


const queryItems = parseQueryString(queryString)
console.log ("query items = ", queryItems)


/// ---- groupings -- // 
let social_Clusters  = [ ]

let guild_Groups = [ ] 
let advInst_Groups = [ ]
let town_Groups = [ ]

// -- import the data -- // and sort into groups ?? 
let makerCount = 50 ; // 1220;
let allmakers = makers.makers;
let someMakers = allmakers.slice (0, makerCount);

//makerDataset.allmakers = [...someMakers]


let nodeAlpha = 1; 

let base_nodes = [ ]; 
let base_links = [ ];

// -- need to get
let linkTypes = [
  'apprenticed_to', 
  'associated_with', 
  'see_also', 
  'employed_by', 
  'succeeded_by', 
  'took_over_from', 
  'had_apprentice', 
  'parent_of'
  ]


// -- GET LISTS of the ATTRIBUTE names (in some makers) -- // 
  const guilds = [...new Set(someMakers.map(maker => maker.guilds).flat())]; 
  const adv_instruments = [...new Set(someMakers.map (maker => maker.advertised_instruments).flat( ))]; 
  const known_instruments = [...new Set (someMakers.map (maker => maker.known_instruments).flat( ))]; 
  const towns =  [... new Set (someMakers.map (maker => maker.towns).flat( ))]; 
// -- this just returns arrys of guilds etc.. - it does not sort them -- // 


// -- get BASE NODES and LINKS -- // 
// -- base_nodes are a subset of the makers -- //   
someMakers.forEach (m => { 

    // -- POPULATE NODES -- // 
    // -- only add makers which have any of the relational links -- 
    let hasRelations = Object.keys (m).some( item => linkTypes.includes(item))

    //hasRelations = true; // -- override
    if (hasRelations) {
      let makernode = m; //

      // -- convert date 1 and date 2 to useable values 
      m.date_1 =  parseFloat (m.date_1.slice(0, 4)); 
      m.date_2 =  parseFloat (m.date_2.slice(0, 4)); 

      // -- remove spaces, commas and apostrophes from names & replace with underscore _ -- 
      makernode.towns.forEach ((d, i) =>  makernode.towns[i]= d.replace(/[' ,]/g, '_'));
      makernode.known_instruments.forEach ((d, i) =>  makernode.known_instruments[i]= d.replace(/[' ,]/g, '_'));
      makernode.guilds.forEach ((d, i) =>  makernode.guilds[i]= d.replace(/[' ,]/g, '_'));
      makernode.advertised_instruments.forEach ((d, i) =>  makernode.advertised_instruments[i]= d.replace(/[' ,]/g, '_'));//replace(/\s/g, '_'));


      // -- makernode.guilds.forEach (d => console.log ('guilds ', d))
      // -- makernode.advertised_instruments.forEach (d => console.log ('ad i ', d))

      //------------------------------------------------------// 

      // -- add values for dx dy (x y locs to follow the force location)
      // -- locx locy are the 'shadow locs'
      // -- makernode.locx = 0; 
      // -- makernode.locy = 0; 
      // -- add other values 
      // -- makernode.alpha =  nodeAlpha; // starting alpha value.. 

      // -- if (duplicate.length > 0) console.log ('duplicate found = ', duplicate)
      // -- see if it already exists - if so
      let duplicate = base_nodes.filter (n => n.id == m.id)
      if (duplicate.length == 0) base_nodes.push (makernode); 
      if (duplicate.length > 0) nodes_duplicated.push (makernode);
    }

  
    // -- POPULATE LINKS -- // 
    linkTypes.forEach ( linkType => { 
         // only include nodes which have a link type 
        if (m [linkType] != undefined ) {

          m [linkType] [0].forEach (target_id => { 
            // -- Ignore links to self -- // 
            if (m.id != target_id) {

 
              // look for any exisiting links (match in reverse) -- or duplicates -- // 
              let foundInverse =  base_links.filter (link => link.source == target_id && link.target == m.id  && link.type == linkType);
              let foundMatch =  base_links.filter (link => link.source == m.id && link.target == target_id  && link.type == linkType);

              // -- if none found - add a new link
              if (foundInverse.length == 0 && foundMatch.length == 0) {
                let source = m; 
                let target = allmakers.find ( maker => maker.id == target_id);
                let newLinkItems = { source:m, target: target, count:1, type:linkType}; // links as REFs 
                // --- // 
                let newLinkID =  { source:m.id, target: target_id, count:1, type:linkType}; // links as IDs 
                base_links.push (newLinkID);
              } 

              // -- if found a match -- add to 
              if (foundInverse.length > 0)  foundInverse[0].count +=1;
              if (foundMatch.length > 0)    foundMatch[0].count +=1;

            }
          })

        }

      })

  })

let ID_list = [...base_nodes].map (m => (m.id )); // - array of IDs
// -- filter links without source AND target: i.e. with a missing part to the link...
base_links = base_links.filter (l => ID_list.indexOf (l.source)!= -1 && ID_list.indexOf(l.target) != -1) 

/// --------------------------------- /// 

makerDataset.allmakers = [...base_nodes]

// --for each part of the query create a row -- // 
// -- get each part of the query --  and poputate row data 
queryItems.forEach ((q, i)  => { 
  rowsDataset.push ( { id : i, query: q, makers : [ ]})
  populateRowData (rowsDataset[i])
})


/// --------------------------------- /// 

// -- use BASE NODES to construct clusters -- // 
social_Clusters = getClusters_social([...base_nodes], base_links);
guild_Groups = sortByAttribute ([...base_nodes], 'guilds')
advInst_Groups = sortByAttribute ([...base_nodes], 'advertised_instruments')
town_Groups = sortByAttribute ([...base_nodes], 'towns')

// -- what is the difference between some makers and base makers
// console.log ('some makers =',  someMakers)
// console.log ('base_makers =',  base_nodes)

const dataMappings = {
  'towns': town_Groups,
  'guilds': guild_Groups,
  'advertised_instruments': advInst_Groups
};

// console.log ('guilds ', guilds)
// console.log ('some makers ', someMakers); // a subset of all makers 
// console.log ('base nodes ', base_nodes); // a subset of some makers - who have corresponding links.. 
// console.log ('base links ', base_links); // links between makers (IDs)
// console.log ('social clusters ', social_Clusters)
// console.log ('guilds ', guild_Groups)
// console.log ('tools ', advInst_Groups)
// console.log ('town ', town_Groups)  

// console.log ('makers dataset ', makerDataset)
// console.log ('rows dataset', rowsDataset)


//console.log ('...', social_Clusters)
export {base_nodes}  // all makerr
export {social_Clusters}
export {guild_Groups}
export {town_Groups}
export {rowsDataset} ;// sorted rows 

// export links.. 
//export {base_links}
 

// --SORT into SOCIAL CLUSTERS -- 
function getClusters_social (n_list,  socialLinks) {
        // -- netclustering test -- // 
        // format links into a format that can be used 
        // -- map down to just ids -- // 

        let linksnew = socialLinks.map ( item =>  { 
            // --- //
            let sourcenode =  n_list.find (n => n.id == item.source); 
            let targetnode =  n_list.find (n => n.id == item.target);
            let sourceIndex = n_list.indexOf (sourcenode)
            let targetIndex = n_list.indexOf (targetnode)

            //console.log ('source ', sourceIndex, ' target : ', targetIndex)
            return { source: sourceIndex, target: targetIndex}
        })
        // -- unformatted list of links -- // 
        //console.log ("linksnew : ", linksnew)
        let clustersNEW = [ ];
        let clustertest = netClustering.cluster(n_list, linksnew); // this give each node a new cluster property.. 

        // -- FLATTEN any arrays that are returned 
        clustertest.forEach ((c, i) => { 
          // flatten and sub arrays 
           if (Array.isArray (c[0])) { 
              clustertest[i] = clustertest[i].flat ( )
           }
          //console.log ('cluster test flat = ', c)

           // -- non linked items - need to be sorted into their OWN clusters -- 
           let nodeindex = c[0];// first node in the cluster (as a test)
           let clusternode = n_list[nodeindex];

          // --  if this not in a link - make all items separate clusters 
          //console.log ('social links -> ', socialLinks)
          if (clusternode != undefined) { 
            let foundLink = socialLinks.find (l => l.source == clusternode.id || l.target == clusternode.id)

            // if not in a link 
            if (foundLink == undefined ) { 
                clustertest.splice (i, 1)
                splitIntoChunk (c, 1, clustertest)
            } 

          }

        })

        //---------------------------- // 
       // console.log ('cluster test ', clustertest)
        // -- also get list of links -- // 
        clustertest.forEach ((cluster, i) => { 
            // -- format into clusters with node IDs -- 
            let nodeIds = []; 

            // may not be a flat array of values  -- //
            cluster.forEach (id => {
                let isArray = Array.isArray (id);
                // id may be array of id's. 
                if (isArray == false)  {
                    //nodeIds.push ({id: base_nodes[id].id, node_radius: 5}); // SET node attributes
                    //nodeIds.push ({maker: base_nodes[id], node_radius: 5}); // SET node attributes
                    nodeIds.push (base_nodes[id]); // SET node attributes


                }
                // if this a nested array 
                if (isArray) { 
                  id.forEach (d => {
                    //nodeIds.push ({id: base_nodes[d].id, node_radius: 5}); // SET node attributes
                    //nodeIds.push ({maker: base_nodes[d], node_radius: 5}); // SET node attributes
                    nodeIds.push (base_nodes[d]); // SET node attributes

                  })
                }
            }); 

            // --- GET LINKS IN CLUSTER  -- // 
            let links = [ ]; // -- populate links -- // 
            nodeIds.forEach (n => { 
              let foundlinks = socialLinks.filter (link => link.source == n.id || link.target == n.id)
              //let foundlinks = socialLinks.filter (link => link.source == n.maker.id || link.target == n.maker.id)
              
              // --convert each ID into a ref to main items
              foundlinks.forEach (link => { 
                link.source = base_nodes.find (node => node.id == link.source)
                link.target = base_nodes.find (node => node.id == link.target)
              })

              // -- add to links if not already in -- // ?
              foundlinks.forEach (link => {                    
                if (links.indexOf (link) === -1) links.push (link)
              })

            })
            // ------------------------------------ // 

            // create new cluster object 
            let clusterObj = { 
              name : 'social',
              type : 'socialcluster',
              nodes: nodeIds,
              nodes_base: nodeIds,
              links: links,
              links_base: links
              // -- these have been removed -- // 
              //size : nodeIds.length, // setClusterSize(nodeIds), //nodeIds.length * 10,
              //col : 0,
              //alpha : 0.2,
              //scale : 1
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


// -- SORT into ATTRIBUTEs-- // nodes = makers..
function sortByAttribute (nodes, attr) {
    //let attr = 'guilds'
    //let type = 'guildcluster'
    // -- reduce and use an accumulator -- //
    const makersByAttr = nodes.reduce((acc, maker) => {

      // NOTE : these only add the ID not the full maker reference : // 
        if (maker[attr].length === 0) {
          if (!acc._none) {
            acc._none = [maker];// if 'none' does not exist - add it 
          } else {
            acc._none.push(maker); // if 'none' exists - push maker into acc
          }
        } else {
          maker[attr].forEach(guild => {
            if (!acc[guild]) {
              acc[guild] = [maker]; // if guild does not exist : add into accumulator ()
            } else {
              acc[guild].push(maker); // if guild DOES exist in accumulator - push maker into it.
            }
          });
        }
       // console.log ('acc ', acc) ; // the accumulation of objects 
        return acc; // returns the accumulator 
      }, {}); // the inital value of the accumulator 


    // -- use the accumulator created above - and sort into array -- // 
    const sortedMakersByAttr = Object.entries(makersByAttr) // returns an array
         .sort(([val1], [val2]) => val1.localeCompare(val2))
         .map(([val, makers], i) => ({ 
          name :  val || 'none',
          type :  attr + 'cluster',
          [attr]: val || "none", 
          nodes_base: makers,
          nodes: makers, 
          size:  makers.length * 5,
          id : i, 
          col : 0
        }));

     return sortedMakersByAttr;

  }

// -------------------------------------------- // 


// -- populate maker data in rows 
//populateRowData (rowsDataset[0])
//populateRowData (rowsDataset[1])

function populateRowData (row) { 
     let sourcedata = row.id === 0 ? makerDataset.allmakers : rowsDataset[row.id-1].makers;
     let filterdata = filterMakers (sourcedata, row.query.att, row.query.value);
     row.makers.push (...filterdata)
}


// -------------------------------------------- // 


function filterMakers (source, attr , value) {
    let filter = source.filter (m => m[attr].includes (value) == true )
    return filter; 
}


function parseQueryString(queryString) {
    //const queryString = url.split('?')[1]; // Get the query string from the URL
    const decodedQueryString = decodeURIComponent(queryString);
    const queryParts = decodedQueryString.split('&');
    const parsedQuery = [];
    const parsedConditions = [];
    const regex = /(\w+)(>=|<=|[!=<>]+|\|\|)(\w+)/;

    queryParts.forEach(condition => {
    const match = condition.match(regex);
    if (match) {
      const attribute = match[1];
      const operator = match[2];
      const value = match[3];
      parsedConditions.push({ att: attribute, operator, value });
      }
    });
    return parsedConditions;
}


// filter and update the data in the main visualisation.. // do this here.. 











