import *  as d3 from 'd3';
import * as  Vec2D from 'victor';


export class D3Shape {
  constructor(dom) {
    this.dom = dom;
  }

  drawCircle(radius, fillColor) {
    this.dom.append("circle")
      .attr("r", radius)
      .style("fill", fillColor);
  }

  drawRect(width, height, fillColor) {
    this.dom.append("rect")
      .attr("width", width)
      .attr("height", height)
      .style("fill", fillColor);
  }

  setPos(x, y) {
    this.dom.attr("transform", `translate(${x},${y})`);
  }
}


// a cluster is a shape which contains a g + circle + inner shapes 
// it will have some data

// -- a LAYOUT of CLUSTERS -- 
export class Layout { 

	constructor (svg, nodes, clusterdata, center, fill) { 
		
		this.nodes = nodes; // nodes will be in cluster data - // is this needed?? 
		this.clusterdata = clusterdata; 
		this.svg = svg;

		this.clusterDOM =  this.svg.append ('g').attr ('id', 'layout1'); // the element to add clusters

		this.clusterlist = [ ]; // -- a list of the clusters in the layout -- //  
		

		// - forces applied to clusters -- // 
		this.simulation = d3.forceSimulation( );
		// -- set named forces -- // 
			this.forceX = d3.forceX();
			this.forceY = d3.forceY();
			this.forceCharge = d3.forceManyBody( );
			this.forceCollide = d3.forceCollide( )

		this.center = center; // { x: 300, y: 200}
		this.fill = fill;

		this.init( );

		//setTimeout (this.clusterlist[0].moveNodes, 7000)

		this.forceList  = [ ]; // 
		this.nullForces = [ ]; // set to null

	
	}

	init ( ) { 
		this.createClusters( ); // populate clusters
		this.drawClusters( );
		this.createForces( );

	}

	createClusters ( ) { 
		this.clusterdata.forEach (data => { 
				const cluster = new ClusterClass(this, this.clusterDOM, data); // this is a new cluster item
				this.clusterlist.push (cluster);
		})
		//console.log ("cluster list ", this.clusterlist)
	}

	drawClusters ( ){ 
		this.clusterlist.forEach (c => { 
			  c.drawGroupElement ( );
			  c.drawShapes(this.fill);
		})

	}


	/// -- control set add remove forces -- /// 
	addForce (name) { }

	createForces ( ) { 
			// set items to move
			this.simulation.nodes (this.clusterdata); // set node data to apply force to -- // 
			this.setForceValues( );

			this.simulation
					.force ('forceX', d3.forceX().x(this.center.x))// this.forceX)
			    .force ('forceY', d3.forceY().y(this.center.y)) //this.forceY)
			    .force ('repel',  d3.forceManyBody( )) // this.forceCharge)
			    .force ('collide',d3.forceCollide( )) //  this.forceCollide)
			    .on ('tick', this.forcesTick.bind (this) )
			


			//this.addAllForces( );		
		  //this.restartForces( );
			
	}

	// ---------------- // 
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
		console.log ('update forces')	
		this.forceX.x(800)
		this.forceY.y(400)
		this.restartForces( );
	}

	// ---------------- // 

	restartForces ( ) { 
		//this.simulation.on ('tick', this.forcesTick.bind(this))
		this.simulation.alpha(1).restart( );
	}

	// ---------------- // 
	forcesTick ( ){ 
		console.log ("tick layout ")

		// move the group item that each cluster is in... 
		this.clusterlist.forEach ((c, i) => { 
				c.moveGroupXY_force (this.clusterdata[i].x, this.clusterdata[i].y);
		})
		// this.clusterlist[0].moveGroup (this.clusterdata[0].x, this.clusterdata[0].y);
    // clusterList[1].moveGroup (clusterDataV1[1].x, clusterDataV1[1].y);

	}

	// ---------------- // 

	moveCluster ( ) { 
		// turn off the forces and give each cluster a new poistion to go to.. 
		// the base of the cluster can be set immediatry.. // 
		//this.removeAllForces( );
		this.simulation.stop ( );
		this.clusterlist.forEach ((c, i) => { 
			c.setGroupXY_transition (100, 100)
		})
	}



}

// INDIVDUAL CLUSSTERS -- > A CIRCLE (Cluster) + smaller CIRCLES (Nodes/ Makers)
export class ClusterClass { 

	constructor (layout, dom, data){ 
		this.layout = layout; // parent layout -- // 

		this.domElement  = dom;
		this.data = [data]; //  = clusters[0]; // the source data 
		this.loc = { x:0, y:0};
		this.tloc = { x:0, y:0};



		this.nodeData = this.data[0].nodes;

		//console.log ('cluster data ', this.data[0])


		this.group; // the grop element in the dom
		this.nodesGroup;
		this.clusterShape;

		this.force; 
		this.hasForce = false; 

		this.init( );
		this.updateNodeParentLoc( );

		//this.converge( );
		//setTimeout (this.moveNodes.bind(this), 7000)


	}

	init ( ) { 
		console.log ("init ")
		//this.update( ) // update node data

	}

	updateNodeParentLoc( ) { 
		// give each node the parrent cluster location..
		this.nodeData.forEach (n=> { 
			n.parent_x = this.loc.x;
			n.parent_y = this.loc.y;
			n.parent_size = this.data[0].size;
		}) 
		//console.log ("data updated ", this.data[0])
	}

