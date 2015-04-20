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

var get_url_metadata = require('_/util/search.js').get_url_metadata;

module.exports = [
  {
    method: ['GET'],
      path: '/v1/url/',
      handler: function (request, reply) {
        var url = request.params.url;

        console.log(request.params);

        get_url_metadata(url, function(response) {
          reply(response);
        });//get_url_metadata
      }//handler
  },
  {
    method: ['POST'],
      path: '/v1/url/',
      handler: function (request, reply) {
        var url = request.payload.url;

        // console.log(request.payload);

        get_url_metadata(url, function(response) {
          reply(response);
        });//get_url_metadata
      }//handler
  }
];//module.exports
