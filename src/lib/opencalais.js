/**
Copyright (C) 2015  Saidimu Apale
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.
This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.
You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
**/
'use strict';

var appname = "opencalais";
var log = require('_/util/logging.js')(appname);

var util = require('util');
var datastore_api = require('_/util/datastore-api.js');
var opencalais_api = require('_/util/opencalais-api.js');

var queue = require('_/util/queue.js');
var topics = queue.topics;


//==BEGIN here
// connect to the message queue
queue.connect(function onQueueConnect(err) {
  if(err) {
    log.fatal({
      err: err,
    }, "Cannot connect to message queue!");

  } else {
    
    start();

  }//if-else
});
//==BEGIN here


function start()    {
  listen_to_readability();
}//start


function listen_to_readability()  {
  var topic = topics.READABILITY;
  var channel = "opencalais";

  queue.read_message(topic, channel, function onReadMessage(err, json, message) {
    if(err) {
      log.error("Error geting message from queue!");
    } else {
      process_readability_message(json, message);
    }//if-else
  });
}//listen_to_readability


function process_readability_message(json, message)	{
	var RateLimiter = require('limiter').RateLimiter;

	// 'second', 'minute', 'day', or a number of milliseconds
	var limiter = new RateLimiter(30, 'minute'); // approx. 50K requests/day

	// Throttle requests: https://github.com/jhurliman/node-rate-limiter
	// The default behaviour is to wait for the duration of the rate limiting
	// that’s currently in effect before the callback is fired
	limiter.removeTokens(1, function(err, remainingRequests) {
		// - err will only be set if we request more than the maximum number of
		// requests we set in the constructor
		// - remainingRequests tells us how many additional requests could be sent
		// right this moment

		if(err)	{

      log.info({
        remainingRequests: remainingRequests
      }, "Throttling READABILITY message processing.");

		} else {

      get_opencalais(json, message);

    }//if-else
	});

}//process_readability_message


function get_opencalais(json, message)	{
  var readability = json;

  var url = readability.url || '';

  log.info({
    url: url
  }, "FETCHING Opencalais from datastore.");

	var query = "SELECT * FROM opencalais WHERE url=?";
  var params = [url];

	// CALLBACK
	var datastore_fetch_callback = function onDatastoreFetch(err, response)	{
		if(err)	{
			log.error({err: err});

			fetch_opencalais_content(readability, api_fetch_callback);

		} else if(response.rows.length > 0){
			var buf = response.rows[0].api_result;
			var opencalais = JSON.parse(buf.toString('utf8'));

			if(opencalais)	{

        process_opencalais_object(opencalais, url);

			} else {
        log.info({
          opencalais: opencalais
        }, "EMPTY Opencalais object... re-fetching from Opencalais API");
				
				fetch_opencalais_content(readability, api_fetch_callback);
			}//if-else

		} else {
      log.info({
        url: url
      }, "URL not in datastore... fetching from remote Opencalais API");

			fetch_opencalais_content(readability, api_fetch_callback);

		}//if-else
	};//datastore_fetch_callback

	// CALLBACK
	var api_fetch_callback = function onOpencalaisAPIFetch(err, opencalais)	{
		if(err)	{
			log.error({err: err});

		} else {

      process_opencalais_object(opencalais, url);

		}//if-else
	};//api_fetch_callback


  try {
    datastore_api.client.execute(query, params, datastore_fetch_callback);

    message.finish();

  } catch(err)  {

    log.error({
      err: err
    }, "Error fetching Opencalais from datastore.");

  }//try-catch

}//get_opencalais


function process_opencalais_object(opencalais, url) {
  // augment Opencalais object with same URL as Readability object
  opencalais.url = url;

  // extract and organize chosen entities from Opencalais object
  var entities = process_api_response(opencalais);

  // publish Opencalais object and extracted entities object
  publish_opencalais_message(opencalais);
  publish_entities_message(entities);
}//process_opencalais_object


function publish_opencalais_message(opencalais) {
  queue.publish_message(topics.OPENCALAIS, opencalais);
}//publish_opencalais_message


function publish_entities_message(entities) {
  queue.publish_message(topics.ENTITIES, entities);
}//publish_entities_message


function process_api_response(opencalais)	{
	var people = {};
	var places = {};
	var things = {};
	var tags = {};

	for(var key in opencalais)	{
		var value = opencalais[key];

		var _type = value._type;
		var _typeGroup = value._typeGroup;
		var _typeReference = value._typeReference;

		if(_typeGroup === "entities")	{
			if(_type === "Person")	{
				people[key] = value;

			} else if(_type === "ProvinceOrState")	{
				places[key] = value;

			} else if(_type === "City")	{
				places[key] = value;

			} else if(_type === "Country")	{
				places[key] = value;

			}//if-else

		} else if(_typeGroup === "socialTag")	{
			tags[key] = value;

		} else {
			things[key] = value;

		}//if-else
	}//for

	return {
    url: opencalais.url,
		people: people,
		places: places,
		things: things,
		tags: tags
	};
}//process_api_response


function fetch_opencalais_content(readability, callback)	{
	var url = readability.url;
	var text = readability.text || readability.plaintext;

	if(!url)	{
		log.error({
      readability: readability,
    }, "Cannot fetch Opencalais content becuase of EMPTY url in Readability object.");

		return;
	}//if

  if(!text)	{
    log.error({
     readability: readability,
    }, "Cannot fetch Opencalais content becuase of EMPTY text in Readability object.");

    return;
  }//if

  try {
    opencalais_api.fetch_nlp_content(text, callback);
  } catch(error)  {
    log.error({err: error});
  }//try-catch
}//fetch_opencalais_content