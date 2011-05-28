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
			
			var self = this;
			
			// Register the callback for the component draw / update //
			this.view.bind("componentDrawEnd", function () { self.componentDrawEnd.apply(self, arguments); });
			this.view.bind("componentUpdate", function () { self.componentUpdate.apply(self, arguments); });
			this.view.bind("saveClick", function () { self.saveClick.apply(self, arguments); });
			
			// Register the callback for auth //
			var self = this;
			var _methods = {};
			
			_methods["getProjectData"]   = function () { self.getProjectData.apply(self, arguments); };
			_methods["authNeeded"] = function () { self.authNeeded.apply(self, arguments); };
			_methods["listProjectPeer"] = function () { self.listProjectPeer.apply(self, arguments); };
			_methods["projectJoined"] = function () { self.projectJoined.apply(self, arguments); };
			
			_methods["componentDraw"] = function () { self.peerComponentDraw.apply(self, arguments); };
			_methods["componentUpdate"] = function () { self.peerComponentUpdate.apply(self, arguments); };
			_methods["syncProjectData"] = function () { self.syncProjectData.apply(self, arguments); };
			_methods["askSyncProjectData"] = function () { self.askSyncProjectData.apply(self, arguments); };
			
			this.connection.register({
				name : "EDITOR",
				
				data : function (data) {
					Logger.trace("Data : " + JSON.stringify(data));
					
					if (_methods[data.methodName]) {
						_methods[data.methodName](data.data);
					}
				}
			});
			
			this.connection.data(function (peerID, data) {
				Logger.trace("Data (For Editor, From Peer) : " + JSON.stringify(data));
					
				if (_methods[data.methodName]) {
					_methods[data.methodName](data.data);
				}
			});
		},
		
		// Callback when a component is added //
		componentDrawEnd : function (component) {
			this.connection.broadcast({
				"methodName" : "componentDraw",
				"data" : component.serialize()
			});
		},
		
		// Callback when a component is updated  //
		componentUpdate : function (component) {
			this.connection.broadcast({
				"methodName" : "componentUpdate",
				"data" : component.serialize()
			});
		},
		
		saveClick : function () {
			var elements = this.view.getAllElements();
			var serializeArr = [];
			
			for (var i=0; i<elements.length; i++) {
				serializeArr.push(elements[i].serialize());
			}
			
			this.connection.sendData("EDITOR", { methodName : "saveProject", data : JSON.stringify(serializeArr) });
		},
		
		// Peer events //
		peerComponentDraw : function (component) {
			this.view.drawComponent(component);
		},
		
		peerComponentUpdate : function (component) {
			
		},
		
		loadEditor : function (id) {
			this.projectId = id;
			this.connection.sendData("EDITOR", { methodName : "joinProject", data : id });
			this.view.render();
		},
		
		projectJoined : function (data) {
			// We can only get the peer list once we are in the project //
			this.connection.sendData("EDITOR", { methodName : "getPeer", data : this.projectId });
			this.connection.sendData("EDITOR", { methodName : "getProjectData", data : this.projectId });
		},
		
		projectSaved : function (data)  {
			alert("Project saved with success");
		},
		
		getProjectData : function (data) {
			var projectData = data.data;
			var name = data.name;
			var elements = JSON.parse(projectData);
			
			for (var i=0; i<elements.length; i++) {
				this.view.drawComponent(elements[i], false);
			}
		},
		
		listProjectPeer : function (data) {
			// We connect to everything who is in the project //
			for (var i=0; i<data.length; i++) {
				this.connection.connect(data[i]);
			}
		},
		
		authNeeded : function () {
			this.view.hide(function () {
				window.location.hash = "#";
			});
		}
	});
})();