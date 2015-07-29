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

// var queue = require('_/util/queue.js');
// var topics = queue.topics;

var config = require('config').get('twitter');
var Twitter = require('twit');
var metrics = require('_/util/metrics.js');

var user_streams = require('./user-streams.js');
// var public_streams = require('./public-streams.js');

var tweet_utils = require('./tweet-utils.js');

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

    user_streams.start(client, function(err, tweet) {
      if(err) {
        log.error({
          err: err,
        }, 'Error getting tweet from User Stream');

      } else {
        process_tweet(tweet);

      }//if-else
    });//user_streams

    // public_streams.start(client, function(err, tweet)  {
    //   if(err) {
    //     log.error({
    //       err: err,
    //     }, 'Error getting tweet from Public Stream');
    //
    //   } else {
    //     process_tweet(tweet);
    //
    //   }//if-else
    // });//public_streams

  } else{

    log.info({
      log_type : log.types.twitter.INFO,
    }, 'Twitter is DISABLED.');

  }//if-else
}//start()


function process_tweet(tweet) {
  if(!(tweet) || !(tweet.entities)) {
    log.error({
      tweet: tweet,
    }, 'Error. Empty Tweet entities.');

    return;
  }//if-else

  // URLS
  var url_options = ['expanded_url'];
  var urls = tweet_utils.extract_urls(tweet, url_options);
  var url = urls[0]['expanded_url'];

  // HASHTAGS
  var hashtags = tweet_utils.extract_hashtags(tweet);

  // fetch URL data and reply to tweet
  tweet_utils.get_url_tags(url, function(err, res)  {
    if(err) {
      log.error({
        err: err,
      }, 'Error fetching data on tweet url(s)');

    } else {
      log.info({
        url: url,
        data: res,
      }, 'Data from url in tweet');
      
      tweet_utils.reply_to_tweet(tweet, res);

    }//if-else
  });//get_url_tags

}//process_tweet()


module.exports = {
  start: start,
};//module.exports
