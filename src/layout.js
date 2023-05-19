import *  as d3 from 'd3';
import * as  Vec2D from 'victor';
import * as _root from './mainV2.js'


import * as clustersSankey from './clustersSankey.js' // new version of clusters 

console.log ('layout 7!... ')

let flowColor = 'red'
let selectColour = 'orangered'

// -- a LAYOUT of CLUSTERS (GROUP) -- 
// -- define the configuration of all the items in a layout -- // 

export class Layout { 

// -- 1. INIT : constructor-- // 
	constructor (svg, nodes, clusterdata, center, fill) { 
		this.clusterdata = clusterdata; // data for ALL the clusters -- // 
		//console.log ('cluster data ?? ', this.clusterdata)
		this.nodes = nodes; // nodes will be in cluster data - // is this needed?? 
		this.clusterlist = [ ]; // -- a list of the clusters in the layout -- //  
		//console.log ('nodes in layout = ', this.nodes)

		// -- 
		this.selectedItems = [ ]; 	// cluster IDs which are seletedd
		this.unselectedItems = [ ]; 	// cluster IDs which are not selected. 
		this.deselectedItems = [ ]; 
		// -- 
		this.itemsToScale = { up : [ ], down : [ ]}; // [ ];

		this.intervalId;
		this.intervalLinks;
		// -- 

		this.svg = svg;
		this.clusterDOM =  this.svg.append ('g').attr ('id', 'layout1') // the element to add clusters
		
		// - forces applied to clusters -- // 
		this.simulation = d3.forceSimulation( );
		// -- set named forces -- // 
				this.forceX = d3.forceX();
				this.forceY = d3.forceY();
				this.forceCharge = d3.forceManyBody( );
				this.forceCollide = d3.forceCollide( )
				this.forceList  = [ ]; // active forces (test)
				this.nullForces = [ ]; // non-active foraces (test)

		this.center = center; // { x: 300, y: 200}
		this.fill = fill;

		this.type = 'force'; // layout types -- // 

		this.dateScale;


		this.init( );

		//setTimeout (this.clusterlist[0].moveNodes, 7000)
		//console.log ('cluster data = ', clusterdata)
	}

	// --------------------- // 

	init ( ) { 
		// -- draw containers -- 
		this.createClusters( ); // populate clusters
		this.createElements( );
		this.drawContainers( );

		// -- update layout- and draw -- 
		this.updateLayout('force');
	  	
	  	this.updateNodeLinks( );

		//  this.setForces_layout( );
		//  this.setForces_nodes( );
		//  this.restartForces( );

		this.dateScale = _root.setDateScale (1600, 1990, 10, 1000); // date1, date2, y1, y2


	}

	// --------------------- // 

	setDateScale ( ) { 

	}

// -- 2. CREATE clusters  -- DRAW clusters  and nodes-- // 
	createClusters ( ) { 
		this.clusterdata.forEach (data => { 
			//console.log ('cluster data ', data)
				const newcluster = new ClusterClass(this, this.clusterDOM, data); // this is a new cluster item
				this.clusterlist.push (newcluster);
		})
		//console.log ("cluster list ", this.clusterlist)
	}

	// --------------------- // 

	createElements ( ) { 
			this.clusterlist.forEach (c => { 
			  c.createElements ( ); // DOM element (placeholder)
		})

	}

	drawContainers ( ) { 
		this.clusterlist.forEach (c => { 
			  c.drawGroupElement ( ); // DOM element (placeholder)
		})
	}

	// -- draw cluster shapes -- // 
	drawClusters ( ){ 
		this.clusterlist.forEach (c => { 
			c.drawShapeGroup ( )
		})
	}

	// -- draw nodes shapes -- // 
	drawNodes ( ){ 
		this.clusterlist.forEach (c => { 
			 c.drawShapeNodes ('red');
		})
	}

	// -- start node forces -- // 
	setForces_nodes ( ) { 
		this.clusterlist.forEach (c => { 
			 c.applyForcesToNodes( )
			 c.restartForces_nodes( );
		})
	}
  // -- stop node forces -- 
  stopForces_nodes ( ) { 
  	this.clusterlist.forEach (c => { 
  			c.removeForces( );
  		})
  }

  // -- move nodes to date pos -- 
  moveNodes ( )  { 
  	this.clusterlist.forEach (c => { 
  		 c.moveNodes( )
  	})
  }


