import * as d3 from 'd3'
import $ from 'jquery';
import d3Tip from 'd3-tip'
d3.tip = d3Tip

var files = {
  pianoKeys:
    'https://gist.githubusercontent.com/the-observables/8e7112072ca33e2b131d50904d511c6d/raw/00649cb06625d9783f84128de8085b1a5dcce428/piano-keys.csv',
  vocalRangeData:
    'https://gist.githubusercontent.com/the-observables/f948fd87e91e517b0416aa31f3fe43e5/raw/03ef5378c1432fb603456eac0bea813ca8e5bf79/vocal-ranges-all.csv'
}
var promises = []

Object.keys(files).forEach(function(filename) {
  promises.push(
    d3.csv(files[filename], function(d) {
      if (filename == 'pianoKeys') {
        return {
          id: +d.id,
          key: d.key,
          set: +d.set
        }
      } else {
        return {
          name: d.name,
          range: d.range,
          low: d.low,
          low_song: d['low-song'],
          low_data: +d['data-low'],
          high: d.high,
          high_song: d['high-song'],
          high_data: +d['data-high']
        }
      }
    })
  )
})

Promise.all(promises)
  .then(function (data) {
    // Color piano keys
    d3.selectAll(".black-key").attr("fill", "black")
    d3.selectAll(".white-key").attr("fill", "white")

    return data
  })
  .then(ready)
  .catch(err => console.log('Failed on', err))

