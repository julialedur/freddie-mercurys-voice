// To use scrollytelling, we need to install this package here:
//    https://github.com/russellgoldenberg/enter-view
// Parcel might do it for you, or you can just use
//    npm install enter-view

import enterView from 'enter-view'
import * as d3 from 'd3'

// If this module changes, refresh the ENTIRE page
if (module.hot) {
  module.hot.accept(() => window.location.reload())
}

enterView({
  selector: '.step',
  offset: 0.4,
  enter: function(element) {
    element.classList.add('entered')

    // Trigger stepin for current step
    d3.select(element).dispatch('stepin')
  },
  exit: function(element) {
    element.classList.remove('entered')

    // Trigger stepout for current step
    d3.select(element).dispatch('stepout')

    // Trigger stepin for previous step (if it exists)
    var previous = element.previousElementSibling
    if (previous && previous.classList.contains('step')) {
      d3.select(previous).dispatch('stepin')
    }
  }
})
