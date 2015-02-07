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

var appname = process.env.APP_NAME;
var log = require('_/util/logging.js')(appname);

var fs = require('fs');
var util = require('util');

var app = require('http').createServer(http_handler);
var io = require('socket.io')(app);

var mixpanel = require('_/util/mixpanel.js');
var event_type = mixpanel.event_type;

var queue = require('_/util/queue.js');
var topics = queue.topics;

var client_events = {
  URL: 'url',
  ACK: 'ack',
  STATUS: 'status',
  ENTITIES: 'entities'
};//client_events

var client_socket;
var queue_reader;

//==BEGIN here
app.listen(8080, function onAppListen() {
  var address = app.address();

  log.info({
    address: address.address,
    port: address.port
  }, "Listening...");

  mixpanel.track(event_type.websockets.server.LISTENING);
});

// connect to the message queue
// then start listening for client_socket messages
queue.connect(start);
//==BEGIN here


function start() {
  io.on('connection', function onSocketConnect(socket) {
    mixpanel.track(event_type.websockets.client.CONNECTED);

    client_socket = socket;

    emit(client_events.STATUS, {
      status: 'Connected to Socket.io server!'
    });

    client_socket.on(client_events.URL, function(msg) {
      mixpanel.track(event_type.websockets.client.MESSAGE);
      url_msg_processor(msg);
    });//client_socket.on

    // close open connections to the queue server
    // FIXME: reuse these connections instead of closing them
    client_socket.on('disconnect', function()  {
      mixpanel.track(event_type.websockets.client.DISCONNECTED);

      log.debug({
        client_id: client_socket.id,
        req: client_socket.request,
        queue_reader: queue_reader,
      }, "Websocket client disconnected. Starting disconnection from NSQ reader.");

      queue_reader.close();
    });//client_socket.on('disconnect')

    listen_to_entities();
  });
}//start()


function url_msg_processor(msg)	{
	if(msg.url)	{

		queue.publish_message(topics.URLS_RECEIVED, {
      url: msg.url
    });

	} else {

    mixpanel.track(event_type.websockets.client.URL_ERROR);

		log.error({
      client_sockets_msg: msg
    }, "URL not found in client_sockets payload.");

	}//if-else
}//url_msg_processor


function listen_to_entities()	{
  var topic = topics.ENTITIES;
  var channel = "send-to-browser";

  queue.read_message(topic, channel, function onReadMessage(err, json, message, reader) {
    queue_reader = reader;

    if(!err) {
      process_entities(json, message);
    }//if-else
  });

}//listen_to_entities


function process_entities(json, message)	{
	var entities = json;

	emit(client_events.ENTITIES, entities);

	message.finish();
}//process_entities


function emit(event, message) {
  mixpanel.track(event_type.websockets.server.EMITTED_TO_CLIENT);

  client_socket.emit(event, message);
}//emit()


function http_handler (req, res) {
	fs.readFile(__dirname + '/util/client_sockets.html', function (err, data) {
		if (err) {
		  res.writeHead(500);
		  return res.end('Error loading realtime.html');
		}//if

		res.writeHead(200);
		res.end(data);
	});
}//http_handler
