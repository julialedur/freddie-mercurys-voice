import * as d3 from 'd3'

var margin = { top: 25, left: 100, right: 150, bottom: 0 }
var width = 800 - margin.left - margin.right
var height = 400 - margin.top - margin.bottom
// Circle options
// var numCircles = 500
var circleRadius = 4
var sampleLength = 50
// Band options
var startY = 250
var sortingPoint = width * 0.45
var sortingTarget = sortingPoint + 100
var curveType = d3.curveMonotoneX
var bandSize = 50
// Timing options
var speed = 4
var maxInitialDelay = 5000
var svg = d3
  .select('#chart-4')
  .append('svg')
  .attr('width', width + margin.left + margin.right)
  .attr('height', height + margin.top + margin.bottom)
  .append('g')
  .attr('transform', `translate(${margin.left},${margin.top})`)
// Don't edit below here
var slowingConstant = 10
var circleSpeed = sampleLength * slowingConstant * (1 / speed)
var line = d3.line().curve(curveType)
// These are percentages
// var outcomes = {
//   'happy': [].concat(
//             d3.range(40).map(d => 'super popular'),
//             d3.range(16).map(d => 'popular'),
//             d3.range(10).map(d => 'not so popular'),
//           ),
//   'neutral': [].concat(
//               d3.range(17).map(d => 'super popular'),
//               d3.range(21).map(d => 'popular'),
//               d3.range(22).map(d => 'not so popular'),
//             ),
//   'sad': [].concat(
//             d3.range(40).map(d => 'super popular'),
//             d3.range(16).map(d => 'popular'),
//             d3.range(10).map(d => 'not so popular'),
//             ),
// }

d3.csv(require('./data/popularityxvalence.csv'))
  .then(ready)
  .catch(err => {
    console.log('Failed with', err)
  })

