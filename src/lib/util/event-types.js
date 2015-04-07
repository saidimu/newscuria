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
var event_types = {};

module.exports = event_types;

// QUEUE events
event_types.queue = {};

// QUEUE writer events
event_types.queue.writer = {
  READY  : 'queue.writer.ready',
  ERROR  : 'queue.writer.error',
  CLOSED : 'queue.writer.closed',
};//event_types.queue

// QUEUE reader events
event_types.queue.reader = {
  ERROR                : 'queue.reader.error',
  MESSAGE              : 'queue.reader.message',
  NSQD_CLOSED          : 'queue.reader.nsqd.closed',
  NSQD_CONNECTED       : 'queue.reader.nsqd.connected',
  MESSAGE_ERROR        : 'queue.reader.error.message',
  INVALID_CHANNEL_NAME : 'queue.reader.channel.error.invalid_name'
};//event_types.queue.reader

// QUEUE message events
event_types.queue.message = {
  PUBLISHED    : 'queue.message.published',
  FINISH_ERROR : 'queue.message.error.finish',
};//event_types.queue.message

// WEBSOCKET events
event_types.websockets = {};

// WEBSOCKET server events
event_types.websockets.server = {
  LISTENING         : 'websockets.server.listening',
  EMITTED_TO_CLIENT : 'websockets.server.emitted_to_client'
};//event_types.websockets.server

// WEBSOCKET client events
event_types.websockets.client = {
  CONNECTED    : 'websockets.client.connection',
  DISCONNECTED : 'websockets.client.disconnection',
  MESSAGE      : 'websockets.client.message',
  URL_ERROR    : 'websockets.client.error.url_processing'
};//event_types.websockets.client

// webhook events
event_types.webhook = {
  URL_ERROR   : 'webhook.error.url_processing',
  GOOGLE_NEWS : 'webhook.googlenews',
};//event_types.kimono

// READABILITY events
event_types.readability = {
  FETCHED_URL          : 'readability.url.fetched',
  JSON_PARSE_ERROR     : 'readability.error.json_parse',
  EMPTY_PLAINTEXT      : 'readability.error.empty_plaintext',
  EMPTY_OBJECT         : 'readability.error.empty_object',
  URL_NOT_IN_DB        : 'readability.error.not_in_datastore',
  FETCHED_API          : 'readability.api.fetch',
  API_ERROR            : 'readability.api.error',
  EMPTY_DATE_PUBLISHED : 'readability.error.empty_date_published',
  EMPTY_AUTHOR         : 'readability.error.empty_author',
  EMPTY_DOMAIN         : 'readability.error.empty_domain',
};//event_types.readability

// OPENCALAIS events
event_types.opencalais = {
  JSON_PARSE_ERROR        : 'opencalais.error.json_parse',
  EMPTY_OBJECT            : 'opencalais.error.empty_object',
  URL_NOT_IN_READABILITY  : 'opencalais.error.url_not_in_readability',
  TEXT_NOT_IN_READABILITY : 'opencalais.error.text_not_in_readability',
  URL_NOT_IN_DB           : 'opencalais.error.not_in_datastore',
  FETCHED_API             : 'opencalais.api.fetch',
  API_ERROR               : 'opencalais.api.error',
  EMPTY_DATE_PUBLISHED    : 'opencalais.error.empty_date_published',
  EMPTY_URL               : 'opencalais.error.empty_url',
};//event_types.opencalais

// DATASTORE events
event_types.datastore = {
  FETCHED_URL           : 'datastore.url.fetched',
  INSERT_ERROR          : 'datastore.error.insert',
  EMPTY_DOMAIN          : 'datastore.error.empty_domain',
  EMPTY_AUTHOR          : 'datastore.error.empty_author',
  EMPTY_OBJECT          : 'datastore.error.empty_object',
  DATE_CONVERSION_ERROR : 'datastore.error.date_conversion',
  JSON_PARSE_ERROR      : 'datastore.error.json_parse',
  GENERIC_ERROR         : 'datastore.error.generic',
};//event_types.datastore

// ELASTICSEARCH events
event_types.elasticsearch = {
  INDEXED_URL : 'elasticsearch.url.indexed',
  INDEX_ERROR : 'elasticsearch.index.error',
  EMPTY_URL   : 'elasticsearch.error.empty_url',
};//log_typpes.elasticsearch

// ENTITIES events
event_types.entities = {
  PEOPLE                : 'entities.people',
  PLACES                : 'entities.places',
  COMPANIES             : 'entities.companies',
  THINGS                : 'entities.things',
  EVENTS                : 'entities.events',
  RELATIONS             : 'entities.relations',
  TOPICS                : 'entities.topics',
  TAGS                  : 'entities.tags',
  LANGUAGE              : 'entities.lang_',
  UNDEFINED_NLP_OBJECT  : 'entities.error.undefined_nlp_object',
  EMPTY_DATE_PUBLISHED  : 'entities.error.empty_date_published',
  URL_NOT_IN_OPENCALAIS : 'entities.error.url_not_in_opencalais',
};//event_types.entities

// RATELIMITER events
event_types.ratelimiter = {
  RATE_LIMITING_APP  : 'ratelimiter.app_being_ratelimited',
  CONFIG_NOT_FOUND   : 'ratelimiter.error.config_not_found',
  FALLBACK_NOT_FOUND : 'ratelimiter.error.fallback_not_found',
};//event_types.ratelimiter

// TWITTER events
event_types.twitter = {
  STREAM_INFO: 'twitter.stream.info',
  STREAM_ERROR: 'twitter.stream.error',
};//event_types.twitter

// LIMITD events
event_types.limitd = {
  TOKEN_GET_ERROR       : 'limitd.token.error.get',
  TOKEN_REQUEST_TOO_BIG : 'limitd.token.error.request_too_big',
  EXPECTED_WAIT_TIME    : 'limitd.expected_wait_time'
};//event_types.limitd

// METRIC events
event_types.metrics = {
  AVAILABLE_HOSTS: 'metrics.available_hosts',
  STORE_ERROR    : 'metrics.error.store',
  METRICS_ERROR  : 'metrics.error.invalid',
};//event_types.metrics
