var assert = require('assert'),
    logger = require('../../log/logger').Logger,
     redis = require("../../redis").createClient(),
      hash = require("../../security/hash"),
 validator = require("../../validation/validator").Validator; 
    
exports.AuthModule = function () {
	var self = this;
	var _methods = {};

	// Attempt to login with a username and a password //
	// Inputs :
	//  - (string) data.username - Username
	//  - (string) data.password - Password
	_methods["login"] = function (data, client) {
		assert.ok(!!data.username, "Missing username");
		assert.ok(!!data.password, "Missing password");
		
		// Check for invalid request //
		if (!validator.isUsername(data.username)) {
			sendData(client, "invalid");
			return;
		}
		
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
	
	// Creates an account //
	// Inputs :
	//  - (string) data.username - Username
	//  - (string) data.password - Password
	_methods["createAccount"] = function (data, client) {
		assert.ok(!!data.username, "Missing username");
		assert.ok(!!data.password, "Missing password");
		
		// Check for invalid request //
		if (!validator.isUsername(data.username) || !validator.isPassword(data.password)) {
			sendData(client, "invalid");
			return;
		}
		
		var hashPassword = hash.sha256(data.password);
		
		redis.GET("user:" + data.username + ":password", function (err, obj) {
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
	
	// Name of the module //
	self.name = "AUTH";
	
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