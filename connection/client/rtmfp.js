;(function () {
	JS.namespace("connection.client");

	var Logger = JS.include("logger.Logger");
	
	connection.client.RTMFP = function () {
		var self = {};
		var _manager;
		var _methods = {};
		
		// Setting the methods supported by the module //
		_methods["setPeerID"] = function (data, client) {
			_manager.peerID(data);
		};
		
		self.manager = function (manager) {
			_manager = manager;
		} 
		
		self.data = function (data) {
			
		};
		
		return self;
	}
})();