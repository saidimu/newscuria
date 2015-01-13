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
var bsyslog = require('bunyan-syslog');
var hostname = require('os').hostname();

var config = require('config').get("logging");

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
        level: config.get('level'),
        stream: process.stdout
      },
      {
        level: config.get('level'),
        type: 'raw',
        stream: bsyslog.createBunyanStream({
          name: hostname,
          type: config.get('type'),
          facility: bsyslog.local0,
          host: config.get('host'),
          port: config.get('port')
        })
      }
    ],
  });//bunyan.createLogger()

  return logger;
}//get_logger()


module.exports = get_logger;