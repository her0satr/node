var fs = require('fs');var qs = require('querystring');var net = require('net');var http = require('http');var func = require('public_function.js');var client_helper = require('client_helper.js');var formidable = require('formidable');var WebSocketServer = require('websocket').server;// server variablevar clients = [];var counter_no = 0;// httpvar server = http.createServer(function (req, res) {	// get url	var link_request = req.url.substr(1, req.url.length - 1);	var link_array = link_request.split('/');		console.log(link_request);		// get index	if (link_request == '') {		fs.readFile('static/404.html', "utf8", function(err, data) {			res.writeHead(200, {"Content-Type": "text/html"});			res.end(data);		});	}		// bower	else if (link_array[0] == 'bower_components') {		fs.readFile(link_request, "utf8", function(err, data) {			res.writeHead(200, {"Content-Type": "text/html"});			res.end(data);		});	}		// html	else if (func.in_array(link_request, [ 'chat', 'counter' ])) {		var page = link_request + '.html';		fs.readFile('static/' + page, "utf8", function(err, data) {			res.writeHead(200, {"Content-Type": "text/html"});			res.end(data);		});	}		// action	else if (link_request == 'action') {		if (req.method == 'POST') {			var body = '';						req.on('data', function (data) {				body += data;				// Too much POST data, kill the connection!				// 1e6 === 1 * Math.pow(10, 6) === 1 * 1000000 ~~~ 1MB				if (body.length > 1e6)					req.connection.destroy();			});						req.on('end', function () {				var post = qs.parse(body);				var result = { status: false };								if (post.action == 'message_sent') {					result = {						post: post,						status: true,						message: 'Data berhasil disimpan'					}				}								res.writeHead(200, "OK", {'Content-Type': 'text/plain'});				res.write(func.object_to_json(result));				res.end();			});		}	}		// unindex	else {		res.writeHead(200, {"Content-Type": "text/html"});		res.end('Error 404');	}});server.listen(9000);// socketfunction originIsAllowed(origin) {	// put logic here to detect whether the specified origin is allowed.	return true;}wsServer = new WebSocketServer({ httpServer: server, autoAcceptConnections: false });wsServer.on('request', function(request) {	if (!originIsAllowed(request.origin)) {		// Make sure we only accept requests from an allowed origin		request.reject();		console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');		return;    }	    var connection = request.accept(null, request.origin);	var index = clients.push({ conn: connection }) - 1;	    connection.on('message', function(message) {        if (message.type === 'utf8') {			// param			eval('var param = ' + message.utf8Data);						// default result			var result = { status: false };						// action			if (param.action == 'signin') {				clients[index].user_name = param.user_name;				result = { status: true, action: 'signin', array_user_name: client_helper.get_array(clients) }			}			else if (param.action == 'message_sent') {				result = { status: true, action: 'message', message: param.message }			}			else if (param.action == 'counter_info') {				result = { status: true, action: 'update_counter', counter_no: counter_no }			}			else if (param.action == 'counter_increment') {				counter_no++;				result = { status: true, action: 'update_counter', counter_no: counter_no }			}						// result            // connection.sendUTF(func.object_to_json(result));			for (var i = 0; i < clients.length; i++) {				clients[i].conn.sendUTF(JSON.stringify(result));			}        }        else if (message.type === 'binary') {            console.log('Received Binary Message of ' + message.binaryData.length + ' bytes');            connection.sendBytes(message.binaryData);        }    });    connection.on('close', function(reasonCode, description) {		clients.splice(index, 1);        console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');				// refresh active client		var result = { status: true, action: 'signin', array_user_name: client_helper.get_array(clients) }		for (var i = 0; i < clients.length; i++) {			clients[i].conn.sendUTF(JSON.stringify(result));		}    });});