import * as d3 from 'd3';


export const barChart = (svg, data) => {

	 // Data join
    const bars = svg.selectAll('.bar').data (data)

    // Update existing bars
    bars
      .transition ( )
      .duration (1000)
      .attr('x', (d, i) => i * 25)
      .attr('y', (d) => 100 - d)
      .attr('height', (d) => d);

    // // Enter new bars
    bars
      .enter()
      .append('rect')
      .attr ('class', 'bar')
      .attr('x', (d, i) => i * 25)
      .attr('y', (d) => 100 - d)
      .attr('width', 20)
      .transition ( )
      .duration (1000)
      .attr('height', (d) => d)
      .attr('fill', 'steelblue');

    // // Exit old bars
    bars.exit()
        .transition ( )
        .duration (1000)
        .attr ('height', 0)
        .attr('y', (d) => 100 - d)
        .remove();


   //svg.selectAll('rect').on('click', handleClick);


}