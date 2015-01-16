/**
Copyright (C) 2015  Saidimu Apale
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.
This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.
You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
**/
'use strict';

var appname = "filter";
var log = require('_/util/logging.js')(appname);

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
  var channel = "filter-unwanted-urls";

  queue.read_message(topic, channel, function onReadMessage(err, json, message) {
    if(err) {
      log.error("Error geting message from queue!");
    } else {
      process_url_received_message(json, message);
    }//if-else
  });
}//listen_to_urls_received


function process_url_received_message(json, message)  {
  var url = json.url || '';

  publish_url_approved(url);

  message.finish();
}//process_url_received_message


function publish_url_approved(url)  {
  queue.publish_message(topics.URLS_APPROVED, {
    url: url
  });
}//publish_url_approved
