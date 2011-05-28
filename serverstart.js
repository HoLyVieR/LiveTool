var http = require('http'),
	  fs = require('fs'),
 connect = require('./connect/'),
 Manager = require('./connection/server/manager').Manager,
   RTMFP = require('./connection/server/rtmfp').RTMFPManager;
    AUTH = require('./serverModule/auth/AuthModule').AuthModule;
 PROJECT = require('./serverModule/project/ProjectModule').ProjectModule,
  EDITOR = require('./serverModule/editor/EditorModule').EditorModule;
 
var server = connect.createServer(
	connect.logger(),
	connect.static(__dirname)
);

server.listen(80);
 
/*var server = http.createServer(function(req, res){ 
	res.writeHead(200, {'Content-Type': 'text/html'});
 
	fs.readFile('index.html', function (err, data) {
		if (err) res.end("<html>Erreur : (" + err + ")</html>");
		res.end(data);
	});
});
server.listen(8080);*/

var socket = new Manager();
    socket.listen(server);
    socket.register(new RTMFP());
    socket.register(new AUTH());
    socket.register(new PROJECT());
    socket.register(new EDITOR());
