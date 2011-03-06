var assert = require('assert'),
    logger = require('../log/logger').Logger,
     redis = require("../redis").createClient(),
      hash = require("../security/hash"); 
    
exports.AuthModule = function () {
	var self = this;
	var _manager;
	var _methods = {};
	var _nextId = 0;

	_methods["login"] = function (data, client) {
		assert.ok(!!data.username, "Missing username");
		assert.ok(!!data.password, "Missing password");
		
		//TODO: Validate username //
		var hashPassword = hash.sha256(data.password);
		
		redis.GET("user:" + data.username + ":password", function (err, obj) {
			if (hashPassword == obj) {
				client.privdata.isAuth = true;
				client.metadata.username = data.username;
				sendData(client, "loginSuccess");
			} else {
				sendData(client, "loginFail");
			}
		});
	};
	
	_methods["createAccount"] = function (data, client) {
		assert.ok(!!data.username, "Missing username");
		assert.ok(!!data.password, "Missing password");
		
		//TODO: Validate username //
		var hashPassword = hash.sha256(data.password);
		
		redis.GET("user:" + data.username + ":password", function (err, obj) {
			logger.trace(JSON.stringify(obj));
			
			if (obj == null) {
				redis.SET("user:" + data.username + ":password", hashPassword);
				client.privdata.isAuth = true;
				client.metadata.username = data.username;
				sendData(client, "loginSuccess");
			} else {
				sendData(client, "loginExist");
			}
		});
	};
	
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