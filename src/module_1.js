import *  as d3 from 'd3';
import * as  Vec2D from 'victor';
import netClustering from "netclustering";

// import * as _root from './mainV2.js'


console.log ("this is module 1 : UTILITY functions")



export function sendMessage ( ) { 

 
}

// 1. create a sample network of relationships. 


export function addAPoint (x, y, r, col) {
	d3.select ('svg')
    .append ('circle')
    .attr ('r', r)
    .attr ('cx', x)
    .attr ('cy', y)
    .attr ('fill', col)

}

// function to create a path 
export function createPath (d) {
    //console.log ('data ', d.source.x)
    let v0 = new Vec2D (d.source.x, d.source.y);
    let v1 = new Vec2D (d.target.x, d.target.y);

		// let v0 = new Vec2D (d.source.locx, d.source.locy);
    // let v1 = new Vec2D (d.target.locx, d.target.locy);
    //

    let diffVector = v1.subtract (v0);
    let norm = diffVector.clone( ).normalize( ) 
    let ang = diffVector.angleDeg( )
    let midPoint = v0.add (diffVector.multiply (new Vec2D (0.5, 0.5)));

    // --add perp points..  (90 degree to midpoint)
    let pLength = 10;
    let perp1 = norm.clone( ).rotateDeg(90).multiply (new Vec2D(pLength, pLength)).add (midPoint);
    let perp2 = norm.clone( ).rotateDeg(-90).multiply (new Vec2D(pLength, pLength)).add (midPoint);

    // -- draw some reference points -- // 
    // addAPoint(d.target.x, d.target.y, 4)
    // addAPoint(d.source.x, d.source.y, 4)
    // addAPoint(midPoint.x, midPoint.y, 6)
    // addAPoint(perp1.x, perp1.y, 4)
    // addAPoint(perp2.x, perp2.y, 4)

    // create path -- 
    let p = d3.path( ); 
      p.moveTo(d.source.x,d.source.y);
     // p.lineTo (d.source.x+100, d.source.y+100)
     // p.lineTo (d.target.x+100, d.target.y+100)
      p.quadraticCurveTo(perp1.x, perp1.y, d.target.x,d.target.y);
      p.quadraticCurveTo(perp2.x, perp2.y, d.source.x,d.source.y);
      p.closePath();
    return p;

}

// test function to calculte edge points(based on a point and angle)

