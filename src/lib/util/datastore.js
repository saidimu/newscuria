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

var appname = "datastore";
var log = require('_/util/logging.js')(appname);

var util = require('util');

var datastore_api = require('_/util/datastore-api.js');
var client = datastore_api.client;

var queue = require('_/util/queue.js');
var topics = queue.topics;

function start()    {
  // connect to the message queue
  queue.connect(function onQueueConnect()  {
    listen_to_urls_received();
    listen_to_readability();
    listen_to_opencalais();
  });//queue.connect
}//start


function listen_to_urls_received()  {
  var topic = topics.URLS_RECEIVED;
  var channel = "save-to-datastore";

  queue.read_message(topic, channel, function onReadMessage(err, json, message) {
    if(!err) {
      process_url_received_message(json, message);
    }//if
  });
}//listen_to_urls_received


function listen_to_readability()  {
  var topic = topics.READABILITY;
  var channel = "save-to-datastore";

  queue.read_message(topic, channel, function onReadMessage(err, json, message) {
    if(!err) {
      process_readability_message(json, message);
    }//if
  });
}//listen_to_readability


function listen_to_opencalais()  {
  var topic = topics.OPENCALAIS;
  var channel = "save-to-datastore";

  queue.read_message(topic, channel, function onReadMessage(err, json, message) {
    if(!err) {
      process_opencalais_message(json, message);
    }//if
  });
}//listen_to_opencalais


function process_url_received_message(json, message) {
  var url = json.url || '';

  var insert_stmt = "INSERT INTO nuzli.received_urls (url, latest_received_date) VALUES (?, ?)";
  var received_date = new Date().toISOString();
  var params = [url, received_date];

  // log.info({
  //   url: url,
  //   table: 'nuzli.received_urls',
  // }, "Persisting to datastore");

  client.execute(insert_stmt, params, function onDatastoreClientExecute(err, response) {
    if(err) {
      log.error({
        err: err,
        insert_stmt: insert_stmt,
        table: 'nuzli.received_urls',
        log_type: log.types.datastore.INSERT_ERROR,
      });
    }//if
  });

  message.finish();

}//process_url_received_message


function process_readability_message(json, message) {
  var readability = json;

  var url = readability.url;
//  var date_published = readability.date_published || "1970-01-01 00:00:00 +0000";
  var date_published = readability.date_published || null;
  var author = readability.author || '';
  var domain = readability.domain || '';
  var word_count = readability.word_count || 0;

  if(date_published === null) {
		log.error({
      url: url,
      log_type: log.types.readability.EMPTY_DATE_PUBLISHED,
    }, "Empty 'date_published' in Readability object.");
  }//if

  if(author === '') {
		log.error({
      url: url,
      log_type: log.types.readability.EMPTY_AUTHOR,
    }, "Empty 'author' in Readability object.");
  }//if

  if(domain === '') {
		log.error({
      url: url,
      log_type: log.types.readability.EMPTY_DOMAIN,
    }, "Empty 'domain' in Readability object.");
  }//if

  // save Readability object to datastore
  save_document(
    readability,
    url,
    date_published,
    "readability"
  );//save_document

  // save author metadata to datastore
  save_author_metadata(
    author,
    url,
    word_count,
    date_published,
    "author_urls"
  );//save_author_metadata

  // save domain metadata to datastore
  save_domain_metadata(
    domain,
    url,
    word_count,
    date_published,
    "domain_urls"
  );//save_domain_metadata

  message.finish();

}//process_readability_message


function process_opencalais_message(json, message) {
  var opencalais = json;
  var url = opencalais.url || '';
  var date_published = opencalais.date_published || null;

  if(date_published === null) {
		log.error({
      url: url,
      log_type: log.types.opencalais.EMPTY_DATE_PUBLISHED,
    }, "Empty 'date_published' in Opencalais object.");
  }//if

  if(!url)  {
    log.error({
      url: url,
      log_type: log.types.opencalais.EMPTY_URL,
    }, "EMPTY url in Opencalais object. Cannot persist to datastore.");

    return;
  }//if

  // persist Opencalais object to datastore
  save_document(
    opencalais,
    url,
    date_published,
    "opencalais"
  );//save_document

  message.finish();

}//process_opencalais_message


