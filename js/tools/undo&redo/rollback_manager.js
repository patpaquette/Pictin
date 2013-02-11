/**
 * @author patricepaquette
 */

ROLLBACK = {};
PICTIN.rollback_manager = new function rollback_manager(){
	this.state_list = new Array();
	this.state_index = 0;
	this.max_states = 20;
	this.allow_save = true;
	var me = this;
	
	jQuery(document).bind("record_state", function(e){
		me.recordState();
	});

	this.disable = function()
	{
		me.allow_save = false;
	};

	this.enable = function()
	{
		me.allow_save = true;
	};
	
	this.reinitialize = function(){
		this.state_list = new Array();
		this.state_index = 0;
		this.recordState();
	};
	
	this.removeLastSave = function(){
		if(this.state_list.length > 0){
			this.state_list.splice(this.state_list.length-1, 1);
			if(this.state_index == this.state_list.length) this.state_index -= 1;
		}
	};
	
	this.undo = function(){
		if(this.state_index > 0){
			this.state_index -= 1;
			this.rollback();
		}
	};
	
	this.redo = function(){
		if(this.state_index < this.state_list.length-1){
			this.state_index += 1;
			this.rollback();
		}
	};
	
	this.recordState = function(){
		if(me.allow_save)
		{
			DEBUG_PAT.output("Recording start.",true);
			DEBUG_PAT.output("Current state : " + me.state_index + " List length : " + me.state_list.length,true);
			if(me.state_index < me.state_list.length - 1) me.state_list.splice(me.state_index + 1, me.state_list.length - me.state_index - 1);
			if(me.state_list.length == me.max_states) me.state_list.splice(0, 1);
		
			
			
			//experimental
			var temp_shape_array = new Array();
			
			
			jQuery.each(PICTIN.shape_manager.shape_array, function(index, value){
				//var index = temp_shape_array.push(jQuery.extend(true, {}, value));
				var dojo_shape = (value.isCustom)?value.shape:value;
				var custom_class = (jQuery(value.getNode()).data("custom_shape_class") != null)?jQuery(value.getNode()).data("custom_shape_class"):"";
				var events = jQuery(value.getNode()).data("pictin_events");
				//var child_shapes = jQuery(value.getNode()).data("child_shapes");
				var isSelected = false;
				var custom_values = jQuery(value.getNode()).data("custom_values");
				var attributes_array = {};

				if(dojo_shape.getStroke)
					attributes_array['setStroke'] = dojo_shape.getStroke();
				if(dojo_shape.getFill)
					attributes_array['setFill'] = dojo_shape.getFill();
				if(dojo_shape.getFont)
					attributes_array['setFont'] = dojo_shape.getFont();
				if(dojo_shape.getTransform)
					attributes_array['setTransform'] = dojo_shape.getTransform();
				if(dojo_shape.getShape)
					attributes_array['setShape'] = dojo_shape.getShape();
				
				DEBUG_PAT.output_obj(attributes_array, "attributes_array when recording state");
				var UID = jQuery(value.getNode()).getUID();
				var rollback_function = jQuery(value.getNode()).data("rollback_function");
				var angle_obtuse = (value.obtuse != null)?value.obtuse:null;
				temp_shape_array.push({	UID: UID, 
										attr: attributes_array, 
										custom_class: custom_class, 
										events: events, 
										//child_shapes: child_shapes,
										isSelected: isSelected,
										custom_values: custom_values,
										rollback_function: rollback_function,
										angle_obtuse: angle_obtuse,
										textColor: dojo_shape.getStroke() ? dojo_shape.getStroke().color : null});
				
			})
			DEBUG_PAT.output("Canvas element next line : ");
			DEBUG_PAT.output(PICTIN.canvas);
			
			//DEBUG_PAT.output_obj(temp_shape_array, "temp_shape_array", true);
			DEBUG_PAT.output(PICTIN.surface,true);
		
			
			
			
			me.state_list.push({
				canvas_clone: PICTIN.clone_canvas(PICTIN.canvas),
				shape_array: temp_shape_array,
				current_rotation: PICTIN.current_rotation,
				current_zoom_level: PICTIN.zoom_level,
				contrabright_data: jQuery.extend(true, {}, PICTIN.contrabright_data),
				mirrored: PICTIN.mirrored
			});
			
			me.state_index = me.state_list.length - 1;
			
			DEBUG_PAT.output("recording state");
			DEBUG_PAT.output_obj(me.state_list, "state list");
			DEBUG_PAT.output("Current state : " + me.state_index + " List length : " + me.state_list.length);
			
			DEBUG_PAT.output("Canvas rotation : " + PICTIN.current_rotation);
			DEBUG_PAT.output("recording state END");
		}
	}
	
	this.rollback = function(){
		me.disable();
		DEBUG_PAT.output("ROLLING BACK NOW");
		DEBUG_PAT.output("current rotation in rollback: " + this.state_list[this.state_index].current_rotation);
		
		var bgcanvas = jQuery('#background')[0];
		var context = bgcanvas.getContext('2d');
		var surface = (PICTIN.surface_buffer !== null)?PICTIN.surface_buffer:PICTIN.surface;
		var rotation_deg = this.state_list[this.state_index].current_rotation - PICTIN.current_rotation;
		DEBUG_PAT.output("rotation_deg : " + rotation_deg);
		PICTIN.current_rotation = this.state_list[this.state_index].current_rotation;
		//PICTIN.rotate(rotation_deg%360);
		DEBUG_PAT.output("current rotation : " + PICTIN.current_rotation);
		
		PICTIN.contrabright_data = this.state_list[this.state_index].contrabright_data;
		PICTIN.set_zoom_level(this.state_list[this.state_index].current_zoom_level);
		PICTIN.mirrored = this.state_list[this.state_index].mirrored;
		context.drawImage(this.state_list[this.state_index].canvas_clone,0,0,surface.getDimensions().width, surface.getDimensions().height);
		
		DEBUG_PAT.output("state_index : " + this.state_index);
		DEBUG_PAT.output_obj(this.state_list, "state list");
		
		
		//experimental
		var temp_attr_array = this.state_list[this.state_index].shape_array;
		PICTIN.surface.clear();
		PICTIN.shape_manager.shape_array = [];
		copy_shape_array_attributes(PICTIN.shape_manager.shape_array, temp_attr_array);
		
		//rollback functions
		for(var i in PICTIN.shape_manager.shape_array){
			var rollback_function = jQuery(PICTIN.shape_manager.shape_array[i].getNode()).data("rollback_function");
			
			if(rollback_function!== null){
				DEBUG_PAT.output("rollback_function isn't null", true);
				rollback_function(PICTIN.shape_manager.shape_array[i]);
			}
		}
		//PICTIN.shape_manager.refresh_anchor_position();
		if (dijit.byId("select").attr("checked") === true) {
			PICTIN.shape_manager.make_selectable();
		}
		me.enable();
	};
}();


