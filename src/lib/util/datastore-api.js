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

var util = require('util');
var pg = require('pg').native;

var config = require('config').get("postgres");
var host = config.get('host');
var port = config.get('port');
var database = config.get('database');
var user = config.get('user');
var password = config.get('password');

var connection_string = util.format("postgres://%s:%s@%s:%s/%s", user, password, host, port, database);

var client;

// FIXME: wait for connection success before proceeding
pg.connect(connection_string, function(err, pg_client, done) {
  if(err) {
    console.error(err);
    throw new Error(err);
  }//if

  module.exports = {
    client: pg_client,
  };//module.exports
});//pg.connect()
