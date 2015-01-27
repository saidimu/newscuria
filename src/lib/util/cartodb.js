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
  var topics = entities.topics || {};
  var tags = entities.tags || {};
  var date_published = entities.date_published || new Date().toISOString();

  // PLACES
  var places = extract_places(places, url, date_published);

  // PEOPLE
  var people = extract_people(people);

  // TAGS
  // TOPICS
  // THINGS
  // AUTHORS
  // PUBLICATIONS
  // RELEVANCES

  add_place_rows(places, function(err) {

    if(err) {
      message.requeue();
    } else {

      add_people(people, function(err)  {
        if(err) {
          message.requeue();
        } else {
          message.finish();
        }//if-else
      });

    }//if-else
  });

}//process_entities


function add_places(rows, url, date_published, callback) {
  var query = 'INSERT INTO places (the_geom, lat, lon, url, place, state, country, relevance, suffix, prefix, detection, length, _offset, exact, date_published) VALUES (CDB_LatLng({lat}, {lon}), {lat}, {lon}, "{url}", "{place}", "{state}", "{country}", {relevance}, "{suffix}", "{prefix}", "{detection}", {length}, {offset}, "{exact}", "{date_published}")';

  for(var row in rows)  {
    log.debug({
      cartodb: row,
    }, "'place' CartoDB row.");

    client.query(query, row, function(err, response)  {
      if(err) {
        log.error({
          err: err,
          response: response,
          query: CartoDB.tmpl(query, row),
        }, "Error updating CartoDB table.");

        callback(err);

      } else {

        callback();

      }//if-else
    });//client.query()
  }//for

}//add_places


function add_people(rows, url, date_published, callback) {
  var query = 'INSERT INTO people (url, person, nationality, persontype, relevance, suffix, prefix, detection, length, _offset, exact, date_published) VALUES ("{url}", "{person}", "{nationality}", "{persontype}", {relevance}, "{suffix}", "{prefix}", "{detection}", {length}, {offset}, "{exact}", "{date_published}")';

  for(var row in rows)  {
    log.debug({
      cartodb: row,
    }, "'people' CartoDB row.");

    client.query(query, row, function(err, response)  {
      if(err) {
        log.error({
          err: err,
          response: response,
          query: CartoDB.tmpl(query, row),
        }, "Error updating CartoDB table.");

        callback(err);

      } else {
        
        callback();

      }//if-else
    });//client.query()
  }//for

}//add_people


function extract_places(places)  {
  var rows = [];

  for(var place_hash in places) {
    var place = places[place_hash];

    if(place.resolutions) {

      for(resolution in place.resolutions)  {

        if(resolution.latitude && resolution.longitude) {

          // make sure to return other data even if no instances found
          // else return a copy of other data for every instance found
          if(place.instances === [])  {

            rows.push({
              lat: resolution.latitude,
              lon: resolution.longitude,
              place: resolution.shortname || resolution.name,
              state: resolution.containedbystate || "",
              country: resolution.containedbycountry || resolution.shortname || resolution.name,
              relevance: place.relevance,
            });

          } else {

            for(var instance in place.instances)  {
              rows.push({
                lat: resolution.latitude,
                lon: resolution.longitude,
                place: resolution.shortname || resolution.name,
                state: resolution.containedbystate || "",
                country: resolution.containedbycountry || resolution.shortname || resolution.name,
                relevance: place.relevance,
                suffix: place.instances[instance].suffix,
                prefix: place.instances[instance].prefix,
                detection: place.instances[instance].detection,
                length: place.instances[instance].length,
                offset: place.instances[instance].offset,
                exact: place.instances[instance].exact,
              });
              
            }//for

          }//if-else

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
        persontype: person.persontype || "",
        relevance: person.relevance,
      });

    } else {

      for(var instance in person.instances)  {
        rows.push({
          person: person.commonname || person.name,
          nationality: person.nationality || "",
          persontype: person.persontype || "",
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