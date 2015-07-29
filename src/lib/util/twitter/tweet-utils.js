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


function extract_urls(tweet, options)  {
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
}//extract_urls


function extract_hashtags(tweet) {
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
}//extract_hashtags


module.exports = {
  extract_urls: extract_urls,
  extract_hashtags: extract_hashtags,
};
