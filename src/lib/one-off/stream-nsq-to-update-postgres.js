'use strict';

var client = require('_/util/datastore-api.js').client;
// var QueryStream = require('pg-query-stream');

var queue = require('_/util/queue.js');

var num_rows = 0;
var err_rows = 0;
var update_query = "UPDATE readability SET api_result=$1 WHERE url=$2";

function process_row(json, message)  {
  // var api_result = json.api_result || null;

  if(json.api_result === null) {
    message.finish();
    return;
  }//if

  if(json.api_result.date_published === null) {
    message.finish();
    return;
  }//if

  if(json.date_published === null) {
    message.finish();
    return;
  }//if

  json.api_result.date_published = json.date_published;

  update_row(json, message);
}//process_row


function update_row(json, message)  {
  client.query(update_query, [json, json.url], function(err, resp) {
    if(err) {
      console.log(err);
      err_rows = err_rows + 1;

      message.requeue();
    } else {
      message.finish();
    }
  });
}//update_row

function start()  {
  var topic = "newscuria.readability_TEST";
  var channel = "update-in-datastore";

  queue.read_message(topic, channel, function onReadMessage(err, json, message) {
    if(!err) {
      num_rows = num_rows + 1;
      if( (num_rows % 5000) === 0)  {
        console.log(num_rows);
        console.log(err_rows);
      }//if

      process_row(json, message);
    }//if

  });//queue.read_message

}//start

queue.connect(start);
