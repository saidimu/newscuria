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

var appname = "cartodb";
var log = require('_/util/logging.js')(appname);

var config = require('config').get("cartodb");
var CARTODB_API_KEY = config.get('api_key');
var CARTODB_USER = config.get('user');

var CartoDB = require('cartodb');

var client;

var queue;
var topics;

function start(__queue, __topics)    {
  queue = __queue;
  topics = __topics;
  
  client = new CartoDB({
    user: CARTODB_USER,
    api_key: CARTODB_API_KEY
  });//client

  client.on('connect', function() {  
    listen_to_entities();
  });

  client.connect();
}//start()


function listen_to_entities() {
  var topic = topics.ENTITIES;
  var channel = "export-to-cartodb";

  queue.read_message(topic, channel, function onReadMessage(err, json, message, reader) {
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
      process_entities(json, message);
    }//if-else
  });

}//listen_to_entities


function process_entities(json, message)  {
  var entities = json;

  var url = entities.url;
  var people = entities.people || {};
  var places = entities.places || {};
  var things = entities.things || {};
  var tags = entities.tags || {};
  var date_published = entities.date_published || new Date().toISOString();

  var cartodb_row = {};
  cartodb_row.url = url;
  cartodb_row.date_published = date_published;

  // PLACES
  var place_rows = extract_places(places);

  // PEOPLE
  var people_rows = extract_people(people);

  // TAGS
  // THINGS
  // AUTHORS
  // PUBLICATIONS
  // RELEVANCES

  var cartodb_query = "INSERT INTO entities (the_geom, lat, lon, url, country, place, person, nationality, date_published) VALUES (CDB_LatLng({lat}, {lon}), {lat}, {lon}, '{url}', '{country}', '{place}', '{person}', '{nationality}', '{date_published}')";
  var insert_data = {
    lat: cartodb_row.lat,
    lon: cartodb_row.lon,
    url: cartodb_row.url,
    country: cartodb_row.country,
    place: cartodb_row.place,
    person: cartodb_row.person,
    nationality: cartodb_row.nationality,
    date_published: cartodb_row.date_published,
  };//insert_data

  log.debug({
    cartodb: insert_data,
  }, "Entity as a CartoDB row.");

  client.query(cartodb_query, insert_data, function(err, response)  {
    if(err) {
      log.error({
        err: err,
        response: response,
        query: CartoDB.tmpl(cartodb_query, insert_data),
      }, "Error updating CartoDB table.");

      message.requeue();

    } else {
      // log.debug({
      //   body: body
      // }, "Successful insert of entity into CartoDB row.");
      message.finish();

    }//if-else
  });//client.query()
}//process_entities


function extract_places(places)  {
  var rows = [];

  for(var place_hash in places) {
    var place = places[place_hash];

    if(place.resolutions) {

      for(resolution in place.resolutions)  {

        if(resolution.latitude && resolution.longitude) {
          rows.push({
            lat: resolution.latitude,
            lon: resolution.longitude,
            place: resolution.shortname || resolution.name,
            state: resolution.containedbystate || "";
            country: resolution.containedbycountry || cartodb_row.place,
            relevance: place.relevance,
          });
        }//if

      }//for
    }//if
  }//for

  return rows;
}//extract_places


function extract_people(people)  {
  var rows = [];

  for(var people_hash in people) {
    var person = people[people_hash];

    // make sure to return other data even if no instances found
    // else return a copy of other data for every instance found
    if(person.instances === [])  {
      rows.push({
        person: person.commonname || person.name,
        nationality: person.nationality || "",
        persontype: person.persontype || "";
        relevance: person.relevance,
      });

    } else {

      for(var instance in person.instances)  {
        rows.push({
          person: person.commonname || person.name,
          nationality: person.nationality || "",
          persontype: person.persontype || "";
          relevance: person.relevance,
          suffix: person.instances[instance].suffix,
          prefix: person.instances[instance].prefix,
          detection: person.instances[instance].detection,
          length: person.instances[instance].length,
          offset: person.instances[instance].offset,
          exact: person.instances[instance].exact,
        });
      }//for

    }//if-else

  }//for

  return rows;
}//extract_people


module.exports = {
  start: start,
};//module.exports