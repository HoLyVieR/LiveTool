(function () {
	JS.namespace("GUI.view.util");
	
	GUI.view.util.Popup = function () {
		var self = this,
			_divWrapper,
			_greyBackground;
		
		function initPopup() {
			_divWrapper = document.createElement("div");
			_divWrapper.className = "popup";
			
			_greyBackground = document.createElement("div");
			_greyBackground.className = "greyFilter";
			$(_greyBackground).click(function () {
				self.close();
			});
		}
		
		self.setContent = function (child) {
			_divWrapper.innerHTML = "";
			_divWrapper.appendChild(child);
		};
		
		self.open = function () {
			document.body.appendChild(_greyBackground);
			document.body.appendChild(_divWrapper);
		};
		
		self.close = function () {
			document.body.removeChild(_greyBackground);
			document.body.removeChild(_divWrapper);
		};
		
		initPopup();
	};
}());