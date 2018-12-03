import * as d3 from 'd3'

var margin = { top: 0, left: 0, right: 0, bottom: 0 }
var height = 220 - margin.top - margin.bottom
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

  //dictionary to connectButton to SVG element
  let buttonToSVG = {}


  holder
    .selectAll('.graph')
    .data(nested)
    .enter()
    .append('div')
    .style('display', 'inline-block')
    .each(function(d) {
      var svg = d3
        .select(this)
        .append('svg')
        .style('display', 'block')
        .style('margin', '0 auto')
        .attr('height', height + margin.top + margin.bottom)
        .attr('width', width + margin.left + margin.right)
        .append('g')
        .attr('transform', `translate(${width / 2},${height / 2})`)
      d3.select(this)
        .append('button')
        .style('display', 'block')
        .style('margin', '0 auto')
        .attr('class', 'button-song btn btn-outline-light btn-sm')
        .attr('id', d.key.replace(/ /g, '-').toLowerCase())
        .text(d.key)

    let songButtonID = d.key.replace(/ /g, '-').toLowerCase()
    let songButton = document.getElementById(songButtonID)
    buttonToSVG[songButton] = svg



      console.log('build')
      console.log(d)
      angleScale.domain(d.seconds)
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

      // svg
      //   // .selectAll('.button-song')
      //   .append('text')
      //   .text(d => d.key)
      //   .attr('x', xPositionScale(d.songs))
      //   .attr('y', height / 3)
      //   .attr('font-size', 15)
      //   .attr('fill', 'white')
      //   .attr('text-anchor', 'middle')
      //   .attr('alignment-baseline', 'center')
    })

  // array of buttons

  function clickButton() {
    let buttons = document.getElementsByClassName(
      'button-song btn btn-outline-light btn-sm'
    )
    HTMLCollection.prototype.forEach = Array.prototype.forEach

    buttons.forEach(function(song_button) {
      console.log('yo!')
      //console.log(song_button.id)
      //let song_button_id = song_button.id

      // should do a wait before this ting plays
      loadSongByButton(song_button)

      song_button.addEventListener('click', function() {
        console.log('cliiicked!')
        songButtonPressed(song_button)
      })
    })


    var songIsPlaying = false
    var currentSong = null
    var volumeOn = false

    var svgIsAnimated = false
    var currentSVG = null
    var animateAllowed = true

    function animateSVG(button) {
      console.log('animateSVG')

      var svgToAnimate = getSVGtoAnimate(button)

      if(animateAllowed){
        

        if (svgIsAnimated){
        //stop animating current
        //find proper svg to animate

        //update currentSVG
        currentSVG = svgToAnimate

        //animate currentSVG



        } else {
        //find proper svg to animate
        //update currentSVG
        //animate currentSVG

        }
      }
    }

    function playSong(song) {
      console.log('play that funky music: ' + song.id)
      if(volumeOn){
        //do something
      }

      if (songIsPlaying) {
        currentSong.pause()
        currentSong.currentTime = 0
        song.play()
        currentSong = song
      } else {
        song.play()
        currentSong = song
        songIsPlaying = true
      }
    }

    function songButtonPressed(song_button) {
      let song = loadSongByButton(song_button)
      playSong(song)
      animateSVG(song_button)
    }

    function getSVGtoAnimate(button){
      return buttonToSVG[button]

    }

    // load songs
    function loadSongByButton(song_button) {
      let songID = 'song_' + song_button.id
      console.log(songID)
      let song = document.getElementById(songID)
      console.log(song)
      return song
    }
  }


  clickButton()

  let svg_div = document.getElementById("chart-3b")
  let radialArrays = svg_div.querySelectorAll("svg")
  console.log(radialArrays)

  let gPaths = svg_div.querySelectorAll("g")
  console.log(gPaths)

  console.log (radialArrays[1])

  console.log(buttonToSVG)

  






}
