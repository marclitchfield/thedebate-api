var debates = require('../stores/debates');

module.exports = function(server) {
  server.route({ 
    method: 'GET',
    path: '/api/debates',
    handler: function (request, reply) {
      debates.list(reply);
    },
    config: { cache: { expiresIn: 30, privacy: 'private' } }
  });

  server.route({
    method: 'GET',
    path: '/api/debate/{id}',
    handler: function (request, reply) {
      debates.get(request.params.id, reply);
    },
    config: { cache: { expiresIn: 30, privacy: 'private' } }
  });

  server.route({
    method: 'POST',
    path: '/api/debates',
    handler: function (request, reply) {
      debates.create(request.payload, reply);
    }
  }); 
};