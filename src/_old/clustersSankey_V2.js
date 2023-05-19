import *  as d3 from 'd3';
import * as  Vec2D from 'victor';
import * as _root from './mainV2.js'

import * as d3_sankey from 'd3-sankey';

// npm install d3-sankey


export class BlockClass  { 

	constructor (svg, nodes, groupdata, loc) { 
				this.svg = svg;
				this.groupDOM =  this.svg.append ('g').attr ('id', 'blockGroup'); // the element to add clusters
				
				this.data = groupdata; // -- all 
				this.loc = loc; 

				// -- set the position of the group 
				this.groupDOM.attr ('transform', 'translate('+this.loc.x+','+this.loc.y+')')

				// -- CREATE 'blocks' (groups clusters)
				this.blocks = [ ];
				this.data.forEach (d => { 
					let block = new BlockItem (d, this.groupDOM, this); 
					this.blocks.push (block)
				})

				// get total number of nodes in this block (to work out percentage)


				// -- FILTER 
				//this.filterBlocks ( );
				//this.filterBlocks_byDate(1800);


				// -- SET LOCS (after) -- // 
				this.setLocations( );

				// -- DRAW 
				this.drawBlocks( )
  }

  // -- filter and updade 
  filterAndReDraw (date) { 
		this.filterBlocks_byDate(date);
		this.setLocations( );
		this.drawBlocks( )
  }

  // ------ // 
  setLocations ( ) { 
		// -- Set Loc for each block item
		this.blocks.forEach ((b, i) => { 
				let x = 0; 
				let y = 0; 
				let spacing = 2; // gaps between
				// -- the issue is that gaps are created even when a block has no itesms 

				if (i>0) {
					let prevblock = this.blocks[i-1]
					let prevX = prevblock.data.x; 
					let prevW = prevblock.width; //data.w; // prevblock.nodes.length; ///prevblock.data.w; 
					x = prevX + prevW + spacing; // x pos of entire 
				} 

				b.setLoc (x, 0)
		})
  }

  // ------ // 
  drawBlocks ( ){ 
			this.blocks.forEach (b => { 
					b.drawGroup ( )
			})
  }

  // ------ // 
  filterBlocks ( ) { 
			// -- remove some elements (e.g. 'none');//
  		//console.log ('blocks ', this.blocks)
  		// -- use other types of condition -- // 
  		this.blocks = this.blocks.filter (b => b.data.name != '_none' )
  		//console.log ('block filter = ', filter)
	}

	// ----- // 
	filterBlocks_byDate (year){ 
		this.blocks.forEach ((b, i) => { 
			let dateSelection =  b.selectByDate (year); // this creates a date filter.. (a 'selection ')

			//if (i==25) console.log ('date selection ', dateSelection)
			// if (i== 26) {
			// 	console.log ('date selection = ', i,  ' : ', dateSelection)
			// 	console.log ('base nodes  ', i, ' : ',  b.nodes_base_group)
			// 	console.log ('data nodes', i, ' : ',  b.data.nodes)
			// }

			
			b.updateNodesInGroups(dateSelection)
			

			//b.updateNodes (dateSelection); // update nodes in cluster 
			//if (i== 26) {
			//b.updateNodes (dateSelection) // ** changes base ?? 
			//b.data.nodes = [b.nodes];

			// -- update widths -- // 
			// -- item widths -- // 
			b.data.nodes [0]['w'] = b.data.nodes[0].length * 5; // b.setWidth (b.nodes)
			if (b.data.nodes.length > 1)b.data.nodes [1]['w'] = b.data.nodes[1].length * 5;
			
			// - block width -- 
			b.width =  b.nodes.length * 5; // TOTAL WIDTH 
			

			//b.data['w'] =  b.setWidth (b.data.nodes)
			// console.log ('base ', b.nodes_base)
			// console.log ('nodes (filtered) ', b.nodes)
			// console.log ('data nodes (filtered)', b.data.nodes)
			// console.log ('----------------------')
			// console.log ('date filter =' , filteredItems)
			//b.nodes = filteredItems;
			//b.data.nodes = [filteredItems]
			//this.clusterdata[i].nodes = filterednodes; 
			//return [...this.nodes]
			//b.splitGroupByConditon( ); // 're' split..
		})

	}
}


