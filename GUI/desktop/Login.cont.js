;(function () {
	JS.namespace("GUI.controller");
	
	var Logger = JS.include("logger.Logger"),
		Lang   = JS.include("lang.Lang");
	
	GUI.controller.Login = Backbone.Controller.extend({
		routes : {
			"" : "homepage"
		},
		
		initialize : function (args) {
			this.connection = args.connection;
			this.view = args.view;
			
			
			// Register the callback for auth //
			var self = this;
			var _methods = {};
			
			_methods["loginFail"]    = function () { self.loginFail.apply(self, arguments); };
			_methods["loginSuccess"] = function () { self.loginSuccess.apply(self, arguments); };
			_methods["loginExist"]   = function () { self.loginExist.apply(self, arguments); };
			
			this.connection.register({
				name : "AUTH",
				
				data : function (data) {
					Logger.trace("Data : " + JSON.stringify(data));
					
					if (_methods[data.methodName]) {
						_methods[data.methodName](data.data);
					}
				}
			});
			
			// Register the callback to the view //
			this.view.bind("login", function () { self.tryLogin.apply(self, arguments); });
			this.view.bind("createAccount", function () { self.createAccount.apply(self, arguments); });
			
			// Register the validator //
			this.view.setValidator(this);
		},
		
		homepage : function () {
			this.view.render();
		},
		
		isValidUsername : function (username) { return username != ""; },
		isValidPassword : function (password) { return password != ""; },
		
		tryLogin : function (username, password) {
			this.connection.sendData("AUTH",
				{methodName : "login", data : { username : username, password : password }});
		},
		
		createAccount : function (username, password) {
			this.connection.sendData("AUTH",
				{methodName : "createAccount", data : { username : username, password : password }});
		},
		
		loginFail : function () {
			this.view.displayError(Lang.t("Invalid username / password"));
		},
		
		loginSuccess : function () {
			this.view.hide(function () {
				window.location.hash = "#projects";
			});
		},
		
		loginExist : function () {
			this.view.displayError(Lang.t("Username already exist"));
		}
	});
})();