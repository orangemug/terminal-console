# terminal-console
**Work in progress**

Browser console logging to the terminal


## Usage
Start a server, defaults to `2845`

    terminal-console PORT

Then in your page add the script tag, which will wrap all the console logging methods sending logging to the server

    <script src="http://localhost:[PORT]/[NAMESPACE]"></script>

You can also bundle in with your javascript, below is a commonjs example

    var terminalLogger = require("terminal-logger");
    terminalLogger("http://localhost:2845");


## License
MIT
