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

var appname = "filter";
var log = require('_/util/logging.js')(appname);

var mixpanel = require('_/util/mixpanel.js');
var event_type = mixpanel.event_type;

var queue = require('_/util/queue.js');
var topics = queue.topics;

function start()    {
  // connect to the message queue
  queue.connect(listen_to_urls_received);
}//start()


function listen_to_urls_received()  {
  var topic = topics.URLS_RECEIVED;
  var channel = "filter-unwanted-urls";

  queue.read_message(topic, channel, function onReadMessage(err, json, message) {
    if(!err) {
      var url = json.url || '';

      // FIXME: Save url-less messages for later analysis
      if(url !== '') {

        queue.publish_message(topics.URLS_APPROVED, {
          url: url
        });

      } else {

        log.error({
          topic: topic,
          channel: channel,
          json: json,
          queue_msg: message,
          err: err
        }, "json message has no URL.");

        mixpanel.track(event_type.url.ERROR, {
          source: appname,
          message: "URL not found in queue message JSON.",
          data: json,
        });

      }//if-else

      message.finish();
    }//if-else
  });
}//listen_to_urls_received


module.exports = {
  start: start,
};//module.exports
