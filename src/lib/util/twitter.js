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
var Twitter = require('twat');

var CONSUMER_KEY        = config.get('consumer_key');
var CONSUMER_SECRET     = config.get('consumer_secret');
var ACCESS_TOKEN_KEY    = config.get('access_token_key');
var ACCESS_TOKEN_SECRET = config.get('access_token_secret');
var STREAMING_ENDPOINT  = config.get('streaming_endpoint');
var FILTER_LEVEL        = config.get('filter_level');
var LANGUAGE            = config.get('language');
var TRACK_TERMS         = config.get('track');

var client = new Twitter({
  consumer_key        : CONSUMER_KEY,
  consumer_secret     : CONSUMER_SECRET,
  access_token        : ACCESS_TOKEN_KEY,
  access_token_secret : ACCESS_TOKEN_SECRET,
});


function start()    {
  stream();
}//start()


function stream() {
  var options = {
    track: TRACK_TERMS,
    language: LANGUAGE,
    filter_level: FILTER_LEVEL,
  };//options

  client.stream(STREAMING_ENDPOINT, options, function(stream)  {
    stream.on('tweet', function(tweet) {
      process_tweet(tweet);
    });//stream.on('data')

    stream.on('error', function(err) {
      log.info({
        err: err,
        log_type: log.types.twitter.STREAM_ERROR,
        streaming_endpoint: STREAMING_ENDPOINT,
        options: options,
      }, 'Twitter Streaming error.');
    });//stream.on('error')
  });//client.stream

}//stream


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
