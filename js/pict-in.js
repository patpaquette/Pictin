	// JavaScript Document

//var PICTIN={};
var TOOLS_FUNCTIONS = {};

jQuery.noConflict();



PICTIN.surface_node = null;
PICTIN.surface = null;
PICTIN.surface_buffer = null;
PICTIN.surface_width = null;
PICTIN.surface_height = null;
PICTIN.toolboxReady = false;
PICTIN.current_tool = null;
PICTIN.tool_buffer = null;
PICTIN.shape_buffer_tool = null;
PICTIN.shape_buffer = null;
PICTIN.tool_array = new Array();
PICTIN.current_color='ff0000';
PICTIN.current_linethickness=1;
PICTIN.mousedown=false;
PICTIN.mousedownx=null;
PICTIN.mousedowny=null;
PICTIN.mouseupx=null;
PICTIN.mouseupy=null;
PICTIN.current_shape=null;
PICTIN.marquee=null;
PICTIN.canvas=null;
PICTIN.canvas_src=null;
PICTIN.precanvas=null;
PICTIN.precanvas_clone=null;
PICTIN.textpath=null;
PICTIN.textpath_config={
	decoration:"none",
	fontstyle:"normal",
	fontsize:"14px",
	fontweight:"normal",
	fontfamily:"Tahoma, Geneva, sans-serif"
};
PICTIN.textpath_cursor=null;
PICTIN.zoom_level=1.0;
PICTIN.zoom_direction = null; // 1 = upzoom, -1 = downzoom
PICTIN.current_rotation = 0;
PICTIN.measurement_ratio = null;
PICTIN.contrabright_data=new Array();
PICTIN.tool_arguments = null;
PICTIN.tool_index_buffer = null;
PICTIN.import_z=20;
PICTIN.canvas_context = null;

