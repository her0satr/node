var net = require('net');
var client = net.connect({ host: '202.146.225.105', port: 5000 }, function() {
	console.log('connected to server!');
	
	client.on('data', function(data) {
		console.log('reply message : ' + data.toString());
		client.end();
	});
	
	// sent message
	var message = "080|01|20141227070530\r\n";
	console.log('sent message : ' + message);
	client.write(message);

	client.on('end', function() {
		console.log('disconnected from server');
	});
});
