/**
 * @author patricepaquette
 */

 TOOL_RECT = {};
 PICTIN.tool_rectangle = new function(){
     //variables
	
    this._surface = PICTIN.surface;
    this._surface_node = PICTIN.surface_node;
    this._rect_tool = null;
    this._rect_tool_buffer = null;
    this._rect_array = new Array();
    this._handle_array = new Array();
    this._event_handle_array = new Array();
    this._mousedown_posX = null;
    this._mousedown_posY = null;
    this._anchor_array = new Array();
    this._moveable_handle_array = new Array();
    this._max_x = null;
    this._max_y = null;
    this._rect_color_buffer = null;
    this._rect_width_buffer = null;
    this._fill = false;
	TOOL_RECT.allow_save = false;
    var me = this;

    //public functions
    this.activate = function(){
        jQuery(document).bind("mousedown", this.rect_tool_mousedownHandler);
        jQuery(document).bind("mouseup", this.rect_tool_mouseupHandler);
        jQuery(document).mousemove(this.rect_tool_mousemoveHandler);
        
        var $surface = jQuery(PICTIN.surface_node);
        this._max_x = $surface.width() + $surface.offset().left - 1;
        this._max_y = $surface.height() + $surface.offset().top - 1;
        
        return this;
    }
    
    this.stop = function(){
    	this.setFill(false);
        jQuery(document).unbind("mousedown", this.rect_tool_mousedownHandler);
        jQuery(document).unbind("mouseup", this.rect_tool_mouseupHandler);
    }
    
    this.setFill = function(fill){
    	this._fill = fill;
    }

    //tool event handlers
    this.rect_tool_mousedownHandler = function(e){
        if (PICTIN.coord_within_working_area(PICTIN.mousedownx, PICTIN.mousedowny)) {
            me.mousedown_posX = PICTIN.mousedownx;
            me.mousedown_posY = PICTIN.mousedowny;
            width = 1;
            height = 1;
            
            me._rect_tool = new Polyline_rect(me.mousedown_posX, me.mousedown_posY, width, height);
            
            me._rect_tool.connect("onmousedown", me._rect_tool, function(e){
                e.preventDefault();
            });
            
            //add the rectangle to the array
            me._rect_array.push(me._rect_tool);
			PICTIN.shape_manager.add_shape(me._rect_tool);
			
			rect_add_jQuery_properties(me._rect_tool);
        }
     }
     
    this.rect_tool_mousemoveHandler = function(e){
            e.preventDefault();
            
            var coords=PICTIN.get_cursor_coords('surface', e),
                    mousedownx=PICTIN.mousedownx,
                    mousedowny=PICTIN.mousedowny;
                    
            if(PICTIN.mousedown && PICTIN.surface && me._rect_tool != null)
            {
                //remove 
                if(PICTIN.current_shape)
                    PICTIN.surface.remove(PICTIN.current_shape);
                                

                //handle overflow
                var canvas_dimensions=PICTIN.surface.getDimensions();
                if(coords.x>canvas_dimensions.width-1)
                    coords.x=canvas_dimensions.width-1;
                if(coords.x<0)
                    coords.x=0;
                if(coords.y>canvas_dimensions.height-1)
                    coords.y=canvas_dimensions.height-1;
                if(coords.y<0)
                    coords.y=0;    
                if(mousedownx>canvas_dimensions.width-1)
                    mousedownx=canvas_dimensions.width-1;
                if(mousedownx<0)
                    mousedownx=0;            
                if(mousedowny>canvas_dimensions.height-1)
                    mousedowny=canvas_dimensions.height-1;
                if(mousedowny<0)
                    mousedowny=0;
                    
                var width=coords.x-mousedownx,
                    height=coords.y-mousedowny,
                    topleftx=mousedownx,
                    toplefty=mousedowny;
                
                
                //handle negatives
                if(width<0)
                {
                    width*=-1;
                    topleftx=coords.x;
                }            
                if(height<0) 
                {
                    height*=-1;
                    toplefty=coords.y;
                }
                
                me._rect_tool.setShape({x: topleftx, y: toplefty, width: width, height: height});
                if(me._fill){
                	me._rect_tool.setFill("#" + PICTIN.current_color);
                }
            }
     }
     
     this.rect_tool_mouseupHandler = function(e){
	 	 var coords = PICTIN.get_cursor_coords(PICTIN.surface_id, e);
         if(me._rect_tool != null && PICTIN.coord_within_working_area(coords.x, coords.y)){
		 	jQuery(document).trigger("record_state");
		 }
		 
		 me._rect_tool = null;
     }

     

     
    //resizing function
    this.add_resize_anchors = function(){
        
    }
 }
 
 function Rect_anchor(surface, rect, position){
    this._surface = surface;
    this._rect = rect;
    this.shape_rect = rect.getShape();
    this._posX = 0;
    this._posY = 0;
    this._last_posX = 0;
    this._last_posY = 0;
    this._position = position;
	
    //update its position according to the rectangle's position and size. Note that if the rectangle's position is modified by
    //a matrix, you'll have to use apply_left_transform() for the anchors as well.
    Rect_anchor.prototype.update_position = function()
    {
        this.update_position_values();
        
        if(this.shape != null){
			
            //var dx = this._posX - this._last_posX;
            //var dy = this._posY - this._last_posY;
			
			var transform = this._rect.getTransform();
            
			this.shape.setShape({cx: this._posX, cy: this._posY});
			this.shape.setTransform(null);
            this.shape.applyLeftTransform(transform);
			
			
			if (DEBUG_PAT.debug_enabled) {
				if (this._position == "topleft") {
					var rectshape = this._rect.getShape();
					var rect_transform = this._rect.getTransform();
					var anchorshape = this.shape.getShape();
					var anchor_transform = this.shape.getTransform();
					
					//DEBUG_PAT.output_obj(rectshape, "rect shape");
					//DEBUG_PAT.output_obj(rect_transform, "rect transform");	
					//DEBUG_PAT.output_obj(anchorshape, "anchor shape");	
					//DEBUG_PAT.output_obj(anchor_transform, "anchor transform");	
				}
			}
			
        }
        
    }
    
    this.apply_left_transform = function(matrix){
        this.shape.applyLeftTransform(matrix);
        this._transform_buffer = this.shape.getTransform();
    }
    
    this.update_position_values = function(){
        this.shape_rect = this._rect.getShape();
        
        this._last_posX = this._posX;
        this._last_posY = this._posY;
        
        if(this._position == "top"){
            this._posX = this.shape_rect.x + this.shape_rect.width/2;
            this._posY = this.shape_rect.y;
        }
        else if(this._position == "bottom"){
            this._posX = this.shape_rect.x + this.shape_rect.width/2;
            this._posY = this.shape_rect.y + this.shape_rect.height;
        }
        else if(this._position == "left"){
            this._posX = this.shape_rect.x;
            this._posY = this.shape_rect.y + this.shape_rect.height/2;
        }
        else if(this._position == "right"){
            this._posX = this.shape_rect.x + this.shape_rect.width;
            this._posY = this.shape_rect.y + this.shape_rect.height/2;
        }
        else if(this._position == "topleft"){
            this._posX = this.shape_rect.x;
            this._posY = this.shape_rect.y;
        }
        else if(this._position == "topright"){
            this._posX = this.shape_rect.x + this.shape_rect.width;
            this._posY = this.shape_rect.y;
        }
        else if(this._position == "bottomleft"){
            this._posX = this.shape_rect.x;
            this._posY = this.shape_rect.y + this.shape_rect.height;
        }
        else if(this._position == "bottomright"){
            this._posX = this.shape_rect.x + this.shape_rect.width;
            this._posY = this.shape_rect.y + this.shape_rect.height;
        }
    }
    
    //get posX and posY initial values
    this.update_position_values();
    
    //create the anchor shape
    this.shape = this._surface.createCircle({cx: this._posX, cy: this._posY, r: PICTIN.anchor_radius}).setFill(get_inverse_color(this._rect.shape.getStroke().color.toHex())).setStroke({
		color: this._rect.shape.getStroke().color.toHex()
	});
    this.shape.applyLeftTransform(this._rect.getTransform());
    this._transform_buffer = this._rect.getTransform();
	jQuery(this.shape.getNode()).data("shape_obj", this.shape);
	
    //event handling workaround
    var me = this;
    
	//event handling
	this.anchor_mouseupHandler = function(e){
		PICTIN.rollback_manager.recordState();
	}
	
    //custom mover class
    dojo.declare("anchor_mover", dojox.gfx.Mover, {
        onMouseMove: function(event){
            var _offset_x = 0;
            var _offset_y = 0;
            var _offset_pos_x = 0;
            var _offset_pos_y = 0;
            var x = event.clientX;
            var y = event.clientY;
            
            var transform = this.shape.getTransform();
			var temp_transform = me._rect.getTransform();
			var zoom_inverse_transform = {xx: 1, yy: 1};
			if(temp_transform != null){
				zoom_inverse_transform = dojox.gfx.matrix.invert({xx: temp_transform.xx, yy: temp_transform.yy});
			}
            
			if(DEBUG_PAT.debug_enabled){
				DEBUG_PAT.output(PICTIN.zoom_level);
			}
			
            if(transform == null){
                transform = {dx: 0, dy: 0};
            }
            if(me._transform_buffer == null){
                me._transform_buffer = {dx: 0, dy: 0};
            }
            
                        
            var rect_transform = {
                dx: 0,
                dy: 0
            }
            
            if(me._position == "right"){
                _offset_x = (x - this.lastX)*zoom_inverse_transform.xx;
                y = this.lastY;
            }
            else if(me._position == "left"){
                _offset_x = -(x - this.lastX)*zoom_inverse_transform.xx;
                y = this.lastY;
                
                rect_transform.dx = -_offset_x/zoom_inverse_transform.xx;
            }
            else if(me._position == "top"){
                _offset_y = -(y - this.lastY)*zoom_inverse_transform.yy;
				////console.log("y : " + y);
				////console.log("this.lastY : " + this.lastY);
				////console.log("zoom_inverse : " + zoom_inverse);
				////console.log("offset_y : " + _offset_y);
                x = this.lastX;
                
                rect_transform.dy = -_offset_y/zoom_inverse_transform.yy;
            }
            else if(me._position == "bottom"){
                _offset_y = (y - this.lastY)*zoom_inverse_transform.yy;
                x = this.lastX;
            }
            else if(me._position == "topleft"){
                _offset_y = -(y - this.lastY)*zoom_inverse_transform.yy;
                _offset_x = -(x - this.lastX)*zoom_inverse_transform.xx;
                
                rect_transform.dx = -_offset_x/zoom_inverse_transform.xx;
                rect_transform.dy = -_offset_y/zoom_inverse_transform.yy;
            }
            else if(me._position == "topright"){
                _offset_y = -(y - this.lastY)*zoom_inverse_transform.yy;
                _offset_x = (x - this.lastX)*zoom_inverse_transform.xx;
                
                rect_transform.dy = -_offset_y/zoom_inverse_transform.yy;
            }
            else if(me._position == "bottomleft"){
                _offset_y = (y - this.lastY)*zoom_inverse_transform.yy;
                _offset_x = -(x - this.lastX)*zoom_inverse_transform.xx;

                rect_transform.dx = -_offset_x/zoom_inverse_transform.xx;
            }
            else if(me._position == "bottomright"){
                _offset_y = (y - this.lastY)*zoom_inverse_transform.yy;
                _offset_x = (x - this.lastX)*zoom_inverse_transform.xx;
            }
            
            me._transform_buffer = transform;
            
            
            this.shape.applyLeftTransform({ 
               dx: x - this.lastX, 
               dy: y - this.lastY
            });
            // store the last position of the rectangle
            
            this.lastX = x;
            this.lastY = y;
            
            
            shape = me._rect.getShape();
            var width = shape.width + _offset_x;
            var height = shape.height + _offset_y;
            var topLeftx = shape.x;
            var topLefty = shape.y;
			
			////console.log("height : " + height);
            
			var _anchor_array = jQuery(me._rect.getNode()).data("anchors");
			
            if(width < 0){
				width *= -1;
                rect_transform.dx -= width*(temp_transform.xx);
                for(var i in _anchor_array){
                    _anchor_array[i].switch_horizontal_pos();
                }
            }
            if(height < 0){
                height *= -1;
                rect_transform.dy -= height*(temp_transform.yy);
                for(var i in _anchor_array){
                    _anchor_array[i].switch_vertical_pos();
                }
            }
            
			
            me._rect.setShape({
                width: width, 
                height: height
            }).applyLeftTransform(rect_transform);
            
            
            for(var i in _anchor_array){
                if(_anchor_array[i] != me){
                    //this transform is applied when the rectangle is translated in the case of width/height changes on the left and top.
                    _anchor_array[i].apply_left_transform(rect_transform);
                    _anchor_array[i].update_position();
                }
            }
            
            
            me.update_position_values();
            dojo.stopEvent(event);
        }
        
    })
    
    this.switch_horizontal_pos = function(){
    
        if (this._position.match("left|right") != null) {
            var match = this._position.match("left|right")[0];

            if (match == "left") {
                this._position = this._position.replace("left", "right");
            }
            else 
                if (match == "right") {
                    this._position = this._position.replace("right", "left");
                }
        }
    
    }
    
    this.switch_vertical_pos = function(){
        
        if (this._position.match("top|bottom") != null) {
            var match = this._position.match("top|bottom")[0];
        
            if (match == "top") {
                this._position = this._position.replace("top", "bottom");
            }
            else 
                if (match == "bottom") {
                    this._position = this._position.replace("bottom", "top");
                }
        }
    }
	
	//events
	this.shape.connect("mouseup", this.shape ,this.anchor_mouseupHandler);
	this._moveableshape = new dojox.gfx.Moveable(this.shape, {mover: anchor_mover});
	
 }
 
 function Polyline_rect(x, y, width, height, shape){
 	var _x = x;
	var _y = y;
	var _width = width;
	var _height = height;
	this.isCustom = true;
	
    this.create_poly_rect = function(x, y, width, height){

		return PICTIN.surface.createPolyline([
	        {x: x, y: y},
	        {x: x+width, y: y},
	        {x: x+width, y: y+height},
	        {x: x, y: y+height},
			{x: x, y: y}
	    ]).setStroke({color: "#"+PICTIN.current_color, width: PICTIN.current_linethickness});
	}
	
	this.get_dojo_shape = function(){
		return poly_rect;
	}
	
    this.setShape = function(args){
		if (this.shape != null) {
			var points = this.shape.getShape().points;
			var polyrect_width = points[1].x - points[0].x;
			var polyrect_height = points[3].y - points[0].y;
			
			
			
			if (args.x != null) {
				points[0].x = args.x;
				points[3].x = args.x;
				points[4].x = args.x;
				polyrect_width = points[1].x - points[0].x;
			}
			if (args.y != null) {
				points[0].y = args.y;
				points[1].y = args.y;
				points[4].y = args.y;
				polyrect_height = points[3].y - points[0].y;
			}
			if (args.width != null) {
				points[1].x += args.width - polyrect_width;
				points[2].x += args.width - polyrect_width;
			}
			if (args.height != null) {
				points[2].y += args.height - polyrect_height;
				points[3].y += args.height - polyrect_height;
			}
			

			this.shape.setShape(points);
		}
		else{
			this.shape = this.create_poly_rect(args.x, args.y, args.width, args.height);
			
		}
        return me;
    }
    
    this.setFill = function(args){
    	if(this.shape != null){
    		this.shape.setFill(args);
    	}
    }
	
	this.removeShape = function(){
		this.shape.removeShape();
	}
	
	this.getShape = function(){
		var points = this.shape.getShape().points;
        var shape = {
            x: points[0].x,
            y: points[0].y,
            width: points[1].x - points[0].x,
            height: points[3].y - points[0].y
        }
        
        return shape;
	}
	
	this.getNode = function(){
		return this.shape.getNode();
	}
    
    this.connect = function(event, parent_obj, callback){
        return this.shape.connect(event, parent_obj, callback);
    }
    
    this.applyLeftTransform = function(matrix){
        this.shape.applyLeftTransform(matrix);
        return me;
    }
	
	this.applyRightTransform = function(matrix){
		this.shape.applyRightTransform(matrix);
		return me;
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
	
	//constructor
	if (typeof shape == 'undefined') {
		DEBUG_PAT.output("creating poly rect");
		this.shape = this.create_poly_rect(_x, _y, _width, _height);
		
	}
	else{
		DEBUG_PAT.output("copying poly rect");
		this.shape = shape;
		//DEBUG_PAT.output_obj(shape.getShape().points, "testing rect obj in rect constructor");
	}
    var me = this;
 }
 
 //event handling
 function rect_add_jQuery_properties(shape){
 	var shape_node = shape.getNode();
	
	//add events
	var handler_array = new Array();
	//adds references to event handlers. [eventType, handler, params]
	handler_array.push(["mousedown", rect_mousedownHandler, {}]);
	handler_array.push(["mouseup", rect_mouseupHandler, {}]);
	//handler_array.push(["custom_function", make_shape_draggable]);
	handler_array.push(["moveable_event", rectangle_mover])
	jQuery(shape_node).data("pictin_events", handler_array);
	
	//add some properties
	jQuery(shape_node).data("isSelected", false);
	jQuery(shape_node).data("custom_shape_class", "polyrect");
 }
 
function rect_mousedownHandler(e){
	 if (dijit.byId("select").attr("checked") == true) {
	 	var shape = jQuery(this).data("shape_obj");
		var _jQuery_obj = jQuery(shape.getNode());
		
		PICTIN.shape_manager.select_shape(shape.getNode(), add_rect_anchors, {obj: shape});
	}
}
 
 function rect_mouseupHandler(e){
	if (TOOL_RECT.allow_save == true) {
		TOOL_RECT.allow_save = false;
		jQuery(document).trigger("record_state");
	}
 }
     
//custom mover class
dojo.declare("rectangle_mover", dojox.gfx.Mover, {
    onMouseMove: function(event){
        if(dijit.byId("select").attr("checked") == true){
            // move the rectangle by applying a translation
            var x = event.clientX;
            var y = event.clientY;
            
            var transform = this.shape.getTransform();
            
            if(transform == null){
                transform = {dx: 0, dy: 0};
            }
            
            var new_transform = {
                dx: x-this.lastX,
                dy: y-this.lastY
            }
            
            this.shape.applyLeftTransform(new_transform);
            // store the last position of the rectangle
            
            this.lastX = x;
            this.lastY = y;
            
			var anchor_array = jQuery(this.shape.getNode()).data("anchors");
            for(var i in anchor_array){
            	anchor_array[i].apply_left_transform(new_transform);
            }
			
			TOOL_RECT.allow_save = true;
        }
        dojo.stopEvent(event);
    }
})

//custom anchors adder
function add_rect_anchors(params){
	DEBUG_PAT.output("adding rect anchors...");
	//DEBUG_PAT.output_obj(params.obj.poly_rect.getShape().points, "testing rect obj in add anchors");
	var _jQuery_obj = jQuery(params.obj.getNode());
	
	var _anchor_array = new Array();
	_anchor_array.push(new Rect_anchor(PICTIN.surface, params.obj, "right"));
	_anchor_array.push(new Rect_anchor(PICTIN.surface, params.obj, "left"));
	_anchor_array.push(new Rect_anchor(PICTIN.surface, params.obj, "top"));
	_anchor_array.push(new Rect_anchor(PICTIN.surface, params.obj, "bottom"));
	_anchor_array.push(new Rect_anchor(PICTIN.surface, params.obj, "topleft"));
	_anchor_array.push(new Rect_anchor(PICTIN.surface, params.obj, "topright"));
	_anchor_array.push(new Rect_anchor(PICTIN.surface, params.obj, "bottomleft"));
	_anchor_array.push(new Rect_anchor(PICTIN.surface, params.obj, "bottomright"));
	
	_jQuery_obj.data("anchors", _anchor_array);
}

