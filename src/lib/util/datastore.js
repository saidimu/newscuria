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

var ratelimiter = require('_/util/limitd.js');
var metrics = require('_/util/metrics.js');
var urls = require('_/util/urls.js');

function start()    {
  // connect to the message queue
  queue.connect(function onQueueConnect()  {
    // listen_to_urls_received();
    listen_to_readability();
    listen_to_opencalais();
  });//queue.connect
}//start


function listen_to_urls_received()  {
  var topic = topics.URLS_RECEIVED;
  var channel = "save-to-datastore";

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

          process_url_received_message(json, message);

        }//if-else(expected_wait_time)

      });//ratelimiter.limit_app

    }//if
  });
}//listen_to_urls_received


function listen_to_readability()  {
  var topic = topics.READABILITY;
  var channel = "save-to-datastore";

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

          process_readability_message(json, message);

        }//if-else(expected_wait_time)

      });//ratelimiter.limit_app

    }//if
  });
}//listen_to_readability


function listen_to_opencalais()  {
  var topic = topics.OPENCALAIS;
  var channel = "save-to-datastore";

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

        }//if-else(expected_wait_time)

      });//ratelimiter.limit_app

    }//if
  });
}//listen_to_opencalais


function process_url_received_message(json, message) {
  var url = json.url || '';
  var table = 'received_urls';
  var insert_stmt = util.format("INSERT INTO %s (url, latest_received_date) VALUES ($1, $2)", table);
  var received_date = new Date().toISOString();
  var params = [url, received_date];

  client.query({
    text: insert_stmt,
    values: params,
  }, function onDatastoreClientExecute(err, response) {
    if(err) {
      log.error({
        err: err,
        insert_stmt: insert_stmt,
        table: 'received_urls',
      });

      metrics.meter(metrics.types.datastore.INSERT_ERROR, {
        table: table,
        url_host: urls.parse(url).hostname,
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
    }, "Empty 'date_published' in Readability object.");

    metrics.meter(metrics.types.readability.EMPTY_DATE_PUBLISHED, {
      url_domain: domain,
      url_host  : urls.parse(url).hostname,
    });

  }//if

  if(author === '') {
		log.error({
      url: url,
    }, "Empty 'author' in Readability object.");

    metrics.meter(metrics.types.readability.EMPTY_AUTHOR, {
      url_domain: domain,
      url_host  : urls.parse(url).hostname,
    });

  }//if

  if(domain === '') {
		log.error({
      url: url,
    }, "Empty 'domain' in Readability object.");

    metrics.meter(metrics.types.readability.EMPTY_DOMAIN, {
      url_host  : urls.parse(url).hostname,
    });

  }//if

  // save Readability object to datastore
  save_document(
    readability,
    url,
    date_published,
    "readability"
  );//save_document

  // save author metadata to datastore
  // save_author_metadata(
  //   author,
  //   url,
  //   word_count,
  //   date_published,
  //   "author_urls"
  // );//save_author_metadata

  // save domain metadata to datastore
  // save_domain_metadata(
  //   domain,
  //   url,
  //   word_count,
  //   date_published,
  //   "domain_urls"
  // );//save_domain_metadata

  message.finish();

}//process_readability_message


function process_opencalais_message(json, message) {
  var opencalais = json;
  var url = opencalais.url || '';
  var date_published = opencalais.date_published || null;

  if(date_published === null) {
		log.error({
      url: url,
    }, "Empty 'date_published' in Opencalais object.");

    metrics.meter(metrics.types.opencalais.EMPTY_DATE_PUBLISHED, {
      url_host: urls.parse(url).hostname,
    });

  }//if

  if(!url)  {
    log.error({
      url: url,
    }, "EMPTY url in Opencalais object. Cannot persist to datastore.");

    metrics.meter(metrics.types.opencalais.EMPTY_URL, {});

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
  if(!callback)   {
    callback = function(err, result)  {
      if(err)   {
        log.error({
          url: url,
          err: err,
          table: table,
        }, 'Error persisting domain metadata to datastore');

        metrics.meter(metrics.types.datastore.INSERT_ERROR, {
          table: table,
          url_domain: domain,
          url_host: urls.parse(url).hostname,
        });

      }//if

    };//callback
  }//if

  if(!domain) {
    // FIXME: publish these to a topic for further analysis
    log.error({
      url: url,
    }, "EMPTY domain name for url");

    metrics.meter(metrics.types.datastore.EMPTY_DOMAIN, {
      table: table,
      url_host: urls.parse(url).hostname,
    });

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

  client.query({
    text: statement,
    values: params
  }, callback);

}//save_domain_metadata


function save_author_metadata(author, url, word_count, date_published, table, callback) {
  if(!callback)   {
    callback = function(err, result)  {
      if(err)   {
        log.error({
          url: url,
          err: err,
          table: table,
        }, 'Error persisting author metadata to datastore');

        metrics.meter(metrics.types.datastore.INSERT_ERROR, {
          table: table,
          url_host: urls.parse(url).hostname,
        });

      }//if
    };//callback
  }//if

  if(!author) {
    // FIXME: publish these to a topic for further analysis
    log.error({
      url: url,
    }, "EMPTY author name for url");

    metrics.meter(metrics.types.datastore.EMPTY_AUTHOR, {
      table: table,
      url_host: urls.parse(url).hostname,
    });

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

  client.query({
    text: statement,
    values: params
  }, callback);
}//save_author_metadata


function save_document(object, url, date_published, table, callback)    {
  if(!callback)   {
    callback = function(err, result)  {
      if(err)   {
        log.error({
          url: url,
          err: err,
          table: table,
        }, 'Error persisting document to datastore');

        metrics.meter(metrics.types.datastore.INSERT_ERROR, {
          table: table,
          url_host: urls.parse(url).hostname,
        });
      }//if

    };//callback
  }//if

  if(!object) {
    log.error({
      url: url,
      table: table,
    }, "EMPTY object cannot be saved to table.");

    metrics.meter(metrics.types.datastore.EMPTY_OBJECT, {
      table: table,
      url_host: urls.parse(url).hostname,
    });

    return;
  }//if

  var statement = util.format('INSERT INTO %s (url, api_result, date_published, created_date) VALUES ($1, $2, $3, $4)', table);

  var date_published_iso = date_string_to_iso_object(date_published, url);

  var params = [
      url,
      object,
      date_published_iso,
      new Date().toISOString()
  ];

  client.query({
    text: statement,
    values: params
  }, callback);
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
    }, "Cannot convert date string to Date object.");

    metrics.meter(metrics.types.datastore.DATE_CONVERSION_ERROR, {
      url_host: urls.parse(url).hostname,
    });

    // iso_object = new Date('1970-01-01 00:00:00 +0000').toISOString();
    iso_object = null;
  }//try-catch

  return iso_object;
}//date_string_to_iso_object


module.exports = {
  start: start,
};//module.exports
