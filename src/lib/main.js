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

// FIXME: workaround 'config' bug regarding multiple confg files
process.env.NODE_ENV = "entities";

var filter = require('_/util/filter.js');
var readability = require('_/util/readability.js');
var opencalais = require('_/util/opencalais.js');
var datastore = require('_/util/datastore.js');
var entities = require('_/util/entities.js');
var search = require('_/util/search.js');
// var cartodb = require('_/util/cartodb.js');


//==BEGIN here
start();
//==BEGIN here


function start()    {
  filter.start();
  readability.start();
  opencalais.start();
  datastore.start();
  entities.start();
  search.start();
  // cartodb.start();
}//start()
