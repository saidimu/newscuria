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

var appname = "ratelimiter";
var log = require('_/util/logging.js')(appname);

var config = require('config').get('ratelimiter');
var RateLimiter = require('limiter').RateLimiter;


function passthru(options, callback)  {
  callback();
}//passthru


function limit_app(options, callback)  {

  if(!options)  {
    log.error({
      app: app,
      log_type: log.types.ratelimiter.FALLBACK_NOT_FOUND,
    }, 'Rate-limiter fallback values not found. App not being rate-limited.');

    callback();
  }//if

  var app          = options.app;
  var num_requests = options.fallback_num_requests;

  // time_period: 'second', 'minute', 'day', or a number of milliseconds: https://github.com/jhurliman/node-rate-limiter
  var time_period  = options.fallback_time_period;

  // safely check for app-specific rate-limiting (if any)
  // and over-ride provided fallback values
  if(config.has(app)) {

    // safely check for app's values (if any)
    if( config.get(app).has('num_requests') && config.get(app).has('time_period') ) {

      num_requests = config.get(app).get('num_requests');
      time_period = config.get(app).get('time_period');

    } else {

      console.log();

      log.error({
        app: app,
        fallback: options,
        log_type: log.types.ratelimiter.CONFIG_NOT_FOUND,
      }, 'One or more rate-limiter config values for app not found. Using fallback values.');

    }//if-else

  } else {

    log.error({
      app: app,
      fallback: options,
      log_type: log.types.ratelimiter.CONFIG_NOT_FOUND,
    }, 'All rate-limiter config values for app not found. Using fallback values.');

  }//if-else

  // if config rate-limit values not found AND no fallback values provided,
  // execute callback without any rate-limiting
  if(!num_requests || !time_period) {
    log.error({
      app: app,
      log_type: log.types.ratelimiter.FALLBACK_NOT_FOUND,
    }, 'Rate-limiter fallback values not found. App not being rate-limited.');

    callback();
  }//if

  // disambiguate 'time_period': can be a number or a string.
  // convert Number string to an actual Number otherwise rate-limiter might not work as expected
  if(isNaN( Number(time_period) )) {
    // do nothing. time_period is not a Number string.
    console.log();
  } else {
    // covert time_period string to a Number
    time_period = Number(time_period);
  }//if-else

  var limiter = new RateLimiter(num_requests, time_period);

  // Throttle requests
  limiter.removeTokens(1, function(err, remainingRequests) {
    // err will only be set if we request more than the maximum number of
    // requests we set in the constructor

    // remainingRequests tells us how many additional requests could be sent
    // right this moment

    // log.info({
    //   app: app,
    //   num_requests: num_requests,
    //   time_period: time_period,
    //   log_type: log.types.ratelimiter.RATE_LIMITING_APP,
    // }, 'Rate-limiting app.');

    callback();

  });//limiter

}//limit_app


module.exports = {
  limit_app: limit_app,
  passthru: passthru,
};//module.exports
