import netClustering from 'netclustering';
import makersJSON from './assets/allmakers_dates.json';

// -- query string : to construct flows -- // 
const queryString = 'towns=&guilds=&known_instruments=';//=&advertised_instruments='; // 'towns=Chigwell&guilds=Clockmakers'; // 'towns=London&date>1800';

// known_instruments advertised_instruments , towns, guilds 

// -- the core maker type -- 
export interface MakerType {
  id: any;
  name: any;
  guilds: string [];
  towns: string [];
  advertised_instruments: string[];
  known_instruments: string[];
  date_1: number;
  date_2: number;
  date_1_qual: string;
  date_2_qual: string;
  // other attributes are added during runtime : e.g. x y vx vy 'cluster'?
  // !! then there are all the type of link-- [see_also, apprenticed_to, etc.. etc.. etc.. ]**  
  // currently as separate attributes...
  // - links should be an array : links  [see_also, apprenticed_to, etc.. etc.. etc.. ]
}

// -- link type -- // 
export interface LinkType {
  source: number | MakerType;
  target: number | MakerType;
  type: any; // string []; // should be a string [ ] 
  count : number;
}


// -- social cluster -- 
export interface ClusterType { 
    name : string
    type : string
    nodes: MakerType[],
    nodes_base: MakerType[],
    links: LinkType[],
    links_base: LinkType[]
}

// -- attribute cluster -- 
export interface AttributeType { 
    id : number
    name: string
    nodes: MakerType[],
    nodes_base: MakerType[],
    nodes_sorted: MakerType[][], // sorted into groups for visualisation 
    type: string,
    col: number
    size: number
    value: string

}

// interface Query {
//   [index: number]: QueryType; // Index signature indicating that Filter is an array of Condition objects
// }

// -- rows are used to construct the query -- 
// -- query  type -- 
export interface QueryType {
  att: string;
  operator: string;
  value: string[];
}

// -- rows  type -- 
export interface RowType { 
    id: number;
    query: QueryType;
    makers: MakerType[];
    makers_group: AttributeType[ ]; // all the makers 
    makers_sorted: MakerType[][ ];  // all the makers sorted into 0 1 2 
}



const allmakers = makersJSON.makers.slice (0, 1400); // get a subset to test 

// get all the makers and and filter (remove if they have missing targets)
const linkTypes = [
      "see_also",
      "associated_with",
      "apprenticed_to",
      "had_apprentice",
      "employed_by",
      "succeeded_by",
      "took_over_from",
      "child_of",
      "sibling_of",
      "spouse_of",
      "same_premises_as",
      "parent_of",
      "unknown_relation",
      "worked_for",
      "partnership",
      "agent_to",
      "nephneice_of",
      "cousin_of",
      "uncaunt_of",
      "supplied_to",
      "grandchild_of",
      "supplied_by",
      "son-in-law_of",
      "stepchild_of",
      "step-parent_of",
      "owned_by",
      "owner_of",
      "friend_of",
      "father-in-law_of",
      "brother-in-law_of",
      "subcontractor_to",
      "fellow_apprentice_of",
      "supplied_to",
      "_creditor_of"] ; // a list of link types -- // 

let base_makers: MakerType[] = [ ]; // perhaps this where we set the type.. 
let base_links: LinkType[] = [ ]; // does this need a type 

