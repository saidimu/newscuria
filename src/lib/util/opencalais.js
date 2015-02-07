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

var mixpanel = require('_/util/mixpanel.js');
var event_type = mixpanel.event_type;

var queue = require('_/util/queue.js');
var topics = queue.topics;

function start()    {
  // connect to the message queue
  queue.connect(listen_to_readability);
}//start()


function listen_to_readability()  {
  var topic = topics.READABILITY;
  var channel = "fetch-opencalais-content";

  queue.read_message(topic, channel, function onReadMessage(err, json, message) {
    if(!err) {
      process_readability_message(json, message);
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
			// log.error({ err: err });
      mixpanel.track(event_type.datastore.GENERIC_ERROR, {
        table: 'opencalais',
      });

			fetch_opencalais_content(readability, api_fetch_callback);

		} else if(response.rows.length > 0){  // FIXME: What if > 1 rows?
			var buf = response.rows[0].api_result;
			var opencalais;

      try {
        opencalais = JSON.parse(buf.toString('utf8'));
      } catch(err)  {
        log.error({ err: err });

        mixpanel.track(event_type.opencalais.JSON_PARSE_ERROR);
      }//try-catch

			if(opencalais)	{

        process_opencalais_object(opencalais, url);

			} else {
        log.info({
          opencalais: opencalais
        }, "EMPTY Opencalais object... re-fetching from Opencalais API");

        mixpanel.track(event_type.opencalais.EMPTY_OBJECT);

				fetch_opencalais_content(readability, api_fetch_callback);
			}//if-else

		} else {
      // log.info({
      //   url: url
      // }, "URL not in datastore... fetching from remote Opencalais API");

      mixpanel.track(event_type.opencalais.URL_NOT_IN_DB);

			fetch_opencalais_content(readability, api_fetch_callback);

		}//if-else
	};//datastore_fetch_callback

	// CALLBACK
	var api_fetch_callback = function onOpencalaisAPIFetch(err, opencalais)	{
		if(err)	{
      log.error({
        url: url,
        err: err
      }, "Error fetching from the Opencalais API.");

      mixpanel.track(event_type.opencalais.API_ERROR);

		} else {

      process_opencalais_object(opencalais, url);

		}//if-else
	};//api_fetch_callback


  try {
    mixpanel.track(event_type.datastore.FETCHED_URL, {
      table: 'opencalais',
    });

    datastore_api.client.execute(query, params, datastore_fetch_callback);

  } catch(err)  {
    // log.error({
    //   err: err
    // }, "Error fetching Opencalais from datastore.");
    mixpanel.track(event_type.datastore.GENERIC_ERROR, {
      table: 'opencalais',
    });

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
    }, "EMPTY url in Readability object. Cannot fetch Opencalais content.");

    mixpanel.track(event_type.opencalais.URL_NOT_IN_READABILITY);

		return;
	}//if

  if(!text)	{
    log.error({
      url: url,
   }, "EMPTY text in Readability object. Cannot fetch Opencalais content.");

    mixpanel.track(event_type.opencalais.TEXT_NOT_IN_READABILITY);

    return;
  }//if

  try {
    mixpanel.track(event_type.opencalais.FETCHED_API);

    opencalais_api.get_content(text, callback);

  } catch(err)  {
    log.error({
      url: url,
      err: err
    }, "Error fetching content from Opencalais API.");

    mixpanel.track(event_type.opencalais.API_ERROR);
  }//try-catch
}//fetch_opencalais_content

module.exports = {
  start: start,
};//module.exports
