(function () {
    JS.namespace("component");

    var Logger = JS.include("logger.Logger");
    var Movable = JS.include("component.Movable");
    var Resizable = JS.include("component.Resizable");
    var ComponentClass = JS.include("component.Component");

    // Base Component extends from Movable and Resizable //
    component.BaseComponent = function (_drawZone) {
        ComponentClass.call(this);
        Movable.call(this);
        Resizable.call(this, _drawZone);
    };
}());