/**
 * Allows a component to moveable once it was draw
 */
(function () {
    JS.namespace("component");

	var Logger = JS.include("logger.Logger");
    var BOX_SIZE = 10;

    component.Movable = function (_drawZone) {
        var self = this;
        var box = [
            _drawZone.rect(0, 0, BOX_SIZE, BOX_SIZE),
            _drawZone.rect(0, 0, BOX_SIZE, BOX_SIZE),
            _drawZone.rect(0, 0, BOX_SIZE, BOX_SIZE),
            _drawZone.rect(0, 0, BOX_SIZE, BOX_SIZE)
        ];

        function hideCorner () {
            for (var i=0; i<box.length; i++) {
                box[i].hide();
            }
        }

        function showCorner() {
            for (var i=0; i<box.length; i++) {
                box[i].show();
                box[i].toFront();
            }
        }

        // Corner box for selection are hidden at start //
        hideCorner();

        self.bind("focus", function () {
            var sp = self.startPoint();
            var ep = self.endPoint();

            box[0].attr({x : sp.x - (BOX_SIZE / 2), y : sp.y - (BOX_SIZE / 2)});
            box[1].attr({x : sp.x - (BOX_SIZE / 2), y : ep.y - (BOX_SIZE / 2)});
            box[2].attr({x : ep.x - (BOX_SIZE / 2), y : ep.y - (BOX_SIZE / 2)});
            box[3].attr({x : ep.x - (BOX_SIZE / 2), y : sp.y - (BOX_SIZE / 2)});

            showCorner();
        });

        self.bind("blur", function () {
            hideCorner();
        });
    };
}());