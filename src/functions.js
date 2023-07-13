
// put path function here.. 


export function doSomething ( ) { 
	console.log ("this is a message ...")
}

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