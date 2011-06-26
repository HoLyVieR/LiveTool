;(function () {
	JS.namespace("GUI.view");
	
	var Lang   = JS.include("lang.Lang"),
		Logger = JS.include("logger.Logger"),
		Popup  = JS.include("GUI.view.util.Popup");
	
	GUI.view.Projects = Backbone.View.extend({
		events : {
			"click .new" : "btnNewClick",
            "click .refresh" : "btnRefreshClick"
		},
		
		btnNewClick : function () {
			this.trigger("createProject");
		},

        btnRefreshClick : function () {
            this.trigger("refreshProject");
        },

		projectNameClick : function (id) {
			this.trigger("gotoProject", id);
		},
		
		addContributorClick : function (id) {
			this.displayAddContributorDialog(id);
		},
		
		setProjects : function (projects) {
			var table = $("table", this.el)[0], 
				row,
				self = this;
			
			// Remove the old information //
			while (table.rows.length > 1) {
				table.deleteRow(1);
			}
			
			for (var i=0; i<projects.length; i++) {
				row = table.insertRow(i+1);
				cellName = row.insertCell(0);
				cellName.innerHTML = 
					"<div style='float: right'><input type='button' value='Enter' class='enter' /></div>" +
					"<p><b>Project Name : </b>" + projects[i].name + "</p>" + 
					"<table>" + 
						"<tr>" +
							"<th>Name</th><th>Permission</th>" +
						"</tr>" +
						"<tr>" +
						"</tr>" +
					"</table>" +
					"<input type='button' value='Add contributor' class='addContributor'>";
				
				// Event listener for the buttons //
				;(function (projectId) {
					$("input.enter", cellName).click(function () { self.projectNameClick(projectId); });
					$("input.addContributor", cellName).click(function () { self.addContributorClick(projectId); });
				})(projects[i].id);
				
				// Adding the contributors //
				var tableContributor = $("table", cellName)[0],
					row, cell, permission;
				
				for (var name in projects[i].contributors) {
					permission = +projects[i].contributors[name];
					
					row = tableContributor.insertRow(tableContributor.rows.length);
					cell = row.insertCell(0);
					cell.innerHTML = name;
					
					cell = row.insertCell(1);
					cell.innerHTML = "" +
						((permission & 4) ? "Admin" : "") + " " +
						((permission & 2) ? "Write" : "") + " " +
						((permission & 1) ? "Read" : "");
				}
			}
			
			this.projects = projects;
		},
		
		displayAddContributorDialog : function (projectId) {
			var self = this,
				popup = new Popup(),
				content,
				inputName, inputHasAdmin, inputHasWrite, inputHasRead;
			
			content = $(
				"<div class='dialogAddContributor'>" +
					"<table>" +
						"<tr>" +
							"<td><b>Name :</b></td>" +
							"<td><input type='text' class='name' /></td>" +
						"</tr>" +
						"<tr>" +
							"<td><b>Permission :</b></td>" +
							"<td>" +
								"Admin <input type='checkbox' class='hasAdmin' />" +
								"Write <input type='checkbox' class='hasWrite' />" +
								"Read  <input type='checkbox' class='hasRead' />" +
							"</td>" +
						"</tr>" +
					"</table>" +
					"<input type='button' value='Add' class='addBtn' />&#160;" +
					"<input type='button' value='Cancel' class='cancelBtn' />" +
				"</div>")[0];
			
			// We keep the reference to the input //
			inputName = $(".name", content)[0];
			inputHasAdmin = $(".hasAdmin", content)[0];
			inputHasWrite = $(".hasWrite", content)[0];
			inputHasRead = $(".hasRead", content)[0];
			
			// Adding the event listener to the button //
			$(".addBtn", content).click(function () {
				self.trigger("addContributor", projectId, inputName.value, inputHasAdmin.checked, inputHasWrite.checked, inputHasRead.checked);
				popup.close();
			});
			
			$(".cancelBtn", content).click(function () {
				popup.close();
			});
			
			popup.setContent(content);
			popup.open();
		},
		
		render : function () {
			$(this.el).html('\
				<h2>' + Lang.t("My projects") + '</h2>\
				<table>\
					<tr><th>' + Lang.t("Name") + '</th></tr>\
					<tr><td><b>' + Lang.t("Loading ...") + '</b></td></tr>\
				</table>\
				<br />\
				<input type="button" value="' + Lang.t("New project") + '" class="new" />\
                <input type="button" value="' + Lang.t("Refresh") + '" class="refresh" />');

			$(this.el).show(0);
		},
		
		hide : function (callback) {
			callback = callback || function () {};
			
			$(this.el).hide(0, callback);
		}
	});
})();