//have to declare it in this file because of internet explorer. Originally in tools/util.js.
function getInternetExplorerVersion() {
	var rv = -1; // Return value assumes failure.
	if (navigator.appName == 'Microsoft Internet Explorer') {
	    var ua = navigator.userAgent;
	    var re = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
	    if (re.exec(ua) != null)
	        rv = parseFloat(RegExp.$1);
	}
	return rv;
}

	
//dojo.addOnLoad(function(){	
jQuery(window).load(function(){
	PICTIN.init();
	
	PICTIN.surface_node = dojo.byId("surface");
    //PICTIN.surface = dojox.gfx.createSurface(PICTIN.surface_node, 600, 600);
	
	if (jQuery.browser.msie) {
		eval('function tool_angle(){};');
	}
	
	var files_to_load = 17;
	var check_if_ready = function(){
		files_to_load -= 1;
		if (files_to_load == 0) {
			PICTIN.toolboxReady = true;
			if (getInternetExplorerVersion() == 8) {
				jQuery("head").append('<meta http-equiv="X-UA-Compatible" content="IE=EmulateIE7" />');
			}
			
			if(PICTIN.tool_array.length == 0){
				PICTIN.rectangle_tool_index = PICTIN.tool_array.push(PICTIN.tool_rectangle) - 1;
				PICTIN.circle_tool_index = PICTIN.tool_array.push(PICTIN.tool_circle) - 1;
				PICTIN.line_tool_index = PICTIN.tool_array.push(PICTIN.tool_line) - 1;
				PICTIN.segment_tool_index = PICTIN.tool_array.push(PICTIN.tool_segment) - 1;
				PICTIN.arrow_tool_index = PICTIN.tool_array.push(PICTIN.tool_segment) - 1;
				PICTIN.dot_tool_index = PICTIN.tool_array.push(PICTIN.tool_dot) - 1;
				PICTIN.angle_tool_index = PICTIN.tool_array.push(new tool_angle()) - 1;
				PICTIN.obtuse_angle_tool_index = PICTIN.tool_array.push(new tool_angle()) - 1;
				PICTIN.calibrate_tool_index = PICTIN.tool_array.push(PICTIN.calibrate_tool) - 1;
				PICTIN.measure_tool_index = PICTIN.tool_array.push(PICTIN.measure_tool) - 1;
				PICTIN.ellipse_tool_index = PICTIN.tool_array.push(PICTIN.tool_ellipse) - 1;
				PICTIN.automatic_programs_tool_index = PICTIN.tool_array.push(PICTIN.automatic_programs_tool)-1;
				
				PICTIN.automatic_programs_tool.startupInit();
			}
			
			var image_to_load=jQuery.getUrlVar('open');
			if(image_to_load){
				if(image_to_load.indexOf('http://')==-1){
					PICTIN.load_image(PICTIN.url+image_to_load);
				}else{
					PICTIN.load_image(image_to_load);
				}
			}
		}
	}

	
	
	//to be modified - doesn't work properly
	//loadScript("js/tools/automatic_programs/knee/KneeBase.js", check_if_ready);
	loadScript("js/tools/measure.js", check_if_ready);
	loadScript("js/tools/calibrate.js", check_if_ready);
	loadScript("js/tools/debug_pat.js", check_if_ready);
	loadScript("js/tools/pictin_shape_manager.js", check_if_ready);
	loadScript("js/tools/undo&redo/rollback_manager.js", check_if_ready);
	loadScript("js/tools/undo&redo/state_manager.js", check_if_ready);
	loadScript("js/tools/rectangle.js", check_if_ready);
	loadScript("js/tools/circle.js", check_if_ready);
	loadScript("js/tools/line.js", check_if_ready);
	loadScript("js/tools/segment.js", check_if_ready);
	loadScript("js/tools/dot.js", check_if_ready);
	//loadScript("js/tools/angle.js", check_if_ready);
	//loadScript("js/tools/util.js", check_if_ready);
	//loadScript("js/tools/tool_cfg.js", check_if_ready);
	loadScript("lib/number-functions/number-functions.js", check_if_ready);
	loadScript("js/tools/drawing_lib.js", check_if_ready);
	loadScript("js/tools/ellipse.js", check_if_ready);
	//loadScript("js/tools/task_manager.js", check_if_ready);
	
	//loadScript("js/tools/automatic_programs/knee/HKA_global_axis.js", check_if_ready);
	//loadScript("js/tools/automatic_programs/knee/Patellar_measures_preop.js", check_if_ready);
	//loadScript("js/tools/automatic_programs/knee/BBL_skyline_views_postop.js", check_if_ready);
	//loadScript("js/tools/automatic_programs/APBase.js", check_if_ready);
	//loadScript("js/tools/automatic_programs/AP_tool.js", check_if_ready);
	
	loadScript("js/tools/automatic_programs/pre&post_op/preop_tasks.js", check_if_ready);
	loadScript("js/tools/automatic_programs/pre&post_op/postop_tasks.js", check_if_ready);
	loadScript("js/tools/automatic_programs/pre&post_op/preop_pm_ap_tasks.js", check_if_ready);
	loadScript("js/tools/automatic_programs/pre&post_op/preop_pm_lat_tasks.js", check_if_ready);
	//loadScript("js/canvas2image.js", check_if_ready);
	
	
	//build main toolbar
	if(typeof(PICTIN_INC.toolbar_icons)=='object')
		var toolbar_icons=PICTIN.toolbar_icons.concat(PICTIN_INC.toolbar_icons);
	else
		var toolbar_icons=PICTIN.toolbar_icons;
			
	PICTIN.toolbar=PICTIN.build_toolbar('toolbar', 'pictin-toolbar-icon', toolbar_icons, {style: {position: 'fixed', zIndex: 99, top: 0, left: 0}});

	//build drawtext toolbar
	PICTIN.drawtext_toolbar=PICTIN.build_toolbar('pictin-drawtext-toolbar', 'pictin-drawtext-toolbar-icon', PICTIN.drawtext_toolbar_icons);
	
	//resize main toolbar holder
	jQuery('#toolbar-holder').css('height', jQuery(PICTIN.toolbar.domNode).height()+'px');
	jQuery(window).resize(function(){
		jQuery('#toolbar-holder').css('height', jQuery(PICTIN.toolbar.domNode).height()+'px');
	});
	
	//contrast/brightness sliders
	PICTIN.contrast_slider = new dijit.form.HorizontalSlider({
		value: 0,
		minimum: -1,
		maximum: 2,
		intermediateChanges: true,
		discreteValues: 301,
		onChange: function(v){
			v=v==0?'0.00':v.toFixed(2);
			$input=jQuery('#pictin-contrast-value');
			
			if(!$input.hasClass('pictin-focused'))
				$input.val(v);
			
			var work_image=PICTIN.clone_canvas(PICTIN.precanvas_clone),
				result_image=Pixastic.process(work_image, "brightness", {
				contrast: PICTIN.contrast_slider.value,
				brightness: PICTIN.brightness_slider.value
			});
			
			var prectx=PICTIN.precanvas.getContext('2d');
			prectx.drawImage(result_image, 0, 0);
		}
	},
	"pictin-contrast-slider");
	PICTIN.brightness_slider = new dijit.form.HorizontalSlider({
		value: 0,
		minimum: -150,
		maximum: 150,
		intermediateChanges: true,
		discreteValues: 301,
		onChange: function(v){
			v=Math.round(v),
			$input=jQuery('#pictin-brightness-value');
			
			if(!$input.is(':selected'))
				$input.val(v);
			
			var work_image=PICTIN.clone_canvas(PICTIN.precanvas_clone),
				result_image=Pixastic.process(work_image, "brightness", {
				contrast: PICTIN.contrast_slider.value,
				brightness: PICTIN.brightness_slider.value
			});
			
			var prectx=PICTIN.precanvas.getContext('2d');
			prectx.drawImage(result_image, 0, 0);
		}
	},
	"pictin-brightness-slider");
	
	//contrast/brightness input events
	var contrast_onchange=function(e){
		var value=parseFloat(this.value);
		if(isNaN(value)) return;
		if(value<-1 || value>2) return;
		PICTIN.contrast_slider.attr('value', value);
	}
	$contrast_value=jQuery('#pictin-contrast-value');
	$contrast_value.change(contrast_onchange);
	$contrast_value.keyup(contrast_onchange);
	$contrast_value.focus(function(){jQuery(this).addClass('pictin-focused')});
	$contrast_value.blur(function(){jQuery(this).removeClass('pictin-focused')});
	var brightness_onchange=function(e){
		var value=parseFloat(this.value);
		if(isNaN(value)) return;
		if(value<-150 || value>150) return;
		PICTIN.brightness_slider.attr('value', value);
	}
	$brightness_value=jQuery('#pictin-brightness-value');
	$brightness_value.change(brightness_onchange);
	$brightness_value.keyup(brightness_onchange);
	$brightness_value.focus(function(){jQuery(this).addClass('pictin-focused')});
	$brightness_value.blur(function(){jQuery(this).removeClass('pictin-focused')});
	jQuery('#pictin-contrabright-reset-button').click(PICTIN.reset_contrabright_inputs);
	jQuery('#pictin-contrabright-ok-button').click(function(e){
		var rect=null;
		if(PICTIN.marquee)
		{
			shape=PICTIN.marquee[0].shape;
			rect={left: shape.x, top: shape.y, width: shape.width, height: shape.height};
		}
	/*	else
		{
			rect = {
				left: PICTIN.canvas.clientLeft,
				top: PICTIN.canvas.clientTop,
				width: PICTIN.canvas.clientWidth,
				height: PICTIN.canvas.clientHeight
			};
		}*/
		result=Pixastic.process(PICTIN.canvas, 'brightness', {
			contrast:PICTIN.contrast_slider.value,
			brightness:PICTIN.brightness_slider.value,
			rect: rect
		});

		PICTIN.canvas=result;
		//PICTIN.canvas_context.drawImage(result, 0, 0, PICTIN.canvas.clientWidth, PICTIN.canvas.clientHeith);


		PICTIN.contrabright_dialog.dialog('close');
		
		//added by patrice
		PICTIN.contrabright_addData(rect, PICTIN.brightness_slider.value, PICTIN.contrast_slider.value, PICTIN.zoom_level);
		
		PICTIN.rollback_manager.recordState();
	});
	
	PICTIN.contrabright_addData = function(rect, brightness_value, contrast_value, zoom_level){
		PICTIN.contrabright_data.push({rect: rect, brightness_value: brightness_value, contrast_value: contrast_value, zoom_level: zoom_level});
	}
	
	PICTIN.contrabright_reset = function(){
		PICTIN.contrabright_data = new Array();
	}
	
	//text editor events
	var editor_onchange=PICTIN.update_textpath;
	jQuery('#pictin-drawtext-value').change(editor_onchange).keyup(editor_onchange);
	jQuery('#pictin-drawtext-cancel-button').click(function(){
		PICTIN.drawtext_dialog.dialog('close');
	});

	jQuery('#pictin-drawtext-ok-button').click(function(){
		PICTIN.update_textpath();
		
		//console.log("textpath x 1 : " + PICTIN.textpath.getShape().x);
		//console.log("textpath y 1 : " + PICTIN.textpath.getShape().y);
		
		//for text deletion
		var textnode=PICTIN.textpath.getNode();
		jQuery(textnode).data('pictin_events', [
			['mousedown', PICTIN.textpath_mousedown, {}],
			['moveable_event', textpath_mover]
		]);
		
		jQuery(textnode).data('shape_obj', PICTIN.textpath);
		
		//PICTIN.textpath.connect('onmousedown', PICTIN.textpath, PICTIN.textpath_mousedown);
		
		//new dojox.gfx.Moveable(PICTIN.textpath);

		PICTIN.shape_manager.add_shape(PICTIN.textpath);
		PICTIN.textpath=null;
		
		//if(PICTIN.textpath_cursor && PICTIN.textpath_cursor.textpath)
		//	PICTIN.surface.add(PICTIN.textpath_cursor.removeShape(PICTIN.textpath_cursor.textpath));
		
		PICTIN.rollback_manager.recordState();
		PICTIN.drawtext_dialog.dialog('close');
	});
	
	dojo.declare("textpath_mover", dojox.gfx.Mover, {
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
				anchor_array[i].shape.applyLeftTransform(new_transform);
			}
        }
        dojo.stopEvent(event);
    }}) 
	
	//color picker init
	jQuery('#pictin-colorpicker').ColorPicker({flat: true, color: PICTIN.current_color, onSubmit: function(hsb, hex, rgb, el){
		PICTIN.set_color(hex);
		PICTIN.colorpicker_dialog.dialog('close');
	}});
	
	//default color and line width
	jQuery('#pictin-colorpicker').ColorPickerSetColor(PICTIN.current_color);
	PICTIN.set_color(PICTIN.current_color);
	PICTIN.set_linethickness(1);
	
	//auto-height file manager iframe
	jQuery('#pictin-filemanager').load(function(){
		if(this.contentDocument){
			jQuery(this).height(this.contentDocument.body.offsetHeight+35);
		} else {
			jQuery(this).height(this.contentWindow.document.body.scrollHeight+25);
		}
	});
	
	//calibration dialog
	jQuery("#pictin-calibration").append("<input type='text' id='calibration-value'");
	jQuery("#pictin-calibration-holder").hide();
	jQuery("#calibration_custom1").attr("disabled", "disabled");
	jQuery("#calibration_custom2").attr("disabled", "disabled");
	
	jQuery("input[name=diameter][calibration_style=circle]:radio").bind("click", function(e){
		jQuery("#calibration_value").val(jQuery(this).val()); 
		jQuery("#calibration_style").val("circle"); 
		
		if(jQuery(this).attr("id") == "radio_custom_circle"){
			jQuery("#calibration_custom1").removeAttr("disabled");
			jQuery("#calibration_custom2").attr("disabled", "disabled");
		}
		else{
			jQuery("#calibration_custom1").attr("disabled", "disabled");
			jQuery("#calibration_custom2").attr("disabled", "disabled");
		}
	})
	jQuery("input[name=diameter][calibration_style=segment]:radio").bind("click", function(e){
		jQuery("#calibration_value").val(jQuery(this).val());
		jQuery("#calibration_style").val("segment");
		
		if(jQuery(this).attr("id") == "radio_custom_segment"){
			jQuery("#calibration_custom2").removeAttr("disabled");
			jQuery("#calibration_custom1").attr("disabled", "disabled");
		}
		else{
			jQuery("#calibration_custom1").attr("disabled", "disabled");
			jQuery("#calibration_custom2").attr("disabled", "disabled");
		}

	})

	jQuery("#calibration_custom1").bind("change", function(e){
		jQuery("#calibration_value").val(jQuery(this).val());
	})
	jQuery("#calibration_custom2").bind("change", function(e){
		jQuery("#calibration_value").val(jQuery(this).val());
	})
	
	jQuery("#pictin-measurement-holder").hide();
	//tmp_canvas
	jQuery("#tmp_canvas").hide();
	
	//bind callbacks to document
	jQuery(document).mousedown(function(e){
		
		$target=jQuery(e.target);
		
		//target filters
		if($target.is('html'))
			return;
		if($target.parents('.ui-dialog').length > 0 && $target.parents('.ui-dialog').children("#zoomed-area-dialog").length == 0)
			return;
		
		//DEBUG_PAT.output("PICTIN.mousedown = true", true);						
		PICTIN.mousedown=true;
										  
		//cursor coordinates relative to surface
		var coords=PICTIN.get_cursor_coords(PICTIN.surface_id, e);
		
		//mouse down coordinates relative to surface
		PICTIN.mousedownx=coords.x, 
		PICTIN.mousedowny=coords.y;
		
		PICTIN.debug("mdownx: "+coords.x+"\nmdowny: "+coords.y, 'mousedown');		
	});
	jQuery(document).mouseup(function(e){
		//
		PICTIN.mousedown=false;
		PICTIN.current_shape=null;
										  
		//cursor coordinates relative to surface
		var coords=PICTIN.get_cursor_coords(PICTIN.surface_id, e);
		
		PICTIN.mouseupx=coords.x,
		PICTIN.mouseupy=coords.y;
		
		PICTIN.debug("mupx: "+coords.x+"\nmupy: "+coords.y, 'mouseup');
	});
	jQuery('#surface').click(function(e){									  
		if(e.target.parentNode.id=='surface')
		{
			//remove 
			if(PICTIN.marquee)
			{
				PICTIN.surface.remove(PICTIN.marquee[0]);
				PICTIN.surface.remove(PICTIN.marquee[1]);
			}
			PICTIN.marquee=null;
		}
	});
	//debug info
	jQuery('#surface').mousemove(function(e){
		var coords=PICTIN.get_cursor_coords('surface', e);
		PICTIN.debug("x: "+coords.x+"\ny: "+coords.y, 'mousemove');
	});
	
	
	//display image onload
	/*
	var image_to_load=jQuery.getUrlVar('open');
	if(image_to_load){
		if(image_to_load.indexOf('http://')==-1){
			PICTIN.load_image(PICTIN.url+image_to_load);
		}else{
			PICTIN.load_image(image_to_load);
		}
	}*/
	
	//preload hover state image
	jQuery.preLoadImages('img/close-window-hover.png')

	if(jQuery.browser.safari)
		var import_button_hover_class='import-button-hover-safari';
	else if(jQuery.browser.chrome)
		var import_button_hover_class='import-button-hover-chrome';
	else
		var import_button_hover_class='import-button-hover';
	
	new AjaxUpload('import', {
		action: 'import.php',
		name: 'import',
		hoverClass: 'dijit dijitReset dijitLeft dijitInline dijitButton dijitButtonHover dijitHover dijitToggle ' + import_button_hover_class,
		allowedExtensions: ['jpg', 'jpeg', 'bmp', 'png', 'gif'],
		responseType: 'json',
		onComplete: function(fileName, response){
			jQuery('body').append(response['img']);
			var $import=jQuery('#'+response['id']);
			$import.load(function(){
				$import.attr('height', $import.height()).attr('width', $import.width());
				$import.resizable({handles:"all"}).parent().draggable();
				$import.parent()
					.css('z-index', PICTIN.import_z++)
					.mousedown(function(e){
						e.stopPropagation();
						jQuery(this).css('z-index', PICTIN.import_z++);
					})
					.append('<img class="import-close-icon" src="img/close-window.png" />')
					.find('img.import-close-icon')
						.mouseenter(function(){
							//console.log(this.src);
							this.src='img/close-window-hover.png';
						})
						.mouseleave(function(){
							this.src='img/close-window.png';
						})
						.click(function(){
							jQuery(this).parents('.ui-draggable').empty().remove();
						});
			});
			
			
		}
	});
});


