/**
 * Copyright (C) 2015  Saidimu Apale
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
'use strict';

var appname = "metrics";
var log = require('_/util/logging.js')(appname);

var format = require('util').format;

var hostname = process.env.HOSTNAME || require('os').hostname();

var metric_template = format("host.%s.app.%.event.%.%", hostname);

// https://github.com/felixge/node-measured#usage
var stats = require('measured').createCollection();

// display stats on console every X seconds.
setInterval(function() {
  dump();
}, 10000);


// https://github.com/felixge/node-measured#counter
function count(event, increment)  {
  var converted = toIntOrFloat(increment);

  if(converted !== false) {
    stats.counter(event).inc(increment);
  }//if
}//count()


// https://github.com/felixge/node-measured#meter
function meter(event, num_events) {
  var converted = toIntOrFloat(num_events);

  if(converted !== false) {
    stats.meter(event).mark(converted);
  }//if
}//meter()


// https://github.com/felixge/node-measured#histogram
function histogram(event, value) {
  var converted = toIntOrFloat(value);

  if(converted !== false) {
    stats.histogram(event).update(converted);
  }//if
}//histogram


// https://github.com/felixge/node-measured#timers
function timer(event, value)  {
  var converted = toIntOrFloat(value);

  if(converted !== false) {
    stats.timer(event).update(converted);
  }//if

}//timer()


function toIntOrFloat(candidate)  {
  var converted = parseFloat(candidate, 10);
  if(isNaN(candidate)) {
    console.error("Original: %s; NaN: %s", candidate, converted);
    return false;

  } else {
    return converted;

  }//if-else
}//toIntOrFloat


function dump() {
  console.log(stats.toJSON());
}//dump


module.exports = {
  count     : count,
  meter     : meter,
  timer     : timer,
  histogram : histogram,
  dump      : dump,
  collection: stats,
};//module.exports
