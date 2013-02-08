/**
* @author Alex Nguyen
*/
 
ELLIPSE = {};
PICTIN.tool_ellipse = new function(surface, surface_node){
	this._surface = PICTIN.surface;
	this._surface_node = PICTIN.surface_node;
	this._points_array = new Array();
	this._ellipse = null;
	ELLIPSE.allow_save = false;
	var me = this;
	
	var dot_counter = 0;
	
	this.activate = function(){
		jQuery(document).bind("click.ellipse", this.ellipse_tool_mouseclickHandler);
		dot_counter = 0;
		this._points_array = new Array();
		return this;
	}
	
	this.stop = function(){
		jQuery(document).unbind("click.ellipse");
	}
	
	this.ellipse_tool_mouseclickHandler = function(event){
		var _x = PICTIN.mousedownx;
		var _y = PICTIN.mousedowny;
		
		if(PICTIN.coord_within_surface(_x, _y)){
			var point = new Circle_point(_x, _y, PICTIN.surface.createCircle({
					cx: _x,
					cy: _y,
					r: 1
			}).setStroke({
				color: "#" + PICTIN.current_color,
				width: 3
			}));
			
			me._points_array.push(point);
			++dot_counter;
			
			if(dot_counter >= 5){
				// Calculate the elliptic fit.
				var ellipse = compute_ellipse(me._points_array);
				
				if(ellipse == false){
					alert("These 5 points are not on an ellipse, please define 5 other points.");
					
					// Should allow the user to reset, or to add more points.
				}
				else{
					var ellipse_shape = new Ellipse(ellipse);
					PICTIN.shape_manager.add_shape(ellipse_shape);
					ellipse_add_jQuery_properties(ellipse_shape);
					
					PICTIN.rollback_manager.recordState();
				}
				
				for(var i = 0;i<me._points_array.length;++i){
						me._points_array[i].shape.removeShape();
					}
					me._points_array.length = 0;
					dot_counter = 0;
			}
		}
	}
	
	dojo.declare("ellipse_mover", dojox.gfx.Mover, {
		onMouseMove: function(event){
			
			if(dijit.byId("select").attr("checked") == true){

				// move the ellipse by applying a translation
				var x = event.clientX;
				var y = event.clientY;
				var shape_obj = jQuery(this.shape.getNode()).data("shape_obj");
				
				var transform = this.shape.getTransform();
				//an
				if(transform == null){
					transform = {dx: 0, dy: 0};
				}
				
				
				me._transform_buffer = transform;
				
				var new_transform = {
					dx: x-this.lastX,
					dy: y-this.lastY
				}
				
				shape_obj.applyLeftTransform(new_transform);
				shape_obj.ellipse_obj.X_center += new_transform.dx;
				shape_obj.ellipse_obj.Y_center += new_transform.dy;
				shape_obj.getEquations();
				
				//DEBUG_PAT.output_obj(shape_obj.ellipse_obj, "ellipse_obj", true);
				// store the last position of the rectangle
					
				this.lastX = x;
				this.lastY = y;

				var _anchor_array = jQuery(this.shape.getNode()).data("anchors");
				if (_anchor_array) {
					jQuery.each(_anchor_array, function(index, value){
						value.shape.applyLeftTransform(new_transform);
					})
				}
				ELLIPSE.allow_save = true;
			}

			
			dojo.stopEvent(event);
		}
	})
}

