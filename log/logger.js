;(function () {
	
	if (typeof exports != "undefined") {
		logger = exports;
	} else {
		JS.namespace("logger");
	}
	
	// Default output //
	var _output = function (msg) { console.log(msg); }; 
	
	logger.Logger = {};
	
	// public static void output (function (str) { ... }) //
	logger.Logger.output = function (fnct) {
		if (typeof fnct != "function") {
			throw new TypeError("Callback must be a function");
		}
		
		_output = fnct;
	}
	
	// public static void trace (str) //
	logger.Logger.trace = function (message) {
		_output(message);
	};
	
	// public static void error (str) //
	logger.Logger.error = function (message) {
		_output("Error : " + message);
	};
})();