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

var appname = "twitter-public-streams";
var log = require('_/util/logging.js')(appname);

var config = require('config').get('twitter').get('user_streams');

var metrics = require('_/util/metrics.js');


function start(client, callback) {

  // only run if config file allows
  if(!config.get('enabled')) {

    log.info({
      log_type : log.types.twitter.USER_STREAMS,
    }, 'Twitter User Streams is DISABLED.');

    return;
  }//if-else

  var ENDPOINT     = config.get('endpoint');
  var FILTER_LEVEL = config.get('filter_level');
  var LANGUAGE     = config.get('language');
  var WITH         = config.get('with');
  var REPLIES      = config.get('replies');
  var STRING_IDS   = config.get('stringify_friend_ids');

  var options = {
    filter_level        : FILTER_LEVEL,
    language            : LANGUAGE,
    with                : WITH,
    replies             : REPLIES,
    stringify_friend_ids: STRING_IDS
  };//options

  log.warn({
    log_type : log.types.twitter.USER_STREAMS,
    endpoint : ENDPOINT,
    options  : options,
  }, 'Twitter User Streams is ENABLED.');

  var stream = client.stream(ENDPOINT, options);

  stream.on('message', function(message) {

    metrics.meter(metrics.types.twitter.TWEET_RECEIVED, options);

    callback(null, message);

  });//stream.on('data')

  stream.on('error', function(err) {
    log.error({
      err          : err,
      log_type     : log.types.twitter.STREAM_ERROR,
      endpoint     : ENDPOINT,
      options: options,
    }, 'Twitter User Streams error.');

    metrics.meter(metrics.types.twitter.STREAM_ERROR, options);

    callback(err, {});

  });//stream.on('error')

}//start()


module.exports = {
  start: start,
};
