;(function () {
	JS.namespace("component");
	
	component.Component = function () {
		var self = this;
		
		var _startPoint = { x : 0, y : 0 };
		var _endPoint = { x : 0, y : 0 };
		var _GUID;
		var _connection;
		
		self.serialize = function () {
			return JSON.stringify(self);
		};
		
		self.unserialize = function (str) {
			var obj = JSON.parse(str);
			
			for (var i in obj) {
				self[i] = obj[i];
			}
		};
		
		self.GUID = function (GUID) {
			if (!GUID) return _GUID;
			_GUID = GUID;
		};
		
		// Allow generic event binding //
		var supportedEvent = ["click", "mouseup", "mousedown", "mousemove"];
		
		for (var i=0; i<supportedEvent.length; i++) {
			(function (event) {
				self[event] = function (fnct) {
					(self.element())[event](fnct);
				};
			})(supportedEvent[i]);
		};
		
		// Define/Read the start point of the element  //
		self.startPoint = function (startPoint) {
			if (!startPoint) return _startPoint;
			_startPoint = startPoint;
		};
		
		
		// Define/Read the end point of the element //
		self.endPoint = function (endPoint) {
			if (!endPoint) return _endPoint;
			_endPoint = endPoint;
		};
		
		// Define the connection object that we use to notify update //
		self.connection = function (connection) {
			if (!connection) return _connection;
			_connection = connection;
		};
		
		// Notify everything of the update to an element //
		self.notifyUpdate = function () {
			_connection.broadcast();
		};
	};
})();