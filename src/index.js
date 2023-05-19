import * as d3 from 'd3';
import * as math from 'mathjs'; 
import * as  Vec2D from 'victor';
// -- // 

import * as main from './mainV2.js'; // ** 1 ** 


// test using flubber for shape morphig -- // 
import * as flubber from "flubber" // ES6


// -- GUI -- // 
// -- DATE SLIDER --  //
    const date_slider = document.getElementById("dateSlider");
    const dateHTML = document.getElementById("dateSlider_output");
    export let slider_date; 
    // -- on date slider -- // 
    date_slider.oninput = function() {
        slider_date = parseFloat (this.value);
        dateHTML.innerHTML = this.value;
        main.showSliderDate( );
    }


// -- DATE RANGE SLIDER -- // 
    const range_slider = document.getElementById("dateRangeSlider");
    const rangeHTML = document.getElementById("dateRange_output");
    export let range_output; //
    // -- on range slider -- // 
    range_slider.oninput = function() {
        range_output = parseFloat (this.value);
        rangeHTML.innerHTML = this.value;
        main.updateDatePositions( );
    }


// -- BUTTONS -- // 
    // let toggleBtn = document.getElementById('toggleBtn').onclick = function ( ) {
    //     console.log ('toggle button')
        
    // }
    let moveBtn = document.getElementById('arrowBtn').onclick = function ( ) {
        //console.log ("arrow button")
        main.toggleLayout( );
    }


    let dateBtn = document.getElementById('dateBtn').onclick = function ( ) {
        //console.log ('date button')
        main.moveToTimeLineView( );
    }

    let groupBtn = document.getElementById('groupBtn').onclick = function ( ) {
        console.log ('group button')
        main.moveToForceView ()
    }


// -- Shape Morph Test -- // 
    let svg1 = d3.select ('svg')
    // svg1.append ('circle')
    //   .attr ('cx', 100)
    //   .attr ('cy', 100)
    //   .attr ('r', 100)
    // var triangle = [[1, 0], [2, 2], [0, 2]],
    //     pentagon = [[0, 0], [2, 0], [2, 1], [1, 2], [0, 1]];
    // var interpolator = flubber.interpolate(triangle, pentagon);  
    var triangle = [[1, 0], [2, 2], [0, 2]],
        pentagon = [[0, 0], [2, 0], [2, 1], [1, 2], [0, 1]];

    let path = svg1.append ('path')
      .attr ('id', 'path')

    var interpolator = flubber.interpolate(triangle, pentagon);
    var interpolator2 = flubber.toCircle(triangle, 100, 100, 10);