jQuery.extend({
  getUrlVars: function(){
	var vars = [], hash;
	var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
	for(var i = 0; i < hashes.length; i++)
	{
	  hash = hashes[i].split('=');
	  vars.push(hash[0]);
	  vars[decodeURIComponent(hash[0])] = decodeURIComponent(hash[1]);
	}
	return vars;
  },
  getUrlVar: function(name){
	return jQuery.getUrlVars()[name];
  }
});

PICTIN.build_toolbar=function(toolbar_id, class_prefix, icon_array, options)
{
	var toolbar=new dijit.Toolbar(options, toolbar_id);
	for(index in icon_array)
	{
		var icon=icon_array[index];
		if(icon == null) //separator
		{
			var button=new dijit.ToolbarSeparator()
		}
		else if(icon.type=="Drop") //drop button
		{
			var menu=new dijit.Menu({style: "display:none;"});
			for(menuitem_id in icon.menu)
			{
				var menuitem=icon.menu[menuitem_id];
				menu.addChild(new dijit.MenuItem({
					label: menuitem.label,
					iconClass: menuitem.className,
					onClick: menuitem.onclick
				}));
			}
			var button = new dijit.form.DropDownButton({
				label: icon.label,
				showLabel: false,
				dropDown: menu,
				id: icon.id,
				iconClass: class_prefix+" "+class_prefix+"-"+icon.id
			});	
			
			PICTIN[icon.id]=button;
		}
		else if(icon.type=="Toggle") //toggle button
		{
			var button = new dijit.form.ToggleButton({
				label: icon.label,
				showLabel: false,
				iconClass: class_prefix+" "+class_prefix+"-"+icon.id,
				onClick: icon.onclick ? icon.onclick : function(){},
				id: icon.id
			});
		}
		else if(icon.type=="label"){
			var button = new dijit.form.Button({
				label: icon.label,
				showLabel: true,
				onClick: icon.onClick?icon.onClick:function(){},
				id: icon.id
			})
		}
		else //normal button
		{
			var button = new dijit.form.Button({
				label: icon.label,
				showLabel: false,
				iconClass: class_prefix+" "+class_prefix+"-"+icon.id,
				onClick: icon.onclick ? icon.onclick : function(){},
				id: icon.id
			});
		}
		
		if(icon!=null && icon.cursor)
			button.cursor=icon.cursor;
			
		toolbar.addChild(button);		
	}
	return toolbar;
};

PICTIN.debug=function(s, id)
{
	if(id)
		jQuery('#debug-'+id).html('<pre>'+s+'</pre>');
	else
	{
		jQuery('#debug-other').append('<pre>'+s+'</pre>\n');
		jQuery('#debug-other').scrollTop(jQuery('#debug-other')[0].scrollHeight);

	}
};

PICTIN.filemanager_onclick=function()
{
	jQuery('#pictin-filemanager').load();
	PICTIN.filemanager_dialog=PICTIN.filemanager_dialog || jQuery('#pictin-filemanager-holder').dialog({
		title: 'File Manager',
		width: 800,
		height:600,
		autoOpen:false,
		modal: true,
		resizeStop: function(){
			jQuery(this).find('#pictin-filemanager').load();
		},
		zIndex:10
	});
	PICTIN.filemanager_dialog.dialog('open');
	jQuery('#pictin-filemanager').load();
};
PICTIN.save_onclick=function()
{
	var url=PICTIN.canvas_src.src;
	var svg=jQuery(PICTIN.surface_node).html();	
	var f=jQuery('#pictin-save-form')[0];
	var bg=PICTIN.canvas.toDataURL().substr(21);	
	
	
	var $surface=jQuery('#'+PICTIN.surface_id);
	var surface_offset=$surface.offset();
	var imports=[];
	jQuery.each(jQuery('img.import'), function(){
		var offset=jQuery(this).offset();
		var import_json='{'+
			'"url" : "'+ this.src +'", '+
			'"x" : "'+ (offset.left-surface_offset.left) +'", '+
			'"y" : "'+ (offset.top-surface_offset.top) +'", '+
			'"width" : "'+ jQuery(this).width() +'", '+
			'"height" : "'+ jQuery(this).height() +'"'+
		'}';
		imports.push(import_json);
	});
	
	var imports_json='['+imports.join(',')+']';

	if(url && svg){
		//PICTIN.toggle_overlay('show');
		f.bg.value=bg;
		f.url.value=url;
		f.svg.value=svg;
		f.imports.value=imports_json;
		f.submit();
	}
};
PICTIN.saveas_onclick=function()
{
	
};
PICTIN.update_ow_onclick=function()
{
	var url=PICTIN.canvas_src.src;
	var svg=jQuery(PICTIN.surface_node).html();	
	var f=jQuery('#pictin-save-form')[0];
	var bg=PICTIN.canvas.toDataURL().substr(21);	
	
	
	var $surface=jQuery('#'+PICTIN.surface_id);
	var surface_offset=$surface.offset();
	var imports=[];
	jQuery.each(jQuery('img.import'), function(){
		var offset=jQuery(this).offset();
		var import_json='{'+
			'"url" : "'+ this.src +'", '+
			'"x" : "'+ (offset.left-surface_offset.left) +'", '+
			'"y" : "'+ (offset.top-surface_offset.top) +'", '+
			'"width" : "'+ jQuery(this).width() +'", '+
			'"height" : "'+ jQuery(this).height() +'"'+
		'}';
		imports.push(import_json);
	});
	
	var imports_json='['+imports.join(',')+']';

	if(url && svg){
		PICTIN.toggle_overlay('show');
		f.bg.value=bg;
		f.url.value=url;
		f.svg.value=svg;
		f.imports.value=imports_json;
		f.submit();
	}
};

