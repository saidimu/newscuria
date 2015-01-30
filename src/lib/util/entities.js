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

  for(var hash in opencalais) {
    if(opencalais.hasOwnProperty(hash))  {
      var nlp_object = opencalais[hash];

      switch(nlp_object._typeGroup)  {
        case "entities":
          extract_entities(nlp_object);
          break;

        case "relations":
          extract_relations(nlp_object);
          break;

        case "topics":
          extract_topics(nlp_object);
          break;

        case "social_tags":
          extract_social_tags(nlp_object);
          break;

        case "language":
          extract_language(nlp_object);
          break;

        default:
          log.error({
            nlp_object: nlp_object,
          }, "new, undefined _typeGroup encountered.");
      }//switch
    }//if
  }//for

}//extract_nlp_objects


function extract_relations(nlp_object) {
  var _type = nlp_object._type;
  var _typeGroup = nlp_object._typeGroup;
  var _typeReference = nlp_object._typeReference;

  var relations = opencalais_config.get('relations') || {};

}//extract_relations


function extract_entities(nlp_object) {
  var _type = nlp_object._type;
  var _typeGroup = nlp_object._typeGroup;
  var _typeReference = nlp_object._typeReference;

  var entities_config = opencalais_config.get('entities') || {};

  for(var entities_key in entities_config[_type])  {

    if(entities_config[_type].hasOwnProperty(entities_key))  {
      var entity = nlp_object[entities_key];

      // console.log("%s: %s", entities_key, entity);

      // FIXME: iterate nested objects. Only 1-level deep for now.
      if((typeof entity) === 'object')  {

        for(var nested_key in entities_config[_type][entities_key])  {

          if(entities_config[_type][entities_key].hasOwnProperty(nested_key))  {

            var nested_entity = entity[0][nested_key];
            // console.log("  %s: %s", nested_key, nested_entity);

          }//if
        }//for
      }//if

    }//if
  }//for

}//extract_entities()


function extract_topics(nlp_object) {
  var _type = nlp_object._type;
  var _typeGroup = nlp_object._typeGroup;
  var _typeReference = nlp_object._typeReference;

  var topics = opencalais_config.get('topics') || {};

}//extract_topics()


function extract_social_tags(nlp_object) {
  var _type = nlp_object._type;
  var _typeGroup = nlp_object._typeGroup;
  var _typeReference = nlp_object._typeReference;

  var social_tags = opencalais_config.get('socialTag') || {};

}//extract_social_tags()


function extract_language(nlp_object) {
  var _type = nlp_object._type;
  var _typeGroup = nlp_object._typeGroup;
  var _typeReference = nlp_object._typeReference;

  var language = opencalais_config.get('language') || {};

}//extract_language()


function publish_entities_message(entities) {
  queue.publish_message(topics.ENTITIES, entities);
}//publish_entities_message


module.exports = {
  start: start,
  extract_entities: extract_entities,
};//module.exports
