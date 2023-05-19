import *  as d3 from 'd3';
import * as  Vec2D from 'victor';
import * as _root from './mainV2.js'

import * as d3_sankey from 'd3-sankey';

console.log ('cluster v2...')

/// alter the colours of blocks -- 
// - row 0 - other selected -- green 
// - row + 1 - orange 
// - row - 1 - light orange - 
// - add in bread crumbs 

// -- build up the social graph from the selections -- //


export class BlockClass  { 

	constructor (name, domItem, groupdata, loc, i) { 
				this.svg = domItem;
				this.groupDOM =  this.svg.append ('g').attr ('id', 'blockGroup'); // the element to add clusters

				this.rowindex = i; 
				
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

				console.log ('block ', this.loc)

				// -- DRAW LINKS 
				//this.createLinks ( )
				//this.drawLinks( )


				// -- ADD text headings to block-- / 
				 this.groupDOM.append("text")
					  .text(name)
					  .attr("x", 5) // X coordinate of the text element
					  .attr("y", 20) // Y coordinate of the text element
					  .classed("block-heading", true);

				// --------------------------------// 	  
				// this.svg.append("text")
				// 	  .attr("x", this.loc.x + 2) // Center the text horizontally
				// 	  .attr("y", this.loc.y -5) // Position the text at 30 pixels from the top
				// 	  .attr("text-anchor", "left") // Center the text vertically
				// 	  .attr("font-size", "14") // Set the font size to 24 pixels
				// 	  .text(this.data[0].type); // Set the text to "My Chart Title"
  }

  // -- filter and updade 
  filterAndReDraw (date) { 
		this.filterBlocks_byDate(date);
		this.setLocations( );
		this.drawBlocks( )

		this.drawLinks( )
  }


  // ------ // 
  setLocations ( ) { 
		// -- Set Loc for each block item
		//console.log ('set locations')
  	//console.log ('blocks ', this.blocks)

		this.blocks.forEach ((b, i) => { 
				let x = 0; 
				let y = 0; 
				let spacing = 5; // gaps between
				// -- the issue is that gaps are created even when a block has no itesms 

				 if (i>0) {
				 	let prevblock = this.blocks[i-1]
				 	let prevX = prevblock.data.x; 
				 	let prevW = prevblock.width; //data.w; // prevblock.nodes.length; ///prevblock.data.w; 
					x = prevX + prevW + spacing; // x pos of entire 
				 } 

				b.setLoc (x, y)
		})
  }

  // ------ // 
  drawBlocks ( ){ 
			this.blocks.forEach (b => { 
					b.drawGroup ( )
			})
  }

