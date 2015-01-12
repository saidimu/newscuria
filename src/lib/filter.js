'use strict';

var appname = "filter";
var log = require('_/util/logging.js')(appname);

var fs = require('fs');
var util = require('util');
var path = require('path');
var findit = require('findit');
var url_utils = require('url');

var queue = require('_/util/queue.js');
var topics = queue.topics;

//==BEGIN here
// connect to the message queue
queue.connect(function onQueueConnect(err) {
  if(err) {
    log.fatal({
      err: err,
    }, "Cannot connect to message queue!");

  } else {
    
    start();

  }//if-else
});
//==BEGIN here


function start()    {
  listen_to_urls_received();
}//start()


function listen_to_urls_received()  {
  var topic = topics.URLS_RECEIVED;
  var channel = "filter";

  queue.read_message(topic, channel, function onReadMessage(err, message) {
    if(err) {
      log.error("Error geting message from queue!");
    } else {
      process_url_received_message(message);
    }//if-else
  });
}//listen_to_urls_received


function process_url_received_message(msg)  {
  var url = msg.url || '';

  publish_url_approved(url);
}//process_url_received_message


function publish_url_approved(url)  {
  queue.publish_message(topics.URLS_APPROVED, {
    url: url
  });
}//publish_url_approved


module.exports = {
  
};//module.exports