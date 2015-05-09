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


function get_url_summary(root_path)  {
  var route = {
    method: ['GET', 'POST'],
    path: root_path + '/',
    handler: function (request, reply) {
      var url = request.query.url || request.payload.url || undefined;

      search.opencalais_get_url_summary(url, function(response) {
        reply(response);
      });//opencalais_get_url_summary
    }//handler
  };//route

  return route;
}//get_url_summary


function get_url_tags(root_path)  {
  var route = {
    method: ['GET', 'POST'],
    path: root_path + '/tags/',
    handler: function (request, reply) {
      var url = request.query.url || request.payload.url || undefined;

      search.opencalais_get_url_tags(url, function(response) {
        reply(response);
      });//opencalais_get_url_tags
    }//handler

  };//route

  return route;
}//get_url_tags


function get_url_instances(root_path)  {
  var route = {
    method: ['GET', 'POST'],
    path: root_path + '/instances/',
    handler: function (request, reply) {
      var url = request.query.url || request.payload.url || undefined;

      search.opencalais_get_url_instances(url, function(response) {
        reply(response);
      });//opencalais_get_url_instances
    }//handler
  };//route

  return route;
}//get_url_instances


function get_url_people(root_path)  {
  var route = {
    method: ['GET', 'POST'],
    path: root_path + '/people/',
    handler: function (request, reply) {
      var url = request.query.url || request.payload.url || undefined;

      search.opencalais_get_url_people(url, function(response) {
        reply(response);
      });//opencalais_get_url_people
    }//handler
  };//route

  return route;
}//get_url_people


function get_url_places(root_path)  {
  var route = {
    method: ['GET', 'POST'],
    path: root_path + '/places/',
    handler: function (request, reply) {
      var url = request.query.url || request.payload.url || undefined;

      search.opencalais_get_url_places(url, function(response) {
        reply(response);
      });//opencalais_get_url_places
    }//handler
  };//route

  return route;
}//get_url_places


function get_url_things(root_path)  {
  var route = {
    method: ['GET', 'POST'],
    path: root_path + '/things/',
    handler: function (request, reply) {
      var url = request.query.url || request.payload.url || undefined;

      search.opencalais_get_url_things(url, function(response) {
        reply(response);
      });//opencalais_get_url_things
    }//handler
  };//route

  return route;
}//get_url_things


function get_url_relations(root_path)  {
  var route = {
    method: ['GET', 'POST'],
    path: root_path + '/relations/',
    handler: function (request, reply) {
      var url = request.query.url || request.payload.url || undefined;

      search.opencalais_get_url_relations(url, function(response) {
        reply(response);
      });//opencalais_get_url_relations
    }//handler
  };//route

  return route;
}//get_url_relations


function get_url_companies(root_path)  {
  var route = {
    method: ['GET', 'POST'],
    path: root_path + '/companies/',
    handler: function (request, reply) {
      var url = request.query.url || request.payload.url || undefined;

      search.opencalais_get_url_companies(url, function(response) {
        reply(response);
      });//opencalais_get_url_companies
    }//handler
  };//route

  return route;
}//get_url_companies


function get_url_events(root_path)  {
  var route = {
    method: ['GET', 'POST'],
    path: root_path + '/events/',
    handler: function (request, reply) {
      var url = request.query.url || request.payload.url || undefined;

      search.opencalais_get_url_events(url, function(response) {
        reply(response);
      });//opencalais_get_url_events
    }//handler
  };//route

  return route;
}//get_url_events


module.exports = {
  get_url_summary  : get_url_summary,
  get_url_tags     : get_url_tags,
  get_url_instances: get_url_instances,
  get_url_people   : get_url_people,
  get_url_places   : get_url_places,
  get_url_things   : get_url_things,
  get_url_relations: get_url_relations,
  get_url_companies: get_url_companies,
  get_url_events   : get_url_events,
};//module.exports
