var net = require('net');
var http = require('http');
var formidable = require('formidable');

var server = http.createServer(function (req, res) {
	console.log(req.url)
	
	res.writeHead(200);
	res.end('Hello, World!\n');
});
server.listen(8080);