export function calcHandles (sourceLoc, targetLoc, r, hl, drawPoints) {
	// draw point at source. 
	//console.log ("source loc : " , sourceLoc)
	//let loc = sourceLoc; 

	// x = force position // locx = 'shadow' (slow move to) position.. 
	let sx = sourceLoc.locx; 
	let sy = sourceLoc.locy; 
	let tx = targetLoc.locx;
	let ty = targetLoc.locy; 
	//console.log (sourceLoc.locx, " : ", sourceLoc.x); 
	//console.log (targetLoc.locx, " : ", targetLoc.x); 


	let sLoc = new Vec2D (sx, sy).clone( );
	let tLoc = new Vec2D (tx, ty).clone( );


	// calculate heading (direction)
	//let vDiff  = Vec2D.fromObject (sourceLoc).subtract(Vec2D.fromObject (targetLoc)); // extracts the x and loc 
	let vDiff = sLoc.subtract(tLoc);// extracts the x and loc 


	let vHeading = vDiff.angleDeg( );
	// --------------------- // 
	let heading = vHeading+90; // overall direction of the shape (heading)
	// edge values (distance and angle)
	
	// -- VALUES to ChANGE 
	let eDist = r; //50; // EDGE DIST  (r)
	let eAngle  = 30 // EDGE ANGLE (minus is FAT) (+ is thin)
	let hLength = 20 ; // hl;	 // HANDLE LENGTH (hl)

	// 2 edge angles poonts
	let angle0 = eAngle; 
	let angle1 = eAngle*-1 - 180;
	// factor in the overall heading direction of the shape 
	angle0 += heading; 
	angle1 += heading;


	// -- edge points -- // hitting the side of an imaginary circle.. 
	let e0 = { 
		x : Math.cos (degToRad(angle0)) * eDist + sx, // loc.x,
		y : Math.sin (degToRad(angle0)) * eDist + sy // loc.y
	}

	let e1 = { 
		x : Math.cos (degToRad(angle1)) * eDist + sx, //loc.x,
		y : Math.sin (degToRad(angle1)) * eDist + sy //loc.y
	}

	// handles on each of the edges (perpendicular to the edge point)
	let e0_handles = { 
		h0: { 
			x: Math.cos (degToRad(angle0+90)) * hLength + e0.x,
			y: Math.sin (degToRad(angle0+90)) * hLength + e0.y
		},
		h1 : { 
			x: Math.cos (degToRad(angle0-90)) * 1 + e0.x, // hLength
			y: Math.sin (degToRad(angle0-90)) * 1 + e0.y  // hLength
		}
	}

	let e1_handles = { 
		h0: { 
			x: Math.cos (degToRad(angle1+90)) * 1 + e1.x, // hLength
			y: Math.sin (degToRad(angle1+90)) * 1 + e1.y  // hLength
		},
		h1 : { 
			x: Math.cos (degToRad(angle1-90)) * hLength + e1.x,
			y: Math.sin (degToRad(angle1-90)) * hLength + e1.y
		}
	}

	let edgePoints = { 
		0: e0, 
		1: e1
	}
	// 
	let handles = { 
		0: e0_handles,
		1: e1_handles
	}
	// put all points together 
	let points =  { 
		edges: edgePoints,
		handles: handles,
		radius : r
	}

	// -- draw points 
	if (drawPoints) { 
		//addAPoint (loc.x, loc.y, 6, 'orange') // source 
		addAPoint (sx, sy, 6, 'orange') // source 


		// --edge points / handles 
		addAPoint (e0.x, e0.y, 5, 'green')
		addAPoint (e1.x, e1.y, 5, 'red')

		addAPoint (e0_handles.h0.x, e0_handles.h0.y, 3, 'green')
		addAPoint (e0_handles.h1.x, e0_handles.h1.y, 3, 'blue')
		addAPoint (e1_handles.h0.x, e1_handles.h0.y, 3, 'red')
		addAPoint (e1_handles.h1.x, e1_handles.h1.y, 3, 'purple')
	}

	return points;

}


function degToRad(degrees){
  return degrees * (Math.PI/180);
}

/// Get Social Clusters Function -- // 



// SORT FUNCTIONS -- // 
// from AI - using the accumulator object (which totals up the items found)

// --  SORT by GUILD attribute 
export function sort_by_guild (nodes ) {
		// -- reduce and use an accumulator -- //
		const makersByGuild = nodes.reduce((acc, maker) => {

			// NOTE : these only add the ID not the full maker reference : // 
		    if (maker.guilds.length === 0) {
		      if (!acc._none) {
		        acc._none = [maker.id];// if 'none' does not exist - add it 
		      } else {
		        acc._none.push(maker.id); // if 'none' exists - push maker into acc
		      }
		    } else {
		      maker.guilds.forEach(guild => {
		        if (!acc[guild]) {
		          acc[guild] = [maker.id]; // if guild does not exist : add into accumulator ()
		        } else {
		          acc[guild].push(maker.id); // if guild DOES exist in accumulator - push maker into it.
		        }
		      });
		    }
		   // console.log ('acc ', acc) ; // the accumulation of objects 
		    return acc; // returns the accumulator 
		  }, {}); // the inital value of the accumulator 


		// -- use the accumulator created above - and sort into array -- // 
		const sortedMakersByGuild = Object.entries(makersByGuild) // returns an array
				 .sort(([guild1], [guild2]) => guild1.localeCompare(guild2))
		    .map(([guild, makers], i) => ({ 
		      name : guild || 'none',
		      type : 'guildcluster',
		      guild: guild || "none", 
		      nodes: makers, 
		      size: makers.length * 5,
		      id : i, 
		      col : 0
		    }));

		 return sortedMakersByGuild;

  }


