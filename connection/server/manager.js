var  io = require('../../socket.io/lib/socket.io'),
 assert = require('assert');
 logger = require('../../log/logger').Logger;

exports.Manager = function () {
	var self = this;
	var _modules = {};
	var _socket;
	var _peerPool = [];
	
	self.register = function (module) {
		_modules[module.name] = module; 
		
		if (module.manager) {
			module.manager(self);
		} 
	}	
	
	self.listen = function (server) {
		_socket = io.listen(server);
		
		_socket.on('connection', function(client){
			// Adding the metadata structure to the object //
			client.metadata = {};
			client.privdata = {};
			
			// Adding custom function to client //
			client.fn = {};
			client.fn.send = function (module, data) {
				var packet = { module : module, data : data };
				var rawData = JSON.stringify(packet);
				
				logger.trace("Sending : " + rawData);
				client.send(rawData);
			};
			
			// Adding the client to the pool // 
			_peerPool.push(client);
			
			// Notify all module //
			for (var modName in _modules) {
				if (_modules[modName].connect) {
					_modules[modName].connect(client);
				}
			}
			
			client.on('message', function(data) {
				var packet = JSON.parse(data);
				
				assert.ok(!!packet.module, "Invalid packet data");
				assert.ok(!!packet.data, "Invalid packet data");
				
				var mod = _modules[packet.module];
				
				if (mod && mod.data) {
					mod.data(packet.data, client);
				}
			});
			 
			client.on('disconnect', function(){
				// Notify the module of the disconnection //
				for (var modName in _modules) {
					if (_modules[modName].disconnect) {
						_modules[modName].disconnect(client);
					}
				}
				
				var pos = _peerPool.indexOf(client);
				assert.ok(pos != -1, "Client is not in peer pool.");
				
				// Delete the variable and it's content //
				delete _peerPool[pos];
				_peerPool = _peerPool.slice(0, pos).concat(_peerPool.slice(pos + 1));
			}); 
		}); 
	}
}