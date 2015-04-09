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

var opencalais_config = require('config');

var queue = require('_/util/queue.js');
var topics = queue.topics;

var ratelimiter = require('_/util/limitd.js');
var metrics = require('_/util/metrics.js');
var urls = require('_/util/urls.js');

function start()    {
  // connect to the message queue
  queue.connect(listen_to_opencalais);
}//start()


function listen_to_opencalais()  {
  var topic = topics.OPENCALAIS;
  var channel = "extract-entities";

  // https://github.com/auth0/limitd
  var limit_options = {
    bucket: appname,
    // key: 1, // TODO: FIXME: os.hostname()?
    num_tokens: 1,
  };//options

  queue.read_message(topic, channel, function onReadMessage(err, json, message) {
    if(!err) {

      metrics.meter(metrics.types.queue.reader.MESSAGE_RECEIVED, {
        topic  : topic,
        channel: channel,
        app    : appname,
      });

      ratelimiter.limit_app(limit_options, function(expected_wait_time) {
        if(expected_wait_time)  {
          // now backing-off to prevent other messages from being pushed from the server
          // initially wasn't backing-off to prevent "punishment" by the server
          // https://groups.google.com/forum/#!topic/nsq-users/by5PqJsgFKw
          message.requeue(expected_wait_time, true);

        } else {

          process_opencalais_message(json, message);

        }//if-else

      });//ratelimiter.limit_app
    }//if

  });//queue.read_message

}//listen_to_opencalais


function process_opencalais_message(json, message) {
  var opencalais = json;
  var url = opencalais.url || '';
  var date_published = opencalais.date_published || null;

  // FIXME: What to do about empty date_published?
  if(date_published === null) {
    log.error({
      url: url,
      log_type: log.types.entities.EMPTY_DATE_PUBLISHED,
    }, "Empty 'date_published'.");

    metrics.meter(metrics.types.entities.EMPTY_DATE_PUBLISHED, {
      url_host: urls.parse(url).hostname,
    });

  }//if

  if(!url)  {
    log.error({
      url: url,
      log_type: log.types.entities.URL_NOT_IN_OPENCALAIS,
    }, "EMPTY url! Cannot persist Opencalais object to datastore.");

    metrics.meter(metrics.types.entities.URL_NOT_IN_OPENCALAIS, {});

    // FIXME: Really? Just bail b/c of non-existing URL?
    message.finish();
    return;
  }//if

  // extract and organize chosen 'NLP objects' from Opencalais object
  extract_nlp_objects(opencalais, message, url, date_published);
}//process_opencalais_message


function extract_nlp_objects(opencalais, message, url, date_published) {

  var PEOPLE = opencalais_config.get('PEOPLE');
  var PLACES = opencalais_config.get('PLACES');
  var COMPANIES = opencalais_config.get('COMPANIES');
  var EVENTS = opencalais_config.get('EVENTS');
  var THINGS = opencalais_config.get('THINGS');
  var RELATIONS = opencalais_config.get('RELATIONS');
  var TOPICS = opencalais_config.get('TOPICS') || [];
  var TAGS = opencalais_config.get('SOCIALTAGS') || [];
  var LANGUAGE = opencalais_config.get('LANGUAGE') || [];

  for(var hash in opencalais) {
    if(opencalais.hasOwnProperty(hash))  {
      var nlp_object = opencalais[hash];

      var nlp_type = nlp_object._type;
      var nlp_typeGroup = nlp_object._typeGroup;

      // associate this object with its ancestors:
      // 1. object.url --> Opencalais url --> Readability url --> original url
      // 2.  object.hash --> Opencalais key corresponding to this object
      nlp_object.url = url;
      nlp_object.hash = hash;

      // append date_published of parent Opencalais object.
      // FIXME: Should be the date_published of the Readability object.
      nlp_object.date_published = date_published;

      // decompose Opencalais objects into "types" for special processing
      switch(true)  {
        case PEOPLE.indexOf(nlp_type) >= 0:
          extract_people(nlp_object, url);
          break;

        case PLACES.indexOf(nlp_type) >= 0:
          extract_places(nlp_object, url);
          break;

        case COMPANIES.indexOf(nlp_type) >= 0:
          extract_companies(nlp_object, url);
          break;

        case THINGS.indexOf(nlp_type) >= 0:
          extract_things(nlp_object, url);
          break;

        case EVENTS.indexOf(nlp_type) >= 0:
          extract_events(nlp_object, url);
          break;

        case RELATIONS.indexOf(nlp_type) >= 0:
          extract_relations(nlp_object, url);
          break;

        case nlp_typeGroup === 'topics':
          extract_topics(nlp_object, url);
          break;

        case nlp_typeGroup === 'socialTag':
          extract_tags(nlp_object, url);
          break;

        case nlp_typeGroup === 'language':
          extract_language(nlp_object, url);
          break;

        default:
          extract_default(nlp_object, url);
      }//switch
    }//if
  }//for

  message.finish();

}//extract_nlp_objects


