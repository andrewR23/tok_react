import *  as d3 from 'd3';
import * as  Vec2D from 'victor';
import * as _root from './classTest.js'



// -- a LAYOUT of CLUSTERS (GROUP) -- 
// -- define the configuration of all the items in a layout -- // 
export class Layout { 

// -- 1. INIT : construcotor-- // 
	constructor (svg, nodes, clusterdata, center, fill) { 
		this.clusterdata = clusterdata; // data for ALL the clusters -- // 
		this.nodes = nodes; // nodes will be in cluster data - // is this needed?? 
		this.clusterlist = [ ]; // -- a list of the clusters in the layout -- //  

		this.svg = svg;
		this.clusterDOM =  this.svg.append ('g').attr ('id', 'layout1'); // the element to add clusters
		
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

		this.init( );

		//setTimeout (this.clusterlist[0].moveNodes, 7000)
		console.log ('cluster data = ', clusterdata)
	}

	// --------------------- // 

	init ( ) { 
		this.createClusters( ); // populate clusters
		this.drawContainers( );
		// -- draw -- 
		//this.drawClusters( );
		//this.drawNodes( );

		// -- update layout
		this.updateLayout('force');
		//  this.setForces_layout( );
		//  this.setForces_nodes( );
		//  this.restartForces( );
	}

	// --------------------- // 

// -- 2. CREATE clusters  -- DRAW clusters  and nodes-- // 
	createClusters ( ) { 
		this.clusterdata.forEach (data => { 
			console.log ('cluster data ', data)
				const newcluster = new ClusterClass(this, this.clusterDOM, data); // this is a new cluster item
				this.clusterlist.push (newcluster);
		})
		console.log ("cluster list ", this.clusterlist)
	}

	// --------------------- // 

	drawContainers ( ) { 
		this.clusterlist.forEach (c => { 
			  c.drawGroupElement ( ); // DOM element (placeholder)
		})
	}

	drawClusters ( ){ 
		this.clusterlist.forEach (c => { 
			  c.drawShapeGroup (this.fill )
		})
	}

	drawNodes ( ){ 
		this.clusterlist.forEach (c => { 
			  c.drawShapeNodes ('blue');
			})
	}

	setForces_nodes ( ) { 
		this.clusterlist.forEach (c => { 
			  c.applyForcesToNodes( )
			})
	}

	// set visuals  for cluster items -- 


// -- 2b. (RE) DRAW (update) LAYOUT -- 
	updateLayout ( ) { 
		// -draw nodes 
		// -draw clusers.. 
		if (this.type == 'date') { 
				this.moveClusterLayoutXY ( )
				//this.clusterlist.forEach (c => c.changeSize ( ))
				//this.restartForces( );
		}


		if (this.type == 'force') { 
		  	// -- calcuate (forces) -- // 
		  	this.setForces_layout( );
		  	this.restartForces( );


		  	// -- caclute forces on Nodes in clusters.. 
		  	//this.setForces_nodes( ); // nodes 
		  	//this.clusterlist.forEach (c => 	c.restartForces_nodes( )); // nodes
  	}


  this.drawClusters ( ); 
 // this.drawNodes ( );

	}


// -- 3. SET VISUAL : cluster shape 
	setClusterShape (circleVal, rectVal ) { 
			this.clusterlist.forEach (c => { 
			  c.clusterShape.attr ('visibility', circleVal)
			  c.clusterShapeRect.attr ('visibility', rectVal)
		})
	}

	// --------------------- // 

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
			    .force ('repel',  d3.forceManyBody( ).strength(-3)) // this.forceCharge)
			    .force ('collide',d3.forceCollide( ).radius((d, i) => {
			    			return d.size*1.5 })) //  this.forceCollide)
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
							    .force ('forceY', null)
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
			console.log ("tick layout ")
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
			let x = i*40 +10;
			let y = 400; 
			c.moveToPos (x, y, this.clusterdata[i] )
		})
	}

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
				this.clusterdata[i].size = filterednodes.length * 5 + 1; // reset cluster size 
		})

		// -- get selection for ONE cluster -- a test
		let selection = this.clusterlist[0].filterByDate(date) ;// get a selection 
  	let filterednodes = this.clusterlist[0].filterNodes (selection); // update 
		//this.clusterdata[0].nodes = filterednodes; // [...this.nodes] ;// update nodes i cluster data
		//this.clusterdata[0].size  = this.clusterdata[0].nodes.length * 5 + 1; 
		

		/// -- update forces ?? -- // 
		//this.setForces_nodes( );
		//this.setForces_layout( );
		//this.restartForces( );
		//this.updateLayout('force')
		//
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
// ----------------------------// 

// INDIVDUAL CLUSTERS -- > A CIRCLE (Cluster) + smaller CIRCLES (Nodes/ Makers)
export class ClusterClass { 

	constructor (layout, dom, data){ 
		this.layout = layout; // parent layout -- // 

		this.domElement  = dom;
		this.data = [data]; //  = clusters[0]; // the source data (the original data)

		this.loc = { x:100, y:100};
		this.tloc = { x:0, y:0};

		this.nodes_base = this.data[0].nodes; // base nodes (remains the same)
		this.nodes = [...this.nodes_base]; // nodes to use 


		//console.log ('cluster data ', this.data[0])

		this.group; // the group element in the dom
		this.nodesGroup;
		this.clusterShape
		this.clusterShapeRect;

		this.nodesimulation = d3.forceSimulation ( ); 
		// this.hasForce = false; 

		this.init( );
		this.updateNodeParentLoc( );

		//this.converge( );
		//setTimeout (this.moveNodes.bind(this), 7000)


	}