PICTIN.undo_onclick=function()
{
	if(PICTIN.rollback_manager != null){
		PICTIN.rollback_manager.undo();
	}
};
PICTIN.redo_onclick=function()
{
	if(PICTIN.rollback_manager != null){
		PICTIN.rollback_manager.redo();
	}
};
PICTIN.select_onclick=function()
{
	PICTIN.toggle_button(this);
};
PICTIN.areaselect_onclick=function()
{
	PICTIN.toggle_button(this);
	
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
};
PICTIN.contrastbrightness_onclick=function()
{
	if(!PICTIN.surface) return;
	
	//reset inputs
	PICTIN.reset_contrabright_inputs();
	
	var bgcanvas=PICTIN.canvas,
		bgcontext=bgcanvas.getContext('2d'),
		bgaspectratio=bgcanvas.width/bgcanvas.height,
		precanvas=jQuery('#pictin-contrabright-preview > canvas')[0],
		prectx=precanvas.getContext('2d');
	
	//clear preview canvas
	prectx.clearRect(0, 0, precanvas.width, precanvas.height);
	prectx.mozImageSmoothingEnabled=true;
	
	if(PICTIN.marquee)
	{
		//PICTIN.debug("marquee.x: "+PICTIN.marquee.x+", marquee.y: "+PICTIN.marquee.y);
		
		bgcanvas=PICTIN.marquee[0].shape;
		bgaspectratio=bgcanvas.width/bgcanvas.height;
		var data=bgcontext.getImageData(bgcanvas.x, bgcanvas.y, bgcanvas.width, bgcanvas.height),
			canvas=jQuery('<canvas></canvas>').attr('height', bgcanvas.height).attr('width', bgcanvas.width)[0];
		canvas.getContext('2d').putImageData(data, 0, 0);
				
		
		if(bgaspectratio>1)
		{
			var height=precanvas.height/bgaspectratio,
				toplefty=(precanvas.height-height)/2;
			prectx.drawImage(canvas, 0, toplefty, precanvas.width, height);
		}
		else
		{
			var width=precanvas.width*bgaspectratio,
				topleftx=(precanvas.width-width)/2;
			prectx.drawImage(canvas, topleftx, 0, width, precanvas.height);
		}		
	}
	else
	{
		PICTIN.debug("no marquee");
		
		if(bgaspectratio>1)
		{
			var height=precanvas.height/bgaspectratio,
				toplefty=(precanvas.height-height)/2;
			prectx.drawImage(PICTIN.canvas, 0, toplefty, precanvas.width, height);
		}
		else
		{
			var width=precanvas.width*bgaspectratio,
				topleftx=(precanvas.width-width)/2;
			prectx.drawImage(PICTIN.canvas, topleftx, 0, width, precanvas.height);
		}
	}
	
	//clone preview canvas
	PICTIN.precanvas=precanvas;
	PICTIN.precanvas_clone=PICTIN.clone_canvas(precanvas);
	
	PICTIN.contrabright_dialog=PICTIN.contrabright_dialog || jQuery('#pictin-contrabright-holder').dialog({
		resizable: false,
		title: 'Brightness/Contrast',
		width: 576,
		height: 219,
		autoOpen:false,
		modal:true,
		zIndex:10
	});

	PICTIN.contrabright_dialog.dialog('open');
};
PICTIN.colorpicker_onclick=function()
{
	PICTIN.colorpicker_dialog=PICTIN.colorpicker_dialog || jQuery('#pictin-colorpicker-holder').dialog({
		resizable: false,
		title: 'Color',
		width: 356,
		autoOpen: false,
		zIndex: 10
	});
	if(PICTIN.colorpicker_dialog.dialog('isOpen'))
		PICTIN.colorpicker_dialog.dialog('close');
	else
		PICTIN.colorpicker_dialog.dialog('open');

};
PICTIN.drawcircle_onclick=function(e)
{	
	PICTIN.current_tool_index = PICTIN.circle_tool_index;
	PICTIN.toggle_button(this);

	e.stopPropagation();
};
PICTIN.drawellipse_onclick=function(e){
	PICTIN.current_tool_index = PICTIN.ellipse_tool_index;
	PICTIN.toggle_button(this);
	e.stopPropagation();
};
PICTIN.drawrectangle_onclick=function(e)
{
	PICTIN.current_tool_index = PICTIN.rectangle_tool_index;
	PICTIN.toggle_button(this);
	e.stopPropagation();
};
PICTIN.drawrectanglesolid_onclick=function(e){
	PICTIN.current_tool_index = PICTIN.rectangle_tool_index;
	PICTIN.toggle_button(this);
	PICTIN.tool_rectangle.setFill(true);
	e.stopPropagation();
};
PICTIN.drawdot_onclick=function(e)
{
	PICTIN.current_tool_index = PICTIN.dot_tool_index;
	PICTIN.toggle_button(this);

	e.stopPropagation();
};
PICTIN.drawline_onclick=function(e)
{
	PICTIN.current_tool_index = PICTIN.line_tool_index;
	PICTIN.toggle_button(this);
	e.stopPropagation();
	
};
PICTIN.drawlinesegment_onclick=function(e)
{
	PICTIN.current_tool_index = PICTIN.segment_tool_index;
	PICTIN.toggle_button(this);
	e.stopPropagation();
	
};
PICTIN.drawarrow_onclick=function(e)
{
	PICTIN.current_tool_index = PICTIN.arrow_tool_index;
	PICTIN.toggle_button(this);
	PICTIN.current_tool.put_arrowhead = true;
	e.stopPropagation();
	
};
PICTIN.drawangle_onclick=function(e)
{
	PICTIN.tool_arguments = false;
	PICTIN.current_tool_index = PICTIN.angle_tool_index;
	PICTIN.toggle_button(this);
	PICTIN.tool_arguments = null;
	e.stopPropagation();
	
};
PICTIN.drawobtuseangle_onclick=function(e)
{
	PICTIN.tool_arguments = true;
	PICTIN.current_tool_index = PICTIN.obtuse_angle_tool_index;
	PICTIN.toggle_button(this);
	PICTIN.tool_arguments = null;
	e.stopPropagation();
};
PICTIN.linethicknessselect_onclick=function()
{
	
};
PICTIN.linethickness1px_onclick=function()
{
	PICTIN.set_linethickness(1);
};
PICTIN.linethickness2px_onclick=function()
{
	PICTIN.set_linethickness(2);
};
PICTIN.linethickness4px_onclick=function()
{
	PICTIN.set_linethickness(4);
};
PICTIN.drawtext_onclick=function()
{
	PICTIN.toggle_button(new dijit.form.Button());
	
	PICTIN.drawtext_dialog=PICTIN.drawtext_dialog || jQuery('#pictin-drawtext-holder').dialog({
		resizable: false,
		title: 'Text',
		width: 358,
		autoOpen:false,
		close:PICTIN.cancel_drawtext,
		zIndex:10
	});

	PICTIN.activate_text_editor();
	
	jQuery('#surface').click(PICTIN.activate_text_cursor);	
	
};
PICTIN.measure_onclick=function(e)
{
	PICTIN.current_tool_index = PICTIN.measure_tool_index;
	PICTIN.toggle_button(this);
	e.stopPropagation();
	
};
PICTIN.calibrate_onclick=function(e)
{
	jQuery(document).bind("CALIBRATION_DONE.calibration", PICTIN.rollback_manager.recordState);
	
	PICTIN.current_tool_index = PICTIN.calibrate_tool_index;
	PICTIN.toggle_button(this);
	e.stopPropagation();

};
PICTIN.rotatecounterclockwise90_onclick=function()
{
	PICTIN.rotate(270);
	PICTIN.rollback_manager.recordState();
};
PICTIN.rotateclockwise90_onclick=function()
{
	PICTIN.rotate(90);
	PICTIN.rollback_manager.recordState();
};
PICTIN.rotate180_onclick=function()
{
	PICTIN.rotate(180);
	PICTIN.rollback_manager.recordState();
};
PICTIN.rotate = function(deg){
	
	PICTIN.current_rotation = (PICTIN.current_rotation + deg)%360;
	
	var dimensions = PICTIN.rotate_canvas(deg);
	PICTIN.resize_svg(dimensions.new_width, dimensions.new_height);
	
	var finished = PICTIN.rotate_surface(deg);
	if(finished == true){
		//PICTIN.rollback_manager.recordState();
	}
};
PICTIN.rotate_surface = function(deg){
	var surface_dimensions = PICTIN.surface.getDimensions();
	//surface_dimensions.width = Math.round(surface_dimensions.width*PICTIN.zoom_level);
	//surface_dimensions.height = Math.round(surface_dimensions.height*PICTIN.zoom_level);
	var translation_transform = null;
	if(PICTIN.current_rotation == 0 || PICTIN.current_rotation == 180){
		translation_transform = {dx: -(surface_dimensions.width/2-surface_dimensions.height/2), dy: ((surface_dimensions.width-surface_dimensions.height)/2)};
	}
	else{
		translation_transform = {dx: -(surface_dimensions.height/2-surface_dimensions.width/2), dy: ((surface_dimensions.height-surface_dimensions.width)/2)};
	}
	var inverse_transform = dojox.gfx.matrix.invert(translation_transform);
	
	var temp_array = new Array();
	
	for(var i in PICTIN.shape_manager.shape_array){
		temp_array.push(PICTIN.shape_manager.shape_array[i]);
	}
	if(PICTIN.marquee){
		temp_array.push(PICTIN.marquee[0]);
		temp_array.push(PICTIN.marquee[1]);
	}
	
	for(var i in temp_array){
		var child_shapes = jQuery(temp_array[i].getNode()).data("child_shapes");
		for(var y in child_shapes){
			temp_array.push(child_shapes[y]);
		}
	}
	
	jQuery.each(temp_array, function(index, shape){
		var point_of_rotation = (PICTIN.current_rotation == 0 || PICTIN.current_rotation == 180)?{x: surface_dimensions.width/2, y: surface_dimensions.height/2}:
																								 {x: surface_dimensions.height/2, y: surface_dimensions.width/2};
		
		var canvas = jQuery('#background')[0];

		if(deg == 180 && (PICTIN.current_rotation == 90 || PICTIN.current_rotation == 270)) shape.applyLeftTransform(inverse_transform);
		if((PICTIN.current_rotation == 0 || PICTIN.current_rotation == 180) && deg != 180) shape.applyLeftTransform(inverse_transform);
		shape.applyLeftTransform(dojox.gfx.matrix.rotategAt(deg, point_of_rotation));
		if((PICTIN.current_rotation == 90 || PICTIN.current_rotation == 270)) shape.applyLeftTransform(translation_transform);
		
		PICTIN.shape_manager.refresh_anchor_position(shape);
	});
	//PICTIN.rollback_manager.recordState();
	return true;

};

PICTIN.rotate_canvas = function(deg){
	var canvas = jQuery('#background')[0];	
	var temp_canvas = jQuery("<canvas></canvas>")[0];
	if(typeof(G_vmlCanvasManager)!='undefined') G_vmlCanvasManager.initElement(canvas);
	if(typeof(G_vmlCanvasManager)!='undefined') G_vmlCanvasManager.initElement(temp_canvas);
	var canvasContext = PICTIN.canvas_context;//canvas.getContext('2d');
	var temp_ctx = temp_canvas.getContext("2d");
	var image = PICTIN.clone_canvas(PICTIN.canvas);//PICTIN.canvas_src;
	//var image = PICTIN.clone_canvas(PICTIN.canvas);//PICTIN.canvas_src;
	
	var image_width = image.width;
	var image_height = image.height;
	var new_canvas_width = null;
	var new_canvasheight = null;

	//canvasContext.translate(width/2, height/2);
	//canvasContext.rotate(Math.PI);
	
	switch(deg) {
		default :
		case 0 :
			
			new_canvas_width = image_width;
			new_canvas_height = image_height;
			
			break;
		case 90 :
			new_canvas_width = image_height;
			new_canvas_height = image_width;

			temp_canvas.setAttribute('width', new_canvas_width);
			temp_canvas.setAttribute('height', new_canvas_height);

			break;
		case 180 :
			new_canvas_width = image_width;
			new_canvas_height = image_height;

			temp_canvas.setAttribute('width', new_canvas_width);
			temp_canvas.setAttribute('height', new_canvas_height);
			break;
		case 270 :
		case -90 :
			new_canvas_width = image_height;
			new_canvas_height = image_width;

			temp_canvas.setAttribute('width', new_canvas_width);
			temp_canvas.setAttribute('height', new_canvas_height);
			break;
	}
	
	if(deg > 0 && deg < 360){
		temp_ctx.translate(new_canvas_width/2, new_canvas_height/2);
		temp_ctx.rotate(deg*Math.PI / 180);
		temp_ctx.translate(-image_width/2, -image_height/2);
		temp_ctx.drawImage(image, 0, 0, image_width, image_height);
				
		canvas.setAttribute('width', new_canvas_width);
		canvas.setAttribute('height', new_canvas_height);
		canvasContext.drawImage(temp_canvas, 0, 0, new_canvas_width, new_canvas_height);
		
		
	}
	
	return {new_width: new_canvas_width, new_height: new_canvas_height};	

};

PICTIN.zoomin_onclick=function()
{
	PICTIN.zoom_direction = 1;
	PICTIN.set_zoom_level(PICTIN.zoom_level+0.1);
	PICTIN.rollback_manager.recordState();
};
PICTIN.zoomreset_onclick=function()
{
	PICTIN.zoom_direction = -1;
	PICTIN.set_zoom_level(1);
	PICTIN.rollback_manager.recordState();
};
PICTIN.zoomout_onclick=function()
{
	if (PICTIN.zoom_level > 0.1) {
		PICTIN.set_zoom_level(PICTIN.zoom_level - 0.1);
		PICTIN.rollback_manager.recordState();
	}
};
PICTIN.import_onclick=function(){
};
PICTIN.delete_onclick=function(){
	if(PICTIN.shape_manager.selected_shape != null){
		var shape_buffer = PICTIN.shape_manager.selected_shape;
		PICTIN.shape_manager.unselect_shape(shape_buffer.getNode());
		PICTIN.shape_manager.delete_shape(shape_buffer.getNode());
	}
};


