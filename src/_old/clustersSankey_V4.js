import *  as d3 from 'd3';
import * as  Vec2D from 'victor';
import * as _root from './mainV3.js'

import * as d3_sankey from 'd3-sankey';

console.log ('cluster v4')

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
		console.log ('set locations')
  	//console.log ('blocks ', this.blocks)

		this.blocks.forEach ((b, i) => { 
				let x = 0; 
				let y = 0; 
				let spacing = 10; // gaps between
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
			b.selectByDate (year); // 
			b.width = b.data.nodes.length * 5;  // update block width // 

			//b.updateNodesInGroups(dateSelection) ; // update data nodes.
			// -- update  item widths -- // 
					// b.data.nodes.forEach ((group, i) => { 
					// 	//	b.data.nodes [i]['w'] = b.data.nodes[i].length * 5; // b.setWidth (b.nodes)
					// })
					// -update block width -- 
					//b.width = b.getNodeLength( ) * 5; // b.nodes.length * 5; // TOTAL WIDTH 
		})

	}

	// ----- // 
	splitBlockBySelection (selection) { 
		this.blocks.forEach (b => { 
				b.splitItemBySelection(selection, 'subtractive');
			 	b.drawGroup( );

		})
	}
}

// ---------------------------------- // 
export class BlockItem  { 

  // each block is sorted and drawn 

  constructor (data, dom, parent) { 
  	this.data = data; // source data to draw the block 
  	this.domElement  = dom;

  	// - base nodes 
  	this.nodes_base = this.data.nodes; // 'source nodes' (remain unchanged)
  	this.nodes = [... this.data.nodes]; // nodes to use.. 

  	// -- create a 'base' of selected and unselcted (to allow filtering in and out)
  	this.selected_base   =  [ ]; //this.nodes; 
  	this.unselected_base = this.nodes;

  	// -- add an object to grup nodes into different blocks 
  	this.nodeGroup = { selected: [ ], unselected: [ ], default : [ ] }

  	// -- apply group to the data object -- // 
  	this.data.nodeGroup = this.nodeGroup;
  	this.data.nodeGroup.selected = 		[...this.selected_base];
  	this.data.nodeGroup.unselected =  [...this.unselected_base];

  	// -- other -- 
  	this.width = this.data.nodes.length * 5; // -- to aid with layout -- // 

		// -- loc 
  	this.loc;
 
		//this.selectedNodes = this.data.nodes[0];
  	this.selectedNodes = this.data.nodeGroup.selected;

  	// -- test selections -- // 
		//this.splitItemBySelection( _root.testSelection2, 'additive'); // -- bham
		//this.splitItemBySelection( _root.testSelection1, 'additive');  // -- london

  	// -- TRY to REMOVE this -- // 
		  	// -- nodes put in groups ?? 
		  	//this.nodes_base_group = [[...this.nodes_base]] // base nodes [grouped] (remain unchanged)
		  	//this.data.nodes = [[...this.nodes_base]] ;// nodes (filtered ) a 2d array of groups 

		  	// perhaps // this.data.nodes = { 0: [ ], 1:[ ]}
		  	// instead of groups create an object of selcted and not selected 
		  	// console.log ('data =', this.data.nodes)

		  	// -- selected nodes  -- update -- // 
		  	
		  	// -- set width attributes - for enire block and for grouped nodes 
		  	//this.data.nodes [0]  ['w'] = this.setWidth (this.data.nodes[0]); // this.nodes.length
		  	//this.width =  this.getNodeLength( ) * 5; // widths as total nodes 

		  	// -- *** new stuff -- // 
		  	// this.datatest = { selected: [], unselected: [ ]} ; // ---- //
		  	// this.datatest.selected = this.data.nodes[0]





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
  	// 
  	//console.log ('block ', this.nodes)
  	//console.log ('block org data ', [this.data])
		let data  = [this.data]; // data needs to be in an array format
  	
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
			.attr ('width', d => 	{ 
				//console.log ('nodes length = ', this.nodes.length); 
				return d.nodes.length * 5
			})
			.attr ('height', 10)
			.attr ('x', d => d.x)
			.attr ('y', d => d.y)
			.attr ('fill', 'orange')
			.attr ('opacity',1)
			.on ('click', function ( ) { 
					console.log ('clicked block')
					let nodes = d3.select (this).data( )[0].nodes;
				 	_root.addToSelection (nodes)
			 }) ;

		// -- draw nodes within the group -- // 

		// -- DRAW INDIVIDUAL ITEMS (as a sub-)
					//let nodeData = [this.data.nodes] // -- returns nodes[ [0] [1]]
					 // console.log ('draw nodes = ', this.data.nodes)
					 // console.log ('test nodes =', this.datatest)
					 // convert data (map into widths )
					 // dataTodraw = [items1.width, items2.width]


					 // CONVERT DATA test into ARRAY of two values - 
					 //let dataToDraw = [this.datatest.selected.length, this.datatest.unselected.length]
					 // console.log ('data to draw ', dataToDraw)
					 // console.log ('--------------------------')


					let groupdata = [this.data.nodeGroup.selected, this.data.nodeGroup.unselected]

					//console.log ('group data ', groupdata)
				this.domElement.selectAll ('#' + this.data.name + '_group')
						.data (groupdata)
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
						.attr ('width', d => d.length * 5)
						.attr ('height', 20)
						.attr ('x', (d, i) => { 
							//console.log (' d = ', d)
							//console.log ('i = ', i)
							let totalWidth = 0;
							if (i>0) {
								// add the sum total of previous widths --
								totalWidth = groupdata.slice (0, i).reduce ((acc, cur) => acc + cur.length*5, 0)
								//prevW = nodeData[0].slice(0, i).reduce((acc, cur) => acc + cur.w, 0); // accumator (add up all the widths )
							}
							return  i * totalWidth + this.loc.x;
							})
						.attr ('y', this.loc.y +10)
						.attr ('fill', (d, i) => { 
							return  i == 0 ?  'red' : 'blue'
						})
						.attr ('opacity', (d, i)=> { 
							return  i == 0 ?  '0.9' : '0.3'
						})
						.on ('click',  ( ) => { 
								 this.clickBlockItem(this)
						});

			 		 // -- on click -- 
			  	// -- add events to dom element -- // 
					//this.domElement.on ('click', this.clickBlock.bind (this))
					this.domElement.on ('mouseover', this.rollBlock.bind (this))
					this.domElement.on ('mouseout', this.rollout.bind (this))



  }

