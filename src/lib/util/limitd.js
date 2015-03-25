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

var appname = "limitd";
var util = require('util');
var log = require('_/util/logging.js')(appname);

var config = require('config').get('limitd');

var LimitdClient = require('limitd').Client;
var limitd = new LimitdClient({
  host: config.get('host'),
  port: config.get('port'),
});


function take(bucket_obj, callback) {
  var bucket     = bucket_obj.bucket;
  var key        = bucket_obj.key;
  var num_tokens = bucket_obj.num_tokens || 1; // 1-token at a time.

  limitd.take(bucket, key, num_tokens, function(err, response)  {
    if(err) {
      log.error({
        bucket: bucket,
        key: key,
        num_tokens: num_tokens,
        log_type: log.types.limitd.TOKEN_GET_ERROR,
      }, 'Error getting token from bucket.');

    } else {

      // if token remove successfull...
      if(response.conformant) {
        callback();

      } else {

        var sleep_duration = response.reset - (Date.now() / 1000);

        log.info({
          bucket: bucket,
          key: key,
          num_tokens: num_tokens,
          sleep_duration: sleep_duration,
          log_type: log.types.limitd.SLEEP_DURATION,
        }, util.format('Sleeping for %s seconds for lack of tokens.' % sleep_duration));

        // try getting the token after a sleep duration determined by limitd response
        setTimeout(function onTimeoutWake() {
          take(bucket, key, num_tokens, callback);
        }, sleep_duration * 1000);

      }//if-else

    }//if-else

  });//limitd.take

}//take()


module.exports = {
  take: take,
};//module.exports
