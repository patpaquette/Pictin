
PMAP = {};
PMAP.labelID;
PMAP.resultRowID;
PMAP.taskCounter = 0;
PMAP.resultCounter = 0;
PMAP.dotArray = new Array();
PMAP.stepColor = new Array();
PMAP.stepColor.push("ff0000");
PMAP.stepColor.push("FFFF00");
PMAP.stepColor.push("ff0000");
PMAP.stepColor.push("ff0000");
PMAP.stepColor.push("ff0000");
PMAP.stepColor.push("ff0000");
PMAP.stepColor.push("ff0000");
PMAP.stepColor.push("ff0000");
PMAP.stepColor.push("ff0000");
PMAP.stepColor.push("ff0000");
PMAP.stepColor.push("ff0000");
PMAP.stepColor.push("ff0000");
PMAP.stepColor.push("ff0000");

function PMAP_init(){
	PMAP.taskCounter = 0;
	PMAP.resultCounter = 0;
}
function PMAP_initTask(){
	
	for(var i in PMAP.dotArray){
		//dot.setStroke({color: "#00ff00"});
		PMAP.dotArray[i].setStroke({color: "#00ff00"});
	}
	
	if(PMAP.taskCounter > ATOOL.descDataList.length){
		jQuery("#tool_info").dialog({title: ATOOL.taskLabelList[PMAP.taskCounter].label});
	}
	else if(PMAP.taskCounter > 0){
		jQuery("#" + ATOOL.taskLabelList[PMAP.taskCounter-1].id + " > span").toggleClass("AT_stepCurrent AT_stepFinished");
		
		//adding images and desc
		jQuery("#tool_info").dialog({title: ATOOL.taskLabelList[PMAP.taskCounter].label});
		jQuery("#step_image").empty().append('<img class="centered" style = "width:450px;height:450px;" src="' + ATOOL.descDataList[PMAP.taskCounter-1].img + '"//>');
		jQuery("#step_desc").empty().append('<p class="image_desc">' + ATOOL.descDataList[PMAP.taskCounter-1].text + '</p>');
	}
	else{
		jQuery("#tool_info").dialog({title: ATOOL.taskLabelList[PMAP.taskCounter].label});
	}
	
	PICTIN.setColor(PMAP.stepColor[PMAP.taskCounter], false);
	
	jQuery("#" + ATOOL.taskLabelList[PMAP.taskCounter].id + " > span").toggleClass("AT_stepTodo AT_stepCurrent");
	PMAP.taskCounter++;
	PICTIN.automatic_programs_tool.refreshWindowPosition();
}

function PMAP_addResult(result){
	jQuery("#" + ATOOL.resultLabelList[PMAP.resultCounter].id + " > span").toggleClass("AT_stepTodo AT_stepFinished");
	jQuery("#" + ATOOL.resultLabelList[PMAP.resultCounter].id).append('<span class="AT_result AT_stepFinished">' + result + '</span>');
	PMAP.resultCounter++;
}



//TASK 0
function PMAP_task0(a_task, a_taskData){
	PMAP_init();
	PMAP_initTask()
	
	jQuery("#step_image").empty();
	jQuery("#step_desc").empty().append(jQuery("#PMAP_form").html());
	
	var button = getDialogButton('.tool_info', 'Validate');
	if(button){
		button.attr('disabled', 'disabled').addClass('ui-state-disabled');
	}
	
	
	var proceed = false;
	var gender_chosen = false;
	var side_chosen = false;
	jQuery(document).bind("PIAM_gender_chosen", function(e){
		if(side_chosen){
			button.removeAttr('disabled').removeClass('ui-state-disabled');
		}
		else{
			gender_chosen = true;
		}
	});
	
	jQuery(document).bind("PIAM_side_chosen", function(e){
		if(gender_chosen == true){
			button.removeAttr('disabled').removeClass('ui-state-disabled');
		}
		else{
			side_chosen = true;
		}
	});
	
	jQuery(document).bind("form_validated.PMAP", function(e){
		a_taskData["results"]["SOF"] = jQuery('input[name=SOF]:checked').val();
		if(typeof(a_taskData["results"]["SOF"]) == "undefined") a_taskData["results"]["SOF"] = "ND";
		a_taskData["results"]["ASC"] = jQuery('input[name=ASC]:checked').val();
		if(typeof(a_taskData["results"]["ASC"]) == "undefined") a_taskData["results"]["ASC"] = "ND";
		a_taskData["results"]["DSC"] = jQuery('input[name=DSC]:checked').val();
		if(typeof(a_taskData["results"]["DSC"]) == "undefined") a_taskData["results"]["DSC"] = "ND";
		a_taskData["results"]["MCVSLT"] = jQuery('input[name=MCVSLT]:checked').val();
		if(typeof(a_taskData["results"]["MCVSLT"]) == "undefined") a_taskData["results"]["MCVSLT"] = "ND";
		a_taskData["results"]["KONA"] = jQuery('input[name=KONA]:checked').val();
		if(typeof(a_taskData["results"]["KONA"]) == "undefined") a_taskData["results"]["KONA"] = "ND";
		a_taskData["results"]["gender"] = jQuery('input[name=gender]:checked').val();
		a_taskData["results"]["side"] = jQuery('input[name=side]:checked').val();
		
		jQuery("#tool_info").dialog({
									buttons: {}
									});
		jQuery(document).unbind("form_validated.PMAP");
		jQuery(document).trigger(a_task.eventFinished, [a_task]);
	});
}


//END TASK 0

//TASK 1
function PMAP_task1(a_task, a_taskData){
	
	PMAP_initTask();
	
	////console.log("label id : " + PMAP.labelID);
	jQuery("#" + PMAP.labelID + " > span").toggleClass("AT_stepTodo AT_stepFinished");
	
	jQuery(document).bind("CALIBRATION_DONE.ATOOL", function(){
		////console.log("calibration done");
		PICTIN.calibrate_tool.stop();
		PICTIN.rollback_manager.recordState();
		jQuery(document).trigger(a_task.eventFinished, [a_task]);
		jQuery(document).unbind("CALIBRATION_DONE.ATOOL");
	});
	
	PICTIN.automatic_programs_tool.activateTool(PICTIN.calibrate_tool);
}
//END TASK 1

//TASK 2 - Pelvic reference line + bottome reference line
function PMAP_task2(a_task, a_taskData){
	PMAP_initTask();
	tm = new TaskManager("PMAP_task2_subtasks");
	tm.taskData = a_taskData;
	PICTIN.automatic_programs_tool.registerRecordStateFunc(tm.recordState);
	PICTIN.automatic_programs_tool.registerRollbackFunc(tm.rollback);
	var task1 = tm.createTask("subtask1", PMAP_task2_subtask_drawDots);
	var task2 = tm.createTask("subtask2", PMAP_task2_subtask_drawRefLines);
	task2.addPrereq(task1);
	tm.start();
	jQuery(document).bind("PMAP_task2_subtasks_finished", function(e){
		jQuery(document).trigger(a_task.eventFinished, [a_task]);
	});
}

function PMAP_task2_subtask_drawDots(a_task, a_taskData){
	this.counter = 0;
	var me = this;

	jQuery(document).bind("DOT.drawn.ATOOL", function(e, position, dot){
		////console.log("wut");
		PICTIN.automatic_programs_tool.addShape(dot);
		a_taskData["task2.dot" + me.counter + "Pos"] = position;
		PMAP.dotArray.push(dot);
		////console.log("counter : " + me.counter);
		if(me.counter == 1){
			PICTIN.tool_dot.stop();
			jQuery(document).unbind("DOT.drawn.ATOOL");
			jQuery(document).trigger(a_task.eventFinished, [a_task]);
		}
		me.counter++;
	});

	PICTIN.automatic_programs_tool.activateTool(PICTIN.tool_dot);
}