export class BlockItem  { 

  // each block is sorted and drawn 

  constructor (data, dom, parent) { 
  	this.data = data;
  	this.domElement  = dom;

  	// - base nodes need to be in an array -- // 

  	// - base nodes 
  	this.nodes_base = this.data.nodes; // 'source nodes' (remain unchanged)
  	this.nodes = [...this.nodes_base]; // all nodes (ungrouped)


  	// -- nodes put in groups
  	this.nodes_base_group = [[...this.nodes_base]] // base nodes [grouped]
  	this.data.nodes = [this.nodes] ;// nodes (filtered )


  	// console.log ('nodes ', this.nodes)
  	// console.log ('data nodes ', this.data.nodes)
  	// console.log ('base nodes ', this.nodes_base)
  	// console.log ('-------------------')

  	//console.log ('data ', this.data)
  
  	// set width attributes - for enire block and for grouped nodes 
  	//this.data ['w'] = this.setWidth (this.nodes); // this.nodes.length // a width value (total width)
  	this.data.nodes [0]  ['w'] = this.setWidth (this.nodes); // this.nodes.length
  	// data nodes [0] is the 'main' group

  	// perhaps have a loc for the whole item -- 

  	this.loc; 
  	this.width = this.nodes.length * 5; // width of the block

  	// --- //
  	this.splitGroupTest_Base_redo( );
  	//this.splitGroupTest_Base( )
  	//this.splitGroupByConditon( );
  	//this.drawGroup ( );
  }

  // --  loc of block
  setLoc (x, y) { 
  	// x and y are relative to the group loc 
  	this.data['x'] = x; 
  	this.data['y'] = y;
  	this.loc = {x: x, y: y}
  }	

  setWidth (array) { 
  	return array.length * 5; // width of an array
  }

  updateWidth ( ) { 


  }

  createGroup ( ) { 

  }

  // -- DRAW the group as one item 
  drawGroup ( ) { 
		// this.group = this.domElement.selectAll ('#' + this.data.name)
		let data  = [this.data]; // data needs to be in an array format
		//console.log ('this data  = ', data)
  	
  	// -- DRAW SINGLE BLOCK -- // 
  	// this.domElement.selectAll ('#' + this.data.name)
  	// 		.data (data)
		// 		.join(
		//       function(enter) {
		//         return enter.append('rect')
		//       },

		//       function(update) {
		//          return update.attr('opacity', .3);
		//       },

		//       function (exit) { 
		//       	return exit.remove ( )
		//       }
		// 		)
		// 	.attr ('id', d => this.data.name)
		// 	.attr ('width', this.width)
		// 	.attr ('height', 40)
		// 	.attr ('x', d => d.x)
		// 	.attr ('y', d => d.y)
		// 	.attr ('fill', 'orange')
		// 	.attr ('opacity', 1)

		// -- draw nodes within the group -- // 

		// -- DRAW INDIVIDUAL ITEMS
		let nodeData = [this.data.nodes] // -- returns nodes[ [0] [1]]
		 //console.log ('draw nodes = ', this.data.nodes)
		this.domElement.selectAll ('#' + this.data.name + '_group')
			.data (nodeData[0])
			.join(
		      function(enter) {
		        return enter.append('rect')
		      },

		      function(update) {
		         return update.attr('opacity', .3);
		      },

		      function (exit) { 
		      	return exit.remove ( )
		      }
				)
			.attr ('id', d => this.data.name + '_group' )
			.attr ('width', d => d.w)
			.attr ('height', 100)
			.attr ('x', (d, i) => { 
				//console.log (' d = ', d)
				//console.log ('i = ', i)
				let prevW = 0;
				if (i>0) {
					// get the sum total of previous widths --
					prevW = nodeData[0].slice(0, i).reduce((acc, cur) => acc + cur.w, 0);
					prevW += 0;
				}
				return  this.loc.x + i * prevW
				})
			.attr ('y', this.loc.y)
			.attr ('fill', (d, i) => { 
				let c;
				i==0 ? c='orange' : c='blue';
				return	c
			})
			.attr ('opacity', 1)


  }

  // -- FILTER nodes in groups -- // 