	// set visuals  for cluster items -- 


// -- 2b. UPDATE LAYOUT -- (date and force) -- //
	updateLayout ( ) { 
		// -- update loc - colour and size 
		// -- draw clusers and nodes
	//console.log ("UPDATE LAYOUT ...")
	// -- DATE LAYOUT -- // 
		if (this.type == 'date') { 
				// change positions  -- 
				//console.log ('cluster data: ', this.clusterdata)
				//this.moveClusterLayoutXY ( ) // -- move the group (container)

				this.simulation.stop ( ); // stop forces on clusers
				this.stopForces_nodes( ); // stop forces on nodes 


					// -- move each cluster container (transition)
				this.clusterlist.forEach ((c, i) => { 

						//this.scaleDownClusters (c)
						// -- the sequencing of this needs to be looked at -- // 
					 	// -- calc x pos -- i.e. the SPACING between date lines 
					 	let x; 
						let size; 
						let prevsize;
						// 
						// --  SET SIZE -- 
						let condition = this.clusterlist[i].nodes.length > 0 ; 
						size = (condition) ? 10 : 1; // set size (large / small)
						this.clusterdata[i].size = size; // update data (size value )
						this.clusterdata[i].scale = 1;

						if (i>0) prevsize = this.clusterdata[i-1].size; // prev size value 
						if (i == 0) x = 20; 
						if (i>0) { 
							// x = prev x pos + prev size + this size 
							x = this.clusterlist[i-1].loc.x + prevsize + size ;
						}
						

						// -- could this be done as functions within the cluster ? 
						// -- calculate Y pos -- // 
						let clusterNodes_dateorder = c.sortNodesByDate( )

						let minDate = c.minMaxDates.min;
						let maxDate = c.minMaxDates.max;

						//console.log  ('nodes in cluster = ', clusterNodes_dateorder, "min ", minDate, ' max', maxDate);
						let y = this.dateScale (minDate)
						let yEnd = this.dateScale (maxDate) - this.dateScale (minDate)
						c.loc_end.y = yEnd; 
					

						c.moveToPos (x, y, 4000, this.clusterdata[i])

						// -- change colour and size -- // 
						c.transitionSelection (
							c.clusterShape, 
							{ 
						 		//fill: 'gray', 
						 		//transform: 'scale(2)', 
						 		r: this.clusterdata[i].size * this.clusterdata[i].scale,
						 		r: 12,
						 		opacity: 0.2,
							}, 
							4000)
						})




				// -- move nodes
				this.moveNodes( );


			}

 	// -- FORCE (NETWORK) LAYOUT -- // 
		if (this.type == 'force') { 

		  	// -- (re)set Colour and Shape - translate BACk -- (colour and size)
		  	this.clusterlist.forEach ((c, i) => { 
				// --  SET SIZE -- 
		  		this.clusterdata[i].size = this.clusterdata[i].nodes.length * 10 + 1; // reset cluster size data

		  			c.loc_end.y = 0; 
		  			c.transitionSelection (	
		  					c.clusterShape, 
		  					{ 	//fill: 'red', 
		  					   	r: this.clusterdata[i].size * this.clusterdata[i].scale
		  					},
		  					4000)

		  			// c.transitionSelection (c.clusterShapeEnd, { 
		  			// 			fill: 'blue',
		  			// 			r: this.clusterdata[i].nodes.length * 1 + 1},
		  			// 			8000
		  			// 	)
		  			});

		  	// -- (re)calcuate (forces) posision-- // 
		  	this.setForces_layout( ); // apply forces to the whole of the clusters -- // 
		  	this.setForces_nodes( )
		  	this.restartForces( );

		  	// -- calc forces on Nodes in clusters.. 
		  	//this.setForces_nodes( ); // nodes 
		  	//this.clusterlist.forEach (c => 	c.restartForces_nodes( )); // nodes
  		}



	  // -- (re)DRAW CLUSTERS and NODES -- //
	  this.drawClusters ( ); 
	  this.drawNodes ( );

	  //this.updateNodeLinks( );
	  //this.updateScaleV2( );	
	}

/// ------------------------------- // 
   updateNodeLinks ( ) { 
   		function drawLinks (d) { 
   			//console.log ('update links')
   			d.clusterlist.forEach (c => { 
   				c.updateLinks_tick( );
   			})
   		} 
   		this.intervalLinks = setInterval(( )=> { drawLinks (this) }, 100);
   }

/// ------------------------------- // 




// -- 3a SELECT CLUSTERS and CHANGE -- 
	updateSelectedClusters ( ) { 
		let selectedClusters = [0, 1]; 

		this.clusterlist.forEach ((c, i) => { 
			if (selectedClusters.includes (i)) { 
				c.clusterCol = 'red'
			} else { 
				c.clusterCol = 'gray'
			}

			// start transition 
			c.transitionSelection (
				c.clusterShape, 
				{ 
		 			fill: c.clusterCol, 
				}, 
				2000)
		})

		//this.drawClusters ( ); 
		//this.drawNodes ( );


	}


// -- 3. SET VISUALS : cluster shape / Size / Colour
	setClusterShape (circleVal, rectVal ) { 
			this.clusterlist.forEach (c => { 
			  c.clusterShape.attr ('visibility', circleVal)
			  c.clusterShapeRect.attr ('visibility', rectVal)
		})
	}