function PMAP_task2_subtask_drawRefLines(a_task, a_taskData){
	var x1 = a_taskData["task2.dot0Pos"].x;
	var y1 = a_taskData["task2.dot0Pos"].y;
	var x2 = a_taskData["task2.dot1Pos"].x;
	var y2 = a_taskData["task2.dot1Pos"].y;
	var dx = x2-x1;
	var dy = y2-y1;
	var line_equation = get_line_equation({x: x1, y: y1}, {x: x2, y: y2});
	var length = get_segment_length(x1, y1, x2, y2);
	var angle = (line_equation.slope == null)?Math.PI:Math.atan(line_equation.slope);

	
	////console.log("angle : " + angle);
	//line1
	var line1 = PICTIN.surface.createLine({	x1: -length/2, 
											y1: 0,
											x2: length/2, 
											y2: 0}).setStroke({
																color: "#FCF800", 
																width: PICTIN.current_linethickness
																});
	var label1 = PICTIN.surface.createText({x: length/4,
											y: -5,
											text: "PRL"
	}).setStroke({	color: "#FCF800" });
																					
	var translate = dojox.gfx.matrix.translate(	x1 + dx/2, 
												y1 + dy/2);
	var rotate = dojox.gfx.matrix.rotate(angle);
	var scale = dojox.gfx.matrix.scale(3, 1);
	var transform = dojox.gfx.matrix.multiply(translate, rotate, scale);
	line1.applyLeftTransform(transform);
	label1.applyLeftTransform(translate);
	
	//line2
	var line2 = PICTIN.surface.createLine({	x1: -length/2, 
											y1: 0,
											x2: length/2, 
											y2: 0}).setStroke({
																color: "#FCF800", 
																width: PICTIN.current_linethickness
																});
																
	var label2 = PICTIN.surface.createText({x: 5,
											y: -length/2,
											text: "IIL"
	}).setStroke({	color: "#FCF800"});
	
	translate = dojox.gfx.matrix.translate(x1, y1);
	rotate = dojox.gfx.matrix.rotate(angle+Math.PI/2);
	scale = dojox.gfx.matrix.scale(1.5, 1);
	transform = dojox.gfx.matrix.multiply(translate, rotate, scale);
	line2.applyLeftTransform(transform);
	label2.applyLeftTransform(translate);
	
	//line3
	var line3 = PICTIN.surface.createLine({ x1: -length/2, 
											y1: 0,
											x2: length/2, 
											y2: 0}).setStroke({
																color: "#FCF800", 
																width: PICTIN.current_linethickness
																});
									
	var label3 = PICTIN.surface.createText({x: -20,
											y: -length/2,
											text: "IIL"
	}).setStroke({	color: "#FCF800"});
																
	PICTIN.automatic_programs_tool.addShape(line1);
	PICTIN.automatic_programs_tool.addShape(line2);
	PICTIN.automatic_programs_tool.addShape(line3);
	PICTIN.automatic_programs_tool.addShape(label1);
	PICTIN.automatic_programs_tool.addShape(label2);
	PICTIN.automatic_programs_tool.addShape(label3);
	
	translate = dojox.gfx.matrix.translate(x2, y2);
	transform = dojox.gfx.matrix.multiply(translate, rotate, scale);
	line3.applyLeftTransform(transform);
	label3.applyLeftTransform(translate);
	
	var transformedPoint1 = dojox.gfx.matrix.multiplyPoint(line2.getTransform(), line2.getShape().x1, line2.getShape().y1);
	var transformedPoint2 = dojox.gfx.matrix.multiplyPoint(line2.getTransform(), line2.getShape().x2, line2.getShape().y2);
	a_taskData["task2_segment2"] = {x1: transformedPoint1.x, y1: transformedPoint1.y, x2: transformedPoint2.x, y2: transformedPoint2.y};
	transformedPoint1 = dojox.gfx.matrix.multiplyPoint(line3.getTransform(), line3.getShape().x1, line3.getShape().y1);
	transformedPoint2 = dojox.gfx.matrix.multiplyPoint(line3.getTransform(), line3.getShape().x2, line3.getShape().y2);
	a_taskData["task2_segment3"] = {x1: transformedPoint1.x, y1: transformedPoint1.y, x2: transformedPoint2.x, y2: transformedPoint2.y};
	transformedPoint1 = dojox.gfx.matrix.multiplyPoint(line1.getTransform(), line1.getShape().x1, line1.getShape().y1);
	transformedPoint2 = dojox.gfx.matrix.multiplyPoint(line1.getTransform(), line1.getShape().x2, line1.getShape().y2);
	a_taskData["task2_segment1"] = {x1: transformedPoint1.x, y1: transformedPoint1.y, x2: transformedPoint2.x, y2: transformedPoint2.y};
	
	//determining which side IIL to use.
	if(a_taskData["results"]["side"] == "right"){
		a_taskData["IIL"] = a_taskData["task2_segment2"];
	}
	else{
		a_taskData["IIL"] = a_taskData["task2_segment3"];
	}
																	
	jQuery(document).trigger(a_task.eventFinished, [a_task]);
}
//END TASK 2

//TASK 3 - HC + HP
function PMAP_task3(a_task, a_taskData){
	PMAP_initTask();
	
	var tm = new TaskManager("PMAP_task3_subtasks");
	tm.taskData = a_taskData;
	PICTIN.automatic_programs_tool.registerRecordStateFunc(tm.recordState);
	PICTIN.automatic_programs_tool.registerRollbackFunc(tm.rollback);
	var task1 = tm.createTask("PMAP_task3_subtask1", PMAP_task3_subtask_drawCircle);
	var task2 = tm.createTask("PMAP_task3_subtask2", PMAP_task3_subtask_drawCenterToLine);
	var task3 = tm.createTask("PMAP_task3_subtask3", PMAP_task3_subtask_measureSegments);
	
	task2.addPrereq(task1);
	task3.addPrereq(task2);
	//var task2 = tm.createTask("PMAP_task3_subtask2", PMAP_task3_subtask_calculateAngle);
	//task2.addPrereq(task1);
	tm.start();
	
	
	jQuery(document).bind("PMAP_task3_subtasks_finished", function(e){
		////console.log("lawl");
		jQuery(document).trigger(a_task.eventFinished, [a_task]);
	});
}

function PMAP_task3_subtask_drawCircle(a_task, a_taskData){
	var dotCounter = 0;
	var dotPos = new Array();
	
	jQuery(document).bind("DOT.drawn.ATOOL", function(e, position, dot){
		PMAP.dotArray.push(dot);
		if(dotCounter == 0){
			a_taskData["C1"] = {x: dot.getShape().cx, y: dot.getShape().cy};
		}
		
		if(dotCounter < 2){
			dotPos.push({x: position.x, y: position.y});
			dotCounter++;
		}
		else{
			dotPos.push({x: position.x, y: position.y});
			var center = {};
			var circle = compute_circle(dotPos[0], dotPos[1], dotPos[2]);
			
			if(dot.getTransform() != null){
				center = dojox.gfx.matrix.multiplyPoint(dot.getTransform(), circle.Xo, circle.Yo);
			}
			else{
				center.x = circle.Xo;
				center.y = circle.Yo;
			}
			
			//draw C (center)
			var circle1 = PICTIN.surface.createCircle({	cx: center.x,
											cy: center.y,
											r: 1
			}).setStroke({color: "#2F87FA"});
			
			var text1 = PICTIN.surface.createText({	x: center.x +5,
													y: center.y -5,
													text: "C"}).setStroke({color: "#2F87FA"});
			
			PICTIN.automatic_programs_tool.addShape(circle1);
			PICTIN.automatic_programs_tool.addShape(text1);
													
			
			PICTIN.automatic_programs_tool.addShape(dot);
			a_taskData["task3_circle1_center"] = center;
			a_taskData["task3_circle1_radius"] = circle.r;
			PICTIN.tool_dot.stop();
			jQuery(document).trigger(a_task.eventFinished, [a_task]);
			jQuery(document).unbind("DOT.drawn.ATOOL", this);
		}
	});
	
	
	PICTIN.automatic_programs_tool.activateTool(PICTIN.tool_dot);
}

function PMAP_task3_subtask_drawCenterToLine(a_task, a_taskData){
	
	var circle_center = a_taskData["task3_circle1_center"];
	var segment2 = a_taskData["IIL"];
	var segment3 = a_taskData["IIL"];
	
	////console.log("segment 2 : " + segment2.x1 + " " + segment2.y1);
	var seg2Dist_x = Math.abs(segment2.x1 - circle_center.x);
	var seg3Dist_x = Math.abs(segment3.x1 - circle_center.x);
	
	var pointOnLine;
	if(seg2Dist_x < seg3Dist_x){
		//pointOnLine = get_segment_point_closest_to_point(segment2, circle_center);
		pointOnLine = getIntersectionPoint_2Lines({x1: circle_center.x, y1: circle_center.y, x2: circle_center.x+1, y2: circle_center.y}, segment2);
	}
	else{
		//pointOnLine = get_segment_point_closest_to_point(segment3, circle_center);
		pointOnLine = getIntersectionPoint_2Lines({x1: circle_center.x, y1: circle_center.y, x2: circle_center.x+1, y2: circle_center.y}, segment3);
	}	
	
	/*var line = PICTIN.surface.createLine({ x1: pointOnLine.x, 
								y1: pointOnLine.y,
								x2: circle_center.x, 
								y2: circle_center.y}).setStroke({
													color: "#"+PICTIN.current_color, 
													width: PICTIN.current_linethickness
													});
													
	PICTIN.automatic_programs_tool.addShape(line);
	*/
	
	////console.log("point on line : " + pointOnLine.x + ", " + pointOnLine.y);
	a_taskData["task3_segment1"] = {x1: circle_center.x, y1: circle_center.y, x2: pointOnLine.x, y2: pointOnLine.y};
	
	jQuery(document).trigger(a_task.eventFinished, [a_task]);
}

