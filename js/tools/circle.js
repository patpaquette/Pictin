/**
 * @author patricepaquette
 */

CIRCLE = {};
PICTIN.tool_circle = new function(surface, surface_node){
	this._surface = PICTIN.surface;
	this._surface_node = PICTIN.surface_node;
	this._points_array = new Array();
	this._circle_array = new Array();
	this._circle = null;
	this._circle_buffer = null;
	this._event_handle_array = new Array();
	this._moveable_handle_array = new Array();
	this._circle_anchor = null;
	this._max_x = null;
	this._max_y = null;
	this._circ_color_buffer = null;
	this._circ_width_buffer = null;
	var dot_counter = 0;
	var me = this;
	CIRCLE.allow_save = false;
	this.customShapeContainer;
	this.drawChildShapes = true;
	
	this.activate = function(){
		//using surface based events so that the onmousedown event doesn't fire when outside the surface.
		//this._handle_array.push(dojo.connect(this._surface_node, "onclick", this.circle_mouseclickHandler));
		jQuery(document).click(this.circle_tool_mouseclickHandler);
		dot_counter = 0;
		this._points_array = new Array();
		if(typeof(shapeContainer) != "undefined"){
			this.customShapeContainer = shapeContainer;
		}
		return this;
	}
	
	this.stop = function(){
		//dojo.forEach(this._handle_array, dojo.disconnect);
		this.drawChildShapes = true;
		jQuery(document).unbind("click", this.circle_mouseclickHandler);
	}
	
	this.unselect = function(shape){
		if(this._circle_anchor != null){
			this._circle_anchor._shape.removeShape();
			this._circle_anchor = null;
		}
	}
	
	this.make_selectable = function(){
		for(var i in this._circle_array){
			//this._event_handle_array.push(this._circle_array[i].connect("onmousedown", this._circle_array[i], this.circle_mousedownHandler));
			//this._event_handle_array.push(this._circle_array[i].connect("onmouseup", this._circle_array[i], this.circle_mouseupHandler));
			//this._event_handle_array.push(this._circle_array[i].connect("onmouseover", this._circle_array[i], this.circle_mouseoverHandler));
			//this._event_handle_array.push(this._circle_array[i].connect("onmouseout", this._circle_array[i], this.circle_mouseoutHandler));
			//this._moveable_handle_array.push(new dojox.gfx.Moveable(this._circle_array[i], {
				//mover: circle_mover
			//}));
		}
	}
	
	this.make_unselectable = function(){
		for(var i in this._circle_array){
			this._circle_array[i].setFill(null);
		}
		for(var i in this._moveable_handle_array){
			this._moveable_handle_array[i].destroy();
		}
		dojo.forEach(this._event_handle_array, dojo.disconnect);
		this._moveable_handle_array = new Array();
		this._event_handle_array = new Array();
	}
	
	
	this.circle_tool_mouseclickHandler = function(event){
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
			
			me._points_array.push(point);
			dot_counter++;
			
			if (dot_counter % 3 == 0) {
				var c = compute_circle(me._points_array[dot_counter - 3], me._points_array[dot_counter - 2], me._points_array[dot_counter - 1]);
				
				if (c == "Not a circle") {
					alert(c);
					//removing the points from surface
					me._points_array[dot_counter - 3].shape.removeShape();
					me._points_array[dot_counter - 2].shape.removeShape();
					me._points_array[dot_counter - 1].shape.removeShape();
				}
				else {
					me._circle = PICTIN.surface.createCircle({
						cx: c.Xo,
						cy: c.Yo,
						r: c.r
					}).setStroke({
						color: "#" + PICTIN.current_color,
						width: PICTIN.current_linethickness,
						'shape-rendering': 'crispEdges'
					});
					//me._circle.connect("onclick", me._circle, function(e){
						//e.preventDefault();
					//});
					me._circle_array.push(me._circle);
					
					//register shape with manager
					PICTIN.shape_manager.add_shape(me._circle);
					
					//add jquery properties
					circ_add_jQuery_properties(me._circle);
					
					//removing the points from surface
					me._points_array[dot_counter - 3].shape.removeShape();
					me._points_array[dot_counter - 2].shape.removeShape();
					me._points_array[dot_counter - 1].shape.removeShape();
					
					circ_add_rollback_function(me._circle);
					
					if(me.drawChildShapes){
						circ_add_child_shapes(me._circle);
					}
					
					if(typeof(me.customShapeContainer) != "undefined"){
						me.customShapeContainer.push(me._circle);
					}
					
					jQuery(document).trigger("record_state");
					jQuery(document).trigger("circle_drawn", [me._circle]);
					
				}
			}
		}
	}
	
	
	
	//custom mover class
	dojo.declare("circle_mover", dojox.gfx.Mover, {
		onMouseMove: function(event){
			if (dijit.byId("select").attr("checked") == true) {
				// move the circle by applying a translation
				var x = event.clientX;
				var y = event.clientY;
				
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
				
				var anchor_array = jQuery(this.shape.getNode()).data("anchors");
				jQuery.each(anchor_array, function(index, value){
					value.apply_left_transform(new_transform);
				})
				
				/*for (var i in me._points_array) {
					if (me._points_array[i].circle != null) {
						if (me._points_array[i].circle == this.shape) {
							me._points_array[i].apply_left_transform(new_transform);
						}
					}
				}*/
				
				var child_shapes = jQuery(this.shape.getNode()).data("child_shapes");
				
				//center cross
				for(var i in child_shapes){
					//DEBUG_PAT.output_obj(child_shapes[i], "child_shape", true);
					child_shapes[i].applyLeftTransform(new_transform);
				}
			}
			
			CIRCLE.allow_save = true;
			dojo.stopEvent(event);
		}
	})
}

