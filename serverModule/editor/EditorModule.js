var assert = require('assert'),
    logger = require('../../log/logger').Logger,
     redis = require("../../redis").createClient(),
 validator = require("../../validation/validator").Validator; 
    
exports.EditorModule = function () {
	var self = this;
	var _methods = {};
	var _clientProject = {};
	var _peerPool = [];
	
	// Save the current project on the server //
	// Inputs :
	//  - (string) data - JSON version of it.
	_methods["saveProject"] = function (data, client) {
		// If the person is not connected //
		if (!client.privdata.isAuth) {
			sendData(client, "authNeeded");
			return;
		}
		
		assert.ok(!!client.metadata.currentProject, "You are not in any project");
		assert.ok(!!data, "No data was provided");
		
		redis.SET("project:" + client.metadata.currentProject + ":data", data, function (err, data) {
			sendData(client, "projectSaved");
		});
	};
	
	// The current user joins a project //
	// Inputs :
	//  - (int) data - Project ID
	_methods["joinProject"] = function (data, client) {
		// If the person is not connected //
		if (!client.metadata.username) {
			sendData(client, "authNeeded");
			return;
		}
		
		data = +data;
		
		assert.ok(!isNaN(data), "Missing project ID"); 
		
		// If the rooms doesn't exist yet, we create it //
		if (!_clientProject[data]) {
			_clientProject[data] = [];
		}
		
		_clientProject[data].push(client.metadata.id);
		client.metadata.currentProject = data;
		
		sendData(client, "projectJoined");
	};
	
	// Returns the current project data //
	// Inputs :
	//  - (int) data - Project ID
	_methods["getProjectData"] = function (data, client) {
		// If the person is not connected //
		if (!client.metadata.username) {
			sendData(client, "authNeeded");
			return;
		}
		
		data = +data;
		
		assert.ok(!isNaN(data), "Missing project ID"); 
		
		// If the personn is not authentified //
		if (!client.metadata.username) {
			sendData(client, "authNeeded");
			return;
		}
		
		var projectId = data;
		
		// Check if the user has access to this project //
		redis.ZRANK("user:" + client.metadata.username + ":projects", projectId, function (err, data) {
			
			// If the personn doesn't have access to the project //
			if (data == null) {
				sendData(client, "authNeeded");
				return;
			}
			
			// Get the data from the database //
			var name, projectData;
			
			redis.GET("project:" + projectId + ":name", function (err, data) {
				name = data;
				dataReceived();
			});
			
			redis.GET("project:" + projectId + ":data", function (err, data) {
				projectData = data;
				dataReceived();
			});
			
			// Return the data when everything is received //
			function dataReceived() {
				if (typeof name != "undefined" && 
						typeof projectData != "undefined") {
					
					sendData(client, "getProjectData", { name : name, data : projectData });
				}
			}
		});
	};
	
	// Returns a list of peers that are connected to a project //
	// Inputs :
	//  - (int) data - Project ID
	_methods["getPeer"] = function (data, client) {
		// If the person is not connected //
		if (!client.metadata.username) {
			sendData(client, "authNeeded");
			return;
		}
		
		data = +data;
		
		assert.ok(!isNaN(data), "Missing project ID"); 
		
		var clientList = _clientProject[data];
		
		// You can get the connected peer once you are connected //	
		if (clientList.indexOf(client.metadata.id) === -1) {
			sendData(client, "notEnoughPriviledge");
			return;
		} else {
			sendData(client, "listProjectPeer", clientList);
		}
	};
	
	// Send data to a specific client for a specific method //
	function sendData (client, method, data) {
		var packet = { methodName : method, data : data };
		
		client.fn.send("EDITOR", packet);
	}
	
	// Name of the module //
	self.name = "EDITOR";
	
	// Callback when data is received //
	self.data = function (data, client) {
		assert.ok(!!data.methodName, "No method name provided");
		
		var methodName = data.methodName;
		
		if (_methods[methodName]) {
			_methods[methodName](data.data, client);
		}
	};
	
	// Callback when a connection is received //
	self.connect = function (client) {
		// Adding the client to the pool // 
		_peerPool.push(client);
	};
	
	// Callback when someone disconnect //
	self.disconnect = function (client) {
		var pos = _peerPool.indexOf(client);
		assert.ok(pos != -1, "Client is not in peer pool.");
		
		// Delete the variable and it's content from the peer pool //
		delete _peerPool[pos];
		_peerPool = _peerPool.slice(0, pos).concat(_peerPool.slice(pos + 1));
		
		// Delete all connection in the project client pool //
		var project, clientPos;
		
		for (project in _clientProject) {
			clientPos = _clientProject[project].indexOf(client.metadata.id);
			
			if (clientPos != -1) {
				_clientProject[project].splice(clientPos, 1);
			}
		}
	};
};