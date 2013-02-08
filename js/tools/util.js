/**
 * @author patricepaquette
 */

//linear equations functions
function getSegment2P(p1, p2){
	return {x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y};
}
function getMidPoint(x1, y1, x2, y2){
	return {x: x1 + (x2-x1)/2,
			y: y1 + (y2-y1)/2};
}

function getSlope2P(p1, p2){
	return (p2.y - p1.y)/(p2.x - p1.x);
}

function get_line_equation(p1, p2){
 	if(!isNaN(p1.x) && !isNaN(p1.y) && !isNaN(p2.x) && !isNaN(p2.y)){
		var slope = (p2.y - p1.y)/(p2.x - p1.x);
		
		return new line_equation(slope, p1);
	}
	
	return null;
 }
 
 function getLineEquationFromSegment(segment){
	 if(!isNaN(segment.x1) && !isNaN(segment.y1) && !isNaN(segment.x2) && !isNaN(segment.y2)){
		var slope = (segment.y2 - segment.y1)/(segment.x2 - segment.x1);
		
		return new line_equation(slope, {x: segment.x1, y: segment.y1});
	}
	
	return null;
 }
 
 function line_equation(slope, point){
 	this.isVertical = null;
 	this.isHorizontal = null;
 	this.slope = null;
	this.intercept = null;
	this.point = point;
	
	//constructor
	(!isFinite(slope))?this.isVertical=true:this.isVertical=false;
	(!isFinite(slope))?this.slope=null:this.slope=slope;
	(slope == 0)?this.isHorizontal = true:this.isHorizontal = false;
	
	if(!this.isVertical){
		this.intercept = (point.y - (this.slope*point.x));
	}
	
	this.getY = function(x){
		if(this.isVertical == false){
			return this.slope*x + this.intercept;
		}
		
		return null;
	}
	
	this.getX = function(y){
		if(this.slope != 0 && this.isVertical == false){
			return (y-this.intercept)/this.slope
		}
		else if(this.isVertical == true){
			return this.point.x;
		}
		
		return null;
	}
 }
 
 function parametric_line(vector){
	this.O = {x: vector.x1, y: vector.y1};
	var normalized_v = normalize(vector);
	var dx = normalized_v.x2 - normalized_v.x1;
	var dy = normalized_v.y2 - normalized_v.y1;
	
	this.D = {dx: dx, dy: dy};
	
	this.getPoint = function(t){
		var x = this.O.x + t*this.D.dx;
		var y = this.O.y + t*this.D.dy;
		
		
		return {x: x, y: y};
	}
 }
 
 function get_segment_length(x1, y1, x2, y2, width_scaling_factor, height_scaling_factor){
	
	if(width_scaling_factor == null) width_scaling_factor = 1;
	if(height_scaling_factor == null) height_scaling_factor = 1;
	
	var delta_x = (x2-x1)*width_scaling_factor;
	var delta_y = (y2-y1)*height_scaling_factor;
	
	//////console.log("x2-x1 : " + (x2-x1), true);
	//////console.log("delta_x : " + delta_x, true);
	return Math.sqrt(delta_x*delta_x + delta_y*delta_y);
}

function getSegmentLength(segment){
	
	var delta_x = (segment.x2 - segment.x1);
	var delta_y = (segment.y2 - segment.y1);
	
	return Math.sqrt(delta_x*delta_x + delta_y*delta_y);
}

function get_segment_length_from_delta(delta_x, delta_y){
	return Math.sqrt(delta_x*delta_x + delta_y*delta_y);
}

function get_segment_point_closest_to_point(lineEquation, point){
	var vector;
	
	if(lineEquation.isVertical){
		vector = {x1: lineEquation.getX(0), y1: 0, x2: lineEquation.getX(1), y2: 1};
	}
	else{
		vector = {x1: 0, y1: lineEquation.getY(0), x2: 1, y2: lineEquation.getY(1)};
	}
	
	var u;
	u = ((point.x - vector.x1)*(vector.x2 - vector.x1) + (point.y - vector.y1)*(vector.y2 - vector.y1))/Math.pow(getSegmentLength(vector), 2);
	var x = vector.x1 + u*(vector.x2-vector.x1);
	var y = vector.y1 + u*(vector.y2-vector.y1);
	
	return {x: x, y: y};
}

