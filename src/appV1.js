import React, { useEffect, useRef, useState } from 'react';
//import Slider from 'rc-slider';
import Slider from '@mui/material/Slider';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';


// -- get data (sorted and clustered) -- // 
import { base_nodes } from './data.js'; // base makers.. 
import { social_Clusters } from './data.js' // social clusters 
import { guild_Groups} from './data.js'
import { town_Groups} from './data.js'
import { rowsDataset } from './data.js'

 // import { base_links } from './data.js'



// -- bar chart vis  -- // 
import ForceDirectComponent   from './ForceDirectComponent';
import BarsComponent   from './BarsComponent';



import './styles.css'; // Import your custom CSS file



// -------------------------------- //


const App = () => {

  // dates for tesing force direct 

  // -- test dates -- // 
  // let datearray = [{date:1800}, {date:1804}, {date:1809}, {date:1820}, {date:1840}, {date:1850}]
  // let dateClusters= [ [1800, 1820, 1840], [1702, 1720, 1750], [1630, 1640, 1660, 1670]]
  // const [dates, setDates] = useState(datearray)
  // const [clusters, setClusters] = useState (dateClusters)
  // const [data, setData] = useState(datearray); // another way to handle the data -- // 

  /// 
  //console.log ('links ', base_links)
  //console.log ('data ', base_nodes)
  //console.log ('social groups ', social_Clusters)
  // -- STATES -- // 
  const base_makers = base_nodes; // the base set of data 


  // -- maker data -- // 
  const [makers, setMakers] = useState ([ ]);         // the selection of makers to use 

  const [socialGroups, setSocialGroups] = useState (social_Clusters )
  const [townGroups, setTownGroups] = useState (town_Groups)
  const [guildGroups, setGuildGroups] = useState (guild_Groups)

 // const [socialLinks, setSocialLinks] = useState(base_links)

 // -- slider range and layout -- // 
  const [sliderRange, setSliderRange] =   useState([1410, 1803]); // range value -- //
  const [layout, setLayout] = useState ('force'); // set state for layout

// -- selected item -- 
  const [selectedItem, setSelectedItem] = useState( ); // single item that has been selected.. 

  // ---- // 
  //console.log ('rows data', rowsDataset)

  // -- unpack rows 
  generateRowComponents( );

  // get and sort data in each row -- // 
  function generateRowComponents ( )  { 
      //console.log ('rows data =', rowsDataset)
      rowsDataset.map ((d, i) => { 
        //console.log ("makers data", d.makers)
        //console.log ('query ', d.query)

        // sort / query the data for each row

        //if (i>0) return; 
        // 1. find all makers in this row..(town or guild)
        const source_data = d.query.att === 'towns' ? townGroups : guildGroups;
        // console.log ('source query : ', d.query.att)
        // console.log ('source data : ',  source_data); // clusters of towns etc.

        // 2. compare with root makers 
        //console.log ('makers in row ', d.makers)

        // 3. find the makers that are in each cluste r
        source_data.forEach (group => { 
          //console.log (group)
          // sort maker into 3 : those in makers - those in previous makers - s
          group.nodes_sorted = [ ]  ;// empty object

          // find nodes in 
          let foundnodes = group.nodes.filter (n => [...d.makers].includes(n))
          let notfoundnodes = group.nodes.filter (n => [...d.makers].includes(n)== false); 
          // ---- // 
          group.nodes_sorted.push (foundnodes); 
          group.nodes_sorted.push (notfoundnodes);
          // also need to add 'previous nodes '
          //console.log (group);

        })
        //return <BarsComponent data={townGroups}ypos={10} type={'location'} />
      }); 


  }

  // -- dynamically generate -- // 
   const renderChildComponents = () => {
    return rowsDataset.map((value, index) => (
      <BarsComponent key={index} data={townGroups}ypos={index* 60 + 120} type={'location'} />
    ))
  };

  // -- EVENTS / FUNCTIONS -- //

  // --. Set / Update Range Slider  -- // 

  // -- on slider move -- update makers by time range -- 
  const handleSliderChange = (event, range) => {
      setSliderRange(range)       // set date range state
      filterMakersByDate(range)    // update  makers (nodes) by date range  
      //filterDatesTest(range)
  };

  const filterDatesTest = (range) => { 
      // -- filter dates -- simple array of objects -- // 
      let datefilter = [...datearray].filter (d => d.date>range[0] && d.date<range[1])
      //console.log ('date filter = ', datefilter)
      setDates (datefilter)

      // --filter inner dates -- clusters -- // 
      let clusters = [ ]
      let clusterFilter = [...dateClusters].forEach (c => { 
          let filter = c.filter (d => d>range[0] && d<range[1])
          clusters.push (filter)
      })
      //console.log ('cluster filter' , clusters)
      setClusters (clusters)
      const updatedData = [...datefilter];
      setData (updatedData)


  }

  // -- on slider end -- filter groups by 
  const handleSliderEnd = (event, range) => { 
      filterSocialGroups( )       // filter social groups -by makers selection
      filterTownGroups ( );
      filterGuildGroups ( ); 
  }

  // --  filter data by date -- // update visualisation.. // 
  function filterMakersByDate (range ) { 
      let selection = filterByDate (range)
      setMakers (selection) // set makers 
  }

  function toggleLayoutState ( ) { 
        const newlayout = layout == 'force' ? 'date' : 'force';
        setLayout (newlayout)
   }

   // -- date filter function allows for more nuance -- // 
  function filterByDate (range) {
     // -- conditions -- //
     let lessThan = (a, b) => a < b;
     let greaterThan = (a, b) => a > b; 
     let equalTo = (a, b) => a == b; 
     let isBetween = (a, b, c) => a > b && a < c; 
     // -- filter makers and return -- // 
     let  filter = base_makers.filter (m =>  isBetween (m.date_1, range[0], range[1]));
     return filter;
   }

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

  // -- a higher order function -- // 
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


    // -- hand data click callback --

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





  // ----- JSX ---- // 
  return (
    <div>
      <h3>ToK into React</h3>
      <Button variant="text" onClick={toggleLayoutState}>toggle layout</Button>

      
      <div className="vis-container">
        {/*<VisualizationComponent data={data} />*/}
        <svg width={1000} height={600}>
              <ForceDirectComponent 
                data={socialGroups} 
                layout={layout}
                selectedItem ={selectedItem}
                onDataClick={handleDataClick}
                onItemClick={handleItemClick}
                />
              


              {/*{renderChildComponents()}*/}
    
            <BarsComponent
                data={townGroups} 
                ypos={10}
                type={'location'}
              />
              <BarsComponent
                data={guildGroups} 
                ypos={70}
                type={'guilds'}
              />


        </svg>
      </div>
      
      <div className="slider-container">
       <Slider
            size="small"
            value={sliderRange}
            onChange={handleSliderChange}
            onChangeCommitted={handleSliderEnd}
            getAriaLabel={() => 'date range'}
            min={1400}
            max={1930}
            step={1}
            valueLabelDisplay="on"
        />
      </div>

  
   
    </div>
  );
  // -------------------------// 
};

export default App;

// -------------------------------- //


























