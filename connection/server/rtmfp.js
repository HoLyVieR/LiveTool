var hash = require('../../security/hash'),
  assert = require('assert'),
  logger = require('../../log/logger').Logger;
  
exports.RTMFPManager = function () {
	var self = this;
	var _manager;
	var _peers = [];
	var _methods = {};
	
	var _nextId = 0;
	
	// Setting the methods supported by the module //
	
	// Return the information of a peer //
	// Input :
	//  - (string) data - Peer ID
	_methods["peerInfo"] = function (data, client) {
		logger.trace("Getting peer info of " + JSON.stringify(data));
		
		var peer = getPeer(data);
		
		if (peer) {
			sendData(client, "peerInfo", peer.metadata);
		} else {
			logger.error("No peer found");
		}
	};
	
	// Return the list of all the peer connected to the server //
	// Input :
	//  - (null) data
	_methods["peerList"] = function (data, client) {
		var peers = [];
		
		for (var i=0; i<_peers.length; i++) {
			peers.push(_peers[i].metadata);
		}
		
		sendData(client, "peerList", peers);
	};
	
	// Defines the RTMFP id of the client //
	// Input :
	//  - (string) data - Peer ID
	_methods["setPeerID"] = function (data, client) {
		client.metadata.id = data;
	};
	
	// Defines if the client supports RTMFP //
	// Input :
	//  - (boolean) data - If RTMFP is supported
	_methods["setRTMFPSupport"] = function (data, client) {
		client.metadata.supportRTMFP = !!data;
		
		if (!client.metadata.supportRTMFP) {
			client.metadata.id = generateId();
			sendData(client, "setPeerID", client.metadata.id);
		}
	};
	
	// Routes a request to an other peer //
	// Input :
	//  - (array)  data.peers - List of the peers to send the data to
	//  - (object) data.data  - Packet data
	_methods["route"] = function (data, client) {
		logger.trace(JSON.stringify(data));
		
		var peers = data.peers;
		var packet = data.data;
		
		assert.ok(!!peers.length, "Peer list must be an array");
		assert.ok(!!packet.data.methodName, "No method name provided in packet");
		
		for (var i = 0; i < peers.length; i++) {
			var peer = getPeer(peers[i]);
			
			if (peer) {
				sendData(peer, packet.data.methodName, packet.data.data);
			}
		}
	};
	
	// Generate random ID //
	function generateId () {
		return "NR" + hash.sha1((_nextId++) + "-" + Math.random() * 123444);
	}
	
	// Send data to a specific client for a specific method //
	function sendData (client, method, data) {
		var packet = { methodName : method, data : data };
		
		client.fn.send("RTMFP", packet);
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
	self.name = "RTMFP";	
	
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
		_peers.push(client);
	}
	
	// Callback when someone disconnect //
	self.disconnect = function (client) {
		for (var i=0; i<_peers.length; i++) {
			if (_peers[i].id == client.id) {
				var pos = i;
				
				delete _peers[pos];
				_peers = _peers.slice(0, pos).concat(_peers.slice(pos + 1));
				return;
			}
		}
	}
}