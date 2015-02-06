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

var appname = "mixpanel";
var log = require('_/util/logging.js')(appname);

var config = require('config').get("mixpanel");

var MIXPANEL_TOKEN = config.get('token');

// grab the Mixpanel factory
var Mixpanel = require('mixpanel');

// create an instance of the mixpanel client
var mixpanel = Mixpanel.init(MIXPANEL_TOKEN);

// application's mixpanel events
var event_type = {};

// QUEUE events
event_type.queue = {};

// QUEUE writer events
event_type.queue.writer = {
  READY  : 'queue_writer_ready',
  ERROR  : 'queue_writer_error',
  CLOSED : 'queue_writer_closed',
};//event_type.queue

// QUEUE reader events
event_type.queue.reader = {
  ERROR                : 'queue_reader_error',
  MESSAGE              : 'queue_reader_message',
  NSQD_CLOSED          : 'queue_reader_nsqd_closed',
  NSQD_CONNECTED       : 'queue_reader_nsqd_connected',
  MESSAGE_ERROR        : 'queue_reader_message_error',
  INVALID_CHANNEL_NAME : 'queue_reader_invalid_channel_name'
};//event_type.queue.reader

// QUEUE message events
event_type.queue.message = {
  PUBLISHED    : 'queue_message_published',
  FINISH_ERROR : 'queue_message_finish_error',
};//event_type.queue.message

// WEBSOCKET events
event_type.websockets = {};

// WEBSOCKET server events
event_type.websockets.server = {
  LISTENING         : 'websockets_server_listening',
  EMITTED_TO_CLIENT : 'websockets_server_emitted_to_client'
};//event_type.websockets.server

// WEBSOCKET client events
event_type.websockets.client = {
  CONNECTED    : 'websockets_connection_from_client',
  DISCONNECTED : 'websockets_disconnection_from_client',
  MESSAGE      : 'websockets_client_message',
};//event_type.websockets.client

// URL processing events
event_type.url = {
  ERROR : 'url_processing_error'
};//event_type.url

// KIMONO webhook events
event_type.kimono = {
  WEBHOOK : 'kimono_webhook',
};//event_type.kimono

// READABILITY events
event_type.readability = {
  FETCHED_URL          : 'readability_fetched_url',
  JSON_PARSE_ERROR     : 'readability_json_parse_error',
  EMPTY_PLAINTEXT      : 'readability_empty_plaintext',
  EMPTY_OBJECT         : 'readability_empty_object',
  URL_NOT_IN_DB        : 'readability_not_in_datastore',
  FETCHED_API          : 'readability_api_fetch',
  API_ERROR            : 'readability_api_error',
  EMPTY_DATE_PUBLISHED : 'readability_empty_date_published',
  EMPTY_AUTHOR         : 'readability_empty_author',
  EMPTY_DOMAIN         : 'readability_empty_domain',
};//event_type.readability

// OPENCALAIS events
event_type.opencalais = {
  JSON_PARSE_ERROR        : 'opencalais_json_parse_error',
  EMPTY_OBJECT            : 'opencalais_empty_object',
  URL_NOT_IN_READABILITY  : 'opencalais_url_not_in_readability_object',
  TEXT_NOT_IN_READABILITY : 'opencalais_text_not_in_readability_object',
  URL_NOT_IN_DB           : 'opencalais_not_in_datastore',
  FETCHED_API             : 'opencalais_api_fetch',
  API_ERROR               : 'opencalais_api_error',
  EMPTY_DATE_PUBLISHED    : 'opencalais_empty_date_published',
  EMPTY_URL               : 'opencalais _empty_url',
};//event_type.opencalais

// DATASTORE events
event_type.datastore = {
  FETCHED_URL           : 'datastore_fetched_url',
  INSERT_ERROR          : 'datastore_insert_error',
  EMPTY_DOMAIN          : 'datastore_empty_domain',
  EMPTY_AUTHOR          : 'datastore_empty_author',
  EMPTY_OBJECT          : 'datastore_empty_object',
  DATE_CONVERSION_ERROR : 'datastore_date_conversion_error',
  JSON_PARSE_ERROR      : 'datastore_json_parse_error',
  GENERIC_ERROR         : 'datastore_generic_error',
};//event_type.datastore

// ENTITIES events
event_type.entities = {
  PEOPLE                : 'entities_people',
  PLACES                : 'entities_places',
  COMPANIES             : 'entities_companies',
  THINGS                : 'entities_things',
  EVENTS                : 'entities_events',
  RELATIONS             : 'entities_relations',
  TOPICS                : 'entities_topics',
  TAGS                  : 'entities_tags',
  LANGUAGE              : 'entities_lang_',
  UNDEFINED_NLP_OBJECT  : 'entities_undefined_nlp_object',
  EMPTY_DATE_PUBLISHED  : 'entities_empty_date_published',
  URL_NOT_IN_OPENCALAIS : 'entities_url_not_in_opencalais_object',
};//event_type.entities


function track(event, data) {
  var callback = function(err) {
    if (err) {
      log.error({
        err: err,
        event: event,
        data: data
      }, "Error tracking Mixpanel event.");
    }//if
  };//callback

  if(data)  {
    mixpanel.track(event, data, callback);
  } else {
    mixpanel.track(event, callback);
  }//if-else
}//track

module.exports = {
  event_type: event_type,
  track: track,
};
