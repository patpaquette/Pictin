var BBL_skyline_views_postop = KneeBase.extend({
	constructor: function(){
		this.base();
		this.programName = "KNEE: BBL Skyline view / postop";
		this.taskArray = new Array();
		
		this.stepsInfos[0] = new APStepInfo(this.patellarMeasures, 0, "Step 1/2 : Sky Line measures (30&deg;)", "<ol><li>Mark off 4 points as: <strong>C1</strong> (medial), <strong>C2</strong> (lateral) at upper aspect of trochlear contour, then <strong>R1</strong> (medial) and <strong>R2</strong> (lateral) at the edges of the articular surface of patella (be it resurfaced or not)</li><li>Indicate the patellar crest as <strong>RC</strong> then the bottom of the trochlear groove as <strong>T</strong></li></ol>", "img/PIAM_BBL_Images/slide29.png", "2F87FA");
		/*this.stepsInfos[1] = new APStepInfo(this.patellarMeasures, 1, "Step 2/2 : Sky Line measures (30&deg;)", "1 - Mark off the point that corresponds to the perpendicular line to R1R2 passing through Rc which cuts C1C2 at R'<br/>2 - Mark off the point that corresponds to the perpendicular line to C1C2 passing through T which cuts C1C2 at T'", "img/PIAM_BBL_Images/slide30.png" , "FCF800");*/
		this.stepsInfos[1] = new APStepInfo(this.patellarMeasures, 1, "Step 2/2 : Results", "", "img/PIAM_BBL_Images/slide30.png" , "00CC00");
	},
	initializeProgram: function(){
		var task0 = this.taskManager.createTask("task1", jQuery.proxy(this.skyLineMeasures, this));
		var task1 = this.taskManager.createTask("task2", jQuery.proxy(this.calculateResults, this));
		var task2 = this.taskManager.createTask("task3", jQuery.proxy(this.showResults, this));
		
		//var task1 = this.taskManager.createTask("task2", jQuery.proxy(this.femoralMeasures, this));
		task1.addPrereq(task0);
		task2.addPrereq(task1);
		this.initUI();
		this.taskManager.start();
	},
	initUI: function(){
		this.base();
		jQuery("#tool_info").dialog({
									buttons: {},
									close: jQuery.proxy(this.stop, this)
									});
	},
	initTask: function(){
		for(var i in this.dotArray){
			//dot.setStroke({color: "#00ff00"});
			this.dotArray[i].setStroke({color: "#00ff00"});
		}
		
		if(this.taskCounter >= 0){
			jQuery("#" + this.stepsInfos[this.taskCounter].stepID + " > span").toggleClass("AT_stepCurrent AT_stepFinished");
			
			//adding images and desc
			jQuery("#tool_info").dialog({title: this.stepsInfos[this.taskCounter].stepTitle});
			jQuery("#step_image").empty().append('<img class="centered" style = "width:350px;height:442px;" src="' + this.stepsInfos[this.taskCounter].stepImg + '"//>');
			jQuery("#step_desc").empty().append('<p class="image_desc">' + this.stepsInfos[this.taskCounter].stepDesc + '</p>');
		}
		
		PICTIN.setColor(this.stepsInfos[this.taskCounter].stepColor, false);
		
		//jQuery("#" + this.stepsInfos[this.taskCounter].stepID + " > span").toggleClass("AT_stepTodo AT_stepCurrent");
		PMLAT.taskCounter++;
		PICTIN.automatic_programs_tool.refreshWindowPosition();
		this.taskCounter++;
	},
	skyLineMeasures: function(task, taskData){
		this.initTask();
		var taskManager = new TaskManager("skylineMeasures", this.data);
		
		var task1 = taskManager.createTaskWithArgs("subtask1",
											jQuery.proxy(this.getDrawnPointsPos, this), 
											jQuery.proxy(function(task, taskData){
												taskData["R1"] = taskData["output"]["pointPosition1"];
												taskData["R2"] = taskData["output"]["pointPosition2"];
												PICTIN.current_color = "FF0000";
												taskData["r"] = this.drawLine(taskData["R1"].x, taskData["R1"].y, taskData["R2"].x, taskData["R2"].y);
											}, this), 2);
											
		var task2 = taskManager.createTaskWithArgs("subtask2",
											jQuery.proxy(this.getDrawnPointsPos, this), 
											jQuery.proxy(function(task, taskData){
												taskData["C1"] = taskData["output"]["pointPosition1"];
												taskData["C2"] = taskData["output"]["pointPosition2"];
												PICTIN.current_color = "00B8F5";
												taskData["c"] = this.drawLine(taskData["C1"].x, taskData["C1"].y, taskData["C2"].x, taskData["C2"].y);
											}, this), 2);
		task2.addPrereq(task1);
		
		var task3 = taskManager.createTaskWithArgs("subtask3",
											jQuery.proxy(this.getDrawnPointsPos, this), 
											jQuery.proxy(function(task, taskData){
												taskData["Rc"] = taskData["output"]["pointPosition1"];
												taskData["T"] = taskData["output"]["pointPosition2"];
												this.initTask();
												
												//calculating R'
												var R1R2_lineEquation = get_line_equation(taskData["R1"], taskData["R2"]);
												var closestPoint = get_segment_point_closest_to_point(R1R2_lineEquation, taskData["Rc"]);
												var R1R2_Rc_perp_lineEquation = get_line_equation(closestPoint, taskData["Rc"]);
												var line = this.drawLine2P(closestPoint, taskData["Rc"]);
												var C1C2_lineEquation = get_line_equation(taskData["C1"], taskData["C2"]);
												taskData["Rp"] = getIntersectionPoint_2LineEquations(R1R2_Rc_perp_lineEquation, C1C2_lineEquation);
												this.drawDot1P(taskData["Rp"]);
												this.drawDotLabel1P("R'", taskData["Rp"]);
												
												//calaculating T'
												taskData["Tp"] = get_segment_point_closest_to_point(C1C2_lineEquation, taskData["T"]);
												//var C1C2_T_perp_lineEquation = get_line_equation(closestPoint, taskData["T"]);
												line = this.drawLine2P(taskData["Tp"], taskData["T"]);
												//taskData["Tp"] = getIntersectionPoint_2LineEquations(C1C2_T_perp_lineEquation, C1C2_lineEquation);
												this.drawDot1P(taskData["Tp"]);
												this.drawDotLabel1P("T'", taskData["Tp"]);
											}, this), 2);
		task3.addPrereq(task2);
		
		
		taskManager.start();
		
		jQuery(document).bind(taskManager.allTasksFinishedEvent, function(e){
			jQuery(document).trigger(task.eventFinished, [task]);
			jQuery(document).unbind(taskManager.allTasksFinishedEvent, arguments.callee);
		})
	},
	calculateResults: function(task, taskData){
		var RpTpLength = getSegmentLength(getSegment2P(taskData["Rp"], taskData["Tp"]));
		var C1C2Length = getSegmentLength(getSegment2P(taskData["C1"], taskData["C2"]));
		var modifier = (getSegmentLength(getSegment2P(taskData["Rp"], taskData["C1"])) < getSegmentLength(getSegment2P(taskData["Tp"], taskData["C1"])))?1:-1;
		
		taskData["results"]["C1C2^R1R2"] = new AP.resultType(	"C1C2^R1R2", 1, "AP patellar tilt C1C2^R1R2", "&deg;", "", -1 * Math.round(toDegrees(getAngle_2Seg(	getSegment2P(taskData["C1"], taskData["C2"]), 																																												getSegment2P(taskData["R1"], taskData["R2"])))), true);
		
		taskData["results"]["R'T'/C1C2"] = new AP.resultType(	"R'T'/C1C2", 2, "AP patellar translation (R'T'/C1C2)", "", "+ if R'C1<T'C1",
																((RpTpLength/C1C2Length) * modifier).numberFormat("0.00"), true);
		
		
	
		jQuery(document).trigger(task.eventFinished, [task]);
	}
})