  clickBlockItem (obj) { 
  	//console.log ('click block', obj)
  	//console.log ('nodes =', obj.data.nodes)
  	let selection = obj.data.nodes
  	// _root.showSelection (selection)
  	_root.addToSelection (selection)


  }

  rollBlock (item) { 
  	let name = item.target.id.replace("_group", "");
  	_root.tooltip.innerHTML = name;
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
		 // -- conditions -- /
		 let lessThan = (a, b) => a < b; // -- USE THIS -- //
		 let greaterThan = (a, b) => a > b; 
		 let equalTo = (a, b) => a == b; 
		 let isBetween = (a, b, c) => a > b && a < c; 

		 // -- filter the source nodes -- // 
		this.data.nodes  = this.nodes_base.filter (n => { 
						let baseNode = _root.base_nodes.find (bn => bn.id === n); // find matching source nodes (from base nodes)
						return lessThan (baseNode.date_1, maxDate); 
			})

		 //console.log ('core data  = ', this.nodes_base)
		 //console.log ('filtered data = ', this.data.nodes);

		 // -- filter the (BASE) nodes in this.data.nodeGroup
		 this.data.nodeGroup.selected = this.selected_base.filter (n => this.data.nodes.indexOf(n) != -1)
		 this.data.nodeGroup.unselected = this.unselected_base.filter (n => this.data.nodes.indexOf(n) != -1)


		 // -- OLD -- REMOVE 
					//this.data.nodeGroup.selected = this.data.nodeGroup.selected.filter (n => this.data.nodes.indexOf(n) != -1)

					// let dateFilterGroups = [ ]; 

					//  // 1-- filter node data  GROUPS 
					// 				 // this.nodes_base_group.forEach ((group, i) => { 
					// 				 // 		 	let dateFilter = group.filter (n => { 
					// 				// 				let baseNode = _root.base_nodes.find (bn => bn.id === n); // find matching source nodes (from base nodes)
					// 				// 	 			return lessThan (baseNode.date_1, maxDate); 
					// 				// 			})
					// 				// 			//console.log ('date filter ', i, ' , ', dateFilter)
					// 				// 			dateFilterGroups.push (dateFilter)
					// 				 // })

					//  //2. --filter the nodes in each of data.nodeGroups.array 
					// 				 // --get the arrays in data.nodeGroup (from key value) -- and then filter them..
					// 				 //console.log ('core nodes = ', this.data.nodes)
					// 				 for (const key in this.data.nodeGroup) {
					// 		  				//console.log ('nodes ', this.data.nodeGroup[key], ' name ', key) 
					// 		  				let nodegroup = this.data.nodeGroup[key]
					// 		  				// filter each node group in turn.. // 


					// 				}

					//  //console.log ('groups ', this.data.nodeGroup)
					//  //console.log ('one item ', this.data.nodeGroup['selected'])

					//  return dateFilterGroups; // return in groups [ ] [ ]
	 }

