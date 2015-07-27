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

var search = require('_/util/search.js');

var get_url_summary = {
  method: ['GET', 'POST'],
  path: '/',
  config: {
    plugins: {
      'hapi-io': '/'
    }
  },
  handler: function (request, reply) {
    var url = request.query.url || request.payload.url || undefined;

    search.opencalais_get_url_summary(url, function(response) {
      reply(response);
    });//opencalais_get_url_summary
  }//handler
};//get_url_summary


var get_url_tags = {
  method: ['GET', 'POST'],
  path: '/tags/',
  config: {
    plugins: {
      'hapi-io': '/tags/'
    }
  },
  handler: function (request, reply) {
    var url = request.query.url || request.payload.url || undefined;

    search.opencalais_get_url_tags(url, function(response) {
      reply(response);
    });//opencalais_get_url_tags
  }//handler
};//get_url_tags


var get_url_instances = {
  method: ['GET', 'POST'],
  path: '/instances/',
  config: {
    plugins: {
      'hapi-io': '/instances/'
    }
  },
  handler: function (request, reply) {
    var url = request.query.url || request.payload.url || undefined;

    search.opencalais_get_url_instances(url, function(response) {
      reply(response);
    });//opencalais_get_url_instances
  }//handler
};//get_url_instances


var get_url_people = {
  method: ['GET', 'POST'],
  path: '/people/',
  config: {
    plugins: {
      'hapi-io': '/people/'
    }
  },
  handler: function (request, reply) {
    var url = request.query.url || request.payload.url || undefined;

    search.opencalais_get_url_people(url, function(response) {
      reply(response);
    });//opencalais_get_url_people
  }//handler
};//get_url_people


var get_url_places = {
  method: ['GET', 'POST'],
  path: '/places/',
  config: {
    plugins: {
      'hapi-io': '/places/'
    }
  },
  handler: function (request, reply) {
    var url = request.query.url || request.payload.url || undefined;

    search.opencalais_get_url_places(url, function(response) {
      reply(response);
    });//opencalais_get_url_places
  }//handler
};//get_url_places


var get_url_things = {
  method: ['GET', 'POST'],
  path: '/things/',
  config: {
    plugins: {
      'hapi-io': '/things/'
    }
  },
  handler: function (request, reply) {
    var url = request.query.url || request.payload.url || undefined;

    search.opencalais_get_url_things(url, function(response) {
      reply(response);
    });//opencalais_get_url_things
  }//handler
};//get_url_things


var get_url_relations = {
  method: ['GET', 'POST'],
  path: '/relations/',
  config: {
    plugins: {
      'hapi-io': '/relations/'
    }
  },
  handler: function (request, reply) {
    var url = request.query.url || request.payload.url || undefined;

    search.opencalais_get_url_relations(url, function(response) {
      reply(response);
    });//opencalais_get_url_relations
  }//handler
};//get_url_relations


var get_url_companies = {
  method: ['GET', 'POST'],
  path: '/companies/',
  config: {
    plugins: {
      'hapi-io': '/companies/'
    }
  },
  handler: function (request, reply) {
    var url = request.query.url || request.payload.url || undefined;

    search.opencalais_get_url_companies(url, function(response) {
      reply(response);
    });//opencalais_get_url_companies
  }//handler
};//get_url_companies


var get_url_events = {
  method: ['GET', 'POST'],
  path: '/events/',
  config: {
    plugins: {
      'hapi-io': '/events/'
    }
  },
  handler: function (request, reply) {
    var url = request.query.url || request.payload.url || undefined;

    search.opencalais_get_url_events(url, function(response) {
      reply(response);
    });//opencalais_get_url_events
  }//handler
};//get_url_events

// export an array of routes to be imported into a HapiJS server.route() call
module.exports = [
  get_url_summary,
  get_url_tags,
  get_url_instances,
  get_url_people,
  get_url_places,
  get_url_things,
  get_url_relations,
  get_url_companies,
  get_url_events,
];//module.exports
