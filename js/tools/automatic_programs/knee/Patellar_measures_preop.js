var BBL_femoral_measures_preop = KneeBase.extend({
	constructor: function(){
		this.base();
		this.programName = "Patellar measures";
		this.taskArray = new Array();
		
		this.stepsInfos[0] = new APStepInfo(this.patellarMeasures, 0, "Step 1/4 : Patellar measures", "Mark off 4 points as:<ol><li><strong>P</strong> and <strong>B</strong> as respectively upper and lower aspects of the native patella<li>Then <strong>A</strong> as the lower point of patellar articular surface<li>Then <strong>Tm</strong> as the most anterior point of tibial tray</ol>", "img/PIAM_BBL_Images/slide09.png", "2F87FA");
		this.stepsInfos[1] = new APStepInfo(this.patellarMeasures, 1, "Step 2/4 : Femoral measures 1", "<ol><li>Mark off 3 points as <strong>F1</strong>, <strong>F2</strong> at posterior cortices of the femoral shaft and <strong>F3</strong> as the most posterior contour of the condyle</ol>", "img/PIAM_BBL_Images/slide10.png" , "FCF800");
		this.stepsInfos[2] = new APStepInfo(this.patellarMeasures, 2, "Step 2/4 : Femoral measures 2", "<ol style=\"counter-reset:1\"><li>Indicate the <strong>F</strong> point at intersection of perpendicular to <strong>F1F2</strong> passing through <strong>F3</strong> on the one hand, and anterior contour of the condyle<li>Then <strong>D</strong>at intersection of <strong>F1F2</strong> and the distal contour of condyle<li>Then <strong>E</strong> at intersection of <strong>F1F2</strong> and Blumensat line</ol>", "img/PIAM_BBL_Images/slide11.png", "ff0000");
		this.stepsInfos[3] = new APStepInfo(this.patellarMeasures, 3, "Step 3/4 : Tibial measures 1", "<ol><li>Mark off 3 points as <strong>C1</strong>, <strong>C2</strong> at posterior cortices of the tibial shaft and <strong>C3</strong> as the upper aspect of fibula", "img/PIAM_BBL_Images/slide12.png", "2164FF");
		this.stepsInfos[4] = new APStepInfo(this.patellarMeasures, 4, "Step 3/4 : Tibial measures 2", "<ol style=\"counter-reset:1\"><li>Indicate as <strong>T'</strong> the intersection of perpendicular to <strong>C1C2</strong> passing through <strong>C3</strong> on the one hand, and anterior aspect of the tibial contour</ol>", "img/PIAM_BBL_Images/slide13.png", "ff0000");
		this.stepsInfos[5] = new APStepInfo(this.calculateResults, 5, "Step 4/4 : Results", "", "img/PIAM_BBL_Images/slide14.png", "ff0000");

	},
	initializeProgram: function(){
		var task0 = this.taskManager.createTask("task1", jQuery.proxy(this.patellarMeasures, this));
		var task1 = this.taskManager.createTask("task2", jQuery.proxy(this.femoralMeasures, this));
		var task2 = this.taskManager.createTask("task3", jQuery.proxy(this.calculateResults, this));
		var task3 = this.taskManager.createTask("task4", jQuery.proxy(this.showResults, this));
		task1.addPrereq(task0);
		task2.addPrereq(task1);
		task3.addPrereq(task2);
		this.initUI();
		this.taskManager.start();
	},
	initUI: function(){
		this.base();
		jQuery("#tool_info").dialog({
									buttons: {},
									close: this.stop
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
			jQuery("#step_image").empty().append('<img class="centered" style = "width:250px;height:500px;" src="' + this.stepsInfos[this.taskCounter].stepImg + '"//>');
			jQuery("#step_desc").empty().append('<p class="image_desc">' + this.stepsInfos[this.taskCounter].stepDesc + '</p>');
		}
		
		PICTIN.setColor(this.stepsInfos[this.taskCounter].stepColor, false);
		
		//jQuery("#" + this.stepsInfos[this.taskCounter].stepID + " > span").toggleClass("AT_stepTodo AT_stepCurrent");
		PMLAT.taskCounter++;
		PICTIN.automatic_programs_tool.refreshWindowPosition();
		this.taskCounter++;
	},
	patellarMeasures: function(task, taskData){
		this.initTask();
		var taskManager = new TaskManager("patellarMeasures", this.data);
		
		var task1 = taskManager.createTaskWithArgs("subtask1", 
											jQuery.proxy(this.getDrawnPointsPos, this), 
											jQuery.proxy(function(task, taskData){
												taskData["P"] = taskData["output"]["pointPosition1"];
												taskData["B"] = taskData["output"]["pointPosition2"];
												taskData["h"] = this.drawLine(taskData["P"].x, taskData["P"].y, taskData["B"].x, taskData["B"].y);
												//this.drawDotLabel1P("P", a_taskData["P"]);
												//this.drawDotLabel1P("B", a_taskData["B"]);
											}, this), 2);
							
		var task2 = taskManager.createTaskWithArgs("subtask2",
											jQuery.proxy(this.getDrawnPointsPos, this),
											jQuery.proxy(function(task, taskData){
												taskData["A"] = taskData["output"]["pointPosition1"];
												taskData["T"] = taskData["output"]["pointPosition2"];
												//this.drawDotLabel1P("A", a_taskData["A"]);
												//this.drawDotLabel1P("T", a_taskData["T"]);
											}, this), 2);
											
		task2.addPrereq(task1);		
		taskManager.start();
		
		jQuery(document).bind("patellarMeasures_finished", function(e){
			jQuery(document).trigger(task.eventFinished, [task]);
			jQuery(document).unbind("pattelarMeasures_finished", arguments.callee);
		});
	},
	femoralMeasures: function(task, taskData){
		this.initTask();
		var taskManager = new TaskManager("femoralMeasures", this.data);
		
		var task1 = taskManager.createTaskWithArgs("femoralMeasures1_setUp", 
											jQuery.proxy(this.getDrawnPointsPos, this), 
											jQuery.proxy(function(task, taskData){
												taskData["F1"] = taskData["output"]["pointPosition1"];
												taskData["F2"] = taskData["output"]["pointPosition2"];
												taskData["F3"] = taskData["output"]["pointPosition3"];
												var F1F2_lineEquation = get_line_equation(taskData["F1"], taskData["F2"]);
												this.drawLine2P(taskData["F1"], {x: F1F2_lineEquation.getX(PICTIN.surface.getDimensions().height*0.95), y: PICTIN.surface.getDimensions().height*0.95});
												
												var F3_F1F2_closestPoint = get_segment_point_closest_to_point(F1F2_lineEquation, taskData["F3"]);
												taskData["F3_F1F2_closestPoint"] = F3_F1F2_closestPoint;
												var f3_lineEquation = get_line_equation(F3_F1F2_closestPoint, taskData["F3"]);
												this.drawLine2P(taskData["F3"], {x: PICTIN.surface.getDimensions().width*0.95, y: f3_lineEquation.getY(PICTIN.surface.getDimensions().width*0.95)});
												this.initTask();
												
												//this.drawDotLabel1P("F1", a_taskData["F1"]);
												//this.drawDotLabel1P("F2", a_taskData["F2"]);
												//this.drawDotLabel1P("F3", a_taskData["F3"]);
											}, this), 3);
											
		var task2 = taskManager.createTaskWithArgs("femoralMeasures1",
											jQuery.proxy(this.getDrawnPointsPos, this),
											jQuery.proxy(function(task, taskData){
												taskData["F"] = taskData["output"]["pointPosition1"];
												taskData["D"] = taskData["output"]["pointPosition2"];
												taskData["E"] = taskData["output"]["pointPosition3"];
												//this.drawDotLabel1P("F", a_taskData["F"]);
												//this.drawDotLabel1P("D", a_taskData["D"]);
												//this.drawDotLabel1P("E", a_taskData["E"]);
												this.initTask();
											}, this), 3);
		task2.addPrereq(task1);
		
		var task3 = taskManager.createTaskWithArgs("femoralMeasures2_setUp", 
											jQuery.proxy(this.getDrawnPointsPos, this), 
											jQuery.proxy(function(task, taskData){
												taskData["C1"] = taskData["output"]["pointPosition1"];
												taskData["C2"] = taskData["output"]["pointPosition2"];
												taskData["C3"] = taskData["output"]["pointPosition3"];
												//this.drawDotLabel1P("C1", a_taskData["H"]);
												//this.drawDotLabel1P("C2", a_taskData["H"]);
												//this.drawDotLabel1P("C3", a_taskData["H"]);
												var C1C2_lineEquation = get_line_equation(taskData["C1"], taskData["C2"]);
												this.drawLine2P(taskData["C2"], {x: C1C2_lineEquation.getX(PICTIN.surface.getDimensions().height*0.05), y: PICTIN.surface.getDimensions().height*0.05});
												
												var closestPoint = get_segment_point_closest_to_point(C1C2_lineEquation, taskData["C3"]);
												var C3_lineEquation = get_line_equation(closestPoint, taskData["C3"]);
												taskData["C3_pC1C2_equation"] = C3_lineEquation;
												this.drawLine2P(taskData["C3"], {x: PICTIN.surface.getDimensions().width*0.95, y: C3_lineEquation.getY(PICTIN.surface.getDimensions().width*0.95)});
												
												this.initTask();
											}, this), 3);
		task3.addPrereq(task2);
		
		var task4 = taskManager.createTaskWithArgs("femoralMeasures2",
											jQuery.proxy(this.getDrawnPointsPos, this),
											jQuery.proxy(function(task, taskData){
												taskData["T'"] = taskData["output"]["pointPosition1"];
											}, this), 1);
		
		
		task4.addPrereq(task3);
											
		
							
			
		taskManager.start();
		
		jQuery(document).bind("femoralMeasures_finished", function(e){
			jQuery(document).trigger(task.eventFinished, [task]);
			jQuery(document).unbind("femoralMeasures_finished", arguments.callee);
		});
	},
	calculateResults: function(task, taskData){
		var baseUnit = 10;
		var hLength = getSegmentLength(getSegment2P(taskData["P"], taskData["B"]));
		var FF3Length = getSegmentLength(getSegment2P(taskData["F"], taskData["F3"]));
		var LLength = getSegmentLength(getSegment2P(taskData["F3"], taskData["F3_F1F2_closestPoint"]));
		var EDLength = getSegmentLength(getSegment2P(taskData["E"], taskData["D"]));
		
		taskData["results"]["hLength"] 	= new AP.resultType("hLength", 1, "Patellar high \"h\" : PB", "u", "", baseUnit);
		taskData["results"]["AT/AP"] 	= new AP.resultType("AT/AP", 2, "Caton-Deschamps index (AT/AP)", "Absolute value", "",
														  	(getSegmentLength(getSegment2P(taskData["A"], taskData["T"]))/getSegmentLength(getSegment2P(taskData["A"], taskData["P"]))).numberFormat("0.00"));
		taskData["results"]["AT'/AP"]	= new AP.resultType("AT'/AP", 3, "preop BBL index (AT'/AP)", "Absolute value", "",
															(getSegmentLength(getSegment2P(taskData["A"], taskData["T'"]))/getSegmentLength(getSegment2P(taskData["A"], taskData["P"]))).numberFormat("0.00"));
		taskData["results"]["FF3"] 		= new AP.resultType("FF3", 4, "Total condylar width (F-F3): K", "u", "",
															(FF3Length/hLength*baseUnit).numberFormat("0.00"));
		taskData["results"]["K/h"]		= new AP.resultType("K/h", 5, "K/h Ratio", "Ansolute value", "",
															(FF3Length/hLength).numberFormat("0.00"));
		taskData["results"]["L"]		= new AP.resultType("L", 6, "Belleman's Posterior offset : L", "u", "",
															(LLength/hLength*baseUnit).numberFormat("0.00"));
		taskData["results"]["K/L"]		= new AP.resultType("K/L", 7, "K/L Ratio", "Absolute value", "",
															(FF3Length/LLength).numberFormat("0.00"));
		taskData["results"]["ED"]		= new AP.resultType("ED", 8, "Blum value (ED)", "u", "",
															(EDLength/hLength*baseUnit).numberFormat("0.00"));
		this.initTask();
		jQuery(document).trigger(task.eventFinished, [task]);

	}
})


var BBL_femoral_measures_postop = BBL_femoral_measures_preop.extend({
	constructor: function(){
		this.base();
		this.programName = "Patellar measures postop";
		this.taskArray = new Array();
		
		this.stepsInfos[0] = new APStepInfo(this.patellarMeasures, 0, 
											"Step 1/4 : Patellar measures", 
											"Mark off 4 points as:<ol><li><strong>P</strong> and <strong>B</strong> as respectively upper and lower aspects of the native patella<li>Then <strong>A</strong> as the lower point of patellar articular surface<li>Then <strong>Tm</strong> as the most anterior point of tibial tray</ol>", 
											"img/PIAM_BBL_Images/slide21.png", 
											"2F87FA");
		this.stepsInfos[1] = new APStepInfo(this.patellarMeasures, 1, 
											"Step 2/4 : Femoral measures 1", 
											"<ol><li>Mark off 3 points as <strong>F1</strong>, <strong>F2</strong> at posterior cortices of the femoral shaft and <strong>F3</strong> as the most posterior contour of the condyle</ol>", 
											"img/PIAM_BBL_Images/slide22.png" , 
											"FCF800");
		this.stepsInfos[2] = new APStepInfo(this.patellarMeasures, 2, 
											"Step 2/4 : Femoral measures 2", 
											"<ol style=\"counter-reset:1\"><li>Indicate the <strong>F</strong> point at intersection of perpendicular to <strong>F1F2</strong> passing through <strong>F3</strong> on the one hand, and anterior contour of the condyle<li>Then <strong>D</strong> at intersection of <strong>F1F2</strong> and the distal contour of condyle<li>Then <strong>E</strong> at intersection of <strong>F1F2</strong> and Blumensat line</ol>", 
											"img/PIAM_BBL_Images/slide23.png", 
											"ff0000");
		this.stepsInfos[3] = new APStepInfo(this.patellarMeasures, 3, 
											"Step 3/4 : Tibial measures 1", 
											"<ol><li>Mark off 3 points as <strong>C1</strong>, <strong>C2</strong> at posterior cortices of the tibial shaft and <storng>C3</strong> as the upper aspect of fibula</ol>", 
											"img/PIAM_BBL_Images/slide24.png", 
											"2164FF");
		this.stepsInfos[4] = new APStepInfo(this.patellarMeasures, 4, 
											"Step 3/4 : Tibial measures 2", 
											"<ol style=\"counter-reset:1\"><li>Indicate as <strong>T'</strong> the intersection of perpendicular to <strong>C1C2</strong> passing through <strong>C3</strong> on the one hand, and anterior aspect of the tibial contour<li>Mark off the posterior-superior edge of tibial tray as <strong>T'm</strong></ol>", 
											"img/PIAM_BBL_Images/slide25.png", 
											"ff0000");
		this.stepsInfos[5] = new APStepInfo(this.patellarMeasuresContd, 5, 
											"Step 3/4 : Tibial measures 3", 
											"<ol style=\"counter-reset:3\"><li>Indicate the <strong>P</strong> point as the contact point between the femoral condyle and the PE insert<li>A line <strong>p</strong> parallel to <strong>TmT'm</strong> passing through this <strong>P</strong> point is automatically drawn by the program. Mark off as the <strong>Tp</strong> point the intersection of this <strong>p</strong> line and the perpendicular to this line which intersects <strong>Tm</strong></ol>",
											"img/PIAM_BBL_Images/slide26.png",
											"ff0000");
		this.stepsInfos[6] = new APStepInfo(this.calculateResults, 6, "Step 4/4 : Results", "", "img/PIAM_BBL_Images/slide13.png", "ff0000");

	},
	initializeProgram: function(){
		var task0 = this.taskManager.createTask("task1", jQuery.proxy(this.patellarMeasures, this));
		var task1 = this.taskManager.createTask("task2", jQuery.proxy(this.femoralMeasures, this));
		var task2 = this.taskManager.createTask("task3", jQuery.proxy(this.femoralMeasuresContd, this));
		var task3 = this.taskManager.createTask("task4", jQuery.proxy(this.calculateResults, this));
		var task4 = this.taskManager.createTask("task5", jQuery.proxy(this.showResults, this));
		task1.addPrereq(task0);
		task2.addPrereq(task1);
		task3.addPrereq(task2);
		task4.addPrereq(task3);
	
		this.initUI();
		this.taskManager.start();
	},
	femoralMeasuresContd: function(task, taskData){
		
		var taskManager = new TaskManager("femAndTibialAnglesContd", this.data);
		
		var task1 = taskManager.createTaskWithArgs("subtask1",
											jQuery.proxy(this.getDrawnPointsPos, this),
											jQuery.proxy(function(task, taskData){
												taskData["Tm"] = taskData["T"];
												taskData["T'm"] = taskData["output"]["pointPosition1"];
												taskData["TmT'm_equation"] = get_line_equation(taskData["Tm"], taskData["T'm"]);
												
												//this.drawDotLabel1P("Tm", a_taskData["Tm"]);
												//this.drawDotLabel1P("T'm", a_taskData["T'm"]);
												this.initTask();
											}, this), 1);
											
		var task2 = taskManager.createTaskWithArgs("subtask2", 
											jQuery.proxy(this.getDrawnPointsPos, this),
											jQuery.proxy(function(task, taskData){
												taskData["P"] = taskData["output"]["pointPosition1"];
												var eq = taskData["TmT'm_equation"];
												eq = new line_equation(eq.slope, taskData["P"]);
												var surfaceDim = PICTIN.surface.getDimensions();
												this.drawLine(	surfaceDim.width*0.05,
																eq.getY(surfaceDim.width*0.05),
																surfaceDim.width*0.95,
																eq.getY(surfaceDim.width*0.95));
																
												var closestPoint = get_segment_point_closest_to_point(eq, taskData["Tm"]);
												var eq2 = get_line_equation(closestPoint, taskData["Tm"]);				
												var intersection = getIntersectionPoint_2LineEquations(eq, eq2);
												taskData["Tp"] = intersection;
												this.drawDot1P(intersection);
												this.drawDotLabel1P("Tp", intersection);
												this.drawLine2P(taskData["Tm"], {x: eq2.getX(closestPoint.y-10), y: closestPoint.y-10});
												//this.drawDotLabel1P("P", a_taskData["P"]);
											}, this), 1);
											
		/*var task3 = taskManager.createTaskWithArgs("subtask3",
											jQuery.proxy(this.getDrawnPointsPos, this),
											jQuery.proxy(function(task, taskData){
												taskData["Tp"] = taskData["output"]["pointPosition1"];
												//this.drawDotLabel1P("T'", a_taskData["Tp"]);
											}, this), 1);*/
											
											
		task2.addPrereq(task1);
		//task3.addPrereq(task2);
											
		taskManager.start();
		
		jQuery(document).bind(taskManager.allTasksFinishedEvent, function(e){
			jQuery(document).trigger(task.eventFinished, [task]);
			jQuery(document).unbind(taskManager.allTasksFinishedEvent, arguments.callee);
		});
	},
	calculateResults: function(task, taskData){
		var baseUnit = 10;
		var hLength = getSegmentLength(getSegment2P(taskData["P"], taskData["B"]));
		var FF3Length = getSegmentLength(getSegment2P(taskData["F"], taskData["F3"]));
		var LLength = getSegmentLength(getSegment2P(taskData["F3"], taskData["F3_F1F2_closestPoint"]));
		var EDLength = getSegmentLength(getSegment2P(taskData["E"], taskData["D"]));
		
		taskData["results"]["hLength"] 	= new AP.resultType("hLength", 1, "Patellar high \"h\" : PB", "u", "", baseUnit);
		taskData["results"]["AT'/AP"]	= new AP.resultType("AT'/AP", 2, "preop BBL index (AT'/AP)", "Absolute value", "",
															(getSegmentLength(getSegment2P(taskData["A"], taskData["T'"]))/getSegmentLength(getSegment2P(taskData["A"], taskData["P"]))).numberFormat("0.00"));
		taskData["results"]["ATm/AP"] 	= new AP.resultType("AT/AP", 3, "ATm/AP index", "Absolute value", "",
														  	(getSegmentLength(getSegment2P(taskData["A"], taskData["Tm"]))/getSegmentLength(getSegment2P(taskData["A"], taskData["P"]))).numberFormat("0.00"));
		taskData["results"]["ATp/AP"] 	= new AP.resultType("AT/AP", 4, "ATp/AP index", "Absolute value", "",
														  	(getSegmentLength(getSegment2P(taskData["A"], taskData["Tp"]))/getSegmentLength(getSegment2P(taskData["A"], taskData["P"]))).numberFormat("0.00"));
		taskData["results"]["FF3"] 		= new AP.resultType("FF3", 5, "Total condylar width (F-F3): K", "u", "",
															(FF3Length/hLength*baseUnit).numberFormat("0.00"));
		taskData["results"]["K/h"]		= new AP.resultType("K/h", 6, "K/h Ratio", "Ansolute value", "",
															(FF3Length/hLength).numberFormat("0.00"));
		taskData["results"]["L"]		= new AP.resultType("L", 7, "Belleman's Posterior offset : L", "u", "",
															(LLength/hLength*baseUnit).numberFormat("0.00"));
		taskData["results"]["K/L"]		= new AP.resultType("K/L", 8, "K/L Ratio", "Absolute value", "",
															(FF3Length/LLength).numberFormat("0.00"));
		taskData["results"]["ED"]		= new AP.resultType("ED", 9, "Blum value (ED)", "u", "",
															(EDLength/hLength*baseUnit).numberFormat("0.00"));
		taskData["results"]["C1C2^TmT'm"] = new AP.resultType("C1C2^TmT'm", 10, "Tibial post slope (C1C2^TmT'm)", "Absolute value", "",
															Math.round(toDegrees(getAngle_2Seg(getSegment2P(taskData["T'm"], taskData["Tm"]), getSegment2P(taskData["C1"], taskData["C2"])) - Math.PI/2)));
		this.initTask();
		jQuery(document).trigger(task.eventFinished, [task]);
	}
})