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

var server = new Hapi.Server();
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

  socket.emit('status', {
    message: 'Oh hii!'
  });

  socket.on('/url/', handlers.search_by_url);
  socket.on('/url/tags', handlers.tags_by_url);
  socket.on('/url/instances', handlers.instances_by_url);

});//io.on

// set up API routes
server.route(routes);

server.start(function () {
    log.info({
      info: server.info.url,
    }, "API server listening...");
});
