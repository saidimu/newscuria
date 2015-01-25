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

var appname = "readability";
var log = require('_/util/logging.js')(appname);

var readability_api = require('_/util/readability-api.js');
var datastore_api = require('_/util/datastore-api.js');

var queue;
var topics;

function start(__queue, __topics)    {
  queue = __queue;
  topics = __topics;
  
  listen_to_urls_approved();
}//start()


function listen_to_urls_approved()  {
  var topic = topics.URLS_APPROVED;
  var channel = "fetch-readability-content";

  queue.read_message(topic, channel, function onReadMessage(err, json, message) {
    if(err) {
      log.error({
        topic: topic,
        channel: channel,
        json: json,
        queue_msg: message,
        err: err
      }, "Error getting message from queue!");

      // FIXME: save these json-error messages for analysis
      try {
        message.finish();        
      } catch(err)  {
        log.error({
          topic: topic,
          channel: channel,
          json: json,
          queue_msg: message,
          err: err
        }, "Error executing message.finish()");
      }//try-catch
      
    } else {
      process_url_approved_message(json, message);
    }//if-else
  });
}//listen_to_urls_approved


function process_url_approved_message(json, message)	{
	var RateLimiter = require('limiter').RateLimiter;

	// 'second', 'minute', 'day', or a number of milliseconds
	var limiter = new RateLimiter(30, 'minute'); // approx. 50K requests/day

	// Throttle requests: https://github.com/jhurliman/node-rate-limiter
	// The default behaviour is to wait for the duration of the rate limiting
	// that’s currently in effect before the callback is fired
	limiter.removeTokens(1, function onLimiter(err, remainingRequests) {
		// - err will only be set if we request more than the maximum number of
		// requests we set in the constructor
		// - remainingRequests tells us how many additional requests could be sent
		// right this moment

		if (err)	{

			log.info({
        remainingRequests: remainingRequests
      }, "Throttling APPROVED URLs message processing.");

		} else {

      var url = json.url || '';

      get_readability(url);

      message.finish();

    }//if-else
	});

}//process_url_approved_message()


function get_readability(url)	{
	var query_stmt = "SELECT * FROM nuzli.readability WHERE url=?";
  var params = [url];

  // CALLBACK
  var datastore_fetch_callback = function onDatastoreFetch(err, response)  {
    if(err) {
      log.error({
        url: url,
        err: err
      }, "Error fetching from the datastore.");

      fetch_readability_content(url, api_fetch_callback);

    } else if(response.rows.length > 0){
      // FIXME: TODO: what to do if > 1 rows?
      var buf = response.rows[0].api_result;
      var readability;

      try {
        readability = JSON.parse(buf.toString('utf8'));        
      } catch(err)  {
        log.error({ err: err });
      }//try-catch

      // publish text if it isn't empty
      if((readability) && (readability.plaintext))  {
        queue.publish_message(topics.READABILITY, readability);

      } else if(!readability.plaintext) {
        log.error({
          readability: readability
        }, "EMPTY Readability PLAINTEXT.");

      } else if(!readability) {
        log.info({
          readability: readability
        }, "EMPTY Readability object... re-fetching from remote Readability API");
        
        fetch_readability_content(url, api_fetch_callback);
      }//if-else

    } else {
      log.info({
        url: url
      }, "URL not in datastore... fetching from remote Readability API");

      fetch_readability_content(url, api_fetch_callback);

    }//if-else
  };


  // CALLBACK
  var api_fetch_callback = function onReadabilityAPIFetch(err, readability) {
    if(err) {
      log.error({
        url: url,
        err: err
      }, "Error fetching from the Readability API.");

    } else {

      queue.publish_message(topics.READABILITY, readability);

    }//if-else
  };//api_fetch_callback

  log.info({
    url: url
  }, "FETCHING Readability from datastore.");

  try {
    datastore_api.client.execute(query_stmt, params, datastore_fetch_callback);

  } catch(err)  {
    log.error({
      url: url,
      err: err
    }, "Error fetching URL from the datastore... fetching from remote Readability API");

    fetch_readability_content(url, api_fetch_callback);
  }//try-catch

}//get_readability


function fetch_readability_content(url, callback)	{
  try {
  	readability_api.scrape(url, callback);
  } catch(err)  {
    log.error({
      url: url,
      err: err
    }, "Error fetching URL content from Readability API");
  }//try-catch
}//fetch_readability_content()


module.exports = {
  start: start,
};//module.exports