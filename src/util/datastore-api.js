'use strict';

var appname = "datastore-api";
var log = require('_/logging.js')(appname);

var cql = require('node-cassandra-cql');

var config = require('config').get("cassandra");
var hosts = config.get('hosts');
var keyspace = config.get('keyspace');

// FIXME: wait for connection success before proceeding
var client = new cql.Client({
    hosts: hosts,
    keyspace: keyspace
});


module.exports = {
  client: client,
  types: cql.types
};//module.exports