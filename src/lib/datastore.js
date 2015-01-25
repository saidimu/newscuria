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

var appname = process.env.APP_NAME;
var log = require('_/util/logging.js')(appname);

// var _ = require('lodash');
// var fs = require('fs');
var util = require('util');

var queue = require('_/util/queue.js');
var topics = queue.topics;

var datastore_api = require('_/util/datastore-api.js');
var client = datastore_api.client;

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
  listen_to_urls_received();
  listen_to_readability();
  listen_to_opencalais();
}//start


function listen_to_urls_received()  {
  var topic = topics.URLS_RECEIVED;
  var channel = "save-to-datastore";

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
      process_url_received_message(json, message);
    }//if-else
  });
}//listen_to_urls_received


function listen_to_readability()  {
  var topic = topics.READABILITY;
  var channel = "save-to-datastore";

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
      process_readability_message(json, message);
    }//if-else
  });
}//listen_to_readability


function listen_to_opencalais()  {
  var topic = topics.OPENCALAIS;
  var channel = "save-to-datastore";

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


function process_url_received_message(json, message) {
  var url = json.url || '';

  var insert_stmt = "INSERT INTO nuzli.received_urls (url, latest_received_date) VALUES (?, ?)";
  var received_date = new Date().toISOString();
  var params = [url, received_date];

  log.info({
    url: url,
    table: 'nuzli.received_urls',
  }, "Persisting to datastore");

  client.execute(insert_stmt, params, function(error, response) {
    if(error) {
      log.error({
        err: error
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
  var author = readability.author || "";
  var domain = readability.domain || "";
  var word_count = readability.word_count || 0;

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

  if(!url)  {
    log.error({
      url: url
    }, "EMPTY url! Cannot persist Opencalais object to datastore.");
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
  log.info({
    url: url,
    table: table,
  }, "Persisting to datastore");

  if(!callback)   {
    callback = function(error, result)  {
      if(error)   {
          log.error({err: error});
      }//if-else
    };
  }//if

  if(!domain) {
    log.error({
      url: url
    }, "EMPTY domain name for url");
  }//if

  var statement = util.format('INSERT INTO %s (domain, url, word_count, date_published, created_date) VALUES (?, ?, ?, ?, ?)', table);

  var date_published_object;

  try {
    date_published_object = new Date(date_published).toISOString();
  } catch(error)  {
    log.error({
      date_published_string: date_published,
    }, "Cannot convert date string to Date object.");
  }//try-catch

  var params = [
      domain,
      url,
      word_count, 
      date_published_object,
      datastore_api.types.timeuuid()
  ];

  client.execute(statement, params, callback);
}//save_domain_metadata


function save_author_metadata(author, url, word_count, date_published, table, callback) {
  log.info({
    url: url,
    table: table,
  }, "Persisting to datastore");

  if(!callback)   {
    callback = function(error, result)  {
      if(error)   {
        log.error({err: error});
      }//if-else
    };
  }//if

  if(!author) {
    log.error({
      url: url
    }, "EMPTY author name for url");
  }//if

  var statement = util.format('INSERT INTO %s (author, url, word_count, date_published, created_date) VALUES (?, ?, ?, ?, ?)', table);

  var date_published_object;

  try {
    date_published_object = new Date(date_published).toISOString();
  } catch(error)  {
    log.error({
      date_published_string: date_published,
    }, "Cannot convert date string to Date object.");
  }//try-catch

  var params = [
      author,
      url,
      word_count,
      date_published_object,
      datastore_api.types.timeuuid()
  ];

  client.execute(statement, params, callback);
}//save_author_metadata


function save_document(object, url, date_published, table, callback)    {
  log.info({
    url: url,
    table: table,
  }, "Persisting to datastore");

  if(!callback)   {
    callback = function(error, result)  {
      if(error)   {
        log.error({err: error});
      }//if-else
    };
  }//if

  if(!object) {
    log.error({
      url: url,
      table: table,
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
    }, "Error converting JSON object to a Buffer object;");

    return;
  }//try-catch

  var date_published_object;

  try {
    date_published_object = new Date(date_published).toISOString();
  } catch(error)  {
    log.error({
      date_published_string: date_published,
    }, "Cannot convert date string to Date object.");
  }//try-catch

  var params = [
      url,
      buf,
      date_published_object,
      datastore_api.types.timeuuid()
  ];

  client.execute(statement, params, callback);
}//save_document