	selectByDate (maxDate) {
		 // -- conditions -/
		 let lessThan = (a, b) => a < b; // -- USE THIS -- //
		 let greaterThan = (a, b) => a > b; 
		 let equalTo = (a, b) => a == b; 
		 let isBetween = (a, b, c) => a > b && a < c; 

		 //console.log ('nodes - ', this.nodes_base )
		 //console.log ('root nodes ', _root.base_nodes.map (n => n.id));

		 // -- filter node data --
		 let dateFilter = this.nodes_base.filter (n => { 
		 			let baseNode = _root.base_nodes.find (bn => bn.id === n); // find matching source nodes (from base nodes)
		 			return lessThan (baseNode.date_1, maxDate); 
			})

		 //console.log ('base nodes in block (unchanged) ', this.nodes_base)
		 // base nodes should not change 

		 // -- filter node data in GROUPS 
		 let dateFilterGroups = [ ]; 
		 this.nodes_base_group.forEach ((group, i) => { 
		 		 	let dateFilter = group.filter (n => { 
						let baseNode = _root.base_nodes.find (bn => bn.id === n); // find matching source nodes (from base nodes)
			 			return lessThan (baseNode.date_1, maxDate); 
					})
					//console.log ('date filter ', i, ' , ', dateFilter)
					dateFilterGroups.push (dateFilter)
		 })

		 // -- filter all of the groups nodes [ [0] [1] [2]] etc 
		 // -- the SPLIT group DOES change.. 
		 //console.log ('base nodes groups in block  ', this.nodes_base_group) 
		 
		 //console.log ('date filter = ', dateFilter)
		 //console.log ('date filter group = ', dateFilterGroups)
		 //console.log ('-----------------------------')

		 //return dateFilter; 
		 return dateFilterGroups; // return in groups [ ] [ ]
	 }


  updateNodes(selection) { 
  		// diff - shows which nodes to add and which nodes to remove 
  	 //console.log ('date selection = ', selection)
  	 //console.log ('nodes =', this.nodes)
  	 //console.log ('nodes2 =', this.data.nodes[0])
  	 // the selection is a 2d array -- // 
		 	let diff = { 
					toRemove :  this.data.nodes[0].filter(node =>  selection[0].indexOf(node) === -1), // remove nodes NOT in SELECTION 
				  toAdd :     selection[0].filter (node =>  this.data.nodes[0].indexOf (node) === -1) // ADD nodes in seection that are NOT in nodes.
			}
			
			//console.log ('diff = ', diff)
			// update this.nodes :  remove those from 'remove' // add those from 'add '
			diff.toRemove.forEach (node => this.data.nodes[0].splice (this.data.nodes[0].indexOf(node), 1)) ; // REMOVE nodes from 'toRemove' 
			diff.toAdd.forEach(node => this.data.nodes[0].push(node)) ; // ADD nodes from 'toAdd'

			//return [...this.nodes]
  }

  updateNodesInGroups (selection) { 
  		// add or remove nodes 
  		// this MODIFIES thie originaal (nodes_data_base )- when it should NOT.. 
  		console.log ('selection = ', selection)
  		

  		selection.forEach ((group, i)  => { 
  			//console.log ('group = ', group)

  			let diff = { 
						toRemove :  this.data.nodes[i].filter(node =>  selection[i].indexOf(node) === -1), // remove nodes NOT in SELECTION 
				  	toAdd :     selection[i].filter (node =>  this.data.nodes[i].indexOf (node) === -1) // ADD nodes in seection that are NOT in nodes.
				}

				diff.toRemove.forEach (node => this.data.nodes[i].splice (this.data.nodes[i].indexOf(node), 1)) ; // REMOVE nodes from 'toRemove' 
				diff.toAdd.forEach(node => this.data.nodes[i].push(node)) ; // ADD nodes from 'toAdd'
  		})

  }




