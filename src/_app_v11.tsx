// @ts-nocheck


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
import { linkTypes_grouped } from './_datatypes'


// gui
import Slider from '@mui/material/Slider';
import Button from '@mui/material/Button';
// import Tooltip from '@mui/material/Tooltip';
// import { Tooltip, Typography } from '@mui/material';

// theme styles
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { grey, teal } from '@mui/material/colors';
import { blueGrey } from '@mui/material/colors';

import './styles.css'; // Import  custom CSS file

// components 
import SocialCluster from './_forceGraph' ; // -- forceGraph js
import BlockGroup from './_blocks' ; // -- horizontal bar js 
import Paths from './_paths3'
import MakerTable from './MakerTable'
import Tooltip from './_tooltip';
import FilterForm from './_filterform';
import QueryString from './_querystring';
import NavBar from './_navbar'
import FloatingNavBar from './_floatingNav'



// functions  -- // 
import {sortRows, addRow, removeRow}  from './_datatypes'; 


// theme for slider -- 

const guitheme = createTheme({
  palette: {
    primary: { main: teal[200]},
    secondary: {main: '#11cb5f'},
  },
});

const theme = createTheme({
        palette: {
          primary: {
            main: '#ff5722', // Replace with your desired color
            light:'#ff0000' // a test 
          },
        },
  });



