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
			this.connection = args.connection;
			
			// Register the callback for auth //
			var self = this;
			var _methods = {};
			
			_methods["projectCreated"]    = function () { self.projectCreated.apply(self, arguments); };
			_methods["listProject"] = function () { self.listProject.apply(self, arguments); };
			_methods["authNeeded"]   = function () { self.authNeeded.apply(self, arguments); };
			
			this.connection.register({
				name : "PROJECT",
				
				data : function (data) {
					Logger.trace("Data : " + JSON.stringify(data));
					
					if (_methods[data.methodName]) {
						_methods[data.methodName](data.data);
					}
				}
			});
			
			// Event binding of the view //
			this.view.bind("createProject", function () { self.createProject.apply(self, arguments); });
			this.view.bind("gotoProject", function () { self.gotoProject.apply(self, arguments); });
		},
		
		gotoProject : function (id) {
			this.view.hide(function () {
				window.location.hash = "#editor/" + id;
			});
		},
		
		projectCreated : function () {
			this.connection.sendData("PROJECT", { methodName : "listProject" });
		},
		
		listProject : function (projects) {
			this.view.setProjects(projects);
		},
		
		authNeeded : function () {
			this.view.hide(function () {
				window.location.hash = "#";
			});
		},
		
		createProject : function () {
			var projectName = prompt("Nom du projet");
			
			this.connection.sendData("PROJECT", { methodName : "createProject", data : projectName });
		},
		
		showProjects : function () {
			this.view.render();
			this.connection.sendData("PROJECT", { methodName : "listProject" });
		}
	});
})();