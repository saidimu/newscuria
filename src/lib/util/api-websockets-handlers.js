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

function search_by_url(message)  {
  var url = message.url || undefined;

  opencalais_search_by_url(url, function(response) {
    this.emit(response);
  });//opencalais_search_by_url
}//search_by_url


function tags_by_url(message) {
    return {};
}//tags_by_url


function instances_by_url(message) {
    return {};
}//instances_by_url


function http_handler (req, res) {
	fs.readFile(__dirname + '/util/client_sockets.html', function (err, data) {
		if (err) {
		  res.writeHead(500);
		  return res.end('Error loading realtime.html');
		}//if

		res.writeHead(200);
		res.end(data);
	});
}//http_handler


module.exports = {
  search_by_url: search_by_url,
  tags_by_url: tags_by_url,
  instances_by_url: instances_by_url,
};//module.exports