  createLinks ( ) {
 		this.blocks.forEach (b => { 
  				b.createLinks( );
  		})

  }
  drawLinks () { 
  		this.blocks.forEach (b => { 
  			//b.createLinks (_root.flowMakers)
  				b.drawLinks( );
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
  	this.parent = parent; 

  	// -- the connect to blocks in the next row down.. // 

  	// - base nodes 
  	this.nodes_base = this.data.nodes; // 'source nodes' (remain unchanged)
  	this.nodes = [... this.data.nodes]; // nodes to use.. 


  	// -- create a 'base' of selected and unselcted (to allow filtering in and out)
  	this.selected_base   = [ ]; //this.nodes ; // [ ]; //this.nodes; 
  	this.unselected_base =  this.nodes;
  	this.flow_base =  [];

  	// -- add an object to grup nodes into different blocks 
  	this.nodeGroup = {  unselected: [ ], selected: [ ],flow : [ ] } ; // the visible items (Filtered)

  	// -- apply group to the data object -- // 
  	this.data.nodeGroup = this.nodeGroup;
  	this.data.nodeGroup.selected = 		[...this.selected_base]; // 0
  	this.data.nodeGroup.unselected =  [...this.unselected_base]; // 1 
  	this.data.nodeGroup.flow = [...this.flow_base] // 2

  	this.groupdata;
  	this.grouplinks = [ ]
  	this.array;

  	// -- other -- 
  	this.width = this.data.nodes.length * 5; // -- to aid with layout -- // 

		// -- loc 
  	this.loc;

  	// -- 
  	this.highlightCol = 'red';
  	this.isActive = this.parent.rowindex == 0  ? true : false;

 
		//this.selectedNodes = this.data.nodes[0];
  	this.selectedNodes = this.data.nodeGroup.selected;



  }

  // --  loc of block
  setLoc (x, y) { 
  	// x and y are relative to the group loc 
  	this.data['x'] = x; 
  	this.data['y'] = 0;
  	this.loc = {x: x, y: 0}
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
			.attr ('x', d => d.x + 120)
			.attr ('y', d => -1000)
			.attr ('fill', 'orange')
			.attr ('opacity',0)
			.on ('click', function ( ) { 
					console.log ('clicked block')
					let nodes = d3.select (this).data( )[0].nodes;
				 	_root.addToSelection (nodes)
			 }) ;

		// -- draw nodes within the group -- // 

		// -- DRAW INDIVIDUAL ITEMS (as a sub-)
		// -- sort the data into blocks -- 
		//this.groupdata = [this.data.nodeGroup.unselected, this.data.nodeGroup.selected, this.data.nodeGroup.flow]

		// add x data here too --

		// -- update the x pos for each item in the data -- 
		// -- base data
		this.groupdata =[ 
				
				{ 
						name: 'unselected',
						filter: this.data.nodeGroup.unselected, 
						base : this.unselected_base,
						xoff : 0,
						width : this.data.nodeGroup.unselected.length * 5
					
				},

				{ 
						name : 'selected',
						filter: this.data.nodeGroup.selected, 
						base : this.selected_base,
						xoff : 0,
						width : this.data.nodeGroup.selected.length * 5
				},

				{
						name: 'flow',
						filter: this.data.nodeGroup.flow, 
						base: this.flow_base,
						xoff: 0,
						width : this.data.nodeGroup.flow.length * 5

				}
		]


		//  -- update x offset -- for positioning -- //
		this.groupdata.forEach ((d,i)  => { 
			let xoff_total = 0;
				if (i>0) {
					let subarray = this.groupdata.slice (0, i);
					subarray = subarray.map ( n => n.filter)
					xoff_total =  subarray.reduce((total, currentArray) => total + currentArray.length *5, 0);
					this.groupdata[i].xoff = xoff_total;
				}

		})


		//console.log ('--------------------')

				
				this.domElement.selectAll ('#' + this.data.name + '_group')
						.data (this.groupdata)
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
						.attr ('width', d => d.width)
						.attr ('height', 10)
						.attr ('x', (d, i) => { 
								//console.log ('groupdata = ', d)
								return  d.xoff  + this.loc.x + 120;
							})
						.attr ('y',  d=> { 
								return  0; //this.loc.y
							})
						.attr ('fill', (d, i) => { 
							return 	i === 0 ? 'gray' : i === 1 ? 'orangered' : i === 2 ? 'gold' : undefined;
						})
						.attr ('opacity', (d, i)=> { 
							//return 0;
							return 	i === 0 ? '0.3' : i === 1 ? '0.7' : i === 2 ? '0.9' : undefined;
						})
						.attr ('isSelected', (d, i) => i == 0 ? false : true)

						.on ('click',  (e, d) => { 
								this.clickBlockItem(this, e, d)
						});

			  	// -- add events to dom element -- // 
					this.domElement.on ('mouseover', this.rollBlock.bind (this))
					this.domElement.on ('mouseout', this.rollout.bind (this))



  }

  clickBlockItem (obj, e, d) { 
  		let isSelected = e.target.getAttribute ('isSelected')
  		// --- clickable when block 'isActive' OR item 'isSelected'
			if (this.isActive ||  isSelected == 'true' )  {
					//console.log ('selection = ', d)
					//console.log ('base items  = ', this.nodes_base)
					//console.log (e)
					//console.log (d)
					//console.log (this)
					let selection =  d.base; // this.nodes_base ; // d; 

					// d is the selected (portion)
					// what we want is the base of the selected portion.

					_root.addToSelection_Sankey (selection, this); // -- perhaps this is where I build sankey from ? 

					//this.createLinks(_root.flowMakers ); // ?? 
					//this.drawLinks( )

			}
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
		 this.data.nodeGroup.flow = this.flow_base.filter (n => this.data.nodes.indexOf(n) != -1)
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

  //   splitGroupTest ( ) { 
  // 		// -- a test -- // 
	//   	if (this.data.nodes[0].length > 4) {   		
	//   		// -- make a selection and filter the nodes 
	//   		let selection1 = this.data.nodes[0].slice (4, this.data.nodes[0].length-1);
	//   		let selection2 = this.data.nodes[0].slice (0, 5);

	//   		selection1 ['w'] = this.setWidth (selection1)
	//   		selection2 ['w'] = this.setWidth (selection2);

	//   		this.data.nodes[0] = selection1; //  
	//   		this.nodes_base_group[0] = [...selection1]; //

	//   		// -- push selected group as a new group array -- // 
	//   		this.data.nodes.push (selection2)
	//   		this.nodes_base_group.push ([...selection2])

	//   		this.selectedNodes = this.data.nodes[0]

	//   	} 
  // }
  // -- SPLIT the group of nodes into sections -- each section is drawn a different way
  // splitItemBySelection(selection, type) { 

  // 		//let type = 'subtractive'; // 'additive' ; // 'subtractive'
	//   	// divide nodes into selected and not selected.
	  	
  // 	 	// -- additive (filter all nodes )
	//   	let selected_additive = this.data.nodes.filter (n => selection.includes (n) == true) // nodes in selection which are also in data.nodes. 
	//   	let unselected_additive = this.data.nodes.filter (n => selection.includes (n) == false)

	//   	// -- subtractive selction (filter selected nodes )
	//   	let selected_subtractive = this.data.nodeGroup.selected.filter (n => selection.includes(n) == true); // nodes 
	//   	let unselected_subtractive = this.data.nodes.filter (n => selected_subtractive.includes(n) == false); // nodes not in nodes selected. 

  // 		//-- if this.data.nodeGroup.selected = empty -> then push all selected into 'select'
  // 		// -- FIRST SeleCtion -- // 
	//   	if (this.data.nodeGroup.selected.length == 0) { 
	//   		this.data.nodeGroup.selected = selected_additive; // [...this.selected_base]
	//   		this.data.nodeGroup.unselected = unselected_additive; //[...this.unselected_base];
	//   	} else { 

	//   		// -- ADDITIVE -- //
	//   		if (type == 'additive') {
	//   		// --	add new selection to node group selection & remove items from unsel
	//   			this.data.nodeGroup.selected = [...new Set(this.data.nodeGroup.selected.concat(selected_additive))]; 
	//   			this.data.nodeGroup.unselected = this.data.nodeGroup.unselected.filter (n => selected_additive.includes(n) == false)
	//   		} 

	//   		// -- SUBTRACTIVE -- // filter selected elements 
	//   		if (type == 'subtractive') {
	//   			this.data.nodeGroup.selected  = selected_subtractive;
	//   			this.data.nodeGroup.unselected = unselected_subtractive;
	//   		}

	//   	}
	//   	this.selected_base = this.data.nodeGroup.selected; // update the selected base
	//   	this.unselected_base = this.data.nodeGroup.unselected; // update the selected base
	  	
	//   	//console.log ('selection =', selection)
	//   	//console.log ('selected base  =', this.selected_base)
	//   	//console.log ('group = ', this.data.nodeGroup.selected)
  // }


  // splitItemBySelection_OLD (selection) {
  // 	//console.log ('selection =', selection)
  // 	//console.log ('data in block = ', this.data.nodes)

  // 	//let i = this.data.nodes.length-1
  // 	let selection1 = this.data.nodes[0].filter (n => selection.indexOf(n) != -1); 
  // 	let selection2 = this.data.nodes[0].filter (n => selection.indexOf(n) == -1);


  // 	// -- // 
  // 	selection1 ['w'] = this.setWidth (selection1);
  // 	selection2 ['w'] = this.setWidth (selection2);

  // 	// group 0 
  // 	this.data.nodes[0] = selection1; // ALL SELECTED go into array [0]
  // 	this.nodes_base_group[0] = [...selection1]; // a copy

  // 	// group 1
  // 	this.data.nodes.push (selection2) // 
  // 	this.nodes_base_group.push ([...selection2])
  
  // }


  // queryNodesByAttribute (att, value) { 
	//  		// -- find node with the same id - extract towns - if towns include (x) push to array - // 
	//  		// -- starting with (towns = london etc)
	//  		let selection = [ ]; 
	//  		this.nodes.forEach ( n => { 
	// 			let item = this.layout.nodes.find (node => node.id == n.id)[att];
	// 			if (item.includes (value)) selection.push (n)
	//  		})

	//  		console.log ('selection = ', selection);
	//  		console.log ('current selected = ', this.selectedNodes)

	//  		// -- UPDATE selected nodes (filter current selection ) -- // 
	//  		this.selectedNodes =  this.selectedNodes.filter(node => selection.map(newnode => newnode.id).includes(node.id));
	//  		//this.selectedNodes = selection; //  

	//  		console.log ('new selected = ', this.selectedNodes)
	// 		// console.log ('nodes = ', this.nodes)
	//  		// console.log ('foundnodes = ', this.selectedNodes)
	//  		// console.log  ('selected nodes = ', this.selectedNodes)
	//  		// console.log ('new ', filteredArray)
	//  		this.drawShapeNodes( )
	//  }


// ---------------------------------- // 
// -- draw links between blocks -- 


  // -- find / update links to the 
  createLinks (selection) { 
  	// -- LINK DATA -- 
		this.grouplinks= [ 
					{ 
								name: 'unselected',
								links: [ ],
								filter:[ ]
					},
					{ 
								name: 'selected',
								links: [ ],
								filter:[ ]
					},
					{ 
								name: 'flow',
								links: [ ],
								filter:[ ]
					}
		]

		let selectiontouse = selection; //this.nodes_base;
		// -- FIND / UPDATE LINKS to next row down -- // 
		let nextRow = this.parent.rowindex + 1; 
			// get blocks in the next row -- // 
  	 _root.rows[nextRow].blocks.forEach ((targetblock, i) => { 
  	 		 // ALTER THIS SELECTION -- 
         let filter = targetblock.nodes_base.filter (n => selectiontouse.includes(n)) // find matches in selection---  // 
         //let filter = targetblock.data.nodes.filter (n => this.data.nodes.includes(n)) // find matches in visible nodes---  // 

         // look for match in each group element.. 
         if (filter.length > 0) {    

         		// -- get selected items (base and filtered)
         		let source_selectedItems_base = this.groupdata[1].base.filter (item => filter.includes(item));
         		let target_selectedItems_base = targetblock.groupdata[1].base.filter (item => filter.includes(item));
         		// -- filtered
         		let source_selectedItems_filter = this.groupdata[1].filter.filter (item => filter.includes(item));
         		let target_selectedItems_filter = targetblock.groupdata[1].filter.filter (item => filter.includes(item));

         		// -- get flow items (base and filtered)
         		let source_flowitems_base = this.groupdata[2].base.filter (item => filter.includes(item));
         		let target_flowitems_base = targetblock.groupdata[2].base.filter (item => filter.includes(item))
         		// -- filtered
         		let source_flowitems_filter = this.groupdata[2].filter.filter (item => filter.includes(item));
         		let target_flowitems_filter = targetblock.groupdata[2].filter.filter (item => filter.includes(item))
         		

         		// -- get items that are in both flow lists -- 
         		let commonFlowItems_base = source_flowitems_base.filter (item => target_flowitems_base.includes(item))
         		let commonFlowItems_filter = source_flowitems_filter.filter (item => target_flowitems_filter.includes(item))


         		// -- show values -- // 
	         		// const sharedflowitems= this.groupdata[2].filter(item => targetblock.groupdata[2].includes(item));
	         		// console.log ('filter ', filter)
	         		// console.log ('source : flow - ', source_flowitems_base, ' : selected ', source_selectedItems_base)
	         		// console.log ('target : flow - ', target_flowitems_base, ' : selected ', target_selectedItems_base)
	         		// console.log ('common flow = ', commonFlowItems_base)
	         		// console.log ('-----------------')

	         		// -- if we have common flow items -add to flow and selected - otherwise only add to selected.. 
	         		// -- either - flow & flow = flow links OR flow and selected = selected links (TARGET)

         		// -- base links 
         		let selectedlink_base = { source:this, target:targetblock, count:target_selectedItems_base.length } ; // use target selected.
         		let flowlink_base = 		{ source:this, target:targetblock, count:commonFlowItems_base.length } ; // use comon flow 
         		
         		// --  filter links 
         		let selectedlink_filter = { source:this, target:targetblock, count:target_selectedItems_filter.length } ; // use target selected.
         		let flowlink_filter = 		{ source:this, target:targetblock, count:commonFlowItems_filter.length } ; // use comon flow 

         		// -- add to group links (selected [1] and flow [2])
         		this.grouplinks [1].links.push (selectedlink_base) 		// add to selected
         		if (commonFlowItems_base.length>0) {
         				//this.grouplinks [2].links.push (flowlink_base)		 		// add to flow 
         		}
					
         }

  	})

  	// SHOW RESULT a grouped array of links --
  	 console.log ('RESULT = ', this.data.name, '  : ', this.grouplinks)

  }

 // -- end of 'createLinks( )' -- //

  drawLinks ( ) { 
  	// -- is there a next block down ? --
  	// -- remember not all blocks have populated links - some are empty! 
		let linkGenerator = d3.linkVertical()
  				.source(d => { 
  					let sx = d.source.loc.x + d.source.groupdata[1].xoff
  					let sy = 0; // releative to block group
  					return [sx+120, sy]

  				})
					.target(d => { 
						let tx = d.target.loc.x + d.target.groupdata[1].xoff
  					let ty = 120;
						return [tx+120, ty]
					});

  	// 0: unselected / 1: selected / 2: flow

  	if (this.grouplinks.length>0) { 
  			// -- DRAW ONE PATH -- //
  		 //console.log ('links = ', this.grouplinks[1].links)
  		let selecteddata= this.grouplinks[1].links;

   		this.domElement.selectAll("#pathlink")
  		 	.data(selecteddata)
				.join(
		      function(enter) {
		        return enter.append('path')
		      },

		      function(update) {
		         return update.attr('opacity', .3);
		      },

		      function (exit) { 
		      	return exit.remove ( )
		      }
				)
				.attr ('id', "pathlink")
				//.attr("d", linkGenerator)
				.attr("d", d3.linkVertical()
    								.target((d, i) => {
    									let tx = d.target.loc.x + d.target.groupdata[1].xoff
  										let ty = 120;
											return [tx+120, ty]
    								})
    								.source((d, i) => {
    									let sx = d.source.loc.x + d.source.groupdata[1].xoff
  										let sy = 0; // releative to block group
  										return [sx+120, sy]
    								})
  				)
		  	.attr ('stroke', 'red')
		  	.attr ('fill', 'none')
		  	.attr ('opacity', 0.4)
		  	.attr("stroke-width", d => { 
		  		//console.log (d.source.data.nodeGroup.flow.length)
		  		 let w =  d.source.data.nodeGroup.flow.length/3; //d.source.data.nodes.length / 2
		  		// console.log ('w ', d.target.nodeGroup.selected.length)
		  		 let lw = d.target.nodeGroup.selected.length > 0 ? 1 : 0 ;

		  		 return lw;
		  	});

		 }  
  	

  }
  


  // drawLinks_GROUP_OLD ( ) { 
  // 	// -- is there a next block down ? --
  // 	// -- remember not all blocks have populated links - some are empty! 
  // 	//console.log ('draw links'); //  this.grouplinks); // create links to the next group down.. 

	// 	let linkGeneratorSingle = d3.linkVertical()
  // 				.source(d => { 
  // 					//console.log ('d =', d.source.loc.x)
  // 					let sx = d.source.loc.x + d.source.groupdata[1].xoff
  // 					let sy = 0;
  // 					return [sx+120, sy]

  // 				})
	// 				.target(d => { 
	// 					let tx = d.target.loc.x + d.target.groupdata[1].xoff
  // 					let ty = 120;
	// 					return [tx+120, ty]
	// 				});

  // 	// UPDATE  
  // 	// 0: unselected / 1: selected / 2: flow
  // 	if (this.grouplinks.length>0) { 
  // 			// -- DRAW ONE PATH -- //
  // 		 //console.log ('links = ', this.grouplinks[1].links)
  // 		 let data = this.grouplinks[1].links;

  //  		this.domElement.selectAll("#pathlink")
  // 		 	.data(data)
	// 			.join(
	// 	      function(enter) {
	// 	        return enter.append('path')
	// 	      },

	// 	      function(update) {
	// 	         return update.attr('opacity', .3);
	// 	      },

	// 	      function (exit) { 
	// 	      	return exit.remove ( )
	// 	      }
	// 			)
	// 			.attr ('id', "pathlink")
	// 			.attr("d", linkGeneratorSingle)
	// 	  	.attr ('stroke', 'red')
	// 	  	.attr ('fill', 'none')
	// 	  	.attr ('opacity', 0.4)
	// 	  	.attr("stroke-width", d => { 
	// 	  		console.log (d.source.data.nodeGroup.flow.length)
	// 	  		 return d.source.data.nodeGroup.flow.length/3; //d.source.data.nodes.length / 2
	// 	  	});   // Set the line width

	//   		 // this.domElement.selectAll("#box")
	//   		 // 	.data(data)
	// 			// 	.join(
	// 		   //    function(enter) {
	// 		   //      return enter.append('rect')
	// 		   //    },

	// 		   //    function(update) {
	// 		   //       return update.attr('opacity', .3);
	// 		   //    },

	// 		   //    function (exit) { 
	// 		   //    	return exit.remove ( )
	// 		   //    }
	// 			// 	)
	// 			// 	.attr('id', 'box')
	// 			// 	.attr ('x', d => d.source.loc.x + d.source.groupdata[1].xoff + 120)
	// 			// 	.attr ('y', d => 0)
	// 			// 	.attr ('width', 20)
	// 			// 	.attr ('height', 20)
	// 			// 	.attr ('fill', 'red')
	// 			// 	.attr ('opacity', 0.1)

  // 	}


  // //	console.log (this.grouplinks)
	// 	// // -- DRAW  GROUPS drawing an arrray of links -- from AI -- //
	// 			var linkGroups = this.domElement.selectAll("g")
	// 			  .data(this.grouplinks)
	// 			  .enter()
	// 			  .append("g")
	// 			  //.attr('id', 'group2')

	// 			// Draw links for each array
	// 			linkGroups.each((d, i) =>  {
	// 				// get data 
	// 			   let links = Object.values(d.links); // Get the array of links
	// 			   let type = Object.values(d.name)
	// 			   //console.log ('links in group -', links, ' , ', i)
	// 			   // var color = colorScale(Object.keys(d)[0]); // Get the color for the array

				  		
	// 					  let linkGeneratorV2 = d3.linkVertical()
	// 					    .x(d => { 
	// 					    		let xpos = d.loc.x + d.groupdata[i].xoff
	// 									return xpos + 120
	// 					    })
						
	// 					    .y(d => { 
	// 					    		console.log ("parent loc = ", d.parent.loc)
	// 									return d.parent.loc.y;
	// 					    })

	// 						let linkGenerator = d3.linkVertical()
	// 					    				.source(d => { 
	// 					    					//console.log ('d =', d.source.loc.x)
	// 					    					let sx = d.source.loc.x + d.source.groupdata[i].xoff
	// 					    					let sy = 0;
	// 					    					return [sx+120, sy]

	// 					    				})
  //       								.target(d => { 
  //       									let tx = d.target.loc.x + d.target.groupdata[i].xoff
	// 					    					let ty = 120;
  //       									return [tx+120, ty]
  //       								});


	//         		// this.domElement.selectAll("#pathlink"+i)
	// 					  // 		 	.data(links)
	// 						// 			.join(
	// 						// 	      function(enter) {
	// 						// 	        return enter.append('path')
	// 						// 	      },

	// 						// 	      function(update) {
	// 						// 	         return update.attr('opacity', .3);
	// 						// 	      },

	// 						// 	      function (exit) { 
	// 						// 	      	return exit.remove ( )
	// 						// 	      }
	// 						// 			)
	// 						// 			.attr ('id', "pathlink"+i)
	// 						// 			.attr("d", linkGenerator)
	// 						// 	  	.attr ('stroke', 'red')
	// 						// 	  	.attr ('fill', 'none')
	// 						// 	  	.attr ('opacity', 0.4)
	// 						// 	  	.attr("stroke-width", 1);   // Set the line width


						  
	// 			 });
  // }


  filterLinks ( ) { 


  }










}








































