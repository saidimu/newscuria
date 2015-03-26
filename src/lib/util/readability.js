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

var queue = require('_/util/queue.js');
var topics = queue.topics;

var ratelimiter = require('_/util/limitd.js');

function start()    {
  // connect to the message queue
  queue.connect(listen_to_urls_approved);
}//start()


function listen_to_urls_approved()  {
  var topic = topics.URLS_APPROVED;
  var channel = "fetch-readability-content";

  // 'second', 'minute', 'day', or a number of millis  // https://github.com/auth0/limitd
    var limit_options = {
      bucket: appname,
      // key: 1, // TODO: FIXME: os.hostname()?
      num_tokens: 1,
    };//options

  queue.read_message(topic, channel, function onReadMessage(err, json, message) {
    if(!err) {

      ratelimiter.limit_app(limit_options, function(sleep_duration_seconds) {

        if(sleep_duration_seconds)  {
          log.info({
            bucket: limit_options.bucket,
            key: limit_options.key,
            num_tokens: limit_options.num_tokens,
            sleep_duration: sleep_duration_seconds,
            log_type: log.types.limitd.SLEEP_RECOMMENDATION,
          }, "Rate-limited! Re-queueing message for %s seconds.", sleep_duration_seconds);

          // now backing-off to prevent other messages from being pushed from the server
          // initially wasn't backing-off to prevent "punishment" by the server
          // https://groups.google.com/forum/#!topic/nsq-users/by5PqJsgFKw
          message.requeue(sleep_duration_seconds, true);

        } else {
          
          process_url_approved_message(json, message);

        }//if-else

      });//ratelimiter.limit_app

    }//if
  });
}//listen_to_urls_approved


function process_url_approved_message(json, message)	{
  var url = json.url || '';

  // FIXME: fix and re-implement rate-limiting.
  get_readability(url);

  message.finish();
}//process_url_approved_message()


function get_readability(url)	{
	var query_stmt = "SELECT * FROM nuzli.readability WHERE url=?";
  var params = [url];

  // CALLBACK
  var datastore_fetch_callback = function onDatastoreFetch(err, response)  {
    if(err) {
      log.error({
        url: url,
        err: err,
        log_type: log.types.datastore.GENERIC_ERROR,
      }, "Error fetching Readability from the datastore. Fetching from remote Readability API.");

      fetch_readability_content(url, api_fetch_callback);

    } else if(response.rows.length > 0) {
      // FIXME: TODO: what to do if > 1 rows?
      var buf = response.rows[0].api_result;
      var readability;

      try {
        readability = JSON.parse(buf.toString('utf8'));
      } catch(err)  {
        log.error({
          err: err,
          log_type: log.types.readability.JSON_PARSE_ERROR,
        }, 'Error JSON.parse()ing Readability oject');
      }//try-catch

      // publish text if it isn't empty
      if((readability) && (readability.plaintext))  {

        queue.publish_message(topics.READABILITY, readability);

      } else if(!readability.plaintext) {
        // FIXME: What to do about this empty Readability plaintext?
        log.error({
          url: url,
          log_type: log.types.readability.EMPTY_PLAINTEXT,
        }, "EMPTY Readability PLAINTEXT.");

      } else if(!readability) {
        log.error({
          url: url,
          log_type: log.types.readability.EMPTY_OBJECT,
        }, "EMPTY Readability object... re-fetching from remote Readability API");

        fetch_readability_content(url, api_fetch_callback);
      }//if-else

    } else {
      log.info({
        url: url,
        log_type: log.types.readability.URL_NOT_IN_DB,
      }, "URL not in datastore... fetching from remote Readability API");

      fetch_readability_content(url, api_fetch_callback);

    }//if-else
  };


  // CALLBACK
  var api_fetch_callback = function onReadabilityAPIFetch(err, readability) {
    if(err) {
      log.error({
        url: url,
        err: err,
        log_type: log.types.readability.API_ERROR,
      }, "Error fetching from the Readability API.");

    } else {

      queue.publish_message(topics.READABILITY, readability);

    }//if-else
  };//api_fetch_callback

  try {
    log.info({
      url: url,
      table: 'readability',
      log_type: log.types.datastore.FETCHED_URL,
    }, "Fetching url from the datastore.");

    datastore_api.client.execute(query_stmt, params, datastore_fetch_callback);

  } catch(err)  {
    log.error({
      url: url,
      err: err,
      log_types: log.type.datastore.GENERIC_ERROR,
    }, "Error fetching URL from the datastore... fetching from remote Readability API");

    fetch_readability_content(url, api_fetch_callback);
  }//try-catch

}//get_readability


function fetch_readability_content(url, callback)	{
  try {
    log.info({
      url: url,
      log_type: log.types.readability.FETCHED_API,
    }, "Fetching url from the Readability API.");

  	readability_api.scrape(url, callback);

  } catch(err)  {
    log.error({
      url: url,
      err: err,
      log_type: log.types.readability.API_ERROR,
    }, "Error fetching URL content from Readability API");
  }//try-catch
}//fetch_readability_content()


module.exports = {
  start: start,
};//module.exports