function ready(datapoints) {
  var colorScale = d3
    .scaleOrdinal()
    .domain(['sad', 'neutral', 'happy'])
    .range(['#035DFC', '#FA0DE5', '#FFC75C'])
  var yPositionScale = d3
    .scaleBand()
    .domain(['super popular', 'popular', 'not so popular'])
    .range([0, height])
  datapoints.map(d => yPositionScale(d.popularity))
  // Setting things like finished['super popular']['sad'] = 0
  var finished = {}

  yPositionScale.domain().forEach(d => {
    finished[d] = {}
    finished[d]['happy'] = 0
    finished[d]['neutral'] = 0
    finished[d]['sad'] = 0 
  })
  function updateDisplay(d) {
    d3.select(this)
    var total = 0
    Object.keys(finished).forEach(popularity => {
      Object.keys(finished[popularity]).forEach(positiveness => {
        var completed = finished[popularity][positiveness]
        total += completed
        d3.select(`#${positiveness}-${popularity.replace(' ', '')}`).text(
          finished[popularity][positiveness]
        )
      })
    })
    d3.select('#total').text(total)
  }
  function updateTotals(d) {
    finished[d.popularity][d.positiveness]++
    updateDisplay()
  }
  var holder = svg.append('g').attr('transform', `translate(0,${bandSize / 2})`)
  holder
    .append('g')
    .attr('class', 'display')
    .attr('transform', `translate(${width}, 0)`)
    .selectAll('g')
    .data(yPositionScale.domain())
    .enter()
    .append('g')
    .attr(
      'transform',
      d => `translate(20,${yPositionScale(d) - bandSize * 0.25})`
    )
    .each(function(d) {
      var display = d3.select(this)

      // popularity text
      display
        .append('text')
        .text(d.charAt(0).toUpperCase() + d.slice(1))
        .attr('fill', '#ffffff')
        .attr('dx', 40)
        .attr('dy', 7)
        .attr('font-size', 14)

      // counters text
      display
        .append('text')
        .text('0')
        .attr('id', 'happy-' + d.replace(' ', ''))
        .attr('y', 20)
        .attr('x', 0)
        .attr('fill', '#FFC75C')
        .attr('dx', 40)
        .attr('dy', 7)
        .attr('font-size', 14)
        .attr('font-weight', 'bold')

      display
        .append('text')
        .text('0')
        .attr('id', 'neutral-' + d.replace(' ', ''))
        .attr('y', 20)
        .attr('x', 30)
        .attr('fill', '#FA0DE5')
        .attr('dx', 40)
        .attr('dy', 7)
        .attr('font-size', 14)
        .attr('font-weight', 'bold')

      display
        .append('text')
        .text('0')
        .attr('id', 'sad-' + d.replace(' ', ''))
        .attr('y', 20)
        .attr('x', 60)
        .attr('fill', '#035DFC')
        .attr('dx', 40)
        .attr('dy', 7)
        .attr('font-size', 14)
        .attr('font-weight', 'bold')
    })
  // Have to push this down half of the stroke width
  // because it's a scaleBand, so it starts at 0
  holder
    .append('g')
    .attr('class', 'bands')
    .lower()
    .selectAll('path')
    .data(yPositionScale.domain())
    .enter()
    .append('path')
    .attr('d', d => {
      let points = [
        [0 - bandSize / 2, startY], // push it off the left-hand side
        [0, startY],
        [sortingPoint, startY],
        [sortingPoint, startY],
        [sortingPoint, startY],
        [sortingTarget, yPositionScale(d)],
        [width, yPositionScale(d)],
        [width + bandSize, yPositionScale(d)] // push it off the right-hand side
      ]
      return line(points)
    })
    .attr('stroke-width', bandSize + circleRadius * 2)
    .attr('stroke', '#f3f3f3')
    .attr('fill', 'none')
    .attr('opacity', 0.2)
    .attr('id', d => `#path-${d.replace(' ', '-')}`)
  var points = {}
  svg.selectAll('path').each(function(d) {
    var length = this.getTotalLength()
    points[d] = []
    d3.range(length / sampleLength + 1).forEach(i => {
      let point = this.getPointAtLength(i * sampleLength)
      points[d].push([point.x, point.y])
    })
  })
  // They need a little wiggle so they don't all overlap
  // And how long should the circle wait before it starts moving?
  datapoints.forEach(d => {
    d._offsetX = Math.random() * bandSize - bandSize / 2
    d._offsetY = Math.random() * bandSize - bandSize / 2
    d._delay = Math.random() * maxInitialDelay
  })
  // Add a group for every circle
  // that group is the x/y offset (the wiggle)
  // then add a circle inside of that which will
  // follow the path (the offset makes it not quite)
  holder
    .selectAll('g')
    .data(datapoints)
    .enter()
    .append('g')
    .attr('transform', d => `translate(${d._offsetX},${d._offsetY})`)
    .append('circle')
    .attr('fill', d => colorScale(d.positiveness))
    .attr('r', circleRadius)
    .each(function startTransition(d) {
      // What are the points it should be tweening between?
      var pathPoints = points[d.popularity]
      // How fast between each segment?
      var speed = Math.random() * circleSpeed + circleSpeed
      // Start the circle at the the point
      // initialize the transition easing, speed, etc
      var circle = d3
        .select(this)
        .attr('transform', `translate(${pathPoints[0]})`)
        .transition()
        .delay(d._delay)
        .duration(speed)
        .ease(d3.easeLinear)
      // This is like a forEach, but it will
      // stop once we're past the width
      pathPoints.every(point => {
        circle = circle.transition().attr('transform', `translate(${point})`)
        return point[0] + d._offsetX < width
      })
      // Once we're at the end, update the totals and restart
      circle.on('end', function(d) {
        // Don't need to wait to start next time
        d._delay = 0
        updateTotals.apply(this, arguments) // makes the counter work
        // startTransition.apply(this, arguments) // makes the animation restart
      })
    })
  // Here's where the circle/path mask should go
  // svg.append('text')
  //   .text('Mask on lines or remove margins')
  //   .attr('dy', -3)
  //   .attr('x', -height)
  //   .attr('transform', 'rotate(-90)')
  //   .attr('fill', 'gray')
  // svg.append('line')
  //   .attr('x1', 0)
  //   .attr('y1', 0 - margin.top)
  //   .attr('x2', 0)
  //   .attr('y2', height + margin.bottom)
  //   .attr('stroke-dasharray', '3')
  //   .attr('stroke', 'gray')
  // svg.append('line')
  //   .attr('x1', width)
  //   .attr('y1', 0 - margin.top)
  //   .attr('x2', width)
  //   .attr('y2', height + margin.bottom)
  //   .attr('stroke-dasharray', '3')
  //   .attr('stroke', 'gray')
}