PICTIN.set_zoom_level=function(zoom_level)
{
	//sanity check
	if(zoom_level<0.1) zoom_level=0.1;
	
	//fix measurement bug
	if(PICTIN.measurement_ratio){
		PICTIN.measurement_ratio=PICTIN.measurement_ratio/(zoom_level/PICTIN.zoom_level);
	}
	
	PICTIN.zoom_level=zoom_level;
	var canvas_src=PICTIN.canvas_src;
	var new_width=Math.round(canvas_src.width*zoom_level);
	var new_height=Math.round(canvas_src.height*zoom_level);
	PICTIN.resize_canvas(new_width, new_height);
	PICTIN.resize_shapes();
	
	var dimensions = PICTIN.rotate_canvas(PICTIN.current_rotation);
	PICTIN.resize_svg(dimensions.new_width, dimensions.new_height);
	//PICTIN.rotate_canvas(PICTIN.current_rotation);
	
	//update the scale position
	//CALIBRATION.repositionScale();
};
PICTIN.resize_canvas=function(width, height)
{
	//DEBUG_PAT.output("new width : " + width,true);
	//DEBUG_PAT.output("new height : " + height,true);
	
	var canvas = jQuery("<canvas></canvas>")[0];
	if(typeof(G_vmlCanvasManager)!='undefined') G_vmlCanvasManager.initElement(canvas);
	canvas.width = PICTIN.canvas_src.width;
	canvas.height = PICTIN.canvas_src.height;
	var temp_ctx = canvas.getContext('2d');
	temp_ctx.drawImage(PICTIN.canvas_src, 0, 0, PICTIN.canvas_src.width, PICTIN.canvas_src.height);
	
	var canvas_clone = PICTIN.clone_canvas(PICTIN.canvas);
	
	
	//added by pat
	
	for(var i in PICTIN.contrabright_data){
		var inverse_transform = dojox.gfx.matrix.invert({xx: PICTIN.contrabright_data[i].zoom_level});
		var rect = PICTIN.contrabright_data[i].rect;
		var new_rect = null;
		if (rect != null) {
			new_rect = {
				left: rect.left * inverse_transform.xx,
				top: rect.top * inverse_transform.xx,
				width: rect.width * inverse_transform.xx,
				height: rect.height * inverse_transform.xx
			}
		}
		result=Pixastic.process(canvas, 'brightness', {
			contrast: PICTIN.contrabright_data[i].contrast_value,
			brightness: PICTIN.contrabright_data[i].brightness_value,
			rect: new_rect
		});
		
		canvas = result;
	}
	
	//var current_canvas=jQuery('#background')[0];
	//current_canvas.width=width;
	//current_canvas.height=height;
	PICTIN.canvas.width = width;
	PICTIN.canvas.height = height;
	var ctx=PICTIN.canvas.getContext('2d');
	ctx.drawImage(canvas, 0, 0, width, height);
	
	
	
};


PICTIN.apply_inverse_surface_transform = function(coords){
    var transform  = new dojox.gfx.Matrix2D();
    transform.xx = PICTIN.zoom_level;
    transform.yy = PICTIN.zoom_level;
    transform = dojox.gfx.matrix.invert(transform);

    return dojox.gfx.matrix.multiplyPoint(transform, coords);
};

PICTIN.apply_surface_transform = function(coords){
    var transform  = new dojox.gfx.Matrix2D();
    transform.xx = PICTIN.zoom_level;
    transform.yy = PICTIN.zoom_level;

    return dojox.gfx.matrix.multiplyPoint(transform, coords);
};


PICTIN.apply_contrabright_process = function(canvas){
	for(var i in PICTIN.contrabright_data){
		var result;
		result=Pixastic.process(canvas, 'brightness', {
			contrast: PICTIN.contrabright_data[i].contrast_value,
			brightness: PICTIN.contrabright_data[i].brightness_value,
			rect: PICTIN.contrabright_data[i].rect
		});
		
		//canvas.drawImage(canvas, 0, 0, canvas.width, canvas.height);
	}
}


PICTIN.resize_svg=function(width, height)
{

	jQuery('#surface').width(width).height(height);
	var svg=jQuery(PICTIN.surface_node).find('svg')[0];
	if(svg){
		svg.setAttributeNS(null, 'width', width);
		svg.setAttributeNS(null, 'height', height);
	}
}
PICTIN.resize_shapes=function(){
	/*jQuery.each(PICTIN.shape_manager.shape_array, function(index, value){
		var transform = value.getTransform();

		if(PICTIN.resize_shapes.zoom_buffer){
			value.applyLeftTransform(dojox.gfx.matrix.invert({xx: PICTIN.resize_shapes.zoom_buffer, yy: PICTIN.resize_shapes.zoom_buffer}));
		}
		value.applyLeftTransform({xx: PICTIN.zoom_level, yy: PICTIN.zoom_level});
		
		var transform = value.getTransform();
		if(DEBUG_PAT.debug_enabled)
			DEBUG_PAT.output_obj(transform, "after scale rect");
		
		PICTIN.shape_manager.refresh_anchor_position(value);
	})*/
	if (PICTIN.marquee) {
	
			
		jQuery.each(PICTIN.marquee, function(index, value){
			if (PICTIN.resize_shapes.zoom_buffer) {
				value.applyLeftTransform(dojox.gfx.matrix.invert({
					xx: PICTIN.resize_shapes.zoom_buffer,
					yy: PICTIN.resize_shapes.zoom_buffer
				}));
			}
			value.applyLeftTransform({
				xx: PICTIN.zoom_level,
				yy: PICTIN.zoom_level
			})
		})
	}
	//jQuery("#" + PICTIN.surface_id + ">svg").find("path, text, textPath, g, rect, circle, polygon, polyline, ellipse, line").each(function(index){
	if(typeof(PICTIN.shape_manager) != "undefined"){
		for(var i in PICTIN.shape_manager.shape_array){
			var value = PICTIN.shape_manager.shape_array[i];//jQuery(this).data("shape_obj");
			if (value != null) {
				var transform = value.getTransform();
				
				if (PICTIN.resize_shapes.zoom_buffer) {
					value.applyLeftTransform(dojox.gfx.matrix.invert({
						xx: PICTIN.resize_shapes.zoom_buffer,
						yy: PICTIN.resize_shapes.zoom_buffer
					}));
				}
				value.applyLeftTransform({
					xx: PICTIN.zoom_level,
					yy: PICTIN.zoom_level
				});
				
				var child_shapes = jQuery(value.getNode()).data("child_shapes");
				for(var i in child_shapes){
					if (PICTIN.resize_shapes.zoom_buffer) {
						child_shapes[i].applyLeftTransform(dojox.gfx.matrix.invert({
							xx: PICTIN.resize_shapes.zoom_buffer,
							yy: PICTIN.resize_shapes.zoom_buffer
						}))
					}
					child_shapes[i].applyLeftTransform({
						xx: PICTIN.zoom_level,
						yy: PICTIN.zoom_level
					})
					
				}
				
				var transform = value.getTransform();
			
			}
		};
	}
	
	
	if((jQuery(window).height() - jQuery("#toolbar").height()) > PICTIN.surface.getDimensions().height){
		if(CALIBRATION.scale != null){
	
			/*if (PICTIN.resize_shapes.zoom_buffer) {
					value.applyLeftTransform(dojox.gfx.matrix.invert({
						xx: PICTIN.resize_shapes.zoom_buffer,
						yy: PICTIN.resize_shapes.zoom_buffer
					}));
				}
				value.applyLeftTransform({
					xx: PICTIN.zoom_level,
					yy: PICTIN.zoom_level
				});*/
				
			CALIBRATION.create_scale(CALIBRATION.calibrator_length / PICTIN.resize_shapes.zoom_buffer * PICTIN.zoom_level);
		}
	}else{
		if(CALIBRATION.scale != null){
			//console.log(CALIBRATION.scale_x);
			//console.log(CALIBRATION.scale_y);
			//console.log(CALIBRATION.scale_center_rel.dx);
			//console.log(CALIBRATION.scale_center_rel.dy);
			/*var transform_buffer = CALIBRATION.scale.getTransform();
			if(transform_buffer == null) transform_buffer = {dx: 0, dy: 0};
			
			CALIBRATION.scale.applyLeftTransform({	dx: -(CALIBRATION.scale_x + CALIBRATION.scale_center_rel.dx),// + transform_buffer.dx), 
													dy: -(CALIBRATION.scale_y + CALIBRATION.scale_center_rel.dy)});
			
			if (PICTIN.resize_shapes.zoom_buffer) {
				var invert_transform = dojox.gfx.matrix.invert({xx: PICTIN.resize_shapes.zoom_buffer, yy: PICTIN.resize_shapes.zoom_buffer});
				CALIBRATION.scale.applyLeftTransform(dojox.gfx.matrix.scale(invert_transform.xx, invert_transform.yy));
			}
			
			CALIBRATION.scale.applyLeftTransform(dojox.gfx.matrix.scale(
				PICTIN.zoom_level,
				PICTIN.zoom_level
			))
			
			CALIBRATION.scale.applyLeftTransform({	dx: CALIBRATION.scale_x + 
														CALIBRATION.scale_center_rel.dx + 
														(PICTIN.zoom_level*CALIBRATION.calibrator_length)/2,
														//transform_buffer.dx, 
													dy: CALIBRATION.scale_y + 
														CALIBRATION.scale_center_rel.dy //-
														//(PICTIN.zoom_level*CALIBRATION.calibrator_height)/2 +
														//transform_buffer.dy
														});*/
			//console.log("zoom level : " + PICTIN.zoom_level);
			//console.log("zoom buffer : " + PICTIN.resize_shapes.zoom_buffer);
			CALIBRATION.create_scale(CALIBRATION.calibrator_length / PICTIN.resize_shapes.zoom_buffer * PICTIN.zoom_level);
		}
		//console.log(CALIBRATION.scale.getTransform().dx);
		//console.log(CALIBRATION.scale.getTransform().dy);
	}
	
	PICTIN.resize_shapes.zoom_buffer = PICTIN.zoom_level;
}

