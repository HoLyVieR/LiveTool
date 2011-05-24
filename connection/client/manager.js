;(function () {
	JS.namespace("connection.client");
	
	var RTMFP       = JS.include("Flash.RTMFP");
	var SocketIO    = JS.include("io.Socket");
	var Logger      = JS.include("logger.Logger");
	var RTMFPHandle = JS.include("connection.client.RTMFP");
	
	connection.client.Manager = function () {
		var self = {};
		var _server;
		var _modules = {};
		var _peerID;
		var _rtmfp;
		var _methods = {};
		var _peers = {};
		
		// Event callback //
		var _callbackPeerID = function () {};
		var _callbackData = function () {};
		var _callbackConnect = function () {};
		var _callbackReady = function () {};
		
		// Initialization of the connection to the server //
		_server = new SocketIO();
		_server.connect();
		_server.on("connect", function () {
			Logger.trace("connected to the server");
		});
		
		_server.on("message", function (data) {
			Logger.trace("message received from the server : " + data);
			Logger.trace("message : " + data);
			
			var packet = JSON.parse(data);
			var mod = _modules[packet.module];
			
			if (mod && mod.data) {
				_modules[packet.module].data(packet.data);
			}
		});
		
		_server.on("disconnect", function () {
			Logger.trace("disconnected from the server");
		});
		
		self.init = function () {
			_rtmfp = RTMFP("rtmfp://stratus.adobe.com/6ecefef13b73d3210ce8fb75-9dacf6e65e4a");
			
			_rtmfp.ready(function () {
				Logger.trace("RTMFP connection ready. ID : " + _rtmfp.id());
				
				// Let the server know we support RTMFP //
				self.sendData("RTMFP", {
					methodName : "setRTMFPSupport", 
					data : true }); 
				
				// Let the server know what is our ID //
				self.sendData("RTMFP", {
					methodName : "setPeerID", 
					data : _rtmfp.id() });
					
				_peerID = _rtmfp.id();
					
				// Send the ready signal //
				_callbackReady();
			});
			
			_rtmfp.error(function () {
				Logger.trace("Error detected : " + _rtmfp.support() + " ?");
				
				// Let the server know if we don't support RTMFP //
				if (!_rtmfp.support()) {
					self.sendData("RTMFP", {
						methodName : "setRTMFPSupport", 
						data : false });
				}
			});
			
			_rtmfp.peerConnect(function (peerID) {
				self.sendData("RTMFP", { methodName : "peerInfo", data : peerID });
			});
			
			_rtmfp.messageReceive(function (peerID, data) {
				Logger.trace("RTMFP Message Received : " + JSON.stringify(data));
				
				try {
					_callbackData(peerID, data);
				} catch (e) {
					Logger.error(JSON.stringify(e));
				}
			});
			
			_rtmfp.init();
		}
		
		// Register a module //
		self.register = function (module) {
			_modules[module.name] = module;
		};
		
		self.sendData = function (module, data) {
			var packet = {module : module, data : data};
			
			Logger.trace("Sending (To Server) : " + JSON.stringify(packet));
			_server.send(JSON.stringify(packet));
		};
		
		// Getter / Setter //
		
		self.peerID = function (peerID) {
			if (peerID) { _peerID = peerID; _callbackPeerID(); }
			return _peerID;
		}
		
		// Event listener setter //
		self.peerIDChange = function (fnct) {
			if (typeof fnct != "function") {
				throw new TypeError("Callback must be a function");
			}
			
			_callbackPeerID = fnct;
		}
		
		self.data = function (fnct) {
			if (typeof fnct != "function") {
				throw new TypeError("Callback must be a function");
			}
			
			_callbackData = fnct;
		};
		
		self.peerConnect = function (fnct) {
			if (typeof fnct != "function") {
				throw new TypeError("Callback must be a function");
			}
			
			_callbackConnect = fnct;
		}
		
		self.ready = function (fnct) {
			if (typeof fnct != "function") {
				throw new TypeError("Callback must be a function");
			}
			
			_callbackReady = fnct;
		}
		
		// Connect to a peerID //
		self.connect = function (peerID) {
			// Don't attempt to connect to self //
			if (peerID === self.peerID()) {
				return;
			}
			
			self.sendData("RTMFP", { methodName : "peerInfo", data : peerID });
		};
		
		self.connectToAll = function () {
			self.sendData("RTMFP", { methodName : "peerList", data : {} });
		};
		
		self.broadcast = function (data) {
			// We broadcast to the host we can //
			if (_rtmfp.support()) {
				_rtmfp.send(data);
			}
			
			// Find which peer can't be reached via RTMFP //
			var peersNoRTMFP = [];
			
			for (var id in _peers) {
				if (!_rtmfp.support() || !_peers[id].supportRTMFP) {
					peersNoRTMFP.push(id);
				}
			}
			
			if (peersNoRTMFP.length > 0) {
				routeRequest(
					{ module : "RTMFP", 
					  data : { methodName : "broadcast", data :  { data : data, origin : _peerID  } } } , peersNoRTMFP);
			}
		};
		
		// Generic communication //
		function routeRequest(packet, peersID) {
			self.sendData("RTMFP",
				{ methodName : "route", 
				  data : {data : packet, peers : peersID } } );
		}
		
		function connectToPeer (client) {
			Logger.trace("Connection to peer : " + JSON.stringify(client));
			
			// If we and the peer support RTMFP //
			if (client.supportRTMFP && _rtmfp.support()) {
				Logger.trace("Using RTMFP");
				
				_rtmfp.addPeer(client.id);
			} else {
				Logger.trace("Using Node routing");
				
				// Fallback method with Node as route //
				routeRequest(
					{ module : "RTMFP", 
					  data : { methodName : "connect", data :  _peerID  } } , [ client.id ]);
			}
		}
		
		// Methods supported for the RTMFP module //
		_methods["setPeerID"] = function (data) {
			_peerID = data;
			
			// Send the ready signal //
			_callbackReady();
		}
		
		_methods["peerInfo"] = function (data) {
			Logger.trace("Peer info : " + JSON.stringify(data));
			
			// For new peer we connect to them //
			if (!_peers[data.id]) {
				connectToPeer(data);
				_callbackConnect(data);
			}
			
			_peers[data.id] = data;
		};
		
		_methods["broadcast"] = function (data) {
			Logger.trace("Data (From Peer) : " + JSON.stringify(data));
			
			try {
				_callbackData(data.origin, data.data);
			} catch (e) {
				Logger.error(JSON.stringify(e));
			}
		}
		
		_methods["connect"] = function (data) {
			Logger.trace("Received connection from " + JSON.stringify(data));
			
			// For new peer we connect to them //
			if (!_peers[data]) {
				self.sendData("RTMFP", { methodName : "peerInfo", data : data });
			}
		};
		
		_methods["peerList"] = function (data) {
			Logger.trace("Received peer list");
			
			// We connect to everyone except us //
			for (var i=0; i<data.length; i++) {
				if (data[i].id != self.peerID()) 
					_methods["peerInfo"](data[i]);
			}
		};
		
		// Self register to handle all the RTMFP command //
		self.register({
			name : "RTMFP",
			
			data : function (data) {
				Logger.trace("Data : " + JSON.stringify(data));
				
				if (_methods[data.methodName]) {
					_methods[data.methodName](data.data);
				}
			}
		});
		
		return self;
	}
})();