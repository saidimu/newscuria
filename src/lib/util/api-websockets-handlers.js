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

var path = require('path');

var search = require('_/util/search.js');

var routes = {
  URL: '/url/',
  TAGS: '/url/tags/',
  INSTANCES: '/url/instances/',
	STATUS: '/status/',
};//routes


function get_url_summary(socket, message, route)  {
  var url = message.url || undefined;

  search.opencalais_get_url_summary(url, function(response) {
    socket.emit(route, response);
  });//opencalais_get_url_summary
}//get_url_summary


function get_url_tags(socket, message, route) {
  var url = message.url || undefined;

  search.opencalais_get_url_tags(url, function(response) {
    socket.emit(route, response);
  });//opencalais_get_url_tags
}//get_url_tags


function get_url_instances(socket, message, route) {
  var url = message.url || undefined;

  search.opencalais_get_url_instances(url, function(response, socket_path) {
    socket.emit(route, response);
  });//opencalais_get_url_instances
}//get_url_instances


function serve_websockets_html(root_path) {
  var route = {
    method: ['GET'],
    path: root_path + '/',  // default websockets html serving
    handler: function (request, reply) {
      var websockets_html_path = path.resolve('./lib/util/websockets.html');

      console.log("HTTP request for websockets html file: '%s'", websockets_html_path);

      reply.file(websockets_html_path);
    }//handler
  };//route

  return route;
}//serve_websockets_html


module.exports = {
  routes               : routes,
  get_url_summary      : get_url_summary,
  get_url_tags         : get_url_tags,
  get_url_instances    : get_url_instances,
  // get_url_people       : get_url_people,
  // get_url_places       : get_url_places,
  // get_url_things       : get_url_things,
  // get_url_relations    : get_url_relations,
  // get_url_companies    : get_url_companies,
  // get_url_events       : get_url_events,
  serve_websockets_html: serve_websockets_html,
};//module.exports
