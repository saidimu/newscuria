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

var appname = "search";
var log = require('_/util/logging.js')(appname);

var util = require('util');

// FIXME: hook-up bunyan logger: http://www.elasticsearch.org/guide/en/elasticsearch/client/javascript-api/current/logging.html
var search_api = require('_/util/search-api.js');
var client = search_api.client;

var index_config = require('config').get('elasticsearch').get('app').get('index');

var queue = require('_/util/queue.js');
var topics = queue.topics;

var hash = require('string-hash');

var ratelimiter = require('_/util/limitd.js');
var metrics = require('_/util/metrics.js');
var urls = require('_/util/urls.js');
var queries = require('_/util/search-queries.js');

function start()    {
  // connect to the message queue
  queue.connect(function onQueueConnect()  {
    listen_to_opencalais();
    listen_to_readability();
  });//queue.connect
}//start()


function listen_to_opencalais()  {
  var topic = topics.OPENCALAIS;
  var channel = "index-opencalais";

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


function listen_to_readability()  {
  var topic = topics.READABILITY;
  var channel = "index-to-elasticsearch";

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

          index_readability(json, message);

        }//if-else

      });//ratelimiter.limit_app
    }//if

  });//queue.read_message

}//listen_to_readability


function process_opencalais_message(json, message) {
  var opencalais = json;
  var url = opencalais.url || '';
  var date_published = opencalais.date_published || null;

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

  if(url) {
    // index individual fragments of the Opencalais message
    // easier to search this way
    split_up_opencalais(url, opencalais, message);

  } else {

    // FIXME: publish to a special queue for further analysis?
    log.error({
      url: url,
      log_type: log.types.elasticsearch.EMPTY_URL,
    }, 'Empty URL in NLP entity object');

    metrics.meter(metrics.types.elasticsearch.EMPTY_URL, {
      url: url,
      url_host: urls.parse(url).hostname
    });

    message.finish();

  }//if-else
}//process_opencalais_message


function split_up_opencalais(url, opencalais, message)  {
  // elasticsearch index and type settings
  var doc_index = 'newscuria';
  // var doc_type = 'opencalais';
  var doc_type = index_config.get(doc_index).get('opencalais');

  var children = [];

  // index(doc_index, doc_type, url, doc_hash, json, message);
  for(var key in opencalais) {
    // IMPORTANT: skip 'url' and 'doc' keys
    if ( (key !== "url") && (key !== "doc") )  {
      var child = opencalais[key];

      if(child) {
        child.child_hash = key;
        child.parent_url = url;

        // generate a unique hash used in indexing this child
        var doc_hash = hash(util.format("%s___%s", url, key));

        // elasticsearch action
        children.push({ "index": { "_id": doc_hash } });

        // request body
        children.push(child);

      } else {
        // FIXME: TODO:
        log.error({
          url: url,
        }, 'WEIRD Opencalais split-up error.');
      }

    }//if-else
  }//for

  bulk_index(doc_index, doc_type, children, message);

}//split_up_opencalais()


function index_readability(json, message) {
  var readability = json;
  var url = readability.url || '';
  var date_published = readability.date_published || null;

  // elasticsearch index and type settings
  var doc_index = 'newscuria';
  // var doc_type = 'readability';
  var doc_type = index_config.get(doc_index).get('readability');

  var doc_id = hash(url);

  if(date_published === null) {
    log.error({
      url: url,
      log_type: log.types.readability.EMPTY_DATE_PUBLISHED,
    }, "Empty 'date_published'.");

    metrics.meter(metrics.types.readability.EMPTY_DATE_PUBLISHED, {
      url_host: urls.parse(url).hostname,
    });

  }//if

  if(!url)  {
    log.error({
      url: url,
      log_type: log.types.readability.EMPTY_URL,
    }, "EMPTY url! Cannot index Readability object to elasticsearch.");

    metrics.meter(metrics.types.readability.EMPTY_URL, {});

    // FIXME: Really? Just bail b/c of non-existing URL?
    message.finish();

  } else {

    // remove some fields not needed in the index
    readability["content"] = null;
    delete readability["content"];

    // index the cleaned-up Readability
    index(doc_index, doc_type, doc_id, readability, message);

  }//if-else
}//index_readability


