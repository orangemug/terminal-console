var express = require('express');
var app = express();

app.use(express.static(__dirname+"/../example"));
var server = app.listen(3000, function() {
  console.log('Listening on port http://localhost:%d', server.address().port);
});
