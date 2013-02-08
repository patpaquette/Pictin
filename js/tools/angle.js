/**
 * @author patricepaquette
 */
ANGLE = {};
ANGLE.points_array = new Array();
ANGLE.obtuse = false;
function tool_angle(){
	this.angle_array = new Array();
	//ANGLE.points_array = new Array();
	this.moveable_handle_array = new Array();
	this.event_handle_array = new Array();
	this.obtuse = false;
	var me = this;
	ANGLE.allow_save = false;
	var dot_counter = 0
	
	this.activate = function(obtuse){
		//using surface based events so that the onmousedown event doesn't fire when outside the surface.
		//jQuery(document).click(this.angle_tool_mouseclickHandler);
		jQuery(document).bind("segment_drawn.angle", this.segment_drawn_handler.handle);
		
		SEGMENT.record_state = false;
		PICTIN.tool_segment.activate();
		
		this.obtuse = obtuse;
		ANGLE.obtuse = obtuse;
		return this;
	}
	
	this.stop = function(){
		jQuery(document).unbind("click", this.angle_tool_mouseclickHandler);
		jQuery(document).unbind("segment_drawn.angle");
		SEGMENT.record_state = true;
	}
	
	this.segment_drawn_handler = new function(){
		this.step = 1;
		var segment_buffer = null;
		var me = this;
		
		
		this.handle = function(e, segment){
			if (me.step == 1) {
				ANGLE.points_array.push({x: segment.getShape().x1, y: segment.getShape().y1});
				ANGLE.points_array.push({x: segment.getShape().x2, y: segment.getShape().y2});
				segment_buffer = segment;
				PICTIN.tool_segment.checkIfCanDraw.onMouseUp = true;
				PICTIN.tool_segment.checkIfCanDraw.reset_onsegmentdrawn = true;
				me.step = 2;
			}
			else if(me.step == 2){
				ANGLE.points_array.push({x: segment.getShape().x2, y: segment.getShape().y2});
				segment_buffer.removeShape();
				segment.removeShape();
				
				var angle = new Angle(
													{x: ANGLE.points_array[0].x, y: ANGLE.points_array[0].y},
													{x: ANGLE.points_array[1].x, y: ANGLE.points_array[1].y},											
													{x: ANGLE.points_array[2].x, y: ANGLE.points_array[2].y},
													ANGLE.obtuse
										  		)
				PICTIN.shape_manager.add_shape(angle);
				
				ANGLE.points_array = new Array();
				
				PICTIN.rollback_manager.recordState();
				
				me.step = 1;
			}
		}
	}
	
	this.angle_tool_mouseclickHandler = function(event){
		var _x = PICTIN.mousedownx;
		var _y = PICTIN.mousedowny;
		if (PICTIN.coord_within_surface(_x, _y)) {
			var point = new Circle_point(_x, _y, PICTIN.surface.createCircle({
				cx: _x,
				cy: _y,
				r: 1
			}).setStroke({
				color: "#" + PICTIN.current_color,
				width: 3
			}));
			
			ANGLE.points_array.push(point);
			dot_counter++;
			
			if (dot_counter % 3 == 0) {
				var temp_angle = new Angle(
												{x: ANGLE.points_array[dot_counter-3].x, y: ANGLE.points_array[dot_counter-3].y},
												{x: ANGLE.points_array[dot_counter-2].x, y: ANGLE.points_array[dot_counter-2].y},											
												{x: ANGLE.points_array[dot_counter-1].x, y: ANGLE.points_array[dot_counter-1].y},
												me.obtuse
										  );
				
				me.angle_array.push(temp_angle);
				
				ANGLE.points_array[dot_counter - 3].shape.removeShape();
				ANGLE.points_array[dot_counter - 2].shape.removeShape();
				ANGLE.points_array[dot_counter - 1].shape.removeShape();
				
				temp_angle.displayAngle();
				
				PICTIN.shape_manager.add_shape(temp_angle);
				PICTIN.rollback_manager.recordState();
			}
		}
	}
	
	

	//custom mover for lines
	dojo.declare("angle_mover", dojox.gfx.Mover, {
		onMouseMove: function(event){
			
			if(dijit.byId("select").attr("checked") == true){

				// move the rectangle by applying a translation
				var x = event.clientX;
				var y = event.clientY;
				var shape_obj = jQuery(this.shape.getNode()).data("shape_obj");
				
				var transform = this.shape.getTransform();
				
				if(transform == null){
					transform = {dx: 0, dy: 0};
				}
				
				
				me._transform_buffer = transform;
				
				var new_transform = {
					dx: x-this.lastX,
					dy: y-this.lastY
				}
				
				shape_obj.applyLeftTransform(new_transform);
				// store the last position of the rectangle
					
				this.lastX = x;
				this.lastY = y;

				var _anchor_array = jQuery(this.shape.getNode()).data("anchors");
				if (_anchor_array) {
					jQuery.each(_anchor_array, function(index, value){
						value.shape.applyLeftTransform(new_transform);
					})
				}
				
				var child_shapes = jQuery(this.shape.getNode()).data("child_shapes");
				for(var i in child_shapes){
					child_shapes[i].applyLeftTransform(new_transform);
				}
				
				ANGLE.allow_save = true;
			}

			
			dojo.stopEvent(event);
		}
	})
}

