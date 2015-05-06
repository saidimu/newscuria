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

var fs = require('fs');

var opencalais_search_by_url    = require('_/util/search.js').opencalais_search_by_url;
var opencalais_tags_by_url      = require('_/util/search.js').opencalais_tags_by_url;
var opencalais_instances_by_url = require('_/util/search.js').opencalais_instances_by_url;

var routes = {
  URL: '/url/',
  TAGS: '/url/tags/',
  INSTANCES: '/url/instances/',
	STATUS: '/status/',
};//routes


function search_by_url(socket, message, route)  {
  var url = message.url || undefined;

  console.log(message);

  opencalais_search_by_url(url, function(response) {
    socket.emit(route, response);
  });//opencalais_search_by_url
}//search_by_url


function tags_by_url(socket, message, route) {
  var url = message.url || undefined;

  console.log(message);

  opencalais_tags_by_url(url, function(response) {
    socket.emit(route, response);
  });//opencalais_tags_by_url
}//tags_by_url


function instances_by_url(socket, message, route) {
  var url = message.url || undefined;

  console.log(message);

  opencalais_instances_by_url(url, function(response, socket_path) {
    socket.emit(route, response);
  });//opencalais_instances_by_url
}//instances_by_url


module.exports = {
  routes: routes,
  search_by_url: search_by_url,
  tags_by_url: tags_by_url,
  instances_by_url: instances_by_url,
};//module.exports
