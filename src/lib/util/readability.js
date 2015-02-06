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

var queue, topics, mixpanel, event_type;

function start(options)    {
  queue = options.queue;
  mixpanel = options.mixpanel;

  topics = queue.topics;
  event_type = mixpanel.event_type;

  listen_to_urls_approved();
}//start()


function listen_to_urls_approved()  {
  var topic = topics.URLS_APPROVED;
  var channel = "fetch-readability-content";

  queue.read_message(topic, channel, function onReadMessage(err, json, message) {
    if(!err) {
      process_url_approved_message(json, message);
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
      // log.error({
      //   url: url,
      //   err: err
      // }, "Error fetching from the datastore.");
      mixpanel.track(event_type.datastore.GENERIC_ERROR, {
        table: 'readability',
      });

      fetch_readability_content(url, api_fetch_callback);

    } else if(response.rows.length > 0) {
      // FIXME: TODO: what to do if > 1 rows?
      var buf = response.rows[0].api_result;
      var readability;

      try {
        readability = JSON.parse(buf.toString('utf8'));
      } catch(err)  {
        log.error({ err: err });

        mixpanel.track(event_type.readability.JSON_PARSE_ERROR);
      }//try-catch

      // publish text if it isn't empty
      if((readability) && (readability.plaintext))  {
        queue.publish_message(topics.READABILITY, readability);

      } else if(!readability.plaintext) {
        log.error({
          readability: readability
        }, "EMPTY Readability PLAINTEXT.");

        mixpanel.track(event_type.readability.EMPTY_PLAINTEXT);

      } else if(!readability) {
        log.info({
          readability: readability
        }, "EMPTY Readability object... re-fetching from remote Readability API");

        mixpanel.track(event_type.readability.EMPTY_OBJECT);

        fetch_readability_content(url, api_fetch_callback);
      }//if-else

    } else {
      // log.info({
      //   url: url
      // }, "URL not in datastore... fetching from remote Readability API");

      mixpanel.track(event_type.readability.URL_NOT_IN_DB);

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

      mixpanel.track(event_type.readability.API_ERROR);

    } else {

      queue.publish_message(topics.READABILITY, readability);

    }//if-else
  };//api_fetch_callback

  try {
    mixpanel.track(event_type.datastore.FETCHED_URL, {
      table: 'readability',
    });

    datastore_api.client.execute(query_stmt, params, datastore_fetch_callback);

  } catch(err)  {
    // log.error({
    //   url: url,
    //   err: err
    // }, "Error fetching URL from the datastore... fetching from remote Readability API");
    mixpanel.track(event_type.datastore.GENERIC_ERROR, {
      table: 'readability',
    });

    fetch_readability_content(url, api_fetch_callback);
  }//try-catch

}//get_readability


function fetch_readability_content(url, callback)	{
  try {
    mixpanel.track(event_type.readability.FETCHED_API);

  	readability_api.scrape(url, callback);

  } catch(err)  {
    log.error({
      url: url,
      err: err
    }, "Error fetching URL content from Readability API");

    mixpanel.track(event_type.readability.API_ERROR);
  }//try-catch
}//fetch_readability_content()


module.exports = {
  start: start,
};//module.exports