function Angle(p1, p2, p3, obtuse, shape, textColor){
	
	//the second coord of segment 1 must be the same as the first coord of segment 2
	this.child_anchors = new Array();
	this.color = textColor;
	this.line_width = PICTIN.current_linethickness;
	this.isCustom = true;
	this.shape = null;
	this.text_shape = null;
	this.arc_shape = null;
	this.arc_path = null;
	this.label1 = this.label2 = this.label3 = this.label4 = this.label5 = null;
	this.obtuse = obtuse;
	this.show_arc = true;
	
	this.getAngle = function(){
		var angle_points = this.shape.getShape().points;
		var segment3_shape = {
			x1: angle_points[0].x,
			y1: angle_points[0].y,
			x2: angle_points[2].x,
			y2: angle_points[2].y
		};
		var a = get_segment_length(angle_points[0].x, angle_points[0].y, angle_points[1].x, angle_points[1].y);
		var b = get_segment_length(angle_points[1].x, angle_points[1].y, angle_points[2].x, angle_points[2].y);
		var c = get_segment_length(segment3_shape.x1, segment3_shape.y1, segment3_shape.x2, segment3_shape.y2);
		
		var angle;
		if(a == 0 || b == 0){
			angle = 0;	
		}
		else{		
			angle = Math.acos((a*a + b*b - c*c) / (2 * a * b));
		}
		if(this.obtuse) angle = (2*Math.PI)-angle;
		return angle;
	}
	
	this.get_dojo_shape = function(){
		return this.shape;
	}
	
	this.angle_bisect = null;
	this.displayAngle = function(){
		var angle_points = this.shape.getShape().points;
	
		//var angle = (this.getAngle() * 180 / Math.PI).numberFormat("0°");
		var angle_calc = Math.round((this.getAngle() * 180 / Math.PI));
		var angle = angle_calc.numberFormat("0°");
		var segment1_num = angle_points[1].y - angle_points[0].y;
		var segment1_den = angle_points[1].x - angle_points[0].x;
		var segment1_slope = (segment1_den == 0)?null:segment1_num/segment1_den;
		var segment2_num = angle_points[2].y - angle_points[1].y;
		var segment2_den = angle_points[2].x - angle_points[1].x;
		var segment2_slope = (segment2_den == 0)?null:segment2_num/segment2_den;
		
		
		
		
		//DEBUG_PAT.output("segment1 slope : " + segment1_slope, true);
		//DEBUG_PAT.output("segment2 slope : " + segment2_slope, true);
		//calculate position
		if (segment1_slope != null && segment2_slope != null) {
			var segment1_angle = Math.atan(segment1_slope);
			var segment2_angle = Math.atan(segment2_slope);
			var bisect_angle = (angle_points[0].x < angle_points[1].x && angle_points[2].x < angle_points[1].x ||
			angle_points[0].x > angle_points[1].x && angle_points[2].x > angle_points[1].x) ? (segment1_angle + segment2_angle) / 2 : (segment1_angle + segment2_angle + Math.PI) / 2;
			var hyp = (this.obtuse)?20:35;
			var slope_mid = Math.tan(bisect_angle);
			var mid_segment_x = Math.cos(bisect_angle) * hyp;
			var mid_segment_y = Math.sin(bisect_angle) * hyp;
			
			var _x = (this.obtuse) ? angle_points[1].x + mid_segment_x : angle_points[1].x - mid_segment_x;
			var _y = (this.obtuse) ? angle_points[1].y + mid_segment_y : angle_points[1].y - mid_segment_y;
			
			var temp_angle = calculate_angle({
				x: _x,
				y: _y
			}, {
				x: angle_points[1].x,
				y: angle_points[1].y
			}, {
				x: angle_points[2].x,
				y: angle_points[2].y
			});
			
			DEBUG_PAT.output("temp angle : " + temp_angle, true);
			if ((this.obtuse) ? temp_angle < Math.PI / 2 : temp_angle >= Math.PI / 2) {
				_x = (this.obtuse) ? angle_points[1].x - mid_segment_x : angle_points[1].x + mid_segment_x;
				_y = (this.obtuse) ? angle_points[1].y - mid_segment_y : angle_points[1].y + mid_segment_y;
			}
			
			if (this.text_shape == null) {
				
				this.text_shape = PICTIN.surface.createText({
					text: angle,
					x: _x,
					y: _y,
					align: "middle"
				}).setStroke({
					color: this.color
				}).setFill(this.color).setFont({
					family: 'Serif',
					size: '12pt'
				});
				
				jQuery(this.shape.getNode()).data("child_shapes")['angle_text_shape'] = this.text_shape;
			}
			
			var old_transform = this.text_shape.getTransform();
			this.text_shape.setTransform(null);

			this.text_shape.setShape({
				text: angle,
				x: _x,
				y: _y
			}).setStroke({
				color: this.color
			}).setFill(this.color).setFont({
				family: 'Serif',
				size: '12pt'
			});//.applyLeftTransform(this.shape.getTransform());
			/*//console.log("x : " + _x);
			//console.log("y : " + _y);
			if(old_transform != null){
				//console.log("transform.dx : "  + old_transform.dx);
				//console.log("transform.dy : "  + old_transform.dy);
				//console.log("transform.xx : "  + old_transform.xx);
				//console.log("transform.yy : "  + old_transform.yy);
				//console.log("transform2.dx : "  + this.shape.getTransform().dx);
				//console.log("transform2.dy : "  + this.shape.getTransform().dy);
				//console.log("transform2.xx : "  + this.shape.getTransform().xx);
				//console.log("transform2.yy : "  + this.shape.getTransform().yy);
			}*/
			this.text_shape.applyLeftTransform(this.shape.getTransform());
			//this.text_shape.applyLeftTransform(old_transform);
			
			if(PICTIN.mirrored == true){
				var real_coords = dojox.gfx.matrix.multiplyPoint(this.text_shape.getTransform(), this.text_shape.getShape().x, this.text_shape.getShape().y);
	
				////console.log("real_coords.x : " + real_coords.x);
				this.text_shape.applyLeftTransform({dx: -(real_coords.x/* - this.text_shape.getTextWidth()/2*/), dy: 0});
				this.text_shape.applyLeftTransform({xx: -1, yy: 1});
				this.text_shape.applyLeftTransform({dx: (real_coords.x/* - this.text_shape.getTextWidth()/2*/), dy: 0});
			}
			this.text_shape.moveToFront();
		}
		else{
			if(this.text_shape != null){
				this.text_shape.setShape({
					text: angle
				}).setFill(this.color).setFont({
					family: 'Serif',
					size: '12pt'
				});//.applyLeftTransform(this.shape.getTransform());
				this.text_shape.applyLeftTransform(this.shape.getTransform());
				this.text_shape.moveToFront();
			}
			
			// This section needs to be fixed such that the text can be positionned when the slopes are null
		}
		
	}
	
	this.removeShape = function(){
		this.shape.removeShape();
	}
	
	this.applyLeftTransform = function(transform){
		this.shape.applyLeftTransform(transform);
		//if(this.text_shape != null)this.text_shape.applyLeftTransform(transform);
		//if(this.show_arc && this.arc_shape !== null){
			//this.arc_shape.applyLeftTransform(transform);
		//}
	}
	
	this.getNode = function(){
		return this.shape.getNode();
	}
	
	this.setTransform = function(transform){
		this.shape.setTransform(transform);
	}
	
	this.getTransform = function(){
		return this.shape.getTransform();
	}
	
	this.getShape = function(){
		return this.shape.getShape();
	}
	
	this.setShape = function(shape){
		this.shape.setShape(shape);
	}
	
	this.connect = function(event, parent_obj, callback){
		return this.shape.connect(event, parent_obj, callback);
	}
	
	this.moveToFront = function(){
		this.shape.moveToFront();
	}
	
	function _createAngle(p1, p2, p3, textColor){

		var shape = PICTIN.surface.createPolyline([{
						x: p1.x,
						y: p1.y
					}, {
						x: p2.x,
						y: p2.y
					}, {
						x: p3.x,
						y: p3.y
					}]).setStroke({
						color: textColor,
						width: PICTIN.current_linethickness
					});
		return shape;
		
	}
	this.add_angle_arc = function(){
		var radius = (this.obtuse)?30:25;
		
		var angle_points = this.shape.getShape().points;
		var angle = Math.round((this.getAngle() * 180 / Math.PI)).numberFormat("0°");
		var segment1_num = angle_points[1].y - angle_points[0].y;
		var segment1_den = angle_points[1].x - angle_points[0].x;
		var segment1_slope = (segment1_den == 0)?null:segment1_num/segment1_den;
		var segment2_num = angle_points[2].y - angle_points[1].y;
		var segment2_den = angle_points[2].x - angle_points[1].x;
		var segment2_slope = (segment2_den == 0)?null:segment2_num/segment2_den;
		
		var a = get_segment_length(angle_points[0].x, angle_points[0].y, angle_points[1].x, angle_points[1].y);
		var b = get_segment_length(angle_points[1].x, angle_points[1].y, angle_points[2].x, angle_points[2].y);
		if(this.arc_shape != null){
			this.arc_path.removeShape();
		}
		
		radius = Math.round(Math.min(a/2,b/2,radius));
		
		//if(a > radius*2 && b > radius*2){	
			
			var slide_start = Math.sqrt((radius*radius)/ (1+(segment1_slope * segment1_slope)));
			var start_x = angle_points[1].x;
			var start_y = angle_points[1].y;
			
			
			if(angle_points[0].x == angle_points[1].x){
				start_x = angle_points[1].x;
			}
			if(angle_points[0].x>angle_points[1].x){
				start_x = Math.round(angle_points[1].x + slide_start);	
			}
			else if(angle_points[0].x<angle_points[1].x){
				start_x = Math.round(angle_points[1].x - slide_start);	
			}
		
			if(slide_start != 0 && segment1_den != 0){
				if(angle_points[1].y<angle_points[0].y){
					start_y = Math.round(angle_points[1].y + Math.abs(slide_start * segment1_slope));
				}
				else{
					start_y = Math.round(angle_points[1].y - Math.abs(slide_start * segment1_slope));	
				}
			}
			else{
				if(angle_points[1].y<angle_points[0].y){
					start_y = angle_points[1].y + radius;	
				}
				else{
					start_y = angle_points[1].y - radius;
				}
			}
			
			var slide_end = Math.sqrt((radius*radius) /(1+(segment2_slope * segment2_slope)));
			var end_x = angle_points[1].x;
			var end_y = angle_points[1].y;				
			
			if(angle_points[2].x == angle_points[1].x){
				end_x = angle_points[1].x;
			}
			if(angle_points[2].x>angle_points[1].x){
				end_x = Math.round(angle_points[1].x + slide_end);	
			}
			else if(angle_points[2].x<angle_points[1].x){
				end_x = Math.round(angle_points[1].x - slide_end);	
			}
	
			if(slide_end != 0 && segment2_den != 0){
				if(angle_points[1].y<angle_points[2].y){
					end_y = Math.round(angle_points[1].y + Math.abs(slide_end * segment2_slope));
				}
				else{
					end_y = Math.round(angle_points[1].y - Math.abs(slide_end * segment2_slope));	
				}
			}
			else{
				if(angle_points[1].y<angle_points[2].y){
					end_y = angle_points[1].y + radius;	
				}
				else{
					end_y = angle_points[1].y - radius;
				}
			}
		
			var cross_product = (angle_points[0].x-angle_points[1].x) * (angle_points[2].y-angle_points[1].y) - (angle_points[0].y-angle_points[1].y) * (angle_points[2].x-angle_points[1].x);
			
			var direction;
			if(this.obtuse && cross_product <= 0){
				direction = true;	
			}
			else if(this.obtuse && cross_product > 0){
				direction = false;	
			}
			else if(!this.obtuse && cross_product <= 0){
				direction = false;	
			}
			else if(!this.obtuse && cross_product > 0){
				direction = true;	
			}
			
			if(this.arc_shape == null){
				this.arc_shape = PICTIN.surface.createGroup();
				this.arc_path = this.arc_shape.createPath();	
				
			}
			else{
				this.arc_path.removeShape();
				this.arc_path = this.arc_shape.createPath();
			}
			this.arc_shape.setTransform(null);
			
			this.arc_path.moveTo( {x: start_x, y: start_y})
					.arcTo( radius,radius,0,this.obtuse,direction,{x: end_x, y: end_y})
					.setStroke({color: this.color, width: this.line_width})
					;
					
			this.arc_shape.applyLeftTransform(this.shape.getTransform());
			this.arc_shape.moveToFront();
					
			jQuery(this.shape.getNode()).data("child_shapes")["angle_arc_shape"] = this.arc_shape;
		//}	
	}
	
	//constructor
	if (typeof shape == 'undefined' || shape == null) {
		DEBUG_PAT.output("shape is undefined", true);
		if (typeof textColor == 'undefined') {
			this.color = "#" + PICTIN.current_color;
		}
		this.shape = _createAngle(p1, p2, p3, this.color);
		angle_add_jQuery_properties(this);
		
	}
	else {
		this.shape = shape;
		angle_add_jQuery_properties(this);
		DEBUG_PAT.output("UID2 = " + jQuery(this.shape.getNode()).getUID(), true);
	
		//PICTIN.surface.add(shape)
	}
	this.displayAngle();
	if(this.show_arc){
		this.add_angle_arc();
	}
	//PICTIN.shape_manager.add_shape(this);
	
}


