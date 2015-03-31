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

var appname = "opencalais";
var log = require('_/util/logging.js')(appname);

var datastore_api = require('_/util/datastore-api.js');
var opencalais_api = require('_/util/opencalais-api.js');

var queue = require('_/util/queue.js');
var topics = queue.topics;

var ratelimiter = require('_/util/limitd.js');
var metrics = require('_/util/metrics.js');

function start()    {
  // connect to the message queue
  queue.connect(listen_to_readability);
}//start()


function listen_to_readability()  {
  var topic = topics.READABILITY;
  var channel = "fetch-opencalais-content";

  // https://github.com/auth0/limitd
  var limit_options = {
    bucket: appname,
    // key: 1, // TODO: FIXME: os.hostname()?
    num_tokens: 1,
  };//options

  queue.read_message(topic, channel, function onReadMessage(err, json, message) {
    if(!err) {

      ratelimiter.limit_app(limit_options, function(expected_wait_time) {
        if(expected_wait_time)  {
          log.info({
            bucket: limit_options.bucket,
            key: limit_options.key,
            num_tokens: limit_options.num_tokens,
            expected_wait_time: expected_wait_time,
            log_type: log.types.limitd.EXPECTED_WAIT_TIME,
          }, "Rate-limited! Re-queueing message for %s seconds.", expected_wait_time);

          metrics.store(log.types.limitd.EXPECTED_WAIT_TIME, expected_wait_time);

          // now backing-off to prevent other messages from being pushed from the server
          // initially wasn't backing-off to prevent "punishment" by the server
          // https://groups.google.com/forum/#!topic/nsq-users/by5PqJsgFKw
          message.requeue(expected_wait_time, true);

        } else {

          process_readability_message(json, message);

        }//if-else

      });//ratelimiter.limit_app

    }//if
  });
}//listen_to_readability


function process_readability_message(json, message)	{
  // FIXME: fix and re-implement rate-limiting.
  get_opencalais(json);

  message.finish();
}//process_readability_message


function get_opencalais(json)	{
  var readability = json;

  var url = readability.url || '';

	var query = "SELECT * FROM nuzli.opencalais WHERE url=?";
  var params = [url];

	// CALLBACK
	var datastore_fetch_callback = function onDatastoreFetch(err, response)	{
		if(err)	{
			log.error({
        err: err,
        log_type: log.types.datastore.GENERIC_ERROR,
      });

      metrics.store(log.types.datastore.GENERIC_ERROR, 1);

			fetch_opencalais_content(readability, api_fetch_callback);

		} else if(response.rows.length > 0){  // FIXME: What if > 1 rows?
			var buf = response.rows[0].api_result;
			var opencalais;

      try {
        opencalais = JSON.parse(buf.toString('utf8'));
      } catch(err)  {
        log.error({
          err: err,
          log_type: log.type.opencalais.JSON_PARSE_ERROR,
        }, 'Error JSON.parse()ing Readability oject');

        metrics.store(log.types.opencalais.JSON_PARSE_ERROR, 1);

      }//try-catch

			if(opencalais)	{

        process_opencalais_object(opencalais, url);

			} else {
        log.info({
          url: url,
          log_type: log.types.opencalais.EMPTY_OBJECT,
        }, "EMPTY Opencalais object... re-fetching from Opencalais API");

        metrics.store(log.types.opencalais.EMPTY_OBJECT, 1);

				fetch_opencalais_content(readability, api_fetch_callback);
			}//if-else

		} else {
      log.info({
        url: url,
        log_type: log.types.opencalais.URL_NOT_IN_DB,
      }, "URL not in datastore... fetching from remote Opencalais API");

      metrics.store(log.types.opencalais.URL_NOT_IN_DB, 1);

			fetch_opencalais_content(readability, api_fetch_callback);
		}//if-else
	};//datastore_fetch_callback

	// CALLBACK
	var api_fetch_callback = function onOpencalaisAPIFetch(err, opencalais)	{
		if(err)	{
      log.error({
        url: url,
        err: err,
        log_type: log.types.opencalais.API_ERROR,
      }, "Error fetching from the Opencalais API.");

      metrics.store(log.types.opencalais.API_ERROR, 1);

		} else {

      process_opencalais_object(opencalais, url);

		}//if-else
	};//api_fetch_callback


  try {
    log.info({
      url: url,
      table: 'opencalais',
      log_type: log.types.datastore.FETCHED_URL,
    }, "Fetching url from the datastore.");

    metrics.store(log.types.datastore.FETCHED_URL, 1);

    datastore_api.client.execute(query, params, datastore_fetch_callback);

  } catch(err)  {
    log.error({
      err: err,
      log_types: log.type.datastore.GENERIC_ERROR,
    }, "Error fetching URL from the datastore... fetching from remote Opencalais API");

    metrics.store(log.types.datastore.GENERIC_ERROR, 1);

		fetch_opencalais_content(readability, api_fetch_callback);
  }//try-catch

}//get_opencalais


function process_opencalais_object(opencalais, url) {
  // augment Opencalais object with same URL as Readability object
  opencalais.url = url;

  // publish Opencalais object
  queue.publish_message(topics.OPENCALAIS, opencalais);
}//process_opencalais_object


function fetch_opencalais_content(readability, callback)	{
	var url = readability.url;
	var text = readability.text || readability.plaintext;

	if(!url)	{
		log.error({
      url: url,
      log_type: log.types.opencalais.URL_NOT_IN_READABILITY,
    }, "EMPTY url in Readability object. Cannot fetch Opencalais content.");

    metrics.store(log.types.opencalais.URL_NOT_IN_READABILITY, 1);

		return;
	}//if

  if(!text)	{
    log.error({
      url: url,
      log_type: log.types.opencalais.TEXT_NOT_IN_READABILITY,
    }, "EMPTY text in Readability object. Cannot fetch Opencalais content.");

    metrics.store(log.types.opencalais.TEXT_NOT_IN_READABILITY, 1);

    return;
  }//if

  try {
    log.info({
      url: url,
      log_type: log.types.opencalais.FETCHED_API,
    }, "Fetching url from the Opencalais API.");

    metrics.store(log.types.opencalais.FETCHED_API, 1);

    opencalais_api.get_content(text, callback);

  } catch(err)  {
    log.error({
      url: url,
      err: err,
      log_type: log.types.opencalais.API_ERROR,
    }, "Error fetching content from Opencalais API.");

    metrics.store(log.types.opencalais.API_ERROR, 1);

  }//try-catch
}//fetch_opencalais_content

module.exports = {
  start: start,
};//module.exports
