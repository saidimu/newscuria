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

var appname = "augment_readability";
var log = require('_/util/logging.js')(appname);

var queue = require('_/util/queue.js');
var topics = queue.topics;

var ratelimiter = require('_/util/limitd.js');
var metrics = require('_/util/metrics.js');
var urls = require('_/util/urls.js');

var util = require('util');

var weasel = require('weasel-words');

function start()    {
  // connect to the message queue
  queue.connect(listen_to_readability);
}//start()


function listen_to_readability()  {
  var topic = topics.READABILITY;
  var channel = "augment-readability-plaintext";

  // https://github.com/auth0/limitd
  var limit_options = {
    bucket: appname,
    // key: 1, // TODO: FIXME: os.hostname()?
    num_tokens: 1,
  };//options

  queue.read_message(topic, channel, function onReadMessage(err, json, message) {

      metrics.meter(metrics.types.queue.reader.MESSAGE_RECEIVED, {
        topic  : topic,
        channel: channel,
        app    : appname,
      });

    if(!err) {

      ratelimiter.limit_app(limit_options, function(expected_wait_time) {
        if(expected_wait_time)  {
          // now backing-off to prevent other messages from being pushed from the server
          // initially wasn't backing-off to prevent "punishment" by the server
          // https://groups.google.com/forum/#!topic/nsq-users/by5PqJsgFKw
          message.requeue(expected_wait_time, true);

        } else {

          process_readability_message(json, message);

        }//if-else

      });//ratelimiter.limit_app

    }//if
  });
}//listen_to_readability


function process_readability_message(json, message)	{
  augment_readability_plaintext(json, message.finish, message.requeue);

  // message.finish();
}//process_readability_message


function augment_readability_plaintext(json, finish, requeue)	{
  var readability = json;

  var url = readability.url || '';
	var text = readability.text || readability.plaintext;

	if(!url)	{
		log.error({
      url: url,
      log_type: log.types.opencalais.URL_NOT_IN_READABILITY,
    }, "EMPTY url in Readability object. Cannot augment plaintext.");

    metrics.meter(metrics.types.opencalais.URL_NOT_IN_READABILITY, {
      url_host: urls.parse(url).hostname,
    });

    finish();
		return;
	}//if

  if(!text)	{
    log.error({
      url: url,
      log_type: log.types.opencalais.TEXT_NOT_IN_READABILITY,
    }, "EMPTY text in Readability object. Cannot augment plaintext.");

    metrics.meter(metrics.types.opencalais.TEXT_NOT_IN_READABILITY, {
      url_host: urls.parse(url).hostname,
    });

    finish();
    return;
  }//if

  var problems = weasel(text);
  var snippet_padding = 50;
  problems.forEach(function(problem) {
    var calculated_start_index = problem.index - snippet_padding;
    var start_index = (calculated_start_index  >= 0) ? calculated_start_index : 0;

    var calculated_end_index = problem.index + problem.offset + snippet_padding;
    var end_index = (calculated_end_index  <= text.length) ? calculated_end_index : text.length;

    problem.snippet = '...' + text.slice(start_index, end_index) + '...';
    problem.instance = text.slice(problem.index, problem.index+problem.offset);

    console.log(problem);
  });//problems.forEach


  readability.weasel_words = problems;

  queue.publish_message(topics.AUGMENTED_READABILITY, readability);
  // process_augmented_readability_object(augmented_readability);

}//augment_readability_plaintext


// function process_augmented_readability_object(augmented) {
//
//   // publish augmented object
//   queue.publish_message(topics.AUGMENTED_READABILITY, augmented);
// }//process_augmented_readability_object


module.exports = {
  start: start,
};//module.exports