function angle_anchor(parent, posX, posY, point_number){
 	this.parent_shape = parent;
 	this.point_number = point_number;
 	this.posX = posX;
 	this.posY = posY;
 	this.shape = PICTIN.surface.createCircle({
 		cx: this.posX,
 		cy: this.posY,
 		r: PICTIN.anchor_radius
 	}).setFill(get_inverse_color(this.parent_shape.shape.getStroke().color.toHex())).setStroke({
 		color: this.parent_shape.shape.getStroke().color.toHex()
 	});
 	var me = this;
	
	jQuery(this.shape.getNode()).data("shape_obj", this.shape);
	
	this.shape.applyLeftTransform(this.parent_shape.getTransform());
 	
 	this.parent_shape.child_anchors.push(this);
 	
	this.update_position = function(){
		var parent_shape_points = this.parent_shape.getShape().points;
		if(this.point_number == 1){
			this.shape.setShape({cx: parent_shape_points[0].x, cy: parent_shape_points[0].y});
			this.shape.setTransform(null);
			this.shape.applyLeftTransform(this.parent_shape.getTransform());
		}
		else if(this.point_number == 2){
			this.shape.setShape({cx: parent_shape_points[2].x, cy: parent_shape_points[2].y});
			this.shape.setTransform(null);
			this.shape.applyLeftTransform(this.parent_shape.getTransform());
		}
	}
	
 	dojo.declare("angle_anchor_mover", dojox.gfx.Mover, {
 		onMouseMove: function(event){
 			if (dijit.byId("select").attr("checked") == true) {
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
					
					if (transform == null) {
						transform = {
							dx: 0,
							dy: 0
						};
					}
					
					
					me._transform_buffer = transform;
					
					var new_transform = {
						dx: x - this.lastX,
						dy: y - this.lastY
					}
					
					this.shape.applyLeftTransform(new_transform);
					// store the last position of the rectangle
					
					this.lastX = x;
					this.lastY = y;
					
					//resize the line
					var shape_points = me.parent_shape.getShape().points;
					if (me.point_number == 1) {
						shape_points[0].x = shape_points[0].x + new_transform.dx*zoom_inverse_transform.xx;
						shape_points[0].y = shape_points[0].y + new_transform.dy*zoom_inverse_transform.yy;
						me.parent_shape.setShape(shape_points);
						
					}
					else 
						if (me.point_number == 2) {
							shape_points[2].x = shape_points[2].x + new_transform.dx*zoom_inverse_transform.xx;
							shape_points[2].y = shape_points[2].y + new_transform.dy*zoom_inverse_transform.yy;
							me.parent_shape.setShape(shape_points);
						}
					
					me.parent_shape.displayAngle();
					me.parent_shape.add_angle_arc();
				}
				
				
				dojo.stopEvent(event);
			}
		})
		
		this.anchor_mouseupHandler = function(e){
			PICTIN.rollback_manager.recordState();
		}
		
		this.shape.connect("mouseup", this.anchor_mouseupHandler);
		new dojox.gfx.Moveable(this.shape, {mover: angle_anchor_mover});
}

