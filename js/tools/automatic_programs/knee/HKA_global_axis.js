var APkneeHKAGlobalAxisPreop = KneeBase.extend({
	constructor: function(){
		this.base();
		this.programName = "KNEE: HKA global axis (Preop)";
		this.stepsInfos[0] = new APStepInfo(this.initialFormStep, 0, "", "", "", "");
		this.stepsInfos[1] = new APStepInfo(this.hkaAngleStep, 1, "Step 1/3 : Plotting off the HKA angle", "<ol><li>Indicate 3 points as <strong>C1</strong>, <strong>C2</strong>, and <strong>C3</strong> at periphery of the femoral head<li>Mark off the center of the knee<li>Mark off the center of ankle joint</ol>", "img/PIAM_BBL_Images/slide05.png" , "2F87FA");
		this.stepsInfos[2] = new APStepInfo(this.hkaAngleStep, 2, "Step 2/3 : Plotting off the HKS angle", "<ol><li>Indicate 4 points as <strong>S1</strong>, <strong>S2</strong>, <strong>S3</strong>, and <strong>S4</strong> at the cortical contour of the femoral shaft. This allows for having a line <strong>S'</strong> joining the middle of the two segments <strong>S1S2</strong> and <strong>S3S4</strong> = the <strong>KS</strong> line is parallel to <strong>S'</strong> passing through <strong>K</strong></ol>", "img/PIAM_BBL_Images/slide06.png", "FF6633");
		this.stepsInfos[3] = new APStepInfo(this.calculateResults, 2, "Step 3/3 : Results", "", "img/PIAM_BBL_Images/slide06.png", "2164FF");
	},
	initializeProgram: function(){
		var task0 = this.taskManager.createTask("task1", jQuery.proxy(this.initialFormStep, this));
		var task1 = this.taskManager.createTask("task2", jQuery.proxy(this.hkaAngleStep, this));
		var task2 = this.taskManager.createTask("task3", jQuery.proxy(this.calculateResults, this));
		var task3 = this.taskManager.createTask("task5", jQuery.proxy(this.showResults, this));
		task1.addPrereq(task0);
		task2.addPrereq(task1);
		task3.addPrereq(task2);
		this.initUI();
		this.taskManager.start();
	},
	initialFormStep: function(task, taskData){
		this.initTask();
		var data = {
				row : [
				{	id : 1, label : "Please specify the studied side :",
					choices : [
					{	name : "side", value : "left", event : "PIAM_side_chosen", choice : "left" },
					{	name : "side", value : "right", event : "PIAM_side_chosen", choice : "right" }
					]}
				]
			};
		var tpl = jQuery("#APInitForm").html();
		var html = Mustache.to_html(tpl, data);
		
		AP.generateInfoForm(html, task, taskData);
	},
	hkaAngleStep: function(a_task, a_taskData){
		this.initTask();
		var taskManager = new TaskManager("hkaAngleStep");
		taskManager.taskData = a_taskData;
		
		//task followed by the handler of the completion of this task
		var task1 = taskManager.createTask("subtask1", 
											jQuery.proxy(this.getDrawnCircleCenter, this),
											jQuery.proxy(function(task, taskData){
												a_taskData["H"] = a_taskData["output"]["transformedCenter"];
												this.drawDotLabel1P("H", a_taskData["H"]);
											}, this));
		
		//--
		a_taskData["args"]["numPoints"] = 2
		var task2 = taskManager.createTaskWithArgs("subtask2", 
													jQuery.proxy(this.getDrawnPointsPos, this), 
													jQuery.proxy(function(task, taskData){
														taskData["K"] = a_taskData["output"]["pointPosition1"];
														taskData["A"] = a_taskData["output"]["pointPosition2"];
														//this.drawDotLabel1P("K", a_taskData["K"]);
														//this.drawDotLabel1P("A", a_taskData["A"]);
													}, this), 2);
		
		task2.addPrereq(task1);

		
		//--
		/*var task3 = taskManager.createTask("subtask3", jQuery.proxy(this.getDrawnPointPos, this));
		task3.addPrereq(task2);
		jQuery(document).bind(task3.eventFinished, function(e){
			a_taskData["A"] = a_taskData["output"]["pointPosition"];
		});*/
		
		//--
		var task3 = taskManager.createTask("subtask3", jQuery.proxy(function(task, taskData){
			var H = a_taskData["H"];
			var K = a_taskData["K"];
			var A = a_taskData["A"];
			
			this.drawLine(H.x, H.y, K.x, K.y);
			this.drawLine(K.x, K.y, A.x, A.y);
			
			this.initTask();
			jQuery(document).trigger(task.eventFinished, [task]);
		}, this));
		task3.addPrereq(task2);
		
		//--
		var task4 = taskManager.createTaskWithArgs("subtask4", 
											jQuery.proxy(this.getDrawnPointsPos, this),
											jQuery.proxy(function(task, taskData){
												var p1 = taskData["output"]["pointPosition1"];
												var p2 = taskData["output"]["pointPosition2"];
												var p3 = taskData["output"]["pointPosition3"];
												var p4 = taskData["output"]["pointPosition4"];
												var midp1p2 = getMidPoint(p1.x, p1.y, p2.x, p2.y);
												var midp3p4 = getMidPoint(p3.x, p3.y, p4.x, p4.y);
												this.drawDot(midp1p2.x, midp1p2.y);
												this.drawDot(midp3p4.x, midp3p4.y);
												var slope = getSlope2P(midp1p2, midp3p4);
												var sEquation = new line_equation(slope, taskData["K"]);
												this.drawLine(sEquation.getX(a_taskData["H"].y), taskData["H"].y, taskData["K"].x, taskData["K"].y);
												taskData["S"] = {x: sEquation.getX(taskData["H"].y), y: taskData["H"].y};
											}, this), 4);
		task4.addPrereq(task3);

		
		taskManager.start();
		
		
		jQuery(document).bind("hkaAngleStep_finished", function(e){
			jQuery(document).trigger(a_task.eventFinished, [a_task]);
			jQuery(document).unbind("hkaAngleStep_finished", arguments.callee);
		});
	},
	calculateResults: function(task, taskData){
		this.initTask();
		var angle = Math.round(180 - toDegrees(getAngle_2Seg(getSegment2P(taskData["H"], taskData["K"]), getSegment2P(taskData["K"], taskData["A"]))));
		angle = (taskData["side"] == "right")?360-angle:angle;
		taskData["results"]["side"] = new AP.resultType("side", 0, "", "", "", taskData["side"], false);
		taskData["results"]["HKA"] = new AP.resultType("HKA", 1, "HKA", "&deg;", "", angle, true);
		taskData["results"]["HKS"] = new AP.resultType("HKS", 2, "HKS", "&deg;", "", Math.round(toDegrees(calculate_angle(taskData["H"], taskData["K"], taskData["S"]))), true);
		jQuery(document).trigger(task.eventFinished, [task]);
	}
});

