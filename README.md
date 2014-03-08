# terminal-console
Browser console logging to the terminal


## Usage
Start a server, defaults to `2845`

    terminal-console PORT

Then in your page add the script tag, which will wrap all the console logging methods sending logging to the server

    <script src="http://localhost:PORT"></script>

You can also specify a `namespace` and `host`

    <script src="http://localhost:PORT?host=[HOST]&namespace=[NAMESPACE]>"></script>


## License
MIT