//DOJOX GFX utility functions



//copies all attribute from clone array to real array
//the source must be a clone of the target
function copy_shape_array_attributes(target_array, attr_container_array){
	this._target_array = target_array;
	this._attr_container_array = attr_container_array;
	//this._shapes_to_keep = new Array(); //we keep track of the shapes that are still present after the undo
	var me = this;
	
	DEBUG_PAT.output_obj(this._attr_container_array, "this.attr_container_array", true);
	DEBUG_PAT.output("length : " + this._attr_container_array.length, true);
	jQuery.each(this._attr_container_array, function(index1, attr_container){ //looping through the array containing attribute containers
		var found_shape = false;
		DEBUG_PAT.output("in first loop");
	
		if(!found_shape){ //if the shape has been deleted in the present state, we have to recreate it.
			var attributes = attr_container.attr;
			var shape_type = attributes['setShape'].type;
			var created_shape = null;
			
			switch(shape_type){
				case "rect" : 
					created_shape = PICTIN.surface.createRect();
				break;
				case "circle" :;
					created_shape = PICTIN.surface.createCircle();
				break;
				case "ellipse":;
					created_shape = PICTIN.surface.createEllipse();
				break;
				case "line":;
					created_shape = PICTIN.surface.createLine();
				break;
				case "polyline":;
					created_shape = PICTIN.surface.createPolyline();
				break;
				case "path":;
					created_shape = PICTIN.surface.createPath();
				break;
				case "image":;
					created_shape = PICTIN.surface.createImage();
				break;
				case "text":;
					created_shape = PICTIN.surface.createText();
				break;
				case "textpath":;
					created_shape = PICTIN.surface.createTextpath();
				break;
			}
			
			copy_attributes_to_shape(created_shape, attributes);
			
			//DEBUG_PAT.output_obj(PICTIN.shape_manager.shape_array, "shape array number 2", true);
			var _jQuery_obj = jQuery(created_shape.getNode());
			_jQuery_obj.data("pictin_events", attr_container.events);
			//_jQuery_obj.data("child_shapes", attr_container.child_shapes);
			_jQuery_obj.data("custom_shape_class", attr_container.custom_class);
			_jQuery_obj.data("isSelected", false);
			_jQuery_obj.data("UID", attr_container.UID);
			_jQuery_obj.data("rollback_function", attr_container.rollback_function);
			_jQuery_obj.data("custom_values", attr_container.custom_values);
			
			//DEBUG_PAT.output("shape array length : " + PICTIN.shape_manager.shape_array.length, true);
			switch(attr_container.custom_class){
				case "polyrect" : PICTIN.shape_manager.add_shape(new Polyline_rect(0, 0, 0, 0, created_shape));
				break;
				case "line" : PICTIN.shape_manager.add_shape(new Line(created_shape));
				break;
				case "angle" :
					PICTIN.shape_manager.add_shape(new Angle(0, 0, 0, attr_container.angle_obtuse, created_shape, attr_container.textColor));
					
				break;
				case "ellipse" :
					PICTIN.shape_manager.add_shape(new Ellipse(attr_container.custom_values, created_shape));
				break;
				case "measure" :
				    PICTIN.shape_manager.add_shape(created_shape);
					PICTIN.measure_tool.add_measurement(null, created_shape);
				break;
				case "arrow" :
					PICTIN.shape_manager.add_shape(created_shape);
					new Segment_arrowhead(created_shape, 15, 10);
				break;
				default: PICTIN.shape_manager.add_shape(created_shape);
					DEBUG_PAT.output("In default created shape", true);
					
			}
			
			
		}
	})
}

