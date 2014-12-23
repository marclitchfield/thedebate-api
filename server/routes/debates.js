var debates = require('../stores/debates');

module.exports = function(server) {
  server.route({ 
    method: 'GET',
    path: '/debates',
    handler: function (request, reply) {
      debates.list(reply);
    }
  });

  server.route({
    method: 'GET',
    path: '/debates/{id}',
    handler: function (request, reply) {
      debates.get(reply, request.params.id);
    }
  });

  server.route({
    method: 'POST',
    path: '/debates',
    handler: function (request, reply) {
      debates.create(reply, request.payload);
    }
  }); 
};