/**
 * Allows a component to moveable once it was draw
 */
(function () {
    JS.namespace("component");

	var Logger = JS.include("logger.Logger");
    var BOX_SIZE = 6;

    component.Resizable = function (_drawZone) {
        var self = this;
        var _box;
        var _nw, _ne, _sw, _se; // Reference to element of _box, but based their visual position
        var _currentDrag;
        var _hasFocus = false;

        // Handle for the drag & drop of the corner that resize the element //
        function cornerDragStart() {
            _currentDrag = this;

            // Storing the original X / Y
            this.ox = this.attr("x");
            this.oy = this.attr("y");

            // Store the original Xor Y of the other box that are going to move //
            switch (this) {
                case _nw:
                    _ne.oy = _ne.attr("y");
                    _sw.ox = _sw.attr("x");
                    break;
                case _ne:
                    _nw.oy = _nw.attr("y");
                    _se.ox = _se.attr("x");
                    break;
                case _se:
                    _sw.oy = _sw.attr("y");
                    _ne.ox = _ne.attr("x");
                    break;
                case _sw:
                    _se.oy = _se.attr("y");
                    _nw.ox = _nw.attr("x");
                    break;
            }
        }

        function cornerDragMove(dx, dy) {
            this.attr({ x : this.ox + dx });
            this.attr({ y : this.oy + dy });

            // Update the other corner too //
            switch (this) {
                case _nw:
                    _ne.attr({ y : _ne.oy + dy });
                    _sw.attr({ x : _sw.ox + dx });
                    break;
                case _ne:
                    _nw.attr({ y : _nw.oy + dy });
                    _se.attr({ x : _se.ox + dx });
                    break;
                case _se:
                    _sw.attr({ y : _sw.oy + dy });
                    _ne.attr({ x : _ne.ox + dx });
                    break;
                case _sw:
                    _se.attr({ y : _se.oy + dy });
                    _nw.attr({ x : _nw.ox + dx });
                    break;
            }

            updateElementPoint();
            self.preview();
            updateCorner();
        }

        function cornerDragEnd() {
            updateElementPoint();
            self.redraw();
            updateCorner();
            _currentDrag = void 0;
            self.trigger("changed");
        }

        // Update the corner to make sure they are on top //
        function updateCorner() {
            for (var i=0; i<_box.length; i++) {
                _box[i].toFront();
            }
        }

        // Update the start point and end point of the element based on the current position of the box //
        function updateElementPoint() {
            self.startPoint({
                x : _box[0].attr("x") + (BOX_SIZE / 2),
                y : _box[0].attr("y") + (BOX_SIZE / 2)
            });

            self.endPoint({
                x : _box[2].attr("x") + (BOX_SIZE / 2),
                y : _box[2].attr("y") + (BOX_SIZE / 2)
            });
        }

        // Initialize the corner box //
        function initCorner() {
            _box = [
                _drawZone.rect(0, 0, BOX_SIZE, BOX_SIZE),
                _drawZone.rect(0, 0, BOX_SIZE, BOX_SIZE),
                _drawZone.rect(0, 0, BOX_SIZE, BOX_SIZE),
                _drawZone.rect(0, 0, BOX_SIZE, BOX_SIZE)
            ];

            for (var i=0; i<_box.length; i++) {
                // Style
                _box[i].attr({
                    fill : "#ffffff"
                });

                // Events
                _box[i].drag(cornerDragMove, cornerDragStart, cornerDragEnd);
            }

            hideCorner();
        }

        // Hide the corner box //
        function hideCorner () {
            for (var i=0; i<_box.length; i++) {
                _box[i].hide();
            }
        }

        // Display the corner box //
        function showCorner() {
            for (var i=0; i<_box.length; i++) {
                _box[i].show();
                _box[i].toFront();

                // If the corner is the one the most at North West so far //
                if (!_nw || _box[i].attr("x") <= _nw.attr("x") && _box[i].attr("y") <= _nw.attr("y")) {
                    _nw = _box[i];
                }

                // If the corner is the one the most at North East so far //
                if (!_ne || _box[i].attr("x") >= _ne.attr("x") && _box[i].attr("y") <= _ne.attr("y")) {
                    _ne = _box[i];
                }

                // If the corner is the one the most at South West so far //
                if (!_sw || _box[i].attr("x") <= _sw.attr("x") && _box[i].attr("y") >= _sw.attr("y")) {
                    _sw = _box[i];
                }

                // If the corner is the one the most at South East so far //
                if (!_se || _box[i].attr("x") >= _se.attr("x") && _box[i].attr("y") >= _se.attr("y")) {
                    _se = _box[i];
                }
            }

            _nw.attr({ cursor : "nw-resize" });
            _ne.attr({ cursor : "ne-resize" });
            _sw.attr({ cursor : "sw-resize" });
            _se.attr({ cursor : "se-resize" });
        }

        // Move the boxes at the proper place //
        function refreshBoxPosition() {
            var sp = self.startPoint();
            var ep = self.endPoint();

            _box[0].attr({x : sp.x - (BOX_SIZE / 2), y : sp.y - (BOX_SIZE / 2)});
            _box[1].attr({x : sp.x - (BOX_SIZE / 2), y : ep.y - (BOX_SIZE / 2)});
            _box[2].attr({x : ep.x - (BOX_SIZE / 2), y : ep.y - (BOX_SIZE / 2)});
            _box[3].attr({x : ep.x - (BOX_SIZE / 2), y : sp.y - (BOX_SIZE / 2)});
        }

        initCorner();

        self.bind("elementChanged", function () {
            if (_hasFocus) {
                refreshBoxPosition();
                showCorner();
            }
        });

        self.bind("focus", function () {
            refreshBoxPosition();
            showCorner();
            _hasFocus = true;
        });

        self.bind("blur", function () {
            hideCorner();
            _hasFocus = false;
        });
    };
}());