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

// increase global maxSockets (NodeJS default is 5)
// for both http and https
// TODO: may need to disable socket pooling all together
var maxSockets = Infinity;

var http = require('http');
if(http.globalAgent.maxSockets < maxSockets) {
  http.globalAgent.maxSockets = maxSockets;
}//if

var https = require('https');
if(https.globalAgent.maxSockets < maxSockets) {
  https.globalAgent.maxSockets = maxSockets;
}//if

// init the SaaS profiler
require('_/util/profiler.js').nodetime();

// FIXME: workaround 'config' bug regarding multiple confg files
process.env.NODE_ENV = "entities";

var filter = require('_/util/filter.js');
var readability = require('_/util/readability.js');
var opencalais = require('_/util/opencalais.js');
var datastore = require('_/util/datastore.js');
// var entities = require('_/util/entities.js');
var search = require('_/util/search.js');
var twitter = require('_/util/twitter.js');


//==BEGIN here
start();
//==BEGIN here


function start()    {
  twitter.start();
  filter.start();
  readability.start();
  opencalais.start();
  datastore.start();
  entities.start();
  search.start();
}//start()