function copy_attributes_to_shape(shape, attr_array){
	var current_shape = shape;
	DEBUG_PAT.output_obj(attr_array, "attr array inside copy_attributes_to_shape");
	jQuery.each(attr_array, function(key, attribute){ //looking through the attributes for the shape
		DEBUG_PAT.output("key : " + key);
		switch(key){
			case "setStroke" : current_shape.setStroke(attribute);
			break;
			case "setFill" : current_shape.setFill(attribute);
			break;
			case "setFont" : current_shape.setFont(attribute);
			break;
			case "setTransform" : current_shape.setTransform(attribute);
			break;
			case "setShape" : current_shape.setShape(attribute);
			break;
		}
	})
}
function copy_shape_attributes(target, source){
	DEBUG_PAT.output("copying shape attributes...");
	
	var shape_function_list = new Array([['getStroke', 'setStroke'], ['getFill', 'setFill'], ['getFont', 'setFont'], ['getTransform', 'setTransform'], ['getShape', 'setShape']]);
	
	jQuery.each(shape_function_list, function(index, value){
		var attr_getter = value[0];
		var attr_setter = value[1];
		
		if(UTILS.isdefined(source, attr_getter)){
			eval("target." + attr_setter + "(source." + attr_getter + "());");
		}
		
		return true;
	})
	return false;	
}