function getShortestDistance_PointLine(lineEquation, point){
	var vector;
	
	if(lineEquation.isVertical){
		vector = {x1: lineEquation.getX(0), y1: 0, x2: lineEquation.getX(1), y2: 1};
	}
	else{
		vector = {x1: 0, y1: lineEquation.getY(0), x2: 1, y2: lineEquation.getY(0)};
	}
	
	var intersection = get_segment_point_closest_to_point(lineEquation, point);
	var distance = getSegmentLength({x1: intersection.x, y1: intersection.y, x2: point.x, y2: point.y});
	
	return distance;
}

function getIntersectionPoint_2Lines(segment1, segment2){
	var x1 = segment1.x1;
	var y1 = segment1.y1;
	var x2 = segment1.x2;
	var y2 = segment1.y2;
	var x3 = segment2.x1;
	var y3 = segment2.y1;
	var x4 = segment2.x2;
	var y4 = segment2.y2;
	
	var u = (((x4-x3)*(y1-y3)) - ((y4-y3)*(x1-x3)))/((y4-y3)*(x2-x1)-(x4-x3)*(y2-y1));
	
	////console.log("u : " + u);
	var x = x1 + u*(x2-x1);
	var y = y1 + u*(y2-y1);
	
	return {x: x, y: y};
}

function getIntersectionPoint_2LineEquations(eq1, eq2){
	if(eq1.isVertical && eq1.isVertical){
		return null;
	}
	else if(eq1.isVertical){
		var x = eq1.getX(0);
		return {x: x, y: (eq2.slope*x - eq2.intercept)};
	}
	else if(eq2.isvertical){
		var x = eq2.getX(0);
		return {x: x, y: (eq1.slope*x - eq1.intercept)};
	}
	else{
		var x = (eq1.intercept - eq2.intercept)/(eq2.slope - eq1.slope);
		return {x: x, y: eq1.getY(x)};
	}
}

function getIntersectionPoints_SegmentCircle(segment, circle){
	var x1 = segment.x1;
	var y1 = segment.y1;
	var x2 = segment.x2;
	var y2 = segment.y2;
	var x3 = circle.cx;
	var y3 = circle.cy;
	var r = circle.r;
	var a = Math.pow((x2-x1), 2) + Math.pow((y2-y1), 2);
	var b = 2*((x2-x1)*(x1-x3) + (y2-y1)*(y1-y3));
	var c = Math.pow(x3, 2) + Math.pow(y3, 2) + Math.pow(x1, 2) + Math.pow(y1, 2) - 2*(x3*x1 + y3*y1) - Math.pow(r, 2);
	
	var value1 = (-b + Math.sqrt(Math.pow(b, 2) - (4*a*c)))/(2*a);
	var value2 = (-b - Math.sqrt(Math.pow(b, 2) - (4*a*c)))/(2*a);
	
	////console.log("x1 : " + x1);
	////console.log("y1 : " + y1);
	////console.log("x2 : " + x2);
	////console.log("y2 : " + y2);
	////console.log("x3 : " + x3);
	////console.log("y3 : " + y3);
	////console.log("value1 : " + value1);
	////console.log("value2 : " + value2);
	////console.log("a : " + a);
	////console.log("b : " + b);
	////console.log("c : " + c);
	if((value1<0 && value2<0) || (value1>1 && value2>1)){ //doesnt intersect and is outside
		////console.log("doesnt intersect and its outside");
		return new Array();
	}
	else if((value1<0 && value2>1) || (value1>1 && value2<0)){ //doesnt intersect and is inside
		////console.log("doesnt intersect and is inside");
		return new Array();
	}
	else if(((value1<0 || value1>1) && value2>=0 && value2<=1) || (value1>=0 && value1<=1 && (value2<0 || value2>1))){ //intersects at one point
		var u = (value1>=0 && value1<=1)?value1:value2;
		var p1 = {};
		p1.x = x1 + u*(x2-x1);
		p1.y = y1 + u*(y2-y1);
		
		////console.log("intersects at one point");
		var points = new Array();
		points.push(p1);
		
		return points; 
	}
	else if(value1 == value2){ //is tangential
		var p1 = {};
		p1.x = x1 + value1*(x2-x1);
		p1.y = y1 + value1*(y2-y1);
		
		////console.log("is tangential");
		var points = new Array();
		points.push(p1);
		
		return points; 
	}
	else{ //intersects in 2 points
		var p1 = {};
		p1.x = x1 + value1*(x2-x1);
		p1.y = y1 + value1*(y2-y1);
		p2.x = x1 + value2*(x2-x1);
		p2.y = y1 + value2*(y2-y1);
		
		////console.log("intersects in 2 points");
		var points = new Array();
		points.push(p1);
		points.push(p2);
		
		return points; 
	}
	
}

