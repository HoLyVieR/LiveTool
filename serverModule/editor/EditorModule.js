var assert = require('assert'),
    logger = require('../../log/logger').Logger,
     redis = require("../../redis").createClient(),
 validator = require("../../validation/validator").Validator; 
    
exports.EditorModule = function () {
	var self = this;
	var _methods = {};
	var _clientProject = {};
	
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
		
		_clientProject[data].push(client.metadata.username);
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
		
		var clientList = _clientProject[data],
			nbClient = clientList.length;
		
		// You can get the connected peer once you are connected //
		if (clientList.indexOf(client.metadata.username)) {
			sendData(client, "notEnoughPriviledge");
			return;
		}
		
		if (nbClient > 0) {
			for (var i=0; i<nbClient; i++) {
				
			}
		} else {
			sendData(client, "projectPeerList", []);
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
	}
	
	// Callback when a connection is received //
	self.connect = function (client) {}
	
	// Callback when someone disconnect //
	self.disconnect = function (client) {
			
	}
};