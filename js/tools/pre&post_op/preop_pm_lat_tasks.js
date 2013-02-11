
PMLAT = {};
PMLAT.labelID;
PMLAT.dotArray = new Array();
PMLAT.resultRowID;
PMLAT.taskCounter = 0;
PMLAT.resultCounter = 0;
PMLAT.stepColor = new Array();
PMLAT.stepColor.push("ff0000");
PMLAT.stepColor.push("ff0000");
PMLAT.stepColor.push("ff9600");
PMLAT.stepColor.push("00ff00");
PMLAT.stepColor.push("00ffd8");
PMLAT.stepColor.push("00c0ff");
PMLAT.stepColor.push("4545ff");
PMLAT.stepColor.push("a200ff");
PMLAT.stepColor.push("ff00f0");

function PMLAT_init(){
	PMLAT.taskCounter = 0;
	PMLAT.resultCounter = 0;
}
function PMLAT_initTask(){
	
	for(var i in PMLAT.dotArray){
		//dot.setStroke({color: "#00ff00"});
		PMLAT.dotArray[i].setStroke({color: "#00ff00"});
	}
	
	if(PMLAT.taskCounter > 2){
		jQuery("#tool_info").dialog({title: ATOOL.taskLabelList[PMLAT.taskCounter].label});
	}
	else if(PMLAT.taskCounter >= 0){
		jQuery("#" + ATOOL.taskLabelList[PMLAT.taskCounter].id + " > span").toggleClass("AT_stepCurrent AT_stepFinished");
		
		//adding images and desc
		jQuery("#tool_info").dialog({title: ATOOL.taskLabelList[PMLAT.taskCounter].label});
		jQuery("#step_image").empty().append('<img class="centered" style = "width:450px;height:450px;" src="' + ATOOL.descDataList[PMLAT.taskCounter].img + '"//>');
		jQuery("#step_desc").empty().append('<p class="image_desc">' + ATOOL.descDataList[PMLAT.taskCounter].text + '</p>');
	}
	else{
		jQuery("#tool_info").dialog({title: ATOOL.taskLabelList[PMLAT.taskCounter].label});
	}
	
	PICTIN.setColor(PMLAT.stepColor[0], false);
	
	jQuery("#" + ATOOL.taskLabelList[PMLAT.taskCounter].id + " > span").toggleClass("AT_stepTodo AT_stepCurrent");
	PMLAT.taskCounter++;
	PICTIN.automatic_programs_tool.refreshWindowPosition();
}
function PMLAT_addResult(result){
	jQuery("#" + ATOOL.resultLabelList[PMLAT.resultCounter].id + " > span").toggleClass("AT_stepTodo AT_stepFinished");
	jQuery("#" + ATOOL.resultLabelList[PMLAT.resultCounter].id).append('<span class="AT_result AT_stepFinished">' + result + '</span>');
	PMLAT.resultCounter++;
}

//TASK 0
function PMLAT_task0(a_task, a_taskData){
	PMAP_init();
	PMAP_initTask()
	
	jQuery("#step_image").empty();
	jQuery("")
	jQuery("#step_desc").empty().append(jQuery("#PMLAT_form").html());
	
	var button = getDialogButton('.tool_info', 'Validate');
	if(button){
		button.attr('disabled', 'disabled').addClass('ui-state-disabled');
	}
	
	
	jQuery(document).bind("PIAM_side_chosen", function(e){
		button.removeAttr('disabled').removeClass('ui-state-disabled');
	
	});

	jQuery(document).bind("form_validated.PMLAT", function(e){
		a_taskData["results"]["side"] = jQuery('input[name=PMLAT_side]:checked').val();
		
		jQuery("#tool_info").dialog({
									buttons: {}
									});
		jQuery(document).unbind("form_validated.PMLAT");
		jQuery(document).trigger(a_task.eventFinished, [a_task]);
	});
}

//TASK 1
function PMLAT_task1(a_task, a_taskData){
	PMLAT_init();
	PMLAT_initTask();
	
	////console.log("label id : " + PMLAT.labelID);
	jQuery("#" + PMLAT.labelID + " > span").toggleClass("AT_stepTodo AT_stepFinished");
	
	jQuery(document).bind("CALIBRATION_DONE.ATOOL", function(){
		////console.log("calibration done");
		PICTIN.calibrate_tool.stop();
		jQuery(document).trigger(a_task.eventFinished, [a_task]);
		jQuery(document).unbind("CALIBRATION_DONE.ATOOL");
	});
	
	PICTIN.automatic_programs_tool.activateTool(PICTIN.calibrate_tool);
}
//END TASK 1

