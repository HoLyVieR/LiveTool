;(function () {
	JS.namespace("component");
	
	var ComponentClass = JS.include("component.Component");
	
	component.Square = function () {
		var self = this;
		
		self.image = "images/square.png";
		self.createObject = function (drawZone) {
			return new component.SquareElement(drawZone);
		};
	};
	
	component.SquareElement = function (drawZone) {
		var self = this;
		var _element;
		
		// Parent constructor class //
		ComponentClass.apply(this);
		
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
			
			_element = drawZone.rect(
				self.startPoint().x, self.startPoint().y,
				self.endPoint().x - self.startPoint().x, self.endPoint().y - self.startPoint().y);
			_element.attr({ "stroke-width" : "2px", "stroke" : "#000000", "fill" : "#ffffff"  });
		}
	};
})();