/**
 * @author patricepaquette
 */

 PICTIN.shape_manager = new function(){
 	this.shape_array = new Array();
	this.moveable_events_array = new Array();
	this.selected_shape = null;
	var me = this;
	
 	this.make_selectable = function(){
		DEBUG_PAT.output_obj(this.shape_array, "shape array", true);
		
		//remove all events
		jQuery.each(this.moveable_events_array, function(index, value){
			value.destroy();
		})
		this.moveable_events_array = new Array();
		
		jQuery.each(this.shape_array, function(index, shape){
			var _shape = (shape.isCustom)?shape.shape:shape;
			var event_array = jQuery(_shape.getNode()).data("pictin_events");
			var shape_obj = _shape;
			jQuery(shape_obj.getNode()).unbind();
			
			DEBUG_PAT.output_obj(event_array, "event_array");
			var fill = _shape.getFill();
			if (fill == null) {
				_shape.setFill([0, 0, 0, 0]);
			}
			
			for (var i in event_array) {
				DEBUG_PAT.output("event type : " + event_array[i][0], true);
				if (event_array[i][0] == "custom_function") {
					event_array[i][1]({node: shape_obj.getNode()});
				}
				else if(event_array[i][0] == "moveable_event"){

					DEBUG_PAT.output("adding moveable event", true);
					me.moveable_events_array.push(new dojox.gfx.Moveable(shape_obj, {
						mover: event_array[i][1]
					}))
					
				}
				else {
					jQuery(shape_obj.getNode()).bind(event_array[i][0], event_array[i][2], event_array[i][1]);
				}
			}
		})
		
		DEBUG_PAT.output("moveable events array length : " + this.moveable_events_array.length, true);
	}
	
	this.make_unselectable = function(){
		//getting rid of events
		DEBUG_PAT.output("moveable events array length : " + me.moveable_events_array.length);
		for(var i in me.moveable_events_array){
			//DEBUG_PAT.output_obj(me.moveable_events_array[i], "moveable array " + i);
			me.moveable_events_array[i].destroy();
		}
		me.moveable_events_array = new Array();
		
		jQuery(this).unbind();
			
		//get rid of all events. Need special code for dojo events.
		jQuery.each(this.shape_array, function(index, shape){
			var _shape = (shape.isCustom)?shape.shape:shape;
			//getting rid of anchors
			var _anchor_array = jQuery(_shape.getNode()).data("anchors");
			for(var i in _anchor_array){
				_anchor_array[i].shape.removeShape();
				_anchor_array[i] = null;
			}
			jQuery(_shape.getNode()).removeData("anchors");
			
			//unselect the node.
			jQuery(_shape.getNode()).data("isSelected", false);
		})
	}
	
	this.select_shape = function(shape_node, custom_anchor_func, params){
		var _jQuery_obj = jQuery(shape_node);
		DEBUG_PAT.output("shape selected");

	 	if (_jQuery_obj.data("isSelected") == false) {
			var shape_obj = _jQuery_obj.data("shape_obj");
			
			this.selected_shape = shape_obj;
			shape_obj.moveToFront();
				
			//unselect last selected shape
			if(PICTIN.shape_buffer){
				this.unselect_shape(PICTIN.shape_buffer);
			}
			
			//add custom anchors
			if(custom_anchor_func){
				DEBUG_PAT.output("custom_anchor_func available");
				custom_anchor_func(params);
			}
			_jQuery_obj.data("isSelected", true);
			
			PICTIN.shape_buffer = shape_node;
	 	}
	}
	
	this.unselect_shape = function(shape_node){
		if (jQuery(shape_node).data("isSelected", true)) {
			var _jQuery_obj = jQuery(shape_node);
			
			_jQuery_obj.data("isSelected", false);
			
			var _anchor_array = _jQuery_obj.data("anchors");
			for (var i in _anchor_array) {
				_anchor_array[i].shape.removeShape();
				_anchor_array[i] = null;
			}
			_jQuery_obj.removeData("anchors");
		}
	}
	
	this.delete_shape = function(shape_node){
		var shapes_to_remove = new Array();
		
		for(var i in this.shape_array){
			if(this.shape_array[i].getNode() == shape_node){
				//removing child shapes
				var child_shapes = jQuery(this.shape_array[i].getNode()).data("child_shapes");
				this.shape_array[i].removeShape();
				this.shape_array.splice(i, 1);
				for(var j in child_shapes){
					child_shapes[j].removeShape();
					shapes_to_remove.push(child_shapes[j]);
				}
				break;
			}
		}
		
		for(var i in this.shape_array){
			for(var j in shapes_to_remove){
				if(this.shape_array[i] == shapes_to_remove[j]){
					this.shape_array.splice(i, 1);
					i--;
				}
			}
		}
		
		PICTIN.rollback_manager.recordState();
	}
	
	this.reset_properties = function(){
		jQuery("#" + PICTIN.surface_id + " > svg *").each(function(index){
			jQuery(this).data("isSelected", false);
		})
	}
	
	this.add_shape = function(shape){
		jQuery(shape.getNode()).data("shape_obj", shape);
		//DEBUG_PAT.output_obj(shape, "add_shape shape", true);
		//var UID = jQuery(shape.getNode()).getUID();
		var addShape = true;
		for(var i in this.shape_array){
			if(this.shape_array[i] == shape){
				addShape = false;
			}
		}
		
		if(addShape) this.shape_array.push(shape);
		
		return shape;
	}
	
	this.refresh_anchor_position = function(){
		if (this.selected_shape != null && jQuery(this.selected_shape.getNode()).data("anchors")) {
			jQuery.each(jQuery(this.selected_shape.getNode()).data("anchors"), function(index, value){
				value.update_position();
			})
		}
	}
	
	this.add_shape_event_handlers = function(){
		//event handler for delete key
		jQuery(document).keydown(function(e){
			if(e.which == 46){
				if(PICTIN.shape_manager.selected_shape != null){
					var shape_buffer = PICTIN.shape_manager.selected_shape;
					PICTIN.shape_manager.unselect_shape(shape_buffer.getNode());
					PICTIN.shape_manager.delete_shape(shape_buffer.getNode());
				}
			}
		});
	}
	
	
	//constructor
	this.add_shape_event_handlers();
}
 
