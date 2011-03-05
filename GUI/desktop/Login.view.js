;(function () {
	JS.namespace("GUI.view");
	
	var Lang = JS.include("lang.Lang");
	
	GUI.view.Login = Backbone.View.extend({
		events : {
			"click .login" : "btnLoginClick",
			"click .create" : "btnCreateClick"
		},
		
		btnLoginClick : function () {
			
		},
		
		btnCreateClick : function () {
		
		},
		
		el : $("#login"),
		
		render : function () {
			$(this.el).html('<h2>Live Tool Login</h2>\
				<form>\
					' + Lang.t("Username") + ' : <input type="text" id="username" /><br /> \
					' + Lang.t("Password") + ' : <input type="password" id="password" /><br /> \
					<br />\
					<input type="submit" value="' + Lang.t("Login") + '" class="login">\
					<input type="submit" value="' + Lang.t("Create account") + '" class="create">\
				</form>');
			return this;
		}
	});
})();