function PMAP_task3_subtask_measureSegments(a_task, a_taskData){
	var segment = a_taskData["task3_segment1"];
	var circle = {cx: a_taskData["task3_circle1_center"].x, cy: a_taskData["task3_circle1_center"].y, r: a_taskData["task3_circle1_radius"]};
	var points = getIntersectionPoints_SegmentCircle(segment, circle);
	var head_protusio;
	for(var i in points){
		////console.log("x: " + points[i].x + ", y: " + points[i].y);
		/*var circle1 = PICTIN.surface.createCircle({	cx: points[i].x,
										cy: points[i].y,
										r: 3}).setStroke({
														color: "#" + PICTIN.current_color,
										});
		PICTIN.automatic_programs_tool.addShape(circle1);
		*/
							
		head_protusio = Math.round(CALIBRATION.getMeasurement(get_segment_length(points[i].x, points[i].y, segment.x2, segment.y2)));
		
		////console.log("head_protusio : " + head_protusio);
		
		
		var labelPos = getLabelPosition_segment({x1: points[i].x, y1: points[i].y, x2: segment.x2, y2: segment.y2});
		/*var text = PICTIN.surface.createText({
					x: labelPos.x,
					y: labelPos.y,
					text: head_protusio,
					align: "middle"
				}).setStroke({color: "#" + PICTIN.current_color});
		PICTIN.automatic_programs_tool.addShape(text);
		*/
	}
	
	
	var head_diameter = Math.round(CALIBRATION.getMeasurement(circle.r*2));
	
	//saving results
	a_taskData["results"]["HP"] = head_protusio;
	PMAP_addResult(head_protusio);
	a_taskData["results"]["HD"] = head_diameter;
	PMAP_addResult(head_diameter, true);
	////console.log("head_diameter : " + head_diameter);
	jQuery(document).trigger(a_task.eventFinished, [a_task]);
}
//END TASK 3

//TASK 4
function PMAP_task4(a_task, a_taskData){
	PMAP_initTask();
	
	var tm = new TaskManager("PMAP_task4_subtasks");
	tm.taskData = a_taskData;
	PICTIN.automatic_programs_tool.registerRecordStateFunc(tm.recordState);
	PICTIN.automatic_programs_tool.registerRollbackFunc(tm.rollback);
	var task1 = tm.createTask("PMAP_task4_subtask1", PMAP_task4_subtask_drawDots);
	var task2 = tm.createTask("PMAP_task4_subtask2", PMAP_task4_subtask_calculateAngle);
	
	task2.addPrereq(task1);
	tm.start();
	
	jQuery(document).bind("PMAP_task4_subtasks_finished", function(e){
		jQuery(document).trigger(a_task.eventFinished, [a_task]);
	});
}

function PMAP_task4_subtask_drawDots(a_task, a_taskData){
	this.counter = 0;
	var me = this;
	jQuery(document).bind("DOT.drawn.ATOOL", function(e, position, dot){
		PMAP.dotArray.push(dot);
		PICTIN.automatic_programs_tool.addShape(dot);
		a_taskData["task4.dot" + me.counter + "Pos"] = position;
		PICTIN.tool_dot.stop();
		jQuery(document).unbind("DOT.drawn.ATOOL");
		jQuery(document).trigger(a_task.eventFinished, [a_task]);
	});
	
	PICTIN.automatic_programs_tool.activateTool(PICTIN.tool_dot);
}

function PMAP_task4_subtask_calculateAngle(a_task, a_taskData){
	var centerHC = a_taskData["task3_circle1_center"];
	var segment = {x1: a_taskData["task3_circle1_center"].x, y1: a_taskData["task3_circle1_center"].y, x2: a_taskData["task4.dot0Pos"].x, y2: a_taskData["task4.dot0Pos"].y};
	var IIL = a_taskData["IIL"];
	var PRL = a_taskData["task2_segment1"];
	var PRLeq = get_line_equation({x: PRL.x1, y: PRL.y1}, {x: PRL.x2, y: PRL.y2});
	var E = a_taskData["task4.dot0Pos"];
	var segment2Eq = new line_equation(-(Math.pow(PRLeq.slope, -1)), centerHC);
	if(PRLeq.slope > 0){
		dx = 1;
	}
	else if(PRLeq.slope < 0){
		dx = -1;
	}
	else{
		dx = 0;
	}
	var y2 = segment2Eq.getY(centerHC.x+dx);
	if(dx == 0){
		y2 = centerHC.y-1;	
	}
	
	var dist_HC_IIL = getShortestDistance_PointLine(get_line_equation({x: IIL.x1, y: IIL.y1}, {x: IIL.x2, y: IIL.y2}), centerHC);
	var dist_E_IIL = getShortestDistance_PointLine(get_line_equation({x: IIL.x1, y: IIL.y1}, {x: IIL.x2, y: IIL.y2}), E);
	
	var segment2EqParam = new parametric_line({x1: centerHC.x, y1: centerHC.y, x2: centerHC.x+dx, y2: y2});
	var length = getSegmentLength(segment);
	var angleP1 = {x: segment.x2, y: segment.y2};
	var angleP2 = centerHC;
	var angleP3 = {x: segment2EqParam.getPoint(length).x, y: segment2EqParam.getPoint(length).y};
	
	var angle = calculate_angle(angleP1, angleP2, angleP3);
	var VCE = Math.round(angle*180/Math.PI);
	//VCE = VCE * ((a_taskData["results"]["side"] == "right")?((dist_HC_IIL > dist_E_IIL)?1:-1):((dist_HC_IIL > dist_E_IIL)?-1:1));
	
	//sharp angle
	//get the nearest U point
	angleP1 = {x: centerHC.x-1, y: PRLeq.getY(centerHC.x-1)};;
	angleP2 = (a_taskData["results"]["side"] == "right")?a_taskData["task2.dot0Pos"]:a_taskData["task2.dot1Pos"];
	angleP3 = E;
	
	angle = calculate_angle(angleP1, angleP2, angleP3);
	var SA = Math.round(angle*180/Math.PI);
	
	////console.log("angle : " + angleResult);

	////console.log("task4 segment length : " + length);
	/*var line1 = PICTIN.surface.createLine(segment).setStroke({color: "#" + PICTIN.current_color, width: PICTIN.current_linethickness});
	var line2 = PICTIN.surface.createLine({ x1: centerHC.x, y1: centerHC.y, x2: centerHC.x, y2: centerHC.y - length}).setStroke({color: "#" + PICTIN.current_color, width: PICTIN.
	current_linethickness});
	
	PICTIN.automatic_programs_tool.addShape(line1);
	PICTIN.automatic_programs_tool.addShape(line2);

	
	var angleLabelPos = getLabelPosition_angle(angleP1, angleP2, angleP3, false);
	
	angleResult = angleResult.numberFormat("0°");
	var text = PICTIN.surface.createText({x: angleLabelPos.x, y: angleLabelPos.y, text: angleResult, align: "middle"}).	setStroke({color: "#" + PICTIN.current_color});
	PICTIN.automatic_programs_tool.addShape(text);
	*/
	
	//saving results
	a_taskData["results"]["VCE"] = VCE;
	a_taskData["results"]["SA"] = SA;
	//console.log("VCE : " + VCE);
	//console.log("SA : " + SA);
	//PMAP_addResult(angleResult);
	jQuery(document).trigger(a_task.eventFinished, [a_task]);
}

//END TASK 4

//TASK 5
function PMAP_task5(a_task, a_taskData){
	PMAP_initTask();
	
	var tm = new TaskManager("PMAP_task5_subtasks");
	tm.taskData = a_taskData;
	PICTIN.automatic_programs_tool.registerRecordStateFunc(tm.recordState);
	PICTIN.automatic_programs_tool.registerRollbackFunc(tm.rollback);
	var task1 = tm.createTask("PMAP_task5_subtask1", PMAP_task5_subtask_drawDots);
	var task2 = tm.createTask("PMAP_task5_subtask2", PMAP_task5_subtask_drawMidwayDots);
	var task3 = tm.createTask("PMAP_task5_subtask3", PMAP_task5_subtask_drawSegment);
	var task4 = tm.createTask("PMAP_task5_subtask4", PMAP_task5_subtask_drawCalculationSegments);

	task2.addPrereq(task1);
	task3.addPrereq(task2);
	task4.addPrereq(task3);
	tm.start();
	
	jQuery(document).bind("PMAP_task5_subtasks_finished", function(e){
		jQuery(document).trigger(a_task.eventFinished, [a_task]);
	});
}

