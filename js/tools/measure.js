/**
 * @author patricepaquette
 */
 MEASURE = {};
 PICTIN.measure_tool = new function(){
 	var event_handler = null;
	this.name = "measure";
	this.step = 0;
	var me = this;
	MEASURE.segments = new Array();
	//var function_step_order = [zoom_area, measure];
	
 	this.activate = function(){
		
		this.measure();
		//this.select_measurement_circle_area_dialog();
		return this;
	}
	
	this.stop = function(){
		jQuery(document).unbind("segment_drawn");
		jQuery(document).unbind("mousemove");
		jQuery(document).unbind("mouseup.marquee");
		PICTIN.marquee = null;
		PICTIN.tool_segment.stop();
	}
	
	this.advance_step = function(){
		function_step_order[this.step];
		this.step++;
	}
 
	this.select_measurement_circle_area_dialog = function(){
		var dialog = jQuery("#measurement-select-area-dialog").dialog({
			resizable: false,
			title: 'Measurement',
			width: 358,
			autoOpen: false,
			buttons: {
				"Ok": function(){
					start_zoom_area(me.measure, me.transfer_segments, {});
					jQuery("#measurement-select-area-dialog").dialog("close");
					return false;
				}
			},
			close: function(){
				jQuery("measurement-select-area-dialog").hide()
			},
			zIndex:10
		})
	
		jQuery("#measurement-select-area-dialog").show();
		dialog.dialog("open");
	 }
	 
	 this.measure = function(){
		 event_handler = jQuery(document).bind("segment_drawn", function(e, segment_shape){
			jQuery(segment_shape.getNode()).data("isMeasurement", true);
			jQuery(segment_shape.getNode()).data("custom_shape_class", "measure");
			me.add_measurement(e, segment_shape)
			
			MEASURE.segments.push(segment_shape);
		});
		jQuery(document).bind("segment_anchor_move", me.add_measurement);
		jQuery(document).bind("segment_move", me.add_measurement);

		//SEGMENT.record_state = false;
		PICTIN.tool_segment.activate(null);
	 }
	 
	 this.transfer_segments = function(args){
		
	 	PICTIN.surface = PICTIN.surface_buffer;
		PICTIN.surface_id = "surface";
		var scaling_factor = args.scaling_factor;
		
		
		for(var i in MEASURE.segments){
			
			MEASURE.segments[i].setShape({
				x1: PICTIN.marquee[0].getShape().x + MEASURE.segments[i].getShape().x1 * scaling_factor,
				y1: PICTIN.marquee[0].getShape().y + MEASURE.segments[i].getShape().y1 * scaling_factor,
				x2: PICTIN.marquee[0].getShape().x + MEASURE.segments[i].getShape().x2 * scaling_factor,
				y2: PICTIN.marquee[0].getShape().y + MEASURE.segments[i].getShape().y2 * scaling_factor
			});
			
			PICTIN.surface.add(MEASURE.segments[i]);
			PICTIN.shape_manager.add_shape(MEASURE.segments[i]);
			me.add_measurement(null, MEASURE.segments[i]);
		}
		
		//remove marquee 
		if(PICTIN.marquee)
		{
			PICTIN.surface.remove(PICTIN.marquee[0]);
			PICTIN.surface.remove(PICTIN.marquee[1]);
		}
		
		PICTIN.rollback_manager.recordState();
		
		MEASURE.segments = new Array();
		
		jQuery(document).unbind("mouseup.marquee");
		jQuery(document).unbind("segment_drawn");
		start_zoom_area(me.measure, me.transfer_segments, {});
	 }

	 this.add_measurement = function(e, segment_shape){
		if(PICTIN.measurement_ratio && (jQuery(segment_shape.getNode()).data("custom_shape_class") == "measure")){
			
			var segment_length = get_segment_length(segment_shape.getShape().x1, segment_shape.getShape().y1, segment_shape.getShape().x2, segment_shape.getShape().y2, ZOOM_AREA.scaling_factor, ZOOM_AREA.scaling_factor);
			var _x = segment_shape.getShape().x2 - (segment_shape.getShape().x2 - segment_shape.getShape().x1)/2;
			var _y = segment_shape.getShape().y2 - (segment_shape.getShape().y2 - segment_shape.getShape().y1)/2;
			var denominator = (segment_shape.getShape().y2 - segment_shape.getShape().y1);
			var numerator = (segment_shape.getShape().x2 - segment_shape.getShape().x1);
			var slope = (denominator != 0)?numerator/denominator:null;
			var angle = Math.atan(slope);
			var hyp = 20;
			
			//DEBUG_PAT.output("angle from slope : " + angle * (180/Math.PI), true);
			//DEBUG_PAT.output("slope : " + slope, true);	
			
			if(slope == null){
				_y -= hyp;
			}
			else if(slope < 0){
				angle = -angle;
				_x += (Math.cos(angle)*hyp);
				_y += (Math.sin(angle)*hyp);
			}
			else if(slope > 0){
				_x += (Math.cos(angle)*hyp);
				_y -= Math.sin(angle)*hyp;
			}
			else{
				_x += hyp;
			}
			
			//DEBUG_PAT.output("angle : " + angle * (180/Math.PI), true);
			
			
			if (jQuery(segment_shape.getNode()).data("child_shapes") == null || typeof jQuery(segment_shape.getNode()).data("child_shapes")["measurement"] == 'undefined' ) { //text shape does not already exist.
				var text_shape = PICTIN.surface.createText({
					x: _x,
					y: _y,
					text: (segment_length * PICTIN.measurement_ratio).numberFormat("0 mm")
				}).setStroke({color: "#" + PICTIN.current_color});
				text_shape.applyLeftTransform(segment_shape.getTransform());
				
				jQuery(segment_shape.getNode()).data("child_shapes", {"measurement": text_shape});
				
				if((PICTIN.surface == PICTIN.surface_buffer) || (PICTIN.surface_buffer == null)){
					DEBUG_PAT.output("added text_shape to shape_manager", true);
					//PICTIN.shape_manager.add_shape(text_shape);
					//PICTIN.rollback_manager.recordState();
				}
	
			}
			else{
				var measurement = jQuery(segment_shape.getNode()).data("child_shapes")["measurement"];
				measurement.setShape({
					x: _x,
					y: _y,
					text: (segment_length * PICTIN.measurement_ratio).numberFormat("0 mm")
				})
				
				measurement.setTransform(null);
				measurement.applyLeftTransform(segment_shape.getTransform());
				if(PICTIN.mirrored == true){
					var real_coords = dojox.gfx.matrix.multiplyPoint(measurement.getTransform(), measurement.getShape().x, measurement.getShape().y);
		
					measurement.applyLeftTransform({dx: -(real_coords.x - measurement.getTextWidth()/2), dy: 0});
					measurement.applyLeftTransform({xx: -1, yy: 1});
					measurement.applyLeftTransform({dx: (real_coords.x - measurement.getTextWidth()/2), dy: 0});
				}
			}
		}
	 }
 }

