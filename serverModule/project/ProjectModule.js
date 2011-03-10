var assert = require('assert'),
    logger = require('../../log/logger').Logger,
     redis = require("../../redis").createClient(); 
    
exports.ProjectModule = function () {
	var self = this;
	var _methods = {};

	_methods["createProject"] = function (data, client) {
		// If the personn is not connected //
		if (!client.metadata.username) {
			sendData(client, "authNeeded");
			return;
		}
		
		redis.INCR("project:nextId", function (err, nextId) {
			redis.SET("project:" + nextId + ":name", data);
			redis.HSET("project:" + nextId + ":user", client.metadata.username, 7);
			redis.ZADD("user:" + client.metadata.username + ":projects", nextId, nextId);
			
			sendData(client, "projectCreated");
		});
	};
	
	_methods["listProject"] = function (data, client) {
		// If the personn is not connected //
		if (!client.metadata.username) {
			sendData(client, "authNeeded");
			return;
		}
		
		// Getting the list of project id of a user //
		redis.ZRANGE("user:" + client.metadata.username + ":projects", 0, -1, function (err, obj) {
			var nbProject = obj.length,
				projects = [];
			
			if (nbProject > 0) {
				for (var i = 0; i < nbProject; i++) {
					;(function (id) {
						redis.GET("project:" + id + ":name", function (err, obj) {
							projects.push({ name : obj, id :  id});
							
							if (projects.length == nbProject) {
								sendData(client, "listProject", projects);
							}
						});
					})(obj[i]);
				}
			} else {
				// If project count is 0, we send the response here, otherwise it will never be sent //
				sendData(client, "listProject", projects);
			}
		});
	};
	
	// Send data to a specific client for a specific method //
	function sendData (client, method, data) {
		var packet = { methodName : method, data : data };
		
		client.fn.send("PROJECT", packet);
	}
	
	// Name of the module //
	self.name = "PROJECT";
	
	// Callback when data is received //
	self.data = function (data, client) {
		assert.ok(!!data.methodName, "No method name provided");
		
		var methodName = data.methodName;
		
		if (_methods[methodName]) {
			_methods[methodName](data.data, client);
		}
	}
	
	// Callback when a connection is received //
	self.connect = function (client) {}
	
	// Callback when someone disconnect //
	self.disconnect = function (client) {}
};