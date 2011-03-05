;(function () {
	JS.namespace("GUI.controller");
	
	var Logger = JS.include("logger.Logger");
	
	GUI.controller.Login = Backbone.Controller.extend({
		initialize : function (args) {
			this.connection = args.connection;
			this.view = args.view;
			
			// Register the callback for auth //
			var _methods = {};
			
			_methods["loginFail"] = this.loginFail;
			_methods["loginSuccess"] = this.loginSuccess;
			
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
			var self = this;
			this.view.bind("login", function () { self.tryLogin.apply(self, arguments); });
			this.view.bind("createAccount", function () { self.createAccount.apply(self, arguments); });
			
			// Register the validator //
			this.view.setValidator(this);
		},
		
		isValidUsername : function (username) { return username != ""; },
		isValidPassword : function (password) { return password != ""; },
		
		tryLogin : function (username, password) {
			this.connection.sendData("AUTH", {methodName : "login", data : { username : username, password : password }})
		},
		
		createAccount : function (username, password) {
			
		},
		
		loginFail : function () {
			alert("Échec");
		},
		
		loginSuccess : function () {
			alert("Yay");
		}
	});
})();