var assert = require('assert'),
    logger = require('../log/logger').Logger;
    
exports.AuthModule = function () {
	var self = this;
	var _manager;
	var _methods = {};
	var _nextId = 0;

	_methods["login"] = function (data, client) {
		assert.ok(!!data.username, "Missing username");
		assert.ok(!!data.password, "Missing password");
		
		if (data.username == "123" && data.password == "123") {
			client.privdata.isAuth = true;
			sendData(client, "loginSuccess");
		} else {
			sendData(client, "loginFail");
		}
	}
	
	// Send data to a specific client for a specific method //
	function sendData (client, method, data) {
		var packet = { methodName : method, data : data };
		
		client.fn.send("AUTH", packet);
	}
	
	// Return a peer by it's ID //
	function getPeer (token) {
		for (var i=0; i<_peers.length; i++) {
			if (_peers[i].metadata.id == token)
				return _peers[i];
		}
		
		return;
	}
	
	// Name of the module //
	self.name = "AUTH";	
	
	// Set the manager //
	self.manager = function (manager) {
		_manager = manager;
	}
	
	// Callback when data is received //
	self.data = function (data, client) {
		assert.ok(!!data.methodName, "No method name provided");
		
		var methodName = data.methodName;
		
		if (_methods[methodName]) {
			_methods[methodName](data.data, client);
		}
	}
	
	// Callback when a connection is received //
	self.connect = function (client) {
		client.privdata.isAuth = false;
	}
	
	// Callback when someone disconnect //
	self.disconnect = function (client) {}
};