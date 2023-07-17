import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

import { saveAs } from 'file-saver';
//import Slider from 'rc-slider';
import Slider from '@mui/material/Slider';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import { createTheme, ThemeProvider } from '@mui/material/styles';
import { grey } from '@mui/material/colors';
import { blueGrey } from '@mui/material/colors';


// -- get data (sorted and clustered) -- // 
import { base_nodes } from './data.js'; // base makers.. 
import { social_Clusters } from './data.js' // social clusters 
import { guild_Groups} from './data.js'
import { town_Groups} from './data.js'
import { rowsDataset } from './data.js'
import { linkTypes_grouped } from './data.js'
 // import { base_links } from './data.js'


const guitheme = createTheme({
  palette: {
    primary: {
      main: blueGrey[200],
    },
    secondary: {
      main: '#11cb5f',
    },
  },
});


const handleDataDump = () => {
  const data = JSON.stringify({ social_Clusters }, null, 2);
  const blob = new Blob([data], { type: 'text/plain;charset=utf-8' });
  saveAs(blob, 'dataDump.txt');
};

// handleDataDump( )

// -- bar chart vis  -- // 
import ForceDirectComponent   from './ForceDirectComponent_blobtest'; // v2 working v3 working v5 working v6 working
import BarsComponent   from './BarsComponent';
import LinkComponent   from './LinkComponent';
import DateComponent   from './DateComponent';
import ColorKeyComponent   from './ColorKeyComponent';
import MakerTable   from './MakerTable';



import './styles.css'; // Import your custom CSS file

