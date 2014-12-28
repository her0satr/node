var net = require('net');
var http = require('http');
var formidable = require('formidable');

var server = http.createServer(function (req, res) {
	console.log('http active');
	
    if (req.method == 'POST') {
		// capture post request
		var form = new formidable.IncomingForm();
		form.parse(req, function(err, param_post, files) {
			if (err) {
				console.error(err.message);
				return;
			}
			
			// make socket connection
			var client = net.connect({ host: 'localhost', port: 8124 }, function() {
				console.log('connected to tcp socket!');
				
				client.on('data', function(server_reply) {
					console.log(server_reply.toString());
					client.end();
					
					res.writeHead(200);
					res.end(server_reply.toString() + "\n");
				});
				client.write(param_post.shortcode);
				
				client.on('end', function() {
					console.log('disconnected from server' + "\n\n");
				});
			});
		});
    }
	else {
        res.writeHead(200, "OK", {'Content-Type': 'text/plain'});
        res.end();
    }
});
server.listen(8080);
