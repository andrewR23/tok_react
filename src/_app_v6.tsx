import React, { useEffect, useRef, useState } from 'react';

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

// components 
import SocialCluster from './_forceGraph' ; // -- forceGraph js
import BlockGroup from './_blocks' ; // -- horizontal bar js 
import Paths from './_paths'
import MakerTable from './MakerTable'
import Tooltip from './_tooltip';
import FilterForm from './_filterform';
import QueryString from './_querystring';


// functions  -- // 
import {sortRows}  from './_datatypes'; 



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
    
    // -- 
    const [layout, setLayout] = useState ('linear'); // set state for layout

    // -- get the total of makers selected and shared (flow) from the query 
    const [selectedMakers, setSelectedMakers] = useState<any[]>(rowData[0].makers)
    const [flowMakers, setFlowMakers] = useState<any[]>(rowData[rowData.length-1].makers)
    // combine flow and selected as array -- // 

    const [flowSelected, setFlowSelected] = useState<any[]> ([rowData[rowData.length-1].makers, rowData[0].makers])
    const [queryString, setQueryString] = useState("<set query string>")

    // -- UI -- 
    const [tooltip, setTooltip] = useState({ show:false, x:0, y:0, content:'...' });


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
            console.log ("updated social groups")
            // -- update makers -- //
            let updatedRowItems = updateRows( [...rowData]); 
            setRowData (updatedRowItems)

    }, [socialGroups])



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

            // setDateRange(range);
            // setMakers (filterByDateRange (range)); // filter makers by date
            // setMakers (filterMakersByAttribute('towns', 'London', true)); // filter makers by attribute

            
            let updatedGroups = filterSocialGroups( )
            setSocialGroups(updatedGroups);
            
            // -- update sorted makers in each row group 
            let updatedRowItems = updateRows( [...rowData]);
            setRowData (updatedRowItems)
    
        }

    }

    function handleFilterReset ( ) { 
        // let filtered
        //console.log ("filter reset")
        setMakersFilter (allmakers)
    }


    // -- handle filter form -- .
    const handleFilterChange = (type: any   , value: any) => {
            console.log ("handle filter change")
            console.log ('type = ', type , ' value = ', value)
            //console.log ('makers = ', makers)
            // -- FILTER the FILTERED makers -- // 
            const filteredMakers = filterMakersByAttribute(type, value, false);
            // update the base filtered makers -- // 
            setMakersFilter (filteredMakers)

            //filterGroupBySize(1, 10)
            //!!!!setMakers(filteredMakers); // this is what we used to do... //  
    }

    // -- call to update the groups of selected makers -  (UPDATE )
    function updateRows (data : any) {
            //console.log ("update the rows: the grouped makers in each row... ")
            let updatedRow = data; // [...rowData]; // create a copy of the rowData.

            // -- go through each row -- // 
            // -- update the nodes 
            // -- update the nodes_sorted 
            // -- do this based on.. the row data 

            updatedRow.forEach ((row:any, i:number)  => { 
                let updatedMakerGroups = [...row.makers_group]; 
                updatedMakerGroups = updateNodes(updatedMakerGroups)
                updatedMakerGroups = updateSorted(updatedMakerGroups, [...rowData[i].makers_sorted])
                updatedRow[i].makers_group = updatedMakerGroups;

            })


            // -- update flow & selected makers -- // 
            //setSelectedMakers (rowData[0].makers_sorted[0]) ; /// all selected in top row (top of the waterfall )
            //setFlowMakers (rowData[rowData.length-1].makers_sorted[0])  // the result of the flow in base row.. (after filter. )
            
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
    function handleBarData (locs:any, sublocs:any, data:any, i:number, widths:any) { 
        let bar  = { index:i, data:data,  locs:locs, sublocs:sublocs, widths:widths}
        barItems[i] = bar;
        // // when we have more than one bar: generate links... 
        if (barItems.length>1) {
            // // ------- // 
            let linkList: any = generateLinkList( )
            setPathDataList (linkList)
            //console.log ('link data (list) ', linkList)
        }
    }


    // -- render links -- 
    function renderPathComponents ( ) { 
        //console.log ('render paths! ', pathData)
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
        let orgWidth  = 2500; // svgWidth / scale 
        let totalWidth = (makers.length/allmakers.length * orgWidth + 200);//+ Math.random ()*1000;
        let widths  = [...data].map (d => d.nodes.length); 

        const sumValue = widths.reduce((acc, curr) => acc + curr, 0);
        widths = widths.map (d => { 
        return Math.ceil (d / sumValue * totalWidth)  ; 
        })
        return  widths;
    }


    function renderBarComponents( ) { 
        //console.log ("row data   = ", rowData)
        if (rowData !== null  ) {
            return rowData.map((row:any, i:number) => {
                let sourceData =  row.makers_group; /// barGroups[i];

                // calc widths for each row.. 
                // console.log ('row source data = ', sourceData)
                let widths = calcRowWidths(sourceData)

                return (<BlockGroup key={i} data={sourceData} widths={widths} ypos={i*450} index={i} 
                                    handleBarData={handleBarData} 
                                    handleBlockSelection={handleBlockSelection}
                                    handleBlockRoll={handleBlockRoll}
                                    handleRollOut={handleRollOut}
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
       //console.log ("generate link list ")
        let linkList = [ ];

        if (barItems.length>1) { 

            for (let n=0; n<barItems.length-1; n++) { 
                // start at item 0 -- //
                // get all the makers from each nodes 
                let thisBar = barItems[n].data.map ((d:any) => d.nodes) ; // group of makers 
                let nextBar = barItems[n+1].data.map ((d:any) => d.nodes) ; // group of makers 

                // look at bar data 

                let links: any= [ ];

                //console.log ("Maker Group 0")
                thisBar.forEach ((makers:any, i:number) => { 
                  // group block of makers in a bar-- // 
                   let sourceGroup = i
                   let sourceName = barItems[n].data[i].name
                   let sourceLoc = barItems[n].locs[i]

                   //console.log ('group ', i , ' name ', sourceName, ' loc: ', sourceLoc )
                   makers.forEach ((maker:any) => { 
                        // -- Find the group in makerGrp1 where the maker is present
                        // -- FIND MAKER in the NEXT BAR 
                        const groupContainingMaker = nextBar.find((group:any) => group.some((node:any) => node.id === maker.id));
                        //console.log ('gwm ', groupContainingMaker)
                       

                        if (groupContainingMaker) {
                            // console.log("Maker is in group", groupIndex, "in makerGrp1");
                            const targetIndex = nextBar.indexOf(groupContainingMaker);
                            const targetGroup = targetIndex;
                            let targetName = barItems[n+1].data[targetGroup].name;
                            let targetLoc = barItems[n+1].locs[targetIndex];

                            // console.log ("from : ", sourceName, ' to:  ', targetName)
                            const existingLink = links.find((link:any) => link.sourceGrp === sourceGroup && link.targetGrp === targetGroup);
     
                            //console.log ('this bar group ',  barItems[n].data[i])
                            //console.log ('next bar group ',  barItems[n+1].data[targetGroup])
                            let sourceSortedGrp = null; 
                            let targetSortedGrp = null;
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
                             for (let i=0; i < barItems[n+1].data[targetGroup].nodes_sorted.length; i++) {
                                  if ( barItems[n+1].data[targetGroup].nodes_sorted[i].includes(maker)) {
                                      //console.log ('targetGroup group found = ', i);
                                      targetSortedGrp = i;
                                      break;
                                  }
                              }

                            // -- get total makers in source and target group -- // 
                            //console.log ('source grp nodes (all) = ', barItems[n].data[sourceGroup].nodes.length)
                            //console.log ('target grp nodes (all) = ', barItems[n+1].data[targetGroup].nodes.length)


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
                                      targetGrp:targetGroup,
                                      targetGrp_sorted:   targetSortedGrp, // 1
                                      // -- source locs 
                                      //sourceLoc: sourceLoc,
                                      sourceLoc: barItems[n].locs[sourceGroup],
                                      sourceLocSorted: barItems[n].sublocs[sourceGroup], //[sourceSortedGrp],
                                      // -- target locs 
                                      //targetLoc: targetLoc,
                                      targetLoc: barItems[n+1].locs[targetGroup],
                                      targetLocSorted: barItems[n+1].sublocs[targetGroup], //[targetSortedGrp], // this needs to change !!!!!
                                       // - bar width 
                                      sourceWidth: barItems[n].widths[sourceGroup],
                                      targetWidth: barItems[n+1].widths[targetGroup],
                                      // -- total makers
                                      sourceAllMakers: barItems[n].data[sourceGroup].nodes.length,
                                      targetAllMakers: barItems[n+1].data[targetGroup].nodes.length,
                                      // -- data 
                                      makers:[maker], 
                                      count: 1
                                    }
                                links.push (linkObject)
                                //console.log (linkObject)
                                //console.log ('from : ',  barItems[n].data[sourceGroup].value)
                                //console.log ('to : ',    barItems[n+1].data[targetGroup].value)
                                //console.log ('makers : ',  linkObject.makers)
                                //console.log ('to : ',   barItems[n+1].data[targetGroup].value)
                                //console.log ('to : ',   barItems[n+1].data[targetGroup].value)




                            }
                       // we are not lookig for the target array but the 


                        } 



                   })


                })
        
              linkList.push(links)

            }// -- end of for loop 

            //console.log ('links = ', linkList)
            return linkList

        }

        //  } // -- end of for loop -- // 

    }

    // -- links are the path links between items -- // 

    // -- click on a sub item in the bar 
    function handleBlockSelection (barIndex:number, groupIndex:number,  itemIndex:number, selection:any[]) { 
        let rowTemp = [...rowData]

        let selectedValue = rowData[barIndex].makers_group[groupIndex].value
        let valueArray = rowTemp[barIndex].query.value;

        // push value to array or remove
        if (!valueArray.includes (selectedValue)) { 
            valueArray.push(selectedValue); // add to query value array 
        } else { 
            rowTemp[barIndex].query.value = valueArray.filter (val => val != selectedValue) 
        }

        rowTemp = sortRows(rowTemp) ;               // update rows selection (in data )
        let updatedRowItems = updateRows( rowTemp); // update the groups in the rows 
        
        setRowData (updatedRowItems)
        setQueryString (extractQueryString( ))

    }

    // -- roll over sub item
    function handleBlockRoll (barIndex:number, groupIndex:number, subIndex:number, event:MouseEvent) { 
        //console.log ('blockRoll: ', barIndex, ' ', groupIndex, ' ', subIndex)
        

        // ---------------------- // 
        // test values -- // 
        let makersInGrpRed = rowData[barIndex].makers_group[groupIndex].nodes_sorted[0];
        let makersInGrpYellow = rowData[barIndex].makers_group[groupIndex].nodes_sorted[1];

        makersInGrpYellow.sort((a, b) => a.id - b.id);
        makersInGrpRed.sort((a, b) => a.id - b.id);

        //console.log ('row item:  ', rowData[barIndex].makers_group[groupIndex])
        //console.log (makersInGrpYellow.map (d => d.id))
        //console.log (makersInGrpRed.map (d => d.id))

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

    function handlePathRoll (data: any, path: any, event: MouseEvent) { 
        //console.log ("rollover path ", data, '  ', path);

        if (path.pathType != 12)  {
            const ids = data.makers.map ((d:any) => d.id)
            const mouseX = event.clientX;
            const mouseY = event.clientY + window.scrollY;
            setTooltip({ show: true, x : mouseX+30, y: mouseY+10, content: `${ids}` });
        }

    }


    // org width = width / scale (1500/ 0.33)
  

  return (
    <div style={ {padding: "20px"}} >
      <div>Ver_13_10</div>  
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
                            onFilterGroups={filterGroupBySize} />
                <Button variant="text" onClick={() => setLayout('force')}>force</Button> 
                <Button variant="text" onClick={() => setLayout('linear')}>linear</Button> 
                <Button variant="text" onClick={() => setLayout('grid')}>grid</Button> 
            </div>


             <svg width="1500" height="1300">
                   <rect width="100%" height="100%" fill="OldLace" />
                <QueryString querystring = {queryString}/>

                {/*Bar and Paths */}
                <g transform ='translate(150, 40) scale (.33)'>
                    {renderPathComponents()}
                    {renderBarComponents()}
                </g>
                {/*Force Graph  */}
                <g transform ='translate(20, 400) scale (.5)'>
                    <SocialCluster nodes={socialGroups} layout={layout} daterange={dateRange} flowselected={flowSelected} />
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