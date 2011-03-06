;(function () {
	JS.namespace("GUI.controller");
	
	var Logger = JS.include("logger.Logger"),
		Lang   = JS.include("lang.Lang");
	
	GUI.controller.Projects = Backbone.Controller.extend({
		routes : {
			"projects" : "showProjects"
		},
		
		initialize : function (args) {
			this.view = args.view;
		},
		
		showProjects : function () {
			this.view.render();
		}
	});
})();