function ready(data) {
  var pianoKeys = data[0]
  var vocalRangeData = data[1].slice(0, 8)

  var i, j, node
  var groupSep = 10

  var nodeRadius = d3.scaleSqrt().range([3, 7])

  var linkWidth = d3.scaleLinear().range([1.5, 2 * nodeRadius.range()[0]])

  var margin = {
    top: nodeRadius.range()[1] + 1,
    right: nodeRadius.range()[1] + 1,
    bottom: nodeRadius.range()[1] + 1,
    left: 0
  }

  var width = 1020 - margin.left - margin.right
  var height = 325 - margin.top - margin.bottom

  var x = d3.scaleLinear().range([0, width])

  // var vis = d3.select(DOM.svg(width, height))
  var vis = d3.select('.vocal-range')
    .attr('class', 'arc')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)

  var svg = vis.append('g')
    .attr('transform', 'translate(' + margin.left + ',-' + margin.top + ')')

  var idToNode = {}

  // modify data
  pianoKeys.forEach(function(n) {
    idToNode[n.id] = n
  })

  vocalRangeData.forEach(function(e) {
    e.source = idToNode[e.low_data]
    e.target = idToNode[e.high_data]
  })

  // Compute x,y coordinates (have a little extra separation when we switch volumes)
  for (i = 0, j = 0; i < pianoKeys.length; ++i) {
    node = pianoKeys[i]
    node.x =
      j * groupSep + (i * (width - 4 * groupSep)) / (pianoKeys.length - 1) + 145
    node.y = height
  }

  // nodeRadius.domain(d3.extent(pianoKeys, function (d) { return d.chapters.length }))
  nodeRadius.domain(
    d3.extent(pianoKeys, function(d) {
      return 2
    })
  )
  linkWidth.domain(
    d3.extent(vocalRangeData, function(d) {
      return 2
    })
  )
  let padding = 42

  var low_tip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([-10, 0])
    .html(function(d) {
      return "<span>" + d.low_song + "</span>";
    })

  var high_tip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([-10, 0])
    .html(function(d) {
      return "<span>" + d.high_song + "</span>";
    })

  vis.call(low_tip)
  vis.call(high_tip)

  var link = svg.append('g')
    .attr('class', 'links')
    // .selectAll('path')
    .selectAll('rect')
    .data(vocalRangeData)

  // link.enter().append('path')
  var bars = link.enter().append('rect')
    // .attr('d', function (d) {
    //   // return ['M', d.source.x, height, 'A',
    //   //   (d.source.x - d.target.x)/2, ',',
    //   //   (d.source.x - d.target.x)/2, 0, 0, ',',
    //   //   d.source.x < d.target.x ? 1 : 0, d.target.x, ',', height]
    //   //   .join(' ')
    //   let idx = vocalRangeData.findIndex(x => x.name === d.name)
    //   return ['M', d.source.x, (idx+1.1) * padding, 'L', d.target.x, (idx+1.1) * padding].join(' ')
    // })
    // rect attr
    .attr('height', '18px')
    .attr('width', function(d) {
      return d.target.x - d.source.x
    })
    .attr('x', function(d) {
      return d.source.x
    })
    .attr('y', function(d) {
      let idx = vocalRangeData.findIndex(x => x.name === d.name)
      return (idx - 0.3) * padding
    })
    // global
    .attr('name', function(d) {
      return d.name
    })
    .attr('class', 'link')
    .on('mouseover', function(d) {
      link.style('stroke', null)
      // d3.select(this).style('stroke', '#d62333')

      // color piano keys
      let l = pianoKeys.find(x => x.id === parseInt(d.low_data))
      let h = pianoKeys.find(x => x.id === parseInt(d.high_data))
      d3.selectAll('#key' + l.id).attr('fill', 'rgb(241, 194, 162)')
      d3.selectAll('#key' + h.id).attr('fill', 'rgb(241, 194, 162)')
      // d3.selectAll('.white-key, .black-key')
      //   .attr("fill", function (e) {
      //     let id = d3.select(this).attr('id').slice(3)
      //     if (id <= h.id && id >= l.id) {
      //       return "rgb(241, 194, 162)"
      //     } else if (d3.select(this).attr('class') == "white-key") {
      //       return "white"
      //     }
      // })

      // node.style('fill', function (node_d) {
      //   return node_d === d.source || node_d === d.target ? 'black' : null
      // })
    })
    .on('mouseout', function(d) {
      link.style('stroke', null)
      d3.select(this).style('stroke', null)
      // node.style('fill', null)
      let l = pianoKeys.find(x => x.id === parseInt(d.low_data))
      let h = pianoKeys.find(x => x.id === parseInt(d.high_data))
      if (l.key.length == 1) {
        d3.selectAll('#key' + l.id).attr('fill', 'white')
      } else {
        d3.selectAll('#key' + l.id).attr('fill', null)
      }

      if (h.key.length == 1) {
        d3.selectAll('#key' + h.id).attr('fill', 'white')
      } else {
        d3.selectAll('#key' + h.id).attr('fill', null)
      }
    })

  // Append name, low/high keys as siblings
  link
    .enter()
    .append('text')
    .data(vocalRangeData)
    .attr('dy', function(d) {
      let idx = vocalRangeData.findIndex(x => x.name === d.name)
      return idx * padding
    })
    .attr('dx', '0')
    .attr('opacity', '1')
    .style('font-size', '1rem')
    .text(function(d) {
      return d.name
    })

  link
    .enter()
    .append('text')
    .data(vocalRangeData)
    .attr('class', function (d) {
      return 'range-key-low'
    })
    .attr("y", function (d) {
      let idx = vocalRangeData.findIndex(x => x.name === d.name)
      return idx * padding
    })
    .attr("x", function (d) {
      return d.source.x + 10
    })
    .attr("opacity", "1")
    .style('font-size', ".8rem")
    .text(function (d) { return d.low.slice(0,-1) })
    .on('mouseover', low_tip.show)
    .on('mouseout', low_tip.hide)

  link
    .enter()
    .append('text')
    .data(vocalRangeData)
    .attr('class', function (d) {
      return 'range-key-high'
    })
    .attr("y", function (d) {
      let idx = vocalRangeData.findIndex(x => x.name === d.name)
      return idx * padding
    })
    .attr("x", function (d) {
      return d.target.x - 20
    })
    .attr("opacity", "1")
    .style('font-size', ".8rem")
    .text(function (d) { return d.high.slice(0, -1) })
    .on('mouseover', high_tip.show)
    .on('mouseout', high_tip.hide)

  //   var node = svg.append('g')
  //     .attr('class', 'nodes')
  //     .selectAll('circle')
  //     .data(pianoKeys)
  //     .enter().append('circle')
  //     .attr('cx', function (d) { return d.x })
  //     .attr('cy', function (d) { return d.y })
  //     .attr('r', function (d) { return nodeRadius(1) })
  //     .on('mouseover', function (d) {
  //       node.style('fill', null)
  //       d3.select(this).style('fill', null)
  //       var nodesToHighlight = vocalRangeData.map(function (e) { return e.source === d ? e.target : e.target === d ? e.source : 0})
  //         .filter(function (d) { return d })
  //       node.filter(function (d) { return nodesToHighlight.indexOf(d) >= 0 })
  //         .style('fill', null)
  //       link.style('stroke', function (link_d) {
  //         return link_d.source === d | link_d.target === d ? '#d62333' : null
  //       })
  //     })
  //     .on('mouseout', function (d) {
  //       node.style('fill', null)
  //       link.style('stroke', null)
  //   })

  //   node.append('title').text(function (d) { return d.name })

  // Mouseover effects
  d3.selectAll('.white-key')
    .on('mouseover', function(d) {
      let id = d3
        .select(this)
        .attr('id')
        .slice(3)
      let key = pianoKeys.find(x => x.id === parseInt(id))
      d3.select(this).attr('fill', 'white')
    })
    .on('mouseout', function(d) {
      d3.select(this).attr('fill', 'white')
    })

  d3.selectAll('.black-key')
    .on('mouseover', function(d) {
      let id = d3
        .select(this)
        .attr('id')
        .slice(3)
      let key = pianoKeys.find(x => x.id === parseInt(id))
      d3.select(this).attr('fill', 'black')
    })
    .on('mouseout', function(d) {
      d3.select(this).attr('fill', 'black')
    })

  // Button toggle effects
  $('.chart-2-toggle').on('click', function(e) {
    // Change to default state
    if ($(this).hasClass('animate')) {
      $(this).removeClass('animate');
      $(this).text('Compare Ranges');

      bars
        .transition()
        .duration(500)
        .style('transform', function(d) {
          return 'translateX(' + 0 + 'px)'
        })
        .on('end', function (e) {
          $('#piano').css('visibility', 'visible');
          $('.range-key-low, .range-key-high').show();
        })

    } else {
    // Change to animated state
      $(this).addClass('animate');
      $(this).text('View Original');
      $('#piano').css('visibility', 'hidden');
      $('.range-key-low, .range-key-high').hide();

      bars
        .transition()
        .duration(500)
        .style('transform', function(d) {
          return 'translateX(' + (-d.source.x+160) + 'px)'
        })
    }
  });
}
