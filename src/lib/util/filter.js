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

var queue = require('_/util/queue.js');
var topics = queue.topics;

var ratelimiter = require('_/util/ratelimiter.js');

function start()    {
  // connect to the message queue
  queue.connect(listen_to_urls_received);
}//start()


function listen_to_urls_received()  {
  var topic = topics.URLS_RECEIVED;
  var channel = "filter-unwanted-urls";

  // 'second', 'minute', 'day', or a number of milliseconds: https://github.com/jhurliman/node-rate-limiter
  var options = {
    app: appname,
    fallback_num_requests: 1,
    fallback_time_period: 100
  };//options

  queue.read_message(topic, channel, function onReadMessage(err, json, message) {
    if(!err) {
      var url = json.url || '';

      if(url) {

        var rateLimitCallback = function() {
          queue.publish_message(topics.URLS_APPROVED, {
            url: url
          });//queue.publish_message
        };//rateLimitCallback

        ratelimiter.limit_app(options, rateLimitCallback);

      } else {
        // FIXME: Save url-less messages for later analysis

        log.error({
          topic: topic,
          channel: channel,
          json: json,
          queue_msg: message,
          err: err,
          log_type: log.types.url.ERROR,
        }, "URL not found in queue message JSON.");
      }//if-else

      message.finish();
    }//if-else
  });
}//listen_to_urls_received


module.exports = {
  start: start,
};//module.exports
