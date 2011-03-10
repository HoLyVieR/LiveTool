;(function () {
	if (typeof exports != "undefined") {
		validation = exports;
	} else {
		JS.namespace("validation");
	}
	
	// Static class that holds all the validation method //
	validation.Validator = {};
	
	validation.Validator.isUsername = function (test) {
		return /^[a-zA-Z0-9]{3,30}$/.test(test);
	};
	
	validation.Validator.isPassword = function (test) {
		return test != "";
	};
	
	validation.Validator.isProjectName = function (test) {
		return test != "";
	}
	
	validation.Validator.isNum = function (test) {
		return typeof test == "number";
	};
})();