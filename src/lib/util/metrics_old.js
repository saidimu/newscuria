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

var influx = require('influx');
var config = require('config').get("metrics");
var stats = require('measured').createCollection();

var client;

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


function store(series, value)  {
  // only run if config file allows
  if(!config.get('enabled')) {
    return;
  }//if-else

  var timestamp = new Date(); // TODO: allow timestamp override?

  var point = {
    time: timestamp,
    value: value,
  };//point

  // check for non-empty series-name and value
  if(!series || !value) {
    log.error({
      series: series,
      point: point,
      metrics_hosts: client.getHostsAvailable(),
      log_type: log.types.metrics.METRICS_ERROR,
    }, "Invalid metrics.");

    return;
  }//if

  // store the metrics
  client.writePoint(series, point, function(err)  {
    if(err) {
      log.error({
        err: err,
        metrics_hosts: client.getHostsAvailable(),
        log_type: log.types.metrics.STORE_ERROR,
      }, "Error storing metrics.");
    }//if

  });//client.write

}//store


module.exports = {
  store: store,
  client: client,
};//module.exports