function PMAP_task5_subtask_drawDots(a_task, a_taskData){
	this.counter = 0;
	var me = this;
	
	jQuery(document).bind("DOT.drawn.ATOOL", function(e, position, dot){
		PMAP.dotArray.push(dot);
		PICTIN.automatic_programs_tool.addShape(dot);
		a_taskData["task5.dot" + me.counter + "Pos"] = position;
		if(me.counter == 3){
			PICTIN.tool_dot.stop();
			jQuery(document).unbind("DOT.drawn.ATOOL");
			jQuery(document).trigger(a_task.eventFinished, [a_task]);
		}
		me.counter++;
	});
	
	PICTIN.automatic_programs_tool.activateTool(PICTIN.tool_dot);
}

function PMAP_task5_subtask_drawMidwayDots(a_task, a_taskData){
	////console.log("drawMidwayDots");
	var dot1 = a_taskData["task5.dot0Pos"];
	var dot2 = a_taskData["task5.dot1Pos"];
	var dot3 = a_taskData["task5.dot2Pos"];
	var dot4 = a_taskData["task5.dot3Pos"];
	var midwayDot1 = {	x : dot1.x + (dot2.x-dot1.x)/2, 
						y: dot1.y + (dot2.y-dot1.y)/2};
	var midwayDot2 = {	x: dot3.x + (dot4.x-dot3.x)/2,
						y:dot3.y + (dot4.y-dot3.y)/2};
	
	a_taskData["task5.midwayDot1"] = midwayDot1;
	a_taskData["task5.midwayDot2"] = midwayDot2;
	
	////console.log("log1 : " + dot1.x + ", " + dot1.y);
	var circle1 = PICTIN.surface.createCircle({	cx: midwayDot1.x,
									cy: midwayDot1.y,
									r: 1}).setStroke({
										color: "#" + PICTIN.current_color
									});
									
	var circle2 = PICTIN.surface.createCircle({	cx: midwayDot2.x,
									cy: midwayDot2.y,
									r: 1}).setStroke({
										color: "#" + PICTIN.current_color
									});
	
	PICTIN.automatic_programs_tool.addShape(circle1);
	PICTIN.automatic_programs_tool.addShape(circle2);
				
	jQuery(document).trigger(a_task.eventFinished, [a_task]);
}

function PMAP_task5_subtask_drawSegment(a_task, a_taskData){
	var dot1 = a_taskData["task5.midwayDot1"];
	var dot2 = a_taskData["task5.midwayDot2"];
	var length = get_segment_length( dot1.x, dot1.y, dot2.x, dot2.y);
	var line_equation = get_line_equation(dot1, dot2);
	var angle = (line_equation.slope == null)?Math.PI:Math.atan(line_equation.slope);
	var dx = dot2.x-dot1.x;
	var dy = dot2.y-dot1.y;
	
	////console.log("angle : " + angle*180/Math.PI);
	////console.log("length : " + length);
	////console.log("dot1 : " + dot1.x + ", " + dot1.y);
	////console.log("dot2 : " + dot2.x + ", " + dot2.y);
	var translate = dojox.gfx.matrix.translate(	dot1.x + dx/2, 
												dot1.y + dy/2);
												
	var rotate = dojox.gfx.matrix.rotate(angle);
	var scale = dojox.gfx.matrix.scale(PICTIN.surface_height/length*3, 1);
	var transform = dojox.gfx.matrix.multiply(translate, rotate, scale);
	
	var line = PICTIN.surface.createLine({	x1: -length/2,
						y1: 0,
						x2: length/2,
						y2: 0}).setStroke({
							color: "#2164FF",
							width: PICTIN.current_linethickness
						});
	
	line.applyLeftTransform(transform);
	
	PICTIN.automatic_programs_tool.addShape(line);
	
	var transformedPoint1 = dojox.gfx.matrix.multiplyPoint(line.getTransform(), line.getShape().x1, line.getShape().y1);
	var transformedPoint2 = dojox.gfx.matrix.multiplyPoint(line.getTransform(), line.getShape().x2, line.getShape().y2);
	a_taskData["task5_segment1"] = {x1: transformedPoint1.x, y1: transformedPoint1.y, x2: transformedPoint2.x, y2: transformedPoint2.y};
	
	jQuery(document).trigger(a_task.eventFinished, [a_task]);
}

function PMAP_task5_subtask_drawCalculationSegments(a_task, a_taskData){
	//segment1
	var segment1 = a_taskData["task3_segment1"];
	var segment2 = a_taskData["task5_segment1"];
	var intersectionPoint1 = getIntersectionPoint_2Lines(segment1, segment2);
	
	//segment2
	var point = {x: segment1.x1, y: segment1.y1};
	var intersectionPoint2 = get_segment_point_closest_to_point(getLineEquationFromSegment(segment2), point);
	
	var globalOffset_segment = {x1: intersectionPoint1.x, y1: intersectionPoint1.y, x2: segment1.x2, y2: segment1.y2};
	var femoralOffset_segment = {x1: intersectionPoint2.x, y1: intersectionPoint2.y, x2: segment1.x1, y2: segment1.y1};
	
	a_taskData["results"]["AO"] = Math.round(CALIBRATION.getMeasurement(getSegmentLength(globalOffset_segment)));
	a_taskData["results"]["FO"] = Math.round(CALIBRATION.getMeasurement(getSegmentLength(femoralOffset_segment)));
	//PMAP_addResult(a_taskData["results"]["GO"], true);
	//PMAP_addResult(a_taskData["results"]["FO"], true);
	
	//drawing lines
	/*var line = PICTIN.surface.createLine(globalOffset_segment).setStroke({
												color: "#" + PICTIN.current_color,
												width: PICTIN.current_linethickness
											});
	
	
	
	var line2 = PICTIN.surface.createLine(femoralOffset_segment).setStroke({
												color: "#" + PICTIN.current_color,
												width: PICTIN.current_linethickness
											});
										
	PICTIN.automatic_programs_tool.addShape(line);
	PICTIN.automatic_programs_tool.addShape(line2);

	//drawing labels
	var gOffsetLabelPos = getLabelPosition_segment(globalOffset_segment);
	var fOffsetLabelPos = getLabelPosition_segment(femoralOffset_segment);
	
	var text1 = PICTIN.surface.createText({	x: gOffsetLabelPos.x,
											y: gOffsetLabelPos.y,
											text: a_taskData["results"]["GO"],
											align: "middle" }).setStroke({color: "#" + PICTIN.current_color});
	
	var text2 = PICTIN.surface.createText({	x: fOffsetLabelPos.x,
											y: fOffsetLabelPos.y,
											text: a_taskData["results"]["FO"],
											align: "middle" }).setStroke({color: "#" + PICTIN.current_color});
	
	PICTIN.automatic_programs_tool.addShape(text1);
	PICTIN.automatic_programs_tool.addShape(text2);
	*/
				
	jQuery(document).trigger(a_task.eventFinished, [a_task]);
}
//END TASK 5

//TASK 6
function PMAP_task6(a_task, a_taskData){
	PMAP_initTask();
	
	var tm = new TaskManager("PMAP_task6_subtasks");
	tm.taskData = a_taskData;
	PICTIN.automatic_programs_tool.registerRecordStateFunc(tm.recordState);
	PICTIN.automatic_programs_tool.registerRollbackFunc(tm.rollback);
	var task1 = tm.createTask("PMAP_task6_subtask1", PMAP_task6_subtask_drawDots);
	var task2 = tm.createTask("PMAP_task6_subtask2", PMAP_task6_subtask_drawAndCalculate);
	
	task2.addPrereq(task1);
	tm.start();
	
	jQuery(document).bind("PMAP_task6_subtasks_finished", function(e){
		jQuery(document).trigger(a_task.eventFinished, [a_task]);
	});
}

function PMAP_task6_subtask_drawDots(a_task, a_taskData){
	this.counter = 0;
	var me = this;
	jQuery(document).bind("DOT.drawn.ATOOL", function(e, position, dot){
		PMAP.dotArray.push(dot);
		PICTIN.automatic_programs_tool.addShape(dot);
		a_taskData["task6.dot" + me.counter + "Pos"] = position;
		if(me.counter == 1){
			PICTIN.tool_dot.stop();
			jQuery(document).unbind("DOT.drawn.ATOOL");
			jQuery(document).trigger(a_task.eventFinished, [a_task]);
		}
		me.counter++;
	});
	
	PICTIN.automatic_programs_tool.activateTool(PICTIN.tool_dot);
}