//TASK 2 - Pelvic reference line + bottome reference line
function PMLAT_task2(a_task, a_taskData){
	PMLAT_initTask();
	tm = new TaskManager("PMLAT_task2_subtasks");
	tm.taskData = a_taskData;
	var task1 = tm.createTask("subtask1", PMLAT_task2_subtask_drawDots);
	var task2 = tm.createTask("subtask2", PMLAT_task2_subtask_calculateResults);
	task2.addPrereq(task1);
	tm.start();
	jQuery(document).bind("PMLAT_task2_subtasks_finished", function(e){
		jQuery(document).trigger(a_task.eventFinished, [a_task]);
	});
}

function PMLAT_task2_subtask_drawDots(a_task, a_taskData){
	this.counter = 0;
	var me = this;

	jQuery(document).bind("DOT.drawn.ATOOL", function(e, position, dot){
		////console.log("wut");
		PMLAT.dotArray.push(dot);
		PICTIN.automatic_programs_tool.addShape(dot);
		a_taskData["task2.dot" + me.counter + "Pos"] = position;
		////console.log("counter : " + me.counter);
		if(me.counter == 3){
				
			PICTIN.tool_dot.stop();
			jQuery(document).unbind("DOT.drawn.ATOOL");
			jQuery(document).trigger(a_task.eventFinished, [a_task]);
		}
		me.counter++;
	});

	PICTIN.automatic_programs_tool.activateTool(PICTIN.tool_dot);
}

function PMLAT_task2_subtask_calculateResults(a_task, a_taskData){
	var point1 = a_taskData["task2.dot0Pos"];
	var point2 = a_taskData["task2.dot1Pos"];
	var point3 = a_taskData["task2.dot2Pos"];
	var point4 = a_taskData["task2.dot3Pos"];
	
	var midpoint1 = {	x:point1.x + (point4.x-point1.x)/2, 
						y:point1.y + (point4.y-point1.y)/2};
	var midpoint2 = {	x:point2.x + (point3.x-point2.x)/2,
						y:point2.y + (point3.y-point2.y)/2};
	
	a_taskData["LA"] = {x1: midpoint1.x, y1: midpoint1.y, x2: midpoint2.x, y2: midpoint2.y};
	a_taskData["n"] = midpoint2;
	
	/*
PICTIN.surface.createCircle({
						cx: midpoint2.x,
						cy: midpoint2.y,
						r: 1
					}).setStroke({
						color: "#" + PICTIN.current_color,
						width: PICTIN.current_linethickness,
						'shape-rendering': 'crispEdges'
					});
*/

	jQuery(document).trigger(a_task.eventFinished, [a_task]);
}
//END TASK 2

//TASK 3 - HC + HP
function PMLAT_task3(a_task, a_taskData){
	PMLAT_initTask();
	
	var tm = new TaskManager("PMLAT_task3_subtasks");
	tm.taskData = a_taskData;
	var task1 = tm.createTask("PMLAT_task3_subtask1", PMLAT_task3_subtask_drawCircle);
	//var task2 = tm.createTask("PMLAT_task3_subtask2", PMLAT_task3_subtask_drawCenterToLine);
	var task2 = tm.createTask("PMLAT_task3_subtask3", PMLAT_task3_subtask_measureSegments);
	
	task2.addPrereq(task1);
	//task3.addPrereq(task2);
	//var task2 = tm.createTask("PMLAT_task3_subtask2", PMLAT_task3_subtask_calculateAngle);
	//task2.addPrereq(task1);
	tm.start();
	
	
	jQuery(document).bind("PMLAT_task3_subtasks_finished", function(e){
		////console.log("lawl");
		jQuery(document).trigger(a_task.eventFinished, [a_task]);
	});
}

function PMLAT_task3_subtask_drawCircle(a_task, a_taskData){
	var dotCounter = 0;
	var dotPos = new Array();
	
	jQuery(document).bind("DOT.drawn.ATOOL", function(e, position, dot){
		PMLAT.dotArray.push(dot);
		if(dotCounter < 3){
			dotPos.push({x: position.x, y: position.y});
			PICTIN.automatic_programs_tool.addShape(dot);
			
			if(dotCounter == 2){
				var center = {};
				var circle = compute_circle(dotPos[0], dotPos[1], dotPos[2]);
				
				if(dot.getTransform() != null){
					center = dojox.gfx.matrix.multiplyPoint(dot.getTransform(), circle.Xo, circle.Yo);
				}
				else{
					center.x = circle.Xo;
					center.y = circle.Yo;
				}
			
				//draw circle
				var circleDrawing = PICTIN.surface.createCircle({
					cx: circle.Xo,
					cy: circle.Yo,
					r: circle.r
				}).setStroke({
					color: "#FFFF00",
					width: PICTIN.current_linethickness,
					'shape-rendering': 'crispEdges'
				});
				
				//register shape with manager
				PICTIN.shape_manager.add_shape(circleDrawing);
	
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
				PICTIN.automatic_programs_tool.addShape(circleDrawing);
				
				a_taskData["task3_circle1_center"] = center;
				a_taskData["task3_circle1_radius"] = circle.r;
			}
			
			dotCounter++;
		}
		else{
			dotPos.push({x: position.x, y: position.y});		
			PICTIN.automatic_programs_tool.addShape(dot);
			a_taskData["NZ"] = dotPos[3];
			PICTIN.tool_dot.stop();
			jQuery(document).trigger(a_task.eventFinished, [a_task]);
			jQuery(document).unbind("DOT.drawn.ATOOL", this);
		}
	});
	
	
	PICTIN.automatic_programs_tool.activateTool(PICTIN.tool_dot);
}

