;(function () {
	JS.namespace("GUI.view");
	
	var Lang = JS.include("lang.Lang"),
		Logger = JS.include("logger.Logger"),
		GenericComponent = JS.include("component.Component");
		
	GUI.view.Editor = Backbone.View.extend({
		events : {
			
		},
		
		isRendered : false,
		
		render : function () {
			var self = this;
			
			// Prevent double rendering //
			if (self.isRendered) {
				$(this.el).show();
				return;
			}
			
			self.isRendered = true;
			
			$(this.el).html('\
				<div id="bottomBar">\
					<div id="arrowBox">\
						<img src="/images/arrow-left.png" width="25px" height="50px">\
						<img src="/images/arrow-right.png" width="25px" height="50px">\
					</div>\
					<div id="iconsBox">\
						<ul></ul>&#8203;\
					</div>\
					<div id="utilitiesBox">\
						<img src="/images/plus.png" width="50px" height="50px">\
						<img src="/images/save.png" width="50px" height="50px">\
					</div>\
				</div>\
				<div id="svg"></div>\
			');
			
			// Initializating the svg zone //
			this.drawZone = new Raphael($("#svg")[0], 800, 600);
			var background = this.drawZone.rect(0, 0, 800, 600);
			background.attr({ fill : "#ffffff" });
            background.click(function () {
                self.backgroundClick();
            });
			
			$("#svg").css({ width: 800, height: 600 });
			
			
			// Initializating the control //
			var arrows = $("#arrowBox img");
			var utilities = $("#utilitiesBox img");
			var scrollPane = $($("#iconsBox ul")[0]);
			
			scrollPane.css('left', '0px');
			
			// Left arrow //
			$(arrows[0]).click(function () {
				scrollPane.css('left', function (index, value) {
					return parseInt(value) - 50;
				});
			});
			
			// Right arrow //
			$(arrows[1]).click(function () {
				scrollPane.css('left', function (index, value) {
					return parseInt(value) + 50;
				});
			});
			
			// Plus button //
			$(utilities[0]).click(function () {
				
			});
			
			// Save button //
			$(utilities[1]).click(function () {
				self.trigger("saveClick");
			});
			
			$("#svg").mousedown(function (ev) {
                ev.preventDefault();

				var offset = $("#svg").offset();
				var x = ev.pageX - offset.left;
				var y = ev.pageY - offset.top;
				
				if (self.currentSelector) {
					self.drawStart(x, y);
				}
			});
			
			$(document.body).mousemove(function (ev) {
				var offset = $("#svg").offset();
				var x = ev.pageX - offset.left;
				var y = ev.pageY - offset.top;
				
				if (self.currentDraw) {
					self.drawUpdate(x, y);
				}
			});
			
			$(document.body).mouseup(function (ev) {
				self.drawStop();
			});
			
			$(this.el).show();
			
			return this;
		},
		
		/**
		 * Elements 
		 */
		
		elements : [],
		
		addElement : function (element) {
			var self = this;

            this.elements.push(element);
			
			// Register the events //
			element.click(function () {
				self.elementClick(element);
			});

            element.bind("changed", function (){
                self.trigger("componentUpdate", element);
                Logger.trace(element.GUID() + " has changed");
            });
		},
		
		getAllElements : function () {
			return this.elements;
		},

        /**
               * Element events
               */

        currentFocus : void 0,

        elementClick : function (element) {
            if (this.currentFocus != element) {

                // Blur the previous focus element //
                if (this.currentFocus) {
                    this.elementBlur(this.currentFocus);
                }

                this.elementFocus(element);
                this.currentFocus = element;
            }
        },

        backgroundClick : function () {
            if (this.currentFocus) {
                this.elementBlur(this.currentFocus);
                this.currentFocus = void 0;
            }
        },

        /**
               * Post-drawing interaction
               */

        elementFocus : function (element) {
            element.trigger("focus");

        },

        elementBlur : function (element) {
            element.trigger("blur");  
        },

		/**
		 * Drawing
		 */
		
		drawStart : function (x, y) {
			if (this.currentDraw) {
				this.drawStop();
			}

            // Ignore drawStart event if there is no tool selected //
            if (!this.currentSelector) {
                return;
            }

			this.currentDraw = this.currentSelector.createObject(this.drawZone, this.controller);
			this.currentDraw.startPoint({ x : x, y : y });
			this.currentDraw.endPoint({ x : x, y : y });
			this.currentDraw.preview();
			this.trigger("componentDrawStart", this.currentDraw);
		},
		
		drawUpdate : function (x, y) {
			this.currentDraw.endPoint({ x : x, y : y });
			this.currentDraw.preview();
		},
		
		drawStop : function () {
			// Only stop if something was being draw //
			if (this.currentDraw) {
				this.currentDraw.draw();
				
				// Callback to the controller //
				this.trigger("componentDrawEnd", this.currentDraw);
				
				// Register the new elements //
				this.addElement(this.currentDraw);
				
				// Reset the currentTool //
				this.currentDraw = undefined;
				this.setCurrentSelector();
			}
		},
		
		drawComponent : function (component, override) {
			var comp = new GenericComponent();
			
			override = (typeof override === "undefined") ? true : override;
			comp = comp.unserialize(this.drawZone, component);

            for (var i=0; i<this.elements.length; i++) {
                if (this.elements[i].GUID() === comp.GUID()) {

                    if (override) {
                        // If the component exist we update instead of add //
                        this.updateComponent(component);
                        return;
                        
                    } else {
                        // If the override flag is off, we don't add the component if it is already there //
                        comp.destroy();
                        return;
                    }
                }
            }
			
			comp.draw();
			this.addElement(comp);
		},

        updateComponent : function (component) {
            var comp = new GenericComponent();
            var found = false;
            
            comp = comp.unserialize(this.drawZone, component);

            // Find the element to update //
            for (var i=0; i<this.elements.length; i++) {
                if (this.elements[i].GUID() === comp.GUID()) {
                    this.elements[i].update(comp);
                    found = true;
                    break;
                }
            }

            if (!found) {
                Logger.trace("Unable to update component " + comp.GUID());
            }

            comp.destroy();
        },
		
		/**
		 * Toolbar
		 */
		
		// List of the components in the toolbar //
		toolbarComponents : [],
		
		// Add a component in the toolbar //
		addToolbarComponent : function (component) {
			var self = this;
			
			// If the view isn't initialize yet //
			if ($("#iconsBox ul").length == 0) {
				self.render();
				$(self.el).hide();
			}
			
			// Adding the icon in the toobar //
			var scrollPane = $("#iconsBox ul")[0];
			var li  = document.createElement("li");
			var img = document.createElement("img");
			
			img.src = component.image;
			li.appendChild(img);
			scrollPane.appendChild(li);
			
			// Registering events //
			$(li).click(function () {
				self.setCurrentSelector(component);
			});
			
			// Registering the component //
			this.toolbarComponents.push(component);
		},
		
		// Returns the index of the component //
		findToolbarComponent : function (component) {
			for (var i=0; i<this.toolbarComponents.length; i++) {
				if (this.toolbarComponents[i] == component)
					return i;
			}
			
			Logger.trace("Error : Component couldn't be found in the toolbar.");
		},
		
		// Define the current selected tool //
		setCurrentSelector : function (component) {
			// Restore the opacity of the previous element //
			if (this.currentSelector) {
				var compIndex = this.findToolbarComponent(this.currentSelector);
				var li = $("#iconsBox li").get(compIndex);
				
				$(li).css({ opacity : 1 });
			}
			
			// Set the opacity of the current selection //
			if (component) {
				var compIndex = this.findToolbarComponent(component);
				var li = $("#iconsBox li").get(compIndex);
				
				$(li).css({ opacity : 0.75 });
			}
			
			this.currentSelector = component;
		},
		
		hide : function (callback) {
			callback = callback || function () {};
			
			$(this.el).hide(0, callback);
		}
	});
})();