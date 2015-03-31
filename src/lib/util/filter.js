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

var ratelimiter = require('_/util/limitd.js');
var metrics = require('_/util/metrics.js');

function start()    {
  // connect to the message queue
  queue.connect(listen_to_urls_received);
}//start()


function listen_to_urls_received()  {
  var topic = topics.URLS_RECEIVED;
  var channel = "filter-unwanted-urls";

  // https://github.com/auth0/limitd
  var limit_options = {
    bucket: appname,
    // key: 1, // TODO: FIXME: os.hostname()?
    num_tokens: 1,
  };//options

  queue.read_message(topic, channel, function onReadMessage(err, json, message) {
    if(!err) {
      var url = json.url || '';

      if(url) {

        var rateLimitCallback = function(expected_wait_time) {
          if(expected_wait_time)  {
            log.info({
              bucket: limit_options.bucket,
              key: limit_options.key,
              num_tokens: limit_options.num_tokens,
              expected_wait_time: expected_wait_time,
              log_type: log.types.limitd.EXPECTED_WAIT_TIME,
            }, "Rate-limited! Re-queueing message for %s seconds.", expected_wait_time);

            // now backing-off to prevent other messages from being pushed from the server
            // initially wasn't backing-off to prevent "punishment" by the server
            // https://groups.google.com/forum/#!topic/nsq-users/by5PqJsgFKw
            message.requeue(expected_wait_time, true);
            metrics.store(log.types.limitd.EXPECTED_WAIT_TIME, expected_wait_time);

          } else {

            queue.publish_message(topics.URLS_APPROVED, {
              url: url
            });//queue.publish_message

          }//if-else
        };//rateLimitCallback

        ratelimiter.limit_app(limit_options, rateLimitCallback);

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

        metrics.store(log.types.url.ERROR, 1);

      }//if-else

      message.finish();
    }//if-else
  });
}//listen_to_urls_received


module.exports = {
  start: start,
};//module.exports
