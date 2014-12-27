var statements = require('../stores/statements');

module.exports = function(server) {
  server.route({ 
    method: 'GET',
    path: '/api/statement/{id}',
    handler: function (request, reply) {
      statements.get(reply, request.params.id);
    }
  });

  server.route({ 
    method: 'POST',
    path: '/api/statements',
    handler: function (request, reply) {
      statements.create(reply, request.payload);
    }
  });

  server.route({
    method: 'GET',
    path: '/api/statement/{id}/responses/{type?}',
    handler: function (request, reply) {
      statements.responses.list(reply, request.params.id, request.params.type);
    }
  });

  server.route({ 
    method: 'POST',
    path: '/api/statement/{id}/responses',
    handler: function (request, reply) {
      statements.responses.create(reply, request.params.id, request.payload);
    }
  });

  server.route({
    method: 'POST',
    path: '/api/statement/{id}/upvote',
    handler: function(request, reply) {
      statements.upvote(reply, request.params.id);
    }
  });

};