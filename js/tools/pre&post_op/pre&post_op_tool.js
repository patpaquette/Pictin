// JavaScript Document
var ATOOL = {};
var PIAMRESULTS = new Array();
var PIAM = [];
ATOOL.shapes = new Array();

PICTIN.automatic_programs_tool = new function(){
	this.taskManager;
	this.currentProgram;
	ATOOL.taskLabelList = new Array();
	ATOOL.resultLabelList = new Array();
	ATOOL.descDataList = new Array();
	this.activatedTool;
	var windowWidth = 500;
	var me = this;
	this.recordStateFuncs = new Array();
	this.rollbackFuncs = new Array();
	this.activatedTool = null;
	
	
	this.activate = function(){
		//PICTIN.rollback_manager.registerRecordStateFunc(this.recordState);
		//PICTIN.rollback_manager.registerRollbackFunc(this.rollback);
		jQuery("#undo").attr('disabled', 'disabled').addClass('ui-state-disabled');
		jQuery("#redo").attr('disabled', 'disabled').addClass('ui-state-disabled');
		dijit.byId("undo").setAttribute('disabled', true);
		dijit.byId("redo").setAttribute('disabled', true);
		this.chooseProgram();
		return this;
	}
	this.stop = function(){
		for(var i in ATOOL.shapes){
			PICTIN.shape_manager.delete_shape(ATOOL.shapes[i].getNode());
		}
		
		jQuery(document).unbind("form_validated");
		jQuery(document).unbind(".ATOOL");
		jQuery("#automatic_tools_selection").hide();
		jQuery("#automatic_tools_selection").dialog("close");
		jQuery("#tool_info").hide();
		jQuery("#tool_info").dialog("close");
		jQuery("#undo").removeAttr('disabled').removeClass('ui-state-disabled');
		jQuery("#redo").removeAttr('disabled').removeClass('ui-state-disabled');
		dijit.byId("undo").setAttribute('disabled', false);
		dijit.byId("redo").setAttribute('disabled', false);
		PICTIN.calibrate_tool.resetCalibration();
		if(this.activatedTool != null) this.activatedTool.stop();
		this.recordStateFuncs = new Array();
		this.rollbackFuncs = new Array();
	}
	
	this.addShape = function(shape){
		ATOOL.shapes.push(shape);
		PICTIN.shape_manager.add_shape(shape);
		//PICTIN.rollback_manager.recordState();
	}
	
	
	//activates a secondary tool
	this.activateTool = function(tool){
		if(this.activatedTool != null) this.activatedTool.stop();
		this.activatedTool = tool;
		tool.activate();
	}
	
	//undo/redo
	this.registerRecordStateFunc = function(func){
		//console.log("PIAM : recordState function registered");
		me.recordStateFuncs.push(func);
	}
	
	this.registerRollbackFunc = function(func){
		//console.log("PIAM : rollback function registered");
		me.rollbackFuncs.push(func);
	}
	
	this.recordState = function(state){
		for(var i in me.recordStateFuncs){
			me.recordStateFuncs[i](state);
		}
	}
	
	this.rollback = function(state){
		DEBUG_PAT.output_obj(me.rollbackFuncs, "rollbackFuncs", true);
		for(var i in me.rollbackFuncs){
			me.rollbackFuncs[i](state);
		}
	}
	
	//private
	this.initPreop = function(){
		////console.log("initating preop");
		me.taskManager = new TaskManager("Preop");
		me.taskManager.taskData["results"] = new Array();
		me.registerRecordStateFunc(me.taskManager.recordState);
		me.registerRollbackFunc(me.taskManager.rollback);
		var task1 = me.taskManager.createTask("preop_task1", preop_task1);
		var task2 = me.taskManager.createTask("preop_task2", preop_task2);
		var task3 = me.taskManager.createTask("preop_task3", preop_task3);
		var task4 = me.taskManager.createTask("preop_task4", preop_task4);
		var task5 = me.taskManager.createTask("preop_task5", preop_task5);
		var task6 = me.taskManager.createTask("preop_task6", preop_task6);
		var task7 = me.taskManager.createTask("preop_task7", preop_task7);
		
		task2.addPrereq(task1);
		task3.addPrereq(task2);
		task4.addPrereq(task3);
		task5.addPrereq(task4);
		task6.addPrereq(task5);
		task7.addPrereq(task6);
		
		ATOOL.taskLabelList = new Array();
		ATOOL.taskLabelList.push({id: "step0", label: "Step 0: Calibration"});
		ATOOL.taskLabelList.push({id: "step1", label: "Step 1: PRL (Pelvic Ref Line) + BRL (Bottom Ref Line)"});
		ATOOL.taskLabelList.push({id: "step2", label: "Step 2: HC (Head Center) + HP (Head Protrusio)"});
		ATOOL.taskLabelList.push({id: "step3", label: "Step 3: LCA (Lateral Coverage Angle)"});
		ATOOL.taskLabelList.push({id: "step4", label: "Step 4: FA (Femoral Axis) + FO (Femoral Offset)"});
		ATOOL.taskLabelList.push({id: "step5", label: "Step 5: VVA (Varus/Valgus Angle"});
		ATOOL.taskLabelList.push({id: "step6", label: "Step 6: HCH (Head Center Height) + GCH (Greater Troch height/Head) + LCH (Lesser Troch height/ Head) + GPH (Greater Troch height/ Pelvic Line) + LPH (Lesser Troch height/ Pelvic Line)"});
		
		ATOOL.resultLabelList = new Array();
		ATOOL.resultLabelList.push({id: "HP", label: "HP (Head Protrusio) in mm :"});
		ATOOL.resultLabelList.push({id: "HD", label: "HD (Head Diameter) in mm:"});
		ATOOL.resultLabelList.push({id: "LCA", label: "LCA (Lateral Coverage Angle) in °:"});
		ATOOL.resultLabelList.push({id: "FO", label: "FO (Femoral Offset) in mm:"});
		ATOOL.resultLabelList.push({id: "GO", label: "GO (Global Offset) in mm:"});
		ATOOL.resultLabelList.push({id: "VVA", label: "VVA (Neck Angle; Varus-Valgus) in °:"});
		ATOOL.resultLabelList.push({id: "HCH", label: "HCH (Head Center Height) in mm:"});
		ATOOL.resultLabelList.push({id: "GCH", label: "GCH (GT Height/Head) in mm:"});
		ATOOL.resultLabelList.push({id: "LCH", label: "LCH (LT Height/Head) in mm:"});
		ATOOL.resultLabelList.push({id: "GPH", label: "GPH (GT Height/Pelvis) in mm:"});
		ATOOL.resultLabelList.push({id: "LPH", label: "LPH (LT Height/Pelvis) in mm:"});
		
		ATOOL.descDataList = new Array();
		ATOOL.descDataList.push({	img: "img/pictin-piam-preop-images/preop_01.jpg", 
									text: 'Step 1: click on U1 & U2 (radiologic "U" line) as to get the pelvic reference line (PRL) + Bottom reference line (BRL)'});
		ATOOL.descDataList.push({	img: "img/pictin-piam-preop-images/preop_02.jpg", 
									text: 'Step 2: click on 3 points at the circumference of the femoral head (if not applicable, use the contralateral head) = allows for getting the Center of Rotation of the Hip (RHC) + "head protrusio"'});
		ATOOL.descDataList.push({	img: "img/pictin-piam-preop-images/preop_03.jpg", 
									text: 'Step 3: click on the point at lateral edge of the pelvec rim'});
		ATOOL.descDataList.push({	img: "img/pictin-piam-preop-images/preop_04.jpg", 
									text: 'Step 4: click at the lateral then medial edges of the medullary canal, at approximately 3cm below the lesser trochanter, then at the lateral & medial edge of the canal, as below as possible according to the film'});
		ATOOL.descDataList.push({	img: "img/pictin-piam-preop-images/preop_05.jpg", 
									text: 'Step 5: click at the lateral and medial edges (N1 & N2) of the femoral neck, as to create a triangle as close as possible of an isosceles triangle of which the vertex is the center of the head HC'});
		ATOOL.descDataList.push({	img: "img/pictin-piam-preop-images/preop_06.jpg", 
									text: 'Step 6: click at the upper part of the Greater Trochanter (T1) then at the upper aspect of the Lesser Trochanter (T2)'});
		
		me.currentProgram = "OW_PAM_Pelvic PRE op";
		me.initUI(true);
		me.init();
	}
	
	this.initPostop = function(){
		me.taskManager = new TaskManager("Postop");
		me.taskManager.taskData["results"] = new Array();
		me.registerRecordStateFunc(me.taskManager.recordState);
		me.registerRollbackFunc(me.taskManager.rollback);
		var task1 = me.taskManager.createTask("postop_task1", postop_task1);
		var task2 = me.taskManager.createTask("postop_task2", postop_task2);
		var task3 = me.taskManager.createTask("postop_task3", postop_task3);
		var task4 = me.taskManager.createTask("postop_task4", postop_task4);
		var task5 = me.taskManager.createTask("postop_task5", postop_task5);
		var task6 = me.taskManager.createTask("postop_task6", postop_task6);
		
		task2.addPrereq(task1);
		task3.addPrereq(task2);
		task4.addPrereq(task3);
		task5.addPrereq(task4);
		task6.addPrereq(task5);
		
		ATOOL.taskLabelList = new Array();
		ATOOL.taskLabelList.push({id: "step0", label: "Step 0: Calibration"});
		ATOOL.taskLabelList.push({id: "step1", label: "Step 1: PRL (Pelvic Ref Line) + BRL (Bottom Ref Line)"});
		ATOOL.taskLabelList.push({id: "step2", label: "Step 2: HC (Head Center)"});
		ATOOL.taskLabelList.push({id: "step3", label: "Step 3: CC (Cup Center) + CP (Cup Protrusio)"});
		ATOOL.taskLabelList.push({id: "step4", label: "Step 4: CIA (Cup Inclination Angle)"});
		ATOOL.taskLabelList.push({id: "step5", label: "Step 5: FA (Femoral Axis) + FO (Femoral Offset)"});
		ATOOL.taskLabelList.push({id: "step6", label: "Step 6: SA (Stem Axis) + SVV (Stem Varus-Valgus angle)"});
		ATOOL.taskLabelList.push({id: "step7", label: "Step 7: HCH (Head Center Height) + GCH (Greater Troch height/Head) + LCH (Lesser Troch height/ Head) + GPH (Greater Troch height/ Pelvic Line) + LPH (Lesser Troch height/ Pelvic Line)"});
		
		ATOOL.resultLabelList = new Array();
		ATOOL.resultLabelList.push({id: "CP", label: "CP (Cup Protrusio) in mm :"});
		ATOOL.resultLabelList.push({id: "CIA", label: "CIA (Cup Inclination Angle) in °:"});
		ATOOL.resultLabelList.push({id: "FO", label: "FO (Femoral Offset) in mm:"});
		ATOOL.resultLabelList.push({id: "GO", label: "GO (Global Offset) in mm:"});
		ATOOL.resultLabelList.push({id: "SVV", label: "SVV (Stem Varus-Valgus) in °:"});
		ATOOL.resultLabelList.push({id: "HCH", label: "HCH (Head Center Height) in mm:"});
		ATOOL.resultLabelList.push({id: "GCH", label: "GCH (GT Height/Head) in mm:"});
		ATOOL.resultLabelList.push({id: "LCH", label: "LCH (LT Height/Head) in mm:"});
		ATOOL.resultLabelList.push({id: "GPH", label: "GPH (GT Height/Pelvis) in mm:"});
		ATOOL.resultLabelList.push({id: "LPH", label: "LPH (LT Height/Pelvis) in mm:"})
		
		ATOOL.descDataList = new Array();
		ATOOL.descDataList.push({	img: "", 
									text: 'Step 1: click on U1 & U2 (radiologic "U" line) as to get the pelvic reference line (PRL) + Bottom reference line (BRL)'});
		ATOOL.descDataList.push({	img: "", 
									text: 'Step 2: click on 3 points at the circumference of the femoral ball = allows for getting the Center of Rotation of the Rip (RHC)'});
		ATOOL.descDataList.push({	img: "", 
									text: 'Step 3: click on 3 points at the circumference of the acetabular prosthetic cup'});
		ATOOL.descDataList.push({	img: "", 
									text: 'Step 4: click on the points at the lateral and medial edges of the cup'});
		ATOOL.descDataList.push({	img: "", 
									text: 'Step 5: click at lateral then medial edges of the medullary canal, at approximately 3 cm below the lesser trochanter, then at lateral & medial edge of the canal, as below as possible according to the film'});
		ATOOL.descDataList.push({	img: "", 
									text: 'Step 6: click at lateral then medial edges of the prosthetic stem, at approximately 2 cm below the lesser trochanter, then at the tip of the stem'});
		ATOOL.descDataList.push({	img: "", 
									text: 'Step 7: click at the upper part of the Greater Trochanter (T1) then at the upper aspect of the Lesser Trochanter (T2)'});
									
		me.currentProgram = "OW_PAM_Pelvic POST op";
		
		me.initUI(true);
		me.init();
	}
	
	this.init_PMAP = function(){
		////console.log("initating PMAP");
		me.taskManager = new TaskManager("Preop");
		me.taskManager.taskData["results"] = new Array();
		me.registerRecordStateFunc(me.taskManager.recordState);
		me.registerRollbackFunc(me.taskManager.rollback);
		var task0 = me.taskManager.createTask("PMAP_task0", PMAP_task0);
		var task1 = me.taskManager.createTask("PMAP_task1", PMAP_task1);
		var task2 = me.taskManager.createTask("PMAP_task2", PMAP_task2);
		var task3 = me.taskManager.createTask("PMAP_task3", PMAP_task3);
		var task4 = me.taskManager.createTask("PMAP_task4", PMAP_task4);
		var task5 = me.taskManager.createTask("PMAP_task5", PMAP_task5);
		var task6 = me.taskManager.createTask("PMAP_task6", PMAP_task6);
		var task7 = me.taskManager.createTask("PMAP_task7", PMAP_task7);
		var task8 = me.taskManager.createTask("PMAP_task8", PMAP_task8);
		var task9 = me.taskManager.createTask("PMAP_task9", PMAP_task9);
		var task10 = me.taskManager.createTask("PMAP_task10", PMAP_task10);
		var task11 = me.taskManager.createTask("PMAP_task11", PMAP_task11);
		var task12 = me.taskManager.createTask("PMAP_task12", PMAP_task12);
		
		task1.addPrereq(task0);
		task2.addPrereq(task1);
		task3.addPrereq(task2);
		task4.addPrereq(task3);
		task5.addPrereq(task4);
		task6.addPrereq(task5);
		task7.addPrereq(task6);
		task8.addPrereq(task7);
		task9.addPrereq(task8);
		task10.addPrereq(task9);
		task11.addPrereq(task10);
		task12.addPrereq(task11);
		
		ATOOL.taskLabelList = new Array();
		ATOOL.taskLabelList.push({id: "step1", label: "Step 1/12: X-ray global quality assessment"});
		ATOOL.taskLabelList.push({id: "step2", label: "Step 2/12: Calibration"});
		ATOOL.taskLabelList.push({id: "step3", label: "Step 3/12: Pelvic Reference Lines"});
		ATOOL.taskLabelList.push({id: "step4", label: "Step 4/12: Center & Head Diameter + Protrusio"});
		ATOOL.taskLabelList.push({id: "step5", label: "Step 5/12: Head Roofing Angle VCE and Sharp angle"});
		ATOOL.taskLabelList.push({id: "step6", label: "Step 6/12: Femoral Axis and Offsets(Femoral and Acet)"});
		ATOOL.taskLabelList.push({id: "step7", label: "Step 7/12: Neck-Diaphysis Angle and Neck Width"});
		ATOOL.taskLabelList.push({id: "step8", label: "Step 8/12: GT and LT Height vs. Head Center and Pelvis"});
		ATOOL.taskLabelList.push({id: "step9", label: "Step 9/12: Pelvic Anteversion - Rotation + Offset"});
		ATOOL.taskLabelList.push({id: "step10", label: "Step 10/12: Theoretical Head Center (Pierchon)"});
		ATOOL.taskLabelList.push({id: "step11", label: "Step 11/12: Neck Axis versus Head-Neck Angle"});
		ATOOL.taskLabelList.push({id: "step12", label: "Step 12/12: Acetabular inclination; HTE, VCT, ECT angles"});
		ATOOL.taskLabelList.push({id: "Results", label: "Results"});
		
		ATOOL.resultLabelList = new Array();
		ATOOL.resultLabelList.push({id: "SOF", label: "Shenton Line Broken", result_unit: "", result_type: "Yes/No/Not Documented"});
		ATOOL.resultLabelList.push({id: "ASC", label: "Alignment coccyx/Symphysis", result_unit: "", result_type: "Yes/No/Not Documented"});
		ATOOL.resultLabelList.push({id: "DSC", label: "Distance symphysis/coccyx", result_unit: "", result_type: "Yes/No/Not Documented"});
		ATOOL.resultLabelList.push({id: "MCVSLT", label: "Medial Cortex vs Lesser Troch", result_unit: "", result_type: "Yes/No/Not Documented"});
		ATOOL.resultLabelList.push({id: "KONA", label: "Keeping Obturator/Neck Arch", result_unit: "", result_type: "Yes/No/Not Documented"});
		ATOOL.resultLabelList.push({id: "HD", label: "Head diameter", result_unit: "mm", result_type: "Absolute value"});
		ATOOL.resultLabelList.push({id: "HP", label: "Head protrusio", result_unit: "mm", result_type:"Absolute value"});
		ATOOL.resultLabelList.push({id: "VCE", label: "VCE angle", result_unit: "°", result_type: "Degree"});
		ATOOL.resultLabelList.push({id: "SA", label: "Sharp Angle", result_unit: "°", result_type: "Degree"});
		ATOOL.resultLabelList.push({id: "FO", label: "Femoral Offset", result_unit: "mm", result_type: "Absolute value"});
		ATOOL.resultLabelList.push({id: "AO", label: "Acetabular Offset", result_unit: "mm", result_type: "Absolute value"});
		ATOOL.resultLabelList.push({id: "NW", label: "Neck Width", result_unit: "mm", result_type: "Absolute value"});
		ATOOL.resultLabelList.push({id: "CC", label: "CC\' Neck Length", result_unit: "mm", result_type: "Absolute value"});
		ATOOL.resultLabelList.push({id: "NWNLR", label: "Neck Width/Neck Length ratio", result_unit: "", result_type: "Absolute value"});
		ATOOL.resultLabelList.push({id: "HDNLR", label: "Head Diameter/Neck Length ratio", result_unit: "", result_type: "Absolute value"});
		ATOOL.resultLabelList.push({id: "CCD", label: "CC\'D Neck Shaft Angle", result_unit: "°", result_type: "Degree"});
		ATOOL.resultLabelList.push({id: "GCH", label: "GTroch / Pelvic Line Height", result_unit: "mm", result_type: "Absolute value"});
		ATOOL.resultLabelList.push({id: "GPH", label: "GTroch / Head Center Height", result_unit: "mm", result_type: "Absolute value"});
		ATOOL.resultLabelList.push({id: "LCH", label: "LTroch / Pelvic Line Height", result_unit: "mm", result_type: "Absolute value"});
		ATOOL.resultLabelList.push({id: "LPH", label: "LTroch / Head Center Height", result_unit: "mm", result_type: "Absolute value"});
		ATOOL.resultLabelList.push({id: "CPH", label: "Coccyx/Pubis Height", result_unit: "mm", result_type: "Absolute value"});
		ATOOL.resultLabelList.push({id: "PR", label: "Pelvic rotation", result_unit: "mm", result_type: '"+" if S1 lateral ";-" if med'});
		ATOOL.resultLabelList.push({id: "PO", label: "Pelvic Offset", result_unit: "mm", result_type: "Absolute value"});
		ATOOL.resultLabelList.push({id: "DTCVSTC", label: "Distance True C vs Theor Ct", result_unit: "mm", result_type: "Absolute value"});
		ATOOL.resultLabelList.push({id: "DCCTHDR", label: "Dist CCt / Head diameter ratio", result_unit: "", result_type: "Absolute value"});
		ATOOL.resultLabelList.push({id: "HTCVSTC", label: "Height of true C vs Theoret Ct", result_unit: "mm", result_type: '"+" if higher "-" if lower'});
		ATOOL.resultLabelList.push({id: "MTCVSTC", label: "Medializat true C vs Theoret Ct", result_unit: "mm", result_type: '"+" if medial ";-" if lateral'});
		ATOOL.resultLabelList.push({id: "DCAC", label: "Distance C-Ac (True Neck Axis)", result_unit: "mm", result_type: ""});
		ATOOL.resultLabelList.push({id: "DCACHDR", label: "Dist C-Ac/Head Diam ratio", result_unit: "", result_type: ""});
		ATOOL.resultLabelList.push({id: "DTNAVSCCA", label: "Delta true neck axis vs CC\' axis", result_unit: "°", result_type: "\"+\" if valg \";-\" if varus"});
		ATOOL.resultLabelList.push({id: "SOHNHD", label: "Sup Offset head-neck/H diam", result_unit: "", result_type: "Absolute value"});
		ATOOL.resultLabelList.push({id: "HTE", label: "Inclination acetab/pelvis HTE", result_unit: "°", result_type: "Degree"});
		ATOOL.resultLabelList.push({id: "VCT", label: "Inclination acet / Head Center VCT", result_unit: "°", result_type: "Degree"});
		ATOOL.resultLabelList.push({id: "ECT", label: "Chondral zone ECT", result_unit: "°", result_type: "Degree"});
		
		ATOOL.descDataList = new Array();
		ATOOL.descDataList.push({	img: "img/PIAM_Images/PIAM_CoxFACE/PIAM_EVfinalStep002.jpg", 
									text: 'Calibration must be performed prior to launch the analysis by using the scaling item from the menu bar.'});
		ATOOL.descDataList.push({	img: "img/PIAM_Images/PIAM_CoxFACE/PIAM_EVfinalStep003.jpg", 
									text: 'Indicate the  two radiologic "U" to get both the Pelvic Reference Line (PRL) joining these two points, as well as the Ilio-Ischiatic Line (IIL) perpendicular to PRL through each U point.'});
		ATOOL.descDataList.push({	img: "img/PIAM_Images/PIAM_CoxFACE/PIAM_EVfinalStep004.jpg", 
									text: 'Indicate 3 points at the outline of the Head as C1, C2 and C3, being said that C1 and C3 must be pointed at the demarcation between head and neck. The center  of the head as "C" allows for computer both the Head Diameter and the Protrusio with reference to IIL (PB).'});
		ATOOL.descDataList.push({	img: "img/PIAM_Images/PIAM_CoxFACE/PIAM_EVfinalStep005.jpg", 
									text: 'Indicate as "E" the lateral edge of the acetabular roof(leaving off osteophytes), so as to define from the Head Center as apex, the Head Roofing Angle "VCE" as well as the Sharp Angle between the PRL and "E", the "U" point being the apex of this acute angle).'});
		ATOOL.descDataList.push({	img: "img/PIAM_Images/PIAM_CoxFACE/PIAM_EVfinalStep006.jpg", 
									text: 'Check 4 points at the outer cortex of the femoral shaft, firstly F1 and F2 at about 2 cm below the lesser trochanter, then F3 and F4 as below as allowed by the film length... The distance of D to C and IIL are defined respectively as Femoral (FO) and Acet (AO) offsets.'});
		ATOOL.descDataList.push({	img: "img/PIAM_Images/PIAM_CoxFACE/PIAM_EVfinalStep007.jpg", 
									text: "Check N1 and N2 as the narrower part of the neck, normally forming an isoceles triangle with C at apex. This allows for computing the neck with N1N2 as well as the Neck-Shaft Angle CCD and Neck length CC\'"});
		ATOOL.descDataList.push({	img: "img/PIAM_Images/PIAM_CoxFACE/PIAM_EVfinalStep008.jpg", 
									text: 'Check GT and LT as peaks of respectively Greater and Lesser Trochanter. This allows for computing heights of these two points with reference to respectively the Head Center and the Pelvic Line (PRL).'});
		ATOOL.descDataList.push({	img: "img/PIAM_Images/PIAM_CoxFACE/PIAM_EVfinalStep009.jpg", 
									text: 'Locate S1 as the apex of coccyx then S2 at upper aspect of Pubes Symphysis. Height of S1 with reference to S2 estimates in the pelvic anteversion while the S1S2 distance checks the Pelvic Rotation and the C-S2 distance defines the Pelvic Offset (PO).'});
		ATOOL.descDataList.push({	img: "img/PIAM_Images/PIAM_CoxFACE/PIAM_EVfinalStep010.jpg", 
									text: 'The P1 point is placed at the bottom of the Ilio-Sacral Joint. The projection of P1 onto the ilio-ischiatric line(IIL) defines the y-axis while PRL is the x-axis. These two axes allow for computing with U1U2 the Pierchon model to check the theoretical Head Center.'});
		ATOOL.descDataList.push({	img: "img/PIAM_Images/PIAM_CoxFACE/PIAM_EVfinalStep011.jpg", 
									text: 'Two points have to be located at junction between neck and respectively Greater and Lesser Trochanter. The line joining the middle of B1B2 and N1N2 defines the Neck axis of which variation (delta) vs. Head-Neck axis (from CCD angle) can be computed.'});
		ATOOL.descDataList.push({	img: "img/PIAM_Images/PIAM_CoxFACE/PIAM_EVfinalStep012.jpg", 
									text: 'The "T" point corresponds to the medal limit of the acetabular chondral aspect (most fine-grained zone). This point allows for computing the HTE angle (Acetab inclination/PRL), then VCT as Acet inclinatory Head Center, and ECT (Chondral acet zone).'});
		
		
		
		
		
		me.currentProgram = "OW_PAM_Pelvic PRE op";
		
		//initUI
		//closing program selection
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
									title: this.currentProgram,
									buttons: {
													Validate: function(){
														//PICTIN.automatic_programs_tool.stop();
															//console.log("wut");
															jQuery(document).trigger("form_validated");
														}
									}}, "open");
		//END initUI
		me.init();
	}
	
	this.init_PMLAT = function(){
		me.taskManager = new TaskManager("PMLAT");
		me.taskManager.taskData["results"] = new Array();
		me.registerRecordStateFunc(me.taskManager.recordState);
		me.registerRollbackFunc(me.taskManager.rollback);
		var task0 = me.taskManager.createTask("PMLAT_task0", PMLAT_task0);
		var task1 = me.taskManager.createTask("PMLAT_task1", PMLAT_task1);
		var task2 = me.taskManager.createTask("PMLAT_task2", PMLAT_task2);
		var task3 = me.taskManager.createTask("PMLAT_task3", PMLAT_task3);
		var task4 = me.taskManager.createTask("PMLAT_task4", PMLAT_task4);
		
		task1.addPrereq(task0);
		task2.addPrereq(task1);
		task3.addPrereq(task2);
		task4.addPrereq(task3);
		
		ATOOL.taskLabelList = new Array();
		ATOOL.taskLabelList.push({id: "step1", label: "Step 1/3: Calibration"});
		ATOOL.taskLabelList.push({id: "step2", label: "Step 2/3: \"True\" Femoral Neck Axis"});
		ATOOL.taskLabelList.push({id: "step3", label: "Step 3/3: Head Center, Various axes, Notzli angle"});
		ATOOL.taskLabelList.push({id: "Results", label: "Results"});
		
		
		ATOOL.resultLabelList = new Array();
		ATOOL.resultLabelList.push({id: "HD", label: "Head Diameter (mm)", result_unit: "mm", result_type: "Absolute value"});
		ATOOL.resultLabelList.push({id: "DCNA", label: "Distance From C-Neck Axis (mm)", result_unit: "mm", result_type: "Absolute value"});
		ATOOL.resultLabelList.push({id: "DCNAHDR", label: "Dist C-NeckAxis/H Diam ratio", result_unit: "", result_type: "Absolute value"})	;
		ATOOL.resultLabelList.push({id: "NA", label: "Notzli Angle", result_unit: "°", result_type: "Degree"});
		
		
		ATOOL.descDataList = new Array();
		ATOOL.descDataList.push({	img: "img/PIAM_Images/PIAM_CoxPROFIL/PIAM_EVfinalStep01.jpg", 
									text: 'Calibration must be performed prior to launch the analysis.'});
		ATOOL.descDataList.push({	img: "img/PIAM_Images/PIAM_CoxPROFIL/PIAM_EVfinalStep02.jpg", 
									text: 'Indicate 4 points (M1, M2, M3, M4) at outer cortex of femoral neck, while leaving a gap of at least 1cm between the two groups... This allows for defining the "true" lateral axis (LA) of the femoral neck (as a line joining the middle of the two segments).'});
		ATOOL.descDataList.push({	img: "img/PIAM_Images/PIAM_CoxPROFIL/PIAM_EVfinalStep03.jpg", 
									text: 'Check 3 points at the head of the circumference as P1, P2 and P3 (P3 being located at tha anterior aspect of the head), then the Nz point at the anterior demarcation between head contour and neck cortex. The ratio between the distance of C to LA / head diameter is computed, as well as the Notzli angle (Nz-C-n).'});
		
		me.currentProgram = "OW_PAM_Pelvic PRE op";
		
		//initUI
		//closing program selection
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
									title: this.currentProgram,
									buttons: {
													Validate: function(){
														//PICTIN.automatic_programs_tool.stop();
														jQuery(document).trigger("form_validated");
													}
									}}, "open");
		//END initUI
		me.init();
	}
	
	this.initUI = function(showResults){
		//closing program selection
		jQuery("#automatic_tools_selection").hide();
		jQuery("#automatic_tools_selection").dialog("close");
		
		//clear tool info
		jQuery("#tool_info > .step_list").empty();
		jQuery("#tool_info > .results").empty();
		jQuery("#step_image").empty();
		jQuery("#step_desc").empty();
		
		jQuery("#tool_info > .step_list").append('<h3>Progress :</h3>');
		for(var i in ATOOL.taskLabelList){
			jQuery("#tool_info > .step_list").append('<div class="step_list_row" id="'+ ATOOL.taskLabelList[i].id +'"><span class="AT_stepTodo">' + ATOOL.taskLabelList[i].label + '</span></div>');
		}
		
		if(showResults){
			jQuery("#tool_info > .results").append('<h3>Results :</h3>');
			for(var i in ATOOL.resultLabelList){
				jQuery("#tool_info > .results").append('<div class="AT_result_row" id="'+ ATOOL.resultLabelList[i].id +'"><span class="AT_stepTodo"><span class="AT_resultLabel" style="width:70%;">' + ATOOL.resultLabelList[i].label + '</span></span></div>');
			}
		}
		
		jQuery("#tool_info").show();
		
		
		jQuery("#tool_info").dialog({width: windowWidth,
									position: ["right", jQuery("#toolbar-holder").height()],
									title: this.currentProgram,
									buttons: {
													"Ok": function(){PICTIN.automatic_programs_tool.stop();}
									}}, "open");
	}
	
	this.refreshWindowPosition = function(){
		 jQuery("#tool_info").dialog('option', 'position', jQuery("#tool_info").dialog('option','position'));
	}
	
	this.chooseProgram = function(){
		jQuery("#automatic_tools_selection").show();
		jQuery("#automatic_tools_selection").dialog({title:"Select a program"});
	}
	
	this.init = function(){
		this.taskManager.start();
	}
	
	this.startupInit = function(){
		this.buildProgramMenu();
	}
	
	this.buildProgramMenu = function(){
		jQuery("#automatic_tools_selection").append('<div><a href="#" id="global_measures_pelvic_ap">Pelvic Global Measures : AP view</a></div>');
		jQuery("#automatic_tools_selection").append('<div><a href="#" id="global_measures_pelvic_lat">Pelvic Global Measures : LAT view</a></div>');
		jQuery("#automatic_tools_selection").append('<div><a href="#" id="preop_pelvic">Preop Hip X-ray analysis</a></div>');
		jQuery("#automatic_tools_selection").append('<div><a href="#" id="postop_pelvic">Postop Hip X-ray analysis</a></div>');
		
		jQuery("#global_measures_pelvic_ap").bind("click", this.init_PMAP);
		jQuery("#global_measures_pelvic_lat").bind("click", this.init_PMLAT);
		jQuery("#preop_pelvic").bind("click", this.initPreop);
		jQuery("#postop_pelvic").bind("click", this.initPostop);
	}
}

