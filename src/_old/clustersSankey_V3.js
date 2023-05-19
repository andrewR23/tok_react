import *  as d3 from 'd3';
import * as  Vec2D from 'victor';
import * as _root from './mainV2.js'

import * as d3_sankey from 'd3-sankey';

console.log ('v4')

export class BlockClass  { 

	constructor (svg, groupdata, loc) { 
				this.svg = svg;
				this.groupDOM =  this.svg.append ('g').attr ('id', 'blockGroup'); // the element to add clusters
				
				this.data = [...groupdata]; // -- all 
				this.data_root = [...groupdata]


				this.loc = loc; 

				// -- set the position of the group 
				this.groupDOM.attr ('transform', 'translate('+this.loc.x+','+this.loc.y+')')

				// -- CREATE 'blocks' (groups clusters)
				this.blocks = [ ];
				this.data_root.forEach (d => { 
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

				// -- ADD text -- / 
				this.svg.append("text")
					  .attr("x", this.loc.x + 2) // Center the text horizontally
					  .attr("y", this.loc.y -5) // Position the text at 30 pixels from the top
					  .attr("text-anchor", "left") // Center the text vertically
					  .attr("font-size", "14") // Set the font size to 24 pixels
					  .text(this.data[0].type); // Set the text to "My Chart Title"
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
  		// -- use other types of condition -- // 
  		this.blocks = this.blocks.filter (b => b.data.name != '_none' )
  		//console.log ('block filter = ', filter)
	}

	// ----- // 
	filterBlocks_byDate (year){ 
		this.blocks.forEach ((b, i) => { 
			let dateSelection =  b.selectByDate (year); // this creates a date filter.. (a 'selection ')
			b.updateNodesInGroups(dateSelection) ; // update data 

			// -- update  item widths -- // 
			b.data.nodes.forEach ((group, i) => { 
					b.data.nodes [i]['w'] = b.data.nodes[i].length * 5; // b.setWidth (b.nodes)

			})
			// -update block width -- 
			b.width = b.getNodeLength( ) * 5; // b.nodes.length * 5; // TOTAL WIDTH 
		})

	}

	// ----- // 
	splitBlockBySelection (selection) { 
		this.blocks.forEach (b => { 
			 b.splitItemBySelection(selection)
			 b.drawGroup( );

		})
	}
}

// ---------------------------------- // 
export class BlockItem  { 

  // each block is sorted and drawn 

  constructor (data, dom, parent) { 
  	this.data = data;
  	this.domElement  = dom;

  	// - base nodes 
  	this.nodes_base = this.data.nodes; // 'source nodes' (remain unchanged)

  	// -- nodes put in groups
  	this.nodes_base_group = [[...this.nodes_base]] // base nodes [grouped] (remain unchanged)
  	
  	this.data.nodes = [[...this.nodes_base]] ;// nodes (filtered ) a 2d array of groups 

  	// -- selected nodes  -- update -- // 
  	this.selectedNodes = this.data.nodes[0]; 

  	// -- set width attributes - for enire block and for grouped nodes 
  	this.data.nodes [0]  ['w'] = this.setWidth (this.data.nodes[0]); // this.nodes.length
  	this.width =  this.getNodeLength( ) * 5; // widths as total nodes 

  	// -- loc 
  	this.loc; 

  	// -- test split 
  	//this.splitGroupTest( ); // divide into two groups (by number.. )
  	//this.splitItemByConditon ( )
  }

  // --  loc of block
  setLoc (x, y) { 
  	// x and y are relative to the group loc 
  	this.data['x'] = x; 
  	this.data['y'] = y;
  	this.loc = {x: x, y: y}
  }	

  getNodeLength ( ){ 
  	let nodeCount = 0; 
  	this.data.nodes.forEach ((nodes, i) => nodeCount += nodes.length)
  	return nodeCount;
  }

  setWidth (array) { 
  	return array.length * 5; // width of an array
  }

  updateWidth ( ) { 


  }


  // -- DRAW the group as one item 
  drawGroup ( ) { 
		let data  = [this.data]; // data needs to be in an array format
		//console.log ('this data  = ', data)
  	
  	// -- DRAW SINGLE BLOCK -- // 
  	this.domElement.selectAll ('#' + this.data.name)
  			.data (data)
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
			.attr ('id', d => this.data.name)
			.attr ('width', this.width)
			.attr ('height', 10)
			.attr ('x', d => d.x)
			.attr ('y', d => d.y)
			.attr ('fill', 'orange')
			.attr ('opacity', .4)

		// -- draw nodes within the group -- // 

		// -- DRAW INDIVIDUAL ITEMS (as a sub-)
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
			.attr ('height', 20)
			.attr ('x', (d, i) => { 
				//console.log (' d = ', d)
				//console.log ('i = ', i)
				let prevW = 0;
				if (i>0) {
					// add the sum total of previous widths --
					prevW = nodeData[0].slice(0, i).reduce((acc, cur) => acc + cur.w, 0); // accumator (add up all the widths )
					prevW += 0;
				}
				return  this.loc.x + i * prevW
				})
			.attr ('y', this.loc.y)
			.attr ('fill', (d, i) => { 
				return this.isSelectedArray (d, i) ? 'red' : 'gray'
			})
			.attr ('opacity', (d, i)=> { 
				return this.isSelectedArray (d, i) ? '0.5'  : '0.3'
			})

 		 // -- on click -- 
  	// -- add event -- // 
		this.domElement.on ('click', this.clickBlock.bind (this))
		this.domElement.on ('mouseover', this.rollBlock.bind (this))
		this.domElement.on ('mouseout', this.rollout.bind (this))

		// this.domElement.on ('mouseover', function ( ){ 
		// 	console.log ("----------------", this.data)

		// })


  }

  clickBlock (item) { 
  	//console.log ('click block')
  	//console.log ('selected ', item.target.__data__)
  	let selection = (item.target.__data__);
  	_root.showSelection (selection)

  	//_root.showSelection (selection)

  }

  rollBlock (item) { 
  	let id = item.target.id.replace("_group", "");
  	_root.tooltip.innerHTML = id;
  	_root.tooltip.style.left  = event.clientX + "px";	
		_root.tooltip.style.top = event.clientY-50 + "px";
  }

  rollout (item) { 
		_root.tooltip.style.left  = "-100px";	
		_root.tooltip.style.top =  "-100px";

  }



  isSelectedArray (d, i) { 
		// -- check to if this node is in the node selection -- // -- all nodes start with
		// -- array [0] is 'selected'
		return i == 0 ?  true : false ; 
		//return d === this.selectedNodes ? true : false; // if the array is the same / 
	}



  // -- FILTER nodes in groups -- // 

  // -- create selections (groups) -- 
	selectByDate (maxDate) {
		 // -- conditions -/
		 let lessThan = (a, b) => a < b; // -- USE THIS -- //
		 let greaterThan = (a, b) => a > b; 
		 let equalTo = (a, b) => a == b; 
		 let isBetween = (a, b, c) => a > b && a < c; 

		 // -- filter node data  GROUPS 
		 let dateFilterGroups = [ ]; 
		 this.nodes_base_group.forEach ((group, i) => { 
		 		 	let dateFilter = group.filter (n => { 
						let baseNode = _root.base_nodes.find (bn => bn.id === n); // find matching source nodes (from base nodes)
			 			return lessThan (baseNode.date_1, maxDate); 
					})
					//console.log ('date filter ', i, ' , ', dateFilter)
					dateFilterGroups.push (dateFilter)
		 })

		 return dateFilterGroups; // return in groups [ ] [ ]
	 }

	// -- update DATA -- // 
  updateNodesInGroups (selection) {   	
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
  		// -- a test -- // 
	  	if (this.data.nodes[0].length > 4) {   		
	  		// -- make a selection and filter the nodes 
	  		let selection1 = this.data.nodes[0].slice (4, this.data.nodes[0].length-1);
	  		let selection2 = this.data.nodes[0].slice (0, 5);

	  		selection1 ['w'] = this.setWidth (selection1)
	  		selection2 ['w'] = this.setWidth (selection2);

	  		this.data.nodes[0] = selection1; //  
	  		this.nodes_base_group[0] = [...selection1]; //

	  		// -- push selected group as a new group array -- // 
	  		this.data.nodes.push (selection2)
	  		this.nodes_base_group.push ([...selection2])

	  		this.selectedNodes = this.data.nodes[0]

	  	} 
  }

// --------------------- // 
  // -- query by attribute -- // 
  splitItemByConditon ( ){ 
  	// e.g 'town = london'
  	//let selection = [ ]; 
  	// get all nodes that meet the condition and all those that don't.

  	// -- get a selection that meets a criteria
  	let att = 'towns'
  	let value = 'London'
  	//let selection = this.data.

  	let selection1 = this.data.nodes[0].filter (n => n > 3000 == true)
  	let selection2 = this.data.nodes[0].filter (n => selection1.indexOf (n) == -1)
  	//let selection2 = this.data.nodes[0].filter (n => n > 3000 == false )
  	
  	//console.log ('selection = ', selection1)
  	selection1 ['w'] = this.setWidth (selection1);
  	selection2 ['w'] = this.setWidth (selection2);

  	this.data.nodes[0] = selection1; // ALL SELECTED go into array [0]
  	this.nodes_base_group[0] = [...selection1]; // a copy

  	this.data.nodes.push (selection2) // 
  	this.nodes_base_group.push ([...selection2])
  	//console.log (' this data nodes ', this.data.nodes)
  	//console.log (' this base nodes ', this.nodes_base_group)
  	//console.log ('----------------------------------')

  	this.selectedNodes = 	this.data.nodes[0]; //-- needed ?? 
  	// this.data.nodes[0]= this.selectednodes. 

  }


  splitItemBySelection (selection) {
  	//console.log ('selection =', selection)
  	//console.log ('data in block = ', this.data.nodes)

  	//let i = this.data.nodes.length-1
  	let selection1 = this.data.nodes[0].filter (n => selection.indexOf(n) != -1); 
  	let selection2 = this.data.nodes[0].filter (n => selection.indexOf(n) == -1);




  	// -- // 
  	selection1 ['w'] = this.setWidth (selection1);
  	selection2 ['w'] = this.setWidth (selection2);

  	// group 0 
  	this.data.nodes[0] = selection1; // ALL SELECTED go into array [0]
  	this.nodes_base_group[0] = [...selection1]; // a copy

  	// group 1
  	this.data.nodes.push (selection2) // 
  	this.nodes_base_group.push ([...selection2])
  

  	//this.selectedNodes = 	this.data.nodes[0]; //-- needed ?? 

  	// --re-draw ?? 
  	//this.drawGroup( );

  }

  queryNodesByAttribute (att, value) { 
	 		// -- find node with the same id - extract towns - if towns include (x) push to array - // 
	 		// -- starting with (towns = london etc)
	 		let selection = [ ]; 
	 		this.nodes.forEach ( n => { 
				let item = this.layout.nodes.find (node => node.id == n.id)[att];
				if (item.includes (value)) selection.push (n)
	 		})

	 		console.log ('selection = ', selection);
	 		console.log ('current selected = ', this.selectedNodes)

	 		// -- UPDATE selected nodes (filter current selection ) -- // 
	 		this.selectedNodes =  this.selectedNodes.filter(node => selection.map(newnode => newnode.id).includes(node.id));
	 		//this.selectedNodes = selection; //  

	 		console.log ('new selected = ', this.selectedNodes)
			// console.log ('nodes = ', this.nodes)
	 		// console.log ('foundnodes = ', this.selectedNodes)
	 		// console.log  ('selected nodes = ', this.selectedNodes)
	 		// console.log ('new ', filteredArray)
	 		this.drawShapeNodes( )
	 }


}

// ---------------------------------- // 

































