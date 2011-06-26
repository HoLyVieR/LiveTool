(function () {
    JS.namespace("component");

    var Logger = JS.include("logger.Logger");
    var Movable = JS.include("component.Movable");
    var Resizable = JS.include("component.Resizable");

    // Base Component extends from Movable and Resizable //
    component.BaseComponent = function (_drawZone) {
        Movable.call(this);
        Resizable.call(this, _drawZone);
    };
}());