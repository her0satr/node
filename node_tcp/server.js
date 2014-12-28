var net = require('net');
var server = net.createServer(function(c) {
	console.log('client connected');
	
	// receive data
	c.on('data', function(data) {
		var array_temp = data.toString().split('|');
		if (array_temp.length == 2) {
			var total = parseInt(array_temp[0], 10) + parseInt(array_temp[1], 10);
			c.write('Calculate : ' + array_temp[0] + ' + ' + array_temp[1] +  ' = ' + total);
		} else {
			c.write('You said "' + data + '"');
		}
		console.log(array_temp);
	});
	
	// end
	c.on('end', function() {
		console.log('client disconnected');
	});
});
server.listen(8124, function() {
	console.log('server bound');
});