/**
 * @author patricepaquette
 */
CALIBRATION = {};
CALIBRATION.scale = null;
CALIBRATION.scrollTop_buffer = null;
CALIBRATION.scale_center_rel = null;
CALIBRATION.scale_x = null;
CALIBRATION.scale_y = null;
CALIBRATION.calibrator_length = null;
CALIBRATION.calibrator_height = 20;

CALIBRATION.getMeasurement = function(segmentLength){
	return segmentLength*PICTIN.measurement_ratio;
}

 PICTIN.calibrate_tool = new function(){
 	this.transfer_index = null;
	this.activated = false;	
	CALIBRATION.calibrator_drawn = false;
	CALIBRATION.calibrator_length = null;
	CALIBRATION.calibrator = null;
	
	
	this.activate = function(){
		if (this.activated == false) {
			this.activated = true;
			select_circle_area_dialog();
			PICTIN.rollback_manager.disable();
		}
		
		return this;
	}
	
	this.stop = function(){
		PICTIN.marquee = null;
		this.activated = false;
		PICTIN.rollback_manager.enable();
		jQuery(document).unbind(".calibration");
	} 	
	
	this.reinitiate = function(){
		if(this.activated == false){
			PICTIN.calibrate_tool.activate();
		}
	}
	
	this.resetCalibration = function(){
		if(CALIBRATION.calibrator != null){
			CALIBRATION.calibrator.removeShape();
		}
		
		if(CALIBRATION.scale != null){
			CALIBRATION.scale.removeShape();
		}
		
		PICTIN.measurement_ratio = 1;
	}
	
 }
 
 function select_circle_area_dialog(){
 	var dialog = jQuery("#select-area-dialog").dialog({
		resizable: false,
		title: 'Calibration',
		width: 358,
		autoOpen: false,
		buttons: {
			"Ok": function(){
					select_circle_area();
					return false;
				}
		},
		close: function(){
			jQuery("select-area-dialog").hide();
		},
		zIndex:10
	});
	
	jQuery("#area-select-dialog").show();
	dialog.dialog("open");
 }
 
 function select_circle_area(){
 	jQuery("#select-area-dialog").dialog("close");	
	var redraw_circle = function(e){
		e.stopPropagation();
		//DEBUG_PAT.output("in redraw_circle");
		if(CALIBRATION.calibrator != null){
			CALIBRATION.calibrator.removeShape();
			var child_shapes = jQuery(CALIBRATION.calibrator.getNode()).data("child_shapes");
			for(var i in child_shapes){
				child_shapes[i].removeShape();
			}
			open_calibration_dialog();
		}
	}
	start_zoom_area(open_calibration_dialog, transfer_calibrator, {}, [{text: "Redraw", function: redraw_circle}]);
 }	
 
 function create_calibrator(){
	PICTIN.color_buffer = PICTIN.current_color;
	PICTIN.current_color = "FF0000";
	CALIBRATION.calibrator_drawn = false;
	

	if (jQuery("#calibration_style").val() == "circle") {
		jQuery(document).bind("circle_drawn.calibrator", function(e, shape){
			PICTIN.current_color = PICTIN.color_buffer;
			//open_calibration_dialog();
			PICTIN.tool_circle.stop();
			if(CALIBRATION.calibrator) CALIBRATION.calibrator.removeShape();
			CALIBRATION.calibrator = shape;
			CALIBRATION.calibrator_drawn = true;
			CALIBRATION.calibrator_length = shape.getShape().r * 2;
			//PICTIN.rollback_manager.removeLastSave()
			jQuery(document).unbind("circle_drawn.calibrator");
		})
		
		
		PICTIN.tool_circle.activate();
	}
	else if(jQuery("#calibration_style").val() == "segment"){
		jQuery(document).bind("segment_drawn.calibrator", function(e, shape){
			PICTIN.current_color = PICTIN.color_buffer;
			PICTIN.tool_segment.stop();
			if(CALIBRATION.calibrator) CALIBRATION.calibrator.removeShape();
			CALIBRATION.calibrator = shape;
			CALIBRATION.calibrator_drawn = true;
			CALIBRATION.calibrator_length = get_segment_length(shape.getShape().x1,
															   shape.getShape().y1,
															   shape.getShape().x2,
															   shape.getShape().y2);	
			//PICTIN.rollback_manager.removeLastSave();
			jQuery(document).unbind("segment_drawn.calibrator");
		});
		
		PICTIN.tool_segment.activate("2points");
	}
 }
 
