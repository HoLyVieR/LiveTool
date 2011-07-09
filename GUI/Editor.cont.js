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
            _methods["projectSaved"] = function () { self.projectSaved.apply(self, arguments); };
			
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
					_methods[data.methodName](data.data, peerID);
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
		
		// Callback for the save button //
		saveClick : function () {
			var elements = this.view.getAllElements();
			var serializeArr = [];
			
			for (var i=0; i<elements.length; i++) {
				serializeArr.push(elements[i].serialize());
			}
			
			this.connection.sendData("EDITOR", { methodName : "saveProject", data : JSON.stringify(serializeArr) });
		},
		
		// Ask for synchronisation till we are ssynchronised //
		askForSync : function () {
			// We are synchronised stop asking //
			if (this.isSync) {
				return;
			}
			
			var self = this;
			this.attempt = (this.attempt || 0) + 1;
			
			// Max of 10 attempt //
			if (this.attempt <= 10) {
				this.connection.broadcast({
					"methodName" : "askSyncProjectData"
				});
				
				setTimeout(function () {
					self.askForSync();
				}, 5000);
			}
		},
		
		// When we receive synchronisation data //
		syncProjectData : function (data) {

            // Don't update if we got the data already //
			if (!this.isSync) {
				var elements = JSON.parse(data);
				
				if (elements) {
					for (var i=0; i<elements.length; i++) {
						this.view.drawComponent(elements[i], true);
					}
				}
				
				this.isSync = true;
			}
		},
		
		// When someone ask for a synchronisation //
		askSyncProjectData : function (data, peerID) {
			var elements = this.view.getAllElements();
			var serializeArr = [];
			
			for (var i=0; i<elements.length; i++) {
				serializeArr.push(elements[i].serialize());
			}
			
			//TODO: Send to specific peer //
			this.connection.broadcast({
				"methodName" : "syncProjectData",
				"data" : JSON.stringify(serializeArr)
			});
		},
		
		// When a peer adds a component //
		peerComponentDraw : function (component) {
			this.view.drawComponent(component);
		},
		
		// When a peer updates a component //
		peerComponentUpdate : function (component) {
			this.view.drawComponent(component);
		},
		
		loadEditor : function (id) {
			this.projectId = id;
			this.connection.sendData("EDITOR", { methodName : "joinProject", data : id });
			this.view.render();
		},
		
		// When the project is joined //
		projectJoined : function (data) {
			// We can only get the peer list once we are in the project //
			this.connection.sendData("EDITOR", { methodName : "getPeer", data : this.projectId });
			this.connection.sendData("EDITOR", { methodName : "getProjectData", data : this.projectId });
		},
		
		// When the project is saved successfully //
		projectSaved : function (data)  {
			alert("Project saved with success");
		},
		
		// When we receive project data from the server //
		getProjectData : function (data) {
			var projectData = data.data;
			var name = data.name;
			var elements = JSON.parse(projectData);
			
			if (elements) {
				for (var i=0; i<elements.length; i++) {
					this.view.drawComponent(elements[i], false);
				}
			}
		},
		
		// When we get the list of all the peer connected to the project //
		listProjectPeer : function (data) {
			var self = this;
			
			// We connect to everything who is in the project //
			for (var i=0; i<data.length; i++) {
				this.connection.connect(data[i]);
			}
			
			setTimeout(function () {
				self.askForSync();
			}, 1000);
		},
		
		// We are not logged in //
		authNeeded : function () {
			this.view.hide(function () {
				window.location.hash = "#";
			});
		}
	});
})();