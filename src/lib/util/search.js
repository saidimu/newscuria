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

var appname = "search";
var log = require('_/util/logging.js')(appname);

// FIXME: hook-up bunyan logger: http://www.elasticsearch.org/guide/en/elasticsearch/client/javascript-api/current/logging.html
var search_api = require('_/util/search-api.js');
var client = search_api.client;

var config = require('config');

var queue = require('_/util/queue.js');
var topics = queue.topics;

var hash = require('string-hash');

var ratelimiter = require('_/util/limitd.js');
var metrics = require('_/util/metrics.js');

var topics_and_indices = {};
topics_and_indices[topics.ENTITIES_PEOPLE]    = "people";
topics_and_indices[topics.ENTITIES_PLACES]    = "places";
topics_and_indices[topics.ENTITIES_COMPANIES] = "companies";
topics_and_indices[topics.ENTITIES_THINGS]    = "things";
topics_and_indices[topics.ENTITIES_EVENTS]    = "events";
topics_and_indices[topics.ENTITIES_RELATIONS] = "relations";
topics_and_indices[topics.ENTITIES_TOPICS]    = "topics";
topics_and_indices[topics.ENTITIES_TAGS]      = "tags";


function start()    {
  // connect to the message queue
  queue.connect(listen_to_entities);
}//start()


function listen_to_entities()  {
  var channel = 'index-to-elasticsearch';

  var onReadMessage = function (err, json, message, topic) {
    if(!err) {
      process_entities_message(json, message, topic);
    }//if
  };//onReadMessage

  // dynamically listen to a bunch of topics
  // FIXME: listen to wildcard topics when NSQD supports that.
  for(var topic in topics_and_indices)  {
    if(topics_and_indices.hasOwnProperty(topic)) {
      queue.read_message(topic, channel, function (err, json, message) {
        onReadMessage(err, json, message, topic);
      });
    }//if
  }//for

}//listen_to_entities


function process_entities_message(json, message, topic)  {
    var doc_type = topics_and_indices[topic];

    var url = json.url || '';
    if(url) {

      index_entity(doc_type, url, json, message);

    } else {

      // FIXME: publish to a special queue for further analysis?
      log.error({
        doc_type: doc_type,
        msg_body: json,
        log_type: log.types.elasticsearch.EMPTY_URL,
      }, 'Empty URL in NLP entity object');

      metrics.histogram(metrics.types.elasticsearch.EMPTY_URL, 1);

      message.finish();

    }//if-else
}//process_entities_message


function index_entity(doc_type, url, body, message) {
  var id = hash(url);

  // https://github.com/auth0/limitd
  var limit_options = {
    bucket: appname,
    // key: 1, // TODO: FIXME: os.hostname()?
    num_tokens: 1,
  };//options

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

    } else {

      // TODO: Perform multiple index operations in a single API call.
      // http://www.elasticsearch.org/guide/en/elasticsearch/client/javascript-api/current/api-reference-1-3.html#api-bulk-1-3
      client.create({
        index: 'nuzli',
        type: doc_type,
        id: id,
        body: body,
        ignore: [409],  // ignore 'error' if document already exists
      }, function(err, response)  {

        if(err) {

          log.error({
            id: id,
            doc_type: doc_type,
            body: body,
            err: err,
            log_type: log.types.elasticsearch.INDEX_ERROR,
            response: response,
          }, 'Elasticsearch index error.');

          metrics.histogram(metrics.types.elasticsearch.INDEX_ERROR, 1);

          message.requeue();

        } else {

          log.info({
            doc_type: doc_type,
            log_type: log.types.elasticsearch.INDEXED_URL,
          }, 'Indexed url to Elasticsearch.');

          metrics.histogram(metrics.types.elasticsearch.INDEXED_URL, 1);
          
          message.finish();

        }//if-else
      });//client.create

    }//if-else (expected_wait_time)

  };//rateLimitCallback


  // rate-limit this app
  ratelimiter.limit_app(limit_options, rateLimitCallback);

}//index_entity


module.exports = {
  start: start,
};//module.exports