//creates dojox.gfx shapes from svg definitions
function create_shapes_from_svg(){
	DEBUG_PAT.output("in create_shapes_from_svg");
	PICTIN.shape_manager.shape_array = new Array();
	
	
	jQuery("#" + PICTIN.surface_id + " > svg").find('path, text, textPath, g, rect, circle, polygon, polyline, ellipse, line').each(function(index){
		DEBUG_PAT.output("found element");
		var shape = null;
		switch(this.tagName.toLowerCase()){
			case dojox.gfx.Rect.nodeType:
				shape=new dojox.gfx.Rect(this);
				_2(shape, dojox.gfx.defaultRect)

			break;
			case dojox.gfx.Ellipse.nodeType:
				shape=new dojox.gfx.Ellipse(this);
				_3(shape, dojox.gfx.defaultEllipse);
	
			break;
			case dojox.gfx.Polyline.nodeType:
				shape=new dojox.gfx.Polyline(this);
				_3(shape, dojox.gfx.defaultPolyline);

			break;
			case dojox.gfx.Path.nodeType:
				shape=new dojox.gfx.Path(this);
				_3(shape, dojox.gfx.defaultPath);
			
			break;
			case dojox.gfx.Circle.nodeType:
				shape=new dojox.gfx.Circle(this);
				_3(shape, dojox.gfx.defaultCircle);

			break;
			case dojox.gfx.Line.nodeType:
				shape=new dojox.gfx.Line(this)
				_3(shape, dojox.gfx.defaultLine);
			
			break;
			case dojox.gfx.Image.nodeType:
				shape=new dojox.gfx.Image(this);
				_3(shape, dojox.gfx.defaultImage);
			
			break;
			case dojox.gfx.Text.nodeType:
				var t=this.getElementsByTagName("textPath");
				if(t&&t.length){
					shape=new dojox.gfx.TextPath(this);
	
				}else{
					shape=new dojox.gfx.Text(this);
				}
			break;
			default:
		}
		if(!(shape instanceof dojox.gfx.Image)){
			_7(shape);
			_8(shape);
		}
		_9(shape);
		if(shape != null){
			if(jQuery(this).data("custom_shape_class") == "")
			jQuery(this).removeData("shape_obj");
			jQuery(this).data("shape_obj", shape);
			
			//DEBUG_PAT.output_obj(shape.poly_rect.getShape(), "poly_rect shape after clone");
			PICTIN.shape_manager.add_shape(shape);
		}
	})
}

var _10=function(_12,_13){
	var _14=dojo.clone(_12);
	_14.colors=[];
	for(var i=0;i<_13.childNodes.length;++i){
		_14.colors.push({offset:_13.childNodes[i].getAttribute("offset"),color:new dojo.Color(_13.childNodes[i].getAttribute("stop-color"))});
	}
	return _14;
};

var _9=function(_1a){
	var _1b=_1a.rawNode.getAttribute("transform");
	if(_1b.match(/^matrix\(.+\)$/)){
		var t=_1b.slice(7,-1).split(",");
		_1a.matrix=dojox.gfx.matrix.normalize({xx:parseFloat(t[0]),xy:parseFloat(t[2]),yx:parseFloat(t[1]),yy:parseFloat(t[3]),dx:parseFloat(t[4]),dy:parseFloat(t[5])});
	}else{
		_1a.matrix=null;
	}
};