function bulk_index(doc_index, doc_type, body, message) {
  // https://github.com/auth0/limitd
  var limit_options = {
    bucket: appname,
    // key: 1, // TODO: FIXME: os.hostname()?
    num_tokens: 1,
  };//options

  var rateLimitCallback = function(expected_wait_time) {
    if(expected_wait_time)  {
      // now backing-off to prevent other messages from being pushed from the server
      // initially wasn't backing-off to prevent "punishment" by the server
      // https://groups.google.com/forum/#!topic/nsq-users/by5PqJsgFKw
      message.requeue(expected_wait_time, true);

    } else {

      // http://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/api-reference-1-4.html#api-bulk-1-4
      client.bulk({
        index: doc_index,
        type: doc_type,
        body: body,
        ignore: [409],  // ignore 'error' if document already exists
      }, function(err, response)  {

        if( (err) || (response.errors) ) {

          log.error({
            index: doc_index,
            doc_type: doc_type,
            err: err || filter_bulk_index_errors(response),
            response: response,
          }, 'Elasticsearch bulk index error.');

          metrics.meter(metrics.types.elasticsearch.BULK_INDEX_ERROR, {
            index: doc_index,
            doc_type: doc_type,
          });

          message.requeue();

        } else {

          log.info({
            index: doc_index,
            doc_type: doc_type,
            num_urls: response.items.length,
          }, util.format('Indexed bulk urls (%s) to Elasticsearch.', response.items.length));

          metrics.meter(metrics.types.elasticsearch.BULK_INDEX_OK, {
            index: doc_index,
            doc_type: doc_type,
            num_urls: response.items.length,
          });

          message.finish();

        }//if-else
      });//client.create

    }//if-else (expected_wait_time)

  };//rateLimitCallback


  // rate-limit this app
  ratelimiter.limit_app(limit_options, rateLimitCallback);

}//bulk_index


function index(doc_index, doc_type, doc_id, body, message) {
  // https://github.com/auth0/limitd
  var limit_options = {
    bucket: appname,
    // key: 1, // TODO: FIXME: os.hostname()?
    num_tokens: 1,
  };//options

  var rateLimitCallback = function(expected_wait_time) {
    if(expected_wait_time)  {
      // now backing-off to prevent other messages from being pushed from the server
      // initially wasn't backing-off to prevent "punishment" by the server
      // https://groups.google.com/forum/#!topic/nsq-users/by5PqJsgFKw
      message.requeue(expected_wait_time, true);

    } else {

      // http://www.elasticsearch.org/guide/en/elasticsearch/client/javascript-api/current/api-reference-1-3.html#api-bulk-1-3
      client.create({
        index: doc_index,
        type: doc_type,
        id: doc_id,
        body: body,
        ignore: [409],  // ignore 'error' if document already exists
      }, function(err, response)  {

        if(err) {

          log.error({
            id: doc_id,
            index: doc_index,
            doc_type: doc_type,
            err: err,
            response: response,
          }, 'Elasticsearch index error.');

          metrics.meter(metrics.types.elasticsearch.INDEX_ERROR, {
            index: doc_index,
            doc_type: doc_type,
          });

          message.requeue();

        } else {

          log.info({
            index: doc_index,
            doc_type: doc_type,
          }, 'Indexed url to Elasticsearch.');

          metrics.meter(metrics.types.elasticsearch.INDEX_OK, {
            index: doc_index,
            doc_type: doc_type,
          });

          message.finish();

        }//if-else
      });//client.create

    }//if-else (expected_wait_time)

  };//rateLimitCallback


  // rate-limit this app
  ratelimiter.limit_app(limit_options, rateLimitCallback);

}//index


