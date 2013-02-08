/**
 * @author patricepaquette
 */
SEGMENT = {};
PICTIN.tool_segment = new function(surface, surface_node){
 	//this.surface = PICTIN.surface;
	//this.surface_node = PICTIN.surface_node;
 	this.segment_array = new Array();
	this.moveable_handle_array = new Array();
	this.event_handle_array = new Array();
	this.temp_segment = null;
	this.segment_buffer = null;
	this.max_x = null;
	this.max_y = null;
	this.put_arrowhead = false;
	this._isActivated = false;
	this.name = "segment";
	SEGMENT.allow_save = false;
	SEGMENT.record_state = true;
	
	var me = this;
	
	this.activate = function(method){
		DEBUG_PAT.output("segment activated", true);

		if (method == null) {
			jQuery(document).bind("mousemove.segment", this.line_tool_mousemoveHandler);
			jQuery(document).bind("mouseup.segment", this.line_tool_mouseupHandler);
		}
		else if(method == "2points"){
			jQuery(document).bind("click.segment", this.segment_tool_click_handler);
			SEGMENT.measure_step = 0;
			SEGMENT.points_array = new Array();
		}

		this._isActivated = true;
		
		return this;
	}
	
	this.stop = function(){
		//dojo.forEach(this.handle_array, dojo.disconnect);
		SEGMENT.record_state = true;
		jQuery(document).unbind(".segment");
		this.put_arrowhead = false;
		this._isActivated = false;
	}
	
	//event handlers
	this.segment_tool_click_handler = function(e){
		DEBUG_PAT.output("Measure_step : " + SEGMENT.measure_step, true);
		var _x = PICTIN.mousedownx;
		var _y = PICTIN.mousedowny;
		if(SEGMENT.measure_step == 0 && PICTIN.coord_within_surface(PICTIN.mousedownx, PICTIN.mousedowny)){
			DEBUG_PAT.output("in segment_tool_click_handler", true);
			
			var point = PICTIN.surface.createCircle({
				cx: _x,
				cy: _y,
				r: 1
			}).setStroke({
				color: "#" + PICTIN.current_color,
				width: 3
			});
			PICTIN.shape_manager.add_shape(point);
			SEGMENT.points_array.push(point)
			SEGMENT.measure_step = 1;
		}
		else if(SEGMENT.measure_step == 1){

			if (PICTIN.coord_within_surface(PICTIN.mousedownx, PICTIN.mousedowny) && SEGMENT.points_array != null) {
				SEGMENT.points_array.push(PICTIN.surface.createCircle({
					cx: _x,
					cy: _y,
					r: 1
				}).setStroke({
					color: "#" + PICTIN.current_color,
					width: 3
				}))
			
				var temp_segment = DRAWLIB.draw_segment({
					x: SEGMENT.points_array[0].getShape().cx,
					y: SEGMENT.points_array[0].getShape().cy
				}, {
					x: SEGMENT.points_array[1].getShape().cx,
					y: SEGMENT.points_array[1].getShape().cy
				}, PICTIN.current_color, PICTIN.current_linethickness);
				
				me.segment_array.push(temp_segment);
				
				SEGMENT.points_array[0].removeShape();
				SEGMENT.points_array[1].removeShape();
				SEGMENT.points_array = new Array();

				//initialize the shape properties
				if (SEGMENT.record_state) {
					DEBUG_PAT.output("adding temp_segment", true);
					segment_add_jQuery_properties(temp_segment);
					PICTIN.shape_manager.add_shape(temp_segment);
				}
				
				
				jQuery(document).trigger("segment_drawn", [temp_segment]);
				
				if (SEGMENT.record_state) {
					PICTIN.rollback_manager.recordState();
				}
				
			}
			
			SEGMENT.measure_step = 0;
		}
		
	}
	this.line_tool_mousemoveHandler = function(e){
		e.preventDefault();
		var _coords = PICTIN.get_cursor_coords(PICTIN.surface_id, e);
		if (me.checkIfCanDraw.check(_coords)) {
			
			var _posX = PICTIN.mousedownx;
			var _posY = PICTIN.mousedowny;
			
			if(me.checkIfCanDraw.onMouseUp){
				_posX = PICTIN.mouseupx;
				_posY = PICTIN.mouseupy;
			}
			if (me.temp_segment == null) {
				me.temp_segment = DRAWLIB.draw_segment({
					x: _posX,
					y: _posY
				}, {
					x: _coords.x,
					y: _coords.y
				}, PICTIN.current_color, PICTIN.current_linethickness);
				
				jQuery(me.temp_segment.getNode()).data("child_shapes", {});
			}
			else {
				me.temp_segment.setShape({
					x2: _coords.x,
					y2: _coords.y
				});
			}
			
			//add arrowhead if needed
			if(me.put_arrowhead){
				var child_shapes = jQuery(me.temp_segment.getNode()).data("child_shapes");
				if (typeof child_shapes['arrowhead'] != 'undefined') {
					arrowhead.update_pos();
				}
				else {
					jQuery(me.temp_segment.getNode()).data("custom_shape_class", "arrow");
					arrowhead = new Segment_arrowhead(me.temp_segment, 15, 10);
					
				}
			}
		}
	}
	
	this.line_tool_mouseupHandler = function(e){
		var _coords = PICTIN.get_cursor_coords(PICTIN.surface_id, e);
		if (PICTIN.coord_within_surface(_coords.x, _coords.y) && me.temp_segment != null) {
			dojo.disconnect(me.mousemove_EventHandle);
			me.segment_array.push(me.temp_segment);
			
			
			//initialize the shape properties
			//if (SEGMENT.record_state) {
				
				segment_add_jQuery_properties(me.temp_segment);
			//}
			
			if(SEGMENT.record_state){
				PICTIN.shape_manager.add_shape(me.temp_segment);
			}
			
			PICTIN.tool_segment.checkIfCanDraw.reset();
			jQuery(document).trigger("segment_drawn", [me.temp_segment]);
			
			me.temp_segment = null;
			if (SEGMENT.record_state) {
				PICTIN.rollback_manager.recordState();
			}
			
		}
		else if(PICTIN.coord_within_working_area(_coords.x, _coords.y)){
			if(me.temp_segment != null){
				PICTIN.tool_segment.checkIfCanDraw.onMouseUp = true;
			}
		}
	}
	
	
	
	//custom mover for lines
	dojo.declare("segment_mover", dojox.gfx.Mover, {
		onMouseMove: function(event){
			
			if(dijit.byId("select").attr("checked") == true){
				// move the rectangle by applying a translation
				var x = event.clientX;
	            var y = event.clientY;
				var _anchor_array = jQuery(this.shape.getNode()).data("anchors");
				
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
				
				//apply translation to anchors
				if(_anchor_array){
					jQuery.each(_anchor_array, function(index, value){
						value.applyLeftTransform(new_transform);
					})
				}
				
			}
			
			var child_shapes = jQuery(this.shape.getNode()).data("child_shapes");
			if(typeof child_shapes['arrowhead'] != 'undefined'){
				child_shapes['arrowhead'].update_pos();
			}
			dojo.stopEvent(event);
			
			SEGMENT.allow_save = true;
			jQuery(document).trigger("segment_move", this.shape);
		}
	})
	
	this.checkIfCanDraw = new function(){
		this.onMouseDown = true;
		this.onMouseUp = false;
		this.reset_onsegmentdrawn = false;
		this.handler = null;
		var me = this;
		
		this.check = function(coords){
			var canDraw = false;
			var coords = coords;
			
			if(this.onMouseDown){
				if(PICTIN.mousedown && PICTIN.coord_within_working_area(PICTIN.mousedownx, PICTIN.mousedowny)) canDraw = true; 
			}
			if(this.onMouseUp){
				if(!PICTIN.mousedown) canDraw = true;
				
			}
			if(this.reset_onsegmentdrawn){
				if (this.handler == null) {
					this.handler = jQuery(document).bind("segment_drawn.checkIfCanDraw", function(e){
						PICTIN.tool_segment.checkIfCanDraw.onMouseUp = false;
						jQuery(document).unbind("segment_drawn.checkIfCanDraw");
						me.handler = null;
					})
				}
				
				this.reset_onsegmentdrawn = false;
				
			}
			
			if(!PICTIN.surface) canDraw = false;
			if(!PICTIN.coord_within_working_area(coords.x, coords.y)) canDraw = false;
			
			DEBUG_PAT.output("canDraw was " + canDraw);
			return canDraw;
		}
		
		this.reset = function(){
			this.onMouseDown = true;
			this.onMouseUp = false;
			this.reset_onsegmentdrawn = false;
			this.handler = null;
		}
	}
 }

 function segment_anchor(parent, posX, posY, point_number){
 	if(DEBUG_PAT.debug_enabled)
		DEBUG_PAT.output("in segment_anchor");
		
 	this.parent_shape = parent;
	this.point_number = point_number;
	this.posX = posX;
	this.posY = posY;
	this.shape = PICTIN.surface.createCircle({cx: this.posX, cy: this.posY, r: PICTIN.anchor_radius}).setFill(get_inverse_color(this.parent_shape.getStroke().color.toHex())).setStroke({color: this.parent_shape.getStroke().color.toHex()});
	var me = this;
	
	jQuery(this.shape.getNode()).data("shape_obj", this.shape);
	
	this.shape.applyLeftTransform(this.parent_shape.getTransform());
	
	this.applyLeftTransform = function(transform){
		this.shape.applyLeftTransform(transform);
	}
	
	this.update_position = function(){
		var parent_shape_def = this.parent_shape.getShape();
		var parent_shape_transform = this.parent_shape.getTransform();
		if (this.point_number == 1) {
			this.shape.setShape({
				cx: parent_shape_def.x1,
				cy: parent_shape_def.y1
			})
		}
		else if (this.point_number == 2){
			this.shape.setShape({
				cx: parent_shape_def.x2,
				cy: parent_shape_def.y2
			})
		}
		
		this.shape.setTransform(null);
		this.shape.applyLeftTransform(parent_shape_transform);
	}
	
	dojo.declare("segment_anchor_mover", dojox.gfx.Mover, {
		onMouseMove: function(event){
			if(dijit.byId("select").attr("checked") == true){
				// move the rectangle by applying a translation
				var x = event.clientX;
	            var y = event.clientY;
				
				//getting the zoom level applied to the shape
				var temp_transform = this.shape.getTransform();
				var zoom_inverse_transform = {xx: 1, yy: 1};
				if(temp_transform != null){
					zoom_inverse_transform = dojox.gfx.matrix.invert({xx: temp_transform.xx, yy: temp_transform.yy});
				}
				
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
				
				//resize the line
				var parent_shape_def = me.parent_shape.getShape();
				if(me.point_number == 1){
					var x1 = parent_shape_def.x1 + new_transform.dx*zoom_inverse_transform.xx;
					var y1 = parent_shape_def.y1 + new_transform.dy*zoom_inverse_transform.yy;
					me.parent_shape.setShape({x1: x1, y1: y1});
					
				}
				else if(me.point_number == 2){
					var x2 = parent_shape_def.x2 + new_transform.dx*zoom_inverse_transform.xx;
					var y2 = parent_shape_def.y2 + new_transform.dy*zoom_inverse_transform.yy;
					me.parent_shape.setShape({x2: x2, y2: y2});
					
					
				}
				
				var child_shapes = jQuery(me.parent_shape.getNode()).data("child_shapes");

				if(typeof child_shapes != 'undefined' && typeof child_shapes["arrowhead"] != 'undefined'){
					child_shapes['arrowhead'].update_pos();
				}
			}

			jQuery(document).trigger("segment_anchor_move", [me.parent_shape]);
			dojo.stopEvent(event);
		}
	})
	
	this.anchor_mouseupHandler = function(e){
			PICTIN.rollback_manager.recordState();
	}
	
	this.shape.connect("mouseup", this.anchor_mouseupHandler);
	new dojox.gfx.Moveable(this.shape, {mover: segment_anchor_mover});
	
 }
 
