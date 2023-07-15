import * as  Vec2D from 'victor';
import * as d3 from 'd3';

// put path function here.. 

export let curve = d3.line().curve(d3.curveCatmullRom.alpha(0.5));
export let curve2 = d3.line( ).curve (d3.curveNatural);
export let curve3 = d3.line().curve(d3.curveBasis);


export function createCurvePath (x1, y1, x2, y2, i, curveAmt) { 

    let v0 = new Vec2D (x1, y1);
    let v1 = new Vec2D (x2, y2);

    let diffVector = v1.subtract (v0);
    let dist = diffVector.magnitude( );

    let midPoint = v0.add (diffVector.multiply (new Vec2D (0.5, 0.5)));

    let norm = diffVector.clone( ).normalize( ) 
    let ang = diffVector.angleDeg( )

     // -- add perp points.. (90 degrees from midpoint) -- // 
    let pLength = dist * (i * curveAmt); // dist * 0.2; // (dist * i* 0.5) +1; // (i*.2); 
    let pDirection = i%2 == 0 ? 90 : -90

    let perp= norm.clone( ).rotateDeg(pDirection).multiply (new Vec2D(pLength, pLength)).add (midPoint);

    // -- calculate control points -- // 
    let cpX = perp.x; 
    let cpY = perp.y;

    let curve = curve2([[x1, y1], [cpX, cpY], [x2, y2]])

    return curve;



}

// -- from other project -- // 

export function createPathShape (source, target, radius ) {

	// -- console.log (`source ${source.x, source.y},  target ${target}`)
	// -- console.log ('source', source)
    // -- create the Control points ADD to sample data
    // -- OR use node size value and increase by a factor -- // 

    //let sourceRadius = d.source.size *1.5;//2.5; 
    //let targetRadius = d.target.size *1.5;//2.5; 

    //d.source_handles = f1.calcHandles (d.source, d.target, sourceRadius, 10, false); // source -> target, r, hl
    //d.target_handles = f1.calcHandles (d.target, d.source, targetRadius, 10, false); // target -> source, r, hl

	//console.log ("source in ", source, " target", target, " radius ", radius);
    let source_handles = calcHandles (source, target, radius.source, 10, false);
    let target_handles = calcHandles (target, source, radius.target, 10, false);

    //console.log ("source handles ", source_handles)
    //console.log ("target handles ", target_handles)



   //  // -- create path -- 
   let p = d3.path( ); 

   //  // --> strt source edge [0]
    p.moveTo (source_handles.edges[0].x, source_handles.edges[0].y)
   
    // -> curve to target edge [1]
    p.bezierCurveTo(source_handles.handles[0].h0.x, source_handles.handles[0].h0.y,
                  target_handles.handles[1].h1.x, target_handles.handles[1].h1.y,                 
                  target_handles.edges[1].x, target_handles.edges[1].y);

   // --> curve to target edge [0]
   p.bezierCurveTo(target_handles.handles[1].h0.x, target_handles.handles[1].h0.y,
                  target_handles.handles[0].h1.x, target_handles.handles[0].h1.y,                 
                  target_handles.edges[0].x, target_handles.edges[0].y);
   

   // --> curve to source edge [1]
   p.bezierCurveTo(target_handles.handles[0].h0.x, target_handles.handles[0].h0.y,
                  source_handles.handles[1].h1.x,  source_handles.handles[1].h1.y,                 
                  source_handles.edges[1].x, source_handles.edges[1].y);


    // --> curve to source edge [0]
   p.bezierCurveTo(source_handles.handles[1].h0.x, source_handles.handles[1].h0.y,
                   source_handles.handles[0].h1.x, source_handles.handles[0].h1.y,                 
                   source_handles.edges[0].x, 		source_handles.edges[0].y);

   // use source locx locy (the 'shadow forces --')

   // p.arc(100,  100,  30, 0, Math.PI) 
    p.closePath();

    // add circles on the ends -- ?? 
		// p.moveTo (d.source.locx, d.source.locy)
		// p.arc(d.source.locx, d.source.locy, d.source_handles.radius, 0, Math.PI*2) 
		// p.closePath();


		// p.moveTo (d.target.locx, d.target.locy)
		// p.arc(d.target.locx, d.target.locy,  d.target_handles.radius, 0, Math.PI*2) 
		// p.closePath();


	//console.log ('path ', p)
	//debugger;
    return p;


  }



function calcHandles (sourceLoc, targetLoc, r, hl, drawPoints) {
	// draw point at source. 
	let sx = sourceLoc.x; 
	let sy = sourceLoc.y; 
	let tx = targetLoc.x;
	let ty = targetLoc.y; 
	//console.log ('sourceLoc',  sourceLoc); //sx, ',' sy);


	let sLoc = new Vec2D (sx, sy).clone( );
	let tLoc = new Vec2D (tx, ty).clone( );


	// calculate heading (direction)
	//let vDiff  = Vec2D.fromObject (sourceLoc).subtract(Vec2D.fromObject (targetLoc)); // extracts the x and loc 
	let vDiff = sLoc.subtract(tLoc);// extracts the x and loc 

	//console.log ('vDiff ', vDiff)


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

	// // -- draw points 
	// if (drawPoints) { 
	// 	//addAPoint (loc.x, loc.y, 6, 'orange') // source 
	// 	addAPoint (sx, sy, 6, 'orange') // source 
	// 	// --edge points / handles 
	// 	addAPoint (e0.x, e0.y, 5, 'green')
	// 	addAPoint (e1.x, e1.y, 5, 'red')

	// 	addAPoint (e0_handles.h0.x, e0_handles.h0.y, 10, 'green')
	// 	addAPoint (e0_handles.h1.x, e0_handles.h1.y, 10, 'blue')
	// 	addAPoint (e1_handles.h0.x, e1_handles.h0.y, 10, 'red')
	// 	addAPoint (e1_handles.h1.x, e1_handles.h1.y, 10, 'purple')
	// }


	return points;

} 


function degToRad(degrees){
  return degrees * (Math.PI/180);
}


function addAPoint (x, y, r, col) {
	d3.select ('svg')
    .append ('circle')
    .attr ('r', r)
    .attr ('cx', x+ 300)
    .attr ('cy', y+ 300)
    .attr ('fill', col)

}















