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

require('newrelic');

var appname = process.env.APP_NAME;
var log = require('_/util/logging.js')(appname);

var queue = require('_/util/queue.js');
var topics = queue.topics;

var restify = require('restify');
//var kimono = require('_/util/kimono.js');

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

var server;

function start()    {
  server = start_rest_server();
  handle_googlenews_webhooks();
}//start()


function handle_googlenews_webhooks() {
  server.post('/googlenews', function webhook(req, res, next) {
    var webhook = req.body;

    var webhook_header = {
      api_name: webhook.name,
      version: webhook.version,
      newdata: webhook.newdata,
      lastrunstatus: webhook.lastrunstatus,
      thisversionrun: webhook.thisversionrun,
      lastsuccess: webhook.lastsuccess,
      nextrun: webhook.nextrun,
      count: webhook.count
    };

    req.log.info(webhook_header);

    process_googlenews_webhook(webhook);

    res.send(204);
  });//server.post

}//handle_googlenews_webhooks


function process_googlenews_webhook(webhook)  {
  var results = webhook.results || {};

  var content = results.content || [];
  var metadata = results.metadata || [];
  var related = results.related || [];

  content.forEach(function(article)  {
    var headline = article.headline || {};
    var url = headline.href || undefined;

    if(url) {
      publish_url_message(url);

    } else {
      log.error({
        results_content: article
      }, "No URL found in GoogleNews webhook results payload.");
    }//if-else

  });//content.forEach


  related.forEach(function(article)  {
    var url = article.headline || undefined;

    if(url) {
      publish_url_message(url);

    } else {
      log.error({
        results_content: article
      }, "No URL found in GoogleNews webhook results payload.");
    }//if-else
  });//related.forEach

}//process_googlenews_webhook


function publish_url_message(url) {
  queue.publish_message(topics.URLS_RECEIVED, {
    url: url
  });
}//publish_url_message


function start_rest_server()  {
  var server = restify.createServer({
    name: appname,
    log: log
  });

  server.use(restify.acceptParser(server.acceptable));
  server.use(restify.authorizationParser());
  server.use(restify.dateParser());
  server.use(restify.queryParser());
  server.use(restify.gzipResponse());
  server.use(restify.bodyParser());
  server.use(restify.throttle({
    burst: 100,
    rate: 50,
    ip: true
  }));
  server.use(restify.conditionalRequest());

  server.listen(8080, function () {
    log.info({
      address: server.url,
    }, "REST server listening...");
  });//server.listen

  return server;
}//start_rest_server