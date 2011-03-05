;(function () {
	JS.namespace("lang");
	
	var _currentLang = "EN";
	var _labels = {};
	
	lang.Lang = {};
	lang.Lang.t = function (label) {
		if (!_labels[_currentLang] || !_labels[_currentLang][label])
			return label;
			
		return _labels[_currentLang][label];
	}
	
	lang.Lang.register = function (itName, labels) {
		_labels[itName] = labels;
	}
})();