  // -- SPLIT the group of nodes into sections -- each section is drawn a different way
  splitGroupTest ( ) { 
  	// split nodes into groups -- // 
  	//let splitPoint = 10;
  	if (this.data.nodes[0].length > 5) {   		
  		// -- make a selection and filter the nodes 
  		let selection = this.data.nodes[0].slice (5, this.data.nodes[0].length-1);
  		
  		this.data.nodes[0] = this.data.nodes[0].filter (n => selection.includes (n) == false)


  		//this.setWidth (this.data.nodes[0]); // -- update width
  		this.data.nodes[0] ['w'] = this.setWidth (this.data.nodes[0]); // -- update width


  		// -- push selected group as a new group array -- // 
  		let nodeGroup =  selection ; // [itemID];
  		nodeGroup ['w'] = this.setWidth (nodeGroup);
  		//this.setWidth (nodeGroup);

  		this.data.nodes.push (nodeGroup)
  	} 

  }
  	// -- re- do this ! -- // s
  splitGroupTest_Base_original ( ) { 
	  	// split BASE NODEs into groups -- // 
	  	//let splitPoint = 10;
	  	if (this.nodes_base_group[0].length > 100) {   		
	  		// -- make a selection and filter the nodes 
	  		let selection = this.nodes_base_group[0].slice (100, this.nodes_base_group[0].length-1);
	  		this.nodes_base_group[0] = this.nodes_base_group[0].filter (n => selection.includes (n) == false)
	  		//this.setWidth (this.data.nodes[0]); // -- update width

	  		// -- push selected group as a new group array -- // 
	  		let nodeGroup =  selection ; // [itemID];
	  		this.nodes_base_group.push (nodeGroup)

	  		// -- find another way to split ?? -- split nodes and then make a copy ?? 

	  		// update width values
	  		nodeGroup ['w'] = this.setWidth (nodeGroup);
	  		this.nodes_base_group[0] ['w'] = this.setWidth (this.nodes_base_group[0]); // -- update width

	  		// update data nodes (to draw and filter)
	  	 	this.data.nodes = [...this.nodes_base_group]

	  	 	// 
	  	 	//console.log ('nodes base group')
	  	} 

  }

   splitGroupTest_Base ( ) { 
	  	// split BASE NODEs into groups -- // 
	  	//let splitPoint = 10;
	  	if (this.data.nodes[0].length > 100) {   		
	  		// -- make a selection and filter the nodes 
	  		let selection = this.data.nodes[0].slice (100, this.data.nodes[0].length-1);
	  		this.data.nodes[0] = this.data.nodes[0].filter (n => selection.includes (n) == false)
	  		//this.setWidth (this.data.nodes[0]); // -- update width

	  		// -- push selected group as a new group array -- // 
	  		let nodeGroup =  selection ; // [itemID];
	  		this.data.nodes.push (nodeGroup)

	  		// -- find another way to split ?? -- split nodes and then make a copy ?? 

	  		// update width values
	  		nodeGroup ['w'] = this.setWidth (nodeGroup);
	  		this.data.nodes[0] ['w'] = this.setWidth (this.nodes_base_group[0]); // -- update width

	  		// update data nodes (to draw and filter)
	  		this.nodes_base_group = [...this.data.nodes]

	  	 	//this.data.nodes = [...this.nodes_base_group]

	  	 	// 
	  	 	//console.log ('nodes base group')
	  	} 

  }

  splitGroupTest_Base_redo ( ) { 

  		// -- 
  		//console.log ('base nodes ', this.nodes_base_group)
  		//console.log ('data nodes ', this.data.nodes)
	  	// split BASE NODEs into groups -- // 
	  	//let splitPoint = 10;
	  	if (this.data.nodes[0].length > 100) {   		
	  		// -- make a selection and filter the nodes 
				//this.data.nodes[0] = this.data.nodes[0].slice (100, this.data.nodes[0].length-1);
				//this.data.nodes[0] ['w'] = this.setWidth (this.data.nodes[0]); // -- update width !!!


	  		let selection = this.data.nodes[0].slice (100, this.data.nodes[0].length-1);
	  		let selection2= this.data.nodes[0].slice (0, 99);

	  		this.data.nodes[0] = selection; //  this.data.nodes[0].filter (n => selection.includes (n) == false)
	  		this.nodes_base_group[0] = [...selection]; // this.nodes_base_group[0].filter (n => selection.includes (n) == false)

	  		//this.setWidth (this.data.nodes[0]); // -- update width

	  		this.data.nodes[0] = selection; //  this.data.nodes[0].filter (n => selection.includes (n) == false)
	  		this.nodes_base_group[0] = [...selection]; // this.nodes_base_group[0].filter (n => selection.includes (n) == false)

	  		// -- push selected group as a new group array -- // 
	  		//let nodeGroup =  selection ; // [itemID];
	  		this.data.nodes.push (selection2)
	  		this.nodes_base_group.push ([...selection2])


	  		// -- find another way to split ?? -- split nodes and then make a copy ?? 

	  		// update width values
	  		//nodeGroup ['w'] = this.setWidth (nodeGroup);
	  		selection2 ['w'] = this.setWidth (selection2);
	  		this.data.nodes[0] ['w'] = this.setWidth (this.data.nodes[0]); // -- update width

	  		// update data nodes (to draw and filter)
	  	 	//this.nodes_base_group = [...this.data.nodes]
	  	 	//this.data.nodes = [... this.nodes_base_group]

	  	 	
	  	 	//console.log ('nodes base group')
	  	} 

	 	//console.log ('data nodes ', this.data.nodes)
	  //console.log ('base nodes ', this.nodes_base_group)
  	//console.log ('data nodes ', this.data.nodes)


  }