function toDegrees(angle){
	return angle * 180/Math.PI;
}

function calculate_angle(p1, p2, p3){
		
	var segment3_shape = {
		x1: p1.x,
		y1: p1.y,
		x2: p3.x,
		y2: p3.y
	};
	var a = get_segment_length(p1.x, p1.y, p2.x, p2.y);
	var b = get_segment_length(p2.x, p2.y, p3.x, p3.y);
	var c = get_segment_length(segment3_shape.x1, segment3_shape.y1, segment3_shape.x2, segment3_shape.y2);
	
	var angle = Math.acos((a*a + b*b - c*c) / (2 * a * b));
	return angle;
}


function getAngle_2Seg(segment1, segment2){
	normalized_seg1 = normalize(segment1);
	normalized_seg2 = normalize(segment2);
	
	angle = Math.atan2(normalized_seg2.y2-normalized_seg2.y1, normalized_seg2.x2-normalized_seg2.x1)-Math.atan2(normalized_seg1.y2-normalized_seg1.y1, normalized_seg1.x2-normalized_seg1.x1); 
	
	//var intersectionPoint = getIntersectionPoint_2Lines(segment1, segment2);
	//var p1 = {x: segment1.x1, y: segment1.y1};
	//var p2 = intersectionPoint;
	//var p3 = segment2
	
	return angle;
}

function normalize(vector){
	var tmpSegment = {};
	norm = get_segment_length(vector.x1, vector.y1, vector.x2, vector.y2);
	var dx = vector.x2 - vector.x1;
	var dy = vector.y2 - vector.y1;
	dx = dx/norm;
	dy = dy/norm;
	tmpSegment.x1 = vector.x1;
	tmpSegment.y1 = vector.y1;
	tmpSegment.x2 = vector.x1 + dx;
	tmpSegment.y2 = vector.y1 + dy;
	
	return tmpSegment;
}

function dot_product(v1, v2){
	var v1dx = v1.x2 - v1.x1;
	var v1dy = v1.y2 - v1.y1;
	var v2dx = v2.x2 - v2.x1;
	var v2dy = v2.y2 - v2.y1;
	
	return v1dx*v2dx + v1dy*v2dy;
}

function getLabelPosition_segment(segment){
	
	var _x = segment.x1 + (segment.x2-segment.x1)/2;
	var _y = segment.y1 + (segment.y2-segment.y1)/2;
	var denominator = (segment.y2-segment.y1);
	var numerator = (segment.x2-segment.x1);
	var slope = (denominator != 0)?numerator/denominator:null;
	var angle = Math.atan(slope);
	var hyp = 13;
	
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
	
	return {x: _x, y: _y};
}

