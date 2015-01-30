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

var appname = "entities";
var log = require('_/util/logging.js')(appname);

var queue;
var topics;

var opencalais_config = require('config');

function start(__queue, __topics)    {
  queue = __queue;
  topics = __topics;

  listen_to_opencalais();
}//start()


function listen_to_opencalais()  {
  var topic = topics.OPENCALAIS;
  var channel = "extract-entities";

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
      process_opencalais_message(json, message);
    }//if-else
  });
}//listen_to_opencalais


function process_opencalais_message(json, message) {
  var opencalais = json;
  var url = opencalais.url || '';
  var date_published = opencalais.date_published || null;

  if(!url)  {
    log.error({
      url: url
    }, "EMPTY url! Cannot persist Opencalais object to datastore.");
    return;
  }//if

  // extract and organize chosen 'NLP objects' from Opencalais object
  extract_nlp_objects(opencalais);

  message.finish();
}//process_opencalais_message


function extract_nlp_objects(opencalais) {

  var PEOPLE = opencalais_config.get('PEOPLE');
  var PLACES = opencalais_config.get('PLACES');
  var COMPANIES = opencalais_config.get('COMPANIES');
  var EVENTS = opencalais_config.get('EVENTS');
  var THINGS = opencalais_config.get('THINGS');
  var RELATIONS = opencalais_config.get('RELATIONS');
  var TOPICS = opencalais_config.get('TOPICS');
  var TAGS = opencalais_config.get('SOCIALTAGS');
  var LANGUAGE = opencalais_config.get('LANGUAGE');

  for(var hash in opencalais) {
    if(opencalais.hasOwnProperty(hash))  {
      var nlp_object = opencalais[hash];
      var nlp_type = nlp_object._type;

      switch(nlp_type)  {
        case PEOPLE.indexOf(nlp_type) === 0:
          extract_people(nlp_object);
          break;

        case PLACES.indexOf(nlp_type) === 0:
          extract_places(nlp_object);
          break;

        case COMPANIES.indexOf(nlp_type) === 0:
          extract_companies(nlp_object);
          break;

        case THINGS.indexOf(nlp_type) === 0:
          extract_things(nlp_object);
          break;

        case EVENTS.indexOf(nlp_type) === 0:
          extract_events(nlp_object);
          break;

        case RELATIONS.indexOf(nlp_type) === 0:
          extract_relations(nlp_object);
          break;

        case TOPICS.indexOf(nlp_type) === 0:
          extract_topics(nlp_object);
          break;

        case TAGS.indexOf(nlp_type) === 0:
          extract_tags(nlp_object);
          break;

        case LANGUAGE.indexOf(nlp_type) === 0:
          extract_language(nlp_object);
          break;

        default:
          log.error({
            nlp_object: nlp_object,
          }, "new, undefined _type/_typeGroup encountered.");
      }//switch
    }//if
  }//for

}//extract_nlp_objects


function extract_people(nlp_object) {
  var _type = nlp_object._type;
  var _typeGroup = nlp_object._typeGroup;
  var _typeReference = nlp_object._typeReference;

}//extract_people


function extract_places(nlp_object) {
  var _type = nlp_object._type;
  var _typeGroup = nlp_object._typeGroup;
  var _typeReference = nlp_object._typeReference;

}//extract_places


function extract_companies(nlp_object) {
  var _type = nlp_object._type;
  var _typeGroup = nlp_object._typeGroup;
  var _typeReference = nlp_object._typeReference;

}//extract_companies


function extract_things(nlp_object) {
  var _type = nlp_object._type;
  var _typeGroup = nlp_object._typeGroup;
  var _typeReference = nlp_object._typeReference;

}//extract_things


function extract_events(nlp_object) {
  var _type = nlp_object._type;
  var _typeGroup = nlp_object._typeGroup;
  var _typeReference = nlp_object._typeReference;

}//extract_events


function extract_relations(nlp_object) {
  var _type = nlp_object._type;
  var _typeGroup = nlp_object._typeGroup;
  var _typeReference = nlp_object._typeReference;

}//extract_relations


function extract_topics(nlp_object) {
  var _type = nlp_object._type;
  var _typeGroup = nlp_object._typeGroup;
  var _typeReference = nlp_object._typeReference;

}//extract_topics()


function extract_tags(nlp_object) {
  var _type = nlp_object._type;
  var _typeGroup = nlp_object._typeGroup;
  var _typeReference = nlp_object._typeReference;

}//extract_tags()


function extract_language(nlp_object) {
  var _type = nlp_object._type;
  var _typeGroup = nlp_object._typeGroup;
  var _typeReference = nlp_object._typeReference;

}//extract_language()


function publish_entities_message(entities) {
  queue.publish_message(topics.ENTITIES, entities);
}//publish_entities_message


module.exports = {
  start: start,
};//module.exports