// --  SORT by ADVERTISED_INSTRUMENT -- attribute 
export function sort_by_advertisedInstrument (nodes ) {
		// -- reduce and use an accumulator -- //
		const makersByAdvertisedInstrument = nodes.reduce((acc, maker) => {

			// NOTE : these only add the ID not the full maker reference : // 
		    if (maker.advertised_instruments.length === 0) {
		      if (!acc._none) {
		        acc._none = [maker.id];// if 'none' does not exist - add it 
		      } else {
		        acc._none.push(maker.id); // if 'none' exists - push maker into acc
		      }
		    } else {
		      maker.advertised_instruments.forEach(ad_inst => {
		        if (!acc[ad_inst]) {
		          acc[ad_inst] = [maker.id]; // if guild does not exist : add into accumulator ()
		        } else {
		          acc[ad_inst].push(maker.id); // if guild DOES exist in accumulator - push maker into it.
		        }
		      });
		    }
		   // console.log ('acc ', acc) ; // the accumulation of objects 
		    return acc; // returns the accumulator 
		  }, {}); // the inital value of the accumulator 


		// -- use the accumulator created above - and sort into array -- // 
		const sortedMakersByAdvertisedInstrument = Object.entries(makersByAdvertisedInstrument) // returns an array
		    .map(([adv_inst, makers], i) => ({ 
		      name : adv_inst || 'none',
		      type : 'advertised_instrument_cluster',
		      nodes: makers, 
		      size: makers.length * 5,
		      id : i, 
		      col : 0
		    }));

		 return sortedMakersByAdvertisedInstrument;

  }

// --  SORT by KNOWN_INSTRUMENT -- attribute 
export function sort_by_knownInstrument (nodes) {
		// -- reduce and use an accumulator -- //
		const makersByKnownInstrument = nodes.reduce((acc, maker) => {

			// NOTE : these only add the ID not the full maker reference : // 
		    if (maker.known_instruments.length === 0) {
		      if (!acc._none) {
		        acc._none = [maker.id];// if 'none' does not exist - add it 
		      } else {
		        acc._none.push(maker.id); // if 'none' exists - push maker into acc
		      }
		    } else {
		      maker.known_instruments.forEach(known_inst => {
		        if (!acc[known_inst]) {
		          acc[known_inst] = [maker.id]; // if guild does not exist : add into accumulator ()
		        } else {
		          acc[known_inst].push(maker.id); // if guild DOES exist in accumulator - push maker into it.
		        }
		      });
		    }
		   // console.log ('acc ', acc) ; // the accumulation of objects 
		    return acc; // returns the accumulator 
		  }, {}); // the inital value of the accumulator 


		// -- use the accumulator created above - and sort into array -- // 
		const sortedMakersByKnownInstrument = Object.entries(makersByKnownInstrument) // returns an array
		    .map(([known_inst, makers], i) => ({ 
		      name : known_inst || 'none',
		      type : 'known_instrument_cluster',
		      nodes: makers, 
		      size: makers.length * 5,
		      id : i, 
		      col : 0
		    }));

		 return sortedMakersByKnownInstrument;

  }


// --  SORT by TOWN -- attribute 
export function sort_by_town (nodes) {
		// -- reduce and use an accumulator -- //
		//let nodes = [...nlist]
		const makersByTown = nodes.reduce((acc, maker) => {

			// NOTE : these only add the ID not the full maker reference : // 
		    if (maker.towns.length === 0) {
		      if (!acc._none) {
		        acc._none = [maker.id];// if 'none' does not exist - add it 
		      } else {
		        acc._none.push(maker.id); // if 'none' exists - push maker into acc
		      }
		    } else {
		      maker.towns.forEach(town => {
		        if (!acc[town]) {
		          acc[town] = [maker.id]; // if guild does not exist : add into accumulator ()
		        } else {
		          acc[town].push(maker.id); // if guild DOES exist in accumulator - push maker into it.
		        }
		      });
		    }
		   // console.log ('acc ', acc) ; // the accumulation of objects 
		    return acc; // returns the accumulator 
		  }, {}); // the inital value of the accumulator 


		// -- use the accumulator created above - and sort into array -- // 
		const sortedMakersByTown = Object.entries(makersByTown)
		  	.sort(([town1], [town2]) => town1.localeCompare(town2))
		    .map(([town, makers], i) => ({ 
		      name : town || 'none',
		      type : 'town_cluster',
		      nodes: makers, 
		      size: makers.length * 5,
		      id : i, 
		      col : 0
		    }));

		 return sortedMakersByTown;

  }