function Ellipse(ellipse, shape){
	this.phi = ellipse.phi;
	this.ellipse_obj = ellipse;
	this.cos_phi = Math.cos(this.phi);
	this.sin_phi = Math.sin(this.phi);
	this.shape = null;
	this.isCustom = true;
	this.longAxisEquation = null;
	this.shortAxisEquation = null;
	
	var me = this;
	this.removeShape = function(){
		this.shape.removeShape();
	}
	
	this.applyLeftTransform = function(transform){
		this.shape.applyLeftTransform(transform);
	}
	this.setTransform = function(transform){
		this.shape.setTransform(transform);
	}
	this.getTransform = function(){
		return this.shape.getTransform();
	}
	this.getNode = function(){
		return this.shape.getNode();
	}
	this.getShape = function(){
		return this.shape.getShape();
	}
	this.setShape = function(shape){
		this.shape.setShape(shape);
	}
	this.moveToFront = function(){
		this.shape.moveToFront();
	}
	function createEllipse(){
		var phi = ellipse.phi;
		var cos_phi = Math.cos(phi);
		var sin_phi = Math.sin(phi);
		var ellipse_shape = PICTIN.surface.createEllipse({cx: ellipse.X_center, cy: ellipse.Y_center, rx: (ellipse.a), ry: (ellipse.b)})
						.setStroke({
								color: "#" + PICTIN.current_color,
								width: PICTIN.current_linethickness,
								'shape-rendering': 'crispEdges'
						})
						.setTransform({xx: cos_phi,xy: sin_phi, yx: -sin_phi, yy: cos_phi});
		
		return ellipse_shape;
	}
	this.getEquations = function(){
		var phi = ellipse.phi;
		var cos_phi = Math.cos(phi);
		var sin_phi = Math.sin(phi);
		var transform = me.getTransform();//{xx: cos_phi, xy: sin_phi, yx: -sin_phi, yy: cos_phi};
		var ellipse_center = dojox.gfx.matrix.multiplyPoint(transform, {x: me.getShape().cx, y: me.getShape().cy});
		var ellipse_long_point = dojox.gfx.matrix.multiplyPoint(transform, {x: me.getShape().cx + me.getShape().rx, y: me.getShape().cy});
		var ellipse_short_point = dojox.gfx.matrix.multiplyPoint(transform, {x: me.getShape().cx, y: me.getShape().cy + me.getShape().ry});
		
		//DEBUG_PAT.output_obj(ellipse_center, "ellipse_center", true);
		
		me.longAxisEquation = get_line_equation(ellipse_center, ellipse_long_point);
		me.shortAxisEquation = get_line_equation(ellipse_center, ellipse_short_point);
	}
	if (typeof shape == 'undefined') {
		DEBUG_PAT.output("creating ellipse", true);
		this.shape = createEllipse();
	}
	else {
		this.shape = shape;
	}
	
	this.getEquations();
	DEBUG_PAT.output_obj(this.longAxisEquation, "longaxisequation", true);
}