function Circle_point(x, y, shape){
	this.x = x;
	this.y = y;
	this.angle = null;
	this.circle = null;
	this.shape = shape;
	
	this.update_pos = function(){
		this.x = this.circle.shape.cx + Math.cos(this.angle) * this.circle.shape.r;
		this.y = this.circle.shape.cy + Math.sin(this.angle) * this.circle.shape.r;
			
		this.shape.setShape({cx: this.x, cy: this.y});
	}
	
	this.apply_left_transform = function(matrix){
		this.shape.applyLeftTransform(matrix);	
	}
	
	this.link_to_circle = function(circle){
		this.circle = circle;
		this.angle = Math.acos((this.x - circle.shape.cx)/circle.shape.r);
	}
}


<!-- hide


function Circ_anchor(surface, circle){
 	this._surface = surface;
	this._circle = circle;
	this.shape_circle = circle.shape;
	this._posX = this._circle.shape.cx + Math.cos(Math.PI/4) * this._circle.shape.r;
	this._posY = this._circle.shape.cy + Math.sin(Math.PI/4) * this._circle.shape.r;
	this._angle_rel_parent = Math.PI/4;
	this._dx_accumulator = 0;
	this._dy_accumulator = 0;
	
	//reate the anchor shape
	this.shape = this._surface.createCircle({cx: this._posX, cy: this._posY, r: PICTIN.anchor_radius}).setFill(get_inverse_color(this._circle.getStroke().color.toHex())).setStroke({color: this._circle.getStroke().color.toHex()});
	this._transform_buffer = {dx: 0, dy: 0};
	
	
	
	jQuery(this.shape.getNode()).data("shape_obj", this.shape);
	
	//event handling workaround
	var me = this;
	
	//functions
	this.update_position = function(){
		var posX = this._circle.shape.cx + Math.cos(this._angle_rel_parent) * this._circle.shape.r;
		var posY = this._circle.shape.cy + Math.sin(this._angle_rel_parent) * this._circle.shape.r;
		var transform = this._circle.getTransform();
		
		this.shape.setShape({cx: posX, cy: posY});
		this.shape.setTransform(null);
		this.shape.applyLeftTransform(transform);
	}
	
	//custom mover class
	dojo.declare("anchor_mover", dojox.gfx.Mover, {
		onMouseMove: function(event){
			// move the rectangle by applying a translation
			var x = event.clientX;
            var y = event.clientY;
			
			var transform = this.shape.getTransform();
			
			if(transform == null){
				transform = {dx: 0, dy: 0};
			}
			
			//getting the zoom level applied to the shape
			var temp_transform = this.shape.getTransform();
			var zoom_inverse_transform = 1;
			if(temp_transform != null){
				zoom_inverse_transform = dojox.gfx.matrix.invert({xx: temp_transform.xx, yy: temp_transform.yy});
			}
			
			me._transform_buffer = transform;
			
			var _dx = x-this.lastX;
			var _dy = y-this.lastY;
			me._dx_accumulator += _dx;
			me._dy_accumulator += _dy;
            this.shape.applyLeftTransform({ 
               dx: _dx, 
               dy: _dy
            });
            // store the last position of the rectangle
			
            this.lastX = x;
            this.lastY = y;
			
			var value_x = this.shape.shape.cx + me._dx_accumulator*zoom_inverse_transform.xx - me._circle.shape.cx;
			var value_y = this.shape.shape.cy + me._dy_accumulator*zoom_inverse_transform.yy - me._circle.shape.cy;
			var r = Math.sqrt(value_x*value_x + value_y*value_y);
			this.angle_rel_parent = Math.acos(value_x/r);
			
			shape = me._circle.shape;
			me._circle.setShape({
				r: r
			});
					
			//for(var i in me._parent._points_array){
				//if(me._parent._points_array[i].circle == me._circle){
			
					//me._parent._points_array[i].update_pos();
				//}
			//}
			dojo.stopEvent(event);
			
			jQuery(document).trigger("circle_resize", me._circle);
		}
	})
	
	this.apply_left_transform = function(matrix){
		this.shape.applyLeftTransform(matrix);
		this._transform_buffer = this.shape.getTransform();
	}
	
	this.mouseupHandler = function(e){
		jQuery(document).trigger("circle_resized", me._circle);
		PICTIN.rollback_manager.recordState();
	}
	
	//make the shape draggable
	this._moveableshape = new dojox.gfx.Moveable(this.shape, {mover: anchor_mover});
	this.shape.connect("mouseup", this.mouseupHandler);

	//constructor
	this.update_position();
 }
 
 function circ_add_rollback_function(shape){
 	DEBUG_PAT.output("in circ_add_rollback_function", true);
 	jQuery(shape.getNode()).data("rollback_function", circ_add_child_shapes);
	//var rollback_function = jQuery(shape.getNode()).data("rollback_function");
	
 }
 
 function circ_add_child_shapes(shape){
 	DEBUG_PAT.output("in circ_add_child_shapes", true);
 	var child_shapes_array = new Array();
	child_shapes_array = circ_add_center_cross(child_shapes_array, shape);
	
	if(typeof(this.customShapeContainer) != 'undefined'){
		for(var i in child_shapes_array){
			this.customShapeContainer.push(child_shapes_array[i]);
		}
	}
	jQuery(shape.getNode()).data("child_shapes", child_shapes_array);
 }
 
 function circ_add_center_cross(shapes_array, shape){
 	if(PICTIN.surface){
		var child_shape1 = PICTIN.surface.createLine({x1: shape.getShape().cx - 5,
													  y1: shape.getShape().cy - 5,
													  x2: shape.getShape().cx + 5,
													  y2: shape.getShape().cy + 5}).applyLeftTransform(shape.getTransform());
		child_shape1.setStroke({color: "#" + PICTIN.current_color});
						  
		var child_shape2 = PICTIN.surface.createLine({x1: shape.getShape().cx + 5,
													  y1: shape.getShape().cy - 5,
													  x2: shape.getShape().cx - 5,
													  y2: shape.getShape().cy + 5}).applyLeftTransform(shape.getTransform());
		child_shape2.setStroke({color: "#" + PICTIN.current_color});
													  
		shapes_array.push(child_shape1);
		shapes_array.push(child_shape2);
	}
	
	return shapes_array
 }
 
 function circ_add_jQuery_properties(shape){
 	var shape_node = shape.getNode();
	
	//add events
	var handler_array = new Array();
	//adds references to event handlers. [eventType, handler, params]
	handler_array.push(["mousedown", circle_mousedownHandler, {}]);
	handler_array.push(["mouseup", circle_mouseupHandler, {}]);
	//handler_array.push(["custom_function", make_shape_draggable]);
	handler_array.push(["moveable_event", circle_mover]);
	jQuery(shape_node).data("pictin_events", handler_array);
	
	//add some properties
	jQuery(shape_node).data("isSelected", false);
	
 }

