import * as d3 from 'd3'

let margin = { top: 0, left: 20, right: 20, bottom: 0 }

let height = 700 - margin.top - margin.bottom
let width = 700 - margin.left - margin.right

let svg = d3
  .select('#chart-1')
  .append('svg')
  .attr('height', height + margin.top + margin.bottom)
  .attr('width', width + margin.left + margin.right)
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

var xPositionScale = d3
  .scaleLinear()
  .range([0, width])
  .domain([0, 200])
var yPositionScale = d3
  .scaleLinear()
  .range([height, 0])
  .domain([0, 100])

var colorScale = d3
  .scaleLinear()
  .domain([0, 100])
  .range(['#FFC75C', '#FA0DE5'])

Promise.all([
  d3.csv(require('./data/all_songs.csv')),
  d3.csv(require('./data/points.csv')),
  d3.csv(require('./data/face.csv')),
  d3.csv(require('./data/piano.csv')),
  d3.csv(require('./data/note.csv')),
  d3.csv(require('./data/mag-glass.csv'))
])
  .then(ready)
  .catch(err => {
    console.log('Failed with', err)
  })

function ready([
  datapoints,
  coordinates,
  faceCoordinates,
  pianoCoordinates,
  noteCoordinates,
  magGlassCoordinates
]) {
  datapoints.forEach((d, i) => {
    d.x = coordinates[i].x
    d.y = coordinates[i].y
    d.faceX = faceCoordinates[i].x
    d.faceY = faceCoordinates[i].y
    d.pianoX = pianoCoordinates[i].x
    d.pianoY = pianoCoordinates[i].y
    d.noteX = noteCoordinates[i].x
    d.noteY = noteCoordinates[i].y
    d.glassX = magGlassCoordinates[i].x
    d.glassY = magGlassCoordinates[i].y
  })

  svg
    .selectAll('circle')
    .data(datapoints)
    .enter()
    .append('circle')
    .attr('r', 1)
    .attr('fill', '#FA0DE5')
    .attr('cx', d => d.faceX)
    .attr('cy', d => d.faceY)

  d3.select('#blank').on('stepin', () => {
    svg
      .selectAll('circle')
      .transition()
      .duration(500)
      .ease(d3.easeBack)
      .attr('r', 2)
      .attr('cx', d => d.faceX)
      .attr('cy', d => d.faceY)
  })

  d3.select('#freddie').on('stepin', () => {
    svg
      .selectAll('circle')
      .transition()
      .duration(500)
      .ease(d3.easeBack)
      .attr('r', 2)
      .attr('cx', d => d.faceX)
      .attr('cy', d => d.faceY)
  })

  d3.select('#piano-dots').on('stepin', () => {
    svg
      .selectAll('circle')
      .transition()
      .duration(500)
      .ease(d3.easeBack)
      .attr('r', 2)
      .attr('cx', d => d.pianoX)
      .attr('cy', d => d.pianoY)
  })

  d3.select('#note').on('stepin', () => {
    svg
      .selectAll('circle')
      .transition()
      .duration(1000)
      .ease(d3.easeBack)
      .attr('r', 2)
      .attr('cx', d => d.noteX)
      .attr('cy', d => d.noteY)
  })

  d3.select('#glass').on('stepin', () => {
    svg
      .selectAll('circle')
      .transition()
      .duration(1000)
      .ease(d3.easeBack)
      .attr('r', 2)
      .attr('cx', d => d.glassX)
      .attr('cy', d => d.glassY)
  })

  // d3.select('#color').on('stepin', () => {
  //   svg.selectAll('circle').attr('fill', d => colorScale(d.popularity))
  // .transition()
  // .duration(750)
  // .ease(d3.easeBounce)
  // .attr('cx', d => xPositionScale(d.BPM))
  // .attr('cy', d => yPositionScale(d.popularity))
  // })

  // function sliderChange() {
  //   // grab the slider, get the HTML version, then get the value
  //   var min = d3.select('#slider').node().valueLow
  //   var max = d3.select('#slider').node().valueHigh
  //   // var value = this.value (this won't work with fat arrow)
  //   console.log('Slider is at', min, max)

  //   svg.selectAll('circle').attr('r', d => {
  //     // +value so it knows it's a number
  //     if (+d.popularity <= +max && +d.popularity >= +min) {
  //       return 4
  //     } else {
  //       return 0
  //     }
  //   })
  //   d3.select('#high').text(max)
  //   d3.select('#low').text(min)
  // }

  // const input = document.querySelector('#slider')
  // input.addEventListener('input', sliderChange)
  // input.nextElementSibling.addEventListener('input', sliderChange.bind(input))

  // sliderChange()
}
