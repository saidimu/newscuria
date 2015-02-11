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

var appname = "mixpanel";
var log = require('_/util/logging.js')(appname);

var config = require('config').get("mixpanel");

var MIXPANEL_TOKEN = config.get('token');

// grab the Mixpanel factory
var Mixpanel = require('mixpanel');

// create an instance of the mixpanel client
var mixpanel = Mixpanel.init(MIXPANEL_TOKEN);

// application's mixpanel events
var event_type = {};

// ENTITIES events
event_type.entities = {
  PEOPLE                : 'entities_people',
  PLACES                : 'entities_places',
  COMPANIES             : 'entities_companies',
  THINGS                : 'entities_things',
  EVENTS                : 'entities_events',
  RELATIONS             : 'entities_relations',
  TOPICS                : 'entities_topics',
  TAGS                  : 'entities_tags',
  LANGUAGE              : 'entities_lang_',
  UNDEFINED_NLP_OBJECT  : 'entities_undefined_nlp_object',
};//event_type.entities


function track(event, data) {
  var callback = function(err) {
    if (err) {
      log.error({
        err: err,
        event: event,
        data: data
      }, "Error tracking Mixpanel event.");
    }//if
  };//callback

  if(data)  {
    mixpanel.track(event, data, callback);
  } else {
    mixpanel.track(event, callback);
  }//if-else
}//track

module.exports = {
  event_type: event_type,
  track: track,
};
