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

function nodetime() {
  var config = require('config').get('profiler').get("nodetime");
  require('nodetime').profile({
    accountKey : config.get('api_key'),
    appName    : config.get('appname')
  });
}//nodetime


function appdynamics()  {
  var config = require('config').get('profiler').get("appdynamics");
  require("appdynamics").profile({
    controllerHostName   : config.get('controllerHostName'),
    controllerPort       : config.get('controllerPort'), // If SSL, be sure to enable the next line
    accountName          : config.get('accountName'), // Required for a controller running in multi-tenant mode
    accountAccessKey     : config.get('accountAccessKey'), // Required for a controller running in multi-tenant mode
    applicationName      : config.get('applicationName'),
    tierName             : config.get('tierName'),
    nodeName             : config.get('nodeName'), // Node names must be unique. A unique name has been generated for you.
    controllerSslEnabled : config.get('controllerSslEnabled') // Optional - use if connecting to controller via SSL
  });//require
}//appdynamics


module.exports = {
  nodetime: nodetime,
  appdynamics: appdynamics
};//module.exports
