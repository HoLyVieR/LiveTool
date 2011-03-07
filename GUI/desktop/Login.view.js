;(function () {
	JS.namespace("GUI.view");
	
	var Lang = JS.include("lang.Lang"),
		Logger = JS.include("logger.Logger");
	
	GUI.view.Login = Backbone.View.extend({
		events : {
			"click .login" : "btnLoginClick",
			"click .create" : "btnCreateClick"
		},
		
		btnLoginClick : function () {
			if (this.validateForm()) {
				var username = $("#username").val();
				var password = $("#password").val();
				
				this.trigger("login" , username, password);
			}
		},
		
		btnCreateClick : function () {
			if (this.validateForm()) {
				var username = $("#username").val();
				var password = $("#password").val();
				
				this.trigger("createAccount" , username, password);
			}
		},
		
		displayError : function (msg) {
			$(".message", this.el).text(msg);
		},
		
		hide : function (callback) {
			callback = callback || function () {};
			
			$(this.el).hide(1000, callback);
		},
		
		setValidator : function (validator) {
			this.validator = validator;
		},
		
		validateForm : function () {
			var username = $("#username").val();
			var password = $("#password").val();
			var error = false;
			
			$("#username").css({ background: "#ffffff" });
			$("#password").css({ background: "#ffffff" });
			
			// If we have a validator //
			if (this.validator) {
				
				// Check username //
				if (!this.validator.isValidUsername(username)) {
					$("#username").css({ background : "#FF809F" });
				}
				
				// Check password //
				if (!this.validator.isValidPassword(password)) {
					$("#password").css({ background : "#FF809F" });
				}
			}
			
			return !error;
		},
		
		render : function () {
			$(this.el).html('<h2>Live Tool Login</h2>\
				<form>\
					' + Lang.t("Username") + ' : <input type="text" id="username" /><br /> \
					' + Lang.t("Password") + ' : <input type="password" id="password" /><br /> \
					<br />\
					<input type="submit" value="' + Lang.t("Login") + '" class="login">\
					<input type="submit" value="' + Lang.t("Create account") + '" class="create">\
				</form>\
				<span class="message"></span>');
			
			$(this.el).show(1000);
			$("form", this.el).submit(function () { return false; });
			
			return this;
		}
	});
})();