function getLabelPosition_angle(p1, p2, p3, obtuse){
	
	var segment1_num = p2.y - p1.y;
	var segment1_den = p2.x - p1.x;
	var segment1_slope = (segment1_den == 0)?null:segment1_num/segment1_den;
	var segment2_num = p3.y - p2.y;
	var segment2_den = p3.x - p2.x;
	var segment2_slope = (segment2_den == 0)?null:segment2_num/segment2_den;
	var segment1_angle;
	var segment2_angle;
	
	if(segment1_slope == null) 
		segment1_angle = -Math.PI/2;
	else 
		segment1_angle = Math.atan(segment1_slope);
	
	if(segment2_slope == null) 
		segment2_angle = -Math.PI/2;
	else
		segment2_angle = Math.atan(segment2_slope);
		
	////console.log("segment2_num : " + segment2_num);
	////console.log("segment2_den : " + segment2_den);
	////console.log("segment1_slope : " + segment1_slope);
	////console.log("segment2_slope : " + segment2_slope);
	////console.log("segment1_angle : " + segment1_angle*180/Math.PI);
	////console.log("segment2_angle : " + segment2_angle*180/Math.PI);
	var bisect_angle = (p1.x < p2.x && p3.x < p2.x || p1.x > p2.x && p3.x > p2.x) ? (segment1_angle + segment2_angle) / 2 : (segment1_angle + segment2_angle + Math.PI) / 2;
	var hyp = (obtuse)?20:35;
	var slope_mid = Math.tan(bisect_angle);
	var mid_segment_x = Math.cos(bisect_angle) * hyp;
	var mid_segment_y = Math.sin(bisect_angle) * hyp;
	
	var _x = (obtuse) ? p2.x + mid_segment_x : p2.x - mid_segment_x;
	var _y = (obtuse) ? p2.y + mid_segment_y : p2.y - mid_segment_y;

	var temp_angle = calculate_angle({
		x: _x,
		y: _y
	}, {
		x: p2.x,
		y: p2.y
	}, {
		x: p3.x,
		y: p3.y
	});
	
	if ((obtuse) ? temp_angle < Math.PI / 2 : temp_angle >= Math.PI / 2) {
		_x = (obtuse) ? p2.x - mid_segment_x : p2.x + mid_segment_x;
		_y = (obtuse) ? p2.y - mid_segment_y : p2.y + mid_segment_y;
	}
	
	return {x: _x, y: _y};
	

}
//linear equations functions ENDS
 

var UTILS = {};


function get_inverse_color(color){
	var t1 = '0123456789abcdef#';
	var t2 = 'fedcba9876543210#';

	return color.replace( /./gi, function(s){
		return t2.charAt(t1.indexOf(s));
	})
}

function RGBtoHex(R,G,B) {return toHex(R)+toHex(G)+toHex(B)}
function toHex(N) {
 if (N==null) return "00";
 N=parseInt(N); if (N==0 || isNaN(N)) return "00";
 N=Math.max(0,N); N=Math.min(N,255); N=Math.round(N);
 return "0123456789ABCDEF".charAt((N-N%16)/16)
      + "0123456789ABCDEF".charAt(N%16);
}

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

//misc
UTILS.isdefined = function(object, variable)
{
	return (typeof(eval(object)[variable]) != 'undefined');
}

// Make an element draggable using jQuery  
function make_shape_draggable(params) {
    element = jQuery(params.node);  
		
    // Move the element by the amount of change in the mouse position  
    var move = function(event) { 
		
        if(element.data('mouseMove')) {

            var changeX = event.clientX - element.data('mouseX');  
            var changeY = event.clientY - element.data('mouseY'); 
			var shape = jQuery(params.node).data("shape_obj");
			
            shape.applyLeftTransform({dx: changeX, dy: changeY});
  
            element.data('mouseX', event.clientX);  
            element.data('mouseY', event.clientY);
			
			if (params.onmove_callback) {
				params.onmove_callback(changeX, changeY);
			}
			else {
				if (dijit.byId("select").attr("checked") == true) {
					var _anchor_array = jQuery(params.node).data("anchors");
					for (var i in _anchor_array) {
						_anchor_array[i].apply_left_transform({
							dx: changeX,
							dy: changeY
						});
					}
				}
			}
        }  
    }  
  
    element.bind("mousedown", function(event) {  
        element.data('mouseMove', true);  
        element.data('mouseX', event.clientX);  
        element.data('mouseY', event.clientY);
		event.stopImmediatePropagation(); 
    });  
  
    element.bind("mouseup", function(event) {  
        element.data('mouseMove', false); 
		event.stopImmediatePropagation(); 
    });  
  
    //element.bind("mouseout", move);  
    element.bind("mousemove", move);  
}

