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

var appname = "mixpanel";
var log = require('_/util/logging.js')(appname);

var config = require('config').get("mixpanel");

var MIXPANEL_TOKEN = config.get('token');

// grab the Mixpanel factory
var Mixpanel = require('mixpanel');

// create an instance of the mixpanel client
var mixpanel = Mixpanel.init(MIXPANEL_TOKEN);

// application's mixpanel events
var events = {};

// QUEUE events
events.queue = {};

// QUEUE writer events
events.queue.writer = {
  READY: 'queue_writer_ready',
  ERROR: 'queue_writer_error',
  CLOSED: 'queue_writer_closed',
};//events.queue

// QUEUE message events
events.queue.message = {
  PUBLISHED: 'queue_message_published',
  READ_ERROR: 'queue_message_read_error',
  FINISH_ERROR: 'queue_message_finish_error',
};//events.queue.message

// WEBSOCKET events
events.websockets = {};

// WEBSOCKET server events
events.websockets.server = {
  LISTENING: 'websockets_server_listening',
  EMITTED_TO_CLIENT: 'websockets_server_emitted_to_client'
};//events.websockets.server

// WEBSOCKET client events
events.websockets.client = {
  CONNECTED: 'websockets_connection_from_client',
  DISCONNECTED: 'websockets_disconnection_from_client',
  MESSAGE: 'websockets_client_message',
};//events.websockets.client

// URL processing events
events.url = {
  ERROR: 'url_processing_error'
};//events.url

// KIMONO webhook events
events.kimono = {
  WEBHOOK: 'kimono_webhook',
};//events.kimono

function track(event, data) {
  var callback = function(err) {
    if (err) {
      log.error({
        err: err,
        event: event,
        data: data
      }, "Error tracking Mixpanel event.");
    }//if
  };//callback

  if(data)  {
    mixpanel.track(event, data, callback);
  } else {
    mixpanel.track(event, callback);
  }//if-else
}//track

module.exports = {
  events: events,
  track: track,
};
