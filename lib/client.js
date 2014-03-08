var io   = require("socket.io-client");
var util = require("util");

var methods = [
  "debug",
  "error",
  "info",
  "log",
  "warn"
];

module.exports = function(namespace, host) {
  var socket;
  if(!console) return;

  host = host || 'http://localhost:2845';
  socket = io.connect(host);
  socket.emit('started', namespace);

  // Wrap each method
  function wrap(method, obj, name) {
    return function() {
      var args = Array.prototype.slice.call(arguments, 0);
      args.forEach(function(val, idx) {
        args[idx] = util.inspect(val);
      });
      socket.emit('log', namespace, Date.now(), name, args);
      method.apply(obj, arguments);
    };
  }

  methods.forEach(function(k) {
    console[k] = wrap(console[k], console, k);
  });
}
