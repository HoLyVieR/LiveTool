;(function () {
	JS.namespace("GUI.view");
	
	var Lang = JS.include("lang.Lang"),
		Logger = JS.include("logger.Logger");
	
	GUI.view.Projects = Backbone.View.extend({
		events : {
			
		},
		
		setProjects : function (projects) {
			var table = $("table" ,this.el)[0], 
				row;
			
			// Remove the old information //
			while (table.rows.length > 1) {
				table.deleteRow(1);
			}
			
			for (var i=0; i<projects.length; i++) {
				row = table.insertRow(i+1);
				cellName = row.insertCell(0);
				cellName.innerHTML = projects[i].name;
			}
		},
		
		render : function () {
			$(this.el).html('\
				<h2>' + Lang.t("My projects") + '</h2>\
				<table>\
					<tr><th>' + Lang.t("Projects") + '</th></tr>\
					<tr><td><b>' + Lang.t("Loading ...") + '</b></td></tr>\
				</table>');
			$(this.el).show();
		}
	});
})();