function save_domain_metadata(domain, url, word_count, date_published, table, callback) {
  // log.info({
  //   url: url,
  //   table: table,
  // }, "Persisting to datastore");

  if(!callback)   {
    callback = function(err, result)  {
      if(err)   {
        log.error({
          url: url,
          err: err,
          table: table,
          log_type: log.types.datastore.INSERT_ERROR,
        }, 'Error persisting domain metadata to datastore');
      }//if
    };//callback
  }//if

  if(!domain) {
    // FIXME: publish these to a topic for further analysis
    log.error({
      url: url,
      log_type: log.types.datastore.EMPTY_DOMAIN,
    }, "EMPTY domain name for url");
  }//if

  var statement = util.format('INSERT INTO %s (domain, url, word_count, date_published, created_date) VALUES (?, ?, ?, ?, ?)', table);

  var date_published_iso = date_string_to_iso_object(date_published, url);

  var params = [
      domain,
      url,
      word_count,
      date_published_iso,
      datastore_api.types.timeuuid()
  ];

  client.execute(statement, params, callback);
}//save_domain_metadata


function save_author_metadata(author, url, word_count, date_published, table, callback) {
  // log.info({
  //   url: url,
  //   table: table,
  // }, "Persisting to datastore");

  if(!callback)   {
    callback = function(err, result)  {
      if(err)   {
        log.error({
          url: url,
          err: err,
          table: table,
          log_type: log.types.datastore.INSERT_ERROR,
        }, 'Error persisting author metadata to datastore');
      }//if
    };//callback
  }//if

  if(!author) {
    // FIXME: publish these to a topic for further analysis
    log.error({
      url: url,
      log_type: log.types.datastore.EMPTY_AUTHOR,
    }, "EMPTY author name for url");
  }//if

  var statement = util.format('INSERT INTO %s (author, url, word_count, date_published, created_date) VALUES (?, ?, ?, ?, ?)', table);

  var date_published_iso = date_string_to_iso_object(date_published, url);

  var params = [
      author,
      url,
      word_count,
      date_published_iso,
      datastore_api.types.timeuuid()
  ];

  client.execute(statement, params, callback);
}//save_author_metadata


function save_document(object, url, date_published, table, callback)    {
  // log.info({
  //   url: url,
  //   table: table,
  // }, "Persisting to datastore");

  if(!callback)   {
    callback = function(err, result)  {
      if(err)   {
        log.error({
          url: url,
          err: err,
          table: table,
          log_type: log.types.datastore.INSERT_ERROR,
        }, 'Error persisting document to datastore');
      }//if
    };//callback
  }//if

  if(!object) {
    log.error({
      url: url,
      table: table,
      log_type: log.types.datastore.EMPTY_OBJECT,
    }, "EMPTY object cannot be saved to table.");

    return;
  }//if

  var statement = util.format('INSERT INTO %s (url, api_result, date_published, created_date) VALUES (?, ?, ?, ?)', table);

  var buf;

  try {

    buf = new Buffer(JSON.stringify(object), 'utf8');

  } catch(error)  {
    log.error({
      err: error,
      json: object,
      log_type: log.types.datastore.JSON_PARSE_ERROR,
    }, "Error converting JSON object to a Buffer object;");

    return;
  }//try-catch

  var date_published_iso = date_string_to_iso_object(date_published, url);

  var params = [
      url,
      buf,
      date_published_iso,
      datastore_api.types.timeuuid()
  ];

  client.execute(statement, params, callback);
}//save_document


function date_string_to_iso_object(date_string, url)  {
  var iso_object;

  try {

    iso_object = new Date(date_string).toISOString();

  } catch(err)  {
    log.error({
      url: url,
      err: err,
      date_string: date_string,
      log_type: log.types.datastore.DATE_CONVERSION_ERROR,
    }, "Cannot convert date string to Date object.");

    iso_object = new Date('1970-01-01 00:00:00 +0000').toISOString();
  }//try-catch

  return iso_object;
}//date_string_to_iso_object


module.exports = {
  start: start,
};//module.exports