  splitBaseNodes ( ){ 
  		// split base nodes -- (once)- but don't filter.. 



  }

  splitGroupByConditon ( ){ 
  	// e.g 'town = london'

  	let selection = [ ]; 
  	console.log (' this data nodes ', this.data.nodes)
  	console.log (' this base nodes ', this.nodes)
  	console.log ('----------------------------------')


  }


  splitGroupBySelection ( ) {




  }

  queryNodesByAttribute (att, value) { 
	 		// // -- find node with the same id - extract towns - if towns include (x) push to array - // 
	 		// // -- starting with (towns = london etc)
	 		// let selection = [ ]; 
	 		// this.nodes.forEach ( n => { 
			// 	let item = this.layout.nodes.find (node => node.id == n.id)[att];
			// 	if (item.includes (value)) selection.push (n)
	 		// })

	 		// console.log ('selection = ', selection);
	 		// console.log ('current selected = ', this.selectedNodes)

	 		// // -- UPDATE selected nodes (filter current selection ) -- // 
	 		// this.selectedNodes =  this.selectedNodes.filter(node => selection.map(newnode => newnode.id).includes(node.id));
	 		// //this.selectedNodes = selection; //  

	 		// console.log ('new selected = ', this.selectedNodes)
			// // console.log ('nodes = ', this.nodes)
	 		// // console.log ('foundnodes = ', this.selectedNodes)
	 		// // console.log  ('selected nodes = ', this.selectedNodes)
	 		// // console.log ('new ', filteredArray)
	 		// this.drawShapeNodes( )
	 }







}




export class Layout_Sankey { 
		// each layout is a block in a sankey-type layout. 
		constructor (svg, nodes, clusterdata) { 
				this.svg = svg;
				this.clusterDOM =  this.svg.append ('g').attr ('id', 'sankeyGroup'); // the element to add clusters
				this.data = clusterdata;
				this.nodes = nodes;

				//this.init( )
				//this.sankeyTest( );
				//this.blockLayoutTest( );

				console.log ('cluster data [1] = ', clusterdata)
				// get some date and subdivide it.. 
				// a sample set of nodes = 

				//this.sortIntoGroupsTest( );

				let testnodes = this.data[1].nodes;
				console.log ('node test ', testnodes); // -- original nodes 

				// CREATE GROUP
				// 1. push (group) nodes into array 
				let nodeGroups = [ testnodes ]; 
				console.log ('node group = ', nodeGroups) // -- nodes pushed into a group 

				// FILTER by CONDITION 
				// 2. sort node groups by condition.. (e.g specific attribute)
				let condition = d => d ['towns'].includes ('London')

				// look at group[0] -
				let group0_root = this.nodes.filter(node => nodeGroups[0].includes (node.id)); // get the root nodes
				console.log ('root nodes for group 0 ', group0_root);

				// 3. sort group[0] according to condition.. Yes or No
				let group0_yes = group0_root.filter (n =>  condition(n)).map (n => n.id); // YES (ids)
				let group0_no  = group0_root.filter (n => !condition(n)).map (n => n.id); // NO  (ids)
				console.log ('yes nodes ', group0_yes);
				console.log ('no nodes ',  group0_no);

				// 4. update / filter group[0] (yes) and push (no) to next group
				nodeGroups[0] = nodeGroups[0].filter (n => group0_yes.includes(n)); // filter group [0]
				nodeGroups.push (group0_no)
				console.log ('new node group ', nodeGroups)

				// 5. draw node groups.. 
				//-- for each group draw a box 
			

		}

