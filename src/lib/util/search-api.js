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

var elasticsearch = require('elasticsearch');

var config = require('config').get('elasticsearch');
var hosts = config.get('hosts');
var apiVersion = config.get('apiVersion');

// FIXME: wait for connection success before proceeding
  var client = new elasticsearch.Client({
    hosts: hosts,
    apiVersion: apiVersion,
    log: 'info',  // FIXME: use a child-logger instead
  });

module.exports = {
  client: client
};//module.exports