PICTIN.mirrored = false;
PICTIN.horizontal_symetry_onclick = function(e){
	var canvas = jQuery('#background')[0];//PICTIN.canvas;
	var ctx = canvas.getContext("2d");
	var temp_canvas = jQuery('<canvas></canvas>')[0];
	var temp_ctx = temp_canvas.getContext('2d');
	var image = PICTIN.clone_canvas(canvas);
	var surface = PICTIN.surface;
	var surface_dimensions = surface.getDimensions();
	var shape_array = PICTIN.shape_manager.shape_array;
	var tmp_array = new Array();
	
	var transform = null;
	
	temp_canvas.setAttribute('width', image.width);
	temp_canvas.setAttribute('height', image.height);
	temp_ctx.translate(image.width, 0);
	temp_ctx.scale(-1, 1);
	temp_ctx.drawImage(image, 0, 0, image.width, image.height);
	
	ctx.drawImage(temp_canvas, 0, 0, temp_canvas.width, temp_canvas.height);

	//mirroring shapes
	
	transform = dojox.gfx.matrix.multiply(dojox.gfx.matrix.translate(surface_dimensions.width, 0),dojox.gfx.matrix.scale(-1, 1));
	
	for(var i in PICTIN.marquee){
		tmp_array.push(PICTIN.marquee[i]);
	}
	for(var i in shape_array){
		tmp_array.push(shape_array[i]);
	}
	for(var i in PICTIN.contrabright_data){
		var rect = PICTIN.contrabright_data[i].rect;
	
		PICTIN.contrabright_data[i].rect.left = PICTIN.surface.getDimensions().width - (rect.left + rect.width);
	
	}
	for(var i in tmp_array){
		//shape_array[i].applyLeftTransform(dojox.gfx.matrix.scale(-1, 1));
		//shape_array[i].applyLeftTransform(dojox.gfx.matrix.translate(surface_dimensions.width, 0));
		if(tmp_array[i].getShape().type == 'textpath' || tmp_array[i].getShape().type == 'text'){
			var anchor_coords = dojox.gfx.matrix.multiplyPoint(tmp_array[i].getTransform(), tmp_array[i].getShape().x, tmp_array[i].getShape().y);
			var new_anchor_coords = dojox.gfx.matrix.multiplyPoint(transform, anchor_coords);
			new_anchor_coords.x -= tmp_array[i].getTextWidth() * ((tmp_array[i].getTransform() != null)?tmp_array[i].getTransform().xx:1);
			var t = dojox.gfx.matrix.translate(new_anchor_coords.x - anchor_coords.x, new_anchor_coords.y - anchor_coords.y);
			
			tmp_array[i].applyLeftTransform(t);
		}
		else{
			tmp_array[i].applyLeftTransform(transform);
		}
		
		var anchors_shapes = jQuery(tmp_array[i].getNode()).data("anchors");
		
		for(var j in anchors_shapes){
			anchors_shapes[j].shape.applyLeftTransform(transform);
		}
		
		var child_shapes = jQuery(tmp_array[i].getNode()).data("child_shapes")
		for(var j in child_shapes){
			if(j == "angle_text_shapea" || j == "measurementa"){ //different transformations with text in order to keep them readable
				var anchor_coords = dojox.gfx.matrix.multiplyPoint(child_shapes[j].getTransform(), child_shapes[j].getShape().x, child_shapes[j].getShape().y);
				var new_anchor_coords = dojox.gfx.matrix.multiplyPoint(transform, anchor_coords);
				//new_anchor_coords.x -= child_shapes[i].getTextWidth() * child_shapes[i].getTransform().xx;
				var t = dojox.gfx.matrix.translate(new_anchor_coords.x - anchor_coords.x, new_anchor_coords.y - anchor_coords.y);
			
				child_shapes[j].applyLeftTransform(t);
			}
			else{
				child_shapes[j].applyLeftTransform(transform);
				if(j == "angle_text_shape" || j == "measurement"){
					//console.log("wut");
					var real_coords = dojox.gfx.matrix.multiplyPoint(child_shapes[j].getTransform(), child_shapes[j].getShape().x, child_shapes[j].getShape().y);
					
					//console.log("real_coords.x : " + real_coords.x);
					//console.log("width : " + child_shapes[j].getTextWidth());
					child_shapes[j].applyLeftTransform({dx: -(real_coords.x - ((j=='measurement')?child_shapes[j].getTextWidth()/2:0)), dy: 0});
					child_shapes[j].applyLeftTransform({xx: -1, yy: 1});
					child_shapes[j].applyLeftTransform({dx: (real_coords.x - ((j=='measurement')?child_shapes[j].getTextWidth()/2:0)), dy: 0});
				}
			}

		}
		
		//var selected_shape_buffer = PICTIN.shape_manager.selected_shape;
		//PICTIN.shape_manager.unselect_shape(selected_shape_buffer.getNode());
		//PICTIN.shape_manager.select_shape(selected_shape_buffer.getNode());
	}
	
	//PICTIN.resize_canvas(canvas.width, canvas.height);
	//PICTIN.apply_contrabright_process(PICTIN.canvas);
	PICTIN.rollback_manager.recordState();
}
PICTIN.automatic_programs_onclick=function(e){
	PICTIN.current_tool_index = PICTIN.automatic_programs_tool_index;
	PICTIN.toggle_button(this);
	e.stopPropagation();
}
PICTIN.cancel_drawtext=function()
{
	if(PICTIN.textpath)
		PICTIN.surface.remove(PICTIN.textpath);
	if(PICTIN.textpath_cursor)
		PICTIN.surface.remove(PICTIN.textpath_cursor);
	PICTIN.textpath_config.x=null;
	PICTIN.textpath_config.y=null;
	PICTIN.textpath=null;
	PICTIN.textpath_cursor=null;
}
PICTIN.activate_text_editor=function(e)
{
	PICTIN.drawtext_dialog.dialog('open');
	PICTIN.textpath_config={
		x: PICTIN.mousedownx,
		y: PICTIN.mousedowny,
		decoration: PICTIN.textpath_config.decoration,
		fontstyle: PICTIN.textpath_config.fontstyle,
		fontsize: PICTIN.textpath_config.fontsize,
		fontweight: PICTIN.textpath_config.fontweight,
		fontfamily: PICTIN.textpath_config.fontfamily
	}
	////console.log(PICTIN.textpath_config.x);
	if(PICTIN.coord_within_surface(PICTIN.mousedownx, PICTIN.mousedowny))
	{
		jQuery("#pictin-drawtext-value").val('')
			.attr('disabled', false);
	}
	else
	{
		jQuery("#pictin-drawtext-value").val(__('Before setting text, you have to click on the picture where you want to add it.'))
			.attr('disabled', true)
	}
	PICTIN.update_textpath_cursor();

}
PICTIN.activate_text_cursor=function(e)
{
	PICTIN.textpath_config={
		x: PICTIN.mousedownx,
		y: PICTIN.mousedowny,
		decoration: PICTIN.textpath_config.decoration,
		fontstyle: PICTIN.textpath_config.fontstyle,
		fontsize: PICTIN.textpath_config.fontsize,
		fontweight: PICTIN.textpath_config.fontweight,
		fontfamily: PICTIN.textpath_config.fontfamily
	}
	////console.log(PICTIN.textpath_config.x);
	if(PICTIN.coord_within_surface(PICTIN.mousedownx, PICTIN.mousedowny) && PICTIN.drawtext_dialog.is(':visible'))
	{
		PICTIN.update_textpath_cursor();
		jQuery("#pictin-drawtext-value").val('')
			.attr('disabled', false);
	}

}
PICTIN.update_textpath=function()
{
	if(PICTIN.textpath)
		PICTIN.surface.remove(PICTIN.textpath);
		
	var text=PICTIN.surface.createText({
		x: PICTIN.textpath_config.x/PICTIN.zoom_level,
		y: PICTIN.textpath_config.y/PICTIN.zoom_level,
		decoration: PICTIN.textpath_config.decoration,
		text: jQuery('#pictin-drawtext-value').val()
	});
	////console.log(PICTIN.textpath_config.decoration);
	text.setFill('#'+PICTIN.current_color);
	text.setFont({
		style: PICTIN.textpath_config.fontstyle,
		weight: PICTIN.textpath_config.fontweight,
		size: PICTIN.textpath_config.fontsize,
		family: PICTIN.textpath_config.fontfamily
	});
	
	text.applyTransform({xx:PICTIN.zoom_level, yy:PICTIN.zoom_level});	
	//PICTIN.textpath_draggable=dojox.gfx.Moveable(text);
	
	PICTIN.textpath=text;
	PICTIN.update_textpath_cursor();

}
PICTIN.update_textpath_cursor=function()
{
	if(PICTIN.textpath_cursor)
		PICTIN.surface.remove(PICTIN.textpath_cursor);
	
	var group=PICTIN.surface.createGroup();
	
	if(PICTIN.textpath)
	{
		var texth=PICTIN.textpath.getTextHeight();
		var textw=PICTIN.textpath.getTextWidth();
		var x=PICTIN.textpath_config.x;
		var y=PICTIN.textpath_config.y;
		var line_count=PICTIN.textpath.shape.text.split('\n').length;
		var line_height=texth/line_count*PICTIN.zoom_level;
		if(dojo.isIE)
			line_height=Math.ceil(line_height);
		texth=line_height*(line_count-1);
		if(dojo.isIE)
			texth=Math.ceil(texth/2)+1;
	}
	else
	{
		var texth=0;
		var textw=0;
		var x=PICTIN.mousedownx;
		var y=PICTIN.mousedowny;
	}
	
	////console.log('x:'+x);
	
	var line1=group.createLine({'shape-rendering': 'crispEdges', x1: x, y1: y+15+texth, x2: x, y2: y-20-(dojo.isIE ? texth : 0)})
			.setStroke({color:'black', style: 'Solid', width: 1}),
		line2=group.createLine({'shape-rendering': 'crispEdges', x1: x, y1: y+15+texth, x2: x, y2: y-20-(dojo.isIE ? texth : 0)})
			.setStroke({color:'white', style: 'Dash', width: 1}),
		line3=group.createLine({'shape-rendering': 'crispEdges', x1: x-15, y1: y+texth, x2: x+textw, y2: y+texth})
			.setStroke({color:'black', style: 'Solid', width: 1}),
		line4=group.createLine({'shape-rendering': 'crispEdges', x1: x-15, y1: y+texth, x2: x+textw, y2: y+texth})
			.setStroke({color:'white', style: 'Dash', width: 1}),
		label1=group.createText({x:x-25, y:y+12+(texth), text:'abc'})
			.setFill('black')
			.setFont({family:'Arial, Helvetica, sans-serif', size: '9pt', weight:'bold'}),
		label1=group.createText({x:x-23, y:y+12+(texth), text:'abc'})
			.setFill('black')
			.setFont({family:'Arial, Helvetica, sans-serif', size: '9pt', weight:'bold'}),
		label2=group.createText({x:x-24, y:y+13+(texth), text:'abc'})
			.setFill('black')
			.setFont({family:'Arial, Helvetica, sans-serif', size: '9pt', weight:'bold'}),
		label3=group.createText({x:x-24, y:y+11+(texth), text:'abc'})
			.setFill('black')
			.setFont({family:'Arial, Helvetica, sans-serif', size: '9pt', weight:'bold'}),
		label4=group.createText({x:x-24, y:y+12+(texth), text:'abc'})
			.setFill('white')
			.setFont({family:'Arial, Helvetica, sans-serif', size: '9pt', weight:'bold'});
	////console.log(group);
	
	//if(PICTIN.textpath)
	//	group.textpath=group.createShape(PICTIN.surface.removeShape(PICTIN.textpath));
	
	//new dojox.gfx.Moveable(group);
	
	
	PICTIN.textpath_cursor=group;
}
PICTIN.set_cursor=function(cursor)
{
	jQuery('#surface').css('cursor', cursor);
}
PICTIN.set_color=function(hex)
{
	jQuery('.pictin-toolbar-icon-colorpicker').css('background-color', '#'+hex);
	PICTIN.current_color=hex;
}
PICTIN.set_linethickness=function(thickness)
{
	dijit.byId('linethicknessselect').attr('iconClass', 'pictin-toolbar-icon pictin-toolbar-icon-linethickness'+thickness+'px');
	PICTIN.current_linethickness=thickness;
}
PICTIN.load_image=function(url)
{
	var canvas=jQuery('#background')[0];
	var context=canvas.getContext('2d');
	PICTIN.canvas_context = context;
	var bg=new Image();
	
	bg.onload=function(){
		canvas.width=this.width;
		canvas.height=this.height;
		
		context.drawImage(bg, 0, 0, this.width, this.height);
		
		//PICTIN.rollback_manager.recordState();
			
		PICTIN.surface_width=this.width;
		PICTIN.surface_height=this.height;
		jQuery('#surface')
			.html('')
			.css('height', this.height+'px')
			.css('width', this.width+'px');
		PICTIN.surface=dojox.gfx.createSurface(PICTIN.surface_node, this.width, this.height);
		

		if(!jQuery.browser.msie){
	
			//reduce to fit
			var canvas_offset=jQuery(canvas).offset(),
				canvas_bottom=canvas_offset.top+this.height,
				canvas_right=canvas_offset.left+this.width,
				viewport_height=jQuery(window).height(),
				viewport_width=jQuery(window).width();
			
			
			var counter=0; 
			while(canvas_bottom>viewport_height || canvas_right>viewport_width){
				counter++;
				canvas_bottom-=0.1*this.height;
				canvas_right-=0.1*this.width;
			}
			PICTIN.set_zoom_level(1-counter*0.1);
		}
		
		if(typeof(PICTIN.rollback_manager)!='undefined') PICTIN.rollback_manager.reinitialize();
		
		//everything's loaded, hide overlay
		PICTIN.toggle_overlay('hide');

		
	};
	bg.src=url;
	
	
	PICTIN.contrabright_reset();
	PICTIN.canvas=canvas;
	PICTIN.canvas_src=bg;
}