	// -- when clicked -- update base selection -- // 
	updateSelection (cluster) { 
		// console.log ('is selected = ', this.selectedItems.includes (cluster))
		// if in selecteced items - remove 
		
		// -- ALTER SIZE -- // 
		if (this.selectedItems.includes (cluster)) { 
			this.selectedItems = this.selectedItems.filter (item => item !== cluster); // remove from array
			
			// scale down 
			this.scaleDownClusters(cluster)

			_root.addToSelection_Social (cluster.nodes.map (n=> n.id), false)


		} else { 
			this.selectedItems.push (cluster) ;// add to selected array

			// scale up and add to selection
			this.scaleUpClusters (cluster)
			_root.addToSelection_Social (cluster.nodes.map (n=> n.id), true)
		}

		// -- UPDATE COLOURS -- //  
		//cluster.clusterCol = 'red' // set this item colour
		// --set the colour for all other items -- 
		//let notselected = this.clusterlist.filter (c => this.selectedItems.includes(c) == false)
		//notselected.forEach (c => c.clusterCol = 'gray')
	
		// --  add nodes to selected... in the cluster.. 

		// -- UPDATE SELECTION -- // 
		// let selection = cluster.nodes; 
		// //_root.addToSelection (selection.map (n=> n.id))
		// _root.addToSelection_Social (selection.map (n=> n.id))
	}

	scaleUpClusters (cluster) { 
		this.itemsToScale.up.push (cluster) ; // add 'to scale'
		this.updateScale ( );

	}

	scaleDownClusters(cluster) { 
		this.itemsToScale.down.push (cluster)
		this.updateScale ( );

	}


	updateScale ( ) { 
		//-- the looped function -- //
		function scaleItems (d) { 
			// -- scale up -- // 
			d.itemsToScale.up.forEach (c => { 
				let isScaling = c.scaleCluster(1.5, 0.1) ; // update scale.(target size and inc) 
				if (!isScaling)  d.itemsToScale.up = d.itemsToScale.up.filter (item => item !== c); // remove from array
				
			})

			// -- scale down --
			d.itemsToScale.down.forEach (c => { 
				let isScaling = c.scaleCluster(1.0, 0.1) ; // update scale. 
				if (!isScaling)  d.itemsToScale.down = d.itemsToScale.down.filter (item => item !== c); // remove from array
				
			})

			if (d.itemsToScale.up.length == 0 && d.itemsToScale.down.length == 0) { 
					clearInterval (d.intervalId)
					d.intervalId = null;
			}

			 

			// -- update layout - (over time )
			 d.setForces_layout( ); // apply forces to the whole of the clusters -- // 
			 d.setForces_nodes( )
			 d.drawClusters ( ); 
			 d.drawNodes ( );
		}

		// -- prevent from being restarted 
		if (this.intervalId == null) {
			this.intervalId = setInterval(( )=> { scaleItems(this) }, 20);
			this.restartForces( );
		}
	}

	//----------------------------//

// -- 4. SET LAYOUT with FORCES 
	// FORCES between GROUPS -- // 

	// -- apply forces --
	setForces_layout ( ) { 
			// set items to move
			//this.simulation = d3.forceSimulation( );
			this.simulation.nodes (this.clusterdata); // set node data to apply force to -- // 
			//this.setForceValues( );
			this.simulation
				.force ('forceX', d3.forceX().x(this.center.x).strength(0.08))// this.forceX)
			    .force ('forceY', d3.forceY().y(this.center.y).strength(0.08)) //this.forceY)
			    .force ('repel',  d3.forceManyBody( ).strength(-33)) // this.forceCharge)
			    .force ('collide',d3.forceCollide( ).radius((d, i) => {
			    			return d.size*d.scale })) //  this.forceCollide)
			    .on ('tick', this.forcesTick.bind (this) )
			
			//this.addAllForces( );		
		  //this.restartForces( );
	}

	// -- FORCE functions : set values / add all forces / remove all forces 
				setForceValues ( ) {
						this.forceX.x (this.center.x).strength (.5)
						this.forceY.y (this.center.y).strength (.5)
						this.forceCharge.strength(-100)
						this.forceCollide.radius (5)
				}


				// ---------------- // 
				addAllForces ( ) { 
						this.simulation
								.force ('forceX', this.forceX)
						    .force ('forceY', this.forceY)
						    .force ('repel', this.forceCharge)
						    .force ('collide', this.forceCollide)
						    .on ('tick', this.forcesTick.bind (this) )
						    //.force ('centerForce', d3.forceCenter(400, 300).strength(0.1)

						//this.simulation.on ('tick', this.updateForces.bind (this) )
						//this.forceList = ['forceX', 'forceY', 'repel', 'collide'];
				}
				// ---------------- // 

				removeAllForces ( ) { 
						// set to null??
						this.simulation
									.force ('forceX', null)
							    .force ('forceY', 	null)
							    .force ('repel', 	null)
							    .force ('collide', null)
						// this.forceList.forEach (forceName => { 
						// 	this.simulation.force (forceName, null)
						// 	this.nullForces.push (forceName)
						// })

					 	// set stren
						//this.simulation.force("forceX", d3.forceX().strength(0));
						//this.simulation.force("forceY", d3.forceY().strength(0));
					
						this.simulation.stop( ); // or just stop force (brute force!)
						//this.restartForces( );
				}