// -------------------------------- //
const App = () => {

  //console.log ('link types = ', linkTypes)
  //console.log ('rows  = ', rowsDataset)

  // -- STATES -- // 
  const base_makers = base_nodes; // the base set of data 

  // -- maker data -- // 
  const [makers, setMakers] = useState ([ ]);         // the selection of makers to use 

  const [linkGroups, setLinkTypes]= useState ( linkTypes_grouped); 
  const [socialGroups, setSocialGroups] = useState (social_Clusters )
  const [townGroups, setTownGroups] = useState (town_Groups)
  const [guildGroups, setGuildGroups] = useState (guild_Groups)

  // -- create a base group of social nodes to refer to -- // 
  const socialGroups_base = [...social_Clusters];//

  const [rowData, setRowData] = useState (rowsDataset)

  // -- get the total of makers selected and shared (flow) from the query 
  const [selectedMakers, setSelectedMakers] = useState(null)
  const [flowMakers, setFlowMakers] = useState (null)

 // const [socialLinks, setSocialLinks] = useState(base_links)

  // colour scales 
  //const [colorScale, setColorScale] = useState(null) 

 // -- slider range and layout -- // 
  const [dateRange, setDateRange] =   useState([1680, 1760, 1900]); // range value -- //
  const [sizeRange, setSizeRange] = useState([5, 20]); // range for size of groups -- // 
  
  //const [yRange, setYRange] = useState([50, 900]); // range for size of groups -- // 

  const [sliderState, setSliderState]= useState(false)


  const [layout, setLayout] = useState ('grid'); // set state for layout
  const [drawblobs, setDrawBlobs] = useState (false)

// -- selected item -- 
  const [selectedItem, setSelectedItem] = useState( ); // single item that has been selected.. 

  // ---------------------- // 
  // -- rows data set is the result of the query.. the 
  // -- console.log ('rows data', rowsDataset) // -- rows data set contains the results of the selection.. 

  let allselected = rowsDataset[0].makers;  // the root (inital)
  let flowselected = rowsDataset[rowsDataset.length-1].makers; // the paths (narrow)

  const slidermarks = [
        {
          value: 1600,
          label: '1600',
        },
        {
          value: 1760,
          label: '1760'
        },
        {
          value: 1920,
          label: '1920',
        },
      ];

  //console.log ('social data', social_Clusters)

  // set colour scale  --> to add to force direct and to colour component
    const [colorScale, setColorScale] = useState(() => {
            return d3.scaleOrdinal()
              .domain(Object.keys(linkGroups))
              .range(['rgb(215,48,39)','rgb(244,109,67)','rgb(253,174,97)','rgb(254,224,144)','rgb(255,255,191)','rgb(224,243,248)','rgb(171,217,233)','rgb(116,173,209)','rgb(69,117,180)'])

                //['#1f306e', '#1f306e', '#8f3b76', '#c7417b', '#c7417b', 'yellow', 'pink', 'brown', 'gray', 'cyan']);
    });

    //console.log('colorScale domain NEW:', colorScale.domain());

    let total_flow = [ ];
    let total_selected = [ ]

  // - log -- 


  //  filterMakersByDate(dateRange)
  // -- dynamically generate rows -- // 
   const renderBarComponents = () => {
    // -- get an update of bar data - 
    updateBarData( ); 
    // -- render rows -- 
    return rowsDataset.map((rowData, index) => {
          //console.log ('update bars -- ', rowData)
        let sourceData = rowData.query.att === 'towns' ? townGroups : guildGroups;
        return (<BarsComponent key={index} data={sourceData}index={index} onData={handleBarData} />)
    })


  };

  // -- // 

  function updateBarData ( ) { 
    /// -- updates and sorts the data in each group.
    // -- extract  totals of selected and flow makers in each group -- // 
    rowsDataset.map((rowData, index) => {
            let sourceData = rowData.query.att === 'towns' ? townGroups : guildGroups;

  
            // -- get nodes in each group and compare to row selection -- // 
            sourceData.forEach ((sourceGroup, i) => { 
                // 1. sort nodes into three groups
                let flow = [ ]; //this_row_selected = [ ]; // found in this 
                let paths = [ ]; //prev_row_selected = [ ]; 
                let none = [ ]; // not_selected = [ ]; 
                // ---------------------- // 
                let nodes_to_filter = [...sourceGroup.nodes] ; // start with all nodes. 
                // -- 1. FLOW : this row selection (e.g. Clock and London) -- FLOW
                flow = nodes_to_filter.filter (n =>rowData.makers.includes(n)) 
                // -- 2. POSSIBLE PATHS : prev row selection but NOT in this row selection -- Possible Pathways
                if (index > 0) {
                    paths = nodes_to_filter.filter (n =>  rowsDataset[index-1].makers.includes(n)
                                                                  && !rowData.makers.includes(n)) 
                }
                // -- 3. NOT SELECTED : not in this or prev row selection -- not selected
                none = nodes_to_filter.filter (n => !paths.includes(n) && !flow .includes(n))
                // ----- // 
                sourceGroup.nodes_sorted = [ ]  ;// empty object
                sourceGroup.nodes_sorted [0]= flow; 
                sourceGroup.nodes_sorted [1]= paths; 
                sourceGroup.nodes_sorted [2]= none; 
                // -- log results -- // 

                // add all the 'paths' into top row
                if (index == 0){ 
                   total_selected.push(...flow)
                   total_selected = [...new Set(total_selected)];// a set can only contain unique items


                }
                if (index == 1) {                    
                    total_flow.push (...flow)
                    total_flow = [...new Set(total_flow)];

                }
        })
      
    })

    //setSelectedMakers (total_selected)
    //setFlowMakers (total_flow)


  }


  // -- EVENTS / FUNCTIONS -- //

  // --. Set / Update Range Slider  -- // 

  // -- SLIDER ------------ //









  // -- on slider move -- update makers by time range -- 
  const handleSliderStart = ( ) => { 
        setSliderState (true)


  }
  const handleSliderChange = (event, range) => {
      setDateRange(range)       // set date range state
      filterMakersByDate(range)    // update  makers (nodes) by date range  

      console.log ('total selected = ', total_selected)
      console.log ('total flow = ', total_flow)
      setSelectedMakers (total_selected)
      setFlowMakers (total_flow)



     // console.log ('all makers = ', makers)

      //filterDatesTest(range)
  };

    // -- on slider end -- filter groups by 
  const handleSliderEnd = (event, range) => { 
      filterSocialGroups( )       // filter social groups -by makers selection
      filterTownGroups ( );
      filterGuildGroups ( ); 

      //console.log ('total selected = ', total_selected)


      setSliderState(false)
      //updateBarData( );
      //console.log ('slider range ', dateRange)



  }

  const handleResetBtn = (event) =>  { 
      filterSocialGroups( )       // filter social groups -by makers selection
      filterTownGroups ( );
      filterGuildGroups ( );
  }

  // slider for number items 
  const handleSizeSlider_change = (event, range) => { 
    setSizeRange(range)
  }

  const handleSizeSlider_end = (event, range) => { 
    // use sizeRange to filter groups.. 
    filterSocialGroupsBySize( );
  }

  // -- y pos slider -- //

  const handleYSlider_change = (event, range) => { 
    setYRange(range)
  }

  const handleYSlider_end = (event, range) => { 
    // use sizeRange to filter groups.. 
    //filterSocialGroupsBySize( );
  } 













  // ---------------------------------- // 

  const filterDatesTest = (range) => { 
      // -- filter dates -- simple array of objects -- // 
      let datefilter = [...datearray].filter (d => d.date>range[0] && d.date<range[2])
      //console.log ('date filter = ', datefilter)
      setDates (datefilter)

      // --filter inner dates -- clusters -- // 
      let clusters = [ ]
      let clusterFilter = [...dateClusters].forEach (c => { 
          let filter = c.filter (d => d>range[0] && d<range[2])
          clusters.push (filter)
      })
      //console.log ('cluster filter' , clusters)
      setClusters (clusters)
      const updatedData = [...datefilter];
      setData (updatedData)
  }

  // --  filter data by date -- // update visualisation.. // 
  function filterMakersByDate (range ) { 
      let selection = filterByDate (range)
      setMakers (selection) // set makers 
  }


  function setLayoutState (layoutState) { 
      setLayout (layoutState)
   }

   function handleDrawBlobs ( ) { 

      setDrawBlobs (!drawblobs)
   }


   // -- date filter function allows for more nuance -- // 
  function filterByDate (range) {
     // -- conditions -- //
     let lessThan = (a, b) => a < b;
     let greaterThan = (a, b) => a > b; 
     let equalTo = (a, b) => a == b; 
     let isBetween = (a, b, c) => a > b && a < c; 
     // -- filter makers and return -- // 
     let  filter = base_makers.filter (m =>  isBetween (m.date_1, range[0], range[2]));
     return filter;
   }

 // -- get the existing groups (social, town , guild ) and filter them (by date slider -or by other means?) 
  // could we filter by size -- e.g. size of maker group.. 

   // this uses the already filtered  'makers'
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

          // -- find links whose source AND target are both in updatedNodes -- // 
          const filteredLinks = group.links_base.filter (link => updatedNodes.includes (link.source) 
                                                      && updatedNodes.includes (link.target)); 
          //console.log ('links base = ', group.links)
          //console.log ('filtered links = ', filteredLinks)
          return { ...group, nodes: updatedNodes, links: filteredLinks};
      });
  
      //console.log ('updatedgroupsocial ', updatedGroups[0])
      setSocialGroups(updatedGroups);
    }


  // --  FILTER SOCIAL GROUPS BY SIZE -- // 
  // -- this needs more work --- // 
  function filterSocialGroupsBySize ( ) { 
    // size = sizeRange[0][1]
    console.log ('size = ', sizeRange) 
    // current social clusters === // 
    console.log ('base cluster : ', socialGroups_base);
    console.log ('current cluster : ', socialGroups)

    // get the size of each group... 
    // if it is less than size then... clear all the nodes -- othewise return to what? 
    // we either have to add or remove entire groups.. 
    // when we add the groups - we also have to filter by date.. 
    socialGroups.forEach ((group, i) => { 
        // get size 
        if (group.nodes.length < sizeRange[0] || group.nodes.length>[1] ) { 
           // remove from list.. // but also need to add to list.. 
           // or just clear nodes.. ??? 
        }
    })

  }



  function filterTownGroups ( ) { 
    // fiter by makers 
    const updatedGroups = townGroups.map((group) => {
        const subSelection = makers.filter((m) => [...group.nodes_base].includes(m));
        const diff = {
            toRemove: group.nodes.filter((m) => !subSelection.includes(m)),
            toAdd: subSelection.filter((maker) => !group.nodes.includes(maker)),
          };
      const filteredNodes = group.nodes.filter((m) => !diff.toRemove.includes(m));
      const updatedNodes = [...filteredNodes, ...diff.toAdd];
      return { ...group, nodes: updatedNodes };
    })
    //console.log ('updatedgrouptown ', updatedGroups)
    setTownGroups (updatedGroups)

  }

  function filterGuildGroups ( ) { 
    // fiter by makers 
    const updatedGroups = guildGroups.map((group) => {
        const subSelection = makers.filter((m) => [...group.nodes_base].includes(m));
        const diff = {
            toRemove: group.nodes.filter((m) => !subSelection.includes(m)),
            toAdd: subSelection.filter((maker) => !group.nodes.includes(maker)),
          };
      const filteredNodes = group.nodes.filter((m) => !diff.toRemove.includes(m));
      const updatedNodes = [...filteredNodes, ...diff.toAdd];
      return { ...group, nodes: updatedNodes };
    })
    //console.log ('updatedgroupguilds ', updatedGroups)
    setGuildGroups (updatedGroups)

  }

  // -- a GENERIC -- higher order function -- // 
      function filterGroups(key) {
        return () => {
          const groups = key === 'social' ? socialGroups : townGroups;
          const setGroups = key === 'social' ? setSocialGroups : setTownGroups;

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

          setGroups(updatedGroups);
        };
      }
  // ----------------------------------- // 


  // -- hand data click callback -- for force direct -- // 

  const handleDataClick = (data) => {
          console.log ("this is some data that has been clicked ...", data)
        // Do something with the clicked data
        // Update state, pass it to another component, etc.
  };

  const handleItemClick = (item, data) => { 
      //console.log ("an item was clicked...", item, ', ', data)
      //if (selectedItem == item)  setSelectedItem (null) 
      setSelectedItem(item);
  }


 // find a specific maker width

  const [childData, setChildData] = useState([]);
  // -- new stuff for links
  const handleChildData = (data) => {
    setChildData(data) ; // (prevData) => [...prevData, data]);
    console.log (childData)
  };


  // -- HANDLE BAR STATE  (updates of bars) -- // 
  // from each bar get the bar dom.. 
  const [barState, setBarState] = useState([ ]);
  const [linkState, setLinkState] = useState(null)
  const [linkStatePaths, setLinkStatePaths] = useState(null)
  const [linkStateFlows, setLinkStateFlows] = useState(null)



  const handleBarData = (data) => { 
    // update BarState
      setBarState((prevBarState) => { 
        const existingData = prevBarState.find((previtems) => previtems.id === data.id);

        if (existingData) {
             // Update the existing barData in the barState
              return prevBarState.map((item) => (item.id === data.id ? data : item));
            } else {
                // Append the new barData to the barState
              return [...prevBarState, data];
        }
    });

      // const existingData = prevBarState.find((data) => data.id === barData.id);
      // console.log ('existing data ',)
  }

  // should this work in a different way ?? 
  // -- this updates the data state from the bars .. 
  // -- GET BAR ITEMS and CREATE LINKS -- // 
  useEffect(() => {

      if (barState == undefined || barState.length==0) return; 
      //console.log ('bar data = ', barState )
      // -------------------------------------
      
      let base_links = [ ];
      let path_links = [ ];
      let flow_links = [ ];
      
      // -- THIS FUNCTION DRAWS "BASE" LAYERS -- // 
      // -- for each point in the bar get the target bar (and x y )
      barState[0].data.each (function (bar, i) { 
        // -- list of nodes to find a target for: 
        //console.log ('bar 0 data = ', bar)
        const transformAttr  = this.getAttribute ('transform')
        const [, xStart, yStart] = transformAttr.match(/translate\((.*),\s*(.*)\)/) || [];
        let startPos = [ parseFloat (xStart), parseFloat (yStart)]
        let nodeIDs = bar.nodes.map (n => n.id)
        // console.log ("nodeIDs ", nodeIDs, ' , ', i)

        // -- find matching items in the next bar down -- ///
        barState[1].data.each (function (nextbar, ni) { 
          // find match in next row... 
          let nodesinblock = nextbar.nodes.map (n => n.id)
          // console.log ('target nodes = ', nodesinblock)
          // console.log ('target block = ', this)
          let founditems = nodesinblock.filter (n => nodeIDs.includes (n)=== true)
          if (founditems.length>0) {
                const [, xTarget, yTarget] = this.getAttribute('transform').match(/translate\((.*),\s*(.*)\)/) || [];
                let targPos = [ parseFloat (xTarget), parseFloat (yTarget)]
                // console.log ('found items = ', founditems, ' , ', ni )
                // console.log ('start pos = ', startPos)
                // console.log ('target pos = ', targPos)

                // -- create a links object 
                let linkobj = { 
                    source: [startPos[0]+founditems.length/2, startPos[1]+20], 
                    target: [targPos[0] +founditems.length/2, targPos [1]], 
                    count: founditems.length
                  }
                base_links.push (linkobj);

            }

          })

      })
      setLinkState(base_links)

      // ------------------------------- // 

      // -- FUNCTION to DRAW -- FLOW layers and PATH (potential) layers 
      // -- paths are in the lower bar [1] -- // find paths on lower bar.. 
      // 0 - 0 works (flow)
      // 1 - 0 works (paths)
      barState[1].data.each (function (lowbar, i) { 
            // get the nodes in paths ()
            let pathNodeIDs = lowbar.nodes_sorted[1].map (n => n.id); // nodes_sorted[1]is paths 
            if (pathNodeIDs.length==0) return;
            // -- get block x y -- //
            const transformAttr  = this.getAttribute ('transform')
            const [, xStart, yStart] = transformAttr.match(/translate\((.*),\s*(.*)\)/) || [];
            let startPos = [ parseFloat (xStart), parseFloat (yStart)]
            // -- 
            //console.log (startPos)
            // -- look for matching items in the row ABOVE -- // 
             barState[0].data.each (function (topbar, ni) { 
                  let nodesinblock = topbar.nodes_sorted[0].map (n => n.id); 
                  let founditems = nodesinblock.filter (n => pathNodeIDs.includes (n) === true); // look for items in 
                  //console.log (founditems)
                  

                  if (founditems.length>0) {
                        const [, xTarget, yTarget] = this.getAttribute('transform').match(/translate\((.*),\s*(.*)\)/) || [];
                        let targPos = [ parseFloat (xTarget), parseFloat (yTarget)];
                       // console.log (targPos)
                        let linkobj = { 
                            source: [startPos[0]+founditems.length/2, startPos[1]+20], 
                            target: [targPos[0] +founditems.length/2, targPos [1]], 
                            count: founditems.length
                  }

                  path_links.push (linkobj);
                  //console.log ('path links =', path_links)
              }

          }) 
      })

      setLinkStatePaths(path_links)


        barState[1].data.each (function (lowbar, i) { 
            // get the nodes in paths ()
            let pathNodeIDs = lowbar.nodes_sorted[0].map (n => n.id); // nodes_sorted[1]is paths 
            if (pathNodeIDs.length==0) return;
            // -- get block x y -- //
            const transformAttr  = this.getAttribute ('transform')
            const [, xStart, yStart] = transformAttr.match(/translate\((.*),\s*(.*)\)/) || [];
            let startPos = [ parseFloat (xStart), parseFloat (yStart)]
            // -- 
            //console.log (startPos)
            // -- look for matching items in the row ABOVE -- // 
             barState[0].data.each (function (topbar, ni) { 
                  let nodesinblock = topbar.nodes_sorted[0].map (n => n.id); 
                  let founditems = nodesinblock.filter (n => pathNodeIDs.includes (n) === true); // look for items in 
                  //console.log (founditems)
                  

                  if (founditems.length>0) {
                        const [, xTarget, yTarget] = this.getAttribute('transform').match(/translate\((.*),\s*(.*)\)/) || [];
                        let targPos = [ parseFloat (xTarget), parseFloat (yTarget)];
                       // console.log (targPos)
                        let linkobj = { 
                            source: [startPos[0]+founditems.length/2, startPos[1]+20], 
                            target: [targPos[0] +founditems.length/2, targPos [1]], 
                            count: founditems.length
                  }

                  flow_links.push (linkobj);
                  //console.log ('path links =', path_links)
              }

          }) 
      })

       setLinkStateFlows(flow_links)



    }, [barState]);



  // ----- JSX ---- // 
