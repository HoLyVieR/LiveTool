;(function () {
	JS.namespace("component");
	
	var ComponentClass = JS.include("component.Component");
	var Logger = JS.include("logger.Logger");
    var Resizable = JS.include("component.Resizable");

	component.Square = function () {
		var self = this;
		
		self.image = "/images/square.png";
		self.createObject = function (drawZone) {
			return new component.SquareElement(drawZone);
		};
	};
	
	component.SquareElement = function (drawZone) {
		var self = this;
		var _element;
		
		// Parent constructor class //
		ComponentClass.apply(self);
		Resizable.call(self, drawZone);

		self.type("Square");
		
		self.redraw = self.preview = self.draw = function () {
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
			
			var smallestX = Math.min(self.startPoint().x, self.endPoint().x),
				smallestY = Math.min(self.startPoint().y, self.endPoint().y),
				 biggestX = Math.max(self.startPoint().x, self.endPoint().x),
				 biggestY = Math.max(self.startPoint().y, self.endPoint().y);
			
			_element = drawZone.rect(
				smallestX, smallestY,
				biggestX - smallestX, biggestY - smallestY);
			_element.attr({ "stroke-width" : "2px", "stroke" : "#000000", "fill" : "#ffffff"  });

            self.notifyChange();
		}
	};
})();