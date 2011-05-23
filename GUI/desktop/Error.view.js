;(function () {
	JS.namespace("GUI.view");
	
	var Lang = JS.include("lang.Lang"),
		Logger = JS.include("logger.Logger");
		Popup = JS.include("GUI.view.util.Popup");
		
	GUI.view.Error = Backbone.View.extend({
		render : function () {
			return this;
		},
		
		displayError : function (error) {
			var popup = new Popup(),
				content;
			
			content = $("<p>" +
				"<b>Message : </b>" + error.message + "<br /><br />" +
				"<input type='button' value='Close' class='closeBtn' />" +
			"</p>")[0];
			
			// Register the event listener for buttons //
			$(".closeBtn", content).click(function () {
				popup.close();
			});
			
			popup.setContent(content);
			popup.open();
		}
	});
}());