function extract_people(nlp_object, url) {
  metrics.meter(metrics.types.entities.PEOPLE, {
    url_host: urls.parse(url).hostname,
  });

  publish_message(topics.ENTITIES, nlp_object);
}//extract_people


function extract_places(nlp_object, url) {
  metrics.meter(metrics.types.entities.PLACES, {
    url_host: urls.parse(url).hostname,
  });

  // map existing latitude/longitude properties to a new 'geo_point' property
  // to satisfy Elasticsearch. Much easier than messing around with Elasticsearch transform scripts
  // http://www.elasticsearch.org/guide/en/elasticsearch/reference/current/mapping-geo-point-type.html
  var resolutions = nlp_object.resolutions || [];
  resolutions.forEach(function(resolution)  {
    var lat = resolution.latitude;
    var lon = resolution.longitude;

    if(lat && lon)  {
      resolution.geo_point = lat + "," + lon;
    }//if
  });//resolutions.forEach

  publish_message(topics.ENTITIES, nlp_object);
}//extract_places


function extract_companies(nlp_object, url) {
  metrics.meter(metrics.types.entities.COMPANIES, {
    url_host: urls.parse(url).hostname,
  });

  publish_message(topics.ENTITIES, nlp_object);
}//extract_companies


function extract_things(nlp_object, url) {
  metrics.meter(metrics.types.entities.THINGS, {
    url_host: urls.parse(url).hostname,
  });

  publish_message(topics.ENTITIES, nlp_object);
}//extract_things


function extract_events(nlp_object, url) {
  metrics.meter(metrics.types.entities.EVENTS, {
    url_host: urls.parse(url).hostname,
  });

  publish_message(topics.ENTITIES, nlp_object);
}//extract_events


function extract_relations(nlp_object, url) {
  metrics.meter(metrics.types.entities.RELATIONS, {
    url_host: urls.parse(url).hostname,
  });

  publish_message(topics.ENTITIES, nlp_object);
}//extract_relations


function extract_topics(nlp_object, url) {
  metrics.meter(metrics.types.entities.TOPICS, {
    url_host: urls.parse(url).hostname,
  });

  publish_message(topics.ENTITIES, nlp_object);
}//extract_topics()


function extract_tags(nlp_object, url) {
  metrics.meter(metrics.types.entities.TAGS, {
    url_host: urls.parse(url).hostname,
  });

  publish_message(topics.ENTITIES, nlp_object);
}//extract_tags()


function extract_language(nlp_object, url) {
  // TODO: what to do with language stats?
}//extract_language()


function extract_default(nlp_object, url) {
  // TODO: Do something useful with the Opencalais API result metadata
  if (nlp_object.info || nlp_object.meta) {

    var language = nlp_object.meta.language || undefined;

    metrics.meter(metrics.types.entities.LANGUAGE + language, {
      url_host: urls.parse(url).hostname,
    });

  } else {

    log.warn({
      url: url,
      nlp_object: nlp_object,
      log_type: log.types.entities.UNDEFINED_NLP_OBJECT,
    }, 'new, undefined _type/_typeGroup encountered.');

    metrics.meter(metrics.types.entities.UNDEFINED_NLP_OBJECT, {
      url_host: urls.parse(url).hostname,
    });

  }//if-else
}//extract_default()


function publish_message(topic, nlp_object) {
  queue.publish_message(topic, nlp_object);
}//publish_message


module.exports = {
  start: start,
};//module.exports