function PMAP_task6_subtask_drawAndCalculate(a_task, a_taskData){
	var point1 = a_taskData["task6.dot0Pos"];
	var point2 = a_taskData["task6.dot1Pos"];
	var centerPoint = {	x: point1.x + (point2.x-point1.x)/2, 
						y: point1.y + (point2.y-point1.y)/2};
	a_taskData["midpointN1N2"] = centerPoint;
	var centerHC = a_taskData["task3_circle1_center"];
	var segment = {x1: centerHC.x, y1: centerHC.y, x2: centerPoint.x, y2: centerPoint.y};
	var D = a_taskData["task5_segment1"];
	var D_eq = getLineEquationFromSegment(D);
	var intersectionPoint = getIntersectionPoint_2Lines(a_taskData["task5_segment1"], segment);
	a_taskData["C'"] = intersectionPoint;
	var CCD_p3 = {x: D_eq.getX(intersectionPoint.y+1), y: intersectionPoint.y+1};
	var neckAngle_segment = {x1: centerHC.x, y1: centerHC.y, x2: intersectionPoint.x, y2: intersectionPoint.y};
	var angle = Math.abs(Math.round(Math.abs(calculate_angle(centerPoint, intersectionPoint, CCD_p3)*180/Math.PI)));
	var angleLabel = angle.numberFormat("0°");
	var angleP1 = centerPoint;
	var angleP2 = intersectionPoint;
	var angleP3 = {x: a_taskData["task5_segment1"].x2, y: a_taskData["task5_segment1"].y2};
	var angleLabelPos = getLabelPosition_angle(angleP1, angleP2, angleP3, false);
	
	//distance cc'
	var cc = Math.round(CALIBRATION.getMeasurement(getSegmentLength({x1: intersectionPoint.x, y1: intersectionPoint.y, x2: centerHC.x, y2: centerHC.y})));
	
	//neck width
	var nw = Math.round(CALIBRATION.getMeasurement(getSegmentLength({x1: point1.x, y1: point1.y, x2: point2.x, y2: point2.y})));
	
	/*
	//drawing
	var line = PICTIN.surface.createLine(neckAngle_segment).setStroke({
												color: "#" + PICTIN.current_color,
												width: PICTIN.current_linethickness
											});
	
	var text1 = PICTIN.surface.createText({	x: angleLabelPos.x,
											y: angleLabelPos.y,
											text: angleLabel,
											align: "middle" }).setStroke({color: "#" + PICTIN.current_color});
	
	PICTIN.automatic_programs_tool.addShape(line);
	PICTIN.automatic_programs_tool.addShape(text1);
	*/
	
	//draw c'
	//draw C (center)
	var circle1 = PICTIN.surface.createCircle({	cx: intersectionPoint.x,
									cy: intersectionPoint.y,
									r: 1
	}).setStroke({color: "#2F87FA"});
	
	var text1 = PICTIN.surface.createText({	x: intersectionPoint.x +5,
											y: intersectionPoint.y -5,
											text: "C'"}).setStroke({color: "#2F87FA"});
	PICTIN.automatic_programs_tool.addShape(circle1);
	PICTIN.automatic_programs_tool.addShape(text1);
	//saving results
	a_taskData["results"]["CCD"] = angle;
	a_taskData["results"]["CC"] = cc;
	a_taskData["results"]["NW"] = nw;
	a_taskData["results"]["NWNLR"] = (nw/cc).numberFormat("0.00");
	a_taskData["results"]["HDNLR"] = (a_taskData["results"]["HD"]/cc).numberFormat("0.00");

	//console.log("CCD : " + a_taskData["results"]["CCD"]);
	//console.log("CC : " + a_taskData["results"]["CC"]);
	//console.log("NW : " + a_taskData["results"]["NW"]);
	//console.log("NWNLR : " + a_taskData["results"]["NWNLR"]);
	//console.log("HD : " + a_taskData["results"]["HDNLR"]);
	//PMAP_addResult(angle);
	////console.log("angle : " + angle*180/Math.PI);
	
	jQuery(document).trigger(a_task.eventFinished, [a_task]);
}
//END TASK 6

//TASK7
function PMAP_task7(a_task, a_taskData){
	PMAP_initTask();
	
	var tm = new TaskManager("PMAP_task7_subtasks");
	tm.taskData = a_taskData;
	PICTIN.automatic_programs_tool.registerRecordStateFunc(tm.recordState);
	PICTIN.automatic_programs_tool.registerRollbackFunc(tm.rollback);
	var task1 = tm.createTask("PMAP_task7_subtask1", PMAP_task7_subtask_drawDots);
	var task2 = tm.createTask("PMAP_task7_subtask2", PMAP_task7_subtask_drawAndCalculate);
	
	task2.addPrereq(task1);
	tm.start();
	
	jQuery(document).bind("PMAP_task7_subtasks_finished", function(e){
		PICTIN.restoreColor();
		jQuery(document).trigger(a_task.eventFinished, [a_task]);
	});
}

function PMAP_task7_subtask_drawDots(a_task, a_taskData){
	this.counter = 0;
	var me = this;
	jQuery(document).bind("DOT.drawn.ATOOL", function(e, position, dot){
		PMAP.dotArray.push(dot);
		PICTIN.automatic_programs_tool.addShape(dot);
		a_taskData["task7.dot" + me.counter + "Pos"] = position;
		if(me.counter == 1){
			PICTIN.tool_dot.stop();
			jQuery(document).unbind("DOT.drawn.ATOOL");
			jQuery(document).trigger(a_task.eventFinished, [a_task]);
		}
		me.counter++;
	});
	
	PICTIN.automatic_programs_tool.activateTool(PICTIN.tool_dot);
}

function PMAP_task7_subtask_drawAndCalculate(a_task, a_taskData){
	////console.log("task7");
	var point1 = a_taskData["task7.dot0Pos"];
	var point2 = a_taskData["task7.dot1Pos"];
	var segment = a_taskData["task2_segment1"];
	var centerHC = a_taskData["task3_circle1_center"];
	var PRL = get_line_equation(a_taskData["task2.dot0Pos"], a_taskData["task2.dot1Pos"]);
	var GTLine = new line_equation(PRL.slope, point1);
	var LTLine = new line_equation(PRL.slope, point2);
	var CLine = new line_equation(PRL.slope, centerHC);
	
	//var perpendSlopePRL = -1 * (pow(PRL.slope, -1));
	//var perpendP1PRL = new line_equation(perpendSlopePRL, point1);
	//var perpendP2PRL = new line_equation(perpendSlopePRL, point2);
	
	
	var intersectionPoint1 = get_segment_point_closest_to_point(getLineEquationFromSegment(segment), point1);
	var intersectionPoint2 = get_segment_point_closest_to_point(getLineEquationFromSegment(segment), point2);
	var intersectionPoint3 = get_segment_point_closest_to_point(getLineEquationFromSegment(segment), centerHC);
	
	/*
	var intersectionPoint1 = getIntersectionPoint_2Lines({x1: point1.x, y1: point1.y, x2: point1.x, y2: point1.y+1}, segment);
	var intersectionPoint2 = getIntersectionPoint_2Lines({x1: point2.x, y1: point2.y, x2: point2.x, y2: point2.y+1}, segment);
	var intersectionPoint3 = getIntersectionPoint_2Lines({x1: centerHC.x, y1: centerHC.y, x2: centerHC.x, y2: centerHC.y+1}, segment);
	*/
	
	var length1 = Math.round(CALIBRATION.getMeasurement(get_segment_length(point1.x, point1.y, intersectionPoint1.x, intersectionPoint1.y)));
	var length2 = Math.round(CALIBRATION.getMeasurement(get_segment_length(point2.x, point2.y, intersectionPoint2.x, intersectionPoint2.y)));
	var length3 = Math.round(CALIBRATION.getMeasurement(get_segment_length(centerHC.x, centerHC.y, intersectionPoint3.x, intersectionPoint3.y)));
	
	a_taskData["results"]["HCH"] = length3;
	a_taskData["results"]["GPH"] = length1-length3;
	a_taskData["results"]["LPH"] = length2 + length3;
	a_taskData["results"]["GCH"] = length1;
	a_taskData["results"]["LCH"] = length2;
	
	//console.log("HCH : " + a_taskData["results"]["HCH"]);
	//console.log("GPH : " + a_taskData["results"]["GPH"]);
	//console.log("LPH : " + a_taskData["results"]["LPH"]);
	//console.log("GCH : " + a_taskData["results"]["GCH"]);
	//console.log("LCH : " + a_taskData["results"]["LCH"]);
	
	/*PMAP_addResult(a_taskData["results"]["HCH"], true);
	PMAP_addResult(a_taskData["results"]["GPH"], true);
	PMAP_addResult(a_taskData["results"]["LPH"], true);
	PMAP_addResult(a_taskData["results"]["GCH"], true);
	PMAP_addResult(a_taskData["results"]["LCH"], true);*/
	
	var segment1 = {x1: point1.x, y1: point1.y, x2: intersectionPoint1.x, y2: intersectionPoint1.y};
	var segment2 = {x1: point2.x, y1: point2.y, x2: intersectionPoint2.x, y2: intersectionPoint2.y};
	var segment3 = {x1: centerHC.x, y1: centerHC.y, x2: intersectionPoint3.x, y2: intersectionPoint3.y};
	
	var label1Pos = getLabelPosition_segment(segment1);
	var label2Pos = getLabelPosition_segment(segment2);
	var label3Pos = getLabelPosition_segment(segment3);
	
	//drawing
	/*
	var line1 = PICTIN.surface.createLine(segment1).setStroke({
												color: "#" + PICTIN.current_color,
												width: PICTIN.current_linethickness
											});
	
	var line2 = PICTIN.surface.createLine(segment2).setStroke({
												color: "#" + PICTIN.current_color,
												width: PICTIN.current_linethickness
											});
	
	var line3 = PICTIN.surface.createLine(segment3).setStroke({
												color: "#" + PICTIN.current_color,
												width: PICTIN.current_linethickness
											});
	
	
	var text1 = PICTIN.surface.createText({	x: label1Pos.x, y: label1Pos.y, text: length1, align: "middle"}).setStroke({color: "#" + PICTIN.current_color});
	var text2 = PICTIN.surface.createText({	x: label2Pos.x, y: label2Pos.y, text: length2, align: "middle"}).setStroke({color: "#" + PICTIN.current_color});
	var text3 = PICTIN.surface.createText({	x: label3Pos.x, y: label3Pos.y, text: length3, align: "middle"}).setStroke({color: "#" + PICTIN.current_color});
	
	
	PICTIN.automatic_programs_tool.addShape(line1);
	PICTIN.automatic_programs_tool.addShape(line2);
	PICTIN.automatic_programs_tool.addShape(line3);
	PICTIN.automatic_programs_tool.addShape(text1);
	PICTIN.automatic_programs_tool.addShape(text2);
	PICTIN.automatic_programs_tool.addShape(text3);
	*/
	jQuery(document).trigger(a_task.eventFinished, [a_task]);
}
//END TASK 7

