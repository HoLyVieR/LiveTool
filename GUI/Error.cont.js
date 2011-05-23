;(function () {
	JS.namespace("GUI.controller");
	
	var Logger    = JS.include("logger.Logger"),
		Lang      = JS.include("lang.Lang"),
		Validator = JS.include("validation.Validator");
		
	GUI.controller.Error = Backbone.Controller.extend({
		initialize : function (args) {
			var self = this;
		
			this.connection = args.connection;
			this.view = args.view;
			
			this.connection.register({
				name : "ERROR",
				
				data : function (error) {
					Logger.trace("Error : " + JSON.stringify(error));
					
					self.view.displayError(error);
				}
			});
		}
 	});
} ());