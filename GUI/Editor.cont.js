;(function () {
	JS.namespace("GUI.controller");
	
	var Logger    = JS.include("logger.Logger"),
		Lang      = JS.include("lang.Lang"),
		Validator = JS.include("validation.Validator");
		
	GUI.controller.Editor = Backbone.Controller.extend({
		routes : {
			"editor/:id" : "loadEditor"
		},
		
		initialize : function (args) {
			this.view = args.view;
			this.connection = args.connection;
			
			// Register the callback for auth //
			var self = this;
			var _methods = {};
			
			_methods["getProjectData"] = function (data) {
				alert(data);
			};
			
			this.connection.register({
				name : "EDITOR",
				
				data : function (data) {
					Logger.trace("Data : " + JSON.stringify(data));
					
					if (_methods[data.methodName]) {
						_methods[data.methodName](data.data);
					}
				}
			});
		},
		
		loadEditor : function (id) {
			this.connection.sendData("EDITOR", 
				{ methodName : "getProjectData", data : id });
		}
	});
})();