var _8=function(_15){
	var _16=_15.rawNode,_17=_16.getAttribute("stroke");
	if(_17==null||_17=="none"){
		_15.strokeStyle=null;
		return;
	}
	var _18=_15.strokeStyle=dojo.clone(dojox.gfx.defaultStroke);
	var _19=new dojo.Color(_17);
	if(_19){
		_18.color=_19;
		_18.color.a=_16.getAttribute("stroke-opacity");
		_18.width=_16.getAttribute("stroke-width");
		_18.cap=_16.getAttribute("stroke-linecap");
		_18.join=_16.getAttribute("stroke-linejoin");
		if(_18.join=="miter"){
		_18.join=_16.getAttribute("stroke-miterlimit");
		}
		_18.style=_16.getAttribute("dojoGfxStrokeStyle");
	}
};

var _7=function(_c){
	var _d=_c.rawNode.getAttribute("fill");
	if(_d=="none"){
		_c.fillStyle=null;
		return;
	}
	var _e=null,_f=dojox.gfx.svg.getRef(_d);
	if(_f){
		switch(_f.tagName.toLowerCase()){
			case "lineargradient":
			_e=_10(dojox.gfx.defaultLinearGradient,_f);
			dojo.forEach(["x1","y1","x2","y2"],function(x){
				_e[x]=_f.getAttribute(x);
			});
			break;
			case "radialgradient":
			_e=_10(dojox.gfx.defaultRadialGradient,_f);
			dojo.forEach(["cx","cy","r"],function(x){
				_e[x]=_f.getAttribute(x);
			});
			_e.cx=_f.getAttribute("cx");
			_e.cy=_f.getAttribute("cy");
			_e.r=_f.getAttribute("r");
			break;
			case "pattern":
			_e=dojo.lang.shallowCopy(dojox.gfx.defaultPattern,true);
			dojo.forEach(["x","y","width","height"],function(x){
			_e[x]=_f.getAttribute(x);
			});
			_e.src=_f.firstChild.getAttributeNS(dojox.gfx.svg.xmlns.xlink,"href");
			break;
		}
	}else{
		_e=new dojo.Color(_d);
		var _11=_c.rawNode.getAttribute("fill-opacity");
		if(_11!=null){
			_e.a=_11;
		}
	}
	_c.fillStyle=_e;
};
var _6=function(_1c){
	var _1d=_1c.fontStyle=dojo.clone(dojox.gfx.defaultFont),r=_1c.rawNode;
	_1d.style=r.getAttribute("font-style");
	_1d.variant=r.getAttribute("font-variant");
	_1d.weight=r.getAttribute("font-weight");
	_1d.size=r.getAttribute("font-size");
	_1d.family=r.getAttribute("font-family");
};

var _5=function(_21){
	var _22=_21.shape=dojo.clone(dojox.gfx.defaultText),r=_21.rawNode;
	_22.x=r.getAttribute("x");
	_22.y=r.getAttribute("y");
	_22.align=r.getAttribute("text-anchor");
	_22.decoration=r.getAttribute("text-decoration");
	_22.rotated=parseFloat(r.getAttribute("rotate"))!=0;
	_22.kerning=r.getAttribute("kerning")=="auto";
	_22.text=r.firstChild.nodeValue;
};

var _4=function(_23){
	var _24=_23.shape=dojo.clone(dojox.gfx.defaultTextPath),r=_23.rawNode;
	_24.align=r.getAttribute("text-anchor");
	_24.decoration=r.getAttribute("text-decoration");
	_24.rotated=parseFloat(r.getAttribute("rotate"))!=0;
	_24.kerning=r.getAttribute("kerning")=="auto";
	_24.text=r.firstChild.nodeValue;
};

var _3 = function(_1e, def){
	var _1f = _1e.shape = dojo.clone(def), r = _1e.rawNode;
	for (var i in _1f) {
		_1f[i] = r.getAttribute(i);
	}	
}
var _2=function(_20){
	_3(_20,dojox.gfx.defaultRect);
	_20.shape.r=Math.min(_20.rawNode.getAttribute("rx"),_20.rawNode.getAttribute("ry"));
}

