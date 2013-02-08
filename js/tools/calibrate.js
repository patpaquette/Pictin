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
		}
		
		return this;
	}
	
	this.stop = function(){
		PICTIN.marquee = null;
		this.activated = false;
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
			jQuery("select-area-dialog").hide()
		},
		zIndex:10
	})
	
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
			//PICTIN.rollback_manager.removeLastSave();
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
		CALIBRATION.scale.applyLeftTransform({dx: deltaLeft, dy: deltaTop});
	
	}
 }

 
 /*function activate_marquee(){
 	jQuery(document).mousemove(function(e){
		
		if(e.target.parentNode.id!='surface' && e.target.id!='surface') return;
																																			  
		e.preventDefault();
		//
		if(PICTIN.mousedown && PICTIN.surface)
		{
			//remove 
			if(PICTIN.marquee)
			{
				PICTIN.surface.remove(PICTIN.marquee[0]);
				PICTIN.surface.remove(PICTIN.marquee[1]);
			}
							
			
			var coords=PICTIN.get_cursor_coords('surface', e),
				mousedownx=PICTIN.mousedownx,
				mousedowny=PICTIN.mousedowny;
				
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
			
			//apply transformation to coords and dimensions
			//topleftx/=PICTIN.zoom_level;
			//toplefty/=PICTIN.zoom_level;
			//width/=PICTIN.zoom_level;
			//height/=PICTIN.zoom_level;
			
			//var coords=PICTIN.get_cursor_coords('surface', e);
			//PICTIN.debug("x: "+topleftx+"\ny: "+toplefty+"\nwidth: "+width+"\nheight: "+height);
										
			//create rectangle
			var shape1=PICTIN.surface
				.createRect({id: 'marquee', x: topleftx, y: toplefty, width: width, height: height, 'shape-rendering': 'crispEdges'})
				.setStroke({color:'#ffffff', width: 1});
			var shape2=PICTIN.surface
				.createRect({id: 'marquee', x: topleftx, y: toplefty, width: width, height: height, 'shape-rendering': 'crispEdges'})
				.setStroke({color:'#000000', width: 1, style: 'Dash'});
				
			//shape1.applyTransform({xx:PICTIN.zoom_level, yy: PICTIN.zoom_level});
			//shape2.applyTransform({xx:PICTIN.zoom_level, yy: PICTIN.zoom_level});

			PICTIN.marquee=[shape1, shape2];

		}
	});
	
	jQuery(document).mouseup(calibrate_mouseupHandler);
 }*/
 
 /*function open_zoomed_area_dialog(){
 	var precanvas_width = 550;
	var precanvas_height = 550;
 	var bgcanvas=PICTIN.canvas,
		bgcontext=bgcanvas.getContext('2d'),
		bgaspectratio=bgcanvas.width/bgcanvas.height,
		precanvas=jQuery('#zoomed-area-canvas')[0],
		prectx=precanvas.getContext('2d');
	
	var scaling_factor = null;
	
	precanvas.width = precanvas_width;
	precanvas.height = precanvas_height;
	//clear preview canvas
	prectx.clearRect(0, 0, precanvas.width, precanvas.height);
	prectx.mozImageSmoothingEnabled=true;
	
	if(PICTIN.marquee)
	{
		//PICTIN.debug("marquee.x: "+PICTIN.marquee.x+", marquee.y: "+PICTIN.marquee.y);
		
		
		bgcanvas=PICTIN.marquee[0].shape;
		//console.log("bgcanvas height : " + bgcanvas.height);
		bgaspectratio=bgcanvas.width/bgcanvas.height;
		var data=bgcontext.getImageData(bgcanvas.x, bgcanvas.y, bgcanvas.width, bgcanvas.height),
			canvas=jQuery('<canvas></canvas>').attr('height', bgcanvas.height).attr('width', bgcanvas.width)[0];
		canvas.getContext('2d').putImageData(data, 0, 0);
				
		
		if(bgaspectratio>1)
		{
			var height=precanvas.height/bgaspectratio,
				toplefty=(precanvas.height-height)/2;
			
			scaling_factor = PICTIN.marquee[0].shape.width/precanvas_width;
			precanvas.height = height;
			prectx.drawImage(canvas, 0, 0, precanvas.width, height);
			
			jQuery('#zoomed-area-surface')
				.html('')
				.css('height', height+'px')
				.css('width', precanvas.width+'px');
			
			PICTIN.surface_buffer = PICTIN.surface;
			PICTIN.surface = dojox.gfx.createSurface(jQuery("#zoomed-area-surface")[0], precanvas.width, height);
			PICTIN.surface_id = "zoomed-area-surface";
			
			var dialog = jQuery("#zoomed-area-dialog").dialog({
				resizable: false,
				title: 'Circle area',
				width: precanvas.width + 30,
				height: height + 135,
				autoOpen: false,
				buttons: {"Ok": function(){
						jQuery(this).dialog("close");
						transfer_calibrator(scaling_factor);
					}
				},
				close: unexpected_leave,
				zIndex:10
			})
		}
		else
		{
			var width=precanvas.width*bgaspectratio,
				topleftx=(precanvas.width-width)/2;
				
			scaling_factor = PICTIN.marquee[0].shape.height/precanvas_height;
			precanvas.width = width;
			prectx.drawImage(canvas, 0, 0, width, precanvas.height);
			
			jQuery('#zoomed-area-surface')
				.html('')
				.css('height', precanvas.height+'px')
				.css('width', width+'px');
			
			PICTIN.surface_buffer = PICTIN.surface;
			PICTIN.surface = dojox.gfx.createSurface(jQuery("#zoomed-area-surface")[0], width, precanvas.height);
			PICTIN.surface_id = "zoomed-area-surface";
			
			
			var dialog = jQuery("#zoomed-area-dialog").dialog({
				resizable: false,
				title: 'Circle area',
				width: width + 30,
				height: precanvas.height + 135,
				autoOpen: false,
				buttons: {"Ok": function(){
						jQuery(this).dialog("close");
						transfer_calibrator(scaling_factor);
					}
				},
				close: unexpected_leave,
				zIndex:10
			})
		}
	}
	dialog.dialog("open");
	
	remove_events();
	open_calibration_dialog();
	//create_calibration_circle();
 }*/
 
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
 	jQuery(document).trigger("CALIBRATION_DONE");
 }
 /*//event handlers
 var calibrate_mouseupHandler = function(e){
 	if (PICTIN.marquee != null) {
		var x = PICTIN.marquee[0].getShape().x;
		var y = PICTIN.marquee[0].getShape().y;
		var width = PICTIN.marquee[0].getShape().width;
		var height = PICTIN.marquee[0].getShape().height;
		var surface_dimensions = PICTIN.surface.getDimensions();
		
		//var zoom_level = (width < height)?surface_dimensions.height/height:surface_dimensions.width/width;
		
		//PICTIN.set_zoom_level(zoom_level);
		
		//jQuery(document).scrollLeft(x*zoom_level);
		//jQuery(document).scrollTop(jQuery("#toolbar").height() + y*zoom_level);
		
		jQuery(document).unbind("mousemove");
		
		open_zoomed_area_dialog();
	}
}*/
 
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