return (
    <div className="wrapper"style={{ backgroundColor: '#4d4d4d', width : '100%', height :'700px' }}>
      {/*<h3>ToK into React</h3>*/}

          <ThemeProvider theme={guitheme}>
            <Button className="custom-button" variant="text" onClick={() => setLayoutState('grid')}>grid</Button>
            <Button variant="text" onClick={() => setLayoutState('force')}>force</Button>
            <Button variant="text" onClick={() => setLayoutState('date')}>date</Button>
            <Button variant="text" onClick={() => handleResetBtn()}>reset</Button>
            <Button variant="text" onClick={() => handleDrawBlobs()}>blobs</Button>

          </ThemeProvider>

          <div className="vis-container" style={{position: 'absolute', left: '0px', top: '100px', transform: 'scale(0.5)', transformOrigin: '0% 0%' }}>
            {/*<VisualizationComponent data={data} />*/}
            <svg width={3000} height={1200} transform="translate(0, 0) scale(1)">
                 

                  <ForceDirectComponent 
                    data={socialGroups} 
                    selection={rowData}
                    linkGroups={linkGroups}
                    colorScale = {colorScale}
                    layout={layout}
                    drawblobs={drawblobs}
                    daterange={dateRange}
                    sliderState ={sliderState}
                    selectedItem ={selectedItem}
                    onDataClick={handleDataClick}
                    onItemClick={handleItemClick}
                    />

                    <DateComponent daterange={dateRange} layout={layout}/>
                    <ColorKeyComponent colorScale={colorScale} linkGroups={layout}/>

                  {/*{generateRowComponents()}*/}
                  {/*<LinkComponent linkdata={linkState} pathlinkdata={linkStatePaths} flowlinkdata={linkStateFlows} onData={handleChildData} />*/}
                  {renderBarComponents()}
            </svg>
            <MakerTable selectedmakers={selectedMakers} flowmakers={flowMakers}></MakerTable>

          </div>
          
          <div className="slider-container">
          <ThemeProvider theme={guitheme}>
           <Slider
                size="small"
                value={dateRange}
                onChange={handleSliderChange}
                // onChangeCommitted={handleSliderEnd}
                onMouseDown={handleSliderStart}
                onMouseUp = {handleSliderEnd}
                getAriaLabel={() => 'date range'}
                min={1600}
                max={1920}
                step={1}
                valueLabelDisplay="on"
            />
            </ThemeProvider>

          {/*<Slider
                size="small"
                value={sizeRange}
                onChange={handleSizeSlider_change}
                onChangeCommitted={handleSizeSlider_end}
                getAriaLabel={() => 'number range'}
                min={1}
                max={50}
                step={1}
                valueLabelDisplay="on"
            />*/}

        {/*    <Slider
                size="small"
                value={yRange}
                onChange={handleYSlider_change}
                // onChangeCommitted={handleYSlider_end}
                getAriaLabel={() => 'Y range'}
                min={100}
                max={400}
                step={1}
                valueLabelDisplay="on"
            />*/}
          </div>
    </div>
  );
  // -------------------------// 
};

export default App;

// -------------------------------- //


























