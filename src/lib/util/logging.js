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
// var bsyslog = require('bunyan-syslog');
var loggly = require('bunyan-loggly').Bunyan2Loggly;
var logentries = require('bunyan-logentries');
var hostname = require('os').hostname();

// var config = require('config').get("logging").papertrail;
var config_loggly = require('config').get("logging").loggly;
var config_logentries = require('config').get("logging").logentries;

var log_types = require('_/util/logging-types.js');

// catch uncaught exceptions and print error message and stack before exiting cleanly
// process restart is handled externally
process.on('uncaughtException', function (err) {
  var now = new Date().toUTCString();

  console.error(now + ': uncaughtException:', err.message);
  console.error(err.stack);

  get_logger('logging').fatal({
    err: err
  }, 'uncaughtException. Exiting process.');

  process.exit(1);
});

function get_logger(name) {
  if(!name) {
    throw new Error("Invalid logger name '%s'. Cannot create a logger", name);
  }//if

  var logger = bunyan.createLogger({
    name: hostname,
    hostname: name,
    serializers: {
      err: bunyan.stdSerializers.err,
      req: bunyan.stdSerializers.req,
      res: bunyan.stdSerializers.res
    },
    streams: [
      {
        level: config_loggly.get('level'),
        stream: process.stdout
      },
      {
        level: config_loggly.get('level'),
        type: 'raw',
        stream: new loggly({
          token: config_loggly.get('token'),
          subdomain: config_loggly.get('subdomain')
        })
      },
      {
        level: config_logentries.get('level'),
        type: 'raw',
        stream: logentries.createStream({
          token: config_logentries.get('token'),
        })
      },
    ],
  });//bunyan.createLogger()

  // FIXME: better way to augment logger with custom log message "types"?
  logger.types = log_types;

  return logger;
}//get_logger()


module.exports = get_logger;
