var http = require('http'),
      io = require('./socket.io/lib/socket.io'),
	  fs = require('fs'),
 Manager = require('./connection/server/manager').Manager,
   RTMFP = require('./connection/server/rtmfp').RTMFPManager;
 

var server = http.createServer(function(req, res){ 
	res.writeHead(200, {'Content-Type': 'text/html'});
 
	fs.readFile('index.html', function (err, data) {
		if (err) res.end("<html>Erreur : (" + err + ")</html>");
		res.end(data);
	});
});
server.listen(8080);

var socket = new Manager();
    socket.listen(server);
    socket.register(new RTMFP());
