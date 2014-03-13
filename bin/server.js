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

  var buffer = [];

  // The client console.* overrides
  app.get('/:namespace', function(req, res) {
    var namespace = req.params.namespace || null;
    var host      = "http://"+req.headers.host;
    
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

  // Can still get out of order, so lets buffer the logging and sort by time
  bufferWindow = 500;
  lastRenderTime = Date.now();
  setInterval(function() {
    var newRenderTime = Date.now()-bufferWindow;
    var newBuffer = [], out = [];
    // Log buffer.
    buffer.forEach(function(item) {
      if(item.timestamp < newRenderTime) {
        if(item.timestamp < lastRenderTime) {
          item.brokeBuffer = true;
        }
        out.push(item);
      } else {
        newBuffer.push(item);
      }
    })
    
    out.sort(function(item) {
      return -item.timestamp;
    }).forEach(function(item) {
      var color = groups[item.namespace];
      var ts = moment(item.timestamp).format("YYYY-MM-DD HH:MM:SS:SSS");

      if(item.brokeBuffer) {
        item.detail.unshift(colorSet("[BROKE_BUFFER]", "white+red_bg"));
      }
      item.detail.unshift(colorSet(item.namespace, color));
      item.detail.unshift("["+ts+"]");

      console[item.method].apply(console, item.detail);
    });

    lastRenderTime = newRenderTime;
    buffer = newBuffer;
  }, 100);

  // WebSocket logging API
  io.sockets.on('connection', function (socket) {
    socket.on('started', function (namespace, timestamp) {
      var ts = moment(timestamp).format("YYYY-MM-DD HH:MM:SS:SSS");

      // Setup color if it doesn't exist
      var color = groups[namespace];
      if(!color) {
        color = colors[(idx % colors.length)];
        groups[namespace] = color+"+black_bg";
        idx++;
      }

      console.log("["+ts+"]", colorSet(namespace, color), "[started]");
    });

    socket.on('log', function (namespace, timestamp, method, detail) {
      buffer.push({
        namespace: namespace,
        timestamp: timestamp,
        method: method,
        detail: detail
      });
    });
  });
}
