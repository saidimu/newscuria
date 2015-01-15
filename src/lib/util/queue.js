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
var lookupdHTTPAddresses = config.reader.get('lookupdHTTPAddresses');

var topics = {
	URLS_RECEIVED: "newscuria.urls_received",
	URLS_APPROVED: "newscuria.urls_approved",
	URLS_DENIED: "newscuria.urls_denied",
	OPENCALAIS: "newscuria.opencalais",
	READABILITY: "newscuria.readability",
  ENTITIES: "newscuria.entities",
};//topics

var writer = undefined;

function connect(callback) {
  var nsqd_writer = new nsq.Writer(nsqd_host, nsqd_port);

  nsqd_writer.on('error', function(err) {
    log.error({err: err}, "nsqd Writer error.");
    
    callback(err);
  });//writer.on

  nsqd_writer.on('ready', function() {
    log.info("nsqd Writer ready.");

    writer = nsqd_writer;
    
    callback(undefined);
  });//writer.on

  nsqd_writer.on('closed', function() {
    log.info("nsqd Writer closed.");
  });//writer.on

  nsqd_writer.connect();
}//connect()


function read_message(topic, channel, callback)	{
	if(channel === undefined)	{
		log.fatal("Must provide a channel name to listen on.");
		throw new Error("Must provide a channel name to listen on.");
	}//if

  // https://github.com/dudleycarr/nsqjs#new-readertopic-channel-options
  var options = {
    maxInFlight: config.reader.get('maxInFlight'),
    maxAttempts: config.reader.get('maxAttempts'),
    requeueDelay: config.reader.get('requeueDelay'),  // in seconds
    lookupdHTTPAddresses: lookupdHTTPAddresses,
    lookupdPollInterval: config.reader.get('lookupdPollInterval'),  // in seconds
  };//options

	var reader = new nsq.Reader(topic, channel, options);

  reader.on('message', function onMessage(message) {
    // get JSON message payload
    try {
      var json = message.json();
      callback(undefined, json, message);

    } catch(err)  {
      message.body = '';  // hide verbose message body from logging
      log.error({
        topic: topic,
        channel: channel,
        err: err,
        queue_msg: message,
      }, "Error geting message from queue!");

      callback(err, undefined, message);
    }//try-catcg
  });

  reader.on('error', function onError(err) {
    log.error({
      topic: topic,
      channel: channel,
      err: err,
      options: options
    }, "nsq Reader error.");

    callback(err, undefined);
  });

  reader.on('nsqd_connected', function onNsqdConnected(host, port) {
    log.info({
      topic: topic,
      channel: channel,
      nsqd_host: host,
      nsqd_port: port,
      options: options
    }, "Reader connected to nsqd.");

    // callback(undefined, reader);
    // return reader;
  });

  reader.on('nsqd_closed', function onNsqdClosed(host, port) {
    log.info({
      topic: topic,
      channel: channel,
      nsqd_host: host,
      nsqd_port: port,
      options: options
    }, "Reader disconnected from nsqd.");
  });

	reader.connect();
}//read_message()


function publish_message(topic, message)	{
  log.debug({
    topic: topic,
    // payload: message,
  }, "Publishing message.");

	writer.publish(topic, message);
}//publish_message


module.exports = {
  connect: connect,
	read_message: read_message,
	publish_message: publish_message,
	topics: topics,
};//module.exports