// -- filter & convert all makers into base_makers // 
allmakers.forEach (m => { 
    // -- only add makers which have any of the relational links --  WHY?
    let hasRelations = Object.keys (m).some( item => linkTypes.includes(item))

    // -- FILTER and CONVERT MAKERS  --  tidy data -- 
    if (hasRelations) {
      const makernode = m  ; //
      // -- convert date 1 and date 2 to useable values 
      makernode.date_1 =  parseFloat (makernode.date_1.slice(0, 4)); 
      makernode.date_2 =  parseFloat (makernode.date_2.slice(0, 4)); 

      // -- remove spaces, commas and apostrophes from names & replace with underscore _ -- 
      makernode.towns.forEach ((d: string, i: number) =>  makernode.towns[i]= d.replace(/[' ,]/g, '_'));
      makernode.known_instruments.forEach ((d: string, i: number) =>  makernode.known_instruments[i]= d.replace(/[' ,]/g, '_'));
      makernode.guilds.forEach ((d: string, i: number) =>  makernode.guilds[i]= d.replace(/[' ,]/g, '_'));
      makernode.advertised_instruments.forEach ((d: string, i: number) =>  makernode.advertised_instruments[i]= d.replace(/[' ,]/g, '_'));//replace(/\s/g, '_'));
        
      if (makernode.towns.length == 0) makernode.towns = ["_none"]
      if (makernode.known_instruments.length == 0) makernode.known_instruments = ["_none"]
      if (makernode.guilds.length == 0) makernode.guilds = ["_none"]
      if (makernode.advertised_instruments.length == 0) makernode.advertised_instruments = ["_none"]




      // -- see if it already exists -[??]
      let duplicate = base_makers.filter (n => n.id == m.id)
      if (duplicate.length == 0) base_makers.push (makernode);
    } 


    // -- POPULATE LINKS -- // 
     linkTypes.forEach (linkType => { 
      // i.e. does the maker have any of these attributes ?? 
      ///console.log (linkType)
      ///console.log (m [linkType])

      if (m [linkType] != undefined ) {
        //console.log (m)
         m [linkType] [0].forEach ((target_id:number) => { 
                 // -- Ignore links to self -- // 
                if (m.id != target_id) {
                      //console.log ("something ", linkType )
                      //console.log ('base links', base_links); // source(number) target(number) type (string[])
                      //console.log ("target_id", target_id); // string
                      // look for any exisiting links (match in reverse) -- or duplicates -- // 
                      let foundInverse = base_links.filter (link => link.source == target_id && link.target == m.id  && link.type == linkType);
                      let foundMatch =  base_links.filter (link => link.source == m.id && link.target == target_id  && link.type == linkType);
                      // -- if none found - add a new link
                      if (foundInverse.length == 0 && foundMatch.length == 0) {
                        let source = m; 
                        let target = allmakers.find ( maker => maker.id == target_id);
                        //let newLinkItems = { source:m, target: target, count:1, type:[linkType]}; // links as REFs 
                        // --- // 
                        // console.log ("link type = ", linkType)
                        let newLinkID =  { source:m.id, target: target_id, count:1, type:[linkType]}; // links as IDs 
                        base_links.push (newLinkID);
                      } 

                      // -- if found a match -- add to 
                      if (foundInverse.length > 0)  foundInverse[0].count +=1;
                      if (foundMatch.length > 0)    foundMatch[0].count +=1;

                }
          })
        }


    });

})


// -- filter links without source AND target: i.e. with a missing part to the link...
let ID_list = [...base_makers].map (m => (m.id )); // - array of IDs
base_links = base_links.filter (l => ID_list.indexOf (l.source)!= -1 && ID_list.indexOf(l.target) != -1) 
// -- once we have makers - these are divided into base nodes?? _- 
// -- all makers are then divided into base nodes depending on whether they have missing links... // 

let social_Clusters: ClusterType[] = sortByLinks ([...base_makers], base_links);



// --SORT into SOCIAL CLUSTERS -- using net clustering -- // 
function sortByLinks (n_list: MakerType[],  socialLinks: LinkType[]) {
        // -- netclustering test -- // 
        // -- format links into a format that can be used 
        // -- map down to just ids -- // 
        let linksnew = socialLinks.map (item =>  { 
            // --- //
            let sourcenode =  n_list.find (n => n.id == item.source); 
            let targetnode =  n_list.find (n => n.id == item.target);

            //console.log ('source node ', sourcenode)

            if (sourcenode && targetnode) { 
                let sourceIndex = n_list.indexOf (sourcenode);
                let targetIndex = n_list.indexOf (targetnode);
                return { source: sourceIndex, target: targetIndex}
                //console.log ('source ', sourceIndex, ' target : ', targetIndex)
            } else {
                return undefined as any; // Use 'any' type to accommodate undefined
            }

            //return { source: sourceIndex, target: targetIndex}
        }).filter(link => link !== undefined); // Filter out undefined elements

       // -- unformatted list of links -- // 
       //console.log ("linksnew : ", linksnew)
       let clustersNEW : ClusterType[ ]= [ ];
       let clustertest: string[][] = netClustering.cluster(n_list, linksnew); // this give each node a new cluster property.. 

        // -- FLATTEN any arrays that are returned -- //
       clustertest.forEach ((c, i) => { 
           // flatten and sub arrays 
           if (Array.isArray (c[0])) { 
              clustertest[i] = clustertest[i].flat ( )
           }
           // console.log ('cluster test flat = ', c)
           // -- non linked items - need to be sorted into their OWN clusters -- 
           let nodeindex = c[0];// first node in the cluster (as a test)
           let clusternode = n_list[parseFloat(nodeindex)];

          // --  if this not in a link - make all items separate clusters 
          // console.log ('social links -> ', socialLinks)
          if (clusternode != undefined) { 
            let foundLink = socialLinks.find (l => l.source == clusternode.id || l.target == clusternode.id)

            // -- if not in a link 
            if (foundLink == undefined ) { 
                let cspliced: any = clustertest.splice (i, 1)
                splitIntoChunk (c, 1, clustertest)
            } 

          }

        })

        // ---------------------------- // 
        // -- also get list of links -- // 
        clustertest.forEach ((cluster:(string[]) , i) => { 
                // -- format into clusters with node IDs -- 
                let nodeIds : MakerType[] = []; 
                 // -- may not be a flat array of values  -- //
                cluster.forEach ((id:string | string[])=> {

                    let arrayToUse: string[];
                    let isArray = Array.isArray (id);

                    if (isArray) {
                          arrayToUse = id as string[]; // Convert id to string[] type: use 'as is'
                    } else {
                          arrayToUse = [id as string]; // Wrap id in an array
                    }
                    //console.log (id)
                    //console.log (arrayToUse)
                    // -- now unpack 'array to use' -- // 
                    arrayToUse.forEach ((id:string) => {
                        nodeIds.push (base_makers[parseFloat(id)]); // SET node attributes
                     })
               });

              let links :LinkType[]  = [ ]; // -- populate links -- // 
              nodeIds.forEach (n => { 
                  let foundlinks = socialLinks.filter (link => link.source == n.id || link.target == n.id);

                  // --convert (Cast) each ID into a ref to main items -- // ?? needed ??
                  foundlinks.forEach (link => { 
                        const foundSource = base_makers.find(node => node.id === link.source)!;
                        const foundTarget = base_makers.find(node => node.id === link.target)!;

                        link.source = foundSource as MakerType;
                        link.target = foundTarget as MakerType;
                  })


                  // -- find links which are duplicated or opposite..
                  // -- find links which are duplicated or opposite.. 

                  // console.log ('foundlinks ', foundlinks)

                  // Create a map to store unique links based on source and target
                  const uniqueLinksMap = new Map();

                    // // Iterate over each link
                    for (const link of foundlinks) {
                          let sourceID; 
                          let targetID; 
                          // get the key... 

                          if (typeof link.source !== 'number')  { 
                             sourceID = link.source.id;
                              //console.log('id:', link.source.id); 
                          } 
                          if (typeof link.target !== 'number')  {
                             targetID = link.target.id
                             // console.log('id:', link.target.id);  
                          } 

                         if (sourceID != null && targetID != null) {
                              const key = `${sourceID}-${targetID}`;

                              // If the key already exists in the map, merge the types
                              if (uniqueLinksMap.has(key)) {
                                  const existingLink = uniqueLinksMap.get(key);
                                  existingLink.type = [...new Set([...existingLink.type, ...link.type])];
                              } else {
                                // Otherwise, check if an opposite link exists
                                  const oppositeKey = `${targetID}-${sourceID}`;
                                  const oppositeLink = uniqueLinksMap.get(oppositeKey);
                                if (oppositeLink) {
                                    // If an opposite link exists, merge the types with the opposite link
                                    oppositeLink.type = [...new Set([...oppositeLink.type, ...link.type])];
                                } else {
                                    // Otherwise, add the link to the map
                                    uniqueLinksMap.set(key, link);
                                }
                              }

                          }

                    }

                    // Get the compiled links as an array // different to found links.. 
                    let compiledLinks = Array.from(uniqueLinksMap.values());
                    // console.log (compiledLinks)
                    // console.log ("show = ", links)
                    compiledLinks.forEach (l => {                    
                        if (links.indexOf (l) === -1) links.push (l)
                    })

                })

            // create new cluster object 
            let clusterObj = { 
              name : 'social',
              type : 'socialcluster',
              nodes: nodeIds,
              nodes_base: nodeIds,
              nodes_sorted: [[], [], []],
              links: links,
              links_base: links
            }
            //console.log ('new cluter obj ', clusterObj)
            clustersNEW.push (clusterObj);

        });

        //n_list.forEach ( n => n.cluster = 'cluster_' + n.cluster) // update the 'cluster' property (is this needed)
        return clustersNEW;

        // -- chunk array function  into sub array -- // 
        function splitIntoChunk(arr: string[], chunk: number, arrayToAddTo: string[][]) {
            for (let i=0; i < arr.length; i += chunk) {
                let tempArray = arr.slice(i, i + chunk);
                //console.log(tempArray);
                arrayToAddTo.push (tempArray)
            }
        }

  }

// -- SORT into ATTRIBUTEs-- // nodes = makers..
function sortByAttribute (nodes: MakerType[], attr: string) {
  // --  1 -
  const makersByAttr = nodes.reduce((acc, maker) => {
      const attributeValue = maker[attr as keyof MakerType];

      if (attributeValue.length === 0) {
        if (!('_none' in acc)) {
          acc._none = [maker];
        } else {
          acc._none!.push(maker);
        }
      } else {
        attributeValue.forEach((item : string) => {
          if (!(item in acc)) {
            acc[item] = [maker];
          } else {
            acc[item]!.push(maker);
          }
        });
      }

      return acc;
  }, {} as Record<string, MakerType[]>); // Provide initial type assertion

 // console.log ('makers by att', makersByAttr)
   
  // -- 2 use the accumulator created above - and sort into array -- // 
  const sortedMakersByAttr  = Object.entries(makersByAttr) // returns an array
         .sort(([val1], [val2]) => val1.localeCompare(val2))
         .map(([val, makers], i) => ({ 
              name: attr,
              value:  val || 'none',
              type:  attr + 'cluster',
              //[attr]: val || "none", 
              nodes_base: makers,
              nodes: makers, 
              size:  makers.length * 5,
              id : i, 
              col : 0,
              nodes_sorted: [[], [], []],
        }));

     return sortedMakersByAttr;

  }


// -- generate query -- and row data -- // 
let rowsDataset: RowType[] = []; // Initialize data as an empty array
const queryItems = parseQueryString(queryString); // parse the query //  
//console.log ('queryitems =  ', queryItems); // this is the constructed query -- //

// -- populate rowDataset -- //
queryItems.forEach ((q, i)  => { 
  rowsDataset.push ( { id : i, query: q, makers: [], makers_group: [], makers_sorted: [[],[], []]}) // create rows : no makers  
  rowsDataset[i].makers_group= sortByAttribute ([...base_makers], rowsDataset[i].query.att) ;// this adds all the makers 

})

//sortRows(rowsDataset);
let temprows = sortRows(rowsDataset)

//console.log ('updated rows = ', updatedrows)
//console.log ('rows data result = ', rowsDataset)
//console.log ('rows data result TEMP = ', temprows)




// -- parse the query into something useful -- // 
function parseQueryString(queryString: string) {
    //const queryString = url.split('?')[1]; // Get the query string from the URL
    const decodedQueryString = decodeURIComponent(queryString);
    //console.log ('decodedQueryString', decodedQueryString)
    const queryParts = decodedQueryString.split('&');
    const parsedQuery = [];
    const parsedConditions:any[] = [];
    //const regex = /(\w+)(>=|<=|[!=<>]+|\|\|)(\w+)/;
    const regex = /(\w+)(>=|<=|[!=<>]+|\|\||\*)(.*)/; // Updated to use ".*" instead of "\\w+"

    queryParts.forEach(condition => {
    const match = condition.match(regex);
    if (match) {
      const attribute = match[1];
      const operator = match[2];
      const value = match[3].split(',') ; // value is an array 


      parsedConditions.push({ att: attribute, operator, value });
      }
    });
    //console.log ("parsed conditions : ", parsedConditions)
    return parsedConditions;
}



export function sortRows (rowdata: any[] ) { 
    // -- 
    //console.log ("DO sort rows ", rowdata)
    //let updatedrowdata:any = [...rowdata]
    
    rowdata.forEach (row => {
        //console.log ("this is a row: ", row)

        let sourcedata = row.id === 0 ? base_makers : rowsDataset[row.id-1].makers_sorted[0];

        if (row.query.value.length === 1 && row.query.value[0] === '*') {
            row.makers_sorted[0] = []; // none in flow 
            row.makers_sorted[1] = [];
            row.makers_sorted[2] = []; 
        } else {
            // update row makers ... (including sorted)
            row.makers_sorted =  sortMakers(base_makers, sourcedata, row.query.att, row.query.value); // that match query & in source 

        }
    })

    return rowdata


     function sortMakers (base: MakerType[], source: MakerType[], attr: any , value:string[] ) {
        let flow:any = [ ]
        let sorted: any = [ [], [], []]

        // -- 
        value.forEach (val => { 
            // -- Items IN source && IN query -- // 
            let items= [...source].filter ((m:MakerType) => m[attr as keyof MakerType].includes (val) )//
            flow.push (items)
        })
        flow = [...new Set ( flow.flat() )]

        // -- Items IN source but NOT query 
        let selected = source.filter (sm => !flow.some((m:any) => m.id == sm.id) )
        // -- Items NOT in source 
        let notselected = base.filter (maker =>  !source.some ((source:any) => maker.id == source.id))

        sorted[0] = flow; 
        sorted[1] = selected;
        sorted[2] = notselected ;

        return sorted;
    }
}

// -- populateRowData 
function populateRowData (row: RowType) { 
      let sourcedata = row.id === 0 ? base_makers : rowsDataset[row.id-1].makers;
//      // if row = 0 filter from all makers - otherwise filter from previous makers... 
//      // if row.query = * then return [ ].. else filter makers 
//      // if query = '*' - then makers is blank.. otherwise 'filter the makers '
     
      //console.log ('source data ', sourcedata);
      //console.log ('row query value ', row.query.value)

    let filterdata: MakerType[];
    // if query = '*' - then makers is blank.. otherwise 'filter the makers '
    if (row.query.value.length === 1 && row.query.value[0] === '*') {
      filterdata = [];
    } else {
      filterdata = filterMakers(sourcedata, row.query.att, row.query.value);
    }


    // let filterdata = row.query.value === ['*'] ? [ ]  : filterMakers (sourcedata, row.query.att, row.query.value);
    // let filterdata = filterMakers (sourcedata, row.query.att, row.query.value);
    // console.log ("filter data = ", filterdata)
    row.makers.push (...filterdata)


    function filterMakers (source: MakerType[], attr: any , value:string[]) {
        //console.log ('attribute = ', attr, 'value = ', value)
        let filter = source.filter ((m:MakerType) => m[attr as keyof MakerType].includes (value[0]) == true )// * improve this *
        return filter; 
    }

 }

 // add more to the populate row data set - and export each as a set of data -- // 


// export stuff -- 
//console.log ('base makers = ', base_makers)
export {base_makers}  // base set of makers 
export {social_Clusters}
export {rowsDataset} ;// sorted rows 