function circle_mousedownHandler(event){
	if (dijit.byId("select").attr("checked") == true) {
		var shape = jQuery(this).data("shape_obj");
		
		PICTIN.shape_manager.select_shape(shape.getNode(), circle_add_anchors, {shape: shape});
	}
}

function circle_add_anchors(params){
	var anchor_array = new Array();
	anchor_array.push(new Circ_anchor(PICTIN.surface, params.shape));

	jQuery(params.shape.getNode()).data("anchors", anchor_array);
}
	
function circle_mouseupHandler(event){
	if (CIRCLE.allow_save) {
		jQuery(document).trigger("record_state");
		CIRCLE.allow_save = false;
	}
	
}
 
//circle computing code
// evaluate the determinant
function compute_circle(p1, p2, p3)
{
	var zero = parseFloat("0");
	var P = [[zero,zero],[zero,zero],[zero,zero]];
	
    P[0][0] = parseFloat(p1.x);
    P[0][1] = parseFloat(p1.y);
    P[1][0] = parseFloat(p2.x);
    P[1][1] = parseFloat(p2.y);
    P[2][0] = parseFloat(p3.x);
    P[2][1] = parseFloat(p3.y);
 
    // check input
    if (isNaN(P[0][0])||isNaN(P[0][1])||
        isNaN(P[1][0])||isNaN(P[1][1])||
        isNaN(P[2][0])||isNaN(P[2][1]))
    {
        window.alert("Invalid input!");
        return;
    }
  
    var c = circle(P);
    if (c.r > 0)
    {
        return {Xo: c.Xo,Yo: c.Yo,r: c.r};
    }
    else
        return "Not a circle";
}
 
