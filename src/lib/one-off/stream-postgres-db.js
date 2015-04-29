'use strict';

var client = require('_/util/datastore-api.js').client;
var QueryStream = require('pg-query-stream');

// var query = new QueryStream('SELECT * FROM opencalais LIMIT 50', []);
var query = new QueryStream('SELECT * FROM opencalais', []);
var db_stream = client.query(query);

var queue = require('_/util/queue.js');
var topics = queue.topics;

var num_rows = 0;

function done()  {
  console.log("%s rows processed.", num_rows);
}//done

function process_row(row)  {
  num_rows = num_rows + 1;
  // console.log(row.api_result.url);
  queue.publish_message(topics.OPENCALAIS, row.api_result);
}//process_row

//release the client when the stream is finished
var x = db_stream.on('end', done);

function start()  {
  var y = db_stream.on('data', process_row);
}//start

queue.connect(start);
