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
var routes = require('_/util/api-hapi-routes.js');
var handlers = require('_/util/api-websockets-handlers.js');

var info_plugin = require('_/util/hapi-plugins/info');
var kimono_plugin = require('_/util/hapi-plugins/kimono');

// http://hapijs.com/api#server
var server = new Hapi.Server({
  debug: {
    request: ['info']
  },
});

server.connection({
  port: 3000
});//server.connection

var io = require('socket.io')(server.listener);

// websockets 'routes'
io.on('connection', function (socket) {
  log.info({
    client_id: socket.id,
    handshake: socket.handshake,
  }, "Client connected to SocketIO server.");

  socket.emit(handlers.routes.STATUS, {
    message: 'Oh hii!'
  });//socket.emit

  socket.on(handlers.routes.URL, function(data) {
    handlers.get_url_summary(socket, data, handlers.routes.URL);
  });//socket.on

  socket.on(handlers.routes.TAGS, function(data) {
    handlers.get_url_tags(socket, data, handlers.routes.TAGS);
  });//socket.on

  socket.on(handlers.routes.INSTANCES, function(data) {
    handlers.get_url_instances(socket, data, handlers.routes.INSTANCES);
  });//socket.on

});//io.on

// set up API routes
server.route(routes);

var plugin_register_callback = function(err)  {
  if(err) {
    log.err({
      err: err,
    }, "Failed to load HapiJS server plugin.");
  }//if
};//plugin_register_callback

// register plugins
server.register({ register: info_plugin }, { routes: { prefix: '/info' }}, plugin_register_callback);
server.register({ register: kimono_plugin }, plugin_register_callback);

// start the API server
server.start(function () {
    log.info({
      info: server.info.url,
    }, "API server listening...");
});
