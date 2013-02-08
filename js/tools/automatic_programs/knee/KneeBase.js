var KneeBase = APBase.extend({
	constructor: function(){
		this.base();
	},
	initUI: function(){
		var windowWidth = 500;
		jQuery("#automatic_tools_selection").hide();
		jQuery("#automatic_tools_selection").dialog("close");
		
		//clear tool info
		jQuery("#tool_info > .step_list").empty();
		jQuery("#tool_info > .results").empty();
		jQuery("#step_image").empty();
		jQuery("#step_desc").empty();
		
		jQuery("#tool_info").show();
		
		jQuery("#tool_info").dialog({dialogClass: 'tool_info',
									width: windowWidth,
									position: ["right", jQuery("#toolbar-holder").height()],
									title: this.programName,
									close: jQuery.proxy(this.stop, this),
									buttons: {
													Validate: function(){
														//PICTIN.automatic_programs_tool.stop();
														jQuery(document).trigger("form_validated");
													}
									}}, "open");
		//END initUI

	},
	initTask: function(){
		this.base();
		for(var i in this.dotArray){
			//dot.setStroke({color: "#00ff00"});
			this.dotArray[i].setStroke({color: "#00ff00"});
		}
		
		if(this.taskCounter == 0){
			jQuery("#tool_info").dialog({title: this.stepsInfos[this.taskCounter].stepTitle});
		}
		else if(this.taskCounter > 0){
			jQuery("#" + this.stepsInfos[this.taskCounter].stepID + " > span").toggleClass("AT_stepCurrent AT_stepFinished");
			
			//adding images and desc
			jQuery("#tool_info").dialog({title: this.stepsInfos[this.taskCounter].stepTitle});
			jQuery("#step_image").empty().append('<img class="centered" style = "width:135px;height:500px;" src="' + this.stepsInfos[this.taskCounter].stepImg + '"//>');
			jQuery("#step_desc").empty().append('<p class="image_desc">' + this.stepsInfos[this.taskCounter].stepDesc + '</p>');
		}
		
		PICTIN.setColor(this.stepsInfos[this.taskCounter].stepColor, false);
		
		//jQuery("#" + this.stepsInfos[this.taskCounter].stepID + " > span").toggleClass("AT_stepTodo AT_stepCurrent");

		PICTIN.automatic_programs_tool.refreshWindowPosition();
		this.taskCounter++;
	}
})