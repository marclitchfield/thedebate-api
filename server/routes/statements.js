var statements = require('../stores/statements');

module.exports = function(server) {
  server.route({ 
    method: 'GET',
    path: '/api/statement/{id}',
    handler: function (request, reply) {
      statements.get(request.params.id, reply);
    },
    config: { cache: { expiresIn: 30, privacy: 'private' } }
  });

  server.route({ 
    method: 'POST',
    path: '/api/statements',
    handler: function (request, reply) {
      statements.create(request.payload, reply);
    }
  });

  server.route({
    method: 'GET',
    path: '/api/statement/{id}/responses/{type?}',
    handler: function (request, reply) {
      statements.responses.list(request.params.id, request.params.type, reply);
    },
    config: { cache: { expiresIn: 30, privacy: 'private' } }
  });

  server.route({ 
    method: 'POST',
    path: '/api/statement/{id}/responses',
    handler: function (request, reply) {
      statements.responses.create(request.params.id, request.payload, reply);
    }
  });

  server.route({
    method: 'POST',
    path: '/api/statement/{id}/upvote',
    handler: function(request, reply) {
      statements.upvote(request.params.id, reply);
    }
  });

};