//TASK 8
function PMAP_task8(a_task, a_taskData){
	PMAP_initTask();
	
	var tm = new TaskManager("PMAP_task8_subtasks");
	tm.taskData = a_taskData;
	PICTIN.automatic_programs_tool.registerRecordStateFunc(tm.recordState);
	PICTIN.automatic_programs_tool.registerRollbackFunc(tm.rollback);
	var task1 = tm.createTask("PMAP_task8_subtask1", PMAP_task8_subtask_drawDots);
	var task2 = tm.createTask("PMAP_task8_subtask2", PMAP_task8_subtask_calculateResults);
	
	task2.addPrereq(task1);
	tm.start();
	
	jQuery(document).bind("PMAP_task8_subtasks_finished", function(e){
		PICTIN.restoreColor();
		jQuery(document).trigger(a_task.eventFinished, [a_task]);
	});
}

function PMAP_task8_subtask_drawDots(a_task, a_taskData){
	this.counter = 0;
	var me = this;
	jQuery(document).bind("DOT.drawn.ATOOL", function(e, position, dot){
		PMAP.dotArray.push(dot);
		PICTIN.automatic_programs_tool.addShape(dot);
		a_taskData["task8.dot" + me.counter + "Pos"] = position;
		if(me.counter == 1){
			PICTIN.tool_dot.stop();
			jQuery(document).unbind("DOT.drawn.ATOOL");
			jQuery(document).trigger(a_task.eventFinished, [a_task]);
		}
		me.counter++;
	});
	
	PICTIN.automatic_programs_tool.activateTool(PICTIN.tool_dot);
}

function PMAP_task8_subtask_calculateResults(a_task, a_taskData){
	var center = a_taskData["task3_circle1_center"];
	var point1 = a_taskData["task8.dot0Pos"];
	var point2 = a_taskData["task8.dot1Pos"];
	var PRL = a_taskData["task2_segment1"];
	var PRLslope = get_line_equation({x: PRL.x1, y: PRL.y1}, {x: PRL.x2, y: PRL.y2}).slope;
	var point2LineEq = new line_equation(PRLslope, point2);
	var point2Vec = {x1: point2.x, y1: point2.y, x2: point2.x+1, y2: point2LineEq.getY(point2.x+1)};
	var intersectionPoint = get_segment_point_closest_to_point(getLineEquationFromSegment(point2Vec), point1);
	
	/*//console.log("intersectionPoint : " + intersectionPoint.x + ", " + intersectionPoint.y);
	//console.log("point2vec : " + point2Vec.x1 + ", " + point2Vec.y1 + ", " + point2Vec.x2 + ", " + point2Vec.y2);
	//console.log("PRL : " + PRL.x1 + ", " + PRL.y1 + ", " + PRL.x2 + ", " + PRL.y2);*/
	//calculate results
	var PO = Math.round(CALIBRATION.getMeasurement(getSegmentLength({x1: center.x, y1: center.y, x2: point2.x, y2: point2.y})));
	var CPH = Math.round(CALIBRATION.getMeasurement(getSegmentLength({x1: intersectionPoint.x, y1: intersectionPoint.y, x2: point1.x, y2: point1.y})));
	var PR = Math.round(CALIBRATION.getMeasurement(getSegmentLength({x1: point1.x, y1: point1.y, x2: point2.x, y2: point2.y})));
	PR = (point2.y-point1.y)?-1*PR:PR;
	//console.log("PO : " + PO);
	//console.log("CPH : " + CPH);
	//console.log("PR : " + PR);
	
	a_taskData["results"]["PO"] = PO;
	a_taskData["results"]["CPH"] = CPH;
	a_taskData["results"]["PR"] = PR;
	
	jQuery(document).trigger(a_task.eventFinished, [a_task]);
}
//END TASK 8

//TASK 9
function PMAP_task9(a_task, a_taskData){
	PMAP_initTask();
	
	var tm = new TaskManager("PMAP_task9_subtasks");
	tm.taskData = a_taskData;
	PICTIN.automatic_programs_tool.registerRecordStateFunc(tm.recordState);
	PICTIN.automatic_programs_tool.registerRollbackFunc(tm.rollback);
	var task1 = tm.createTask("PMAP_task9_subtask1", PMAP_task9_subtask_drawDots);
	var task2 = tm.createTask("PMAP_task9_subtask2", PMAP_task9_subtask_calculateResults);
	var task3 = tm.createTask("PMAP_task9_subtask3", PMAP_task9_subtask_drawCt);
	
	task2.addPrereq(task1);
	task3.addPrereq(task2);
	tm.start();
	
	jQuery(document).bind("PMAP_task9_subtasks_finished", function(e){
		PICTIN.restoreColor();
		jQuery(document).trigger(a_task.eventFinished, [a_task]);
	});
}

function PMAP_task9_subtask_drawDots(a_task, a_taskData){
	this.counter = 0;
	var me = this;
	jQuery(document).bind("DOT.drawn.ATOOL", function(e, position, dot){
		PMAP.dotArray.push(dot);
		PICTIN.automatic_programs_tool.addShape(dot);
		a_taskData["task9.dot" + me.counter + "Pos"] = position;
		if(me.counter == 0){
			PICTIN.tool_dot.stop();
			jQuery(document).unbind("DOT.drawn.ATOOL");
			jQuery(document).trigger(a_task.eventFinished, [a_task]);
		}
		me.counter++;
	});
	
	PICTIN.automatic_programs_tool.activateTool(PICTIN.tool_dot);
}

