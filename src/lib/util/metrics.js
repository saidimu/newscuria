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

var influx = require('influx');
var config = require('config').get("metrics");

var types = require('_/util/metric-types.js');

var client; // InfluxDB client

// var hostname = process.env.HOSTNAME || require('os').hostname();

// https://github.com/felixge/node-measured#usage
var stats = require('measured').createCollection();

// display stats on console every X seconds.
setInterval(function() {
  dump();
}, 10000);


// https://github.com/felixge/node-measured#counter
function count(event, metadata, increment)  {
  var converted = toIntOrFloat(increment);

  if(converted !== false) {
    stats.counter(event).inc(increment);
  }//if
}//count()


// https://github.com/felixge/node-measured#meter
function meter(event, metadata, num_events) {
  if(!num_events) {
    num_events = 1;
  }//if

  var converted = toIntOrFloat(num_events);

  if(converted !== false) {
    stats.meter(event).mark(converted);
  }//if
}//meter()


// https://github.com/felixge/node-measured#histogram
function histogram(event, metadata, value) {
  var converted = toIntOrFloat(value);

  if(converted !== false) {
    stats.histogram(event).update(converted);
  }//if
}//histogram


// https://github.com/felixge/node-measured#timers
function timer(event, metadata, value)  {
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


// only run if config file allows
if(config.get('enabled')) {
  log.info('metrics collection is ENABLED.');

  client = influx({
    // or single-host configuration
    host     : config.get('host'),
    port     : config.get('port'),
    username : config.get('username'),
    password : config.get('password'),
    database : config.get('database'),
    requestTimeout: config.get('requestTimeout')
  });

  log.info({
    metrics_hosts: client.getHostsAvailable(),
    log_type: log.types.metrics.AVAILABLE_HOSTS,
  }, "Metrics-server available hosts.");

} else{

  log.info('metrics collection is DISABLED.');

}//if-else


function writePoint(series, values)  {
  // only run if config file allows
  if(!config.get('enabled')) {
    return;
  }//if-else

  values.time = new Date(); // TODO: allow timestamp override?

  // check for non-empty series-name and value
  if(!series || !values) {
    log.error({
      series: series,
      metrics_hosts: client.getHostsAvailable(),
      log_type: log.types.metrics.METRICS_ERROR,
    }, "Invalid metrics.");

    meter(types.metrics.METRICS_ERROR, {
      series: series,
    });

    return;
  }//if

  // store the metrics
  client.writePoint(series, values, function(err)  {
    if(err) {
      log.error({
        err: err,
        series: series,
        metrics_hosts: client.getHostsAvailable(),
        log_type: log.types.metrics.STORE_ERROR,
      }, "Error storing metrics.");
    }//if

    meter(types.metrics.STORE_ERROR, {
      series: series,
    });

  });//client.write

}//writePoint


module.exports = {
  count     : count,
  meter     : meter,
  timer     : timer,
  histogram : histogram,
  dump      : dump,
  collection: stats,
  types     : types,
};//module.exports
