
var APBase = base2.Base.extend({
	constructor: function(){
		this.programName;
		this.stepsInfos = new Array();
		this.labelID;
		this.dotArray = new Array();
		this.resultRowID;
		this.taskCounter = 0;
		this.resultCounter = 0;
		this.stepColor = new Array();
		this.stepNumber;
		this.data = new Array();
		this.data["results"] = new Array();
		this.data["output"] = new Array(); //this is where event handlers will deliver their output
		this.data["args"] = new Array();
		this.taskManager = new TaskManager("APBase");
		this.taskManager.taskData = this.data;
		this.numberOfSteps;
		var me = this;
		
		PICTIN.automatic_programs_tool.registerRecordStateFunc(this.taskManager.recordState);
		PICTIN.automatic_programs_tool.registerRollbackFunc(this.taskManager.rollback);
	},
	initTask: function(){

	},
	onProgramFinishedHandler: function(func){
		jQuery.bind(this.taskManager.allTasksFinishedEvent, jQuery.proxy(function(){
			this.showResults();
		}, this));
	},
	stop: function(){
		this.taskCounter = 0;
	},
	showResults: function(task, taskData){
		var resultsBuffer = new Array();
		jQuery(document).bind("form_validated.AP", function(e){
			PIAM.update_piam(this.programName);
			PICTIN.automatic_programs_tool.stop();
			jQuery(document).unbind("form_validated.AP");
			jQuery(document).trigger(task.eventFinished, [task]);
		});
		//PMLAT_initTask();
		//show results
		//jQuery("#step_image").empty();
		jQuery("#step_desc").empty();
		
		var data = {};
		data.resultset = new Array();
		for(var propertyName in taskData["results"]){
			if(typeof taskData["results"][propertyName].header != "undefined"){
				data.resultset.push({	"header" : [{"header" : taskData["results"][propertyName].header}],
										"results" : false});
			}
			else{
				if(taskData["results"][propertyName].show == true){
					data.resultset.push({	"header": false,
										"results" : taskData["results"][propertyName]});
				}
				//adding result to array used to send data to OW
				resultsBuffer[propertyName] = taskData["results"][propertyName].value;
			}
			
			
		}
		
		var tpl = jQuery("#APResultTpl").html();
		var html = Mustache.to_html(tpl, data);
		
		jQuery("#tool_info > .results").append(html);
		
		PIAMRESULTS[this.programName] = resultsBuffer;
		jQuery("#tool_info").dialog({	buttons: {
														"Send to OW": function(){
															//PICTIN.automatic_programs_tool.stop();
																//console.log("wut");
																jQuery(document).trigger("form_validated");
															}
										}});
		
		jQuery(document).trigger(task.eventFinished, [task]);

	},
	getDrawnCircle: function(a_task, a_taskData){
		jQuery(document).bind("circle_drawn.ATOOL", jQuery.proxy(function(e, circle){
		
			var center = {};
			
			if(circle.getTransform() != null){
				center = dojox.gfx.matrix.multiplyPoint(circle.getTransform(), circle.getShape().cx, circle.getShape().cy);
			}
			else{
				center.x = circle.getShape().cx;
				center.y = circle.getShape().cy;
			}
			
			a_taskData["output"]["transformedCenter"] = PICTIN.apply_inverse_surface_transform(center);
			a_taskData["output"]["radius"] = circle.getShape().r;
			
			PICTIN.automatic_programs_tool.addShape(circle);
			PICTIN.tool_circle.stop();
			jQuery(document).trigger(a_task.eventFinished, [a_task]);
			jQuery(document).unbind("circle_drawn.ATOOL", this);
		}, this));
		
		PICTIN.tool_circle.drawChildShapes = false;
		PICTIN.automatic_programs_tool.activateTool(PICTIN.tool_circle);
	},
	getDrawnCircleCenter: function(task, taskData){
		var dotCounter = 0;
		var dotPos = new Array();
		
		jQuery(document).bind("DOT.drawn.ATOOL", jQuery.proxy(function(e, position, dot){
			this.dotArray.push(dot);
			PICTIN.automatic_programs_tool.addShape(dot);
				
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
				}).setStroke({color: "#" + PICTIN.current_color});
				
				
				PICTIN.automatic_programs_tool.addShape(circle1);

				taskData["output"]["transformedCenter"] = PICTIN.apply_inverse_surface_transform(center);
				
				PICTIN.tool_dot.stop();
				jQuery(document).trigger(task.eventFinished, [task]);
				jQuery(document).unbind("DOT.drawn.ATOOL", arguments.callee);
			}
		}, this));
		
		PICTIN.automatic_programs_tool.activateTool(PICTIN.tool_dot);

	},
	getDrawnPointPos: function(a_task, a_taskData){
		jQuery(document).bind("DOT.drawn.ATOOL", jQuery.proxy(function(e, position, dot){
			////console.log("wut");
			this.dotArray.push(dot);
			PICTIN.automatic_programs_tool.addShape(dot);
			a_taskData["output"]["pointPosition"] = PICTIN.apply_inverse_surface_transform(position);
			////console.log("counter : " + me.counter);
		 	PICTIN.tool_dot.stop();
			jQuery(document).unbind("DOT.drawn.ATOOL");
			jQuery(document).trigger(a_task.eventFinished, [a_task]);
		}, this));
	
		PICTIN.automatic_programs_tool.activateTool(PICTIN.tool_dot);
	},
	getDrawnPointsPos: function(a_task, a_taskData, numPoints){
		var pointCounter = 1;
		
		jQuery(document).bind("DOT.drawn.ATOOL", jQuery.proxy(function(e, position, dot){
			this.dotArray.push(dot);
			PICTIN.automatic_programs_tool.addShape(dot);
			a_taskData["output"]["pointPosition" + pointCounter] = PICTIN.apply_inverse_surface_transform(position);
			////console.log("counter : " + me.counter);
			if(pointCounter == numPoints){
				//jQuery(document).listHandlers(a_task.eventFinished, console);
		 		PICTIN.tool_dot.stop();
				jQuery(document).unbind("DOT.drawn.ATOOL");
				jQuery(document).trigger(a_task.eventFinished, [a_task]);
			}
			pointCounter++;
		}, this));
		
		PICTIN.automatic_programs_tool.activateTool(PICTIN.tool_dot);
	},
	drawLine: function(x1, y1, x2, y2){
		var line = this.drawLine2P({x: x1, y: y1}, {x: x2, y: y2});//PICTIN.surface.createLine({x1 : x1, y1 : y1, x2 : x2, y2 : y2}).setStroke({color : "#" + PICTIN.current_color});
		PICTIN.automatic_programs_tool.addShape(line);
		
		return line;
	},
	drawLine2P: function(p1, p2){
        p1 = PICTIN.apply_surface_transform(p1);
        p2 = PICTIN.apply_surface_transform(p2);

		var line = PICTIN.surface.createLine({x1 : p1.x, y1 : p1.y, x2 : p2.x, y2 : p2.y}).setStroke({color : "#" + PICTIN.current_color});
		PICTIN.automatic_programs_tool.addShape(line);
		return line;
	},
	drawDot: function(x, y){
        var p = PICTIN.apply_surface_transform({x: x, y: y});
		var dot = PICTIN.surface.createCircle({cx: p.x, cy: p.y, r: 1}).setStroke({color : "#" + PICTIN.current_color, width: PICTIN.current_linethickness, 'shape-rendering': 'crispEdges'}).setFill("#"+PICTIN.current_color);
		PICTIN.automatic_programs_tool.addShape(dot);
		
		return dot;
	},
	drawDot1P: function(p){
		return this.drawDot(p.x, p.y);
	},
	drawDotLabel1P: function(text, p){
        p = PICTIN.apply_surface_transform(p);
		var textObj = PICTIN.surface.createText({	x: p.x + 5,
													y: p.y - 5,
													text: text}).setStroke({color: "#" + PICTIN.current_color});
		PICTIN.automatic_programs_tool.addShape(textObj);
		
		return textObj;
	},
	drawSegmentLabel1P: function(segment, p){
		
	},
	trigger: function(task){
		jQuery(document).trigger(task.eventFinished, [task]);
	}
});