function PMAP_task9_subtask_calculateResults(a_task, a_taskData){
	var point1 = a_taskData["task9.dot0Pos"];
	var PRL = a_taskData["task2_segment1"];
	var U = (a_taskData["results"]["side"] == "right")?a_taskData["task2.dot0Pos"]:a_taskData["task2.dot1Pos"];
	var U1 = a_taskData["task2.dot0Pos"];
	var U2 = a_taskData["task2.dot1Pos"];
	var HC = a_taskData["task3_circle1_center"];
	var HD = a_taskData["results"]["HD"];
	var point1PRLDist = getShortestDistance_PointLine(getLineEquationFromSegment(PRL), point1) * ((a_taskData["results"]["side"] == "right")?1:-1);
	var U1U2Dist = getSegmentLength({x1: U1.x, y1: U1.y, x2: U2.x, y2: U2.y});
	var verticalRatio = (a_taskData["results"]["gender"] == "Male" || a_taskData["results"]["gender"] == "ND")?0.3:0.25;
	var horizontalRatio = (a_taskData["results"]["gender"] == "Male" || a_taskData["results"]["gender"] == "ND")?0.2:0.18;
	//console.log("verticalRatio : " + verticalRatio);
	//console.log("horizontalRatio : " + horizontalRatio);
	var PRL_parametric = new parametric_line(PRL);
	var PRL_cartesian = getLineEquationFromSegment(PRL)
	var IIL = a_taskData["IIL"];
	var IIL_cartesian = getLineEquationFromSegment(IIL);
	var PRL_angle = Math.atan(PRL_cartesian.slope);
	var IIL_angle = Math.atan(IIL_cartesian.slope);
	//console.log("PRL_cartesian.slope : " + PRL_cartesian.slope);
	//console.log("PRL_angle : " + PRL_angle);
	//console.log("IIL_angle : " + IIL_angle);
	var ctPos = {	x: U.x - (Math.abs(Math.cos(PRL_angle)*(U1U2Dist * verticalRatio)) * ((a_taskData["results"]["side"] == "right")?1:-1)), 
					y: U.y - Math.abs(Math.sin(IIL_angle)*(point1PRLDist * horizontalRatio))};
	var CTheight = CALIBRATION.getMeasurement(getShortestDistance_PointLine(getLineEquationFromSegment(PRL), ctPos));
	var HCheight = CALIBRATION.getMeasurement(getShortestDistance_PointLine(getLineEquationFromSegment(PRL), HC));
	var intersectionCtIIL = get_segment_point_closest_to_point(getLineEquationFromSegment(IIL), ctPos);
	var intersectionHCIIL = get_segment_point_closest_to_point(getLineEquationFromSegment(IIL), HC);
	var lengthCtCtp = getSegmentLength({x1: ctPos.x, y1: ctPos.y, x2: intersectionCtIIL.x, y2: intersectionCtIIL.y});
	var lengthHCHCp = getSegmentLength({x1: HC.x, y1: HC.y, x2: intersectionHCIIL.x, y2: intersectionHCIIL.y});
	
	//calculate results
	var DTCVSCT = Math.round(CALIBRATION.getMeasurement(getSegmentLength({x1: ctPos.x, y1: ctPos.y, x2: HC.x, y2: HC.y})));
	var DCCTHDR = (DTCVSCT/HD).numberFormat("0.00");
	var HTCVSTC = -1*Math.round(CTheight-HCheight);
	var MTCVSTC = Math.round(lengthCtCtp - lengthHCHCp);
	
	//console.log("DTCVSCT : " + DTCVSCT);
	//console.log("DCCTHDR : " + DCCTHDR);
	//console.log("HTCVSTC : " + HTCVSTC);
	
	a_taskData["results"]["DTCVSTC"] = DTCVSCT;
	a_taskData["results"]["DCCTHDR"] = DCCTHDR;
	a_taskData["results"]["HTCVSTC"] = HTCVSTC;
	a_taskData["results"]["MTCVSTC"] = MTCVSTC;
	
	//console.log("ctPos : " + ctPos.x + ", " + ctPos.y);
	
	a_taskData["ctPos"] = ctPos;
	
	jQuery(document).trigger(a_task.eventFinished, [a_task]);
}

function PMAP_task9_subtask_drawCt(a_task, a_taskData){
	var ctPos = a_taskData["ctPos"];
	
	var ctCircle = PICTIN.surface.createCircle({cx: ctPos.x,
												cy: ctPos.y,
												r: 1}).setStroke({
						color: "#EAFF00",
						width: PICTIN.current_linethickness,
						'shape-rendering': 'crispEdges'
					});
	var ctLabel = PICTIN.surface.createText({	x: ctPos.x+5,
												y: ctPos.y-5,
												text: "Ct"}).setStroke({color: "#EAFF00"});
												
		
					
	PICTIN.automatic_programs_tool.addShape(ctCircle);
	PICTIN.automatic_programs_tool.addShape(ctLabel);
	
	jQuery(document).trigger(a_task.eventFinished, [a_task]);
}

//END TASK 9

//TASK 10
function PMAP_task10(a_task, a_taskData){
	PMAP_initTask();
	
	var tm = new TaskManager("PMAP_task10_subtasks");
	tm.taskData = a_taskData;
	PICTIN.automatic_programs_tool.registerRecordStateFunc(tm.recordState);
	PICTIN.automatic_programs_tool.registerRollbackFunc(tm.rollback);
	var task1 = tm.createTask("PMAP_task10_subtask1", PMAP_task10_subtask_drawDots);
	var task2 = tm.createTask("PMAP_task10_subtask2", PMAP_task10_subtask_calculateResults);
	
	task2.addPrereq(task1);
	tm.start();
	
	jQuery(document).bind("PMAP_task10_subtasks_finished", function(e){
		PICTIN.restoreColor();
		jQuery(document).trigger(a_task.eventFinished, [a_task]);
	});
}

function PMAP_task10_subtask_drawDots(a_task, a_taskData){
	this.counter = 0;
	var me = this;
	jQuery(document).bind("DOT.drawn.ATOOL", function(e, position, dot){
		PMAP.dotArray.push(dot);
		PICTIN.automatic_programs_tool.addShape(dot);
		a_taskData["task10.dot" + me.counter + "Pos"] = position;
		if(me.counter == 1){
			PICTIN.tool_dot.stop();
			jQuery(document).unbind("DOT.drawn.ATOOL");
			jQuery(document).trigger(a_task.eventFinished, [a_task]);
		}
		me.counter++;
	});
	
	PICTIN.automatic_programs_tool.activateTool(PICTIN.tool_dot);
}

function PMAP_task10_subtask_calculateResults(a_task, a_taskData){
	var point1 = a_taskData["task10.dot0Pos"];
	var point2 = a_taskData["task10.dot1Pos"];
	var point3 = a_taskData["task6.dot0Pos"];
	var point4 = a_taskData["task6.dot1Pos"];
	var ac = {	x1: point1.x + (point2.x - point1.x)/2, 
				y1: point1.y + (point2.y - point1.y)/2, 
				x2: point3.x + (point4.x - point3.x)/2, 
				y2: point3.y + (point4.y - point3.y)/2};
	var HC = a_taskData["task3_circle1_center"];
	var HD = a_taskData["results"]["HD"];
	var D = a_taskData["task5_segment1"];
	var D_eq = getLineEquationFromSegment(D);
	var CCD = a_taskData["results"]["CCD"];
	var c_prime = a_taskData["C'"];
	var CC_seg = {x1: HC.x, y1: HC.y, x2: c_prime.x, y2: c_prime.y};
	var TNA_p1 = {x: ac.x1, y: ac.y1};
	var TNA_p2 = getIntersectionPoint_2Lines(CC_seg, ac);
	var TNA_p3 = {x: HC.x, y: HC.y};
	var angleTNA = Math.abs(Math.round(Math.abs(calculate_angle(TNA_p1, TNA_p2, TNA_p3)*180/Math.PI)));
	var C1 = a_taskData["C1"];
	var N1 = a_taskData["task6.dot0Pos"];
	var acEq = get_line_equation({x: ac.x1, y: ac.y1}, {x: ac.x2, y: ac.y2});
	var acPerpC1 = new line_equation(acEq.slope, C1);
	var acPerpN1 = new line_equation(acEq.slope, N1);
	var lengthC1acPerpN1 = getShortestDistance_PointLine(getLineEquationFromSegment({x1: N1.x, y1: N1.y, x2: N1.x+1, y2: acPerpN1.getY(N1.x+1)}), C1);
	
	//debug
	//PICTIN.surface.createLine(ac).setStroke({color: "#" + PICTIN.currentColor});
	
	//additional calculations
	angleTNA = (angleTNA > 90)?180-angleTNA:angleTNA;
	var slopeCC = getLineEquationFromSegment(CC_seg).slope;
	var slopeAC = getLineEquationFromSegment(ac).slope;
	
	if(a_taskData["results"]["sides"] == "left"){
		if(slopeCC < slopeAC){
			angleTNA *= -1;
		}
	}
	else if(a_taskData["results"]["sides"] == "right"){
		if(slopeCC > slopeAC){
			angleTNA *= -1;
		}
	}
	
	//calculate results
	var DCAC = Math.round(CALIBRATION.getMeasurement(getShortestDistance_PointLine(getLineEquationFromSegment(ac), HC)));
	var DCACHDR = (DCAC/HD).numberFormat("0.00");
	var DTNAVSCCA = angleTNA;
	var SOHNHD = (lengthC1acPerpN1/HD).numberFormat("0.00");
	
	//console.log("C1 : " + C1.x + ", "+ C1.y);
	//console.log("N1 : " + N1.x + ", "+ N1.y);
	//console.log("acPerpN1.slope : " + acPerpN1.slope);
	//console.log("length : " + lengthC1acPerpN1);
	
	a_taskData["results"]["DCAC"] = DCAC;
	a_taskData["results"]["DCACHDR"] = DCACHDR;
	a_taskData["results"]["DTNAVSCCA"] = DTNAVSCCA;
	a_taskData["results"]["SOHNHD"] = SOHNHD;
	
	
	//console.log("angleTNA : " + angleTNA);
	//console.log("CCD angle : " + CCD);
	//console.log("DCAC : " + DCAC);
	//console.log("DCACHDR : " + DCACHDR);
	//console.log("DTNAVSCCA : " + DTNAVSCCA);
	
	jQuery(document).trigger(a_task.eventFinished, [a_task]);
}