var HKA_global_axis_postop = APkneeHKAGlobalAxisPreop.extend({
	constructor: function(){
		this.base();
		this.programName = "KNEE: HKA global axis (Postop)";
		this.stepsInfos[0] = new APStepInfo(this.initialFormStep, 0, "", "", "", "ff0000");
		this.stepsInfos[1] = new APStepInfo(this.hkaAngleStep, 1, "Step 1/4 : Plotting off the HKA angle", "<ol><li>Indicate 3 points as <strong>C1</strong>, <strong>C2</strong>, and <strong>C3</strong> at periphery of the femoral head<li>Mark off the center of the knee<li>Mark off the center of ankle joint</ol>", "img/PIAM_BBL_Images/slide16.png" , "2F87FA");
		this.stepsInfos[2] = new APStepInfo(this.hkaAngleStep, 2, "Step 2/4 : Plotting off the HKS angle", "<ol><li>Indicate 4 points as <strong>S1</strong>, <strong>S2</strong>, <strong>S3</strong>, and <strong>S4</strong> at the cortical contour of the femoral shaft. This allows for having a line <strong>S'</strong> joining the middle of the two segments <strong>S1S2</strong> and <strong>S3S4</strong> = the <strong>KS</strong> line is parallel to <strong>S'</strong> passing through <strong>K</strong></ol>", "img/PIAM_BBL_Images/slide06.png", "FF6633");
		this.stepsInfos[3] = new APStepInfo(this.femAndTibialAngles, 3, "Step 3/4 : Fem ^F and Tibial ^T Angles", "<ol><li>Mark off 2 points as <strong>l1</strong> (medial) and <strong>l2</strong> (lateral) upon the contour of femoral condyles at contact with PE insert, which allows for defining the joint line <strong>Int</strong></ol>", "img/PIAM_BBL_Images/slide18.png", "2164FF");
		this.stepsInfos[4] = new APStepInfo(this.calculateResults, 4, "Step 4/4 : Results", "", "img/PIAM_BBL_Images/slide18.png", "ff0000");
	},
	initializeProgram: function(){
		var task0 = this.taskManager.createTask("task1", jQuery.proxy(this.initialFormStep, this));
		var task1 = this.taskManager.createTask("task2", jQuery.proxy(this.hkaAngleStep, this));
		var task2 = this.taskManager.createTask("task3", jQuery.proxy(this.femAndTibialAngles, this));
		var task3 = this.taskManager.createTask("task4", jQuery.proxy(this.calculateResults, this));
		var task4 = this.taskManager.createTask("task4", jQuery.proxy(this.calculateResultsContd, this));
		var task5 = this.taskManager.createTask("task5", jQuery.proxy(this.showResults, this));
		task1.addPrereq(task0);
		task2.addPrereq(task1);
		task3.addPrereq(task2);
		task4.addPrereq(task3);
		task5.addPrereq(task4);
		this.initUI();
		this.taskManager.start();
	},
	femAndTibialAngles: function(task, taskData){
		this.initTask();
		var taskManager = new TaskManager("femAndTibialAngles", this.data);
		
		var task1 = taskManager.createTaskWithArgs("subtask1", 
											jQuery.proxy(this.getDrawnPointsPos, this),
											jQuery.proxy(function(task, taskData){
												taskData["L1"] = taskData["output"]["pointPosition1"];
												taskData["L2"] = taskData["output"]["pointPosition2"];
												taskData["int"] = this.drawLine2P(taskData["L1"], taskData["L2"]);
												var intSlope = getSlope2P(taskData["L1"], taskData["L2"]);
												var parallelInt_equation = new line_equation(intSlope, taskData["K"]);
												taskData["pInt_equation"] = parallelInt_equation;
											}, this), 2);
											
		taskManager.start();
		
		jQuery(document).bind("femAndTibialAngles_finished", function(e){
			jQuery(document).trigger(task.eventFinished, [task]);
			jQuery(document).unbind("femAndTibialAngles_finished", arguments.callee);
		});
	},
	calculateResultsContd: function(task, taskData){
		var point1 = (taskData["side"] == "right")?taskData["L1"]:taskData["L1"];
		var point2 = (taskData["side"] == "right")?taskData["L2"]:taskData["L2"];
		
		taskData["results"]["^F"] = new AP.resultType("^F", 3, "^F", "&deg;", "", Math.round(toDegrees(calculate_angle(taskData["S"], taskData["K"], {x: point1.x, y: taskData["pInt_equation"].getY(point1.x)}))), true);
		taskData["results"]["^T"] = new AP.resultType("^T", 4, "^T", "&deg;", "", Math.round(toDegrees(calculate_angle(taskData["A"], taskData["K"], {x: point1.x, y: taskData["pInt_equation"].getY(point1.x)}))), true);
		

		jQuery(document).trigger(task.eventFinished, [task]);
	}
})
