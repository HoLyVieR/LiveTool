var assert = require('assert'),
    logger = require('../../log/logger').Logger,
     redis = require("../../redis").createClient(); 
    
exports.ProjectModule = function () {
	var self = this;
	var _methods = {};

	// Adds a new project and attach it to the current user //
	// Inputs :
	//  - (string) data - Project name 
	_methods["createProject"] = function (data, client) {
		assert.ok(!!data, "Missing project name");
		
		// If the person is not connected //
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
	
	// List the project of the current user //
	// Inputs :
	//  - (null) data
	_methods["listProject"] = function (data, client) {
		// If the person is not connected //
		if (!client.metadata.username) {
			sendData(client, "authNeeded");
			return;
		}
		
		// Getting the list of project id of a user //
		redis.ZRANGE("user:" + client.metadata.username + ":projects", 0, -1, function (err, obj) {
			var nbProject = obj.length,
				projects = [];
			
			function projectInfoLoaded(id, projectName, contributors) {
				projects.push({ name : projectName, id :  id, contributors : contributors});
				
				if (projects.length == nbProject) {
					sendData(client, "listProject", projects);
				}
			}
			
			function getProjectInfo(id) {
				var projectName,
					contributors;
			
				redis.GET("project:" + id + ":name", function (err, obj) {
					projectName = obj;
					
					if (contributors && projectName) {
						projectInfoLoaded(id, projectName, contributors);
					}
				});
				
				redis.HGETALL("project:" + id + ":user", function (err, obj) {
					contributors = obj;
					
					if (contributors && projectName) {
						projectInfoLoaded(id, projectName, contributors);
					}
				});
			}
			
			if (nbProject > 0) {
				for (var i = 0; i < nbProject; i++) {
					getProjectInfo(obj[i]);
				}
			} else {
				// If project count is 0, we send the response here, otherwise it will never be sent //
				sendData(client, "listProject", projects);
			}
		});
	};
	
	// Adds a user/contributor to a project //
	// Inputs :
	//  - (int)    data.id         - ID of the project
	//  - (string) data.name       - Name of the contributor
	//  - (int)    data.permission - 3 bytes number where each byte represent in order Admin, Write, Read
	_methods["addContributor"] = function (data, client) {
		assert.ok(typeof data.id != "undefined", "Missing id");
		assert.ok(!!data.name, "Missing name");
		assert.ok(!!data.permission, "Missing permission");
		
		// If the person is not connected //
		if (!client.metadata.username) {
			sendData(client, "authNeeded");
			return;
		}
		
		// Check if the person is allowed //
		redis.HGET("project:" + data.id + ":user", client.metadata.username, function (err, obj) {
			// If the person isn't in the project OR if he's not admin //
			if (obj === null || !(obj & 4)) {
				sendData(client, "notEnoughPriviledge");
			} else {
				redis.HSET("project:" + data.id + ":user", data.name, data.permission);
				redis.ZADD("user:" + data.name + ":projects", data.id, data.id);
				
				sendData(client, "contributorAdded");
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