				// ---------------- // 
				updateForces () { 
					console.log ('alter forces')	
					this.forceX.x(800)
					this.forceY.y(400)
					this.restartForces( );
				}

				// ---------------- // 

				restartForces ( ) { 
					this.simulation.on ('tick', this.forcesTick.bind(this))
					this.simulation.alpha(1).restart( );
				}

		forcesTick ( ){ 
			//console.log ("tick layout ")
			// move the group item that each cluster is in... 
			this.clusterlist.forEach ((c, i) => { 
					//c.moveToPos (this.clusterdata[i].x, this.clusterdata[i].y);
					c.moveByForce (this.clusterdata[i].x, this.clusterdata[i].y); 
					
			})

			// this.clusterlist[0].moveGroup (this.clusterdata[0].x, this.clusterdata[0].y);
	    // clusterList[1].moveGroup (clusterDataV1[1].x, clusterDataV1[1].y);

		}

	// ---------------- // 

// -- 5. SET LAYOUT using XY 
	moveClusterLayoutXY ( ) { 
		// -- stop forces on cluster 
		this.simulation.stop ( ); // stop forces on clusers
		
		// -- move each cluster container (transition)
		this.clusterlist.forEach ((c, i) => { 
			//c.setGroupXY_transition (i*40 + 10, 400)
			let x = i*10 +10;
			let y = 400; 
			c.moveToPos (x, y, this.clusterdata[i] )
		})
	}
 // ------------------------------- // 
	setLayout_Row ( ) { 
		// for each cluster item - set the x value at set increments 

	}

	setLayout_Date ( ) { 

	}


// -- 6. FILTER  LAYOUT - UPDATE SELECTION -- 
	filterLayout_date(date) { 
		// -- select ALL clusters -- 
		// -- filter layour 
		this.clusterlist.forEach ((c, i) => {
				let selection = c.filterByDate(date) ;// get a selection 
				let filterednodes = c.filterNodes (selection); // update nodes in cluster 
				this.clusterdata[i].nodes = filterednodes; // [...this.nodes] ;// set nodes to new nodes
				// -- move this ? -- 
				//this.clusterdata[i].size = filterednodes.length * 5 + 1; // reset cluster size data
		})

		// -- get selection for ONE cluster -- a test
		let selection = this.clusterlist[0].filterByDate(date) ;// get a selection 
  	   let filterednodes = this.clusterlist[0].filterNodes (selection); // update 

  	   // show filterd nodes -- // 


  	   // show flow nodes 

  	   // show selected nodes 


	}


	getSelectedMakers ( ) { 
		// get nodes
		let allselected = [ ]; 
		let allflows = [ ];

		// get all selected that are visible
		this.clusterlist.forEach (c => { 
				let selected_visible = c.nodes.filter (n => c.selectedNodes.includes(n))
				let flow_visible = c.nodes.filter (n => c.flowNodes.includes(n))
				allselected = allselected.concat (selected_visible)
				allflows = allflows.concat (flow_visible)

		})

		allselected = allselected.map (n => n.id)
		allflows = allflows.map (n => n.id)

		//console.log ('all selected = ', allselected)
		//console.log ('all flows = ', allflows)
		allselected = allselected.filter (n => allflows.includes (n) == false) // remove any in both

		let visible_selection = { 
			selected : allselected,
			flows : allflows
		}

		return visible_selection;
	}


	queryClustersByAttribute (att, value) { 
		this.clusterlist.forEach (c => { 
			c.queryNodesByAttribute (att, value );
		})
	}

	queryClusterBySelection (selection ) { 
		this.clusterlist.forEach (c => { 
			c.queryNodesBySelection (selection);
		})

	}




	updateClusterData ( ){ 


	}





/// -- transitions -- // 
swapLayoutShape ( ) {
		this.clusterlist.forEach (c => { 
				c.swapShape(5000)
		})
		
	}
// -------------- // 


}


// -- END OF CLASS -- // 
// ----------------------------// 

// INDIVDUAL CLUSTERS -- > A CIRCLE (Cluster) + smaller CIRCLES (Nodes/ Makers)
export class ClusterClass { 

	constructor (layout, dom, data){ 
		this.layout = layout; // parent layout -- // 
		this.domElement  = dom;
		this.data = [data]; //  = clusters[0]; // the source data (the original data)

		// -- locations 
		// loc - centre location 
		// loc end - the end (when cluster is draw as a line )
		this.loc = { x:0, y:0};
		this.loc_end = { x: 0, y:0}; 
		
		//this.tloc = { x:0, y:0}; // needed ? 

		// -- node data 
		this.nodes_base = this.data[0].nodes; // base nodes (remains the same)
		this.nodes = [...this.nodes_base]; // nodes to use 

		// -- link data 
		this.links_base = this.data[0].links; // base set of links 
		this.links  = [...this.links_base] ; // links to use (filtered)

		// -- add ALL nodes to selected nodes. -- // 		
		this.selectedNodes = [ ]; //[...this.nodes ]; //this.nodes[0]]; // nodes to higlight -- (test)
		this.selectedLinks = [ ] ; // [...this.links]
		this.flowNodes = [ ];

		// -- dates (for when in  line)
		this.minMaxDates = {min:0, max:0}


		// -- dom elements 
		this.group; // the group element in the dom
		this.nodesGroup;
		this.nodeLines; 

		this.clusterShape;
		this.clusterShapeEnd;
		this.clusterShapeRect;

		// -- force
		this.nodesimulation = d3.forceSimulation ( ); 
		// this.hasForce = false; 

		// -- colours  (selected / not) (node and cluster.. )
		this.clusterCol = 'orange'; // 

		this.init( );
		this.updateNodeParentLoc( );

		//this.converge( );
		//setTimeout (this.moveNodes.bind(this), 7000)


	}