//jQuery addons
jQuery.fn.listHandlers = function(events, outputFunction) {
    return this.each(function(i){
        var elem = this,
            dEvents = jQuery(this).data('events');
        if (!dEvents) {return;}
        jQuery.each(dEvents, function(name, handler){
            if((new RegExp('^(' + (events === '*' ? '.+' : events.replace(',','|').replace(/^on/i,'')) + ')$' ,'i')).test(name)) {
               jQuery.each(handler, function(i,handler){
                   	console.log(elem, '\n' + i + ': [' + name + '] : ' + handler.handler );
               		
               });
           }
        });
    });
};

//UID ex :
//jQuery('<div>').getUID(); // sets id attribute to "jQ-uid-1" and returns it
(function(jQuery) {
    var uid = 0;
    jQuery.getUID = function() {
        uid++;
        return 'jQ-uid-'+uid;
    };
    jQuery.fn.getUID = function() {
        if(!this.length) {
            return 0;
        }
        var fst = this.first(), id = fst.data('UID');
        if(!id) {
            id = jQuery.getUID();
            fst.data('UID', id);
        }
        return id;
    }
})(jQuery);


//others

function get_zoomed_value(value){
	return value/=PICTIN.zoom_level;
}



//ZOOMED AREA USING MARQUEE
ZOOM_AREA = {};
function start_zoom_area(callback, ok_function, args, additional_btns_obj_array){
	DEBUG_PAT.output_obj(additional_btns_obj_array, "in start_zoom_area", true);
	ZOOM_AREA.width_scaling_factor = 1;
	ZOOM_AREA.height_scaling_factor = 1;
	ZOOM_AREA.scaling_factor = 1;
	DEBUG_PAT.output_obj(additional_btns_obj_array, "additional_btns_obj_array", true);
	activate_marquee(calibrate_mouseupHandler, {callback: callback, ok_function: ok_function, args: args, additional_btns_obj_array: additional_btns_obj_array});
}

