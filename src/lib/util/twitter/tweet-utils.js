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

var request = require('superagent');

function get_urls(tweet, options)  {
  var extracted_urls = [];

  if(!(tweet) || !(tweet.entities) || !(tweet.entities.urls)) {
    return extracted_urls;
  }//if-else

  // a valid list of keys in a tweet url object
  // https://dev.twitter.com/overview/api/entities-in-twitter-objects#urls
  if(!options)  {
    options = ["expanded_url"];
  }//if

  // for each url object in a tweet, extract urls matching the specified 'options' keys
  // e.g. 'display_url', 'expanded_url' etc etc
  tweet.entities.urls.forEach(function(url_object)  {
    var urls = {};
    options.forEach(function(url_key) {
      if(url_object[url_key]) {
        urls[url_key] = url_object[url_key];
      }//if
    });//options.forEach

    if(urls)  {
      extracted_urls.push(urls);
    }//if
  });//tweet.forEach

  return extracted_urls;
}//get_urls


function get_hashtags(tweet) {
  var extracted_hashtags = [];

  if(!(tweet) || !(tweet.entities) || !(tweet.entities.hashtags)) {
    return extracted_hashtags;
  }//if-else

  tweet.entities.hashtags.forEach(function(hashtag_object)  {
    var text = hashtag_object.text || "";

    if(text) {
      extracted_hashtags.push(text);
    }//if
  });//tweet.forEach

  return extracted_hashtags;
}//get_hashtags


function get_tweet_user(tweet)  {
  var user = {
    id: '',
    username: ''
  };

  if(!(tweet) || !(tweet.user))  {
    return user;
  }//if


  user.id_str = tweet.user.id_str;
  user.screen_name = tweet.user.screen_name;

  return user;
}//get_tweet_user


function get_tweet_id(tweet)  {
  var id_str;

  if(!tweet)  {
    return id_str;
  }//if

  return tweet.id_str;
}//get_tweet_id


function get_url_tags(url, callback)  {
  var endpoint = "http://api-rien1ceeheinah2o.nuzli.com/v1/url/tags/";

  if(!callback) {
    return;
  }//if

  if(!url)  {
    callback(new Error("Empty URL."), null, null);
  }//if

  request
    .post(endpoint)
    .send({
      url: url
    })
    .end(function(err, res) {
      if(err) {
        callback(err, null);
      } else {
        callback(null, res.body);
      }//if-else
    });//request
}//get_url_tags


function reply_to_tweet(tweet, url_data, twitter_client, callback)  {
  var user = get_tweet_user(tweet);
  var tweet_id_str = get_tweet_id(tweet);

  // FIXME: HACK: TODO: only reply to @saidimu tweets
  if(user.screen_name !== 'saidimu')  {
    return;
  }//if

  // if not status id to reply to, return with an error
  if(!tweet_id_str) {
    callback(new Error('Missing or empty status_id_str. Must specify to reply to a tweet.'), null, null);
  }//if

  var message = "@" + user.screen_name + " " + url_data;

  twitter_client.post('statuses/update', {
    status: message,
    in_reply_to_status_id: tweet_id_str,
  }, function(err, data, response) {
    callback(err, data, response);
  });//twitter_client.post

}//reply_to_tweet


module.exports = {
  get_urls: get_urls,
  get_hashtags: get_hashtags,
  get_url_tags: get_url_tags,
  reply_to_tweet: reply_to_tweet
};