	init ( ) { 
		//this.filterByDate(1800)
		//this.update( ) // update node data
		//console.log (this.nodes[0]);
		//this.queryClusterNodes('towns', 'Birmingham' );

	}

	updateNodeParentLoc( ) { 
		// give each node the parrent cluster location..
		this.nodes.forEach (n=> { 
			n.parent_x = this.loc.x;
			n.parent_y = this.loc.y;
			n.parent_size = this.data[0].size;
		}) 
		//console.log ("data updated ", this.data[0])
	}

	createElements ( ) { 
			this.group = this.domElement.selectAll ('#' + this.data.name);
			this.clusterShape = this.group.selectAll ('#clusterCircle')
			this.clusterShapeEnd = this.group.selectAll ('#clusterCircleEnd')
			this.clusterShapeRect = this.group.selectAll ('#clusterRect')

			this.nodeLines = this.group.selectAll ("#nodeLine")



	}

	// -- draw group -- CONTAINER for cluster (placeholder)
	drawGroupElement ( ) { 
		// create group and JOIN to data 
		this.group = this.domElement.selectAll ('#' + this.data.name)
			 	.data(this.data)
		    .enter()
		    .append('g')
		    .attr('id', d => d.name) // each group has ID as guild na

	}

	// get screen loc of group -- 

	// -- draw cluster shape (Circle)
	drawShapeGroup(fill) { 
			// -- as a circle -- // 
			this.clusterShape = this.group.selectAll ('#clusterCircle')
				.data (this.data)
				.join(
		      function(enter) {
		        return enter.append('circle')
		      },

		      function(update) {
		         return update.attr('opacity', .3);
		      },

		      function (exit) { 
		      	return exit.remove ( )
		      }
				)
			.attr ('id', 'clusterCircle')
			.attr ('r', d => d.size * d.scale / 2)
			.attr ('fill', this.clusterCol)
			.attr ('opacity', 0.1)
			.on ('mouseover',  (e, d) => { 
				//	this.rollCluster( )
			})
			.on ('mouseout',  (e, d) => { 
				//	this.rollOutCluster( )
			});



			// -- as an END circle -- // 
			this.clusterShapeEnd = this.group.selectAll ('#clusterCircleEnd')
				.data (this.data)
				.join(
		      function(enter) {
		        return enter.append('circle')
		      },

		      function(update) {
		         return update.attr('opacity', .3);
		      },

		      function (exit) { 
		      	return exit.remove ( )
		      }
				)
			.attr ('id', 'clusterCircleEnd')
			.attr ('r', d => 5) // d.size * d.scale)
			.attr ('fill', 'gray')
			.attr ('opacity', 0.1)
			.attr ('cy', this.loc_end.y)
			//.attr ('transform', 'scale(2.5)')

		// -- LINE to join -- // 
		let line = this.group.selectAll ('#clusterLine')
				.data (this.data)
				.join(
		      function(enter) {
		        return enter.append('line')
		      },

		      function(update) {
		         return update.attr('opacity', .3);
		      },

		      function (exit) { 
		      	return exit.remove ( )
		      }
				)
				.attr("id", 'clusterLine')
				.attr("x1", 0)
				.attr("y1", 0)
				.attr("x2", 0)
				.attr("y2", this.loc_end.y)
				.attr("stroke", "gray")
				.attr('opacity', 0.2)
				.attr("stroke-width", 2);


			// -- add  CLICK event -- // 
			this.clusterShape.on ('click', this.clickCluster.bind (this))


			// -- as a rect -- // 
			this.clusterShapeRect = this.group.selectAll ('#clusterRect')
					.data (this.data)
					.join(
			      function(enter) {
			        return enter.append('rect')
			      },

			      function(update) {
			         return update.attr('opacity', 1);
			      },

			      function (exit) { 
			      	return exit.remove ( )
			      }
					)
				.attr ('id', 'clusterRect')
				.attr ('width', d => d.size *0.2)
				.attr ('height',d => d.size *1.4)
				.attr ('x', d => -d.size/2)
				.attr ('y', d => -d.size/2)
				.attr ('fill', 'red')
				.attr ('opacity', 0.0)

	}