		init ( ) { 
			this.clusterDOM.attr ('transform','translate(200,400)'); // enclosing group for the shape -- // 

			

		}

	// -- block sort - draw - test -- // 

	blocksortTest ( ) {

			// - sample nodes 


				// -- sort -- 

				// 0. don't sort 

				// 1. sort by condition 


				// 2. sort by selection (i.e. )

				// -- draw -- 
				


				

	}

	sortIntoGroupsTest ( ) { 
				let samplenodes = [1740, 1751, 1983, 1984, 3426, 3942, 10321];
				
				// - sort into two groups 
				let myCondition = a => a < 3000;
				let group1 = samplenodes.filter (n => myCondition(n))
				let group2 = samplenodes.filter (n => !myCondition(n))

				
				// get the source node for ref and 
				let orgnodes = this.nodes.filter(node => samplenodes.includes (node.id))
				// apply a condition -- // 
				let newConditon = a => a['towns'].includes ('London')
				let groupA = orgnodes.filter (n => newConditon(n)).map (n => n.id);
				let groupB = orgnodes.filter (n => !newConditon (n)).map (n => n.id)
			
				console.log (group1)
				console.log (group2)
				console.log ('---------------------')
				console.log (groupA)
				console.log (groupB)

				let groupedNodes = []; // empty 2d array 


				//groupedNodes.push (samplenodes);
				// for each of the nodes select some and push into a su


				//console.log ('sankey nodes = ', nodes)
				//console.log ('clusters = ', this.data)
				//console.log ('grouped nodes = ', groupedNodes)

	}

	// -- rect test -- // 
 rectTest ( ) { 
		this.rectShape = this.clusterDOM.selectAll ('#rectShape');
					let data = [1, 3, 4, 5, 6, 7];
					this.rectShape = this.clusterDOM.selectAll ('#rectShape')
					 	.data(this.data)
				    .enter()
				    .append('g')
				    
		this.clusterDOM.append ('rect')
									.attr ('x', 0)
									.attr ('y', 0)
									.attr ('width', 30)
									.attr ('height', 20)
									.attr ('fill', 'red')

 }


	// -- some test layouts -- // 
	blockLayoutTest ( ) { 
		let data2 = [10, 20, 30, 40, 50]; // node values - count 
		this.clusterDOM.append("g").attr('id', 'blocktest')
				.selectAll ('#block')
				.data (data2)
				.enter( )
				.append ('rect')
				.attr('id', 'block')
	}

	// - 
	sankeyTest ( ) { 
			let sankeydata = {
  			nodes: [
			   	{name: "Node 1"},
			    {name: "Node 2"},
			    {name: "Node 3"},
			    {name: "Node 4"}
  			],
  	links: [
    			{source: 0, target: 1, value: 10},
    			{source: 1, target: 2, value: 20},
    			{source: 1, target: 3, value: 30}
  			]
			};

			// Define the layout
			this.sankey = d3_sankey.sankey()
			  .nodeWidth(15)
			  .nodePadding(10)
			  .size([500, 500]);

			this.sankeygraph = this.sankey(sankeydata);

			// Render the nodes
			this.clusterDOM.append("g").attr('id', 'sankeytest')
			  .selectAll(".sankeynode")
			  .data(this.sankeygraph.nodes)
			  .enter()
			  .append("rect")
			  .attr("class", "sankeynode")
			  .attr("x", function(d) { return d.x0; })
			  .attr("y", function(d) { return d.y0; })
			  .attr("width", function(d) { return d.x1 - d.x0; })
			  .attr("height", function(d) { return d.y1 - d.y0; });


		}

		drawGroup ( ) { 


		}


}





export class ClusterClass_Sankey { 

	constructor (){ 
	
	}



}






























