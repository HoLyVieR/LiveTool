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
			_methods["notEnoughPriviledge"]   = function () { self.notEnoughPriviledge.apply(self, arguments); };
			_methods["contributorAdded"]   = function () { self.contributorAdded.apply(self, arguments); };
			
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
			this.view.bind("addContributor", function () { self.addContributor.apply(self, arguments); });
		},
		
		gotoProject : function (id) {
			this.view.hide(function () {
				window.location.hash = "#editor/" + id;
			});
		},
		
		createProject : function () {
			var projectName = prompt("Name of the project");
			
			if (projectName) {
				this.connection.sendData("PROJECT", { methodName : "createProject", data : projectName });
			}
		},
		
		projectCreated : function () {
			// Refresh the project list //
			this.connection.sendData("PROJECT", { methodName : "listProject" });
		},
		
		addContributor : function (projectId, name, hasAdmin, hasWrite, hasRead) {
			var permission = (+!!hasAdmin * 4) + (+!!hasWrite * 2) + (+!!hasRead); 
			
			this.connection.sendData("PROJECT", { methodName : "addContributor", data : {name : name, permission : permission, id : projectId} });
		},
		
		contributorAdded : function () {
			// Refresh the project list //
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
		
		notEnoughPriviledge : function () {
			alert("You need more priviledge to do this action.");
		},
		
		showProjects : function () {
			this.view.render();
			this.connection.sendData("PROJECT", { methodName : "listProject" });
		}
	});
})();