	// -- update DATA -- // 
		  // updateNodesInGroups (selection) {   	
		  // 		selection.forEach ((group, i)  => { 
		  // 			//console.log ('group = ', group)
		  // 			let diff = { 
			// 					toRemove :  this.data.nodes[i].filter(node =>  selection[i].indexOf(node) === -1), // remove nodes NOT in SELECTION 
			// 			  	toAdd :     selection[i].filter (node =>  this.data.nodes[i].indexOf (node) === -1) // ADD nodes in seection that are NOT in nodes.
			// 			}

			// 			diff.toRemove.forEach (node => this.data.nodes[i].splice (this.data.nodes[i].indexOf(node), 1)) ; // REMOVE nodes from 'toRemove' 
			// 			diff.toAdd.forEach(node => this.data.nodes[i].push(node)) ; // ADD nodes from 'toAdd'
		  // 		})

		  // }






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


// -- update this !! -- //


  // -- SPLIT the group of nodes into sections -- each section is drawn a different way
  splitItemBySelection(selection, type) { 

  		//let type = 'subtractive'; // 'additive' ; // 'subtractive'
	  	// divide nodes into selected and not selected.
	  	
  	 	// -- additive (filter all nodes )
	  	let selected_additive = this.data.nodes.filter (n => selection.includes (n) == true) // nodes in selection which are also in data.nodes. 
	  	let unselected_additive = this.data.nodes.filter (n => selection.includes (n) == false)

	  	// -- subtractive selction (filter selected nodes )
	  	let selected_subtractive = this.data.nodeGroup.selected.filter (n => selection.includes(n) == true); // nodes 
	  	let unselected_subtractive = this.data.nodes.filter (n => selected_subtractive.includes(n) == false); // nodes not in nodes selected. 

  		//-- if this.data.nodeGroup.selected = empty -> then push all selected into 'select'
  		// -- FIRST SeleCtion -- // 
	  	if (this.data.nodeGroup.selected.length == 0) { 
	  		this.data.nodeGroup.selected = selected_additive; // [...this.selected_base]
	  		this.data.nodeGroup.unselected = unselected_additive; //[...this.unselected_base];
	  	} else { 

	  		// -- ADDITIVE -- //
	  		if (type == 'additive') {
	  		// --	add new selection to node group selection & remove items from unsel
	  			this.data.nodeGroup.selected = [...new Set(this.data.nodeGroup.selected.concat(selected_additive))]; 
	  			this.data.nodeGroup.unselected = this.data.nodeGroup.unselected.filter (n => selected_additive.includes(n) == false)
	  		} 

	  		// -- SUBTRACTIVE -- // filter selected elements 
	  		if (type == 'subtractive') {
	  			this.data.nodeGroup.selected  = selected_subtractive;
	  			this.data.nodeGroup.unselected = unselected_subtractive;
	  		}

	  	}
	  	this.selected_base = this.data.nodeGroup.selected; // update the selected base
	  	this.unselected_base = this.data.nodeGroup.unselected; // update the selected base
	  	
	  	//console.log ('selection =', selection)
	  	//console.log ('selected base  =', this.selected_base)
	  	//console.log ('group = ', this.data.nodeGroup.selected)
  }


  splitItemBySelection_OLD (selection) {
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

































