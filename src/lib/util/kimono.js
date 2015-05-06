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

var queue = require('_/util/queue.js');
var topics = queue.topics;

//==BEGIN here
// connect to the message queue
queue.connect(function() {
  module.exports = {
    googlenews_handler: googlenews_handler,
  };//module.exports
});//queue.connect
//==BEGIN here


function googlenews_handler(webhook, callback)  {
  var webhook_header = {
    api_name: webhook.name,
    version: webhook.version,
    newdata: webhook.newdata,
    lastrunstatus: webhook.lastrunstatus,
    thisversionrun: webhook.thisversionrun,
    lastsuccess: webhook.lastsuccess,
    nextrun: webhook.nextrun,
    count: webhook.count
  };

  callback(webhook_header);

  process_googlenews_webhook(webhook);

}//googlenews_handler


function process_googlenews_webhook(webhook)  {
  var results = webhook.results || {};

  var content = results.content || [];
  var metadata = results.metadata || [];
  var related = results.related || [];

  // FIXME: beware of duplicate URLs in 'content' and 'related' arrays.

  content.forEach(function(article)  {
    // TODO: also process Google News article headlines
    var headline = article.headline || {};
    var url = headline.href || undefined;

    if(url) {
      publish_url_message(url);
    }//if

  });//content.forEach


  related.forEach(function(article)  {
    var url = article.headline || undefined;

    if(url) {
      publish_url_message(url);
    }//if
  });//related.forEach

}//process_googlenews_webhook


function publish_url_message(url) {
  queue.publish_message(topics.URLS_RECEIVED, {
    url: url
  });
}//publish_url_message