PICTIN.toggle_button=function(btn)
{
	
	//maintenance
	jQuery(document).unbind('mousemove');
	jQuery('#surface').unbind('click', PICTIN.activate_text_editor);
	if(PICTIN.drawtext_dialog)
		PICTIN.drawtext_dialog.dialog('close');
	
	//set cursor
	if(btn.cursor)
		PICTIN.set_cursor(btn.cursor);
	else
		PICTIN.set_cursor('auto');
	
	//patrice's tool requirements
	
	if(PICTIN.current_tool_index != null){
		//DEBUG_PAT.output("current_tool_index is not null", true);
		if (PICTIN.surface_node != null & PICTIN.surface != null & PICTIN.toolboxReady == true) {
			if (PICTIN.current_tool_index != PICTIN.tool_index_buffer) {
				if(PICTIN.current_tool != null){
					PICTIN.current_tool.stop();
				}
		
				PICTIN.current_tool = (PICTIN.tool_arguments!=null)?PICTIN.tool_array[PICTIN.current_tool_index].activate(PICTIN.tool_arguments):PICTIN.tool_array[PICTIN.current_tool_index].activate();
				PICTIN.tool_index_buffer = PICTIN.current_tool_index;
			}else{
				if (PICTIN.current_tool != null) {
					if (PICTIN.current_tool.reinitiate) {
						PICTIN.current_tool.reinitiate();
					}
					else {
						if(PICTIN.current_tool != null){
							PICTIN.current_tool.stop();
						}	
				
						PICTIN.current_tool = (PICTIN.tool_arguments!=null)?PICTIN.tool_array[PICTIN.current_tool_index].activate(PICTIN.tool_arguments):PICTIN.tool_array[PICTIN.current_tool_index].activate();
						PICTIN.tool_index_buffer = PICTIN.current_tool_index;
					}
				}
		}

		}

		
		PICTIN.current_tool_index = null;
	}
	else{
		if(PICTIN.current_tool != null){
			//DEBUG_PAT.output("current_tool_index is null", true);
			PICTIN.current_tool.stop()
			PICTIN.current_tool = null;
			PICTIN.tool_index_buffer = null;
		}
	}
	
	if(btn.attr("id") == "select"){
		//PICTIN.make_tools_selectable();
		PICTIN.shape_manager.make_selectable();
	}
	else{
		PICTIN.shape_manager.make_unselectable();
	}
	
	//toggle off all other buttons
	for(var i=0; i<PICTIN.toolbar_icons.length; i++)
	{
		var val=PICTIN.toolbar_icons[i];
		if(val!=null && val.type=='Toggle')
		{
			dijit.byId(val.id).attr('checked', false);
		}
	}
	
	//do toggle
	btn.attr('checked', !btn.attr('checked'))
}
PICTIN.get_cursor_coords=function(surface, e)
{
	if(typeof surface == 'object')
		var $surface=jQuery(surface);
	else
		var $surface=jQuery('#'+surface);
	
	var surface_offset=$surface.offset() || 0;
	
	////console.log(surface_offset);
	
	
	////console.log("surface id : " + surface);
	////console.log("left offset : " + surface_offset.left);
	////console.log("top offset : " + surface_offset.top);
	////console.log("pagex : " + e.pageX);
	////console.log("pagey : " + e.pageY);
		
	//-1 because of 1px border
	return {x: e.pageX-surface_offset.left-1, y: e.pageY-surface_offset.top-1};	
}

PICTIN.make_tools_selectable = function(){
	for(var i in PICTIN.tool_array){
		PICTIN.tool_array[i].make_selectable();
	}
}

PICTIN.make_tools_unselectable = function(){
	for(var i in PICTIN.tool_array){
		PICTIN.tool_array[i].make_unselectable();
	}
	
	if(PICTIN.shape_buffer != null){
		PICTIN.shape_buffer_tool.unselect(PICTIN.shape_buffer);
		PICTIN.shape_buffer = null;
	}
}

PICTIN.coord_within_surface = function(x, y){
	var $surface = jQuery(PICTIN.surface_node);
	var _max_x = $surface.width() - 1;
	var _max_y = $surface.height() - 1;
	var _min_x = 0;
	var _min_y = 0;

	
	if(	x <= _max_x && x >= _min_x && y <= _max_y && y >= _min_y)
	{	
		return true;		
	}
	
	return false;
}

PICTIN.coord_within_working_area = function(x, y){
	var $surface = jQuery(PICTIN.surface_node);
	var _min_x = -$surface.offset().left;
	var _min_y = 0;
	
	
	if( x >= _min_x && y >= _min_y)
	{	
		return true;		
	}
	
	return false;
}

PICTIN.clone_canvas=function(canvas)
{
	var clone=canvas.cloneNode(true);
	ctx=clone.getContext('2d');
	ctx.drawImage(canvas, 0, 0);
	return clone;
}

PICTIN.reset_contrabright_inputs=function()
{
	PICTIN.contrast_slider.attr('value', '0.00');
	PICTIN.brightness_slider.attr('value', 0);
	
	dojo.byId('pictin-contrast-value').value='0.00';
	dojo.byId('pictin-brightness-value').value=0;
}

