;(function () {
	JS.namespace("component");

	var Logger = JS.include("logger.Logger");
    var BaseComponent = JS.include("component.BaseComponent");

    component.Textbox = function () {
		var self = this;

		self.image = "/images/textbox.png";
		self.createObject = function (drawZone) {
			return new component.TextboxElement(drawZone);
		};
	};

    component.TextboxElement = function (drawZone) {
        var self = this;
        var _element;
        var _textbox;
        var _textSVG;
        var _text = "";

		// Parent constructor class //
		BaseComponent.call(self, drawZone);

        self.type("Textbox");

        // Drawing events //
        self.redraw = self.preview = function () {
			repaint();
		};

        self.draw = function () {
            initTextbox();
            self.redraw();
        };

        // Non-drawing related events //
        self.bind("dblclick", function () {
            displayTextbox();
        });

        self.bind("blur", function () {
            hideTextbox();
        });

        self.bind("changed", function () {
            updateTextboxPosition();
        });

        /**
		 * Return a reference to the element that was draw
		 */
		self.element = function () {
			return _element;
		};

        function initTextbox() {
            _textbox = document.createElement("textarea");
            _textbox.style.position = "absolute";

            document.body.appendChild(_textbox);

            updateTextboxPosition();
            hideTextbox();
        }

        function displayTextbox () {
            _textbox.style.display = "block";
            _textbox.focus();
            _textbox.value = _text;
        }

        function hideTextbox () {
            _textbox.style.display = "none";
            _textbox.blur();
            _text = _textbox.value;

            self.redraw();
        }

        function updateTextboxPosition() {
            _textbox.style.width = _element.attr("width") + "px";
            _textbox.style.height = _element.attr("height") + "px";

            var offsetSVG = $(drawZone.canvas).offset();
            var offsetBorder = parseInt(_element.attr("stroke-width"), 10) / 2;

            $(_textbox).css({
                top : _element.attr("y") + offsetSVG.top + offsetBorder,
                left : _element.attr("x") +  + offsetSVG.left + offsetBorder * 2
            });
        }

        // Repaint the element in the draw zone  //
		function repaint() {
			if (_element) {
				_element.remove();
                _textSVG.remove();
			}

			var smallestX = Math.min(self.startPoint().x, self.endPoint().x),
				smallestY = Math.min(self.startPoint().y, self.endPoint().y),
				 biggestX = Math.max(self.startPoint().x, self.endPoint().x),
				 biggestY = Math.max(self.startPoint().y, self.endPoint().y);

			_element = drawZone.rect(
				smallestX, smallestY,
				biggestX - smallestX, biggestY - smallestY);
			_element.attr({ "stroke-width" : "4px", "stroke" : "#000000", "fill" : "#ffffff"  });

            _textSVG = drawZone.text(
                smallestX + 13, smallestY + 9,
                _text
            );

            self.trigger("elementChanged");
		}
    };
}());