function angle_add_jQuery_properties(shape){
	var shape_node = shape.getNode();
	
	//add events
	var handler_array = new Array();
	//adds references to event handlers. [eventType, handler, params]
	handler_array.push(["mousedown", angle_mousedownHandler, {}]);
	handler_array.push(["mouseup", angle_mouseupHandler, {}]);
	//handler_array.push(["custom_function", make_shape_draggable]);
	handler_array.push(["moveable_event", angle_mover]);
	jQuery(shape_node).data("pictin_events", handler_array);
	jQuery(shape_node).data("child_shapes", {});
	
	//add some properties
	jQuery(shape_node).data("isSelected", false);
	jQuery(shape_node).data("custom_shape_class", "angle");
}

function angle_mousedownHandler(e){
		if (dijit.byId("select").attr("checked") == true) {
			var shape_obj = jQuery(this).data("shape_obj");
			
			PICTIN.shape_manager.select_shape(this, add_angle_anchors, {shape: shape_obj});
			
		}
}

function angle_mouseupHandler(e){
	if (ANGLE.allow_save) {
		PICTIN.rollback_manager.recordState();
		ANGLE.allow_save = false;
	}
}

function add_angle_anchors(params){
	var shape_points = params.shape.getShape().points;
	var _anchor_array = new Array();
	_anchor_array.push(new angle_anchor(params.shape, shape_points[0].x, shape_points[0].y, 1));
	_anchor_array.push(new angle_anchor(params.shape, shape_points[2].x, shape_points[2].y, 2));
	
	jQuery(params.shape.getNode()).data("anchors", _anchor_array);
}