// filter bulk index errors which are mixed in with successfull requests from the bulk index request
function filter_bulk_index_errors(response) {
  var errors = [];

  if(response.errors) {
    var items = response.items || [];

    items.forEach(function(item)  {
      if(item.status !== 201)  {
        errors.push(item);
      }//if
    });//items.forEach
  }//if-else

  return errors;

}//filter_bulk_index_errors


function opencalais_get_url_instances(url, callback) {
  // elasticsearch index and type settings
  var doc_index = 'newscuria';
  // var doc_type = 'opencalais';
  var doc_type = index_config.get(doc_index).get('opencalais');

  var query = queries.opencalais_get_url_instances(url);

  generate_api_response(url, query, doc_index, doc_type, function(api_response) {
    // only modify/trim API responses which returned results
    if(api_response.statusCode === 200) {
      var hits = api_response.results.hits.hits;

      api_response.results.meta = {
        total: api_response.results.hits.total,
      };

      api_response.results.hits = [];

      // only return the _source field as the results
      hits.forEach(function(hit)  {
        api_response.results.hits.push(hit._source);
        // delete hit._index;
        // delete hit._type;
        // delete hit._id;
        // delete hit._score;
        // delete hit.sort;
      });//hits.forEach
    }//if

    callback(api_response);

  });//generate_api_response

}//opencalais_get_url_instances


function opencalais_get_url_summary(url, callback)  {
  // elasticsearch index and type settings
  var doc_index = 'newscuria';
  // var doc_type = 'opencalais';
  var doc_type = index_config.get(doc_index).get('opencalais');

  var query = queries.opencalais_get_url_summary(url);

  generate_api_response(url, query, doc_index, doc_type, function(api_response) {
    // only modify/trim API responses which returned results
    if(api_response.statusCode === 200) {
      var hits = api_response.results.hits.hits;

      api_response.results.meta = {
        total: api_response.results.hits.total,
      };

      api_response.results.hits = [];

      // only return the _source field as the results
      hits.forEach(function(hit)  {
        api_response.results.hits.push(hit._source);
        // delete hit._index;
        // delete hit._type;
        // delete hit._id;
        // delete hit._score;
        // delete hit.sort;
      });//hits.forEach
    }//if

    callback(api_response);

  });//generate_api_response

}//opencalais_get_url_summary


function opencalais_get_url_tags(url, callback)  {
  // elasticsearch index and type settings
  var doc_index = 'newscuria';
  // var doc_type = 'opencalais';
  var doc_type = index_config.get(doc_index).get('opencalais');

  var query = queries.opencalais_get_url_tags(url);

  generate_api_response(url, query, doc_index, doc_type, function(api_response) {
    // only modify/trim API responses which returned results
    if(api_response.statusCode === 200) {
      var hits = api_response.results.hits.hits;

      api_response.results.meta = {
        total: api_response.results.hits.total,
      };

      api_response.results.hits = [];

      // only return the field 'name' as the results
      hits.forEach(function(hit)  {
        api_response.results.hits.push(hit._source.name);
        // delete hit._index;
        // delete hit._type;
        // delete hit._id;
        // delete hit._score;
        // delete hit.sort;
      });//hits.forEach
    }//if

    callback(api_response);

  });//generate_api_response

}//opencalais_get_url_tags


function opencalais_get_url_people(url, callback)  {
  // elasticsearch index and type settings
  var doc_index = 'newscuria';
  // var doc_type = 'opencalais';
  var doc_type = index_config.get(doc_index).get('opencalais');

  var query = queries.opencalais_get_url_people(url);

  generate_api_response(url, query, doc_index, doc_type, function(api_response) {
    // only modify/trim API responses which returned results
    if(api_response.statusCode === 200) {
      var hits = api_response.results.hits.hits;

      api_response.results.meta = {
        total: api_response.results.hits.total,
      };

      api_response.results.hits = [];

      // only return the field 'name' as the results
      hits.forEach(function(hit)  {
        api_response.results.hits.push(hit._source.name);
        // delete hit._index;
        // delete hit._type;
        // delete hit._id;
        // delete hit._score;
        // delete hit.sort;
      });//hits.forEach
    }//if

    callback(api_response);

  });//generate_api_response

}//opencalais_get_url_people


