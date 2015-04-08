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
var metrics = require('_/util/metrics.js');

var config = require('config').get('limitd');

var LimitdClient = require('limitd').Client;
var limitd = new LimitdClient({
  host: config.get('host'),
  port: config.get('port'),
});


function take(bucket_obj, callback) {
  var bucket     = bucket_obj.bucket;
  var key        = bucket_obj.key || process.env.HOSTNAME || require('os').hostname();  // TODO: FIXME: os.hostname()?
  var num_tokens = bucket_obj.num_tokens || 1; // 1-token at a time.

  limitd.take(bucket, key, num_tokens, function(err, response)  {
    if(err) {
      log.error({
        bucket: bucket,
        key: key,
        num_tokens: num_tokens,
        log_type: log.types.limitd.TOKEN_GET_ERROR,
      }, 'Error getting token from bucket.');

      metrics.meter(log.types.limitd.TOKEN_GET_ERROR, {
        bucket: bucket,
        key: key,
        num_tokens: num_tokens,
      });

      // force client to handle token-getting error
      throw new Error(err);

    } else {

      // callback ONLY if token remove successfull
      if(response.conformant) {
        metrics.meter(log.types.limitd.CONFORMANT_REQUEST, {
          bucket: bucket,
          key: key,
          num_tokens: num_tokens,
        });

        callback();

      // else log error if tokens requested greater than max. bucket size
    } else if(num_tokens > response.limit) {
        log.error({
          bucket: bucket,
          key: key,
          num_tokens: num_tokens,
          log_type: log.types.limitd.TOKEN_REQUEST_TOO_BIG,
        }, 'Error. Tokens requested greater than max. bucket size.');

        metrics.meter(log.types.limitd.TOKEN_REQUEST_TOO_BIG, {
          bucket: bucket,
          key: key,
          num_tokens: num_tokens,
        });

      // OLD: wait until bucket refills to re-request tokens
      // NEW: wait until approx. time when requested tokens have been refilled
      } else {

        var seconds_until_reset = Math.ceil(response.reset - (Date.now() / 1000));
        if(seconds_until_reset < 0) {
          seconds_until_reset = 0;
        }//if

        var expected_wait_time = 0; // default wait time

        var expected_token_refill_rate = num_tokens / seconds_until_reset;
        // if divide-by-zero (b/c seconds_until_reset === 0),
        // then expected_wait_time should also be zero
        if(expected_token_refill_rate === Infinity) {
          expected_wait_time = 0;

        } else {
          // FIXME: round up to nearest second to prevent errors with upstream systems that cannot deal with floats
          expected_wait_time = Math.ceil(expected_token_refill_rate * num_tokens);

        }//if-else

        metrics.timer(log.types.limitd.EXPECTED_WAIT_TIME, {
          bucket: bucket,
          key: key,
          num_tokens: num_tokens,
        }, expected_wait_time);

        // callback with expected wait time. Upto callback to implement recommendation.
        callback(expected_wait_time);

      }//if-else

    }//if-else

  });//limitd.take

}//take()


module.exports = {
  limit_app: take,
};//module.exports
