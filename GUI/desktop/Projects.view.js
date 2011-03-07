;(function () {
	JS.namespace("GUI.view");
	
	var Lang = JS.include("lang.Lang"),
		Logger = JS.include("logger.Logger");
	
	GUI.view.Projects = Backbone.View.extend({
		events : {
			"click .new" : "btnNewClick"
		},
		
		btnNewClick : function () {
			this.trigger("createProject");
		},
		
		projectNameClick : function (id) {
			this.trigger("gotoProject", id);
		},
		
		setProjects : function (projects) {
			var table = $("table" ,this.el)[0], 
				row,
				self = this;
			
			// Remove the old information //
			while (table.rows.length > 1) {
				table.deleteRow(1);
			}
			
			for (var i=0; i<projects.length; i++) {
				row = table.insertRow(i+1);
				cellName = row.insertCell(0);
				cellName.innerHTML = projects[i].name;
				
				;(function (projectId) {
					$(cellName).click(function () { self.projectNameClick(projectId); });
				})(projects[i].id);
			}
			
			this.projects = projects;
		},
		
		render : function () {
			$(this.el).html('\
				<h2>' + Lang.t("My projects") + '</h2>\
				<table>\
					<tr><th>' + Lang.t("Name") + '</th></tr>\
					<tr><td><b>' + Lang.t("Loading ...") + '</b></td></tr>\
				</table>\
				<br />\
				<input type="button" value="' + Lang.t("New project") + '" class="new" />');
			$(this.el).show(1000);
		},
		
		hide : function (callback) {
			callback = callback || function () {};
			
			$(this.el).hide(1000, callback);
		}
	});
})();