function PMLAT_task3_subtask_measureSegments(a_task, a_taskData){
	var HC = a_taskData["task3_circle1_center"];
	var LA = a_taskData["LA"];
	var NZ = a_taskData["NZ"];
	var n = a_taskData["n"];
	var circleRadius = a_taskData["task3_circle1_radius"];
	
	//calculate results
	var head_diameter = Math.round(CALIBRATION.getMeasurement(circleRadius*2));
	var DCNA = Math.round(CALIBRATION.getMeasurement(getShortestDistance_PointLine(getLineEquationFromSegment(LA), HC)));
	var DCNAHDR = (DCNA/head_diameter).numberFormat("0.00");
	var NA = Math.abs(Math.round(calculate_angle(n, HC, NZ) * 180/Math.PI));
	
	//saving results
	/*a_taskData["results"]["HP"] = head_protusio;
	PMLAT_addResult(head_protusio);*/
	a_taskData["results"]["HD"] = head_diameter;
	a_taskData["results"]["DCNA"] = DCNA;
	a_taskData["results"]["DCNAHDR"] = DCNAHDR;
	a_taskData["results"]["NA"] = NA;
	
	//console.log("HD : " + head_diameter);
	//console.log("DCNA : " + DCNA);
	//console.log("DCNAHDR : " + DCNAHDR);
	//console.log("NA : " + NA);
	
	//PMLAT_addResult(head_diameter, true);
	////console.log("head_diameter : " + head_diameter);
	jQuery(document).trigger(a_task.eventFinished, [a_task]);
}
//END TASK 3

//TASK 4
function PMLAT_task4(a_task, a_taskData){
	PMLAT_initTask();
	jQuery(document).bind("form_validated.PMLAT", function(e){
		PIAM.update_piam("PGM_LAT");
		PICTIN.automatic_programs_tool.stop();
		jQuery(document).unbind("form_validated.PMLAT");
		jQuery(document).trigger(a_task.eventFinished, [a_task]);
	});
	//PMLAT_initTask();
	//show results
	jQuery("#step_image").empty();
	jQuery("#step_desc").empty();
	
	//jQuery("#tool_info > .results").empty().append('<h3>Results :</h3>');
	jQuery("#tool_info > .results").append('<table width="100%">');
			for(var i in ATOOL.resultLabelList){
				jQuery("#tool_info > .results").append('<tr class="PIAM_row" id="'+ ATOOL.resultLabelList[i].id +'"><td style="width:5%;text-align:center;" class="AT_resultNb">'+(parseInt(i)+1)+'<td style="width:45%" class="AT_resultLabel AT_stepTodo">' + ATOOL.resultLabelList[i].label + '</td>');
				jQuery("#" + ATOOL.resultLabelList[i].id).append('<td style="width:10%;background-color:#FFE7E4;text-align:center;border:solid 1px #94A9E4;" class="AT_result AT_stepFinished">' + a_taskData["results"][ATOOL.resultLabelList[i].id] + '</td><td  style="width:10%;text-align:center;" class="AT_result_unit">' + ATOOL.resultLabelList[i].result_unit + '</td><td style="width:30%" class="AT_result_type">' + ATOOL.resultLabelList[i].result_type + '</td></tr>');
			}
	jQuery("#tool_info > .results").append('</table>');
	
	PIAMRESULTS["PGM_LAT"] = a_taskData["results"];
	jQuery("#tool_info").dialog({	buttons: {
													"Send to OW": function(){
														//PICTIN.automatic_programs_tool.stop();
															//console.log("wut");
															jQuery(document).trigger("form_validated");
														}
									}});
	
	jQuery(document).trigger(a_task.eventFinished, [a_task]);
}
//END TASK 4

