/**
Copyright (C) 2015  Saidimu Apale
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.
This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.
You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
**/
'use strict';

var bunyan = require('bunyan');
var loggly = require('bunyan-loggly').Bunyan2Loggly;
var hostname = require('os').hostname();

var config = require('config').get("logging");

var metric_types = require('_/util/metric-types.js');

// https://github.com/segmentio/oh-crap
var crap = require('oh-crap')(__dirname, onUncaughtError);

// catch uncaught exceptions and print error message and stack before exiting cleanly
// process restart is handled externally
// process.on('uncaughtException', function (err) {
function onUncaughtError(err) {
  var now = new Date().toUTCString();

  console.error(now + ': uncaughtException:', err.message);
  console.error(err.stack);

  get_logger('logging').fatal({
    err: err
  }, 'uncaughtException. Exiting process.');

  process.exit(1);
}//onUncaughtError

function get_logger(name) {
  if(!name) {
    throw new Error("Invalid logger name '%s'. Cannot create a logger", name);
  }//if

  // default stdout stream
  var streams = [{
    level: config.get('stdout').get('level'),
    stream: process.stdout
  }];

  var loggly_stream;

  // only run if config file allows
  if(config.get('loggly').get('enabled')) {
    loggly_stream = {
      level: config.get('loggly').get('level'),
      type: 'raw',
      stream: new loggly({
        token: config.get('loggly').get('token'),
        subdomain: config.get('loggly').get('subdomain')
      }, config.get('loggly').get('buffer_size') || 1000)
    };//loggly_stream

    streams.push(loggly_stream);

  } else {

    console.log('Loggly logging is DISABLED.');

  }//if


  var logger = bunyan.createLogger({
    name: hostname,
    hostname: name,
    serializers: {
      err: bunyan.stdSerializers.err,
      req: bunyan.stdSerializers.req,
      res: bunyan.stdSerializers.res
    },
    streams: streams
  });//bunyan.createLogger()

  // FIXME: better way to augment logger with custom log message "types"?
  logger.types = metric_types;

  return logger;
}//get_logger()


module.exports = get_logger;