PICTIN.init=function(){
	dojo.require("dijit.Dialog");
	dojo.require("dijit.Menu");
	dojo.require("dijit.Toolbar");
	dojo.require("dijit.form.Button");
	dojo.require("dijit.form.Slider");
	
	dojo.require("dojox.gfx");
	dojo.require("dojox.gfx.move");
	dojo.require("dojox.gfx.utils");

	//maximize window
    window.moveTo(0,0);
    window.resizeTo(screen.availWidth, screen.availHeight);
		
	//define main toolbar
	PICTIN.toolbar_icons=[
		//{id: "filemanager", label: __("File Manager"), onclick: PICTIN.filemanager_onclick}, 
		//{id: "save", label: __("Save"), onclick: PICTIN.save_onclick}, 
		//{id: "saveas", label: __("Save As..."), onclick: PICTIN.saveas_onclick},
		{id: "update", label: __("OW6 Update"), onclick: PICTIN.update_ow_onclick},
		//{id: "update_piam", label: __("PIAM Update"), onclick: PICTIN.update_piam_onclick},
		{id: "import", label: __("Import Image"), onclick: PICTIN.import_onclick}, 
		null,
		{id: "undo", label: __("Undo"), onclick:PICTIN.undo_onclick},
		{id: "redo", label: __("Redo"), onclick: PICTIN.redo_onclick},
		null,
		{id: "select", label: __("Select"), type: 'Toggle', onclick: PICTIN.select_onclick},
		{id: "delete", label: __("Delete"), onclick: PICTIN.delete_onclick},
		{id: "areaselect", label: __("Marquee"), type: 'Toggle', onclick: PICTIN.areaselect_onclick}, 
		{id: "contrastbrightness", label: __("Brightness/Contrast"), onclick: PICTIN.contrastbrightness_onclick},
		{id: "colorpicker", label: __("Color"), onclick: PICTIN.colorpicker_onclick},
		null,
		{id: "drawcircle", cursor: 'crosshair', label: __("Circle"), type: 'Toggle', onclick: PICTIN.drawcircle_onclick}, 
		{id: "drawellipse", cursor: 'crosshair', label: __("Ellipse"), type: 'Toggle', onclick: PICTIN.drawellipse_onclick},
		{id: "drawrectangle", cursor: 'crosshair', label: __("Rectangle"), type: 'Toggle', onclick: PICTIN.drawrectangle_onclick}, 
		{id: "drawrectanglesolid", cursor: 'crosshair', label: __("Rectangle (solid)"), type: 'Toggle', onclick: PICTIN.drawrectanglesolid_onclick}, 
		{id: "drawdot", cursor: 'crosshair', label: __("Dot"), type: 'Toggle', onclick: PICTIN.drawdot_onclick}, 
		{id: "drawline", cursor: 'crosshair', label: __("Line"), type: 'Toggle', onclick: PICTIN.drawline_onclick}, 
		{id: "drawlinesegment", cursor: 'crosshair', label: __("Line Segment"), type: 'Toggle', onclick: PICTIN.drawlinesegment_onclick},
		{id: "drawarrow", cursor: 'crosshair', label: __("Arrow"), type: 'Toggle', onclick: PICTIN.drawarrow_onclick}, 
		{id: "drawangle", cursor: 'crosshair', label: __("Angle"), type: 'Toggle', onclick: PICTIN.drawangle_onclick},
		{id: "drawreflex", cursor: 'crosshair', label: __("Reflex Angle"), type: 'Toggle', onclick: PICTIN.drawobtuseangle_onclick},
		{id: "linethicknessselect", label: __("Line Thickness"), type: "Drop", menu: [
			{label: "1 pixel", className: "pictin-toolbar-icon pictin-toolbar-icon-linethickness1px", onclick: PICTIN.linethickness1px_onclick},
			{label: "2 pixels", className: "pictin-toolbar-icon pictin-toolbar-icon-linethickness2px", onclick: PICTIN.linethickness2px_onclick},
			{label: "4 pixels", className: "pictin-toolbar-icon pictin-toolbar-icon-linethickness4px", onclick: PICTIN.linethickness4px_onclick}
		]},
		null,
		{id: "drawtext", cursor: 'text', label: __("Text"), onclick: PICTIN.drawtext_onclick},
		null,
		{id: "calibrate", label: __("Calibrate Scale"), type: 'Toggle', onclick: PICTIN.calibrate_onclick}, 
		{id: "measure", label: __("Measure"), type: 'Toggle', onclick: PICTIN.measure_onclick}, 
		null,
		{id: "rotatecounterclockwise90", label: __("Rotate 90&deg; Counter-Clockwise"), onclick: PICTIN.rotatecounterclockwise90_onclick}, 
		{id: "rotateclockwise90", label: __("Rotate 90&deg; Clockwise"), onclick: PICTIN.rotateclockwise90_onclick}, 
		{id: "rotate180", label: __("Rotate 180&deg;"), onclick: PICTIN.rotate180_onclick},
		null,
		{id: "zoomin", label: __("Zoom In"), onclick:PICTIN.zoomin_onclick}, 
		{id: "zoomreset", label: __("Zoom Reset"), onclick:PICTIN.zoomreset_onclick},
		{id: "zoomout", label: __("Zoom Out"), onclick:PICTIN.zoomout_onclick},
		{id: "horizontal_symetry", label: __("Horizontal symetry"), onclick:PICTIN.horizontal_symetry_onclick},
		null,
		{id: "automatic_programs", label: __("Automatic programs"), type: 'Toggle', onclick:PICTIN.automatic_programs_onclick}
	];
}

PICTIN.bold_onclick=function()
{
	if(this.checked)
	{
		jQuery('#pictin-drawtext-value').css('font-weight', 'bold');
		PICTIN.textpath_config.fontweight='bold';
	}
	else
	{
		jQuery('#pictin-drawtext-value').css('font-weight', 'normal');
		PICTIN.textpath_config.fontweight='normal';
	}
	PICTIN.update_textpath();
}
PICTIN.italic_onclick=function()
{
	if(this.checked)
	{
		jQuery('#pictin-drawtext-value').css('font-style', 'italic');
		PICTIN.textpath_config.fontstyle='italic';
	}
	else
	{
		jQuery('#pictin-drawtext-value').css('font-style', 'normal');
		PICTIN.textpath_config.fontstyle='normal';
	}
	PICTIN.update_textpath();
}
PICTIN.underline_onclick=function()
{
	if(this.checked)
	{
		jQuery('#pictin-drawtext-value').css('text-decoration', 'underline');
		PICTIN.textpath_config.decoration='underline';
	}
	else
	{
		jQuery('#pictin-drawtext-value').css('text-decoration', 'none');
		PICTIN.textpath_config.decoration='none';
	}
	PICTIN.update_textpath();
}
PICTIN.fontsize_onclick=function(size){
	dijit.byId('fontsize').attr('iconClass', 'pictin-drawtext-toolbar-icon  pictin-drawtext-toolbar-icon-fontsize'+size+'px');
	jQuery('#pictin-drawtext-value').css('font-size', size+'px');
	PICTIN.textpath_config.fontsize=size+'px';
}


PICTIN.drawtext_toolbar_icons=[
	{id: "bold", label: "Bold", type: 'Toggle', onclick: PICTIN.bold_onclick}, 
	{id: "italic", label: "Italic", type: 'Toggle', onclick: PICTIN.italic_onclick}, 
	//{id: "underline", label: "Underline", type: 'Toggle', onclick: PICTIN.underline_onclick},
	{id: "fontsize", label: __("Font size"), type: "Drop", menu: [
		{label: "14px", className: "pictin-drawtext-toolbar-icon pictin-drawtext-toolbar-icon-fontsize-menuicon", onclick: function(){PICTIN.fontsize_onclick(14)}},
		{label: "18px", className: "pictin-drawtext-toolbar-icon pictin-drawtext-toolbar-icon-fontsize-menuicon", onclick: function(){PICTIN.fontsize_onclick(18)}},
		{label: "24px", className: "pictin-drawtext-toolbar-icon pictin-drawtext-toolbar-icon-fontsize-menuicon", onclick: function(){PICTIN.fontsize_onclick(24)}},
		{label: "32px", className: "pictin-drawtext-toolbar-icon pictin-drawtext-toolbar-icon-fontsize-menuicon", onclick: function(){PICTIN.fontsize_onclick(32)}},
		{label: "48px", className: "pictin-drawtext-toolbar-icon pictin-drawtext-toolbar-icon-fontsize-menuicon", onclick: function(){PICTIN.fontsize_onclick(48)}},
		{label: "72px", className: "pictin-drawtext-toolbar-icon pictin-drawtext-toolbar-icon-fontsize-menuicon", onclick: function(){PICTIN.fontsize_onclick(72)}}
	]}
]

PICTIN.toggle_overlay=function(force){
	var $overlay=jQuery('#pictin-overlay, #pictin-overlay-content');	
	if($overlay.is(':visible') || force=='hide')
		$overlay.hide();
	else
		$overlay.show();
}

PICTIN.textpath_mousedown=function(){
	
	//console.log('mousedown!');
	//console.log(this);
	var shape_obj = jQuery(this).data("shape_obj");
	var textnode=this;
	jQuery(textnode).data('isSelected', false);
	PICTIN.shape_manager.select_shape(textnode, function(textpath){
		//console.log("selection function");
		var bbox=textpath.getTextBoundingBox();
		/*
		console.log("bbox.x : " + bbox.x);
		console.log("bbox.y : " + bbox.y);
		console.log("bbox.width : " + bbox.width);
		console.log("bbox.height : " + bbox.height);
		console.log("textpath x : " + textpath.getShape().x);
		console.log("textpath y : " + textpath.getShape().y);
		*/
		var shape1={
			shape:PICTIN.surface
				.createRect({id: 'marquee', x: bbox.x, y: bbox.y, width: bbox.width, height: bbox.height, 'shape-rendering': 'crispEdges'})
				.setStroke({color:'#ffffff', width: 1}).applyLeftTransform(textpath.getTransform())
								
		};
		var shape2={shape:PICTIN.surface
			.createRect({id: 'marquee', x: bbox.x, y: bbox.y, width: bbox.width, height: bbox.height, 'shape-rendering': 'crispEdges'})
			.setStroke({color:'#000000', width: 1, style: 'Dash'}).applyLeftTransform(textpath.getTransform())};
			
		jQuery(textnode).data('anchors', [shape1, shape2]);
	}, shape_obj);
}


function __(str){
	if(PICTIN.localized && PICTIN.localized[str])
		return PICTIN.localized[str];
	else
		return str;
}


//javascript include
function loadScript(url, callback)
{
    // adding the script tag to the head as suggested before
   var head= document.getElementsByTagName('head')[0];
   var script= document.createElement('script');
   script.type= 'text/javascript';
   script.src= url;

   // then bind the event to the callback function 
   // there are several events for cross browser compatibility
   script.onreadystatechange = callback;
   script.onload = callback;

   // fire the loading
   head.appendChild(script);
}

//img preloader
(function($) {
  var cache = [];
  // Arguments are image paths relative to the current page.
  $.preLoadImages = function() {
    var args_len = arguments.length;
    for (var i = args_len; i--;) {
      var cacheImage = document.createElement('img');
      cacheImage.src = arguments[i];
      cache.push(cacheImage);
    }
  }
})(jQuery)

//browser detect
var userAgent = navigator.userAgent.toLowerCase();
jQuery.browser = {
	version: (userAgent.match( /.+(?:rv|it|ra|ie|me)[\/: ]([\d.]+)/ ) || [])[1],
	chrome: /chrome/.test( userAgent ),
	safari: /webkit/.test( userAgent ) && !/chrome/.test( userAgent ),
	opera: /opera/.test( userAgent ),
	msie: /msie/.test( userAgent ) && !/opera/.test( userAgent ),
	mozilla: /mozilla/.test( userAgent ) && !/(compatible|webkit)/.test( userAgent )
};
