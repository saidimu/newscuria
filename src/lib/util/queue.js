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

var appname = "queue";
var log = require('_/util/logging.js')(appname);

var nsq = require('nsqjs');
var util = require('util');

var config = require('config').get("nsqd");
var nsqd_host = config.writer.get('host');
var nsqd_port = config.writer.get('port');

var metrics = require('_/util/metrics.js');

var topics = {
  URLS_RECEIVED      : "newscuria.urls_received",
  URLS_APPROVED      : "newscuria.urls_approved",
  URLS_DENIED        : "newscuria.urls_denied",
  OPENCALAIS         : "newscuria.opencalais",
  READABILITY        : "newscuria.readability",
  ENTITIES           : "newscuria.entities",
  ENTITIES_PEOPLE    : "newscuria.entities.people",
  ENTITIES_PLACES    : "newscuria.entities.places",
  ENTITIES_COMPANIES : "newscuria.entities.companies",
  ENTITIES_THINGS    : "newscuria.entities.things",
  ENTITIES_EVENTS    : "newscuria.entities.events",
  ENTITIES_RELATIONS : "newscuria.entities.relations",
  ENTITIES_TOPICS    : "newscuria.entities.topics",
  ENTITIES_TAGS      : "newscuria.entities.tags",
};//topics

var writer;

function connect(callback) {
  if (!callback)  {
    callback = console.log;
  }//if

  var nsqd_writer = new nsq.Writer(nsqd_host, nsqd_port);

  nsqd_writer.on('error', function(err) {
    if(err) {
      log.fatal({
        err: err,
        log_type: log.types.queue.writer.ERROR,
      }, "nsqd Writer error.");

      metrics.meter(log.types.queue.writer.ERROR, {
        nsqd_host: nsqd_host,
        nsqd_port: nsqd_port
      });

    }//if
  });//writer.on


  nsqd_writer.on('ready', function() {
    log.info({
      log_type: log.types.queue.writer.READY,
    }, "nsqd Writer ready.");

    metrics.meter(log.types.queue.writer.READY, {
      nsqd_host: nsqd_host,
      nsqd_port: nsqd_port
    });

    writer = nsqd_writer;

    callback();
  });//writer.on

  nsqd_writer.on('closed', function() {
    log.info({
      log_type: log.types.queue.writer.CLOSED,
    }, "nsqd Writer closed.");

    metrics.meter(log.types.queue.writer.CLOSED, {
      nsqd_host: nsqd_host,
      nsqd_port: nsqd_port
    });

  });//writer.on

  nsqd_writer.connect();
}//connect()


function read_message(topic, channel, callback)	{
	if(channel === undefined)	{
		log.fatal({
      log_type: log.types.queue.reader.INVALID_CHANNEL_NAME,
    }, "Must provide a channel name to listen on.");

    metrics.meter(log.types.queue.reader.INVALID_CHANNEL_NAME, {
      topic  : topic,
      channel: channel,
    });

		throw new Error("Must provide a channel name to listen on.");
	}//if

  // https://github.com/dudleycarr/nsqjs#new-readertopic-channel-options
  var options = {
    maxInFlight          : config.reader.get('maxInFlight'),
    maxAttempts          : config.reader.get('maxAttempts'),
    requeueDelay         : config.reader.get('requeueDelay'),  // in seconds
    nsqdTCPAddresses     : config.reader.get('nsqdTCPAddresses'),
    // lookupdHTTPAddresses : config.reader.get('lookupdHTTPAddresses'),
    // lookupdPollInterval  : config.reader.get('lookupdPollInterval'),  // in seconds
  };//options

	var reader = new nsq.Reader(topic, channel, options);

  reader.on('message', function onMessage(message) {
    var message_attempts = message.attempts || undefined;

    metrics.histogram(metrics.types.queue.message.PROCESSING_ATTEMPTS, {
      topic: topic,
      channel: channel,
      options: options,
    }, message_attempts);

    // get JSON message payload
    try {
      var json = message.json();

      callback(undefined, json, message, reader);

    } catch(err)  {
      message.body = '';  // hide verbose message body from logging

      log.error({
        topic: topic,
        channel: channel,
        options: options,
        message_attempts: message_attempts,
        err: err,
        log_type: log.types.queue.reader.MESSAGE_ERROR,
      }, "Error getting message from queue!");

      metrics.meter(log.types.queue.reader.MESSAGE_ERROR, {
        topic        : topic,
        channel      : channel,
        message_attempts: message_attempts,
        options      : options,
      });

      // FIXME: save these json-error messages for analysis
      try {

        message.finish();

      } catch(err)  {
        log.error({
          topic: topic,
          channel: channel,
          json: json,
          err: err,
          log_type: log.types.queue.message.FINISH_ERROR,
        }, "Error executing message.finish()");

        metrics.meter(log.types.queue.message.FINISH_ERROR, {
          topic  : topic,
          channel: channel,
        });

      }//try-catch

    }//try-catch
  });//reader,on


  reader.on('error', function onError(err) {
    log.error({
      topic: topic,
      channel: channel,
      err: err,
      options: options,
      log_type: log.types.queue.reader.ERROR,
    }, "nsq Reader error.");

    metrics.meter(log.types.queue.reader.ERROR, {
      topic  : topic,
      channel: channel,
      options: options,
    });

    callback(err, undefined, undefined, reader);
  });//reader.on


  reader.on('nsqd_connected', function onNsqdConnected(host, port) {
    log.info({
      topic    : topic,
      channel  : channel,
      nsqd_host: host,
      nsqd_port: port,
      options  : options,
      log_type : log.types.queue.reader.NSQD_CONNECTED,
    }, "Reader connected to nsqd.");

    metrics.meter(log.types.queue.reader.NSQD_CONNECTED, {
      topic    : topic,
      channel  : channel,
      nsqd_host: host,
      nsqd_port: port,
      options  : options,
    });

  });//reader.on


  reader.on('nsqd_closed', function onNsqdClosed(host, port) {
    log.info({
      topic    : topic,
      channel  : channel,
      nsqd_host: host,
      nsqd_port: port,
      options  : options,
      log_type : log.types.queue.reader.NSQD_CLOSED,
    }, "Reader disconnected from nsqd.");

    metrics.meter(log.types.queue.reader.NSQD_CLOSED, {
      topic    : topic,
      channel  : channel,
      nsqd_host: host,
      nsqd_port: port,
      options  : options,
    });

  });//reader.on


	reader.connect();
}//read_message()


function publish_message(topic, message)	{
	writer.publish(topic, message, function(err) {
    if(err) {
      log.error({
        topic: topic,
        err: err,
        log_type: log.types.queue.writer.ERROR,
      }, "nsq Writer error: message not published.");

      metrics.meter(log.types.queue.writer.ERROR, {
        topic: topic,
      });
    }//if
  });//writer.publish
}//publish_message


module.exports = {
  connect: connect,
	read_message: read_message,
	publish_message: publish_message,
	topics: topics,
};//module.exports
