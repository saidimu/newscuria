'use strict';

exports.register = function(server, options, next)  {

  server.route({
    path: '/version',
    method: 'GET',
    handler: require('./version')
  });//server.route

  next();

};//exports.register


exports.register.attributes = {
  pkg: require('./plugin.json')
};//exports.register.attributes