PIAM.update_piam=function(procedure){
	var url=PICTIN.canvas_src.src;
	var svg=jQuery(PICTIN.surface_node).html();	
	var f=jQuery('#pictin-piam-save-form')[0];
	var bg=PICTIN.canvas.toDataURL().substr(21);
	
	
	var $surface=jQuery('#'+PICTIN.surface_id);
	var surface_offset=$surface.offset();
	var imports=[];
	jQuery.each(jQuery('img.import'), function(){
		var offset=jQuery(this).offset();
		var import_json='{'+
			'"url" : "'+ this.src +'", '+
			'"x" : "'+ (offset.left-surface_offset.left) +'", '+
			'"y" : "'+ (offset.top-surface_offset.top) +'", '+
			'"width" : "'+ jQuery(this).width() +'", '+
			'"height" : "'+ jQuery(this).height() +'"'+
		'}';
		imports.push(import_json);
	});
	
	var imports_json='['+imports.join(',')+']';

	if(url && svg){
		PICTIN.toggle_overlay('show');
		f.bg.value=bg;
		f.url.value=url;
		f.svg.value=svg;
		f.imports.value=imports_json;
		
		//if(procedure){
			var PIAMS_results = [];
			var PIAMS_procedures = [];
			for(var i in PIAMRESULTS){
				var results=[];
				var result_json='{'
				for(var j in PIAMRESULTS[i]){
					results.push('"'+ j +'" : "'+ PIAMRESULTS[i][j] +'"');
				}
				result_json += results.join(',');
				result_json += '}';
				PIAMS_results.push('"'+ i +'" : '+ result_json);
				PIAMS_procedures.push('"' + i + '"');
			}
			var results_json='{'+ PIAMS_results.join(',')+'}';
			var procedures_json='['+ PIAMS_procedures.join(',')+']';
			f.PIAM_results.value = results_json;
			f.PIAM_procedures.value = procedures_json;
		//}
		
		//console.log(f.PIAM_results.value);
		f.submit();
	}
}