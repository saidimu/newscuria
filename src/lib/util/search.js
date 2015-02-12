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

var queue = require('_/util/queue.js');
var topics = queue.topics;

var hash = require('string-hash');

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

  var onReadMessage = function (err, json, message) {
    if(!err) {
      process_entities_message(json, message);
    }//if
  };//onReadMessage

  // dynamically listen to a bunch of topics
  // FIXME: listen to wildcard topics when NSQD supports that.
  for(var topic in topics_and_indices)  {
    if(topics_and_indices.hasOwnProperty(topic)) {
      queue.read_message(topic, channel, onReadMessage);
    }//if
  }//for

}//listen_to_entities


function process_entities_message(json, message)  {
  for(var topic in topics_and_indices)  {
    if(topics_and_indices.hasOwnProperty(topic)) {
      var doc_type = topics_and_indices[topic];

      var url = json.url || '';
      if(url) {

        index_entity(doc_type, url, json);

      } else {

        log.error({
          doc_type: doc_type,
          msg_body: json,
          log_type: log.types.elasticsearch.EMPTY_URL,
        }, 'Empty URL in NLP entity object');

      }//if-else

    }//if
  }//for

  message.finish();
}//process_entities_message


function index_entity(doc_type, url, body) {
  var id = hash(url);

  log.info({
    doc_type: doc_type,
    log_type: log.types.elasticsearch.INDEXED_URL,
  }, 'Indexed url to Elasticsearch.');

  client.index({
    index: 'nuzli',
    type: doc_type,
    id: id,
    body: body,
  }, function(err, response)  {
    if(err) {
      log.error({
        id: id,
        doc_type: doc_type,
        err: err,
        log_type: log.types.elasticsearch.INDEX_ERROR,
        response: response,
      }, 'Elasticsearch index error.');
    }//if
  });//client.index
}//index_entity


module.exports = {
  start: start,
};//module.exports
