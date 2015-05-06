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

var opencalais_search_by_url    = require('_/util/search.js').opencalais_search_by_url;
var opencalais_tags_by_url      = require('_/util/search.js').opencalais_tags_by_url;
var opencalais_instances_by_url = require('_/util/search.js').opencalais_instances_by_url;

module.exports = [
  {
    method: ['GET'],
    path: '/realtime/',  // default websockets html serving
    handler: function (request, reply) {
      console.log("HTTP request for websockets html file.");

      reply.file(path.resolve('./util/websockets.html'));
    }//handler
  },

  {
    method: ['GET'],
    path: '/v1/url/',
    handler: function (request, reply) {
      var url = request.query.url || undefined;

      opencalais_search_by_url(url, function(response) {
        reply(response);
      });//opencalais_search_by_url
    }//handler
  },

  {
    method: ['POST'],
    path: '/v1/url/',
    handler: function (request, reply) {
      var url = request.payload.url || undefined;

      opencalais_search_by_url(url, function(response) {
        reply(response);
      });//opencalais_search_by_url
    }//handler
  },

  {
    method: ['GET'],
    path: '/v1/url/tags/',
    handler: function (request, reply) {
      var url = request.query.url || undefined;

      opencalais_tags_by_url(url, function(response) {
        reply(response);
      });//opencalais_tags_by_url
    }//handler
  },

  {
    method: ['POST'],
    path: '/v1/url/tags/',
    handler: function (request, reply) {
      var url = request.payload.url || undefined;

      opencalais_tags_by_url(url, function(response) {
        reply(response);
      });//opencalais_tags_by_url
    }//handler
  },

  {
    method: ['GET'],
    path: '/v1/url/instances/',
    handler: function (request, reply) {
      var url = request.query.url || undefined;

      opencalais_instances_by_url(url, function(response) {
        reply(response);
      });//opencalais_instances_by_url
    }//handler
  },

  {
    method: ['POST'],
    path: '/v1/url/instances/',
    handler: function (request, reply) {
      var url = request.payload.url || undefined;

      opencalais_instances_by_url(url, function(response) {
        reply(response);
      });//opencalais_instances_by_url
    }//handler
  },

];//module.exports
