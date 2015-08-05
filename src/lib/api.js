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

var appname = "api";
var log = require('_/util/logging.js')(appname);

var Hapi = require('hapi');
var hapio = require('hapi-io');

var info_plugin = require('_/util/hapi-plugins/info');
var kimono_plugin = require('_/util/hapi-plugins/kimono');
var opencalais_plugin = require('_/util/hapi-plugins/opencalais');

var API_VERSION_PATH = "/v1";

// http://hapijs.com/api#server
var server = new Hapi.Server({
  debug: {
    request: ['info']
  },
});

server.connection({
  port: 3000
});//server.connection

var plugin_register_callback = function(err)  {
  if(err) {
    log.err({
      err: err,
    }, "Failed to load HapiJS server plugin.");

    throw new Error(err);
  }//if

  // start the API server if no error
  server.start(function () {
      log.info({
        info: server.info.url,
      }, "API server listening...");
  });//server.start

};//plugin_register_callback

// hapi-io: a SocketIO plugin
// route prefixing doesn't appear to work: https://github.com/sibartlett/hapi-io/issues/9
server.register({ register: hapio },  { routes: { prefix: API_VERSION_PATH }}, plugin_register_callback);

// a basic info/version plugin
server.register({ register: info_plugin }, { routes: { prefix: API_VERSION_PATH + '/info' }}, plugin_register_callback);

// a plugin for Kimonolabs.com webhooks
server.register({ register: kimono_plugin }, plugin_register_callback);

// all things Opencalais plugin
server.register({ register: opencalais_plugin }, { routes: { prefix: API_VERSION_PATH + '/url' }}, plugin_register_callback);
