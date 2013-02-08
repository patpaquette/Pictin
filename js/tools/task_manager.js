// JavaScript Document
//task manager
TaskManager.uniqueID = 0;
function TaskManager(a_label, a_taskData){
	this.label = a_label;
	this.taskArray = new Array();
	this.indexToProcess = -1;
	this.eventFinished = this.label + ".TasksFinished";
	this.allTasksFinishedEvent = this.label + this.uniqueID + "_finished";
	this.taskData = new Array();
	this.taskBuffer = null;
	this.uniqueID = TaskManager.uniqueID;
	TaskManager.uniqueID++;
	
	if(a_taskData != null && typeof a_taskData != 'undefined'){
		this.taskData = a_taskData;
	}
	//public interface
	this.start = function(){
		this.processNextTask();
	}
	
	
	//private interface
	this.processNextTask = function(){
		var index = this.getNextTaskIndex();
		while(index >= 0){
			this.taskArray[index].process(this.taskData);
			index = this.getNextTaskIndex();
		}
	}
	
	this.getNextTaskIndex = function(){
		////console.log("getNextTaskIndex is called.");
		for(var i in this.taskArray){
			if(this.taskArray[i].isReady()){
				return i;
			}
		}
		
		if(this.isDone()){
			jQuery(document).trigger(this.label + "_finished"); //keep for backward compatitibility
			jQuery(document).trigger(this.allTasksFinishedEvent);
		}
		return -1;
	}
	
	this.createTask = function(label, processFunc, onFinishFunc){
		var task = new Task(label, processFunc, this, TaskType.task);
		task.onFinishFunc = onFinishFunc;
		this.taskArray.push(task);
		
		
		return task;
	}
	
	this.createTaskWithArgs = function(label, processFunc, onFinishFunc, args){
		var task = new Task(label, processFunc, this, TaskType.task);
		task.args = args;
		task.onFinishFunc = onFinishFunc;
		this.taskArray.push(task);
		
		return task;
	}
	
	this.isDone = function(){
		for(var i in this.taskArray){
			if(!this.taskArray[i].isDone()){
				return false;
			}
		}
		
		return true;
	}
	
	//event handlers
	taskFinishedHandler = function(e, a_taskManager){
		////console.log("A task from " + a_taskManager.label + " is finished.");
		a_taskManager.processNextTask();
	}
	//events
	jQuery(document).bind(this.eventFinished, taskFinishedHandler);

}


//task
Task.idCounter = 0;
function Task(a_label, a_processFunc, a_parent, a_type){
	//variables
	this.label = a_label;
	this.uniqueID = Task.idCounter++;
	this.prereqTasksArray = new Array();
	this.state = TaskState.ready;
	this.processFunc = a_processFunc;
	this.parentEventFinished = a_parent.eventFinished;
	this.eventFinished = "taskID" + this.uniqueID + "_finished";
	this.parent = a_parent;
	this.subTaskArray = new Array();
	this.type = a_type;
	this.args = null;
	this.onFinishFunc = null;
	
	//interface
	//returns bool
	this.isReady = function(){
		
		if(this.state > TaskState.ready)
		{	
			/*
			if(this.state == TaskState.processing){
				//console.log(this.label + " is processing");
			}
			else if(this.state == TaskState.done){
				//console.log(this.label + " is done");
			}*/
			return false;
		}
		
		for(var i in this.prereqTasksArray){
			if(!this.prereqTasksArray[i].isDone()){
				////console.log(this.label + " is not ready.");
				return false;
			}
		}
		
		////console.log(this.label + " is ready.");
		this.state = TaskState.ready;
		return true;
	}
	
	//returns bool
	this.isDone = function(){
		////console.log("isDone is called");
		if(this.state == TaskState.done){
			////console.log(this.label + " is done.");
			return true;
		}
		////console.log(this.label + " is not done.");
		return false;
	}
	
	//returns void
	this.addPrereq = function(a_task){
		this.prereqTasksArray.push(a_task);
		this.state = TaskState.waiting;
	}
	
	this.process = function(a_taskData){
		////console.log(this.label + " process is called.");
		if(!this.hasSubTasks()){ //if this task is a leaf
			if(this.state == TaskState.ready){
				this.state = TaskState.processing;
				if(this.args != null){
					this.processFunc(this, a_taskData, this.args);
				}
				else{
					this.processFunc(this, a_taskData);
				}
				////console.log(a_taskData.length + " testing");
			}
		}
		else{
			if(this.state == TaskState.ready || this.state == TaskState.processing){
				this.state = TaskState.processing;
				this.processNextSubTask();
			}
			
		}
	}
	
	this.addFinishedEvent = function(eventLabel){
		this.parentEventLabel = eventLabel;
	}
	
	this.createSubTask = function(a_label, a_processFunc){
		task = new Task(a_label, a_processFunc, this, TaskType.subtask);
		index = this.subTaskArray.push(task)-1;
		if(index > 0) task.addPrereq(this.subTaskArray[index-1]);
		return task;
	}
	//END interface
	
	//private interface
	this.processNextSubTask = function(){
		var index = this.getNextSubTaskIndex();
		while(index >= 0){
			this.subTaskArray[index].process(this.taskData);
			index = this.getNextSubTaskIndex();
		}
	}
	
	this.getNextSubTaskIndex = function(){
		////console.log("getNextSubTaskIndex is called.");
		for(var i in this.subTaskArray){
			if(this.subTaskArray[i].isReady()){
				return i;
			}
		}
		
		return -1;
	}
	
	this.hasSubTasks = function(){
		if(this.subTaskArray.length > 0){
			return true;
		}
		else{
			return false;
		}
	}
	
	//event handlers
	var taskFinished = function(e, a_task){
		//console.log(a_task.label + " is finished");
		if(a_task.hasSubTasks()){
			var done = true;
			for(var i in a_task.subTaskArray){
				if(!a_task.subTaskArray[i].isDone()){
					done = false;
				}
			}
			
			if(done){
				////console.log(a_task.label +" is finished.");
				a_task.state=TaskState.done;
				jQuery(document).trigger(a_task.parentEventLabel, [a_task.parent]);
				jQuery(document).unbind(a_task.eventLabel);
			}
			else{
				a_task.state=TaskState.processing;
				a_task.processNextSubTask();
			}
	
		}
		else{
			////console.log(a_task.label +" is finished.");
			a_task.state = TaskState.done;
			if(a_task.onFinishFunc != null && typeof a_task.onFinishFunc != "undefined"){
				a_task.onFinishFunc(a_task, a_task.parent.taskData);
			}
			jQuery(document).trigger(a_task.parentEventFinished, [a_task.parent]);
			jQuery(document).unbind(a_task.eventFinished, arguments.callee);
			//jQuery(document).listHandlers(a_task.eventFinished, console);
		}
		
	}
	
	//events
	jQuery(document).bind(this.eventFinished, taskFinished);
}

TaskState = function(){};
TaskState = {waiting:0, ready:1, processing:2, done:3};

TaskType = function(){};
TaskType = {task:0, subtask:1};


