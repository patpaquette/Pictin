/**
 * @author patricepaquette
 */

DOT = {};
PICTIN.tool_dot = new function(surface, surface_node){
 	this.surface = PICTIN.surface;
	this.surface_node = PICTIN.surface_node;
 	this.dot_array = new Array();
	this.event_handle_array = new Array();
	this.moveable_handle_array = new Array();
	this.max_x = null;
	this.max_y = null;
	this.dot_color_buffer = null;
	this.dot_width_buffer = null;
	var me = this;
	DOT.allow_save = false;
	
	this.activate = function(){
		//this.handle_array.push(dojo.connect(this.surface_node, "onclick", this.dot_mouseclickHandler));
		jQuery(document).click(this.dot_mouseclickHandler);
		
		return this;
	}
	
	this.stop = function(){
		//dojo.forEach(this.handle_array, dojo.disconnect);
		jQuery(document).unbind("click", this.dot_mouseclickHandler);
	}
	
	this.unselect = function(shape){
		//nothing to do here.
	}
	
	this.make_selectable = function(){
		//if (this.moveable_handle_array.length == 0 && this.event_handle_array.length == 0) {
			//for (var i in this.dot_array) {
				//this.dot_array[i].setFill([0, 0, 0, 0]);
				//this.event_handle_array.push(this.dot_array[i].connect("onmousedown", this.dot_array[i], this.dot_selectionHandler));
				//this.event_handle_array.push(this.dot_array[i].connect("onmouseover", this.dot_array[i], this.dot_mouseoverHandler));
				//this.event_handle_array.push(this.dot_array[i].connect("onmouseout", this.dot_array[i], this.dot_mouseoutHandler));
				//this.moveable_handle_array.push(new dojox.gfx.Moveable(this.dot_array[i], {mover: dot_mover}));
			//}
		//}
	}
	
	this.make_unselectable = function(){
		/*for(var i in this.dot_array){
			this.dot_array[i].setFill(null);
		}
		for(var i in this.moveable_handle_array){
			this.moveable_handle_array[i].destroy();
		}
		dojo.forEach(this.event_handle_array, dojo.disconnect);
		this.moveable_handle_array = new Array();
		this.event_handle_array = new Array();*/
	}
	
	//event handlers
	this.dot_mouseclickHandler = function(e){
		var _x = PICTIN.mousedownx;
		var _y = PICTIN.mousedowny;
		
		if(PICTIN.coord_within_surface(_x, _y)){
			var dot = PICTIN.surface.createCircle({cx: _x, cy: _y, r: 1}).setStroke({color: "#"+PICTIN.current_color, width: PICTIN.current_linethickness, 'shape-rendering': 'crispEdges'}).setFill("#"+PICTIN.current_color);
			//dot.connect("onclick", dot, function(e){
				//e.preventDefault();
			//});
			me.dot_array.push(dot);
			dot_add_jQuery_properties(dot);
			PICTIN.shape_manager.add_shape(dot);
			PICTIN.rollback_manager.recordState();
			var position = {x: _x, y: _y};
			jQuery(document).trigger("DOT.drawn", [position, dot]);
		}
		
	}
	
	 
	this.dot_mouseoverHandler = function(e){
		e.preventDefault();
		this.dot_color_buffer = this.getStroke().color;
		this.dot_width_buffer = this.getStroke().width;
		this.setStroke({color: "#"+PICTIN.tool_hover_color, width: this.dot_width_buffer + 1});
	}
	
	this.dot_mouseoutHandler = function(e){
		e.preventDefault();
		
		if (this.dot_color_buffer != null && this.dot_width_buffer != null) {

			this.setStroke({
				color: this.dot_color_buffer,
				width: this.dot_width_buffer
			});
			
			this.dot_color_buffer = null;
			this.dot_width_buffer = null;
		}
		
		
	}
	//custom mover for lines
	dojo.declare("dot_mover", dojox.gfx.Mover, {
		onMouseMove: function(event){
			
			if(dijit.byId("select").attr("checked") == true){
				// move the rectangle by applying a translation
				var x = event.clientX;
	            var y = event.clientY;
				
				var transform = this.shape.getTransform();
				
				if(transform == null){
					transform = {dx: 0, dy: 0};
				}
				
				
				me._transform_buffer = transform;
				
				var new_transform = {
					dx: x-this.lastX,
					dy: y-this.lastY
				}
				
	            this.shape.applyLeftTransform(new_transform);
	            // store the last position of the rectangle
				
	            this.lastX = x;
	            this.lastY = y;
				
			}
			
			DOT.allow_save = true;
			
			dojo.stopEvent(event);
		}
	})
 }
 
 
 function dot_add_jQuery_properties(shape){
	if(DEBUG_PAT.debug_enabled)
		DEBUG_PAT.output("adding dot jquery properties");
	
	var shape_node = shape.getNode();
	
	jQuery(shape.getNode()).data("shape_obj", shape);
	
	//add events
	var handler_array = new Array();
	handler_array.push(["moveable_event", dot_mover]);
	handler_array.push(["mouseup", dot_mouseupHandler, {}]);
	handler_array.push(["mousedown", dot_mousedownHandler, {}]);
	jQuery(shape_node).data("pictin_events", handler_array);
	
	//add some properties
	jQuery(shape_node).data("isSelected", false);
	
	if(DEBUG_PAT.debug_enabled)
		DEBUG_PAT.output("added dot jquery properties");
}

function dot_mouseupHandler(e){
	if (DOT.allow_save) {
		PICTIN.rollback_manager.recordState();
		DOT.allow_save = false;
	}
}

function dot_mousedownHandler(e){
	
	PICTIN.shape_manager.select_shape(this);
}
