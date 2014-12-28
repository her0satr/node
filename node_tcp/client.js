var net = require('net');
var client = net.connect({ host: 'localhost', port: 8124 }, function() {
	console.log('connected to server!');
	
	client.on('data', function(data) {
		console.log(data.toString());
		client.end();
	});
	client.write('data');

	client.on('end', function() {
		console.log('disconnected from server');
	});
});
