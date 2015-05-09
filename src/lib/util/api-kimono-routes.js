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

var kimono = require('_/util/kimono.js');


function google_news(root_path)  {
  var route =   {
    method: ['POST'],
    path: root_path + '/googlenews',
    handler: function (request, reply) {
      var webhook = request.payload || undefined;

      kimono.googlenews_handler(webhook, function(response) {
        // http://hapijs.com/tutorials/logging
        request.log(['info', 'kimono', 'webhook'], response);

        reply("Ok");
      });//kimono_googlenews_handler
    }//handler
  };//route

  return route;
}//google_news


module.exports = {
  google_news: google_news
};//module.exports
