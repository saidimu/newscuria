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
  MESSAGE_RECEIVED     : 'queue.reader.message.received',
  NSQD_CLOSED          : 'queue.reader.nsqd.closed',
  NSQD_CONNECTED       : 'queue.reader.nsqd.connected',
  MESSAGE_ERROR        : 'queue.reader.message.error',
  INVALID_CHANNEL_NAME : 'queue.reader.channel.name.invalid'
};//event_types.queue.reader

// QUEUE message events
event_types.queue.message = {
  PUBLISHED          : 'queue.message.published',
  FINISH_ERROR       : 'queue.message.finish.error',
  PROCESSING_ATTEMPTS: 'queue.message.processing.num_attempts'
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
  URL_ERROR    : 'websockets.client.url.processing.error'
};//event_types.websockets.client

// webhook events
event_types.webhook = {
  URL_ERROR   : 'webhook.url.processing.error',
  GOOGLE_NEWS : 'webhook.googlenews',
};//event_types.kimono

// READABILITY events
event_types.readability = {
  FETCHED_URL          : 'readability.url.fetched',
  JSON_PARSE_ERROR     : 'readability.json.parse.error',
  EMPTY_PLAINTEXT      : 'readability.plaintext.empty',
  EMPTY_OBJECT         : 'readability.object.empty',
  URL_NOT_IN_DB        : 'readability.url.datastore.not_found',
  FETCHED_API          : 'readability.api.fetch',
  API_ERROR            : 'readability.api.error',
  EMPTY_DATE_PUBLISHED : 'readability.date.published.empty',
  EMPTY_AUTHOR         : 'readability.author.empty',
  EMPTY_DOMAIN         : 'readability.domain.empty',
  EMPTY_URL            : 'readability.url.empty',
};//event_types.readability

// OPENCALAIS events
event_types.opencalais = {
  JSON_PARSE_ERROR        : 'opencalais.json.parse.error',
  EMPTY_OBJECT            : 'opencalais.object.empty',
  URL_NOT_IN_READABILITY  : 'opencalais.url.readability.not_found',
  TEXT_NOT_IN_READABILITY : 'opencalais.text.readability.not_found',
  URL_NOT_IN_DB           : 'opencalais.url.datastore.not_found',
  FETCHED_API             : 'opencalais.api.fetch',
  API_ERROR               : 'opencalais.api.error',
  EMPTY_DATE_PUBLISHED    : 'opencalais.date.published.empty',
  EMPTY_URL               : 'opencalais.url.empty',
};//event_types.opencalais

// DATASTORE events
event_types.datastore = {
  FETCHED_URL           : 'datastore.url.fetched',
  INSERT_ERROR          : 'datastore.insert.error',
  EMPTY_DOMAIN          : 'datastore.domain.empty',
  EMPTY_AUTHOR          : 'datastore.author.empty',
  EMPTY_OBJECT          : 'datastore.object.empty',
  DATE_CONVERSION_ERROR : 'datastore.date.conversion.error',
  JSON_PARSE_ERROR      : 'datastore.json.parse.error',
  GENERIC_ERROR         : 'datastore.generic.error',
};//event_types.datastore

// ELASTICSEARCH events
event_types.elasticsearch = {
  INDEX_OK         : 'elasticsearch.url.index.ok',
  BULK_INDEX_OK    : 'elasticsearch.url.index.bulk.ok',
  INDEX_ERROR      : 'elasticsearch.index.error',
  BULK_INDEX_ERROR : 'elasticsearch.index.bulk.error',
  SEARCH_ERROR     : 'elasticsearch.search.error',
  EMPTY_URL        : 'elasticsearch.url.empty',
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
  LANGUAGE              : 'entities.lang.',
  UNDEFINED_NLP_OBJECT  : 'entities.nlp_object.undefined',
  EMPTY_DATE_PUBLISHED  : 'entities.date.published.empty',
  URL_NOT_IN_OPENCALAIS : 'entities.url.opencalais.not_found',
};//event_types.entities

// RATELIMITER events
event_types.ratelimiter = {
  RATE_LIMITING_APP  : 'ratelimiter.app.rate_limited',
  CONFIG_NOT_FOUND   : 'ratelimiter.config.not_found.error',
  FALLBACK_NOT_FOUND : 'ratelimiter.fallback.not_found.error',
};//event_types.ratelimiter

// TWITTER events
event_types.twitter = {
  INFO           : 'twitter',
  TWEET_RECEIVED : 'twitter.tweet.received',
  USER_STREAMS   : 'twitter.streaming.user',
  PUBLIC_STREAMS : 'twitter.streaming.public',
  STREAM_ERROR   : 'twitter.stream.error',
};//event_types.twitter

// LIMITD events
event_types.limitd = {
  TOKEN_GET_ERROR       : 'limitd.request.token.get.error',
  TOKEN_REQUEST_TOO_BIG : 'limitd.request.token.too_big',
  EXPECTED_WAIT_TIME    : 'limitd.request.wait_time.expected',
  CONFORMANT_REQUEST    : 'limitd.request.conformant',
};//event_types.limitd

// METRIC events
event_types.metrics = {
  AVAILABLE_HOSTS: 'metrics.hosts.available',
  STORE_ERROR    : 'metrics.store.error',
  METRICS_ERROR  : 'metrics.generic.error',
};//event_types.metrics
