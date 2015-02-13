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

// application's logging types
var log_types = {};

// QUEUE events
log_types.queue = {};

// QUEUE writer events
log_types.queue.writer = {
  READY  : 'queue_writer_ready',
  ERROR  : 'queue_writer_error',
  CLOSED : 'queue_writer_closed',
};//log_types.queue

// QUEUE reader events
log_types.queue.reader = {
  ERROR                : 'queue_reader_error',
  MESSAGE              : 'queue_reader_message',
  NSQD_CLOSED          : 'queue_reader_nsqd_closed',
  NSQD_CONNECTED       : 'queue_reader_nsqd_connected',
  MESSAGE_ERROR        : 'queue_reader_message_error',
  INVALID_CHANNEL_NAME : 'queue_reader_invalid_channel_name'
};//log_types.queue.reader

// QUEUE message events
log_types.queue.message = {
  PUBLISHED    : 'queue_message_published',
  FINISH_ERROR : 'queue_message_finish_error',
};//log_types.queue.message

// WEBSOCKET events
log_types.websockets = {};

// WEBSOCKET server events
log_types.websockets.server = {
  LISTENING         : 'websockets_server_listening',
  EMITTED_TO_CLIENT : 'websockets_server_emitted_to_client'
};//log_types.websockets.server

// WEBSOCKET client events
log_types.websockets.client = {
  CONNECTED    : 'websockets_connection_from_client',
  DISCONNECTED : 'websockets_disconnection_from_client',
  MESSAGE      : 'websockets_client_message',
  URL_ERROR    : 'websockets_url_processing_error'
};//log_types.websockets.client

// webhook events
log_types.webhook = {
  URL_ERROR   : 'webhook_url_processing_error',
  GOOGLE_NEWS : 'webhook_googlenews',
};//log_types.kimono

// READABILITY events
log_types.readability = {
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
};//log_types.readability

// OPENCALAIS events
log_types.opencalais = {
  JSON_PARSE_ERROR        : 'opencalais_json_parse_error',
  EMPTY_OBJECT            : 'opencalais_empty_object',
  URL_NOT_IN_READABILITY  : 'opencalais_url_not_in_readability_object',
  TEXT_NOT_IN_READABILITY : 'opencalais_text_not_in_readability_object',
  URL_NOT_IN_DB           : 'opencalais_not_in_datastore',
  FETCHED_API             : 'opencalais_api_fetch',
  API_ERROR               : 'opencalais_api_error',
  EMPTY_DATE_PUBLISHED    : 'opencalais_empty_date_published',
  EMPTY_URL               : 'opencalais _empty_url',
};//log_types.opencalais

// DATASTORE events
log_types.datastore = {
  FETCHED_URL           : 'datastore_fetched_url',
  INSERT_ERROR          : 'datastore_insert_error',
  EMPTY_DOMAIN          : 'datastore_empty_domain',
  EMPTY_AUTHOR          : 'datastore_empty_author',
  EMPTY_OBJECT          : 'datastore_empty_object',
  DATE_CONVERSION_ERROR : 'datastore_date_conversion_error',
  JSON_PARSE_ERROR      : 'datastore_json_parse_error',
  GENERIC_ERROR         : 'datastore_generic_error',
};//log_types.datastore

// ELASTICSEARCH events
log_types.elasticsearch = {
  INDEXED_URL : 'elasticsearch_indexed_url',
  INDEX_ERROR : 'elasticsearch_index_error',
  EMPTY_URL   : 'elasticsearch _empty_url',
};//log_typpes.elasticsearch

// ENTITIES events
log_types.entities = {
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
};//log_types.entities

// RATELIMITER events
log_types.ratelimiter = {
  RATE_LIMITING_APP  : 'ratelimiter_app_being_ratelimited',
  CONFIG_NOT_FOUND   : 'ratelimiter_config_not_found',
  FALLBACK_NOT_FOUND : 'ratelimiter_fallback_not_found',
};//log_types.ratelimiter


module.exports = log_types;
