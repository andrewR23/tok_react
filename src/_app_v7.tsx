"use client"
import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { select } from 'd3-selection';

import { MakerType, LinkType, ClusterType, AttributeType} from './_datatypes'
import { QueryType, RowType } from './_datatypes'

// data 
import { base_makers } from './_datatypes'; 
import { social_Clusters } from './_datatypes'; // sorted by links
import { rowsDataset } from './_datatypes'; 

// gui
import Slider from '@mui/material/Slider';
import Button from '@mui/material/Button';
// import Tooltip from '@mui/material/Tooltip';
// import { Tooltip, Typography } from '@mui/material';

// styles
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { grey } from '@mui/material/colors';
import { blueGrey } from '@mui/material/colors';

import './styles.css'; // Import  custom CSS file

// this is a changedd

// components 
import SocialCluster from './_forceGraph' ; // -- forceGraph js
import BlockGroup from './_blocks' ; // -- horizontal bar js 
import Paths from './_paths2'
import MakerTable from './MakerTable'
import Tooltip from './_tooltip';
import FilterForm from './_filterform';
import QueryString from './_querystring';


// functions  -- // 
import {sortRows, addRow}  from './_datatypes'; 
//

const guitheme = createTheme({
  palette: {
    primary: { main: blueGrey[200]},
    secondary: {main: '#11cb5f'},
  },
});