function open_zoomed_area_dialog(callback, ok_function, args, additional_btns_obj_array){
	DEBUG_PAT.output("in open_zoomed_area_dialog");
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
	
	var btns_obj_array = {};
	btns_obj_array["Ok"] = function(){
								ZOOM_AREA.scaling_factor = 1;
								ZOOM_AREA.width_scaling_factor = 1;
								ZOOM_AREA.height_scaling_factor = 1;
								jQuery(this).dialog("close");
								ok_function(args);
	};

	DEBUG_PAT.output_obj(additional_btns_obj_array, "additional_btns_obj_array", true);
	if(additional_btns_obj_array != null){
		for(var i in additional_btns_obj_array){
			DEBUG_PAT.output("additional_btns_obj_array text: " + additional_btns_obj_array[i].text);
			DEBUG_PAT.output("additional_btns_obj_array function : " + additional_btns_obj_array[i].function);
			btns_obj_array[additional_btns_obj_array[i].text] = additional_btns_obj_array[i].function;
		}
	}
			
	if(PICTIN.marquee)
	{
		//PICTIN.debug("marquee.x: "+PICTIN.marquee.x+", marquee.y: "+PICTIN.marquee.y);
		
		
		bgcanvas=PICTIN.marquee[0].shape;
		bgaspectratio=bgcanvas.width/bgcanvas.height;
		var data=bgcontext.getImageData(bgcanvas.x, bgcanvas.y, bgcanvas.width, bgcanvas.height),
		canvas=jQuery('<canvas></canvas>').attr('height', bgcanvas.height).attr('width', bgcanvas.width)[0];
		canvas.getContext('2d').putImageData(data, 0, 0);
		
		ZOOM_AREA.width_scaling_factor = PICTIN.marquee[0].shape.width/precanvas_width;
		ZOOM_AREA.height_scaling_factor = PICTIN.marquee[0].shape.height/precanvas_height;
				
		if(bgaspectratio>1)
		{
			var height=precanvas.height/bgaspectratio,
				toplefty=(precanvas.height-height)/2;
			
			
			scaling_factor = PICTIN.marquee[0].shape.width/precanvas_width;
			precanvas.height = height;
			prectx.drawImage(canvas, 0, 0, precanvas.width, height);
			
			args.scaling_factor = scaling_factor;
			ZOOM_AREA.scaling_factor = scaling_factor;
		
			var dialog = jQuery("#zoomed-area-dialog").dialog({
				resizable: false,
				title: 'Circle area',
				width: precanvas.width + 30,
				height: height + 135,
				autoOpen: false,
				buttons: btns_obj_array,
				close: unexpected_leave,
				zIndex:10
			});
			jQuery('#zoomed-area-surface')
				.html('')
				.css('height', height+'px')
				.css('width', precanvas.width+'px');
			
			PICTIN.surface_buffer = PICTIN.surface;
			PICTIN.surface = dojox.gfx.createSurface(jQuery("#zoomed-area-surface")[0], precanvas.width, height);
			PICTIN.surface_id = "zoomed-area-surface";
			
		}
		else
		{
			var width=precanvas.width*bgaspectratio,
				topleftx=(precanvas.width-width)/2;
				
			scaling_factor = PICTIN.marquee[0].shape.height/precanvas_height;
			precanvas.width = width;
			prectx.drawImage(canvas, 0, 0, width, precanvas.height);
			
			args.scaling_factor = scaling_factor;
			ZOOM_AREA.scaling_factor = scaling_factor;
			var dialog = jQuery("#zoomed-area-dialog").dialog({
				resizable: false,
				title: 'Circle area',
				width: width + 30,
				height: precanvas.height + 135,
				autoOpen: false,
				buttons: btns_obj_array,
				close: unexpected_leave,
				zIndex:10
			})
			
			jQuery('#zoomed-area-surface')
				.html('')
				.css('height', precanvas.height+'px')
				.css('width', width+'px');
			
			PICTIN.surface_buffer = PICTIN.surface;
			PICTIN.surface = dojox.gfx.createSurface(jQuery("#zoomed-area-surface")[0], width, precanvas.height);
			PICTIN.surface_id = "zoomed-area-surface";
		}
		
		
	}
	dialog.dialog("open");
	
	jQuery(document).unbind("mouseup", calibrate_mouseupHandler);
	
	//go to callback function
	callback();
	//create_calibration_circle();
}
	
var calibrate_mouseupHandler = function(e){
	DEBUG_PAT.output("in calibrate_mouseupHandler");
	if (PICTIN.marquee != null && PICTIN.coord_within_working_area(PICTIN.mouseupx, PICTIN.mouseupy)) {
		DEBUG_PAT.output("in calibrate_mouseupHandler step 2");
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
		
		
		open_zoomed_area_dialog(e.data.callback, e.data.ok_function, e.data.args, e.data.additional_btns_obj_array);
	}
}

//END ZOOMED AREA USING MARQUEE


//ACTIVATE MARQUEE
function activate_marquee(mouseup_handler, args){
	DEBUG_PAT.output("in activate_marquee");
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
	
	jQuery(document).bind("mouseup.marquee", args, mouseup_handler);
}
 //END ACTIVATE MARQUEE
 
 //manage pictin color
 PICTIN.colorBuffer;
 PICTIN.setColor = function(color, keepSameColorBuffer){
	 if(!keepSameColorBuffer) PICTIN.colorBuffer = PICTIN.current_color;
	 PICTIN.current_color = color;
 }
 PICTIN.restoreColor = function(){
	 PICTIN.current_color = PICTIN.colorBuffer;
 }
 
 //misc

//get the button from a jquery dialog 
function getDialogButton( dialog_selector, button_name )
{
  var buttons = jQuery( dialog_selector + ' .ui-dialog-buttonpane button' );
  for ( var i = 0; i < buttons.length; ++i )
  {
     var jButton = jQuery( buttons[i] );
     if ( jButton.text() == button_name )
     {
         return jButton;
     }
  }

  return null;
}


 