const App: React.FC = () => {

    //console.log ("social clusters = ", social_Clusters)
    const allmakers: MakerType[] = [...base_makers];                    // unchanged base  // 

    const [makersFilter, setMakersFilter] = useState ([...base_makers]) // the makers filtered by attribute (only)
    const [makers, setMakers] = useState ([...base_makers]);            // the selection of makers to (current) 
    // -- 
    const [socialGroups, setSocialGroups] = useState ([...social_Clusters]); // all base makers grouped (query>)
    const [socialGroupsFilter, setSocialGroupsFilter] = useState ([...social_Clusters]); // all base makers grouped (query>)

    const [rowData, setRowData] = useState (rowsDataset)

    const [dateRange, setDateRange] =   useState([1600 , 1950]); // range value -- //

    // --
    const [pathData, setPathData] = useState([]) // single path 
    const [pathDataList, setPathDataList] = useState([]) // list of paths 
    const [offsets, setOffsets] = useState([])

    const [nodeLocs, setNodeLocs] = useState([])

    
    // -- 
    const selectedLayout = useRef ('grid')
    const [layout, setLayout] = useState (selectedLayout.current); // set state for layout


    // -- get the total of makers selected and shared (flow) from the query 
    // const [selectedMakers, setSelectedMakers] = useState<any[]>(rowData[0].makers)
    // const [flowMakers, setFlowMakers] = useState<any[]>(rowData[rowData.length-1].makers)
    // combine flow and selected as array -- // 

    const [flowSelected, setFlowSelected] = useState<any[]> ([rowData[rowData.length-1].makers, rowData[0].makers])
    const [queryString, setQueryString] = useState("<set query string>")

    // -- UI -- 
    const [tooltip, setTooltip] = useState({ show:false, x:100, y:100, content:'tooltip' });

    // -- row distances -- 
    const [rowsY, setRowsY] = useState ([0]); // an array to hold row postions... (to remove from row data)
    const [rowFlag, setRowFlag] = useState (false)
    const [baseY, setBaseY] = useState(0)
    const [barSpace, setBarSpace] = useState(1500); // 900 the max distance between bars... //- change to min max

    const socialScale = 0.7; // scale of social network  // 0.5 
    const barScale =  .3; 

    // -- a new test of row distances which will be used for bars and paths (links between bars) 
    //const []     
    
    let barWidth = 3500; // the 
    const minBarDist = 120;
    const marginTop = 140; 

    // const [dragStart, setDragStart] = useState(null);

    let dragStartRef = useRef (null)
    let dragYRef = useRef (0)
    const [dragY, setDragY] = useState(0);

    const divContainerRef = useRef(null);
    const [scrollY, setScrollY] = useState(0);

    //const divContainerRef = useRef<HTMLElement | null>(null);

    //let ySpacingData;

    // -- scrolling -- // 
    useEffect(() => {
        //window.addEventListener("scroll", handleScroll);

        // --Set up the scroll event listener
        //const container = divContainerRef.current;
        const container = divContainerRef.current as HTMLElement | null;

        if (container) {
                // Add the scroll event listener to the container
                container.addEventListener('scroll', handleScroll);
        }

        // --Clean up the event listener when the component unmounts
        return () => {
            //window.removeEventListener("scroll", handleScroll);

            if (container) {
                container.removeEventListener('scroll', handleScroll);
            } 
        };

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Empty dependency array ensures that this effect runs only once when the comp


    useEffect ( ()=> { 
         // -- update rows to start with -- //
        let updatedRowItems = updateRows( [...rowData]);
        setRowData (updatedRowItems)
        setQueryString (extractQueryString( ))

    }, [])

    // useEffect (() => { 
    //    // console.log ("scroll... ", scrollY)
    // }, [scrollY])


    useEffect( ( )=> { 
        // when social groups are updated > update the filter ?? 
        // filter social groups ?? 
        // filter the social groups by size (?)
        let filteredGroupsBySize = socialGroups.filter (d => d.nodes.length >= 2 && d.nodes.length <= 10)

        // filter by occurance of flowSelected[1]
        // get each of the groups 
        socialGroups.forEach (group => { 
            // get each group 
            // console.log ("group = ", group)
            // find if the group is in array flowSelected. 
            let flowitems = group.nodes.filter (d => flowSelected[1].includes(d))
            // console.log ("flow items = ", flowitems.length)
        })

        // -- filter according to selected 
        let filteredGroupsTest = socialGroups.filter(group => {
                // Check if any items in group.nodes are in flowSelected[1]
                return group.nodes.some(node => flowSelected[1].includes(node));
            });

        setSocialGroupsFilter (filteredGroupsTest)

    }, [socialGroups, flowSelected])


   // -- update the makers (filtered by attribute) -- //
    useEffect (( ) => { 
            // update makers
            setMakers (filterByDateRange (dateRange)); 
    }, [makersFilter])


    useEffect (( ) => { 
            // update social group and rows
            let updatedGroups = filterSocialGroups (makers) ; // (flowSelected[1])
            setSocialGroups(updatedGroups);
            
            let updatedRowItems = updateRows( [...rowData]); 
            setRowData (updatedRowItems)
    }, [makers])

 
    
    useEffect (( ) => { 
        let updatedGroups = filterSocialGroups (makers); //(flowSelected[1])
        setSocialGroups(updatedGroups);
    }, [flowSelected])

    useEffect (() => { 
         //console.log ("update bar data ")
         // update path data also ?
         let updatedRowItems = updateRows( [...rowData]); 
         setFlowSelected ([rowData[rowData.length-1].makers_sorted[0], rowData[0].makers_sorted[0]])

         //setBaseY (((rowData[rowData.length-1].yspacing + 450) * 0.3 )* 2) ;// the baseY for the social groups.. 

         let baseTemp = calcBaseY( );
         setBaseY (baseTemp); // (((rowsY[rowsY.length-1] + 450) * 0.3 )* 2) // this is the base for the social graph

         setQueryString (extractQueryString( ))

         // update nav bar 
         // y SpacingData = rowData.map(d => d.yspacing);


    }, [rowData])

    useEffect( ()=> { 
       // console.log ("drag Y ", dragY)
    }, [dragY])


    useEffect ( ()=> { 
       // console.log ("PATHS UPDATED ")
       // renderPathComponents( )

    }, [pathDataList])

    useEffect( ()=> { 
        // updating rowsY SHOULD update path positions 
        // get all bars 
        //console.log ("rows = ", rowData)
        //console.log ("ROW FLAG = ", rowFlag)
        //sconsole.log ("selected layout ", selectedLayout.current)
        // console.log ('path data = ', pathDataList)

        // let pathDataTemp = [...pathDataList]

        // pathDataTemp.forEach(path => {
        //     path.forEach(d => {
        //         d.sourceLoc[1] = -100;
        //         d.targetLoc[1] = -100;
        //     });

        //     console.log("path source = ", path.map(d => d.sourceLoc));
        //     console.log("path target = ", path.map(d => d.targetLoc));
        // });

        // console.log ("path data temp = ", pathDataTemp)

        // setPathDataList(pathDataTemp)

        // HERE UPDATE PATH DATA POSITION -- 

        // update barY pos 
        // update path pos 
        // renderPathComponents( )
        let baseTemp = calcBaseY( ); //((rowsY[rowsY.length-1] + 450) * 0.3 )* 2
        setBaseY  (baseTemp); // (((rowsY[rowsY.length-1] + 450) * 0.3 )* 2) // this is the base for the social graph

        if (rowFlag) setLayout (selectedLayout.current) ;// switch layout if layout button is pressed. 


        // console.log ("drag Y ", dragY)

    }, [rowsY, rowFlag])


    useEffect(() => { 
        //console.log ("row data (barSpace) ", rowData)
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

    // --Define the handleScroll function
    const handleScroll = () => {
        //const scrollTop = divContainerRef.current.scrollTop; // scroll of 
        //setScrollY(scrollTop);
        //console.log ("scroll Top, ", scrollTop)
 

        // const scrollPos = window.scrollY;
        // setScrollY(scrollPos);
        // Add additional logic if needed based on the scroll position
        // For example, update the visualization with D3.js
    };

    // function moveScroll ( index : number) { 
    //     console.log ("move scroll position...", index)

    //     let container = divContainerRef.current

    //      if (container) {
    //             container.scrollTop  = 0;
    //     }


    // }

    // ---------------------- // 
    function scrollToY ( targetY: number) { 
        

        let targetDiv = divContainerRef.current as HTMLElement | null;

        if  (targetDiv && targetDiv instanceof HTMLElement) { 
                const startY = targetDiv.scrollTop;

                const startTime = performance.now();
                const duration = 1500;


                  function scrollStep(timestamp: any) {
                    const currentTime = timestamp || new Date().getTime();
                    const elapsed = currentTime - startTime;
                    const progress = Math.min(elapsed / duration, 1);

                    if (targetDiv) targetDiv.scrollTop = startY + (targetY - startY) * easeInOutCubic(progress);

                    if (progress < 1) {
                      window.requestAnimationFrame(scrollStep);
                    }
                  }

                  function easeInOutCubic(t:any) {
                    return t < 0.5 ? 4 * t ** 3 : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
                  }

                  window.requestAnimationFrame(scrollStep);

      }

    }


    // ---------------------- // 




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

        //console.log ("query string = ", string)
        //console.log ("row data (query string) = ", rowData)

    }


    // -- slider change 
    const handleSliderChange = (event: Event, range: number | number[]) => {
        if (Array.isArray(range)) {
             setDateRange(range);
        } 
    };
    
    // -- slider end  
    const handleSliderEnd = (event: Event | React.SyntheticEvent<Element, Event>, range: number | number[]) => {
        if (Array.isArray(range)) {
            setDateRange(range);
            setMakers (filterByDateRange (range)); // fi
        }

    }

    function handleFilterReset ( ) { 
            //console.log ("filter reset")
            setMakersFilter (allmakers)
    }


    // -- handle filter form -- .
    const handleFilterChange = (type: any, value:any) => {
            //console.log ("handle filter change")
            //console.log ('type = ', type , ' value = ', value)
            //console.log ('makers = ', makers)
            // -- FILTER the FILTERED makers -- // 
            const filteredMakers = filterMakersByAttribute(type, value, false);
            // update the base filtered makers -- // 
            setMakersFilter (filteredMakers)

    }

    // -- call to update the groups of selected makers -  (UPDATE )
    // -- updates rows and flow makers -- // 
    function updateRows (data : any) {
            //console.log ("this is the udpate row function... ", data)
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


    // filterGroupBySize -- filterSocialBySize
    function filterGroupBySize (min:number, max:number ) { 
        // remove groups that are bigger than a certan size -- 
        // but this allow for adding them again.. 

        //let updatedGroups = socialGroups.filter (d => d.nodes.length >= min && d.nodes.length <= max)
        //setSocialGroups (updatedGroups)

        // also have to remove / update makers list ? 
     }

    // ---  filter by selection a test  -- // 
    function filterGroupBySelection ( ) { 
        // // do any of the groups contain the selection.. 
        // //console.log ('flowselected = ', flowSelected)
        // //console.log ('social groups = ', socialGroups)
        // //let updatedGroups = socialGroups.filter  (d => flowSelected[0].includes(d))
        // //let updatedGroups = flowSelected[0].filter((m) => [...group.nodes_base].includes(m));
        // let groups = [ ]
        // const updatedGroups = socialGroups.map((group) => {
        //         //console.log ("social group: ", group.nodes)
        //         //console.log ('filtered group : ', flowSelected[0])
        //         // get each social group.. does it contain any of the 'flow' selected items ? 
        //         let foundmakers = flowSelected[0].filter (d => group.nodes.includes(d))
        //         //console.log ('found makers = ', foundmakers)
        //         //console.log ('==============================')
        //         if (foundmakers.length > 0) groups.push (group)
        // })
        // console.log ("groups filtered  = ", groups)
        // //setSocialGroups(groups)
        // //console.log ('new update = ', updatedGroups)

     }
    // -- a test -- // 
    

    function filterSocialGroupsBySelection ( ) {



    }


    // -- filter social groups by makers -- 
    function filterSocialGroups(makergroup: any) {
        // -- add or remove items into each cluster -- //

        const updatedGroups = socialGroups.map((group: any) => {
            const subSelection = makergroup.filter((m: any) => [...group.nodes_base].includes(m));
            const diff = {
              toRemove: group.nodes.filter((m: any) => !subSelection.includes(m)),
              toAdd: subSelection.filter((maker: any) => !group.nodes.includes(maker)),
            };
            // -- remove .toRemove and add .toAdd -- 
            const filteredNodes = group.nodes.filter((m:any) => !diff.toRemove.includes(m));  // FILTER group nodes (to those that are not in .toRemove)
            const updatedNodes = [...filteredNodes, ...diff.toAdd]; // concat the .toAdd itmes to filterednodes

            // -- SORT (?) -- // 
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
            //let item  = { ...group, nodes:updatedNodes, nodes_sorted:sortedNodes, links:filteredLinks} 
            //console.log ("item  = ", item)
            return  { ...group, nodes:updatedNodes, nodes_sorted:sortedNodes, links:filteredLinks} ; //, links: filteredLinks};

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

    // triggered by data change in bar
    function handleBarDataV2 ( ) { 
        //console.log ('handle bar V2')

    }

    /// -- create paths between bars -- // should bar data change
    function handleBarData (locs:any, sublocs:any, data:any, i:number, widths:any, rowSelection:any) { 
        // draw a bar and the flows between 
        // -- this updates bars that have been changed... (!!) 
        //console.log ("handle bar data!!", i )
        let bar  = { index:i, data:data,  locs:locs, sublocs:sublocs, widths:widths, rowSelection:rowSelection}
        // barItems[i] = bar; // list
        barItems.push(bar)
        // console.log ("bar items", barItems)
        // console.log ("path Data ", pathData)
        //  -- use bar to generate flows to makers from the bottom bar 
        // console.log ('no. of rows = ', rowData.length)
        
        // get flow from the base bar -- // 
        // if (barItems.length == rowData.length) generateFlowList (barItems[rowData.length-1])

        // // when we have more than one bar: generate links...

        // this is the bit that causes problems...**** 
        if (barItems.length>1) {
            // // ------- // 
            // link list -- // 
            let linkList: any = generateLinkList(barItems)
            // -- console.log ("link list = ", linkList)
            setPathDataList (linkList)
            //console.log ('link data (list) ', linkList)


        } else { 
            setPathDataList ([ ])
        }


    }


    // -- render links -- //
    function renderPathComponents ( ) { 
        // -- perhaps this is where the paths are removed -- // 
        //console.log ('render paths list  ', pathDataList)
        return pathDataList.map((pathdata, index) => {
              return   (<Paths key={index} data={pathdata} rowsY={rowsY} index={index} 
                            handlePathRoll={handlePathRoll}
                            handleRollOut={handleNodeRollOut}
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

        if (rowData !== null) {

            const floatNavBarComponent = <FloatingNavBar key="floatNavBar" ypos={rowsY[rowsY.length-1]+30} onAddRow={handleAddRow} />

            // -- start -- /// 
            const blockGroupComponents =  rowData.map((row:any, i:number) => {
                //console.log ("bar source = ", row)
                let attribute = row.query.att; 
                let values = row.query.value.join (' ')
                let sourceData =  row.makers_group; /// barGroups[i];
                let rowInfo = {title: attribute, values: values};
                let rowSelection = { att: attribute, values: values }
                //console.log ('row info = ', rowInfo)
                //let rowspace = row.yspacing
                //let y = row.yspacing;
                let y =  rowsY[i]; //100; // row.yspacing; /// i* barSpace; //row.yspacing;//row.yspacing;
                let prevY = i>0 ? rowsY[i-1] : -1000
                let nextY = i < rowsY.length-1 ? rowsY[i+1] : null
                //console.log ("this Y = ", y, "next Y = ", nextY, ": ", i) 
                //console.log ("this Y = ", y, "prev Y = ", prevY, ": ", i) 

                //console.log ('rows y = ', rowsY[i], " ", i)
                    //scrollY * (1/.33) -- factor in the scale.. 
                // calc widths for each row.. 
                let widths = calcRowWidths(sourceData)
                //console.log ("row widths = ", widths)

                return (
                        <BlockGroup key={i} data={sourceData} widths={widths} ypos={rowsY[i]} prevY={prevY} index={i} 
                                        rowinfo={rowInfo}
                                        rowSelection = {rowSelection}
                                        handleBarData={handleBarData} 
                                        handleBlockSelection={handleBlockSelection}
                                        handleBlockRoll={handleBlockRoll}
                                        handleRollOut={handleNodeRollOut}
                                        handleUIClick={handleUIClick}
                                        handleBarDataV2={handleBarDataV2} 
                        />
                        )
                    })
            //-- end map -- // 

            // -- return array of blockgroup components. -- // 
            return [floatNavBarComponent, ...blockGroupComponents]

        } else { 
            return (<g/>) 
        } 

    }

    // -- generate an ARRAY of links -- // 
    function generateLinkList( bars: any) { 
        //  
        //console.log ("GENERATE LINK LIST --- ", barItems)
        //console.log ("generate links -bar items ...", bars)

        let linkList = [ ];
        // console.log ("bar items : ", barItems)
        if (bars.length>1) { 

            for (let n=0; n<bars.length-1; n++) { 
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
            let filteredLinks = linkList[0].filter((link: any) => link.targetGrp_sorted == 0);
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
         console.log ("CLICK THE BAR.....", barIndex) ; //, barIndex, " ", groupIndex, " ", itemIndex)

         // limit to group 0 or 1 : i.e. don't allow click on gree section (index 2 )
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

                
                // -- update y pos of row -- (rowsY array)
                let updatedValueArray = rowTemp[barIndex].query.value; 

                //console.log ("updated value array = ", updatedValueArray)
                // -- UPDATE ROWS Y -- // 
                let rowsYtemp = [...rowsY]

                let minH = 100; 
                let maxH = barSpace; 
                
                if (barIndex < rowTemp.length-1) {

                    //-- bar has a selection (length =) (the query starts with an empty string ("")) 
                    if (updatedValueArray.length >= 2) { 
                        // update rowsY temp
                        
                        for (let i=barIndex; i<updatedRowItems.length-1; i++) { 
                            let nextRow = rowsYtemp[i+1];
                            let thisRow = rowsYtemp[i];
                            let y: any;
                            if (i-barIndex == 0)  y = barSpace; // this is the clicked one 
                            if (i-barIndex >= 1)  y = rowsY[i+1] - rowsY[i]; 
                            rowsYtemp[i+1] = rowsYtemp[i] + y; 
                        }

                    }

                    // -- no querys (no selection array is one item long )
                    if (updatedValueArray.length == 1) { 

                        for (let i=barIndex; i<updatedRowItems.length-1; i++) { 
                            let nextRow = rowsYtemp[i+1];
                            let thisRow = rowsYtemp[i];
                            let y: any;
                            if (i-barIndex == 0)  y = 100; 
                            if (i-barIndex >= 1)  y = 100; 
                            rowsYtemp[i+1] = rowsYtemp[i] + y; 
                        }

                    }
                }   

                //console.log ("rowsTemp = ", rowsYtemp)
                setRowsY (rowsYtemp)
                setRowFlag (false)

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
  

    function handlePathRoll (data: any, path: any, event: MouseEvent) { 
        //console.log ("rollover path ", data, '  ', path);

        if (path.pathType != 12)  {
            const ids = data.makers.map ((d: any) => d.id)
            const mouseX = event.clientX;
            const mouseY = event.clientY + window.scrollY;
            setTooltip({ show: true, x : mouseX+30, y: mouseY+10, content: `${ids}` });
        }

    }
    // --------- 
    function handleNodeRoll (id ) { 
        //console.log ("NODE ROLL", id)
        // let event: MouseEvent | undefined; // Or initialize it properly
        let maker  = returnmakefromid(id)

        //console.log ("maker = ", maker[0].)

        const mouseX = event.clientX;
        const mouseY = event.clientY + window.scrollY;
        //console.log (name, ' :  ', val, ' ', mouseX)
        setTooltip({ show: true, x : mouseX+30, y: mouseY+10, content: `${maker[0].name}` });

  

    }

    // --------- 
    function handleNodeRollOut ( ) { 
        //console.log (" node: roll out ", event)
        setTooltip({ show: false, x : 0, y: 0, content: `` });
    }

    // --------- 

    function returnmakefromid( id: number) { 
        let m = makers.filter(m => m.id == id)
        return m; 
     }

    // --- add row -- // 
    function handleAddRow (value: any) { 
        //console.log ('Add row')

        //console.log ('current rows ', rowData )
        let updatedRow  = addRow ([...rowData], value)

        // add a new row - set spacing to previous y pos
        // has the previous row got any s
        let valCount= updatedRow[rowData.length-1].query.value.length;
        
        //let yspace = 900;  
        let yspace = valCount >= 2 ? barSpace  : minBarDist // -- COLLAPSE DIST ** 
        //updatedRow[rowData.length].yspacing = updatedRow[rowData.length-1].yspacing + yspace;



        // -- update rowspacing 
        // get current row spacing.. 
        //console.log ('current row spacing = ', rowsY)
        let rowsYtemp = [...rowsY]
        rowsYtemp.push (rowsY[rowsY.length-1] + yspace) // increase by yspace.. 
        setRowsY (rowsYtemp)
        setRowFlag (false)


        // -- update the new row values.. 
 





        //console.log ('updated rows new = ', updatedRow)
        let updatedRows2 = updateRows( updatedRow);
        
        //setBaseY  (rowsY[rowsY.length-1]); // (baseY+barSpace*.3)
        setRowData (updatedRows2)
    }

    // -- remove row -- 
    function handleRemoveRow (id: number, value: any) { 
        // what is the current row data -- ? 
        //console.log ('row data current = ', rowData)
        let updatedrows = removeRow ([...rowData], value,  id);


        // remove rows 
        let rowsYtemp = [...rowsY]
        rowsYtemp.pop( );

        setRowsY (rowsYtemp)
        setRowFlag (false)


       // console.log ("new rows = ", updatedrows)

        // call the add row // remove row functions --  //
        // value is the row value to remove -- // 
        // update the row 
        // let updatedRow = removeRow ([...rowData], value,  id)
        // let updatedRow  = addRow ([...rowData], value)
        // setRowData ([...newrowdata])

        return updatedrows;

    }

    function handleNavBarRemove (index: number ) { 
        //console.log ("REMOVE ROW ...", index)
        //console.log ('data rows ', rowData[index])
        // -- get the attribute and values from the row and use to remove row.. 
        let attribute = rowData[index].query.att; 
        //let values = rowData[index].query.value.join (' ')
        //let rowSelection = { att: attribute, values: values }
        console.log ("remove row!!! ", index,  " data: ",  attribute)

        let rowTemp = removeRow ([...rowData], attribute,  index);

        // what are row

        // -- alter this bit -- // 
        updateRows(rowTemp);
        setRowData (rowTemp)

        // get the data of the row... (index and bar rowselection)
        // remove rows from nav bar 
        let rowsYtemp = [...rowsY]
        rowsYtemp.pop( );

        setRowsY (rowsYtemp)
        setRowFlag (false)
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

 

    // -- click on (red) block -- // 
    function handleNavBarBlocks (index: number, flag: boolean) { 
        let rowsYtemp = [...rowsY];

        let minH; // 
        let maxH; // 
        let collapseOthers = false; 


        // scroll the page to this position... including the scale... 

 
        for (let i=1; i<rowsYtemp.length; i++) {

            // -- update non selected -- 
            if (collapseOthers || index < 0) { 
                 minH = minBarDist ;  // collapse distance **
            } else { 
                 minH = rowsY[i] - rowsY[i-1]; // keep distance
            }

            rowsYtemp[i] = rowsYtemp[i-1] + minH;

            // -- update selected -- //
            if (index == i) { 
                if (rowsY[i] - rowsY[i-1] == barSpace || index < 0) { 
                     maxH = minBarDist; // collapse distance **
                } else { 
                    maxH = barSpace; 
                } 
                rowsYtemp[i] = rowsYtemp[i-1] + maxH
            }

        }


        //console.log ("rows Y = ", rowsYtemp, " index: ", index)
        setRowFlag (flag)
        setRowsY(rowsYtemp)
        // set baseY ?? 

        let baseTemp = calcBaseY( ); //((rowsYtemp[rowsYtemp.length-1] + 450) * 0.3 )* 2

        //baseTemp = 400; 

        setBaseY (baseTemp); // this is the base for the social graph


        //moveScroll( index);
        // pos to move to 
        let targetY = index == -1 ? baseTemp : rowsYtemp[index-1]
        //console.log ('targetY = ', targetY)


        //scrollToY( targetY * .33) // move scroll to the selected row index. (* by scale.. )



    }

    // -- collapse all and swap layout -- 
    function handleNavBarLayout (layout: any ) { 
        //   handleNavBarClick( -1)
        // -- can we stage these -
        //setLayout(layout)
        selectedLayout.current = layout;
        handleNavBarBlocks(-1, true); // collapse all and then move layout

        //handleNavBarMove(-1, )
        //moveScroll( -1);


    }  

    function handleNavBarMove (index: number, layout: any ) { 
        // when this is selected - get the name / index of the button and trigger a scroll move... 
        console.log ('rows Y', rowsY)
        console.log ("nav bar move", index)
        

        let baseTemp = calcBaseY( );// ((rowsY[rowsY.length-1] + 450) * 0.3 )* 2
        

        let targetY = index == -1 ? (baseTemp * socialScale) -20 : rowsY[index] * barScale
        if (layout != null) setLayout (layout)

        scrollToY(targetY)
        setBaseY (baseTemp); // this is the base for the social graph



    }

    function calcBaseY ( ) { 
        //console.log ("calcl base -- rows Y ", rowsY)
        //return 1500;
        let ypos_scaled = rowsY[rowsY.length-1] * 1/socialScale * barScale
        return  (ypos_scaled + 400 + marginTop);

        return  ((rowsY[rowsY.length-1] + 450) * 0.3 )* 2
    }


    // -- old -- // 
    function handleNavBarClick ( index: number) { 
        //console.log ("click on navbar ...", index)
        let rowTemp = [...rowData]; 

        // index is the selected bar -- 'y spacing' = 'y pos'
       for (let i = 1; i<rowTemp.length; i++) { 
            if (i-1 == index) {
                rowTemp[i].yspacing = rowTemp[i-1].yspacing + 500
            } else { 
                rowTemp[i].yspacing = rowTemp[i-1].yspacing + 100 // y spacing = y

            } // y spacing = y
        }
        //console.log ("row temp = ", rowsYtemp)

        //updateRows(rowTemp);
        setRowData (rowTemp)
    }

 

    // the grey circles 
    // the function that WAS attached to the bars... 
    function handleUIClick (name: any, id: number, data: any ) { 

        //console.log ('button name ', name)

        // -- get the row data 
        let rowTemp = [...rowData]; 

        // -- save current distances between rows -- // 
        let rowDistances = [ ];
        for (let i=1; i<rowTemp.length; i++) { 
            let d = rowTemp[i].yspacing - rowTemp[i-1].yspacing;
            rowDistances.push (d)
        }

        if (name == 'buttonRemove') { 
            console.log ('remove ', data.att, " ", id)
            rowTemp = handleRemoveRow(data.att, id)
            // this should update row temp

        }

        // -- expand -- // 
        if (name == 'buttonExpand') {
            console.log ("button expand ")
            // -- update distances -- one down 
            rowTemp[id+1].yspacing = rowTemp[id].yspacing + barSpace; // rowTemp[id-1].yspacing + 1000; 
            // -- other following -- two down - use saved distances -- // 
            for (let i = id+2; i<rowTemp.length; i++) { 
                rowTemp[i].yspacing = rowTemp[i-1].yspacing + rowDistances[i-1]
            }

        }

        // -- contract -- //
        if (name == 'buttonHide') {
            console.log ("button hide ", rowTemp[id+1].yspacing, rowTemp[id].yspacing);

            // -- update distances -- one down 
            rowTemp[id+1].yspacing = rowTemp[id].yspacing + 100; // rowTemp[id-1].yspacing + 1000; 
            // // -- other following -- two down - use saved distances -- // 
            // for (let i = id+2; i<rowTemp.length; i++) { 
            //     rowTemp[i].yspacing = rowTemp[i-1].yspacing + rowDistances[i-1]
            // }
        } 

        updateRows(rowTemp);
        setRowData (rowTemp)
        // update flows (do we have to also remove them ?? )

    }

    // -- DRAG EVENTS -- // 
    const handleMouseDown = (e: any) => {
            //console.log ("mouse down", e.clientY)
            dragStartRef.current = e.clientY
            //setDragStart(e.clientY);
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
    };

    const handleMouseMove = (e: any) => {
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

    const handleWheel = (e: any) => {
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
    <div className="main">


      <div className="fixed-section-top">    

      {/*<div>Ver_20_01</div> */}

            <div className="form-container"> 
                {/*<FilterForm onFilterChange={handleFilterChange} onFilterReset={handleFilterReset}
                            onFilterGroups={filterGroupBySize} onAddRow={handleAddRow} />*/}


            
                {/*<Button variant="text" onClick={() => setLayout('force')}>force</Button> 
                <Button variant="text" onClick={() => setLayout('linear')}>linear</Button> 
                <Button variant="text" onClick={() => setLayout('grid')}>grid</Button> 
                <Button variant="text" onClick={() => updateRowDist(100 )}>[+]</Button> 
                <Button variant="text" onClick={() => updateRowDist(-100 )}>[-]</Button> */}
            </div>

        <ThemeProvider theme={theme}>            

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

        </ThemeProvider>

      </div >


      <div className="centre-group-section">
            <div className="nav-section">
                         <svg  
                                width="250" 
                                height="700"
                                id="navcanvas"
                                transform={`translate(${0}, ${0})`}
                            >
                        <rect width="0%" height="0%" fill="darkgray" id="mainpage" />

                            <g transform={`translate(${55}, ${marginTop}) scale(${1})`}>
                                <NavBar 
                                data={rowsY}
                                rowData={rowData}
                                handleNavBarBlocks = {handleNavBarBlocks}
                                handleNavBarLayout = {handleNavBarLayout}
                                handleNavBarMove = {handleNavBarMove}
                                handleNavBarRemove = {handleNavBarRemove}

                                />
                            </g>
                            </svg>
                    
            </div>




            <div className="scroll-section-centre"  ref={divContainerRef}> 

                 <svg  
                        onMouseDown={handleMouseDown} 
                        onWheel={handleWheel}
                        onScroll={handleScroll}
                        width="1600" 
                        height="6000"
                        id="maincanvas"
                        transform={`translate(${0}, ${0})`}
                     >
                        <rect width="0%" height="0%" fill="OldLace" id="mainpage" />

                        <g transform ={`translate(${50}, ${marginTop}) scale(${barScale})`}>
                            {renderPathComponents()}
                            {renderBarComponents()}
                        </g>
                        <g transform={`translate(${-100}, ${dragY}) scale(${socialScale})`}>
                            <SocialCluster 
                                nodes={socialGroupsFilter} 
                                layout={layout} 
                                baseY={baseY}
                                daterange={dateRange} 
                                flowselected={flowSelected} 
                                handleLocations={handleLocations} 
                                handleNodeRoll={handleNodeRoll} 
                                handleNodeRollOut={handleNodeRollOut}
                                />
                        </g>

                     </svg>

            </div>

        </div>


             
      <div className="fixed-section-bottom">    
                 <MakerTable flowselected={flowSelected}></MakerTable>
      </div>

  

       {tooltip.show && <Tooltip x={tooltip.x} y={tooltip.y} content={tooltip.content} />}


    </div>
  );
};

export default App;