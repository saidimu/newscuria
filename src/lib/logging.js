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
          facility: config.get('facility'),
          host: config.get('host'),
          port: config.get('port')
        })
      }
    ],
  });//bunyan.createLogger()

  return logger;
}//get_logger()


module.exports = get_logger;