/**
 * @author patricepaquette
 */

LINE = {};
 PICTIN.tool_line = new function(surface, surface_node){
 	//this.surface = PICTIN.surface;
	//this.surface_node = PICTIN.surface_node;
 	this.line_array = new Array();
	this.moveable_handle_array = new Array();
	this.event_handle_array = new Array();
	this.mouseup_EventHandle = null;
	this.temp_segment = null;
	this.max_x = null;
	this.max_y = null;
	LINE.allw_save = false;
	var me = this;
	
	this.activate = function(){
		//this.handle_array.push(dojo.connect(this.surface_node, "onmouseup", this.line_mouseupHandler));
		jQuery(document).mouseup(this.line_mouseupHandler);
		jQuery(document).mousemove(this.line_mousemoveHandler);
		
		return this;
	}
	
	this.stop = function(){
		//dojo.forEach(this.handle_array, dojo.disconnect);
		jQuery(document).unbind("mouseup", this.line_mouseupHandler);
		jQuery(document).unbind("mousemove", this.line_mousemoveHandler);
	}
	
	//event handlers
	this.line_mousemoveHandler = function(e){
		e.preventDefault();
		if (PICTIN.mousedown && PICTIN.surface && PICTIN.coord_within_surface(PICTIN.mousedownx, PICTIN.mousedowny)) {
			var _coords = PICTIN.get_cursor_coords(PICTIN.surface_id, e);
			var _mdownX = PICTIN.mousedownx;
			var _mdownY = PICTIN.mousedowny;
				
			if (me.temp_line == null) {
				me.temp_line = new Line(PICTIN.surface.createLine({
																	x1: _mdownX,
																	y1: _mdownY,
																	x2: _coords.x,
																	y2: _coords.y
																	}).setStroke({
																					color: "#"+PICTIN.current_color, 
																					width: PICTIN.current_linethickness
																					})
				);
			}
			
			TOOLS_FUNCTIONS.draw_temp_line({x1: _mdownX, y1: _mdownY, x2: _coords.x, y2: _coords.y}, me.temp_line);
		}
	}

	
	this.line_mouseupHandler = function(e){
		if (PICTIN.coord_within_surface(PICTIN.mousedownx, PICTIN.mousedowny)) {
			if (me.temp_line != null) {
				dojo.disconnect(me.mousemove_EventHandle);
				//me.line_array.push(me.temp_line);

				PICTIN.shape_manager.add_shape(me.temp_line);
				line_add_jQuery_properties(me.temp_line);
				me.temp_line = null;
				
				PICTIN.rollback_manager.recordState();
			}
		}
	}

	//custom mover for lines
	dojo.declare("line_mover", dojox.gfx.Mover, {
		onMouseMove: function(event){
			
			if(dijit.byId("select").attr("checked") == true){
				// move the rectangle by applying a translation
				var x = event.clientX;
	            var y = event.clientY;
				var shape_line = jQuery(this.shape.getNode()).data("shape_obj");
				
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
				
			
				var vector = {};
				
				//getting the zoom level applied to the shape
				var temp_transform = shape_line.getTransform();
				var zoom_inverse = 1;
				if(temp_transform != null){
					zoom_inverse = dojox.gfx.matrix.invert({xx: temp_transform.xx}).xx;
				}
				
				//apply translation to anchors
				var _anchor_array = jQuery(this.shape.getNode()).data("anchors");
				if(_anchor_array){
					var counter = 1;
					jQuery.each(_anchor_array, function(index, value){
						var shape_obj = jQuery(value.shape.getNode()).data("shape_obj");
						
						var anchor_acc_x = jQuery(value.shape.getNode()).data("dx_accumulator");
						var anchor_acc_y = jQuery(value.shape.getNode()).data("dy_accumulator");
						if(anchor_acc_x == null || typeof anchor_acc_x == 'undefined') anchor_acc_x = 0;
						if(anchor_acc_y == null || typeof anchor_acc_y == 'undefined') anchor_acc_y = 0;
						
						value.applyLeftTransform(new_transform);
						
						var real_anchor_coords = dojox.gfx.matrix.multiplyPoint(value.shape.getTransform(), {x: value.shape.getShape().cx, y: value.shape.getShape().cy});
						//vector["x" + counter] = value.shape.getShape().cx + anchor_acc_x;
						//vector["y" + counter] = value.shape.getShape().cy + anchor_acc_y;
						vector["x" + counter] = real_anchor_coords.x;
						vector["y" + counter] = real_anchor_coords.y;
						counter++;
					})
					
					//DEBUG_PAT.output_obj(vector, "vector", true);

					TOOLS_FUNCTIONS.draw_temp_line(vector, shape_line);

				}
				
				LINE.allow_save = true;
			}
			dojo.stopEvent(event);
		}
	})
 }
 
 //misc function
