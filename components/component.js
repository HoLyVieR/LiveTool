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
		var _supportedEvent = ["click", "mouseup", "mousedown", "mousemove"];

        function addEventSupport(event) {
            self[event] = function (fnct) {
                self.bind(event, fnct);
            };
        }

        function bindSupportedEvent(element) {
            for (var i=0; i<_supportedEvent.length; i++) {
                (function (event) {
                    element[event](function () {
                        var args = [].splice.call(arguments, 0); // Convert "arguments" fake-array to real-array

                        self.trigger.apply(null, [event].concat(args));
                    });
                }(_supportedEvent[i]));
            }
        }

		for (var i=0; i<_supportedEvent.length; i++) {
			addEventSupport(_supportedEvent[i]);
		}
		
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
		
		// Notification received when the element changed //
		self.notifyChange = function () {

            // Rebind the events //
            bindSupportedEvent(self.element());
		};
	};
})();