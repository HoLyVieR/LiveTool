;(function () {
	JS.namespace("component");
	
	var ComponentClass = JS.include("component.Component");
	
	component.Line = function () {
		var self = this;
		
		self.image = "http://192.168.0.105/images/line.png";
		self.createObject = function (drawZone) {
			return new component.LineElement(drawZone);
		};
	};
	
	component.LineElement = function (drawZone) {
		var self = this;
		var _element;
		
		// Parent constructor class //
		ComponentClass.apply(this);
		
		self.type("Line");
		
		self.preview = self.draw = function () {
			repaint();
		};
		
		/**
		 * Return a reference to the element that was draw
		 */
		self.element = function () {
			return _element;
		};
		
		// Repaint the element in the draw zone  //
		function repaint() {
			if (_element) {
				_element.remove();
			}
			
			_element = drawZone.path(
				"M" + self.startPoint().x + " " + self.startPoint().y + 
				"L" + self.endPoint().x +   " " + self.endPoint().y);
			_element.attr({ "stroke-width" : "2px", "stroke" : "#000000" });
		}
	};
})();