	init ( ) { 
		//this.filterByDate(1800)
		//this.update( ) // update node data

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
		         return update.attr('opacity', .1);
		      },

		      function (exit) { 
		      	return exit.remove ( )
		      }
				)
			.attr ('id', 'clusterCircle')
			.attr ('r', d => d.size)
			.attr ('fill', 'red')
			.attr ('opacity', 0.7)
			//.attr ('cx', -200)


			// -- add event -- // 
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


	// -- draw the node items 
	drawShapeNodes(fill) { 

		this.nodesGroup = this.group.selectAll ('#nodeCircle')
				.data (this.nodes)
				.join(
		      function(enter) {
		        return enter.append('circle')
		          //.style('opacity', 0.25);
		      },

		      function(update) {
		         return update.attr('opacity', 0.1);
		      },

		      function (exit) { 
		      	return exit.remove ( )
		      }
				)

			.attr ('id', 'nodeCircle')
			.attr ('r', 5)
			.attr ('fill', fill)
			.attr ('opacity', 0.2)

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

changeSize ( ) { 
	console.log ('change size')
		//this.group
		  // .transition( )
		  // .duration (1000)
		  //.attr ('r', 5)

	}



// -- set MOVE FUNCTION -- to use for ALL -- 
	moveToPos (x, y, forces_data) {
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
			.duration (500)
			//.attr ('fill', 'blue')
			.attr ('transform','translate('+this.loc.x+','+this.loc.y+')' )	

		this.updateNodeParentLoc( ); 
	}

	moveByForce (x, y) { 
		this.loc.x = x; 
		this.loc.y = y; 

		this.group
			.attr ('transform','translate('+this.loc.x+','+this.loc.y+')' )
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

	clickCluster ( ) {
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
		this.layout.swapLayoutShape( ); // change fade values -- 
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

			this.nodesimulation
					.force ('forceX', d3.forceX().x(0).strength(0.1))// this.forceX)
			  	.force ('forceY', d3.forceY().y(0).strength(0.1)) //this.forceY)
			   	//  .force ('repel',  d3.forceManyBody( )) // this.forceCharge)
			    .force ('collide',d3.forceCollide( ).radius(5).strength(0.9)) //  this.forceCollide)
			    .on ('tick', this.nodeForces_tick.bind (this))
	}

	restartForces_nodes ( ){ 
			//console.log ("restart forces")
			this.nodesimulation.on ('tick', this.nodeForces_tick.bind (this))
    	this.nodesimulation.alpha(1).restart( );
	}

	nodeForces_tick ( ) { 
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
	}

	removeForces ( ) { 
		//this.force.force ('collide', d3.forceCollide ().radius (0).strength (.1))
		//this.restartForces( );
	}


// -- MOVE NODES XY -- transition -- // 


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
		 	//let selection = selection; // this.filterByDate (date); 
		 	//console.log ('selection = ', selection); 
		 	//console.log ('original  = ', this.nodes_base); 
		  //console.log ('current = ', this.nodes)

		 	// diff - shows which nodes to add and which nodes to remove 
		 	let diff = { 
					toRemove :  this.nodes.filter(node =>  selection.indexOf(node) === -1), // remove nodes NOT in SELECTION 
				  toAdd :     selection.filter (node =>  this.nodes.indexOf (node) === -1) // ADD nodes in seection that are NOT in nodes.
			}
			
			//-- console.log ('diff = ', diff.toAdd)
			// update this.nodes :  remove those from 'remove' // add those from 'add '
			diff.toRemove.forEach (node => this.nodes.splice (this.nodes.indexOf(node), 1)) ; // REMOVE nodes from 'toRemove' 
			diff.toAdd.forEach(node => this.nodes.push(node)) ; // ADD nodes from 'toAdd'
		 //console.log ('current new = ', this.nodes)
		 //console.log ('////////////////////')

			// this.drawShapeNodes('blue');
			// this.drawShapeGroup('red');

			 ///this.restartForces_nodes( ); // restart forces IF needed -- 

			// -- MOVE THIS -- ?? -- 
				 	// redraw nodes and restart forces for nodes -- // 
				 //this.drawShapeNodes('blue');
				 

				 	// redraw cluster and restart forces for all clusters in the layout. 
				 	// update cluster size; 
				 	//this.data[0].size = this.nodes.length * 5 + 1; 
				 	//this.layout.clusterdata[0].size =  10 ; // this.nodes.length * 5 + 1; 

				 	//this.layout.clusterdata[0].nodes = [...this.nodes] ;// update nodes i cluster data
				 	
				 //	this.drawShapeGroup('red');
				 	//this.clusterShape.attr ('r', this.nodes.length * 5 + 2)

		 	return [...this.nodes]
	 }

	 filterByDate (maxDate) {
			//console.log ('node data ', this.nodes); // node ids in this cluster 
		 //console.log ('base nodes ', _root.base_nodes)
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

}






























