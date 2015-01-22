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

var appname = "cartodb";
var log = require('_/util/logging.js')(appname);

var queue = require('_/util/queue.js');
var topics = queue.topics;

var request = require('request');
var format = require('util').format;

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
  listen_to_entities();
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
  for(var place_hash in places) {
    var place = places[place_hash];

    if(place.resolutions) {
      var resolution = place.resolutions[0] || {};  // FIXME: what about > 1 place resolutions?

      // FIXME: stop processing if lat/lon is invalid
      cartodb_row.lat = resolution.latitude;
      cartodb_row.lon = resolution.longitude;
      cartodb_row.country = resolution.containedbycountry;
      cartodb_row.place = resolution.shortname || resolution.name;      
    }//if
  }//for

  // PEOPLE
  for(var people_hash in people) {
    var person = people[people_hash];

    cartodb_row.person = person.commonname || person.name;
    cartodb_row.nationality = person.nationality || "";
  }//for

  log.debug({
    cartodb: {
      place: cartodb_row.name,
      lat: cartodb_row.lat,
      lon: cartodb_row.lon,
      country: cartodb_row.country,
      person: cartodb_row.person,
      nationality: cartodb_row.nationality,
    },
  }, "Entity as a CartoDB row.");

  var cartodb_sql_template = "http://saidimu.cartodb.com/api/v2/sql?q=INSERT INTO entities (lat, lon, country, place, person, nationality, date_published) VALUES ('%s', '%s', '%s', '%s', '%s', '%s', '%s')&api_key=465496dd9c9630e3946238c8d724befca0d29471";
  var cartodb_sql_endpoint = format(
    cartodb_sql_template,
    cartodb_row.lat,
    cartodb_row.lon,
    cartodb_row.country,
    cartodb_row.place,
    cartodb_row.person,
    cartodb_row.nationality,
    cartodb_row.date_published
  );

  request(cartodb_sql_endpoint, function onRequestResponse(err, response, body) {
    if(err) {
      log.error({
        err: err
      }, "Error updating CartoDB table via SQL API.");
    } else {
      log.debug({
        body: body
      }, "Successful insert of entity into CartoDB row.");
    }//if-else
  });//request.get

  message.finish();
}//process_entities
