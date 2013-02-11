//TASK 1 - calibration
PREOP = {};
PREOP.labelID;
PREOP.resultRowID;
PREOP.taskCounter = 0;
PREOP.resultCounter = 0;
PREOP.stepColor = new Array();
PREOP.stepColor.push("ff0000");
PREOP.stepColor.push("ff0000");
PREOP.stepColor.push("ff9600");
PREOP.stepColor.push("00ff00");
PREOP.stepColor.push("00ffd8");
PREOP.stepColor.push("00c0ff");
PREOP.stepColor.push("4545ff");
PREOP.stepColor.push("a200ff");
PREOP.stepColor.push("ff00f0");

function preop_init(){
	PREOP.taskCounter = 0;
	PREOP.resultCounter = 0;
}
function preop_initTask(){
	if(PREOP.taskCounter > 0){
		jQuery("#" + ATOOL.taskLabelList[PREOP.taskCounter-1].id + " > span").toggleClass("AT_stepCurrent AT_stepFinished");
		PICTIN.setColor(PREOP.stepColor[PREOP.taskCounter], true);
		
		//adding images and desc
		jQuery("#step_image").empty().append('<img class="centered" src="' + ATOOL.descDataList[PREOP.taskCounter-1].img + '"//>');
		jQuery("#step_desc").empty().append('<p class="image_desc">' + ATOOL.descDataList[PREOP.taskCounter-1].text + '</p>');
	}
	else{
		PICTIN.setColor(PREOP.stepColor[PREOP.taskCounter], false);
	}
	jQuery("#" + ATOOL.taskLabelList[PREOP.taskCounter].id + " > span").toggleClass("AT_stepTodo AT_stepCurrent");
	PREOP.taskCounter++;
	PICTIN.automatic_programs_tool.refreshWindowPosition();
}
function preop_addResult(result){
	////console.log(PREOP.resultCounter);
	jQuery("#" + ATOOL.resultLabelList[PREOP.resultCounter].id + " > span").toggleClass("AT_stepTodo AT_stepFinished");
	jQuery("#" + ATOOL.resultLabelList[PREOP.resultCounter].id).append('<span style="float:right" class="AT_stepFinished">' + result + '</span>');
	PREOP.resultCounter++;
}

function preop_task1(a_task, a_taskData){
	preop_init();
	preop_initTask();
	
	////console.log("label id : " + PREOP.labelID);
	jQuery("#" + PREOP.labelID + " > span").toggleClass("AT_stepTodo AT_stepFinished");
	
	jQuery(document).bind("CALIBRATION.done.ATOOL", function(){
		////console.log("calibration done");
		PICTIN.calibrate_tool.stop();
		jQuery(document).trigger(a_task.eventFinished, [a_task]);
		jQuery(document).unbind("CALIBRATION.done.ATOOL");
	});
	
	PICTIN.automatic_programs_tool.activateTool(PICTIN.calibrate_tool);
}
//END TASK 1

//TASK 2 - Pelvic reference line + bottome reference line
function preop_task2(a_task, a_taskData){
	preop_initTask();
	tm = new TaskManager("preop_task2_subtasks");
	tm.taskData = a_taskData;
	var task1 = tm.createTask("subtask1", preop_task2_subtask_drawDots);
	var task2 = tm.createTask("subtask2", preop_task2_subtask_drawRefLines);
	task2.addPrereq(task1);
	tm.start();
	jQuery(document).bind("preop_task2_subtasks_finished", function(e){
		jQuery(document).trigger(a_task.eventFinished, [a_task]);
	});
}

