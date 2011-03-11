;(function () {
	JS.namespace("GUI.view");
	
	var Lang = JS.include("lang.Lang"),
		Logger = JS.include("logger.Logger");
		
	GUI.view.Editor = Backbone.View.extend({
		events : {
			
		},
		
		render : function (args) {
			$(this.el).html('\
				<div id="bottomBar">\
					<div id="arrowBox">\
						<img src="" width="25px" height="50px">\
						<img src="" width="25px" height="50px">\
					</div>\
					<div id="iconsBox">\
						<ul>\
							<li><img src="" width="50px" height="50px"></li>\
							<li><img src="" width="50px" height="50px"></li>\
						</ul>\
					</div>\
					<div id="utilitiesBox">\
						<img src="" width="50px" height="50px">\
						<img src="" width="50px" height="50px">\
					</div>\
				</div>\
			');
			
			$(this.el).show(1000);
			
			return this;
		},
		
		hide : function (callback) {
			callback = callback || function () {};
			
			$(this.el).hide(1000, callback);
		}
	});
})();