function opencalais_get_url_places(url, callback)  {
  // elasticsearch index and type settings
  var doc_index = 'newscuria';
  // var doc_type = 'opencalais';
  var doc_type = index_config.get(doc_index).get('opencalais');

  var query = queries.opencalais_get_url_places(url);

  generate_api_response(url, query, doc_index, doc_type, function(api_response) {
    // only modify/trim API responses which returned results
    if(api_response.statusCode === 200) {
      var hits = api_response.results.hits.hits;

      api_response.results.meta = {
        total: api_response.results.hits.total,
      };

      api_response.results.hits = [];

      // only return the field 'name' as the results
      hits.forEach(function(hit)  {
        api_response.results.hits.push(hit._source.name);
        // delete hit._index;
        // delete hit._type;
        // delete hit._id;
        // delete hit._score;
        // delete hit.sort;
      });//hits.forEach
    }//if

    callback(api_response);

  });//generate_api_response

}//opencalais_get_url_places


function opencalais_get_url_things(url, callback)  {
  // elasticsearch index and type settings
  var doc_index = 'newscuria';
  // var doc_type = 'opencalais';
  var doc_type = index_config.get(doc_index).get('opencalais');

  var query = queries.opencalais_get_url_things(url);

  generate_api_response(url, query, doc_index, doc_type, function(api_response) {
    // only modify/trim API responses which returned results
    if(api_response.statusCode === 200) {
      var hits = api_response.results.hits.hits;

      api_response.results.meta = {
        total: api_response.results.hits.total,
      };

      api_response.results.hits = [];

      // only return the field 'name' as the results
      hits.forEach(function(hit)  {
        api_response.results.hits.push(hit._source.name);
        // delete hit._index;
        // delete hit._type;
        // delete hit._id;
        // delete hit._score;
        // delete hit.sort;
      });//hits.forEach
    }//if

    callback(api_response);

  });//generate_api_response

}//opencalais_get_url_things


function opencalais_get_url_relations(url, callback)  {
  // elasticsearch index and type settings
  var doc_index = 'newscuria';
  // var doc_type = 'opencalais';
  var doc_type = index_config.get(doc_index).get('opencalais');

  var query = queries.opencalais_get_url_relations(url);

  generate_api_response(url, query, doc_index, doc_type, function(api_response) {
    // only modify/trim API responses which returned results
    if(api_response.statusCode === 200) {
      var hits = api_response.results.hits.hits;

      api_response.results.meta = {
        total: api_response.results.hits.total,
      };

      api_response.results.hits = [];

      // only return the field 'name' as the results
      hits.forEach(function(hit)  {
        api_response.results.hits.push(hit._source.name);
        // delete hit._index;
        // delete hit._type;
        // delete hit._id;
        // delete hit._score;
        // delete hit.sort;
      });//hits.forEach
    }//if

    callback(api_response);

  });//generate_api_response

}//opencalais_get_url_relations


function opencalais_get_url_companies(url, callback)  {
  // elasticsearch index and type settings
  var doc_index = 'newscuria';
  // var doc_type = 'opencalais';
  var doc_type = index_config.get(doc_index).get('opencalais');

  var query = queries.opencalais_get_url_companies(url);

  generate_api_response(url, query, doc_index, doc_type, function(api_response) {
    // only modify/trim API responses which returned results
    if(api_response.statusCode === 200) {
      var hits = api_response.results.hits.hits;

      api_response.results.meta = {
        total: api_response.results.hits.total,
      };

      api_response.results.hits = [];

      // only return the field 'name' as the results
      hits.forEach(function(hit)  {
        api_response.results.hits.push(hit._source.name);
        // delete hit._index;
        // delete hit._type;
        // delete hit._id;
        // delete hit._score;
        // delete hit.sort;
      });//hits.forEach
    }//if

    callback(api_response);

  });//generate_api_response

}//opencalais_get_url_companies


