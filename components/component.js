;(function () {
	JS.namespace("component");
	
	var Logger = JS.include("logger.Logger");
	
	component.Component = function () {
		var self = this;
		
		var _startPoint = { x : 0, y : 0 };
		var _endPoint = { x : 0, y : 0 };
		var _GUID;
		var _connection;
		var _type;
        var _eventHandler = {};
		
		function generateGUID() {
			_GUID = parseInt(Math.random() * 0xEFFF + 0x1000, 10) + "-" +
					parseInt(Math.random() * 0xEFFF + 0x1000, 10) + "-" +
					parseInt(Math.random() * 0xEFFF + 0x1000, 10) + "-" +
					parseInt(Math.random() * 0xEFFF + 0x1000, 10) + "-" + 
					parseInt(Math.random() * 0xEFFF + 0x1000, 10) + "-"
		}
		
		generateGUID();
		
		self.serialize = function () {
			var tempObject = $.extend(true, {}, self, {
				"type" : self.type(),
				"startPoint" : self.startPoint(),
				"endPoint" : self.endPoint(),
				"GUID" : self.GUID()
			});
			
			return JSON.stringify(tempObject);
		};
		
		self.unserialize = function (drawZone, str) {
			var obj = JSON.parse(str);
			var comp = (new component[obj.type]()).createObject(drawZone);
			
			comp.type(obj.type);
			comp.startPoint(obj.startPoint);
			comp.endPoint(obj.endPoint);
			comp.GUID(obj.GUID);
			
			return comp;
		};
		
		self.GUID = function (GUID) {
			if (!GUID) return _GUID;
			_GUID = GUID;
		};
		
		self.type = function (type) {
			if (!type) return _type;
			_type = type;
		};

        // Event handling for the components //
        self.trigger = function (eventName, args) {
            args = [].slice.call(arguments, 1, arguments.length - 1);

            // Check if there are any listener for that event first //
            if (_eventHandler[eventName] && _eventHandler[eventName].length > 0) {

                // Call all the listener //
                for (var i=0, len = _eventHandler[eventName].length; i<len; i++) {
                    try {
                        _eventHandler[eventName][i].apply(null, args);
                    } catch (e) {
                        // Make sure an error won't break everything, but log the error at least //
                        Logger.error(e);
                    }
                }
            }
        };

        self.bind = function (eventName, callback) {
            if (!_eventHandler[eventName]) {
                _eventHandler[eventName] = [];
            }
            
            _eventHandler[eventName].push(callback);
        }
		
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