function ellipse_anchor(ellipse, position){
	this._ellipse = ellipse;
	this._posX = 0;
	this._posY = 0;
	this._angle_rel_parent = Math.PI/4;
	this._dx_accumulator = 0;
	this._dy_accumulator = 0;
	this._position = position;

	//create the anchor shape
	this.shape = PICTIN.surface.createCircle({cx: this._posX, cy: this._posY, r: PICTIN.anchor_radius}).setFill(get_inverse_color(this._ellipse.shape.getStroke().color.toHex())).setStroke({color: this._ellipse.shape.getStroke().color.toHex()});
	this._transform_buffer = {dx: 0, dy: 0};
	
	
	
	jQuery(this.shape.getNode()).data("shape_obj", this.shape);
	
	//event handling workaround
	var me = this;
	
	//functions
	this.update_position = function(){
		var ellipse_cx = this._ellipse.getShape().cx;//this._ellipse.ellipse_obj.X_center;
		var ellipse_cy = this._ellipse.getShape().cy;//this._ellipse.ellipse_obj.Y_center;
		var ellipse_a = this._ellipse.getShape().rx;//this._ellipse.ellipse_obj.a;
		var ellipse_b = this._ellipse.getShape().ry;//this._ellipse.ellipse_obj.b;
		var anchor_cx = null;
		var anchor_cy = null;
		var phi = this._ellipse.ellipse_obj.phi;
		var cos_phi = Math.cos(phi);
		var sin_phi = Math.sin(phi);
		
		if(this._position == 0){
			anchor_cx = ellipse_cx -ellipse_a;
			anchor_cy = ellipse_cy;
		}
		else if(this._position == 1){
			anchor_cx = ellipse_cx;
			anchor_cy = ellipse_cy - ellipse_b;
		}
		else if(this._position == 2){
			anchor_cx = ellipse_cx + ellipse_a;
			anchor_cy = ellipse_cy;
		}
		else if(this._position == 3){
			anchor_cx = ellipse_cx;
			anchor_cy = ellipse_cy + ellipse_b;
		} 	
		
		this.shape.setShape({
			cx: anchor_cx,
			cy: anchor_cy
		}).setTransform(this._ellipse.getTransform());
	}
	
	//custom mover class
	/*
	dojo.declare("ellipse_anchor_mover", dojox.gfx.Mover, {
		constructor: function(_1, e, _2){
			this.shape = _1;
			var coords = dojox.gfx.matrix.multiplyPoint(this.shape.getTransform(), this.shape.getShape().cx, this.shape.getShape().cy);
			this.lastX = coords.x;
			this.lastY = coords.y;
			DEBUG_PAT.output("lawl", true);
			var h = this.host = _2;
			var d = document;
			var _3 = dojo.connect(d, "onmousemove", this, "onFirstMove");
			//this.events = [dojo.connect(d, "onmousemove", this, "onMouseMove"), dojo.connect(d, "onmouseup", this, "destroy")];//, dojo.connect(d, "ondragstart", dojo, "stopEvent"), dojo.connect(d, "onselectstart", dojo, "stopEvent")];
			this.events=[dojo.connect(d,"onmousemove",this,"onMouseMove"),dojo.connect(d,"onmouseup",this,"destroy"),dojo.connect(d,"ondragstart",dojo,"stopEvent"),dojo.connect(d,"onselectstart",dojo,"stopEvent"),_3];

			DEBUG_PAT.output_obj(this.events, "constructor:this.events", true);
			if (h && h.onMoveStart) {
				h.onMoveStart(this);
			}
		},
		onMouseMove: function(event){
			// move the rectangle by applying a translation
			DEBUG_PAT.output("in onMouseMove", true);
			var coords = PICTIN.get_cursor_coords('surface', event);
			var x = coords.x;
			var y = coords.y;
			var delta_x = null;
			var delta_y = null;
			
			if (me._position == 0) {
				var handle_y = me._ellipse.longAxisEquation.getY(x);
				if (handle_y != null) {
					delta_x = x - this.lastX;
					delta_y = handle_y - this.lastY;
					
					//DEBUG_PAT.output("delta_x : " + delta_x, true);
					//DEBUG_PAT.output("delta_y : " + delta_y, true);
					
					this.lastX = x;
					this.lastY = handle_y;
					
					var ellipse_rx = me._ellipse.getShape().rx;
					var delta_rx = get_segment_length_from_delta(delta_x, delta_y);
					
					if (delta_x > 0) {
						delta_rx = -delta_rx;
					}
					
					me._ellipse.setShape({
						rx: ellipse_rx + delta_rx
					});
				}
			}
			else 
				if (me._position == 1) {
					var handle_x = me._ellipse.shortAxisEquation.getX(y);
					
					if (handle_x != null) {
						delta_x = handle_x - this.lastX;
						delta_y = y - this.lastY;
						
						this.lastX = handle_x;
						this.lastY = y;
						
						
					}
				}
				else 
					if (me._position == 2) {
						var handle_y = me._ellipse.longAxisEquation.getY(x);
						
						if (handle_y != null) {
							delta_x = x - this.lastX;
							delta_y = handle_y - this.lastY;
							
							this.lastX = x;
							this.lastY = handle_y;
						}
					}
					else 
						if (me._position == 3) {
							var handle_x = me._ellipse.shortAxisEquation.getX(y);
							
							if (handle_x != null) {
								delta_x = handle_x - this.lastX;
								delta_y = y - this.lastY;
								
								this.lastX = handle_x;
								this.lastY = y;
							}
						}
			
			if (this.shape) {
				this.shape.applyLeftTransform({
					dx: delta_x,
					dy: delta_y
				});
			}
			
			dojo.stopEvent(event);
			
			jQuery(document).trigger("ellipse_resize", me._ellipse);
		},
		onFirstMove:function(){
			this.host.onFirstMove(this);
			dojo.disconnect(this.events.pop());
		},
		destroy: function(){
			DEBUG_PAT.output("in destroy", true);
			DEBUG_PAT.output_obj(this.events, "destroy:this.events", true);
			dojo.forEach(this.events, dojo.disconnect);
			var h = this.host;
			if (h && h.onMoveStop) {
				h.onMoveStop(this);
			}
			this.events = this.shape = null;
			DEBUG_PAT.output("out of destroy", true);
		}
	})
	*/
	dojo.declare("ellipse_anchor_mover", dojox.gfx.Mover, {
			constructor:function(_1,e,_2){
				this.shape=_1;
				var coords = dojox.gfx.matrix.multiplyPoint(this.shape.getTransform(), this.shape.getShape().cx, this.shape.getShape().cy);
			
				this.lastX=coords.x;
				this.lastY=coords.y;
				me._ellipse.getEquations();
				me.shape.moveToFront();
				var h=this.host=_2,d=document;
				//_3=dojo.connect(d,"onmousemove",this,"onFirstMove");
				//this.events=[dojo.connect(d,"onmousemove",this,"onMouseMove"),dojo.connect(d,"onmouseup",this,"destroy"),dojo.connect(d,"ondragstart",dojo,"stopEvent"),dojo.connect(d,"onselectstart",dojo,"stopEvent"),_3];
				if(h&&h.onMoveStart){
					h.onMoveStart(this);
				}
			},
			onMouseMove: function(event){
				// move the rectangle by applying a translation
				DEBUG_PAT.output("in onMouseMove", true);
				var coords = PICTIN.get_cursor_coords('surface', event);
				var x = coords.x;
				var y = coords.y;
				var delta_x = null;
				var delta_y = null;
				var anchors_array = jQuery(me._ellipse.getNode()).data("anchors");
				
				var temp_transform = me._ellipse.getTransform();
				var zoom_inverse_transform = dojox.gfx.matrix.invert({xx: temp_transform.xx, yy: temp_transform.yy});
				DEBUG_PAT.output("x : " + x, true);
				DEBUG_PAT.output("y : " + y, true);
				DEBUG_PAT.output("this.lastX : " + this.lastX, true);
				DEBUG_PAT.output("this.lastY : " + this.lastY, true);
				
				if (me._position == 0) {
					var handle_y = me._ellipse.longAxisEquation.getY(x);
					if (handle_y != null) {
						delta_x = x - this.lastX;
						delta_y = handle_y - this.lastY;
						
						DEBUG_PAT.output("handle_y : " + handle_y, true);
						DEBUG_PAT.output("delta_x : " + delta_x, true);
						DEBUG_PAT.output("delta_y : " + delta_y, true);
						
						this.lastX = x;
						this.lastY = handle_y;
						
						var ellipse_rx = me._ellipse.getShape().rx;
						var delta_rx = get_segment_length_from_delta(delta_x, delta_y);
						
						if (delta_x > 0) {
							delta_rx = -delta_rx;
						}
						
						var new_rx = ellipse_rx + delta_rx*zoom_inverse_transform.xx;
						me._ellipse.setShape({
							rx: new_rx
						});
						me._ellipse.ellipse_obj.a = new_rx;
						if(new_rx < 0){
							for(var i in anchors_array){
								if(anchors_array[i]._position == 2){
									anchors_array[i]._position = 0;
									me._position = 2;
								}
							}
						}
					}
				}
				else 
					if (me._position == 1) {
						var handle_x = me._ellipse.shortAxisEquation.getX(y);
						
						if (handle_x != null) {
							delta_x = handle_x - this.lastX;
							delta_y = y - this.lastY;
							
							this.lastX = handle_x;
							this.lastY = y;
							
							var ellipse_ry = me._ellipse.getShape().ry;
							var delta_ry = get_segment_length_from_delta(delta_x, delta_y);
							
							if (delta_y > 0) {
								delta_ry = -delta_ry;
							}
							
							var new_ry = ellipse_ry + delta_ry*zoom_inverse_transform.yy;
							me._ellipse.setShape({
								ry: new_ry
							});
							
							me._ellipse.ellipse_obj.b = new_ry;
							
							if(new_ry < 0){
								for(var i in anchors_array){
									if(anchors_array[i]._position == 3){
										anchors_array[i]._position = 1;
										me._position = 3;
									}
								}
							}
						}
					}
					else 
						if (me._position == 2) {
							var handle_y = me._ellipse.longAxisEquation.getY(x);
							
							if (handle_y != null) {
								delta_x = x - this.lastX;
								delta_y = handle_y - this.lastY;
								
								this.lastX = x;
								this.lastY = handle_y;
								
								var ellipse_rx = me._ellipse.getShape().rx;
								var delta_rx = get_segment_length_from_delta(delta_x, delta_y);
								
								if (delta_x < 0) {
									delta_rx = -delta_rx;
								}
								
								var new_rx = ellipse_rx + delta_rx*zoom_inverse_transform.xx;
								me._ellipse.setShape({
									rx: new_rx
								});
								me._ellipse.ellipse_obj.a = new_rx;
								
								if(new_rx < 0){
									for(var i in anchors_array){
										if(anchors_array[i]._position == 0){
											anchors_array[i]._position = 2;
											me._position = 0;
										}
									}
								}
							}
						}
						else 
							if (me._position == 3) {
								var handle_x = me._ellipse.shortAxisEquation.getX(y);
								
								if (handle_x != null) {
									delta_x = handle_x - this.lastX;
									delta_y = y - this.lastY;
									
									this.lastX = handle_x;
									this.lastY = y;
									
									var ellipse_ry = me._ellipse.getShape().ry;
									var delta_ry = get_segment_length_from_delta(delta_x, delta_y);
									
									if (delta_y < 0) {
										delta_ry = -delta_ry;
									}
									
									var new_ry = ellipse_ry + delta_ry*zoom_inverse_transform.yy;
									me._ellipse.setShape({
										ry: new_ry
									});
									
									me._ellipse.ellipse_obj.b = new_ry;
									
									if(new_ry < 0){
										for(var i in anchors_array){
											if(anchors_array[i]._position == 1){
												anchors_array[i]._position = 3;
												me._position = 1;
											}
										}
									}
								}
							}
				
				if (this.shape) {
					this.shape.applyLeftTransform({
						dx: delta_x,
						dy: delta_y
					});
				}
				
				
				for(var i in anchors_array){
					anchors_array[i].update_position();
				}
				
				dojo.stopEvent(event);
				
				jQuery(document).trigger("ellipse_resize", me._ellipse);
			},
			destroy: function(){
				DEBUG_PAT.output("in destroy", true);
				DEBUG_PAT.output_obj(this.events, "destroy:this.events", true);
				dojo.forEach(this.events, dojo.disconnect);
				var h = this.host;
				if (h && h.onMoveStop) {
					h.onMoveStop(this);
				}
				this.events = this.shape = null;
				//PICTIN.rollback_manager.recordState();
				DEBUG_PAT.output("out of destroy", true);
			}	});


	this.apply_left_transform = function(matrix){
		this.shape.applyLeftTransform(matrix);
		this._transform_buffer = this.shape.getTransform();
	}
	
	this.mouseupHandler = function(e){
		jQuery(document).trigger("ellipse_resized", me._ellipse);
		PICTIN.rollback_manager.recordState();
	}
	
	//make the shape draggable
	this._moveableshape = new dojox.gfx.Moveable(this.shape, {mover: ellipse_anchor_mover});
	this.shape.connect("mouseup", this.mouseupHandler);

	//constructor
	this.update_position();
 }
 
