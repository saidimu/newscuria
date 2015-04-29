'use strict';

var client = require('_/util/datastore-api.js').client;
var QueryStream = require('pg-query-stream');

var queue = require('_/util/queue.js');
var topics = queue.topics;

function postgres_to_nsq(query, params, topic) {
  var query_stream = new QueryStream(query, params);
  var db_stream = client.query(query_stream);

  var num_rows = 0;

  //release the client when the stream is finished
  db_stream.on('end', function () {
    done(num_rows);
  });

  function start()  {
    var y = db_stream.on('data', function(row) {
      num_rows = num_rows + 1;
      process_row(row, topic);
    });
  }//start

  queue.connect(start);

}//postgres_to_nsq


function done(num_rows)  {
  console.log("%s rows processed.", num_rows);
}//done

function process_row(row, topic)  {
  // console.log(row.api_result.url);
  queue.publish_message(topic, row.api_result);
}//process_row


module.exports = {
  postgres_to_nsq: postgres_to_nsq,
};//module.exports