//END TASK 10

//TASK 11
function PMAP_task11(a_task, a_taskData){
	PMAP_initTask();
	
	var tm = new TaskManager("PMAP_task11_subtasks");
	tm.taskData = a_taskData;
	PICTIN.automatic_programs_tool.registerRecordStateFunc(tm.recordState);
	PICTIN.automatic_programs_tool.registerRollbackFunc(tm.rollback);
	var task1 = tm.createTask("PMAP_task11_subtask1", PMAP_task11_subtask_drawDots);
	var task2 = tm.createTask("PMAP_task11_subtask2", PMAP_task11_subtask_calculateResults);
	
	task2.addPrereq(task1);
	tm.start();
	
	jQuery(document).bind("PMAP_task11_subtasks_finished", function(e){
		PICTIN.restoreColor();
		jQuery(document).trigger(a_task.eventFinished, [a_task]);
	});
}

function PMAP_task11_subtask_drawDots(a_task, a_taskData){
	this.counter = 0;
	var me = this;
	jQuery(document).bind("DOT.drawn.ATOOL", function(e, position, dot){
		PMAP.dotArray.push(dot);
		PICTIN.automatic_programs_tool.addShape(dot);
		a_taskData["task11.dot" + me.counter + "Pos"] = position;
		if(me.counter == 0){
			PICTIN.tool_dot.stop();
			jQuery(document).unbind("DOT.drawn.ATOOL");
			jQuery(document).trigger(a_task.eventFinished, [a_task]);
		}
		me.counter++;
	});
	
	PICTIN.automatic_programs_tool.activateTool(PICTIN.tool_dot);
}

function PMAP_task11_subtask_calculateResults(a_task, a_taskData){
	var T = a_taskData["task11.dot0Pos"];
	var E = a_taskData["task4.dot0Pos"];
	var U1 = a_taskData["task2.dot0Pos"];
	var U2 = a_taskData["task2.dot1Pos"];
	var PRL = a_taskData["task2_segment1"];
	//var H = {x1: U1.x, y1: U1.y, x2: U2.x, y2: U2.y};
	var TE = {x1: T.x, y1: T.y, x2: E.x, y2: E.y};
	var HC = a_taskData["task3_circle1_center"];
	var CT = {x1: HC.x, y1: HC.y, x2: T.x, y2: T.y};
	var PRLslope = get_line_equation(U1, U2).slope;
	var PRLPerpSlope = -(Math.pow(PRLslope, -1));
	var Heq = new line_equation(PRLslope, T);
	var Hseg = (Heq.isVertical)?{x1: T.x, y1: T.y, x2: T.x, y2: T.y+1}:
								{x1: T.x, y1: T.y, x2: T.x+1, y2: Heq.getY(T.x+1)};
	var HPerpEq = new line_equation(PRLPerpSlope, HC);
	var HPerpSeg = (HPerpEq.isVertical)?{x1: HC.x, y1: HC.y, x2: HC.x, y2: HC.y-1}:
										{x1: HC.x, y1: HC.y, x2: HPerpEq.getX(HC.y-1), y2: HC.y-1};
	var T_height = getShortestDistance_PointLine(getLineEquationFromSegment(PRL), T);
	var E_height = getShortestDistance_PointLine(getLineEquationFromSegment(PRL), E);
	var HC_height = getShortestDistance_PointLine(getLineEquationFromSegment(PRL), HC);
	
	//calculate results
	//var HTE = Math.abs(Math.round(180-Math.abs(getAngle_2Seg(H, TE)*180/Math.PI)));// * (((E_height-T_height) >= 0)?1:-1);
	var HTE = Math.abs(Math.round(Math.abs(calculate_angle({x:Hseg.x2, y: Hseg.y2}, T, E)*180/Math.PI)));
	//var VCT = Math.abs(Math.round(Math.abs(getAngle_2Seg(HPerpSeg, CT)*180/Math.PI)));// * (((HC_height-T_height) >= 0)?-1:1);
	var VCT = Math.abs(Math.round(Math.abs(calculate_angle({x:HPerpSeg.x2, y: HPerpSeg.y2}, HC, T)*180/Math.PI)));// * (((HC_height-T_height) >= 0)?-1:1);
	//var ECT = Math.abs(Math.round(180-Math.abs(getAngle_2Seg(CT, TE)*180/Math.PI))) * (((HC_height-T_height) >= 0)?-1:1);
	var ECT = Math.abs(Math.round(Math.abs(calculate_angle(E, HC, T)*180/Math.PI)));
	
	//additional calculations on results
	//HTE = (a_taskData["results"]["side"] == "left")?HTE:(180-HTE);
	HTE = (Math.abs(HTE) > 90)?(180-HTE):HTE;
	HTE = HTE  * (((E_height-T_height) >= 0)?1:-1)

	//VCT = (a_taskData["results"]["side"] == "left")?VCT:(360-VCT);
	VCT = (Math.abs(VCT) > 90)?(180-VCT)*-1:VCT;
	
	ECT = ECT * (((HC_height-T_height) >= 0)?-1:1);
	
	a_taskData["results"]["HTE"] = HTE;
	a_taskData["results"]["VCT"] = VCT;
	a_taskData["results"]["ECT"] = ECT;
	
	//console.log("HTE : " + HTE);
	//console.log("VCT : " + VCT);
	//console.log("ECT : " + ECT);
		
	jQuery(document).trigger(a_task.eventFinished, [a_task]);
}

//END TASK 11

//TASK 12

function PMAP_task12(a_task, a_taskData){
	PMAP_initTask();
	jQuery(document).bind("form_validated.PMAP", function(e){
		PIAM.update_piam("PGM_AP");
		PICTIN.automatic_programs_tool.stop();
		jQuery(document).unbind("form_validated.PMAP");
		jQuery(document).trigger(a_task.eventFinished, [a_task]);
	});
	//PMAP_initTask();
	//show results
	jQuery("#step_image").empty();
	jQuery("#step_desc").empty();
	
	//jQuery("#tool_info > .results").empty().append('<h3>Results :</h3>');
	jQuery("#tool_info > .results").append('<table width="100%">');
			for(var i in ATOOL.resultLabelList){
				jQuery("#tool_info > .results").append('<tr class="PIAM_row" id="'+ ATOOL.resultLabelList[i].id +'"><td style="width:5%;text-align:center;" class="AT_resultNb">'+(parseInt(i)+1)+'<td style="width:42%" class="AT_resultLabel AT_stepTodo">' + ATOOL.resultLabelList[i].label + '</td>');
				jQuery("#" + ATOOL.resultLabelList[i].id).append('<td style="width:10%;background-color:#FFE7E4;text-align:center;border:solid 1px #94A9E4;" class="AT_result AT_stepFinished">' + a_taskData["results"][ATOOL.resultLabelList[i].id] + '</td><td  style="width:10%;text-align:center;" class="AT_result_unit">' + ATOOL.resultLabelList[i].result_unit + '</td><td style="width:33%" class="AT_result_type">' + ATOOL.resultLabelList[i].result_type + '</td></tr>');
			}
	jQuery("#tool_info > .results").append('</table>');
	
	PIAMRESULTS["PGM_AP"] = a_taskData["results"];
	jQuery("#tool_info").dialog({	buttons: {
													"Send to OW": function(){
														//PICTIN.automatic_programs_tool.stop();
															//console.log("wut");
															jQuery(document).trigger("form_validated");
														}
									}});
			
	
}


//END TASK 12