function segment_add_jQuery_properties(shape){
	if(DEBUG_PAT.debug_enabled)
		DEBUG_PAT.output("adding segment jquery properties");
	
	var shape_node = shape.getNode();
	
	//add events
	var handler_array = new Array();
	//adds references to event handlers. [eventType, handler, params
	handler_array.push(["mousedown", segment_mousedownHandler, {}]);
	handler_array.push(["mouseup", segment_mouseupHandler, {}]);
	//handler_array.push(["custom_function", make_shape_draggable]);
	handler_array.push(["moveable_event", segment_mover]);
	jQuery(shape_node).data("pictin_events", handler_array);
	
	//add some properties
	jQuery(shape_node).data("isSelected", false);
	//jQuery(shape_node).data("child_shapes", new Array());
	
	if(DEBUG_PAT.debug_enabled)
		DEBUG_PAT.output("added segment jquery properties");
}

function segment_mousedownHandler(e){
	if (dijit.byId("select").attr("checked") == true) {
		if(DEBUG_PAT.debug_enabled)
			DEBUG_PAT.output("segment selected");
		
		var _anchor_array = new Array();
		var shape_obj = jQuery(this).data("shape_obj");
		
		PICTIN.shape_manager.select_shape(this, add_segment_anchors, {shape: shape_obj});
	}
}

