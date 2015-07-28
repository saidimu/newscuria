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

var appname = "twitter";
var log = require('_/util/logging.js')(appname);

var queue = require('_/util/queue.js');
var topics = queue.topics;

var config = require('config').get('twitter');
var Twitter = require('twit');
var metrics = require('_/util/metrics.js');

var CONSUMER_KEY        = config.get('consumer_key');
var CONSUMER_SECRET     = config.get('consumer_secret');
var ACCESS_TOKEN_KEY    = config.get('access_token_key');
var ACCESS_TOKEN_SECRET = config.get('access_token_secret');

var client = new Twitter({
  consumer_key        : CONSUMER_KEY,
  consumer_secret     : CONSUMER_SECRET,
  access_token        : ACCESS_TOKEN_KEY,
  access_token_secret : ACCESS_TOKEN_SECRET,
});


function start()    {
  if(config.get('enabled')) { // only run if config file allows

    user_streams();
    public_streams();

  } else{

    log.info({
      log_type : log.types.twitter.INFO,
    }, 'Twitter is DISABLED.');

  }//if-else
}//start()


function user_streams() {
  var user_streams_config = config.get('user_streams');

  // only run if config file allows
  if(!user_streams_config.get('enabled')) {

    log.info({
      log_type : log.types.twitter.USER_STREAMS,
    }, 'Twitter User Streams is DISABLED.');

    return;
  }//if-else

  var ENDPOINT     = user_streams_config.get('endpoint');
  var FILTER_LEVEL = user_streams_config.get('filter_level');
  var LANGUAGE     = user_streams_config.get('language');
  var WITH         = user_streams_config.get('with');
  var REPLIES      = user_streams_config.get('replies');
  var STRING_IDS   = user_streams_config.get('stringify_friend_ids');

  log.info({
    log_type            : log.types.twitter.USER_STREAMS,
    endpoint            : ENDPOINT,
    filter_level        : FILTER_LEVEL,
    language            : LANGUAGE,
    with                : WITH,
    replies             : REPLIES,
    stringify_friend_ids: STRING_IDS
  }, 'Twitter User Streams is ENABLED.');

  var options = {
    filter_level        : FILTER_LEVEL,
    language            : LANGUAGE,
    with                : WITH,
    replies             : REPLIES,
    stringify_friend_ids: STRING_IDS
  };//options

  var stream = client.stream(ENDPOINT, options);

  stream.on('message', function(message) {

    log.info(message);

  });//stream.on('data')

  stream.on('error', function(err) {
    log.info({
      err          : err,
      log_type     : log.types.twitter.STREAM_ERROR,
      endpoint     : ENDPOINT,
      options: options,
    }, 'Twitter User Streams error.');

  });//stream.on('error')

}//user_streams()



function public_streams() {
  var public_streams_config = config.get('public_streams');

  // only run if config file allows
  if(!public_streams_config.get('enabled')) {

    log.info({
      log_type : log.types.twitter.PUBLIC_STREAMS,
    }, 'Twitter Public Streams is DISABLED.');

    return;
  }//if-else

  var ENDPOINT     = public_streams_config.get('endpoint');
  var FILTER_LEVEL = public_streams_config.get('filter_level');
  var LANGUAGE     = public_streams_config.get('language');
  var TRACK_TERMS  = public_streams_config.get('track');

  var options = {
    track: TRACK_TERMS,
    language: LANGUAGE,
    filter_level: FILTER_LEVEL,
  };//options

  log.info({
    log_type     : log.types.twitter.PUBLIC_STREAMS,
    endpoint     : ENDPOINT,
    options: options,
  }, 'Twitter Public Streams is ENABLED.');

  var stream = client.stream(ENDPOINT, options);

  stream.on('tweet', function(tweet) {

    metrics.meter(metrics.types.twitter.TWEET_RECEIVED, {
      filter_level      : FILTER_LEVEL,
      language          : LANGUAGE,
      track_terms       : TRACK_TERMS,
    });

    process_tweet(tweet);

  });//stream.on('data')

  stream.on('error', function(err) {
    log.info({
      err          : err,
      log_type     : log.types.twitter.STREAM_ERROR,
      endpoint     : ENDPOINT,
      options: options,
    }, 'Twitter Public Streams error.');

    metrics.meter(metrics.types.twitter.STREAM_ERROR, {
      filter_level      : FILTER_LEVEL,
      language          : LANGUAGE,
      track_terms       : TRACK_TERMS,
    });

  });//stream.on('error')

}//public_streams()


function process_tweet(tweet) {
  tweet.entities.urls.forEach(function(url_object)  {
    var url = url_object.expanded_url || "";
    if(url) {
      queue.publish_message(topics.URLS_RECEIVED, {
        url: url
      });//queue.publish_message
    }//if
  });//tweet.forEach
}//process_tweet()


module.exports = {
  start: start,
};//module.exports