function ellipse_add_jQuery_properties(object){
	var shape_node = object.getNode();
	
	//add events
	var handler_array = new Array();
	//adds references to event handlers. [eventType, handler, params]
	handler_array.push(["mousedown", ellipse_mousedownHandler, {}]);
	handler_array.push(["mouseup", ellipse_mouseupHandler, {}]);
	
	handler_array.push(["moveable_event", ellipse_mover]);
	jQuery(shape_node).data("pictin_events", handler_array);
	DEBUG_PAT.output(shape_node, true);
	//add some properties
	jQuery(shape_node).data("isSelected", false);
	jQuery(shape_node).data("custom_shape_class", "ellipse");
	jQuery(shape_node).data("custom_values", object.ellipse_obj);
}
function ellipse_mousedownHandler(e){
	if (dijit.byId("select").attr("checked") == true) {
		var shape_obj = jQuery(this).data("shape_obj");
		//DEBUG_PAT.output_obj(shape_obj, "ellipse_mousedownHandler shape_obj : ", true);
		
		PICTIN.shape_manager.select_shape(this, add_ellipse_anchors, {shape: shape_obj});
		
	}
}
function ellipse_mouseupHandler(e){
	if (ELLIPSE.allow_save) {
		PICTIN.rollback_manager.recordState();
		ELLIPSE.allow_save = false;
	}
}
function add_ellipse_anchors(params){
	//var shape_points = params.shape.getShape().points;
	var _anchor_array = new Array();
	//_anchor_array.push(new angle_anchor(params.shape, shape_points[0].x, shape_points[0].y, 1));
	//_anchor_array.push(new angle_anchor(params.shape, shape_points[2].x, shape_points[2].y, 2));
	_anchor_array.push(new ellipse_anchor(params.shape, 0));
	_anchor_array.push(new ellipse_anchor(params.shape, 1));
	_anchor_array.push(new ellipse_anchor(params.shape, 2));
	_anchor_array.push(new ellipse_anchor(params.shape, 3));

	jQuery(params.shape.getNode()).data("anchors", _anchor_array);
}
function Circle_point(x,y,shape){
	this.x = x;
	this.y = y;
	this.shape = shape;
}

