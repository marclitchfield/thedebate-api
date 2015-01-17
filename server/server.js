var Hapi = require('hapi');
var Good = require('good');
var mongoose = require('mongoose');

var server = new Hapi.Server();
server.connection({ port: 9004 });

mongoose.connect('mongodb://localhost/thedebate');

require('./routes/debates')(server);
require('./routes/statements')(server);

server.register({
  register: Good,
  options: {
    reporters: [{
      reporter: require('good-console'),
      args: [{ error: '*', log: '*', response: '*' }]
    }]
  }
}, function (err) {
  if (err) { throw err; }

  server.start(function () {
    server.log('info', 'Server running at: ' + server.info.uri);
  });
});
