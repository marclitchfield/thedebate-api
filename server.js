var express = require('express');
var app = express();

app.get('/api', function(req, res){
  res.writeHead(200, {"Content-Type": "text/plain"});
  res.end("Hello World\n");
});

var server = app.listen(9003, function() {
  console.log('Listening on port %d', server.address().port);
});