  	// -- scale cluster -- 
  	scaleCluster (target, inc) { 
  		let scaleInc = target > this.data[0].scale ? inc : inc * -1
  		//let scaleInc = -0.01
  		let isScaling = true 
  		//...
  		this.data[0].scale += scaleInc ; 
  		//this.restartForces_nodes( ); // update node forces 
  		//...
		if (scaleInc>0 && this.data[0].scale >= target || scaleInc<0 && this.data[0].scale <= target) { 
			isScaling = false
		}

  		return isScaling
  	}
  	//  ------------------ // 

	// -- draw the node items 
	drawShapeNodes(fill) { 
		 //console.log ('selected nodes = ', this.selectedNodes)
		 //console.log ('nodes = ', this.nodes)

		// -- draw the nodes -- // 
		 this.nodesGroup = this.group.selectAll ('#nodeCircle')
				.data (this.nodes)
				.join(
		      function(enter) {
		        return enter.append('circle')
		          //.style('opacity', 0.25);
		      },

		      function(update) {
		         return update.attr('opacity', 0.2);
		      },

		      function (exit) { 
		      	return exit.remove ( )
		      }
				)

			.attr ('id', 'nodeCircle')
			.attr ('r', d => this.data[0].scale * 5)
			.attr ('fill', d => { 
						const color = this.flowNodes.includes(d) ? 'gold' :
              						  this.selectedNodes.includes(d) ? 'red' :
              						'lightgray';

						return  color ; // this.flowNodes.includes (d) ? 'orangered' : 'gray'
						//return this.isNodeSelected(d) ?  'orangered' : 'gray'
			})
			.attr ('opacity', d=> { 
						return this.selectedNodes.includes (d) ? 1 : 0.9
						//return this.isNodeSelected(d) ?  1 : 0.1;
			})

	  // -- draw the links between nodes -- . 
			this.nodeLines = this.group.selectAll ('#nodeLine')
			 	.data (this.links)
			 	.join(
				      function(enter) {
				        return enter.append('line')
				          //.style('opacity', 0.25);
				      },

				      function(update) {
				         return update.attr('opacity', 0.2);
				      },

				      function (exit) { 
				      	return exit.remove ( )
				      }
				)
				.attr ('id', 'nodeLine')
			 	.attr ('stroke',  d => { 

						return this.selectedLinks.includes (d) ? 'orangered' : 'gray'
				})
			 	.attr ('stroke-width', 1.5)
			 	.attr ('opacity', 0.5)
			 	// x y will be updated during drawing 
			 	// .attr ('x1', 0)
			 	// .attr ('y1', 0)
			 	// .attr ('x2', 10)
			 	// .attr ('y2', 10)

	}



	setvaluesForSelectedNodes ( ) { 
		// if selected alter size ? etc / 
	}

	// -- see if one of the selected nodes 
	isNodeSelected (d) { 
		// -- check to if this node is in the node selection -- // 
		// -- to begin with -put ALL nodes in selected nodes. // and filter them away -- 		
	  	return this.selectedNodes.includes (d)
	}

	// --- swap group shape (transtion) 
	swapShape (time) { 
		 // fade out circle -- 
			let circleAlpha = this.clusterShape.attr ('opacity');
			let rectAlpha = this.clusterShapeRect.attr ('opacity')

			let cTarget = (circleAlpha >= 0.7) ? 0 : 0.8;
			let rTarget = (rectAlpha >= 0.7)   ? 0 : 0.8;

			// change shape -- 

			this.clusterShape
					.transition( )
					.duration (time) 
					.attr ('opacity', cTarget)

			this.clusterShapeRect
					.transition( )
					.duration (time)
			 		.attr ('opacity', rTarget)
		}

	// -- ressize layout and clusters -- // 
	resSizeGroupShape ( ){ 


	}

	// set cluster size (transition to new size )
	reduceSize ( ) { 
		// reduce size and redraw  -- reduce scale
		// set 'r' changes the visual -but forces use data.size.. 
		this.transitionSelection ( this.clusterShape, {r:5}, 2000)
		this.transitionSelection ( this.clusterShapeEnd, {r: 5}, 2000)

	}



	changeSize ( ) { 
		console.log ('change size')
		this.clusterShape
		   .transition( )
		   .duration (1000)
		   .attr ('r', 5)
		   .duration (3000)
		   .attr ('fill', 'blue')

		// this.clusterShape
		//    .transition( )
		

	}

	// -- a function to transition between attributes -- // 
	transitionSelection(selection, changes, duration) {
				// could do with changing the selection -- 
			  //let s2 = this.group.selectAll ('#clusterCircle')
			  let transition = selection.transition().duration(duration);
			  
			  Object.keys(changes).forEach(function(property) {
			    //if (property === 'transform') {
			      transition.attr(property, changes[property]);
			    //} else {
			      //transition.style(property, changes[property]);
			    //}
			  });
			  return transition;
	}





// -- set MOVE FUNCTION -- to use for ALL -- 
	moveToPos (x, y, time, forces_data) {
		// a function which move the container to a new position - using transition.. (??) 
		this.loc.x = x; 
		this.loc.y = y; 

		//console.log (this.data)
		//console.log (this.layout)
		//console.log (forcesdata)
		forces_data.x = this.loc.x; // reset data x y so that the move back to group will start from date pos
		forces_data.y = this.loc.y; 

	  // this group is the container for the shapes -- // 
		this.group
			.transition ( )
			.duration (time)
			//.attr ('fill', 'blue')
			.attr ('transform','translate('+this.loc.x+','+this.loc.y+')' )	

		this.updateNodeParentLoc( ); 
	}