CALIBRATION.create_scale = function(length){
	////console.log("length : " + length);
	var length = length;
	var calibration_value = jQuery("#calibration_value").val();
	DEBUG_PAT.output("calibration value : " + calibration_value, true);
	var scale_length = (50 / calibration_value) * length;
	var per_cm_length = scale_length / 5;
	CALIBRATION.calibrator_length = length;
	
	var surface_dimensions = PICTIN.surface.getDimensions();
	var x1 = jQuery(window).scrollLeft() + 20;
	var y1 = jQuery(window).scrollTop() + jQuery(window).height() - jQuery("#toolbar").height() - 40;//surface_dimensions.height - 20;
	CALIBRATION.scrollTop_buffer = jQuery(window).scrollTop();
	CALIBRATION.scrollLeft_buffer = jQuery(window).scrollLeft();
	
	if((jQuery(window).height() - jQuery("#toolbar").height()) > surface_dimensions.height){
		x1 = 20;
		y1 = surface_dimensions.height - 20;
	}
	
	PICTIN.measurement_ratio = calibration_value / length;
		
 	PICTIN.tool_circle.stop();
	
	jQuery(CALIBRATION.calibrator.getNode()).data("isScale", true);
	
	var scale_shapes_array = jQuery(document).data("scale_shapes_array");
	if(scale_shapes_array != null){
		for(var i in scale_shapes_array){
			scale_shapes_array[i].removeShape();
		}
	}
	
	if(CALIBRATION.scale != null){
		PICTIN.shape_manager.delete_shape(CALIBRATION.scale.getNode());
		CALIBRATION.scale.removeShape();
	}
	CALIBRATION.scale = PICTIN.surface.createGroup();
	//PICTIN.shape_manager.add_shape(CALIBRATION.scale);
	//scale_shapes_array = new Array();
	CALIBRATION.scale.add(PICTIN.surface.createLine({x1: x1, y1: y1, x2: x1+scale_length, y2: y1}).setStroke({color: "#FF0000", width: 1}));
	
	for(var i = 0; i<=5; i++){
		CALIBRATION.scale.add(PICTIN.surface.createLine({	x1: x1+(per_cm_length*i), 
															y1: y1-(CALIBRATION.calibrator_height/2), 
															x2: x1+(per_cm_length*i), 
															y2: y1+(CALIBRATION.calibrator_height/2)}).setStroke({
			color: "#FF0000",
			width: 1
		}));
		
		CALIBRATION.scale.add(PICTIN.surface.createText({x: x1 + (per_cm_length*i) - 3, y: y1 - 15, text: i}).setStroke({
			color: "#FF0000",
			width: 1
		}));
	}
	jQuery(window).bind("scroll", CALIBRATION.repositionScale);
	CALIBRATION.scale_center_rel = {dx: length/2, 
									dy: -(CALIBRATION.calibrator_height/2)};
	CALIBRATION.scale_x = x1;
	CALIBRATION.scale_y = y1;
	//jQuery(document).data("scale_shapes_array", scale_shapes_array);
	
	/*jQuery(document).bind("circle_resized", function(e, circle_shape){
		if (jQuery(circle_shape.getNode()).data("isScale") == true) {
			create_scale(circle_shape);
		}
	})*/
 }
 
 CALIBRATION.repositionScale = function(){
 	if(CALIBRATION.scale != null && CALIBRATION.scrollTop_buffer != null && CALIBRATION.scrollLeft_buffer != null){
		var deltaTop = jQuery(window).scrollTop() - CALIBRATION.scrollTop_buffer;
		var deltaLeft = jQuery(window).scrollLeft() - CALIBRATION.scrollLeft_buffer;
		CALIBRATION.scrollTop_buffer = jQuery(window).scrollTop();
		CALIBRATION.scrollLeft_buffer = jQuery(window).scrollLeft();
		CALIBRATION.scale.setTransform({dx: 0, dy: 0});
		CALIBRATION.scale.applyLeftTransform({dx: deltaLeft, dy: deltaTop});

		
	}
 }

 
 
 
 function transfer_calibrator(args){
 	PICTIN.surface = PICTIN.surface_buffer;
	PICTIN.surface_id = "surface";
	var scaling_factor = args.scaling_factor;
	if (CALIBRATION.calibrator_drawn) {
		if(CALIBRATION.calibrator) CALIBRATION.calibrator.removeShape();
		
		if(jQuery("#calibration_style").val() == "circle"){
			CALIBRATION.calibrator.setShape({
				r: CALIBRATION.calibrator.getShape().r * scaling_factor
			});
			CALIBRATION.calibrator.setShape({
				cx: PICTIN.marquee[0].getShape().x + CALIBRATION.calibrator.getShape().cx * scaling_factor,
				cy: PICTIN.marquee[0].getShape().y + CALIBRATION.calibrator.getShape().cy * scaling_factor
			})
		}
		else if(jQuery("#calibration_style").val() == "segment"){
			CALIBRATION.calibrator.setShape({
				x1: PICTIN.marquee[0].getShape().x + CALIBRATION.calibrator.getShape().x1 * scaling_factor,
				y1: PICTIN.marquee[0].getShape().y + CALIBRATION.calibrator.getShape().y1 * scaling_factor,
				x2: PICTIN.marquee[0].getShape().x + CALIBRATION.calibrator.getShape().x2 * scaling_factor,
				y2: PICTIN.marquee[0].getShape().y + CALIBRATION.calibrator.getShape().y2 * scaling_factor
			})
		}
		
		PICTIN.surface.add(CALIBRATION.calibrator);
		jQuery(CALIBRATION.calibrator).unbind();
		jQuery(CALIBRATION.calibrator).removeData("pictin_events");
		
		CALIBRATION.calibrator_length = CALIBRATION.calibrator_length*scaling_factor;
		CALIBRATION.create_scale(CALIBRATION.calibrator_length);
		
	}
	else{
		PICTIN.tool_circle.stop();
		PICTIN.current_color = PICTIN.color_buffer;
	}
	//remove marquee 
	if(PICTIN.marquee)
	{
		PICTIN.surface.remove(PICTIN.marquee[0]);
		PICTIN.surface.remove(PICTIN.marquee[1]);
	}
	
	//PICTIN.rollback_manager.recordState();
	this.activated = false;
	setTimeout('trigger_calibrationDone()', 100);
	return false;
	
 }
 
 function trigger_calibrationDone(){
 	PICTIN.rollback_manager.enable();
 	PICTIN.rollback_manager.recordState();
 	PICTIN.rollback_manager.disable();
 	jQuery(document).trigger("CALIBRATION_DONE");
 }
 
 
function open_calibration_dialog(){
	
	var dialog = jQuery("#pictin-calibration-dialog").dialog({
		resizable: false,
		title: 'Calibration',
		width: 358,
		autoOpen: false,
		modal: true,
		buttons: {
			"Ok": function(){
				jQuery(this).dialog("close");
				setTimeout('create_calibrator()', 100);
			}
		},
		close: function(){
			jQuery("#pictin-calibration-dialog").hide();
		},
		zIndex:10
	});

	dialog.dialog("open");
}

function unexpected_leave(){
	if(PICTIN.tool_circle._isActivated == true) PICTIN.tool_circle.stop();
	if(PICTIN.tool_segment._isActivated == true) PICTIN.tool_segment.stop();
	
	PICTIN.surface = PICTIN.surface_buffer;
	PICTIN.surface_id = "surface";
	PICTIN.calibrate_tool.activated = false;
	PICTIN.current_color = PICTIN.color_buffer;
	jQuery(document).unbind("circle_drawn");
}