//  Calculate center and radius of circle given three points
function circle(P)
{
	var zero = parseFloat("0");
    var i;
    var r, m11, m12, m13, m14;
    var a = [[zero,zero,zero],[zero,zero,zero],[zero,zero,zero]];
	var Xo, Yo;
	
 
    for (i = 0; i < 3; i++)                    // find minor 11
    {
        a[i][0] = P[i][0];
        a[i][1] = P[i][1];
        a[i][2] = 1;
    }
    m11 = determinant( a, 3 );
 
    for (i = 0; i < 3; i++)                    // find minor 12 
    {
        a[i][0] = P[i][0]*P[i][0] + P[i][1]*P[i][1];
        a[i][1] = P[i][1];
        a[i][2] = 1;
    }
    m12 = determinant( a, 3 );
 
    for (i = 0; i < 3; i++)                    // find minor 13
    {
        a[i][0] = P[i][0]*P[i][0] + P[i][1]*P[i][1];
        a[i][1] = P[i][0]
        a[i][2] = 1;
    }
    m13 = determinant( a, 3 );
 
    for (i = 0; i < 3; i++)                    // find minor 14
    {
        a[i][0] = P[i][0]*P[i][0] + P[i][1]*P[i][1];
        a[i][1] = P[i][0];
        a[i][2] = P[i][1];
    }
    m14 = determinant( a, 3 );
 
    if (m11 == 0)
    {
        r = 0;                                 // not a circle
    }
    else
    {
        Xo =  0.5 * m12 / m11;                 // center of circle
        Yo = -0.5 * m13 / m11;
        r  = Math.sqrt( Xo*Xo + Yo*Yo + m14/m11 );
    }
 
    return {Xo: Xo,Yo: Yo,r: r};                           
}
 
// Recursive definition of determinate using expansion by minors.
function determinant( a, n )
{
	var zero = parseFloat("0");
    var i, j, j1, j2;
    var d = parseFloat("0");
    var m = [[zero,zero,zero],[zero,zero,zero],[zero,zero,zero]];
 
    if (n == 2)                                // terminate recursion
    {
        d = a[0][0]*a[1][1] - a[1][0]*a[0][1];
    }
    else 
    {
        d = 0;
        for (j1 = 0; j1 < n; j1++ )            // do each column
        {
            for (i = 1; i < n; i++)            // create minor
            {
                j2 = 0;
                for (j = 0; j < n; j++)
                {
                    if (j == j1) continue;
                    m[i-1][j2] = a[i][j];
                    j2++;
                }
            }
            
            // sum (+/-)cofactor * minor  
            d = d + Math.pow(-1.0, j1)*a[0][j1]*determinant( m, n-1 );
        }
    }
 
    return d;
}
 