	moveByForce (x, y) { 
		this.loc.x = x; 
		this.loc.y = y; 

		this.group.attr ('transform','translate('+this.loc.x+','+this.loc.y+')' )
		this.updateNodeParentLoc( ); 

	}

	// DON't USE transition at all - but use a follower - a 'manual TWEEN'
	manualTween ( ) { 
		/// set loc x to a tween of 
		// tween numbers. 
		this.loc.x = this.tloc.x; 
		this.loc.y = this.t.loc.y; 


	}


// -- CLICK CLUSTER - interactions 
	rollCluster ( ) { 
		if (this.layout.type == 'force') { 
			this.restartForces_nodes( )	
			this.layout.restartForces( )	
			this.layout.scaleUpClusters(this)
		}
	}

	rollOutCluster ( ) { 
		if (this.layout.type == 'force') { 
			this.layout.scaleDownClusters(this)
		}
	}

	clickCluster ( ) {
		//let selection = this.nodes; 
		//_root.addToSelection_Social (selection.map (n=> n.id))
		this.layout.updateSelection(this)


		// -- OLD STUFF -- // 
			//this.clusterShape.append ('circle')

			// -- remove rects from selection -- 
			// let shapetype = this.clusterShape.node().nodeName
			// console.log ("shape type = ", shapetype); 

			// if (shapetype === 'circle') {
			//     this.clusterShape

			//     		.data (this.data)
			//     		.remove ( )
			//     		.append('rect')
			//        .attr('x', 200) // d3.select(this).attr('cx') - 10)
			//        .attr('y', 200) // d3.select(this).attr('cy') - 10)
			//       .attr('width', 200)
			//       .attr('height', 200);
	  		// }	


			//	console.log ("click me "); 
			//this.layout.updateForces( )
			//this.layout.moveClusterLayout( );
			

			//this.applyForcesToNodes (5)



			// if (this.hasForce == false ) { 
			// 	this.applyForces(10);
			// 	this.hasForce = true; 
			// } 

			// if (this.hasForce == true) {
			// 	this.removeForces ( ); 
			// 	this.hasForce = false; 
			// }
	}

// -- APPLY / REMOVE FORCES to NODES --

	applyForcesToNodes ( )  { 
			//this.nodesimulation = d3.forceSimulation ()
			this.nodesimulation.nodes (this.nodes); // set node data to apply force to -- // 
			//console.log ('node forces ', this.nodes)

			// apply link force -- // 
			this.nodesimulation
				.force ('link', d3.forceLink(this.links).id (d => d.id).distance (25))

			this.nodesimulation
				.force ('forceX', d3.forceX().x(0).strength(0.1))// this.forceX)
			  	.force ('forceY', d3.forceY().y(0).strength(0.1)) //this.forceY)
			   	 .force ('repel',  d3.forceManyBody( )) // this.forceCharge)
			    //.force ('collide',d3.forceCollide( ).radius(d => { return 10 * 1}).strength(0.9)) //  this.forceCollide)
			    .on ('tick', this.nodeForces_tick.bind (this))
	}



	restartForces_nodes ( ){ 
		//console.log ("restart forces")
		this.nodesimulation.on ('tick', this.nodeForces_tick.bind (this))
    	this.nodesimulation.alpha(1).restart( );
	}

	nodeForces_tick ( ) { 
		// -- update nodes -- // 
			this.nodesGroup.attr ('cx', d=>  { 
				let x = 0;
				if (d.x == NaN) x = 0; 
				if (d.x != NaN) x = d.x; 

				//console.log ('d ', d.x)
				return x; // d.x
			});
			this.nodesGroup.attr ('cy', d=> {
				let y = 0;
				if (d.y == NaN) y = 0; 
				if (d.y != NaN) y = d.y; 

				return y; // d.y
			});

	   // -- update links -- //
	   //this.updateLinks_tick( ) 
	}

	updateLinks_tick ( ) { 

		this.nodeLines
				.attr ('x1', d=> d.source.x) 
				.attr ('y1', d=> d.source.y) 
				.attr ('x2', d=> d.target.x) 
				.attr ('y2', d=> d.target.y); 
		


	}

	removeForces ( ) { 
		this.nodesimulation.stop ();
		//this.force.force ('collide', d3.forceCollide ().radius (0).strength (.1))
		//this.restartForces( );
	}


// -- MOVE NODES XY -- transition -- // 
	moveNodes ( ) { 
		// set to new xy pos (date)
		// this.nodes is set to nodes group.. 
		this.nodesGroup
				.attr('cx', d => d.x)
				.attr('cy', d => { 
					 //console.log (d)
					 return d.y;
				})
	}