function segment_mouseupHandler(e){
	if (SEGMENT.allow_save) {
		PICTIN.rollback_manager.recordState();
		SEGMENT.allow_save = false;
	}
}

function add_segment_anchors(params){
	if(DEBUG_PAT.debug_enabled)
			DEBUG_PAT.output("adding segment anchors");
			
	var shape_def = params.shape.getShape();
	var _anchor_array = new Array();
	_anchor_array.push(new segment_anchor(params.shape, shape_def.x1, shape_def.y1, 1));
	_anchor_array.push(new segment_anchor(params.shape, shape_def.x2, shape_def.y2, 2));
	
	jQuery(params.shape.getNode()).data("anchors", _anchor_array);
	
	if(DEBUG_PAT.debug_enabled)
			DEBUG_PAT.output("segment anchors added");
}

function Segment_arrowhead(parent_shape, height, base){
	this.parent_shape = parent_shape;
	this.height = height;
	this.base = base;
	this.A = {};
	this.B = {};
	this.C = {};
	this.slope = 0;
	this.angle = 0;
	this.shape = null;
	
	
	this.init = function(){
		this.A = {x: parent_shape.getShape().x2, y: parent_shape.getShape().y2};
		this.B = {x: this.A.x - height, y: this.A.y + base/2};
		this.C = {x: this.A.x - height, y: this.A.y - base/2};
		var denominator = (parent_shape.getShape().y2 - parent_shape.getShape().y1);
		var numerator = (parent_shape.getShape().x2 - parent_shape.getShape().x1);
		this.slope = (denominator != 0)?numerator/denominator:null;
		this.angle = Math.atan(this.slope);
		this.shape = PICTIN.surface.createPolyline([this.A, this.B, this.C, this.A]).setFill("#" + PICTIN.current_color).setStroke({color: "#" + PICTIN.current_color, width: PICTIN.current_line_thickness});
		jQuery(this.shape.getNode()).data("parent_shape", this.parent_shape);
		
		//PICTIN.shape_manager.add_shape(this.shape);
		(jQuery(parent_shape.getNode()).data("child_shapes") == null)?	jQuery(parent_shape.getNode()).data("child_shapes", {"arrowhead": this}):
																		jQuery(parent_shape.getNode()).data("child_shapes")["arrowhead"] = this;
		
	}

	this.update_pos = function(){
		this.A = {x: parent_shape.getShape().x2, y: parent_shape.getShape().y2};
		this.B = {x: this.A.x - height, y: this.A.y + base/2};
		this.C = {x: this.A.x - height, y: this.A.y - base/2};
		var denominator = (parent_shape.getShape().y2 - parent_shape.getShape().y1);
		var numerator = (parent_shape.getShape().x2 - parent_shape.getShape().x1);
		this.slope = (denominator != 0)?numerator/denominator:null;
		this.angle = Math.atan(this.slope);
		
		if (this.shape != null) {
			this.shape.setTransform(null);
			this.shape.setShape([this.A, this.B, this.C, this.A]);
			
			if(this.slope == null){
				if((parent_shape.getShape().x2 - parent_shape.getShape().x1) < 0){
					this.shape.applyLeftTransform(dojox.gfx.matrix.rotateAt(Math.PI, this.A));
				}
			}
			else if ((this.slope < 0 && parent_shape.getShape().y2 > parent_shape.getShape().y1) ||
			(this.slope > 0 && parent_shape.getShape().y2 > parent_shape.getShape().y1)) {
				this.shape.applyLeftTransform(dojox.gfx.matrix.rotateAt(Math.PI / 2 - this.angle, this.A));
			}
			else if(this.slope == 0){
				if((parent_shape.getShape().y2 - parent_shape.getShape().y1) > 0){
					this.shape.applyLeftTransform(dojox.gfx.matrix.rotateAt(Math.PI/2, this.A));
				}
				else{
					this.shape.applyLeftTransform(dojox.gfx.matrix.rotateAt(3*Math.PI/2, this.A));
				}
			}
			else {
				this.shape.applyLeftTransform(dojox.gfx.matrix.rotateAt(Math.PI / 2 - this.angle + Math.PI, this.A))
			}
			
			this.shape.applyLeftTransform(parent_shape.getTransform());
		}
	}
	
	this.applyLeftTransform = function(transform){
		this.shape.applyLeftTransform(transform);
	}
	
	this.removeShape = function(){
		this.shape.removeShape();
	}
	
	//constructor
	this.init();
	this.update_pos();
}

function arrowhead_mousedownHandler(e){
	var parent = jQuery(this).data("parent");
	PICTIN.shape_manager.select_shape(parent, add_segment_anchors, {shape: parent});
}