function preop_task2_subtask_drawDots(a_task, a_taskData){
	this.counter = 0;
	var me = this;

	jQuery(document).bind("DOT.drawn.ATOOL", function(e, position, dot){
		////console.log("wut");
		PICTIN.automatic_programs_tool.addShape(dot);
		a_taskData["task2.dot" + me.counter + "Pos"] = position;
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

function preop_task2_subtask_drawRefLines(a_task, a_taskData){
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
																color: "#"+PICTIN.current_color, 
																width: PICTIN.current_linethickness
																});
																					
	var translate = dojox.gfx.matrix.translate(	x1 + dx/2, 
												y1 + dy/2);
	var rotate = dojox.gfx.matrix.rotate(angle);
	var scale = dojox.gfx.matrix.scale(3, 1);
	var transform = dojox.gfx.matrix.multiply(translate, rotate, scale);
	line1.applyLeftTransform(transform);
	
	//line2
	var line2 = PICTIN.surface.createLine({	x1: -length/2, 
											y1: 0,
											x2: length/2, 
											y2: 0}).setStroke({
																color: "#"+PICTIN.current_color, 
																width: PICTIN.current_linethickness
																});
	translate = dojox.gfx.matrix.translate(x1, y1);
	rotate = dojox.gfx.matrix.rotate(angle+Math.PI/2);
	scale = dojox.gfx.matrix.scale(1.5, 1);
	transform = dojox.gfx.matrix.multiply(translate, rotate, scale);
	line2.applyLeftTransform(transform);
	
	//line3
	var line3 = PICTIN.surface.createLine({ x1: -length/2, 
											y1: 0,
											x2: length/2, 
											y2: 0}).setStroke({
																color: "#"+PICTIN.current_color, 
																width: PICTIN.current_linethickness
																});
																
	PICTIN.automatic_programs_tool.addShape(line1);
	PICTIN.automatic_programs_tool.addShape(line2);
	PICTIN.automatic_programs_tool.addShape(line3);
	
	translate = dojox.gfx.matrix.translate(x2, y2);
	transform = dojox.gfx.matrix.multiply(translate, rotate, scale);
	line3.applyLeftTransform(transform);
	
	var transformedPoint1 = dojox.gfx.matrix.multiplyPoint(line2.getTransform(), line2.getShape().x1, line2.getShape().y1);
	var transformedPoint2 = dojox.gfx.matrix.multiplyPoint(line2.getTransform(), line2.getShape().x2, line2.getShape().y2);
	a_taskData["task2_segment2"] = {x1: transformedPoint1.x, y1: transformedPoint1.y, x2: transformedPoint2.x, y2: transformedPoint2.y};
	transformedPoint1 = dojox.gfx.matrix.multiplyPoint(line3.getTransform(), line3.getShape().x1, line3.getShape().y1);
	transformedPoint2 = dojox.gfx.matrix.multiplyPoint(line3.getTransform(), line3.getShape().x2, line3.getShape().y2);
	a_taskData["task2_segment3"] = {x1: transformedPoint1.x, y1: transformedPoint1.y, x2: transformedPoint2.x, y2: transformedPoint2.y};
	transformedPoint1 = dojox.gfx.matrix.multiplyPoint(line1.getTransform(), line1.getShape().x1, line1.getShape().y1);
	transformedPoint2 = dojox.gfx.matrix.multiplyPoint(line1.getTransform(), line1.getShape().x2, line1.getShape().y2);
	a_taskData["task2_segment1"] = {x1: transformedPoint1.x, y1: transformedPoint1.y, x2: transformedPoint2.x, y2: transformedPoint2.y};
																	
	jQuery(document).trigger(a_task.eventFinished, [a_task]);
}
//END TASK 2

//TASK 3 - HC + HP
function preop_task3(a_task, a_taskData){
	preop_initTask();
	
	var tm = new TaskManager("preop_task3_subtasks");
	tm.taskData = a_taskData;
	var task1 = tm.createTask("preop_task3_subtask1", preop_task3_subtask_drawCircle);
	var task2 = tm.createTask("preop_task3_subtask2", preop_task3_subtask_drawCenterToLine);
	var task3 = tm.createTask("preop_task3_subtask3", preop_task3_subtask_measureSegments);
	
	task2.addPrereq(task1);
	task3.addPrereq(task2);
	//var task2 = tm.createTask("preop_task3_subtask2", preop_task3_subtask_calculateAngle);
	//task2.addPrereq(task1);
	tm.start();
	
	
	jQuery(document).bind("preop_task3_subtasks_finished", function(e){
		////console.log("lawl");
		jQuery(document).trigger(a_task.eventFinished, [a_task]);
	});
}

function preop_task3_subtask_drawCircle(a_task, a_taskData){
	jQuery(document).bind("circle_drawn.ATOOL", function(e, circle){
		
		var center = {};
		
		if(circle.getTransform() != null){
			center = dojox.gfx.matrix.multiplyPoint(circle.getTransform(), circle.getShape().cx, circle.getShape().cy);
		}
		else{
			center.x = circle.getShape().cx;
			center.y = circle.getShape().cy;
		}
		
		PICTIN.automatic_programs_tool.addShape(circle);
		a_taskData["task3_circle1_center"] = center;
		a_taskData["task3_circle1_radius"] = circle.getShape().r;
		PICTIN.tool_circle.stop();
		jQuery(document).trigger(a_task.eventFinished, [a_task]);
		jQuery(document).unbind("circle_drawn.ATOOL", this);
	});
	
	PICTIN.tool_circle.drawChildShapes = false;
	PICTIN.automatic_programs_tool.activateTool(PICTIN.tool_circle);
}

function preop_task3_subtask_drawCenterToLine(a_task, a_taskData){
	
	var circle_center = a_taskData["task3_circle1_center"];
	var segment2 = a_taskData["task2_segment2"];
	var segment3 = a_taskData["task2_segment3"];
	
	////console.log("segment 2 : " + segment2.x1 + " " + segment2.y1);
	var seg2Dist_x = Math.abs(segment2.x1 - circle_center.x);
	var seg3Dist_x = Math.abs(segment3.x1 - circle_center.x);
	
	var pointOnLine;
	if(seg2Dist_x < seg3Dist_x){
		pointOnLine = get_segment_point_closest_to_point(getLineEquationFromSegment(segment2), circle_center);
		//pointOnLine = getIntersectionPoint_2Lines({x1: circle_center.x, y1: circle_center.y, x2: circle_center.x+1, y2: circle_center.y}, segment2);
	}
	else{
		pointOnLine = get_segment_point_closest_to_point(getLineEquationFromSegment(segment3), circle_center);
		//pointOnLine = getIntersectionPoint_2Lines({x1: circle_center.x, y1: circle_center.y, x2: circle_center.x+1, y2: circle_center.y}, segment3);
	}	
	
	var line = PICTIN.surface.createLine({ x1: pointOnLine.x, 
								y1: pointOnLine.y,
								x2: circle_center.x, 
								y2: circle_center.y}).setStroke({
													color: "#"+PICTIN.current_color, 
													width: PICTIN.current_linethickness
													});
													
	PICTIN.automatic_programs_tool.addShape(line);
	
	////console.log("point on line : " + pointOnLine.x + ", " + pointOnLine.y);
	a_taskData["task3_segment1"] = {x1: circle_center.x, y1: circle_center.y, x2: pointOnLine.x, y2: pointOnLine.y};
	
	jQuery(document).trigger(a_task.eventFinished, [a_task]);
}

function preop_task3_subtask_measureSegments(a_task, a_taskData){
	var segment = a_taskData["task3_segment1"];
	var circle = {cx: a_taskData["task3_circle1_center"].x, cy: a_taskData["task3_circle1_center"].y, r: a_taskData["task3_circle1_radius"]};
	var points = getIntersectionPoints_SegmentCircle(segment, circle);
	var head_protusio;
	for(var i in points){
		////console.log("x: " + points[i].x + ", y: " + points[i].y);
		var circle1 = PICTIN.surface.createCircle({	cx: points[i].x,
										cy: points[i].y,
										r: 3}).setStroke({
														color: "#" + PICTIN.current_color,
										});
		PICTIN.automatic_programs_tool.addShape(circle1);

										
		head_protusio = Math.round(CALIBRATION.getMeasurement(get_segment_length(points[i].x, points[i].y, segment.x2, segment.y2)));
		
		////console.log("head_protusio : " + head_protusio);
		//a_taskData["results"]["HP"] = head_protusio;
		//preop_addResult(head_protusio);
		
		var labelPos = getLabelPosition_segment({x1: points[i].x, y1: points[i].y, x2: segment.x2, y2: segment.y2});
		var text = PICTIN.surface.createText({
					x: labelPos.x,
					y: labelPos.y,
					text: head_protusio,
					align: "middle"
				}).setStroke({color: "#" + PICTIN.current_color});
		PICTIN.automatic_programs_tool.addShape(text);

	}
	
	
	var head_diameter = Math.round(CALIBRATION.getMeasurement(circle.r*2));
	
	a_taskData["results"]["HP"] = head_protusio;
	preop_addResult(head_protusio);
	a_taskData["results"]["HD"] = head_diameter;
	preop_addResult(head_diameter, true);
	////console.log("head_diameter : " + head_diameter);
	jQuery(document).trigger(a_task.eventFinished, [a_task]);
}
//END TASK 3

//TASK 4
function preop_task4(a_task, a_taskData){
	preop_initTask();
	
	var tm = new TaskManager("preop_task4_subtasks");
	tm.taskData = a_taskData;
	var task1 = tm.createTask("preop_task4_subtask1", preop_task4_subtask_drawDots);
	var task2 = tm.createTask("preop_task4_subtask2", preop_task4_subtask_calculateAngle);
	
	task2.addPrereq(task1);
	tm.start();
	
	jQuery(document).bind("preop_task4_subtasks_finished", function(e){
		jQuery(document).trigger(a_task.eventFinished, [a_task]);
	});
}

function preop_task4_subtask_drawDots(a_task, a_taskData){
	this.counter = 0;
	var me = this;
	jQuery(document).bind("DOT.drawn.ATOOL", function(e, position, dot){
		PICTIN.automatic_programs_tool.addShape(dot);
		a_taskData["task4.dot" + me.counter + "Pos"] = position;
		PICTIN.tool_dot.stop();
		jQuery(document).unbind("DOT.drawn.ATOOL");
		jQuery(document).trigger(a_task.eventFinished, [a_task]);
	});
	
	PICTIN.automatic_programs_tool.activateTool(PICTIN.tool_dot);
}

function preop_task4_subtask_calculateAngle(a_task, a_taskData){
	var centerHC = a_taskData["task3_circle1_center"];
	var segment = {x1: a_taskData["task3_circle1_center"].x, y1: a_taskData["task3_circle1_center"].y, x2: a_taskData["task4.dot0Pos"].x, y2: a_taskData["task4.dot0Pos"].y};
	var PRL = a_taskData["task2_segment1"];
	var PRLeq = get_line_equation({x: PRL.x1, y: PRL.y1}, {x: PRL.x2, y: PRL.y2});
	
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
	var segment2EqParam = new parametric_line({x1: centerHC.x, y1: centerHC.y, x2: centerHC.x+dx, y2: y2});
	var length = getSegmentLength(segment);
	var angleP1 = {x: segment.x2, y: segment.y2};
	var angleP2 = centerHC;
	var angleP3 = {x: segment2EqParam.getPoint(length).x, y: segment2EqParam.getPoint(length).y};
	
	var angle = calculate_angle(angleP3, angleP2, angleP1);
	var angleResult = Math.round(angle*180/Math.PI);
	////console.log("angle : " + angleResult);

	////console.log("task4 segment length : " + length);
	var line1 = PICTIN.surface.createLine(segment).setStroke({color: "#" + PICTIN.current_color, width: PICTIN.current_linethickness});
	var line2 = PICTIN.surface.createLine({ x1: centerHC.x, y1: centerHC.y, x2: segment2EqParam.getPoint(length).x, y2: segment2EqParam.getPoint(length).y
	}).setStroke({color: "#" + PICTIN.current_color, width: PICTIN.
	current_linethickness});
	
	PICTIN.automatic_programs_tool.addShape(line1);
	PICTIN.automatic_programs_tool.addShape(line2);

	
	var angleLabelPos = getLabelPosition_angle(angleP1, angleP2, angleP3, false);
	
	angleResult = angleResult.numberFormat("0°");
	var text = PICTIN.surface.createText({x: angleLabelPos.x, y: angleLabelPos.y, text: angleResult, align: "middle"}).	setStroke({color: "#" + PICTIN.current_color});
	PICTIN.automatic_programs_tool.addShape(text);

	
	a_taskData["results"]["LCA"] = angleResult;
	preop_addResult(angleResult);
	jQuery(document).trigger(a_task.eventFinished, [a_task]);
}

//END TASK 4

//TASK 5
function preop_task5(a_task, a_taskData){
	preop_initTask();
	
	var tm = new TaskManager("preop_task5_subtasks");
	tm.taskData = a_taskData;
	var task1 = tm.createTask("preop_task5_subtask1", preop_task5_subtask_drawDots);
	var task2 = tm.createTask("preop_task5_subtask2", preop_task5_subtask_drawMidwayDots);
	var task3 = tm.createTask("preop_task5_subtask3", preop_task5_subtask_drawSegment);
	var task4 = tm.createTask("preop_task5_subtask4", preop_task5_subtask_drawCalculationSegments);

	task2.addPrereq(task1);
	task3.addPrereq(task2);
	task4.addPrereq(task3);
	tm.start();
	
	jQuery(document).bind("preop_task5_subtasks_finished", function(e){
		jQuery(document).trigger(a_task.eventFinished, [a_task]);
	});
}

function preop_task5_subtask_drawDots(a_task, a_taskData){
	this.counter = 0;
	var me = this;
	
	jQuery(document).bind("DOT.drawn.ATOOL", function(e, position, dot){
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

function preop_task5_subtask_drawMidwayDots(a_task, a_taskData){
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

function preop_task5_subtask_drawSegment(a_task, a_taskData){
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
							color: "#" + PICTIN.current_color,
							width: PICTIN.current_linethickness
						});
	
	line.applyLeftTransform(transform);
	
	PICTIN.automatic_programs_tool.addShape(line);
	
	var transformedPoint1 = dojox.gfx.matrix.multiplyPoint(line.getTransform(), line.getShape().x1, line.getShape().y1);
	var transformedPoint2 = dojox.gfx.matrix.multiplyPoint(line.getTransform(), line.getShape().x2, line.getShape().y2);
	a_taskData["task5_segment1"] = {x1: transformedPoint1.x, y1: transformedPoint1.y, x2: transformedPoint2.x, y2: transformedPoint2.y};
	
	jQuery(document).trigger(a_task.eventFinished, [a_task]);
}

function preop_task5_subtask_drawCalculationSegments(a_task, a_taskData){
	//segment1
	var segment1 = a_taskData["task3_segment1"];
	var segment2 = a_taskData["task5_segment1"];
	var intersectionPoint1 = getIntersectionPoint_2Lines(segment1, segment2);
	
	//segment2
	var point = {x: segment1.x1, y: segment1.y1};
	var intersectionPoint2 = get_segment_point_closest_to_point(getLineEquationFromSegment(segment2), point);
	
	var globalOffset_segment = {x1: intersectionPoint1.x, y1: intersectionPoint1.y, x2: segment1.x2, y2: segment1.y2};
	var femoralOffset_segment = {x1: intersectionPoint2.x, y1: intersectionPoint2.y, x2: segment1.x1, y2: segment1.y1};
	
	a_taskData["results"]["GO"] = Math.round(CALIBRATION.getMeasurement(getSegmentLength(globalOffset_segment)));
	a_taskData["results"]["FO"] = Math.round(CALIBRATION.getMeasurement(getSegmentLength(femoralOffset_segment)));
	preop_addResult(a_taskData["results"]["GO"], true);
	preop_addResult(a_taskData["results"]["FO"], true);
	
	//drawing lines
	var line = PICTIN.surface.createLine(globalOffset_segment).setStroke({
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
						
	jQuery(document).trigger(a_task.eventFinished, [a_task]);
}
//END TASK 5

//TASK 6
function preop_task6(a_task, a_taskData){
	preop_initTask();
	
	var tm = new TaskManager("preop_task6_subtasks");
	tm.taskData = a_taskData;
	var task1 = tm.createTask("preop_task6_subtask1", preop_task6_subtask_drawDots);
	var task2 = tm.createTask("preop_task6_subtask2", preop_task6_subtask_drawAndCalculate);
	
	task2.addPrereq(task1);
	tm.start();
	
	jQuery(document).bind("preop_task6_subtasks_finished", function(e){
		jQuery(document).trigger(a_task.eventFinished, [a_task]);
	});
}

function preop_task6_subtask_drawDots(a_task, a_taskData){
	this.counter = 0;
	var me = this;
	jQuery(document).bind("DOT.drawn.ATOOL", function(e, position, dot){
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

function preop_task6_subtask_drawAndCalculate(a_task, a_taskData){
	var point1 = a_taskData["task6.dot0Pos"];
	var point2 = a_taskData["task6.dot1Pos"];
	var centerPoint = {	x: point1.x + (point2.x-point1.x)/2, 
						y: point1.y + (point2.y-point1.y)/2};
	
	var centerHC = a_taskData["task3_circle1_center"];
	var segment = {x1: centerHC.x, y1: centerHC.y, x2: centerPoint.x, y2: centerPoint.y};
	
	var intersectionPoint = getIntersectionPoint_2Lines(a_taskData["task5_segment1"], segment);
	var neckAngle_segment = {x1: centerHC.x, y1: centerHC.y, x2: intersectionPoint.x, y2: intersectionPoint.y};
	var angle = Math.abs(Math.round(180-Math.abs(getAngle_2Seg(a_taskData["task5_segment1"], segment)*180/Math.PI)));
	var angleLabel = angle.numberFormat("0°");
	var angleP1 = centerPoint;
	var angleP2 = intersectionPoint;
	var angleP3 = {x: a_taskData["task5_segment1"].x2, y: a_taskData["task5_segment1"].y2};
	var angleLabelPos = getLabelPosition_angle(angleP1, angleP2, angleP3, false);
	a_taskData["results"]["VVA"] = angle;
	preop_addResult(angle);
	
	
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


	////console.log("angle : " + angle*180/Math.PI);
	
	jQuery(document).trigger(a_task.eventFinished, [a_task]);
}
//END TASK 6

//TASK7
function preop_task7(a_task, a_taskData){
	preop_initTask();
	
	var tm = new TaskManager("preop_task7_subtasks");
	tm.taskData = a_taskData;
	var task1 = tm.createTask("preop_task7_subtask1", preop_task7_subtask_drawDots);
	var task2 = tm.createTask("preop_task7_subtask2", preop_task7_subtask_drawAndCalculate);
	
	task2.addPrereq(task1);
	tm.start();
	
	jQuery(document).bind("preop_task7_subtasks_finished", function(e){
		PICTIN.restoreColor();
		jQuery(document).trigger(a_task.eventFinished, [a_task]);
	});
}

function preop_task7_subtask_drawDots(a_task, a_taskData){
	this.counter = 0;
	var me = this;
	jQuery(document).bind("DOT.drawn.ATOOL", function(e, position, dot){
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

function preop_task7_subtask_drawAndCalculate(a_task, a_taskData){
	////console.log("task7");
	var point1 = a_taskData["task7.dot0Pos"];
	var point2 = a_taskData["task7.dot1Pos"];
	var segment = a_taskData["task2_segment1"];
	var centerHC = a_taskData["task3_circle1_center"];
	
	
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
	a_taskData["results"]["GPH"] = length1;
	a_taskData["results"]["LPH"] = length2;
	a_taskData["results"]["GCH"] = length1 - length3;
	a_taskData["results"]["LCH"] = length3 + length2;
	preop_addResult(a_taskData["results"]["HCH"], true);
	preop_addResult(a_taskData["results"]["GPH"], true);
	preop_addResult(a_taskData["results"]["LPH"], true);
	preop_addResult(a_taskData["results"]["GCH"], true);
	preop_addResult(a_taskData["results"]["LCH"], true);
	
	var segment1 = {x1: point1.x, y1: point1.y, x2: intersectionPoint1.x, y2: intersectionPoint1.y};
	var segment2 = {x1: point2.x, y1: point2.y, x2: intersectionPoint2.x, y2: intersectionPoint2.y};
	var segment3 = {x1: centerHC.x, y1: centerHC.y, x2: intersectionPoint3.x, y2: intersectionPoint3.y};
	
	var label1Pos = getLabelPosition_segment(segment1);
	var label2Pos = getLabelPosition_segment(segment2);
	var label3Pos = getLabelPosition_segment(segment3);
	
	//drawing
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
	
	PIAMRESULTS["PREOP"] = a_taskData["results"];
	jQuery("#tool_info").dialog({	buttons: {
													"Send to OW": function(){
														//PICTIN.automatic_programs_tool.stop();
															//console.log("wut");
															jQuery(document).trigger("form_validated");
														}
									}});
	jQuery(document).bind("form_validated.PREOP", function(e){
		PIAM.update_piam("PREOP");
		PICTIN.automatic_programs_tool.stop();
		jQuery(document).unbind("form_validated.PREOP");
		jQuery(document).trigger(a_task.eventFinished, [a_task]);
	});
	jQuery(document).trigger(a_task.eventFinished, [a_task]);
}
//END TASK 7