import * as d3 from 'd3'

var margin = { top: 30, left: 30, right: 30, bottom: 30 }
var height = 400 - margin.top - margin.bottom
var width = 220 - margin.left - margin.right

var holder = d3.select('#chart-3b')

let radius = 70

let radiusScale = d3
  .scaleLinear()
  .domain([0, 12])
  .range([0, radius])

var angleScale = d3.scaleBand().range([0, Math.PI * 2])

var colorScale = d3
  .scaleLinear()
  .domain([0, 12])
  .range(['#FFC75C', '#FF446E'])

let arc = d3
  .arc()
  .innerRadius(d => radiusScale(0))
  .outerRadius(d => radiusScale(d.note_number))
  .startAngle(d => angleScale(d.second))
  .endAngle(d => angleScale(d.second) + angleScale.bandwidth())

var xPositionScale = d3.scaleBand().range([0, width])

var yPositionScale = d3.scaleBand().range([height, 0])

d3.csv(require('./data/top-10-songs-notes.csv'))
  .then(ready)
  .catch(err => console.log('Failed on', err))

function ready(datapoints) {
  let nested = d3
    .nest()
    .key(d => d.song_name)
    .entries(datapoints)

  let seconds = nested.forEach(function(data) {
    data.seconds = data.values.map(d => d.second)
  })

  holder
    .selectAll('.graph')
    .data(nested)
    .enter()
    .append('svg')
    .attr('height', height + margin.top + margin.bottom)
    .attr('width', width + margin.left + margin.right)
    .append('g')
    .attr('transform', `translate(${width / 2},${height / 2})`)
    .each(function(d) {
      console.log('build')
      console.log(d)
      angleScale.domain(d.seconds)
      var svg = d3.select(this)
      svg
        .selectAll('.temp-bar')
        .data(d.values)
        .enter()
        .append('path')
        .attr('d', d => arc(d))
        .attr('fill', function(d) {
          return colorScale(d.note_number)
        })
        // .attr('stroke', 'white')
        // .attr('stroke-width', 0.2)

      svg
        .append('circle')
        .attr('r', 3)
        .attr('fill', 'white')
        .attr('cx', 0)
        .attr('cy', 0)

      svg
        .append('text')
        .text(d => d.key)
        .attr('x', xPositionScale(d.songs))
        .attr('y', height / 3)
        .attr('font-size', 15)
        .attr('fill', 'white')
        .attr('text-anchor', 'middle')
        .attr('alignment-baseline', 'center')
    })
}