const App: React.FC = () => {
    const allmakers: MakerType[] = [...base_makers];                    // unchanged base  // 

    const [makersFilter, setMakersFilter] = useState ([...base_makers]) // the makers filtered by attribute (only)
    const [makers, setMakers] = useState ([...base_makers]);            // the selection of makers to (current) 
    // -- 
    const [socialGroups, setSocialGroups] = useState (social_Clusters); // all base makers grouped (query>)
    const [rowData, setRowData] = useState (rowsDataset)

    const [dateRange, setDateRange] =   useState([1600 , 1950]); // range value -- //

    // --
    const [pathData, setPathData] = useState([]) // single path 
    const [pathDataList, setPathDataList] = useState([]) // list of paths 
    const [offsets, setOffsets] = useState([])

    const [nodeLocs, setNodeLocs] = useState([])

    
    // -- 
    const [layout, setLayout] = useState ('linear'); // set state for layout

    // -- get the total of makers selected and shared (flow) from the query 
    // const [selectedMakers, setSelectedMakers] = useState<any[]>(rowData[0].makers)
    // const [flowMakers, setFlowMakers] = useState<any[]>(rowData[rowData.length-1].makers)
    // combine flow and selected as array -- // 

    const [flowSelected, setFlowSelected] = useState<any[]> ([rowData[rowData.length-1].makers, rowData[0].makers])

    const [queryString, setQueryString] = useState("<set query string>")

    // -- UI -- 
    const [tooltip, setTooltip] = useState({ show:false, x:0, y:0, content:'...' });

    const [baseY, setBaseY] = useState(0)
    
   // let barSpace = 400;// gap between bars  -- the MAX bar space 
    const [barSpace, setBarSpace] = useState(800)

    let barWidth = 2500;

    // const [dragStart, setDragStart] = useState(null);

    let dragStartRef = useRef (null)
    let dragYRef = useRef (0)
    const [dragY, setDragY] = useState(0);
    const [scrollY, setScrollY] = useState(0);


    useEffect ( ()=> { 
         // -- update rows to start with -- //
        let updatedRowItems = updateRows( [...rowData]);
        setRowData (updatedRowItems)
        setQueryString (extractQueryString( ))

    }, [])


    useEffect (( ) => { 
            let updatedGroups = filterSocialGroups( )
            setSocialGroups(updatedGroups);

            let updatedRowItems = updateRows( [...rowData]); 
            setRowData (updatedRowItems)

  

    }, [makers])

    // -- update the makers (filtered by attribute) -- //
    useEffect (( ) => { 
            //console.log ('filtered makers = ', makersFilter)
            //console.log ('current makers = ', makers)
            // 
            //setMakers (makersFilter)
            setMakers (filterByDateRange (dateRange)); // filter makers by date

    }, [makersFilter])

    
    useEffect (( ) => { 
            //console.log ("updated social groups")
            // -- update makers -- //
            let updatedRowItems = updateRows( [...rowData]); 
            setRowData (updatedRowItems)

    }, [socialGroups])

    useEffect (() => { 
        //console.log ('row data is updated ')
        console.log ("new row data = ", rowData)
        // 150 is the base for the alluvial 
        setBaseY (((rowData[rowData.length-1].yspacing + 450) * 0.3 )* 2)
        setQueryString (extractQueryString( ))

    }, [rowData])

    useEffect( ()=> { 
        console.log ("drag Y ", dragY)
    }, [dragY])


    useEffect(() => { 
        let rowTemp = [...rowData]; 

        //console.log ('barspace = ', barSpace)
        // update distances ... // 
        let rowDistances = [ ];
        for (let i=1; i<rowTemp.length; i++) { 
            let d = rowTemp[i].yspacing - rowTemp[i-1].yspacing;
            if (d > 100) d = barSpace; 
            rowDistances.push (d)
        }

        // apply distances 
        for (let i=1; i<rowTemp.length; i++) { 
             rowTemp[i].yspacing  = rowTemp[i-1].yspacing + rowDistances[i-1];
        }

        updateRows(rowTemp);
        setRowData (rowTemp)


    }, [barSpace])



    // -- extract query from row data -- // 

    function extractQueryString ( ) { 
        // show data string -- // 
        let string = ""
         rowData.forEach (row => {  
            let atts   = row.query.att
            let values = row.query.value.join (',')
            let result = atts  + '=' + values
            string += result+'&';
         })

        return string;

    }


    // -- slider change 
    const handleSliderChange = (event: Event, range: number | number[]) => {
        if (Array.isArray(range)) {
            setDateRange(range);
            //setMakers (filterByDateRange (range)); // filter makers by date
            
            // - filter by attribute 
            // setMakers (filterMakersByAttribute('guilds', '_none', false)); // filter makers by attribute
            // setMakers (filterMakersByAttribute('towns', 'London', false)); // filter makers by attribute
        } 
    };
    
    // -- slider end  
    const handleSliderEnd = (event: Event | React.SyntheticEvent<Element, Event>, range: number | number[]) => {
        if (Array.isArray(range)) {
            setDateRange(range);
            setMakers (filterByDateRange (range)); // fi
            
            let updatedGroups = filterSocialGroups( )
            setSocialGroups(updatedGroups);
            
            // -- update sorted makers in each row group 
            let updatedRowItems = updateRows( [...rowData]);
            setRowData (updatedRowItems)
    
        }

    }

    function handleFilterReset ( ) { 
            //console.log ("filter reset")
            setMakersFilter (allmakers)
    }


    // -- handle filter form -- .
    const handleFilterChange = (type: any, value: any) => {
            //console.log ("handle filter change")
            //console.log ('type = ', type , ' value = ', value)
            //console.log ('makers = ', makers)
            // -- FILTER the FILTERED makers -- // 
            const filteredMakers = filterMakersByAttribute(type, value, false);
            // update the base filtered makers -- // 
            setMakersFilter (filteredMakers)

    }

    // -- call to update the groups of selected makers -  (UPDATE )
    function updateRows (data : any) {
            let updatedRow = data; // [...rowData]; // create a copy of the rowData.

            updatedRow.forEach ((row:any, i:number)  => { 
                //console.log ('i =', i)
                //console.log ('row = ', row)
                let updatedMakerGroups = [...row.makers_group]; 
                updatedMakerGroups = updateNodes(updatedMakerGroups)
                //updatedMakerGroups = updateSorted(updatedMakerGroups, [...rowData[i].makers_sorted])
                updatedMakerGroups = updateSorted(updatedMakerGroups, row.makers_sorted); // [...rowData[i].makers_sorted])
                updatedRow[i].makers_group = updatedMakerGroups;
 

            })

            // -- update flow & selected makers -- // 
            setFlowSelected ([rowData[rowData.length-1].makers_sorted[0], rowData[0].makers_sorted[0]])


            return updatedRow

            function updateNodes (grouplist: any){ 
                // update the nodes in each group
                const updateItems = grouplist.map((group:any) => {
                        const subSelection = makers.filter((m:any) => [...group.nodes_base].includes(m));
                        const diff = {
                          toRemove: group.nodes.filter((m:any) => !subSelection.includes(m)),
                          toAdd: subSelection.filter((maker) => !group.nodes.includes(maker)),
                        };
                        const filteredNodes = group.nodes.filter((m:any) => !diff.toRemove.includes(m));
                        const updatedNodes = [...filteredNodes, ...diff.toAdd];
                        return { ...group, nodes: updatedNodes };
                });

                return updateItems;

            }

            function updateSorted ( groupToSort: any, rowSorted: any){ 
                const updateItems = groupToSort.map ((group:any) => { 
                    let groupIDs = group.nodes.map ((d: any) => d.id)
                    let updatedNodesSorted = [ [], [], []]

                    updatedNodesSorted[0] = rowSorted[0].filter ((m:any) => groupIDs.includes(m.id))
                    updatedNodesSorted[1] = rowSorted[1].filter ((m:any) => groupIDs.includes(m.id))
                    updatedNodesSorted[2] = rowSorted[2].filter ((m:any) => groupIDs.includes(m.id))


                    return { ...group, nodes_sorted:updatedNodesSorted }; // return the updated group in the return array 


                })

                return updateItems

            }
  
    }

    // -- filter maker list -by date range --
    function filterByDateRange (range: number[]) {
       // -- conditions -- //
       let lessThan = (a:number, b:number) => a < b;
       let greaterThan = (a:number, b:number) => a > b; 
       let equalTo = (a:number, b:number) => a == b; 
       let isBetween = (a:number, b:number, c:number) => a > b && a < c; 
       // -- filter makers and return -- // 
       //let  filteredmakers : MakerType[] = allmakers.filter (m =>  isBetween (m.date_1, range[0], range[1]));
       let  filteredmakers : MakerType[] = makersFilter.filter (m =>  isBetween (m.date_1, range[0], range[1]));

       return filteredmakers;
     }

    // -- 
    function filterMakersByAttribute (att: keyof MakerType, val: string, bool_: any ) { 
        // filter attributes -e.g. guild != none..... // makers / allmaker
        // filter the 'filtered makers attribute -- // '
        let  filteredmakers : MakerType[] = makersFilter.filter (m =>  { 
            return m[att].includes (val) === bool_;
        });

        return filteredmakers;
    }

    // -- filter social group by size 
    function filterSocialGroupBySize ( ) { 
        // remove makers who are in a social group of a certain size 

    }

    // filterGroupBySize -- filterSocialBySize
    function filterGroupBySize (min:number, max:number ) { 
        // remove groups that are bigger than a certan size -- 
        let updatedGroups = socialGroups.filter (d => d.nodes.length > min && d.nodes.length < max)
        setSocialGroups (updatedGroups)

        // also have to remove / update makers list ? 

     }


    // -- 
    function filterSocialGroups() {
        // -- add or remove items into each cluster -- //
        const updatedGroups = socialGroups.map((group) => {
            const subSelection = makers.filter((m) => [...group.nodes_base].includes(m));
            const diff = {
              toRemove: group.nodes.filter((m) => !subSelection.includes(m)),
              toAdd: subSelection.filter((maker) => !group.nodes.includes(maker)),
            };
            const filteredNodes = group.nodes.filter((m) => !diff.toRemove.includes(m));
            const updatedNodes = [...filteredNodes, ...diff.toAdd];

            // -- SORT n into  -- // 
            const sortedNodes: any= [[], [], []]
            //sortedNodes[0] = group.nodes.filter ((m)=> flowMakers.includes (m))
            //sortedNodes[1] = group.nodes.filter ((m)=> selectedMakers.includes (m))

            // -- find links whose source AND target are both in updatedNodes -- // 
            const filteredLinks = group.links_base.filter ((link: LinkType) => { 
                //updatedNodes.includes ((link.source:MakerType))  && updatedNodes.includes (link.target)
                if (typeof link.source === 'number' && typeof link.target === 'number') {
                    //return updatedNodes.includes(link.source) && updatedNodes.includes(link.target);
                }
                // Check if link.source and link.target are MakerType instances
                if (
                    typeof link.source === 'object' && link.source !== null &&
                    typeof link.target === 'object' && link.target !== null
                ) {
                    return updatedNodes.includes(link.source) && updatedNodes.includes(link.target);
                }
                return false; // Default case: not included
            }); 
            //console.log ('links base = ', group.links)
            //return { ...group, nodes: updatedNodes, links: filteredLinks};
            return { ...group, nodes:updatedNodes, nodes_sorted:sortedNodes} ; //, links: filteredLinks};

        });
        // console.log ('updatedgroupsocial ******* ', updatedGroups)
        return updatedGroups;
    }

    //-- 



    function filterNodesFromRowData(id:number) {
     // console.log ("fiter groups from row data ")
      const groups = rowData[id].makers_group; //  key === 'guilds' ? guildGroups : townGroups;

        const updatedGroups = groups.map((group) => {
            const subSelection = makers.filter((m) => [...group.nodes_base].includes(m));
            const diff = {
              toRemove: group.nodes.filter((m) => !subSelection.includes(m)),
              toAdd: subSelection.filter((maker) => !group.nodes.includes(maker)),
            };
            const filteredNodes = group.nodes.filter((m) => !diff.toRemove.includes(m));
            const updatedNodes = [...filteredNodes, ...diff.toAdd];
            return { ...group, nodes: updatedNodes };
        });

      //console.log ('updated groups ', updatedGroups)

      return updatedGroups
    }

    // -- using 'any' as temp -- // 
    let barItems:any = [ ]; // -- an array of bar elements - used to generate links -- // 
    let barOffs:any = [ ]; // -- array of offsets 

    /// -- create paths between bars -- 
    function handleBarData (locs:any, sublocs:any, data:any, i:number, widths:any, rowSelection:any) { 

        let bar  = { index:i, data:data,  locs:locs, sublocs:sublocs, widths:widths, rowSelection:rowSelection}
        barItems[i] = bar;
        //  -- use bar to generate flows to makers from the bottom bar 
         
        // console.log ('no. of rows = ', rowData.length)
        // get flow from the base bar -- // 
        if (barItems.length == rowData.length) generateFlowList (barItems[rowData.length-1])

        // // when we have more than one bar: generate links... 
        if (barItems.length>1) {
            // // ------- // 
            let linkList: any = generateLinkList( )
            setPathDataList (linkList)
            //console.log ('link data (list) ', linkList)


        }


    }


    // -- render links -- //
    function renderPathComponents ( ) { 
        //console.log ('render paths! ', pathDataList)
        return pathDataList.map((pathdata, index) => {
              return   (<Paths key={index} data={pathdata} index={index} 
                            handlePathRoll={handlePathRoll}
                            handleRollOut={handleRollOut}
                            />)
        })
    }


    function calcRowWidths (data: any) { 
        //console.log ("no. of makers = ", allmakers.length) // 100%
        //console.log ("base makers = ", makers.length) // %
        let orgWidth  = barWidth; // svgWidth / scale 
        let totalWidth = (makers.length/allmakers.length * orgWidth + 200);//+ Math.random ()*1000;
        let widths  = [...data].map (d => d.nodes.length); 

        const sumValue = widths.reduce((acc, curr) => acc + curr, 0);

        // widths area percentage of total width 
        widths = widths.map (d => { 
               return Math.ceil (d / sumValue * totalWidth)  ; 
        })
        return  widths;
    }

    // -------------------------- // 
    function renderBarComponents( ) { 
        //console.log ("render row...  data   = ", rowData)
        if (rowData !== null  ) {
            return rowData.map((row:any, i:number) => {
                //sconsole.log ("bar source = ", row)
                let attribute = row.query.att; 
                let values = row.query.value.join (' ')
                let sourceData =  row.makers_group; /// barGroups[i];
                let rowInfo = {title: attribute, values: values};
                let rowSelection = { att: attribute, values: values }
                //console.log ('row info = ', rowInfo)
                let y = row.yspacing; /// i* barSpace; //row.yspacing;//row.yspacing;

                // calc widths for each row.. 
                let widths = calcRowWidths(sourceData)
                //console.log ("row widths = ", widths)

                return (<BlockGroup key={i} data={sourceData} widths={widths} ypos={y} index={i} 
                                    rowinfo={rowInfo}
                                    rowSelection = {rowSelection}
                                    handleBarData={handleBarData} 
                                    handleBlockSelection={handleBlockSelection}
                                    handleBlockRoll={handleBlockRoll}
                                    handleRollOut={handleRollOut}
                                    removeRow={handleRemoveRow}
                                    handleUIClick={handleUIClick}
                                    />)
            })
        } else { 
            return (<g/>) 
        }

       //return (<g/>) 

    }

    // -- generate an ARRAY of links -- //
    function generateLinkList( ) { 
        // 
        let linkList = [ ];
        //console.log ("bar items : ", barItems)
        if (barItems.length>1) { 

            for (let n=0; n<barItems.length-1; n++) { 
                // start at item 0 -- //
                // get all the makers from each nodes 
                let thisBar = barItems[n].data.map ((d:any) => d.nodes) ; // group of makers in bar
                let nextBar = barItems[n+1].data.map ((d:any) => d.nodes) ; // group of makers 

                //console.log ("this is the BAR DATA... ", barItems[n]); // 
                let links: any= [ ];

                thisBar.forEach ((makers:any, i:number) => { 
                    // --  group block of makers in a bar-- // 
                   let sourceGroup = i
                   let sourceName = barItems[n].data[i].name
                   let sourceValue = barItems[n].data[i].value
                   let sourceLoc = barItems[n].locs[i]

                   //console.log ('group ', i , ' name ', sourceName, ' loc: ', sourceLoc )
                   makers.forEach ((maker:any) => { 
                        // -- FIND MAKER(S) in GROUPS the NEXT BAR 
                        const groupsContainingMaker = nextBar.filter((group:any) => group.some((node:any) => node.id === maker.id));
   
                        groupsContainingMaker.forEach ( (group: any) => { 
                            // console.log("Maker is in group", groupIndex, "in makerGrp1");
                            const targetIndex = nextBar.indexOf(group)
                            let targetName = barItems[n+1].data[targetIndex].name;
                            let targetValue = barItems[n+1].data[targetIndex].value;
                            let targetLoc = barItems[n+1].locs[targetIndex];
                                        
                             let sourceSortedGrp: any = null; 
                             let targetSortedGrp: any = null;

                            // -- search source sorted -- 
                            for (let i=0; i < barItems[n].data[sourceGroup].nodes_sorted.length; i++) {
                                  if ( barItems[n].data[sourceGroup].nodes_sorted[i].includes(maker)) {
                                      // console.log ('source group found = ', i)
                                      sourceSortedGrp = i;

                                      // add the amount of makers to this source group -- do this AFTER sorting into links.
                                      //console.log ('barcount 0 a =  ', barCounts[0] [0] [1])
                                      break;
                                  }
                              }

                            // -- get the target 'sorted' group...
                            for (let i=0; i < barItems[n+1].data[targetIndex].nodes_sorted.length; i++) {
                                  if ( barItems[n+1].data[targetIndex].nodes_sorted[i].includes(maker)) {
                                      //console.log ('targetGroup group found = ', i);
                                      targetSortedGrp = i;
                                      break;
                                  }
                              }


                            // console.log ("from : ", sourceName, ' to:  ', targetName) // ALSO CHECK FOR THE SORTED GROUP 
                            let existingLink = links.find((link:any) => {
                                //console.log ('link = ', link)
                                return  link.sourceGrp === sourceGroup && 
                                        link.targetGrp === targetIndex && 
                                        link.sourceGrp_sorted === sourceSortedGrp &&
                                        link.targetGrp_sorted === targetSortedGrp

                            });

                            //existingLink = false;
                            // --------------------------------- // 
                            if (existingLink) {
                                    // -- add to existing link object -- 
                                    existingLink.makers.push(maker); // add to makers 
                                    existingLink.count ++;   // add to count 
                            } else { 
                                // -- initialize new link object (count = 1, makers = [maker])
                                let linkObject = {
                                      // -- source ids
                                      sourceGrp:sourceGroup, 
                                      sourceGrp_sorted:  sourceSortedGrp, // 1
                                      // -- target ids 
                                      targetGrp:targetIndex,
                                      targetGrp_sorted:   targetSortedGrp, // 1
                                      // -- source locs 
                                      //sourceLoc: sourceLoc,
                                      sourceLoc: barItems[n].locs[sourceGroup],
                                      sourceLocSorted: barItems[n].sublocs[sourceGroup], //[sourceSortedGrp],
                                      // -- target locs 
                                      //targetLoc: targetLoc,
                                      targetLoc: barItems[n+1].locs[targetIndex],
                                      targetLocSorted: barItems[n+1].sublocs[targetIndex], //[targetSortedGrp], // this needs to change !!!!!
                                      
                                       // - bar width 
                                      sourceWidth: barItems[n].widths[sourceGroup],
                                      targetWidth: barItems[n+1].widths[targetIndex],
                                      // -- total makers
                                      sourceAllMakers: barItems[n].data[sourceGroup].nodes.length,
                                      targetAllMakers: barItems[n+1].data[targetIndex].nodes.length,

                                      // -- data 
                                      makers:[maker], 
                                      count: 1, // if this is the first one

                                      // -- get the selected values of the rows and the path-- 
                                      // rowFrom:  { id: n, values: barItems[n].rowSelection.values},
                                      // rowTo:    { id: n, values: barItems[n].rowSelection.values},
                                      rowValues:  { from : barItems[n].rowSelection.values,  to: barItems[n+1].rowSelection.values },
                                      pathValues: { from: sourceValue, to: targetValue}


                                    }
                                links.push (linkObject)
   

                            }
                       // we are not lookig for the target sarray but the 

                        })


                   })


                })
        
              linkList.push(links)

            }// -- end of for loop 

            //console.log ('links = ', linkList)
            let filteredLinks = linkList[0].filter((link:any) => link.targetGrp_sorted == 0);
            //console.log ('filtered links sourceGrp: ', filteredLinks.map (d => d.sourceGrp))
            //console.log ('filtered links target group: ', filteredLinks.map (d => d.targetGrp))
            //console.log ('filtered links makers: ',    filteredLinks.map (d => d.makers.map (maker => maker.id)))
            return linkList

        }

        //  } // -- end of for loop -- // 

    }

    // -- links are the path links between items -- // 

    // -- click on a sub item in the bar -- //
    function handleBlockSelection (barIndex:number, groupIndex:number,  itemIndex:number, selection:any[]) { 
         console.log ("CLICK THE BAR.....", barIndex, " ", groupIndex, " ", itemIndex)

        // limit to group 0 or 1 

         if (itemIndex != 2) { 


                let rowTemp = [...rowData]
                let selectedValue = rowData[barIndex].makers_group[groupIndex].value
                let valueArray = rowTemp[barIndex].query.value;
                // console.log ("current query = ", valueArray.length)

                // push value to array or remove
                if (!valueArray.includes (selectedValue)) { 
                    valueArray.push(selectedValue); // add to query value array 
                } else { 
                    // remove 
                    //console.log ("REMOVE ... !! ")
                    rowTemp[barIndex].query.value = valueArray.filter (val => val != selectedValue) 
                    // and remove all other querys below - 
                    if (rowTemp[barIndex].query.value.length <= 1) {
                        for (let i=barIndex+1; i<rowTemp.length; i++) { 
                            // remove other query elements below ... to remove 
                            rowTemp[i].query.value = [""]
                            //console.log ('other query to remove ....', rowTemp[i].query.value)
                        }
                    }
                }

                rowTemp = sortRows(rowTemp) ;               // update rows selection (in data )
                let updatedRowItems = updateRows(rowTemp); // update the groups in the rows 
                
                // update y pos of row -- 
                let updatedValueArray = rowTemp[barIndex].query.value; 
                // console.log ("updated rows : ", updatedRowItems);
                // console.log ("updated query : ", updatedValueArray.length)      
                // the query starts with an empty string ("")
                if (barIndex < rowTemp.length-1) {

                    if (updatedValueArray.length == 2) { 
                        // -- updatedRowItems[barIndex+1].yspacing = updatedRowItems[barIndex].yspacing + 900;
                        // -- get the next bars down in turn : and move them 
                        for (let i=barIndex; i<updatedRowItems.length-1; i++)  { 
                            let nextbar = updatedRowItems[i+1];
                            let thisbar = updatedRowItems[i];
                            let y; 
                            if (i-barIndex == 0)  y = barSpace; 
                            if (i-barIndex >= 1)  y = 100; 
                            //y = (i- barIndex === 0) ? 900 : (i) - barIndex >=0) ? 100 : undefined;
                            nextbar.yspacing = thisbar.yspacing + y;
                        }
                    }

                    if (updatedValueArray.length == 1) { 
                        //updatedRowItems[barIndex+1].yspacing = updatedRowItems[barIndex].yspacing + 100


                        for (let i=barIndex; i<updatedRowItems.length-1; i++)  { 
                            let nextbar = updatedRowItems[i+1];
                            let thisbar = updatedRowItems[i];
                            let y; 
                            if (i-barIndex == 0)  y = 100; 
                            if (i-barIndex >= 1)  y = 100; 
                            //y = (i- barIndex === 0) ? 900 : (i) - barIndex >=0) ? 100 : undefined;
                            nextbar.yspacing = thisbar.yspacing + y;
                        }

                    }
                }   

                // get clicked bar.. 
                setRowData (updatedRowItems)
                setQueryString (extractQueryString( ))

            }

    }

    // -- roll over sub item
    function handleBlockRoll (barIndex:number, groupIndex:number, subIndex:number, event:MouseEvent) { 
        //console.log ('blockRoll: ', barIndex, ' ', groupIndex, ' ', subIndex)
        // ---------------------- // 
        // test values -- // 
        let makersInGrpRed = rowData[barIndex].makers_group[groupIndex].nodes_sorted[0];
        let makersInGrpYellow = rowData[barIndex].makers_group[groupIndex].nodes_sorted[1];
        let makersInGrpGray= rowData[barIndex].makers_group[groupIndex].nodes_sorted[2];


        makersInGrpYellow.sort((a, b) => a.id - b.id);
        makersInGrpRed.sort((a, b) => a.id - b.id);
        makersInGrpGray.sort((a, b) => a.id - b.id);


        //console.log ('row item:  ', rowData[barIndex].makers_group[groupIndex])
        //console.log ("red : ", makersInGrpRed.map (d => d.id))
        //console.log ("blue: ", makersInGrpYellow.map (d => d.id))
        //console.log ("gray: ", makersInGrpGray.map (d => d.id))


        // ---------------------- // 

        let name = rowData[barIndex].makers_group[groupIndex].name;
        let val =  rowData[barIndex].makers_group[groupIndex].value

        const mouseX = event.clientX;
        const mouseY = event.clientY + window.scrollY;
        //console.log (name, ' :  ', val, ' ', mouseX)
        setTooltip({ show: true, x : mouseX+30, y: mouseY+10, content: `${val}` });
    }
    // --------- 
    function handleRollOut ( ) { 
        //console.log (" ROLL OUT ")
        setTooltip({ show: false, x : 0, y: 0, content: `` });
    }

    function handlePathRoll (data:any, path:any, event: MouseEvent) { 
        //console.log ("rollover path ", data, '  ', path);

        if (path.pathType != 12)  {
            const ids = data.makers.map ((d:any) => d.id)
            const mouseX = event.clientX;
            const mouseY = event.clientY + window.scrollY;
            setTooltip({ show: true, x : mouseX+30, y: mouseY+10, content: `${ids}` });
        }

    }

    function handleNodeRoll (id:any, event:MouseEvent ) { 
        // console 
        const mouseX = event.clientX;
        const mouseY = event.clientY + window.scrollY;
        //console.log ("roll over maker", id, ' ', mouseX, ' ', mouseY)
        let maker  = returnmakefromid(id)
        //console.log ("maker ", maker)
        setTooltip({ show: true, x : mouseX+30, y: mouseY+10, content: `: ${maker[0].name}` });


    }

    function returnmakefromid( id: number) { 
        let m = makers.filter(m => m.id == id)
        return m; 
     }

    // --- add row -- // 
    function handleAddRow (value: any) { 
        //console.log ('handle add row', rowData)

        //console.log ('current rows ', rowData )
        let updatedRow  = addRow ([...rowData], value)

        // add a new row - set spacing to previous y pos
        // has the previous row got any s
        let valCount= updatedRow[rowData.length-1].query.value.length;
        
        //let yspace = 900; 
        let yspace = valCount >= 2 ? barSpace  : 100;
        updatedRow[rowData.length].yspacing = updatedRow[rowData.length-1].yspacing + yspace;


        //console.log ('updated rows new = ', updatedRow)
        let updatedRows2 = updateRows( updatedRow);
        
        //setBaseY (baseY+barSpace*.3)
        setRowData (updatedRows2)
    }


    // --- remove row -- // 
    function handleRemoveRow( ) { 
        //console.log ("this is remove row...", rowData)
        //let updatedRows = [...rowData].pop()
        let updatedRows = [...rowData].slice(0, -1);
        //console.log ('removed rows = ', updatedRows)
        setRowData (updatedRows)
    }

    // -- get links between bar and makers (in social group) => on Hold.. 
    function generateFlowList (bar: any ) { 
        //console.log ("generate flow links from bar : ", bar)
        //console.log ('get the positon of makers ?? ')
        // get the makers in subsection [0] (red)
        // 1. get the flow makers in the 
        // get the ids of selected makers.. // 
        // see the locs in the bottom bar.. in the groups 

    }

    function handleLocations (locs: any) {
        setNodeLocs (locs);

    }

    function drawPaths ( ) { 

    }

    function updateRowDist (amt: any) { 
        let newspace = barSpace + amt 
        setBarSpace (newspace)
    }

    function handleUIClick (name: any, id: number, data: any ) { 
        let rowTemp = [...rowData]; 

        // -- save current distances between rows -- // 
        let rowDistances = [ ];
        for (let i=1; i<rowTemp.length; i++) { 
            let d = rowTemp[i].yspacing - rowTemp[i-1].yspacing;
            rowDistances.push (d)
        }

        // -- expand -- // 
        if (name == 'buttonExpand') {
            // -- update distances -- one down 
            rowTemp[id+1].yspacing = rowTemp[id].yspacing + barSpace; // rowTemp[id-1].yspacing + 1000; 
            // -- other following -- two down - use saved distances -- // 
            for (let i = id+2; i<rowTemp.length; i++) { 
                rowTemp[i].yspacing = rowTemp[i-1].yspacing + rowDistances[i-1]
            }

        }

        // -- contract -- //
        if (name == 'buttonHide') {
            // -- update distances -- one down 
            rowTemp[id+1].yspacing = rowTemp[id].yspacing + 100; // rowTemp[id-1].yspacing + 1000; 
            // -- other following -- two down - use saved distances -- // 
            for (let i = id+2; i<rowTemp.length; i++) { 
                rowTemp[i].yspacing = rowTemp[i-1].yspacing + rowDistances[i-1]
            }
        } 

        updateRows(rowTemp);
        setRowData (rowTemp)

    }

    // -- DRAG EVENTS -- // 
const handleMouseDown = (e:any) => {
    //console.log ("mouse down", e.clientY)
    dragStartRef.current = e.clientY
    //setDragStart(e.clientY);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
};

const handleMouseMove = (e:any) => {
    //console.log ('mouse move', dragStartRef.current)
    if (dragStartRef.current !== null) {
         const deltaY = e.clientY - dragStartRef.current;
         const dragYTemp = dragY + deltaY

               const clampedDrag = Math.max(-1000, Math.min(0, dragYTemp));
           setDragY(clampedDrag);
         }
    };

const handleMouseUp = () => {
        dragStartRef.current = null
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
};

const handleWheel = (e:any) => {
    // Check if the event is from a two-finger scroll (e.g., on a touchpad)
    if (e.nativeEvent.ctrlKey) {
      // Extract the scroll movement
      const deltaY = e.deltaY;
      
      // Adjust the scroll position
      setScrollY((prevScrollY) => prevScrollY + deltaY);
      //console.log ("handle wheel")
      
      // Prevent the default scroll behavior
      //e.preventDefault();
    }
  };



  return (
    <div>
      <div>Ver_05_12</div>  
       <ThemeProvider theme={guitheme}>
           <div className="slider-container">
                <Slider
                      size="small"
                      value={dateRange}
                      onChange={handleSliderChange}
                      onChangeCommitted={handleSliderEnd}
                      getAriaLabel={() => 'date range'}
                      min={1600}
                      max={1950}
                      step={1}
                      valueLabelDisplay="on"
                />
            </div>

            <div className="form-container"> 
                <FilterForm onFilterChange={handleFilterChange} onFilterReset={handleFilterReset}
                            onFilterGroups={filterGroupBySize} onAddRow={handleAddRow} />
                <Button variant="text" onClick={() => setLayout('force')}>force</Button> 
                <Button variant="text" onClick={() => setLayout('linear')}>linear</Button> 
                <Button variant="text" onClick={() => setLayout('grid')}>grid</Button> 
                <Button variant="text" onClick={() => updateRowDist(100 )}>[+]</Button> 
                <Button variant="text" onClick={() => updateRowDist(-100 )}>[-]</Button> 


            </div>


             <svg  
                onMouseDown={handleMouseDown} 
                onWheel={handleWheel}
                // style={{ cursor: 'grab', userSelect: 'none' }}
                width="1500" 
                height="700"
             >
                   <rect width="100%" height="100%" fill="OldLace" />
                {/*<QueryString querystring = {queryString}/>*/}

                {/*Bar and Paths */}
                <g transform ={`translate(${150}, ${40+dragY}) scale(${.33})`}>
                    {renderPathComponents()}
                    {renderBarComponents()}
                </g>
                {/*Force Graph  */}
                <g transform={`translate(${100}, ${dragY}) scale(${.5})`}>
                    <SocialCluster 
                        nodes={socialGroups} 
                        layout={layout} 
                        baseY={baseY}
                        daterange={dateRange} 
                        flowselected={flowSelected} 
                        handleLocations={handleLocations} 
                        handleNodeRoll={handleNodeRoll} 
                        handleRollOut={handleRollOut}
                        />
                </g>
             </svg>
             
             <div>         
                 <MakerTable flowselected={flowSelected}></MakerTable>
            </div>

            {tooltip.show && <Tooltip x={tooltip.x} y={tooltip.y} content={tooltip.content} />}

       </ThemeProvider>

    </div>
  );
};

export default App;