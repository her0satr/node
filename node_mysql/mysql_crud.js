var mysql      = require('mysql');
var connection = mysql.createConnection({ host: 'localhost', user: 'root', password : '', database: 'bromo_db' });
connection.connect(function(err) { });
console.log("Connect\n");

var job_raw  = { name: 'Hello MySQL' };
var job_query = connection.query('INSERT INTO job SET ?', job_raw, function(err, result) {
	console.log(result);
	console.log(result.insertId);
});

/*
connection.query('SELECT * FROM job ORDER BY name LIMIT 2', function(err, rows, fields) {
	console.log(rows);
});
/*	*/