(function () {
    JS.namespace("component");

	var Logger = JS.include("logger.Logger");

    component.Movable = function () {
        var self = this;
        var _hasFocus = false;
        var _osp, _oep; // Original Start Point & Original End Point //
        var _ocp; // Original Click Position //
        var _isDragging = false;
        var _hasMoved = false; // Flag to know wheter the drag moved the element or not //

        function moveStart(event) {
            if (!_hasFocus) {
                return;
            }

            // Save the original start point and end point //
            _osp = self.startPoint();
            _oep = self.endPoint();
            _ocp = {
                x : event.pageX,
                y : event.pageY
            };

            $(document.body).bind("mousemove", moveMove);
            $(document.body).bind("mouseup", moveEnd);

            _isDragging = true;
            _hasMoved = false;
        }

        function moveMove(event) {
            if (!_hasFocus) {
                return;
            }

            var dx = event.pageX - _ocp.x;
            var dy = event.pageY - _ocp.y;

            self.startPoint({
                x : _osp.x + dx,
                y : _osp.y + dy
            });

            self.endPoint({
                x : _oep.x + dx,
                y : _oep.y + dy
            });

            self.preview();

            _hasMoved = true;
        }

        function moveEnd() {
            if (!_hasFocus) {
                return;
            }

            if (_hasMoved) {
                self.redraw();
                self.trigger("changed");
            }

            _isDragging = false;

            // Reset the binding //
            unbindEvents();
            bindEvents();
        }

        function bindEvents () {
            self.bind("mousedown", moveStart);
        }

        function unbindEvents() {
            self.unbind("mousedown", moveStart);
            $(document.body).unbind("mousemove", moveMove);
            $(document.body).unbind("mouseup", moveEnd);
        }

        self.bind("elementChanged", function () {
            if (_hasFocus && !_isDragging) {
                bindEvents();
            }
        });

        self.bind("focus", function () {
            _hasFocus = true;
            bindEvents();
        });

        self.bind("blur", function () {
            _hasFocus = false;
            unbindEvents();
        });
    };
}());