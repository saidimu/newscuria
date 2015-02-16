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

var queue = require('_/util/queue.js');
var topics = queue.topics;

var restify = require('restify');

var request = require('superagent');

//==BEGIN here
// connect to the message queue
queue.connect(start);
//==BEGIN here

var server;

function start()    {
  server = start_rest_server();
  kimono_googlenews_handler();
  ducksboard_loggly_handler();
}//start()


function ducksboard_loggly_handler() {
  var config_loggly = require('config').get("logging").get('loggly');
  var loggly_user = config_loggly.get('user');
  var loggly_password = config_loggly.get('password');
  var api_endpoint = config_loggly.get('api_endpoint');

  // server.get('/ducksboard/:metric/:from/:until/', function onDucksboard(req, res, next)  {
  server.get('/ducksboard/:metric/', function onDucksboard(req, res, next)  {
    var metric = req.params.metric;
    var from = req.params.from || '-1h';  // default 'from': past 1-hr
    var until = req.params.until || 'now';      // default 'to': until now

    var facet_size = 200;   // https://www.loggly.com/docs/api-retrieving-data/

    req.log.debug({
      req_params: req.params
    });

    if(metric)  {
      request
        .get(api_endpoint)
        .query({
          from: from,
          until: until,
          facet_size: facet_size,
        })
        .auth(loggly_user, loggly_password)
        .end(function(loggly_err, loggly_res){

          if(loggly_err || loggly_res.error) {

            req.log.error({
              err: loggly_err
            }, 'Error in Loggly search/events API call.');

            return next(
              new restify.InternalError('Error in Loggly search/events API call')
            );

          } else {
            var log_events = loggly_res.body;

            req.log.debug({
              log_events: log_events
            });

            var metric_count = -1; // default 'not found' value

            log_events['json.log_type'].forEach(function(log_event) {
              if(log_event.term === metric) {
                metric_count = log_event.count;
              }//if
            });//forEach

            if(metric_count > -1)  {

              res.send(200, metric_count);

            } else {

              return next(
                new restify.ResourceNotFound('Metric "%s" not found.', metric)
              );

            }//if
          }//if-else

        });//request

    } else {

      // res.send(400);  //400 Bad Request
      return next(
        new restify.InvalidArgument('Metric name must be supplied.')
      );

    }//if-else

  });//server.get

}//ducksboard_loggly_handler


function kimono_googlenews_handler() {
  server.post('/googlenews', function onGoogleNews(req, res, next) {
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

    log.info({
      log_type: log.types.webhook.GOOGLE_NEWS,
    });

    process_googlenews_webhook(webhook);

    res.send(204);
  });//server.post

}//kimono_googlenews_handler


function process_googlenews_webhook(webhook)  {
  var results = webhook.results || {};

  var content = results.content || [];
  var metadata = results.metadata || [];
  var related = results.related || [];

  content.forEach(function(article)  {
    // TODO: also process Google News article headlines
    var headline = article.headline || {};
    var url = headline.href || undefined;

    if(url) {

      publish_url_message(url);

    } else {
      log.error({
        results_content: article,
        log_type: log.types.webhook.URL_ERROR,
      }, "No URL found in GoogleNews webhook results payload.");
    }//if-else

  });//content.forEach


  related.forEach(function(article)  {
    var url = article.headline || undefined;

    if(url) {

      publish_url_message(url);

    } else {

      log.error({
        results_content: article,
        log_type: log.types.webhook.URL_ERROR,
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

  server.pre(restify.pre.sanitizePath());
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
