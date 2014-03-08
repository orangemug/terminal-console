var browserify = require("browserify");
var moment     = require("moment");
var colorSet   = require("ansi-color").set;
var express    = require("express");
var http       = require("http");
var socketio   = require("socket.io");

var app = express();
var server = http.createServer(app);

module.exports = function(port, done) {
  port = port || 2845;
  server.listen(port, function(err) {
    done(err, server.address());
  });
  var io = socketio.listen(server, {log: false});

  var idx = 0;
  var groups = {};
  var colors = [
    "red",
    "green",
    "yellow",
    "blue",
    "magenta",
    "cyan",
    "white"
  ];

  app.get('/logger.js', function(req, res) {
    var namespace = req.query.namespace || "null";
    var host      = req.query.host      || "http://"+req.headers.host;
    
    var browserify = require('browserify');
    var b = browserify();
    b.add('./bin/logger.js');
    b.bundle({
      insertGlobalVars: {
        host: function() {
          return JSON.stringify(host);
        },
        namespace: function() {
          return JSON.stringify(namespace);
        }
      }
    }).pipe(res);
  });

  io.sockets.on('connection', function (socket) {
    socket.on('started', function (namespace, datetime) {
      var ts = moment(datetime).format("YYYY-MM-DD HH:MM:SS:SSS");

      // Setup color if it doesn't exist
      var color = groups[namespace];
      if(!color) {
        color = colors[(idx % colors.length)];
        groups[namespace] = color+"+black_bg";
        idx++;
      }

      console.log("["+ts+"]", colorSet(namespace, color), "[started]");
    });

    socket.on('log', function (namespace, datetime, method, detail) {
      var color = groups[namespace];
      var ts = moment(datetime).format("YYYY-MM-DD HH:MM:SS:SSS");

      detail.unshift(colorSet(namespace, color));
      detail.unshift("["+ts+"]");

      console[method].apply(console, detail);
    });
  });
}
