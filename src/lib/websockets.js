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

var appname = "websockets";
var log = require('_/util/logging.js')(appname);

var fs = require('fs');
var util = require('util');

var app = require('http').createServer(http_handler);
var io = require('socket.io')(app);

var queue = require('_/util/queue.js');
var topics = queue.topics;

var websocket_events = {
  URL: 'url',
  ACK: 'ack',
  STATUS: 'status',
  ENTITIES: 'entities'
};//websocket_events

var websocket;

//==BEGIN here
app.listen(8080, function onAppListen() {
  var address = app.address();

  log.info({
    address: address.address,
    port: address.port
  }, "Listening...");
});

// connect to the message queue
// then start listening for websocket messages
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


function start() {
  io.on('connection', function onSocketConnect(socket) {
    websocket = socket;

    emit(websocket_events.STATUS, {
      status: 'Connected to Socket.io server!'
    });

    websocket.on(websocket_events.URL, url_msg_processor);

    listen_to_entities();
  });
}//start()


function url_msg_processor(msg)	{
	log.info({
    websockets_msg: msg
  }, "RECEIVED from websocket.");

	if(msg.url)	{
		queue.publish_message(topics.URLS_RECEIVED, {
      url: msg.url
    });

    emit(websocket_events.ACK, msg.url);

	} else {
		log.error({
      websockets_msg: msg
    }, "No URL found in websockets payload.");

	}//if-else
}//url_msg_processor


function listen_to_entities()	{
  var topic = topics.ENTITIES;
  var channel = "send-to-browser";

  queue.read_message(topic, channel, function onReadMessage(err, json, message) {
    if(err) {
      log.error("Error geting message from queue!");
    } else {
      process_entities(json, message);
    }//if-else
  });

}//listen_to_entities


function process_entities(json, message)	{
	var entities = json;

	emit(websocket_events.ENTITIES, entities);

//  log.debug({
//    entities: entities,
//  }, "Entities sent via websockets.");

	message.finish();
}//process_entities


function emit(event, message) {
  log.debug({
    websocket_event: event,
  }, "Emiting websockets event.");

  websocket.emit(event, message);
}//emit()


function http_handler (req, res) {
	fs.readFile(__dirname + '/util/websockets.html', function (err, data) {
		if (err) {
		  res.writeHead(500);
		  return res.end('Error loading realtime.html');
		}//if

		res.writeHead(200);
		res.end(data);
	});
}//http_handler
