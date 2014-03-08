var server = require("./server");
var yargs = require('yargs');
var argv = yargs
  .usage('Browser console logging to the terminal.\nUsage: $0 [PORT]')
  .argv;

if(argv.help) {
  yargs.showHelp();
  return;
}

server(argv._[0], function(err, conn) {
  if(err) {
    console.error("ERR:", err);
    yargs.showHelp();
    return;
  }
  var address = conn.address;
  if(address === "0.0.0.0") {
    address = "localhost";
  }
  console.log("Started on: http://"+address+":"+conn.port);
});