TOOLS_FUNCTIONS.draw_temp_line = function(invis_segment_shape, temp_line){
	var _invis_segment_coords = invis_segment_shape;
	var inverse_transform = null;
	
	////console.log("invis_segment_shape x1 : " + invis_segment_shape.x1);
	////console.log("invis_segment_shape y1 : " + invis_segment_shape.y1);
	////console.log("invis_segment_shape x2 : " + invis_segment_shape.x2);
	////console.log("invis_segment_shape y2 : " + invis_segment_shape.y2);
	
	/*if (temp_line.getTransform() != null) {
		var temp_coords = dojox.gfx.matrix.multiplyPoint(temp_line.getTransform(), _invis_segment_coords.x1, _invis_segment_coords.y1);
		_invis_segment_coords.x1 = temp_coords.x;
		_invis_segment_coords.y1 = temp_coords.y;
		temp_coords = dojox.gfx.matrix.multiplyPoint(temp_line.getTransform(), _invis_segment_coords.x2, _invis_segment_coords.y2);
		_invis_segment_coords.x2 = temp_coords.x;
		_invis_segment_coords.y2 = temp_coords.y;
		
		inverse_transform = dojox.gfx.matrix.invert(temp_line.getTransform());
		
		//DEBUG_PAT.output_obj(_invis_segment_coords, "invis segment coords", true);
	}*/
	var _surface = PICTIN.surface;
	var _surface_width = _surface.getDimensions().width;
	var _surface_height = _surface.getDimensions().height;
	
	//find the slope
	var _numerator = _invis_segment_coords.y2 - _invis_segment_coords.y1
	var _denominator = _invis_segment_coords.x2 - _invis_segment_coords.x1
	var _segment_slope = (_denominator != 0)? _numerator/_denominator : null;
	
	//find the constant
	var _constant = (_segment_slope != null)?_invis_segment_coords.y1-(_segment_slope * _invis_segment_coords.x1): null;
	
	var _coord1 = {x: 0, y:0};
	var _coord2 = {x: 0, y:0};
	
	
	if(_segment_slope == null){
		_coord1.y = _surface_height;
		_coord1.x = _invis_segment_coords.x1;
		_coord2.y = 0;
		_coord2.x = _invis_segment_coords.x1;
	}
	else if(_segment_slope != 0) { 
		_coord1.y = _surface_height;
		_coord1.x = (_coord1.y - _constant)/_segment_slope;
		
		if(_coord1.x > _surface_width){
			_coord1.x = _surface_width;
			_coord1.y = (_segment_slope*_coord1.x)+_constant;
		}
		else if(_coord1.x < 0){
			_coord1.x = 0;
			_coord1.y = (_segment_slope*_coord1.x)+_constant;
		}
		
		_coord2.y = 0;
		_coord2.x = (_coord2.y - _constant)/_segment_slope;
		
		if(_coord2.x < 0){
			_coord2.x = 0;
			_coord2.y = (_segment_slope*_coord2.x)+_constant;
		}
		else if(_coord2.x > _surface_width){
			_coord2.x = _surface_width;
			_coord2.y = (_segment_slope*_coord2.x)+_constant;
		}
	}
	else if(_segment_slope == 0){
		_coord1.y = _constant;
		_coord1.x = _surface_width;
		_coord2.y = _constant;
		_coord2.x = 0;
	}
	
	if (inverse_transform != null) {
		_coord1 = dojox.gfx.matrix.multiplyPoint(inverse_transform, _coord1);
		_coord2 = dojox.gfx.matrix.multiplyPoint(inverse_transform, _coord2);
	}
	////console.log("coord1.x : " + _coord1.x);
	////console.log("coord1.y : " + _coord1.y);
	////console.log("coord2.x : " + _coord2.x);
	////console.log("coord2.y : " + _coord2.y);
	
	temp_line.shape.setShape({x1: _coord1.x, y1: _coord1.y, x2: _coord2.x, y2: _coord2.y});
}
 
 function Line(shape){
	this.shape = shape;
	this.color = PICTIN.current_color;
	this.line_width = PICTIN.current_linethickness;
	this.isCustom = true;
	
	this.child_anchors = new Array();
	
	this.get_dojo_shape = function(){
		return this.shape;
	}
	
	this.removeShape = function(){
		this.shape.removeShape();
	}
	
	this.getShape = function(){
        return this.shape.getShape();
	}
	
	this.setShape = function(shape){
		return this.shape.setShape(shape);
	}
	
	this.getStroke = function(){
		return this.shape.getStroke();
	}
	
	this.setStroke = function(stroke){
		return this.shape.setStroke(stroke);
	}
	
	this.getNode = function(){
		return this.shape.getNode();
	}
    
    this.connect = function(event, parent_obj, callback){
        return this.shape.connect(event, parent_obj, callback);
    }
    
    this.applyLeftTransform = function(matrix){
        this.shape.applyLeftTransform(matrix);
        return this;
    }
	
	this.applyRightTransform = function(matrix){
		this.shape.applyRightTransform(matrix);
		return this;
	}
	
	this.getTransform = function(){
		return this.shape.getTransform();
	}
	
	this.setTransform = function(transform){
		return this.shape.setTransform(transform);
	}
	
	this.moveToFront = function(){
		return this.shape.moveToFront();
	}
	
	this.getY = function(x){
		var calc_vars = this.get_calculated_vars();
		
		if(calc_vars.slope != null){
			return (calc_vars.slope*x)+calc_vars.constant;
		}
		else if(calc_vars.slope == null){
			return null;
		}
		else{
			return "slope_0";
		}	
	}
	
	this.getX = function(y){
		var calc_vars = this.get_calculated_vars();
		
		if(calc_vars.slope != null){
			if(calc_vars.slope == 0){
				return null;
			}
			return (y - calc_vars.constant)/calc_vars.slope;
		}
		else if(calc_vars.slope == null){
			return this.shape.getShape.x1;
		}
		else{
			return "slope_0";
		}	
	}
	
	this.get_calculated_vars = function(){
		//find the slope
		var _numerator = this.shape.getShape().y2 - this.shape.getShape().y1
		var _denominator = this.shape.getShape().x2 - this.shape.getShape().x1
		var _segment_slope = (_denominator != 0)? _numerator/_denominator : null;
		
		//find the constant
		var _constant = (_segment_slope != null)?this.shape.getShape().y1-(_segment_slope * this.shape.getShape().x1): 0;
		
		return {slope : _segment_slope, constant: _constant};
	}
 }
 
 function line_anchor(parent, posX, posY, point_number){
 	this.array_index = -1;
 	this.parent_shape = parent;
	this.point_number = point_number;
	this.posX = posX;
	this.posY = posY;
	this.shape = PICTIN.surface.createCircle({cx: this.posX, cy: this.posY, r: PICTIN.anchor_radius}).setFill(get_inverse_color(this.parent_shape.shape.getStroke().color.toHex())).setStroke({color: this.parent_shape.shape.getStroke().color.toHex()});
	jQuery(this.shape.getNode()).data("dx_accumulator", 0);
	jQuery(this.shape.getNode()).data("dy_accumulator", 0);
	jQuery(this.shape.getNode()).data("shape_obj", this.shape);
	var me = this;
	

	this.shape.applyLeftTransform(this.parent_shape.getTransform());
	
	this.applyLeftTransform = function(transform){
		this.shape.applyLeftTransform(transform);
	}
	
	this.apply_transform_forever = function(){
		var shape_def = this.shape.getShape();
		var transform = this.shape.getTransform();
		if(transform == null) transform = {dx: 0, dy:0};
		var transform_inverse = dojox.gfx.matrix.invert({dx: transform.dx, dy: transform.dy});
		var new_coords = {
			x: shape_def.cx + transform.dx,
			y: shape_def.cy + transform.dy
		};//dojox.gfx.matrix.multiplyPoint(transform, shape_def.cx, shape_def.cy);
		this.shape.setShape({cx: new_coords.x, cy: new_coords.y});
		//DEBUG_PAT.output_obj(transform, "transform");
		//DEBUG_PAT.output_obj(transform_inverse, "transform_inverse");
		this.shape.applyRightTransform(transform_inverse);
	}
	
	this.update_position = function(){
		/*var shape_def = this.shape.getShape();
		var transform = this.shape.getTransform();
		var transform_inverse = dojox.gfx.matrix.invert({dx: transform.dx, dy: transform.dy});
		var new_coords = {
			x: shape_def.cx + transform.dx,
			y: shape_def.cy + transform.dy
		};//dojox.gfx.matrix.multiplyPoint(transform, shape_def.cx, shape_def.cy);
		this.shape.setShape({cx: new_coords.x, cy: new_coords.y});
		this.shape.applyLeftTransform(transform_inverse);*/
		
		var parent_shape_def = this.parent_shape.getShape();
		var line_length = get_segment_length(parent_shape_def.x1, parent_shape_def.y1, parent_shape_def.x2, parent_shape_def.y2);
		var delta_x = parent_shape_def.x2 - parent_shape_def.x1;
		var delta_y = parent_shape_def.y2 - parent_shape_def.y1;
		var coords1 = {x: parent_shape_def.x1 + delta_x/3, y: parent_shape_def.y1 + delta_y/3};
		var coords2 = {x: parent_shape_def.x1 + delta_x*2/3, y: parent_shape_def.y1 + delta_y*2/3};
		
		var parent_shape_transform = this.parent_shape.getTransform();
		if (this.point_number == 1) {
			//var pos_x = jQuery(this.shape.getNode()).data("pos_x");
			if(typeof pos_x != 'undefined'){
				coords1.x = pos_x;
				coords1.y = this.parent_shape.getY(pos_x);
			}
			this.shape.setShape({
				cx: coords1.x,
				cy: coords1.y
			})
		}
		else if (this.point_number == 2){
			var pos_x = jQuery(this.shape.getNode()).data("pos_x");
			if(typeof pos_x != 'undefined'){
				var pos_y = this.parent_shape.getY(pos_x);
				coords2.x = pos_x;
				coords2.y = this.parent_shape.getY(pos_x);
			}
			this.shape.setShape({
				cx: coords2.x,
				cy: coords2.y
			})
		}
		DEBUG_PAT.output_obj(coords1, "coords1");
		DEBUG_PAT.output_obj(coords2, "coords2");
		this.shape.setTransform(null);
		this.shape.applyLeftTransform(parent_shape_transform);
		
	}
	
	this.translating_transform_to_pos = function(){
		var shape = this.shape.getShape();
		var transform = this.shape.getTransform();
		
		if (transform != null) {
			this.shape.setShape({
				cx: shape.cx + transform.dx,
				cy: shape.cy + transform.dy
			});
			transform.dx = 0;
			transform.dy = 0;
			this.shape.setTransform(transform);
		}
	}
	
	dojo.declare("line_anchor_mover", dojox.gfx.Mover, {
		onMouseMove: function(event){
			if(dijit.byId("select").attr("checked") == true){
				// move the rectangle by applying a translation
				var x = event.clientX;
	            var y = event.clientY;
				
				//getting the zoom level applied to the shape
				var temp_transform = this.shape.getTransform();
				var zoom_inverse_transform = {xx: 1, yy: 1};
				if(temp_transform != null){
					zoom_inverse_transform = dojox.gfx.matrix.invert({
						xx: temp_transform.xx,
						yy: temp_transform.yy
					});
				}
				
				var coords = PICTIN.get_cursor_coords(PICTIN.surface_id, event);
				
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
				if(typeof line_anchor_mover.anchor_buffer == "undefined") line_anchor_mover.anchor_buffer = me;
	
				line_anchor_mover.anchor_buffer = me;

				var dx_accumulator = jQuery(this.shape.getNode()).data("dx_accumulator");
				var dy_accumulator = jQuery(this.shape.getNode()).data("dy_accumulator");
				if(typeof dx_accumulator == 'undefined') dx_accumulator = 0;
				if(typeof dy_accumulator == 'undefined') dy_accumulator = 0;
				dx_accumulator += new_transform.dx*zoom_inverse_transform.xx;
				dy_accumulator += new_transform.dy*zoom_inverse_transform.yy;
				jQuery(this.shape.getNode()).data("dx_accumulator", dx_accumulator);
				jQuery(this.shape.getNode()).data("dy_accumulator", dy_accumulator);
				
				////console.log("dx_acc : " + dx_accumulator, true);
				////console.log("dy_acc : " + dy_accumulator, true);
				////console.log("zoom level : " + PICTIN.zoom_level, true);
				
				var parent_transform = me.parent_shape.getTransform();
				
				if(parent_transform == null) parent_transform = {dx: 0, dy: 0};
				
				var new_coords_transform = this.shape.getTransform();
				var modified_transform = {dx: new_coords_transform.dx, dy: new_coords_transform.dy, xx: 1, yy: 1, xy: new_coords_transform.xy, yx: new_coords_transform.yx};
				
				var new_coords = dojox.gfx.matrix.multiplyPoint(modified_transform, this.shape.getShape().cx, this.shape.getShape().cy);
				//var new_coords = dojox.gfx.matrix.multiplyPoint(new_coords_transform, this.shape.getShape().cx, this.shape.getShape().cy);
				
				var new_x = this.shape.getShape().cx + dx_accumulator;
				var new_y = this.shape.getShape().cy + dy_accumulator;
				
				var anchor_x;
				var anchor_y;
				var anchor;
				var _anchor_array = jQuery(me.parent_shape.getNode()).data("anchors");
				var inverse_matrix = dojox.gfx.matrix.invert(me.parent_shape.getTransform());

				if(me.point_number == 1){
					var transform = _anchor_array[1].shape.getTransform();
					//if (transform != null) transform.xx = transform.yy = 1;
					
					var anchor_acc_x = jQuery(_anchor_array[1].shape.getNode()).data("dx_accumulator");
					var anchor_acc_y = jQuery(_anchor_array[1].shape.getNode()).data("dy_accumulator");
					if(anchor_acc_x == null || typeof anchor_acc_x == 'undefined') anchor_acc_x = 0;
					if(anchor_acc_y == null || typeof anchor_acc_y == 'undefined') anchor_acc_y = 0;
						
					if(transform == null){
						transform = {dx: 0, dy: 0};
					}
					
					//anchor = dojox.gfx.matrix.multiplyPoint(transform, _anchor_array[1].shape.getShape().cx, _anchor_array[1].shape.getShape().cy);
					
					anchor_x = _anchor_array[1].shape.getShape().cx + anchor_acc_x;
					anchor_y = _anchor_array[1].shape.getShape().cy + anchor_acc_y;
					//var anchor_coords = dojox.gfx.matrix.multiplyPoint(_anchor_array[1].shape.getTransform(), {x: _anchor_array[1].shape.getShape().cx, y: _anchor_array[1].shape.getShape().cy});
					
				}
				else if(me.point_number == 2){
					var transform = _anchor_array[0].shape.getTransform();
					
					var anchor_acc_x = jQuery(_anchor_array[0].shape.getNode()).data("dx_accumulator");
					var anchor_acc_y = jQuery(_anchor_array[0].shape.getNode()).data("dy_accumulator");
					if(anchor_acc_x == null || typeof anchor_acc_x == 'undefined') anchor_acc_x = 0;
					if(anchor_acc_y == null || typeof anchor_acc_y == 'undefined') anchor_acc_y = 0;
					
					if(transform == null){
						transform = {dx: 0, dy: 0};
					}

					
					anchor_x = _anchor_array[0].shape.getShape().cx + anchor_acc_x;
					anchor_y = _anchor_array[0].shape.getShape().cy + anchor_acc_y;
				}
				
				var vector = {x1: new_x, y1: new_y, x2: anchor_x, y2: anchor_y};
				//var vector = {x1: new_coords.x, y1: new_coords.y, x2: anchor_x, y2: anchor_y};
				
				TOOLS_FUNCTIONS.draw_temp_line(vector, me.parent_shape);
				
				
			}
			dojo.stopEvent(event);
		}
	})
	
	//event handler
	this.mousedownHandler = function(e){

	}
	
	this.mouseupHandler = function(e){
		PICTIN.rollback_manager.recordState();
	}
	
	////console.log("line anchor moveable added");	
	new dojox.gfx.Moveable(this.shape, {mover: line_anchor_mover});
	this.shape.connect("mousedown", this.mousedownHandler);
	this.shape.connect("mouseup", this.mouseupHandler);
 }

 function line_add_jQuery_properties(shape){
	if(DEBUG_PAT.debug_enabled)
		DEBUG_PAT.output("adding line jquery properties");
	
	var shape_node = shape.getNode();
	
	//add events
	var handler_array = new Array();
	//adds references to event handlers. [eventType, handler, params]
	handler_array.push(["mousedown", line_mousedownHandler, {}]);
	handler_array.push(["mouseup", line_mouseupHandler, {}]);
	//handler_array.push(["custom_function", make_shape_draggable]);
	handler_array.push(["moveable_event", line_mover]);
	jQuery(shape_node).data("pictin_events", handler_array);
	
	//add some properties
	jQuery(shape_node).data("isSelected", false);
	jQuery(shape_node).data("custom_shape_class", "line");
	
	if(DEBUG_PAT.debug_enabled)
		DEBUG_PAT.output("added line jquery properties");
}

