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

var elasticsearch = require('elasticsearch');

var config = require('config').get('elasticsearch');
var hosts = config.get('hosts');
var apiVersion = config.get('apiVersion');
var requestTimeout = config.get('requestTimeout');
var keepAlive = config.get('keepAlive');
var maxSockets = config.get('maxSockets');

// FIXME: wait for connection success before proceeding
var client = new elasticsearch.Client({
  hosts: hosts,
  apiVersion: apiVersion,
  requestTimeout: requestTimeout,
  keepAlive: keepAlive,
  maxSockets: maxSockets,
  log: LogToBunyan,
});


function LogToBunyan(config) {
  // config is the object passed to the client constructor.
  var bunyan_logger = require('_/util/logging.js')('elasticsearch-client');

  this.error = bunyan_logger.error.bind(bunyan_logger);
  this.warning = bunyan_logger.warn.bind(bunyan_logger);
  this.info = bunyan_logger.info.bind(bunyan_logger);
  this.debug = bunyan_logger.debug.bind(bunyan_logger);
  this.trace = function (method, requestUrl, body, responseBody, responseStatus) {
    bunyan_logger.trace({
      method: method,
      requestUrl: requestUrl,
      body: body,
      responseBody: responseBody,
      responseStatus: responseStatus
    });
  };
  this.close = function () { /* bunyan's loggers do not need to be closed */ };
}//LogToBunyan


module.exports = {
  client: client
};//module.exports