function compute_ellipse(input_point_array){
	var orientation_tolerance = 0.001;
	// Returns the center and rx,ry, and rotation angle
	
	var point_array = input_point_array.slice();
	
	// X1	Y1
	// X2	Y2
	// ...  ...
	
	var array_size = point_array.length;
	if(array_size < 5) return; // Sanity check
	
	var mean_x = 0;
	var mean_y = 0;
	
	for(var i = 0;i < array_size;++i){
		mean_x += point_array[i].x;
		mean_y += point_array[i].y;
	}
	
	mean_x = mean_x / array_size;
	mean_y = mean_y / array_size;
	
	// alows matrix inversion to be more accurate
	for(var i = 0;i < array_size;++i){
		point_array[i].x -= mean_x;
		point_array[i].y -= mean_y;
	}
	
	// Start estimating the conic equation
	var X = new Array();
	// X[i] are rows in matrix
	
	var sum_X = new Array();
	sum_X[0] = 0;
	sum_X[1] = 0;
	sum_X[2] = 0;
	sum_X[3] = 0;
	sum_X[4] = 0;
	
	for(var i = 0;i < array_size;++i){
		X[i] = new Array();
		
		X[i].push(point_array[i].x * point_array[i].x);
		X[i].push(point_array[i].x * point_array[i].y);
		X[i].push(point_array[i].y * point_array[i].y);
		X[i].push(point_array[i].x);
		X[i].push(point_array[i].y);
		
		sum_X[0] += X[i][0];
		sum_X[1] += X[i][1];
		sum_X[2] += X[i][2];
		sum_X[3] += X[i][3];
		sum_X[4] += X[i][4];
	}
	
	// Multiply X by its transpose -> This creates a square 5-by-5 matrix
	var Matrix = new Array();
	for (var i = 0; i < 5; ++i) {
		Matrix[i] = new Array();
		
		for (var j = 0; j < 5; ++j) {
			// Perform matrix multiplication
			var sum = 0;
			
			for (var k = 0; k < array_size; ++k) {
				sum += X[k][j] * X[k][i];
			}
			Matrix[i][j] = sum;
		}
	}
	
	// Invert the matrix -- Gauss Jordan elimination method
	var invMatrix = new Array();
	// The invert is initially the identity matrix. All operations on Matrix will be performed on invMatrix
	
	for(var i = 0;i < array_size;++i){
		invMatrix[i] = new Array();				
		for(var j = 0;j < array_size;++j){			
			if(i == j){
				invMatrix[i][j] = 1;
			}
			else{
				invMatrix[i][j] = 0;
			}
				
		}		
	}
	
	// Begin operation. There are two major steps. We begin by putting reducing and putting 0s below the diagonal.
	//// STEP 1
	for(var i = 0;i < 5;++i){
		for(var j = 0;j < i;++j){
			// Must find a row with 1 in column j
			var identity_row;
			for(var k = 0;k < 5;++k){
				if(Matrix[k][j] == 1){
					identity_row = k;
					break;
				}
			}
			
			
			// Reduce to zero
			var reduction_factor = -1 * Matrix[i][j];
			
			for(var k = 0;k < array_size;++k){
				Matrix[i][k] = Matrix[i][k] + Matrix[identity_row][k] * reduction_factor;
				invMatrix[i][k] = invMatrix[i][k] + invMatrix[identity_row][k] * reduction_factor;
			}
		}
		
		// Divide the row by the diagonal
		var diagonal = Matrix[i][i];
		// Must make sure diagonal is not zero
		if(diagonal == 0){
			for(var k = 0;k < 5;++k){
				if(Matrix[k][i] != 0){
					// Swap k and i
					for(var l = 0;l < 5;++l){
						var temp_matrix = Matrix[k][l];
						var temp_identity = invMatrix[k][l];
						Matrix[k][l] = Matrix[i][l];
						invMatrix[k][l] = invMatrix[i][l];
						
						Matrix[i][l] = temp_matrix;
						invMatrix[i][l] = temp_identity;
					}
				}
			}
			i = 0; // Restart the loop; We do this to order the matrix.
		}
		else{
			for(var k = 0;k < 5;++k){
				Matrix[i][k] = Matrix[i][k] / diagonal;
				invMatrix[i][k] = invMatrix[i][k] / diagonal;
			}	
		}
	}	
	
	// Now put 0 above the diagonal
	//// STEP 2
	for(var i = 3;i >= 0;--i){
		for(var j = 4;j > i;--j){
			// Must find a row with 1 in column j
			var identity_row;
			for(var k = 0;k < 5;++k){
				if(Matrix[k][j] == 1){
					identity_row = k;
					break;
				}
			}
			// Reduce to zero
			var reduction_factor = -1 * Matrix[i][j];
			
			for(var k = 0;k < 5;++k){
				Matrix[i][k] = Matrix[i][k] + Matrix[identity_row][k] * reduction_factor;
				invMatrix[i][k] = invMatrix[i][k] + invMatrix[identity_row][k] * reduction_factor;	
			}
		}
	}
	
	// invMatrix is now the invert
	
	// Multiply sum_X with the invert
	var arr = new Array();
	
	for(var i = 0;i <5;++i){
		var sum = 0;
		for(var j = 0;j < 5;++j){
			sum += sum_X[j] * invMatrix[j][i];
		}
		arr[i] = sum;
	}
	
	// Here are the conic section parameters
	var a = arr[0];
	var b = arr[1];
	var c = arr[2];
	var d = arr[3];
	var e = arr[4];
	
	var cos_phi;
	var sin_phi;
	var orientation_rad;
	
	// Remove orientation from the ellipse
	if(Math.min(Math.abs(b/a),Math.abs(b/c)) > orientation_tolerance){
		orientation_rad = 1/2 * Math.atan(b/(c-a));
		cos_phi = Math.cos(orientation_rad);
		sin_phi = Math.sin(orientation_rad);
		
		var temp_a = a;
		var temp_b = b;
		var temp_c = c;
		var temp_d = d;
		var temp_e = e;
		var temp_mean_x = mean_x;
		var temp_mean_y = mean_y;
		
		a = temp_a * cos_phi * cos_phi - temp_b*cos_phi*sin_phi + temp_c*sin_phi*sin_phi;
		b = 0;
		c = temp_a * sin_phi * sin_phi + temp_b*cos_phi*sin_phi + temp_c*cos_phi*cos_phi;
		d = temp_d * cos_phi - temp_e * sin_phi;
		e = temp_d * sin_phi + temp_e * cos_phi;
		
		mean_x = cos_phi*temp_mean_x - sin_phi*temp_mean_y;
		mean_y = sin_phi*temp_mean_x + cos_phi*temp_mean_y;
	}
	else{
		orientation_rad = 0;
		cos_phi = Math.cos(orientation_rad);
		sin_phi = Math.sin(orientation_rad);
	}
	
	// Here we see if the conic section is an ellipse
	var test = a*c;
	if(test == 0){
		// Parabola	
		return false;
	}
	else if(test < 0){
		// Hyperbola	
		return false;
	}
	
	// Make sure coefficients are positive as required
	if(a<0){
		a = -a;
		c = -c;
		d = -d;
		e = -e;
	}
	
	// Final ellipse parameter;
	var X_center = mean_x - d/2/a;
	var Y_center = mean_y - e/2/c;
	var F = 1 + (d*d)/(4*a) + (e*e)/(4*c);
	a = Math.sqrt(F/a);
	b = Math.sqrt(F/c);
	var long_axis = 2*Math.max(a,b);
	var short_axis = 2*Math.min(a,b);
	
	// Rotate the axes backwards to find the center point of the original tilted ellipse
	var R = new Array();
	R[0] = new Array();
	R[1] = new Array();
	R[0][0] = cos_phi;
	R[0][1] = sin_phi;
	R[1][0] = -sin_phi;
	R[1][1] = cos_phi;
	
	var P_in = new Array();
	P_in[0] = R[0][0] * X_center + R[0][1] * Y_center;
	P_in[1] = R[1][0] * X_center + R[1][1] * Y_center;
	
	var X_center_in = P_in[0];
	var Y_center_in = P_in[1];

	return {X_center: X_center, Y_center: Y_center, long_axis: long_axis, short_axis: short_axis, phi: orientation_rad, X_center_in: X_center_in, Y_center_in: Y_center_in, a: a,b: b};
	
}