function line_mousedownHandler(e){
	if (dijit.byId("select").attr("checked") == true) {
		if(DEBUG_PAT.debug_enabled)
			DEBUG_PAT.output("line selected");
			
		var shape_obj = jQuery(this).data("shape_obj");
		
		PICTIN.shape_manager.select_shape(this, add_line_anchors, {shape: shape_obj});
	}
}

function line_mouseupHandler(e){
	if (LINE.allow_save) {
		PICTIN.rollback_manager.recordState();
		LINE.allow_save = false;
	}
}

function add_line_anchors(params){
	if(DEBUG_PAT.debug_enabled)
			DEBUG_PAT.output("adding line anchors");
	
	var shape_def = params.shape.getShape();
	var line_length = get_segment_length(shape_def.x1, shape_def.y1, shape_def.x2, shape_def.y2);
	var delta_x = shape_def.x2 - shape_def.x1;
	var delta_y = shape_def.y2 - shape_def.y1;
	var coords1 = {x: shape_def.x1 + delta_x/3, y: shape_def.y1 + delta_y/3};
	var coords2 = {x: shape_def.x1 + delta_x*2/3, y: shape_def.y1 + delta_y*2/3};
	
	var _anchor_array = new Array();
	_anchor_array.push(new line_anchor(params.shape, coords1.x, coords1.y, 1));
	_anchor_array.push(new line_anchor(params.shape, coords2.x, coords2.y, 2));
	
	jQuery(params.shape.getNode()).data("anchors", _anchor_array);
}