	// append a path to the dom -- 
	drawShape ( ) { 
		this.domElement.append ('path')
	}

	// -- draw group 
	drawGroupElement ( ) { 
		// create group and JOIN to data 
		this.group = this.domElement.selectAll ('#' + this.data.name)
			 	.data(this.data)
		    .enter()
		    .append('g')
		    .attr('id', d => d.name) // each group has ID as guild na

	}

	// -- put data shape into group
	drawShapes (fill) { 

		// add circle for a cluster. 
		this.clusterShape = this.group.selectAll ('#clusterCircle')
				.data (this.data)
				.enter ( )
				.append ('circle')
				.attr ('id', 'clusterCircle')
				.attr ('r', d => d.size)
				.attr ('opacity', 0.1)
				.attr ('fill', fill)

		// add a circles (individual nodes )
		this.nodesGroup = this.group.selectAll ('#nodeCircle')
					.data (this.nodeData)
					.enter( )
					.append ('circle')
					.attr ('id', 'nodeCircle')
					.attr ('r', 2)
					.attr ('fill', 'blue')


		// add events 
		this.clusterShape.on ('click', this.clickCluster.bind (this))

	}

 
	// --  move this cluster groups by force -
	moveGroupXY_force (x, y) {
		// -- target loc 
		this.tloc.x = x;
		this.tloc.y = y; 

		let dx = this.tloc.x - this.loc.x; 
		let dy = this.tloc.y - this.loc.y; 

		// -- current loc 
		this.loc.x += dx * 1; 
		this.loc.y += dy * 1

		// move group (tranform)
		// 'this group' - is the dom element which holds the shapes -- // 
		this.group.attr ('transform', 'translate('+this.loc.x+','+this.loc.y+')'); 

		// update nodes parent value :
		this.updateNodeParentLoc( ); 

	}

	setGroupXY_transition (x, y) { 
		this.tloc.x = x;
		this.tloc.y = y;
		this.loc.x  = x;
		this.loc.y  = y; 

		// begin a transition.
		//this.group.attr ('transform', 'translate('+this.loc.x+','+this.loc.y+')'); 

		// --  location
		this.group
					.transition ( )
					.duration (1000)
					.attr ('transform','translate('+this.loc.x+','+this.loc.y+')' )


		// -- try a colour transition of cluster shape 
		this.clusterShape
				.transition()
			  .duration(4000)
			  .attr ("fill", 'pink')
			  .attr ('opacity', 1)

		this.updateNodeParentLoc( ); 

	}





	// move with transition.. // 


	clickCluster ( ) {
		//	console.log ("click me "); 
		//this.layout.updateForces( )
		this.layout.moveCluster( );
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


	startForce ( ) { 


	}

	removeForces ( ) { 
		//this.force.force ('collide', d3.forceCollide ().radius (0).strength (.1))
		//this.restartForces( );
	}


	applyForcesToNodes (r) { 
		// apply force to this data[0] nodes.. 
		this.force = d3.forceSimulation (this.nodeData)
					.force ('collide', d3.forceCollide ().radius (r).strength (1))
					.on ('tick', this.doForces.bind (this) )

	}



	restartForces ( ){ 
		this.force.on ('tick', this.doForces.bind (this))
    	this.force.alpha(1).restart( );
	}

	doForces ( ) { 
		//console.log ('do forces')
		//console.log ('d')
		this.nodesGroup.attr ('cx', d=>  { 
			//console.log ('d ', d)
			return d.x
		});
		this.nodesGroup.attr ('cy', d=> d.y);
	}


	update( ) { 
		let interval; 
		
		function showData ( ) {
			console.log ("show data nodes")
			console.log ('nodes :', this.nodeData);
			console.log ('sample x pos ', this.nodeData[0].x)

		} 
		interval = setInterval (showData.bind(this), 3000)
		//interval = setInterval (this.showData2.bind (this), 3000); //(showData.bind (this), 3000)

	}


	showData2( ) { 
		console.log ('show data 2')
		console.log (this.nodeData)

	}

   converge () { 
		//let nodesInCluster  = nodes_copy.filter (n => cluster.nodes.find (cn => cn == n.id)); // 
		//console.log (cluster.x, ', ', cluster.y)
		// move nodes to cluster 

		// move and scale nodes 
		function moveNodes ( )  { 
			this.nodesGroup.selectAll ('#nodeCircle')
				//.filter (d => nodesInCluster.indexOf (d) != -1) 
				.transition ()
				.duration (3000)
				.attr ('cx', 100)//d => cluster.x)
				.attr ('cy', 200) //d => cluster.y)
				.attr ('r',  100)//d => cluster.radius)
				.attr ('opacity', 1) //d=> 1)
		}

		// fade cluster in 
		//setTimeout (moveNodes, 7000)
	}

	 moveNodes ( )  { 
	 	console.log ('move nodes')
			this.nodesGroup//.selectAll ('#nodeCircle')
				//.filter (d => nodesInCluster.indexOf (d) != -1) 
				//.data(this.nodeData)
				.transition ()
				.duration (3000)
				.attr ('cx', d => 0)
				.attr ('cy', d => 0)
				.attr ('r',  d => { 
					console.log ('d', d)
					return d.parent_size;
				})
				.attr ('opacity', 0.5) //d=> 1)
				.attr ('fill', 'orange')
		}



}






