// --SORT into SOCIAL CLUSTERS -- 
export function getClusters_social (n_list, base_nodes, socialLinks) {
        // -- netclustering test -- // 
        // format links into a format that can be used 
        let linksnew = socialLinks.map ( item =>  { 
            // --- //
            let sourcenode = n_list.find (n => n.id == item.source); 
            let targetnode = n_list.find (n => n.id == item.target);
            let sourceIndex = n_list.indexOf (sourcenode)
            let targetIndex = n_list.indexOf (targetnode)

            //console.log ('source ', sourceIndex, ' target : ', targetIndex)
            return { source: sourceIndex, target: targetIndex}
        })
        // -- unformatted list of links -- // 
        //console.log ("linksnew : ", linksnew)

        let clustersNEW = [ ];
        let clustertest = netClustering.cluster(n_list, linksnew); // this give each node a new cluster property.. 

        //console.log ('-------------------------------')
        //console.log ('cluster test = ', clustertest)
        //console.log ('social links = ', _root.social_links )
        // for example find the cluster that includes  'id 551 '
        //let sampleCluster = clustertest.find (c => c[0].includes(155))
        //clustertest.forEach (c =>  { 
        //console.log ('cluster = ', c)
        //console.log ('contains element', c.includes('155'))
        //})
        //console.log ('sample cluster = ', sampleCluster)
        //console.log ('-------------------------------')

        // nodes.forEach ( n => n.cluster = 'cluster_' + n.cluster)
        //console.log ('cluter test ', clustertest)
        // -- FLATTEN any arrays that are returned 
        clustertest.forEach ((c, i) => { 
          // flatten and sub arrays 
           if (Array.isArray (c[0])) { 
              clustertest[i] = clustertest[i].flat ( )
           }
        	//console.log ('cluster test flat = ', c)

           // -- non linked items - need to be sorted into their OWN clusters -- 
           let nodeindex = c[0];// first node in the cluster (as a test)
           let clusternode = n_list[nodeindex];

          // --  if this not in a link - make all items separate clusters 
          //console.log ('social links -> ', socialLinks)
          if (clusternode != undefined) { 
            let foundLink = socialLinks.find (l => l.source == clusternode.id || l.target == clusternode.id)

            // if not in a link 
            if (foundLink == undefined ) { 
                clustertest.splice (i, 1)
                splitIntoChunk (c, 1, clustertest)
            } 

          }

        })

        //---------------------------- // 
        // -- iterate through each array of ids -- // 
        // -- also get list of links -- // 
        clustertest.forEach ((cluster, i) => { 
            // -- format into clusters with node IDs -- 
            let nodeIds = []; 


            // may not be a flat array of values  -- //
            cluster.forEach (id => {
                let isArray = Array.isArray (id);
                // id may be array of id's. 
                if (isArray == false)  {
                    nodeIds.push ({id: base_nodes[id].id, node_radius: 5}); // SET node attributes
                }
                // if this a nested array 
                if (isArray) { 
                  id.forEach (d => {
                    nodeIds.push ({id: base_nodes[d].id, node_radius: 5}); // SET node attributes
                  })
                }
            }); 

            // --- GET LINKS IN CLUSTER  -- // 
            let links = [ ]; 
            nodeIds.forEach (n => { 
            	let foundlinks = socialLinks.filter (link => link.source == n.id || link.target == n.id)

         		foundlinks.forEach (link => {  			
         			if (links.indexOf (link) === -1) links.push (link)
         		})
            })
            //console.log ('link list = ', links)
            // ------------------------------------ // 

            // create new cluster object 
            let clusterObj = { 
              name : 'social',
              type : 'socialcluster',
              nodes: nodeIds,
              links: links,
              size : nodeIds.length, // setClusterSize(nodeIds), //nodeIds.length * 10,
              col : 0,
              alpha : 0.2,
              scale : 1
            }
            //console.log ('new obj ', clusterObj)
            clustersNEW.push (clusterObj);

        })

        n_list.forEach ( n => n.cluster = 'cluster_' + n.cluster)
        return clustersNEW;

        // -- chunk array into sub array -- // 
        function splitIntoChunk(arr, chunk, arrayToAddTo) {
            for (let i=0; i < arr.length; i += chunk) {
                let tempArray;
                tempArray = arr.slice(i, i + chunk);
                //console.log(tempArray);
                arrayToAddTo.push (tempArray)
            }
        }
        // ---------------------------- // 
  }

function setClusterSize (n) { 
	//2 types of layout ('date' & 'force')
	return n.length * 1 + 1; 

}

// function - find links - source and target -- /// 




