	moveNodes_transition ( ) { 
		// move nodes within the Group Container..
		this.nodesGroup
					.transition( )
					.duration(4000)
					.attr ('fill', 'red')
					.attr ('cx', 0)
					.attr ('cy', ((d, i)=> i * 10))

	}

// -- FILTER NODES by DATE -- // 
	 filterNodes (selection) { 
		 	// diff - shows which nodes to add and which nodes to remove 
		 	let diff = { 
					toRemove :  this.nodes.filter(node =>  selection.indexOf(node) === -1), // remove nodes NOT in SELECTION 
				  toAdd :     selection.filter (node =>  this.nodes.indexOf (node) === -1) // ADD nodes in seection that are NOT in nodes.
			}
			
			//-- console.log ('diff = ', diff.toAdd)
			// update this.nodes :  remove those from 'remove' // add those from 'add '
			diff.toRemove.forEach (node => this.nodes.splice (this.nodes.indexOf(node), 1)) ; // REMOVE nodes from 'toRemove' 
			diff.toAdd.forEach(node => this.nodes.push(node)) ; // ADD nodes from 'toAdd'

			// -- filter links based on filtered nodes  -- 
			this.links = this.links_base.filter (l => this.nodes.indexOf (l.source)> -1 && this.nodes.indexOf(l.target)> -1 )


		 	return [...this.nodes]
	 }


	 // -- should this be a GLOBAL function 
	 filterByDate (maxDate) {
		 // -- conditions -/
		 let lessThan = (a, b) => a < b;
		 let greaterThan = (a, b) => a > b; 
		 let equalTo = (a, b) => a == b; 
		 let isBetween = (a, b, c) => a > b && a < c; 

		 // -- filter node data 
		 let dateFilter = this.nodes_base.filter (n => { 
		 			let baseNode = _root.base_nodes.find (bn => bn.id === n.id); // find matching source nodes (from base nodes)
		 			return lessThan (baseNode.date_1, maxDate); 
			})
		 //console.log ('date filter = ', dateFilter)
		 return dateFilter; 

	 }

	 // -- SORT nodes in this cluster by DATE -- 
	 sortNodesByDate ( ) { 
		 	// -- GET NODES and SORT into DATE order --  
			let clusternodes = this.layout.nodes.filter(node => this.nodes.find (cn => cn.id == node.id)); // -- get nodes from ids

			// -- SORT into date order 
			clusternodes = clusternodes.sort((a, b) => a.date_1 - b.date_1); 

			// -- SORT nodes in this cluster.. (sort by index pos of id)
			this.nodes.sort((a, b) => {
						return clusternodes.findIndex((element) => element.id === a.id) - clusternodes.findIndex((element) => element.id === b.id);
			});

			
			// -- GET min and max dates --  (the extent of the cluster)
			if (clusternodes.length > 0) {
				this.minMaxDates.min = clusternodes[0].date_1;
				this.minMaxDates.max = clusternodes[clusternodes.length-1].date_1;
				//this.minMaxDates = { min: minDate, max: maxDate};
			} else { 
				this.minMaxDates = { min: 0, max: 0}
			}


			// UPDATE the XY pos for each node Data item 
			this.nodes.forEach (n => { 
					let sourcenode = this.layout.nodes.find (ln => ln.id == n.id); 
					let date1 = sourcenode.date_1;
					let ypos = this.layout.dateScale(date1) ; // get y pos of date 
					let starty = this.layout.dateScale (this.minMaxDates.min); // get base ypos 
					// the ypos is relative to the group centre point 
					n.y = ypos - starty;
					n.x = 0; 
			})

			return clusternodes;
	 }

	 // -- GET MIN and MAX DATES -- // 
	 getMinMaxDates ( ) { 


	 }

	 // -- QUERY nodes in CLUSTER -- // 
	 // -- query by attribute -- 
	 queryNodesByAttribute (att, value) { 
	 		// -- find node with the same id - extract towns - if towns include (x) push to array - // 
	 		// -- starting with (towns = london etc)
	 		let selection = [ ]; 
	 		this.nodes.forEach ( n => { 
				let item = this.layout.nodes.find (node => node.id == n.id)[att];
				if (item.includes (value)) selection.push (n)
	 		})

	 		// -- UPDATE selected nodes (filter current selection ) -- // 
	 		this.selectedNodes =  this.selectedNodes.filter(node => selection.map(newnode => newnode.id).includes(node.id));
	 		//this.selectedNodes = selection; //  
	 		this.drawShapeNodes( )
	 }

	 // -- query by selection : i.e. see which items match a given array of node ids
	 queryNodesBySelection (selectedArray) { 
		 	this.selectedNodes = this.selectedNodes.filter ( n => selectedArray.includes(n.id))

		 	// update links to selected nodes 
		 	this.links = this.links_base.filter (l => this.selectedNodes.indexOf (l.source)> -1 && this.selectedNodes.indexOf(l.target)> -1 )

		 	this.drawShapeNodes( )

	 }

	 // -- show higligthed 

}

























