function opencalais_get_url_events(url, callback)  {
  // elasticsearch index and type settings
  var doc_index = 'newscuria';
  // var doc_type = 'opencalais';
  var doc_type = index_config.get(doc_index).get('opencalais');

  var query = queries.opencalais_get_url_events(url);

  generate_api_response(url, query, doc_index, doc_type, function(api_response) {
    // only modify/trim API responses which returned results
    if(api_response.statusCode === 200) {
      var hits = api_response.results.hits.hits;

      api_response.results.meta = {
        total: api_response.results.hits.total,
      };

      api_response.results.hits = [];

      // only return the field 'name' as the results
      hits.forEach(function(hit)  {
        api_response.results.hits.push(hit._source.name);
        // delete hit._index;
        // delete hit._type;
        // delete hit._id;
        // delete hit._score;
        // delete hit.sort;
      });//hits.forEach
    }//if

    callback(api_response);

  });//generate_api_response

}//opencalais_get_url_events


function generate_api_response(url, query, doc_index, doc_type, callback)  {
  var response = {
    url: url,
    statusCode: undefined,
    message: undefined,
    error: undefined,
    results: {
      hits: [],
      meta: {},
    },
  };//response

  // FIXME: validate url. On failure, return appropriate error message
  if(!url)  {
    response.statusCode = 400;  // http://httpstatus.es/400
    response.message = "The request cannot be fulfilled due to bad syntax.";
    response.error = "'url' parameter is required.";
    response.results.hits = [];

    return response;
  }//if

  search(doc_index, doc_type, query, function(err, results) {
    if(err) {
      response.statusCode = 500;
      response.error = "Internal Server Error";
      response.message = "A server error encountered!";
      response.results.hits = [];

      callback(response);

    } else {

      // FIXME: How to differentiate a URL that exists but doesn't match query vs. a URL that doesn't exist?
      if (results.hits.total === 0)  {
        response.statusCode = 404;
        response.message = "No URL found that matches the query submitted.";
        response.error = response.message;
        response.results.hits = [];

      } else {
        response.statusCode = 200;
        response.error = undefined;
        response.message = "Ok";

        // successfull API response will be modified by parent
        response.results.hits = results.hits;

      }//if-else

      callback(response);

    }//if-else
  });

}//generate_api_response


function search(doc_index, doc_type, query, callback)  {
  // log.info({query: query});

  client.search({
    index: doc_index,
    type: doc_type,
    body: query
  }, function (err, response) {

    if(err) {
      log.error({
        index: doc_index,
        doc_type: doc_type,
        query: query,
        err: err,
        log_type: log.types.elasticsearch.SEARCH_ERROR,
        response: response,
      }, 'Elasticsearch search error.');

      metrics.meter(metrics.types.elasticsearch.SEARCH_ERROR, {
        index: doc_index,
        doc_type: doc_type,
      });

      callback(err, undefined);

    } else {

      callback(undefined, response);

    }//if-else
  });//client.search
}//search


module.exports = {
  start                       : start,
  search                      : search,
  opencalais_get_url_summary  : opencalais_get_url_summary,
  opencalais_get_url_tags     : opencalais_get_url_tags,
  opencalais_get_url_instances: opencalais_get_url_instances,
  opencalais_get_url_people   : opencalais_get_url_people,
  opencalais_get_url_places   : opencalais_get_url_places,
  opencalais_get_url_things   : opencalais_get_url_things,
  opencalais_get_url_relations: opencalais_get_url_relations,
  opencalais_get_url_companies: opencalais_get_url_companies,
  opencalais_get_url_events   : opencalais_get_url_events,
};//module.exports
