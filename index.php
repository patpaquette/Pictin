<?php
require 'config.php';
require 'func.php';
error_reporting(0);
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<meta http-equiv="X-UA-Compatible" content="IE=EmulateIE7" />
<title><?php _e('Pict-In'); ?></title>
<!-- DIJIT THEME CSS -->
<link rel="stylesheet" href="https://ajax.googleapis.com/ajax/libs/dojo/1.4.1/dijit/themes/tundra/tundra.css">
<!--<link rel="stylesheet" href="lib/dijit/themes/tundra/tundra.css" />-->
<!-- PICT-IN CSS -->
<link rel="stylesheet" href="css/pict-in.css">
<link rel="stylesheet" href="css/pict-in-inc.css">
<!-- COLOR-PICKER CSS -->
<link rel="stylesheet" media="screen" type="text/css" href="lib/colorpicker/css/colorpicker.css" />
<!-- DOJOX FLOATING PANE CSS -->
<link rel="stylesheet" href="https://ajax.googleapis.com/ajax/libs/dojo/1.4.1/dojox/layout/resources/FloatingPane.css">
<link rel="stylesheet" href="https://ajax.googleapis.com/ajax/libs/dojo/1.4.1/dojox/layout/resources/ResizeHandle.css">
<!----
<link rel="stylesheet" href="lib/dojox/layout/resources/FloatingPane.css">
<link rel="stylesheet" href="lib/dojox/layout/resources/ResizeHandle.css">-->
<!-- JQUERY UI BASE CSS -->
<link rel="stylesheet" href="https://jquery-ui.googlecode.com/svn/tags/1.8rc3/themes/base/jquery-ui.css">
<!--<link rel="stylesheet" href="lib/jquery-ui-1.8.2.custom/development-bundle/themes/base/jquery.ui.all.css">-->

<!-- JAVASCRIPT -->
<script language="javascript">
<!--
var PICTIN={};
PICTIN.url='<?php echo PICTIN_URL; ?>';
PICTIN.piam_type = 
'<?php 

if(isset($_GET["hipknee"])){
	echo $_GET["hipknee"];
}
else{
	echo 'A';
}
?>';

-->
</script>
<!-- JQUERY JS-->
<script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/jquery/1.4.2/jquery.js"></script>
<!--<script type="text/javascript" src="lib/jquery-ui-1.8.2.custom/js/jquery-1.4.2.min.js"></script>-->
<!-- JQUERY UI JS-->
<script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/jqueryui/1.8.4/jquery-ui.min.js"></script>
<!--
<script type="text/javascript" src="lib/jquery-ui-1.8.2.custom/js/jquery-ui-1.8.2.custom.min.js"></script>
-->

<script type="text/javascript" src="lib/mustache.js"></script>
<script type="text/javascript" src="lib/base2.js"></script>
<!-- IMPORT IMAGE JS -->
<!-- DOJO CORE JS-->
<!--<script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/dojo/1.4.1/dojo/dojo.xd.js.uncompressed.js"></script>-->
<script type="text/javascript" src="lib/dojo/dojo.js"></script>
<!-- TINYBROWSER JS -->
<!--<script type="text/javascript" src="lib/tinybrowser/tb_standalone.js.php"></script>-->
<!-- COLOR PICKER JS -->
<script type="text/javascript" src="lib/colorpicker/js/colorpicker.js"></script>
<!-- AJAX UPLOAD JS -->
<script type="text/javascript" src="lib/ajaxupload.js"></script>


<!-- EXCANVAS JS -->
<!--[if IE]><script type="text/javascript" src="js/excanvas.js"></script><![endif]-->
<!-- PIXASTIC JS -->
<script type="text/javascript" src="js/pixastic.custom.js"></script>

<!-- base javascript classes -->
<script src="js/dojo-require.js" type="text/javascript"></script>
<script src="js/tools/task_manager.js" type="text/javascript"></script>
<script src="js/tools/automatic_programs/APBase.js" type="text/javascript"></script>
<script src="js/tools/util.js" type="text/javascript"></script>
<script src="js/tools/tool_cfg.js" type="text/javascript"></script>
<script src="js/tools/automatic_programs/knee/KneeBase.js" type="text/javascript"></script>
<script src="js/tools/automatic_programs/knee/HKA_global_axis.js" type="text/javascript"></script>
<script src="js/tools/automatic_programs/knee/Patellar_measures.js" type="text/javascript"></script>
<script src="js/tools/automatic_programs/knee/BBL_skyline_views_postop.js" type="text/javascript"></script>
<script src="js/tools/automatic_programs/AP_tool.js" type="text/javascript"></script>
<script src="js/tools/angle.js" type="text/javascript"></script>
<!--<script src="lib/number-functions/number-functions.js" type="text/javascript"></script>
<script src="js/tools/drawing_lib.js" type="text/javascript"></script>

<script src="js/tools/debug_pat.js" type="text/javascript"></script>
<script src="js/tools/pictin_shape_manager.js" type="text/javascript"></script>
<script src="js/tools/undo&redo/rollback_manager.js" type="text/javascript"></script>
<script src="js/tools/undo&redo/state_manager.js" type="text/javascript"></script>

<script src="js/tools/measure.js" type="text/javascript"></script>
<script src="js/tools/calibrate.js" type="text/javascript"></script>
<script src="js/tools/rectangle.js" type="text/javascript"></script>
<script src="js/tools/circle.js" type="text/javascript"></script>
<script src="js/tools/line.js" type="text/javascript"></script>
<script src="js/tools/segment.js" type="text/javascript"></script>
<script src="js/tools/dot.js" type="text/javascript"></script>
<script src="js/tools/angle.js" type="text/javascript"></script>
<script src="js/tools/ellipse.js" type="text/javascript"></script>



<script src="js/tools/automatic_programs/pre&post_op/preop_tasks.js" type="text/javascript"></script>
<script src="js/tools/automatic_programs/pre&post_op/postop_tasks.js" type="text/javascript"></script>
<script src="js/tools/automatic_programs/pre&post_op/preop_pm_ap_tasks.js" type="text/javascript"></script>
<script src="js/tools/automatic_programs/pre&post_op/preop_pm_lat_tasks.js" type="text/javascript"></script>
-->
<!-- PICT-IN JS -->
<script type="text/javascript" src="js/pict-in.js" ></script>
<script type="text/javascript" src="js/pict-in-inc.js" ></script>


<!-- PICTIN tools -->
<!--
<script type="text/javascript" src="js/tools/measure.js"></script>
<script type="text/javascript" src="js/tools/calibrate.js"></script>
<script type="text/javascript" src="js/tools/debug_pat.js"></script>
<script type="text/javascript" src="js/tools/pictin_shape_manager.js"></script>
<script type="text/javascript" src="js/tools/undo&redo/rollback_manager.js"></script>
<script type="text/javascript" src="js/tools/undo&redo/state_manager.js"></script>
<script type="text/javascript" src="js/tools/rectangle.js"></script>
<script type="text/javascript" src="js/tools/circle.js"></script>
<script type="text/javascript" src="js/tools/line.js"></script>
<script type="text/javascript" src="js/tools/segment.js"></script>
<script type="text/javascript" src="js/tools/dot.js"></script>
<script type="text/javascript" src="js/tools/angle.js"></script>
<script type="text/javascript" src="js/tools/util.js"></script>
<script type="text/javascript" src="js/tools/tool_cfg.js"></script>
<script type="text/javascript" src="lib/number-functions/number-functions.js"></script>
<script type="text/javascript" src="js/tools/drawing_lib.js"></script>
<script type="text/javascript" src="js/tools/ellipse.js"></script>
<script type="text/javascript" src="js/tools/task_manager.js"></script>
<script type="text/javascript" src="js/tools/pre&post_op/pre&post_op_tool.js"></script>
<script type="text/javascript" src="js/tools/pre&post_op/preop_tasks.js"></script>-->
<!-- PICT-IN LANGUAGE -->
<!--<script type="text/javascript" src="js/pict-in.lang.js.php"></script>-->
<script language="javascript" defer="defer">
<!--
	<?php
	if(file_exists('lang/'.$_SESSION["lang"].'.php')){
		require 'lang/'.$_SESSION["lang"].'.php';
	}
	?>
	PICTIN.localized={
	<?php
	if(isset($localized) && is_array($localized)){
		foreach($localized as $original=>$translated){
			$original=str_replace("'", "\\'", $original);
			$translated=str_replace("'", "\\'", $translated);
			
			if($original && $translated)
				echo "\t'$original':'$translated',\r\n";
		}
		echo "\t'':''";
	}
	?>
	}
-->
</script>
</head>
<body class="tundra">
<!--TOOLBAR-->
<div id="toolbar-holder" style="height:36px;">
	<div id="toolbar"></div>
</div>
<div id="canvas">
	<canvas id="background"></canvas>
	<div id="surface">
		<p>&nbsp;&nbsp;<?php _e('Load an image first&hellip;')?>&nbsp;&nbsp;</p>
	</div>
</div>
<!-- COLOR PICKER -->
<div id="pictin-colorpicker-holder">
	<div id="pictin-colorpicker"></div>
</div>
<!-- FILE MANAGER -->
<!--
<div id="pictin-filemanager-holder">
	<iframe frameborder="0" id="pictin-filemanager" style="width:98%;margin:0 0 8px 0;border:none;" src="lib/tinybrowser/tinybrowser.php?type=image&feid=replaceme" scrolling="no"></iframe>
</div>
-->
<!--DEBUG-->
<div style="width:150px;height:350px;float:right;border:1px solid blue;padding:3px;visibility:hidden;">
	<div id="debug-mousemove"></div>
	<div id="debug-mousedown"></div>
	<div id="debug-mouseup"></div>
	<div id="debug-other" style="width:100%; height:180px; overflow:scroll;"></div>
</div>
<!-- CONTRAST & BRIGHTNESS -->
<div id="pictin-contrabright-holder">
	<div id="pictin-contrabright">
		<div id="pictin-contrabright-preview">
			<canvas height="180" width="180"></canvas>
		</div>
		<div id="pictin-contrabright-controls">
			<div id="pictin-brightness-control">
				<div id="pictin-brightness-label"><?php _e('Brightness'); ?></div>
				<div>
					<div id="pictin-brightness-slider"></div>
					<input id="pictin-brightness-value" type="text" size="3" value="0" />
				</div>
			</div>
			<div id="pictin-contrast-control">
				<div id="pictin-contrast-label"><?php _e('Contrast'); ?></div>
				<div>
					<div id="pictin-contrast-slider"></div>
					<input id="pictin-contrast-value" type="text" size="3" value="0" />
				</div>
			</div>
			<div id="pictin-contrabright-buttons">
				<button id="pictin-contrabright-reset-button" type="button"><?php _e('Reset'); ?></button>
				<button id="pictin-contrabright-ok-button" type="button"><?php _e('OK'); ?></button>
			</div>
		</div>
	</div>
</div>
<!-- TEXT -->
<div id="pictin-drawtext-holder">
	<div id="pictin-drawtext">
		<div id="pictin-drawtext-toolbar"></div>
		<div><textarea id="pictin-drawtext-value" disabled="disabled"></textarea></div>
		<div id="pictin-drawtext-buttons">
			<button id="pictin-drawtext-cancel-button" type="button"><?php _e('Cancel'); ?></button>
			<button id="pictin-drawtext-ok-button" type="button"><?php _e('OK'); ?></button>
		</div>
	</div>
</div>

<!-- CALIBRATION -->
<div id="pictin-calibration-holder" style="display:none;">
	<div id="pictin-calibration">
	</div>
	<div id="select-area-dialog">
		<?php _e('Please select the circle area.'); ?>
	</div>
	<div id="zoomed-area-dialog">
		<canvas id="zoomed-area-canvas"></canvas>
		<div id="zoomed-area-surface"></div>
	</div>
	<div id="pictin-calibration-dialog">
		<?php _e('Selection of calibration mode:'); ?><br/>
		<?php _e('Circle diameter: 3 points at circumference'); ?><br/>
		<input type="radio" name="diameter" calibration_style="circle" value="28" checked><?php _e('28mm ball'); ?><br/>
		<input type="radio" name="diameter" calibration_style="circle" value="32"><?php _e('32mm ball'); ?><br/>
		<input type="radio" name="diameter" calibration_style="circle" id="radio_custom_circle"><input type="text" id="calibration_custom1" value="0"><br/>
		<?php _e('Linear distance with 2 dots') ?><br />
		<input type="radio" name="diameter" calibration_style="segment" value="23.25"><?php _e('1&euro; coin diameter')?><br/>
		<input type="radio" name="diameter" calibration_style="segment" value="25.75"><?php _e('2&euro; coin diameter')?><br/>
		<input type="radio" name="diameter" calibration_style="segment" id="radio_custom_segment"><input type="text" id="calibration_custom2" value="0">
		<input type="hidden" id="calibration_style" value="circle">
		<input type="hidden" id="calibration_value" value="28">
	</div>
</div>
<div id="pictin-measurement-holder" style="display:none;">
	<div id="measurement-select-area-dialog">
    	<?php _e("Please select the measurement zoom area"); ?>
    </div>
</div>


<canvas id="tmp_canvas"></canvas>	


<!--overlay-->
<div id="pictin-overlay"></div>
<div id="pictin-overlay-content">
    <div>
        <div><img src='img/activity.gif' /></div>
        <div><?php _e("Please wait&hellip;"); ?></div>
    </div>
</div>


<!-- SAVE FORM -->
<form id="pictin-save-form" method="post" action="save.php">
<input type="hidden" name="bg" /><input type="hidden" name="url" /><input type="hidden" name="svg" /><input type="hidden" name="imports" />
</form>
<form id="pictin-piam-save-form" method="post" action="save.php">
<input type="hidden" name="bg" /><input type="hidden" name="url" /><input type="hidden" name="svg" /><input type="hidden" name="imports" /><input type="hidden" name="PIAM_results" /><input type="hidden" name="PIAM_procedures" />
</form>
<!-- pre&post op dialogs -->
<div id="automatic_tools" style="display:none;">
    <div id="automatic_tools_selection">
        <div class="title"></div>
        
    </div>
    
    <div id="tool_info">
     <div id="step_imageBox">
     	<div id="step_image"></div>
   	 	<div id="step_desc"></div>
     </div>
     <div class="step_list"></div>
     <div class="results"></div>
    </div>
</div>

<div id="PMAP_form" style="display:none;">
	<table width="100%">
		<tr class="PIAM_row">
				<td style="width:3%">1.</td>
	    		<td style="width:61%">Shenton Line Broken : </td>
	    		<td style="width:12%"><input type="radio" name="SOF" value="yes" />Yes</td>
	    		<td style="width:15%"><input type="radio" name="SOF" value="no" />No</td>
	    		<td style="width:9%"><input type="radio" name="SOF" value="ND" />ND</td>
	    </tr>
	    <tr class="PIAM_row">
	    		<td>2.</td>
	    		<td>Coccyx/Symphysis Pubica Alignment(0&#177;1) : </td>
	    		<td><input type="radio" name="ASC" value="Yes</td>" />Yes</td>
	    		<td><input type="radio" name="ASC" value="no" />No</td>
	    		<td><input type="radio" name="ASC" value="ND" />ND</td>
	    </tr>
	    <tr class="PIAM_row">
	    		<td>3.</td>
	    		<td>Distance Symphysis/Coccyx(2&#177;1) : </td>
	    		<td><input type="radio" name="DSC" value="Yes</td>" />Yes</td>
	    		<td><input type="radio" name="DSC" value="no" />No</td>
	    		<td><input type="radio" name="DSC" value="ND" />ND</td>
	    </tr>
	    <tr class="PIAM_row">
	    		<td>4.</td>
	    		<td>Medial Cortex vs. Lesser Trochanter : </td>
	    		<td><input type="radio" name="MCVSLT" value="Yes</td>" />Yes</td>
	    		<td><input type="radio" name="MCVSLT" value="no" />No</td>
				<td><input type="radio" name="MCVSLT" value="ND" />ND</td>
	    </tr>
	    <tr class="PIAM_row">
	    		<td>5.</td>
	    		<td>Keep the Obturator/Neck Arch : </td>
	    		<td><input type="radio" name="KONA" value="Yes</td>" />Yes</td>
	    		<td><input type="radio" name="KONA" value="no" />No</td>
	    		<td><input type="radio" name="KONA" value="ND" />ND</td>
	    </tr>
	    <tr class="PIAM_row">
	    		<td>6.</td>
	    		<td>Patient's Gender : </td>
	    		<td><input type="radio" name="gender" value="male" onclick="jQuery(document).trigger('PIAM_gender_chosen')"/>Male</td>
	    		<td><input type="radio" name="gender" value="female" onclick="jQuery(document).trigger('PIAM_gender_chosen')"/>Female</td>
	    		
	    </tr>
	    <tr class="PIAM_row">
	    		<td>7.</td>
	    		<td>Side of the studied Hip : </td>
	    		<td><input type="radio" name="side" value="left" onclick="jQuery(document).trigger('PIAM_side_chosen')"/>Left</td>
	    		<td><input type="radio" name="side" value="right" onclick="jQuery(document).trigger('PIAM_side_chosen')"/>Right</td>
	    		
	    </tr>
	</table>
</div>

<div id="PMLAT_form" style="display:none;">
	<table width="100%">
	    <tr class="PIAM_row">
	    		<td>1.</td>
	    		<td>Side of the studied Hip : </td>
	    		<td><input type="radio" name="PMLAT_side" value="left" onclick="jQuery(document).trigger('PIAM_side_chosen')"/>Left</td>
	    		<td><input type="radio" name="PMLAT_side" value="right" onclick="jQuery(document).trigger('PIAM_side_chosen')"/>Right</td>
	    </tr>
	</table>
</div>

<script id="APInitForm" type="text/template">
	<table width="100%">
		<tr class = "PIAM_row">
			{{#row}}
			<td>{{id}}.</td>
			<td>{{label}}</td>
				{{#choices}}
				<td><input type="radio" name="{{name}}" value="{{value}}" onclick="jQuery(document).trigger('{{event}}')"/>{{choice}}</td>
				{{/choices}}
			{{/row}}
		</tr>
	</table>
</script>

<script id="APResultTpl" type ="text/template">
<table width="100%">
	{{#resultset}}
		{{#header}}
		<tr class="PIAM_row"><td colspan="3"><strong><br />{{header}}</strong></td></tr>
		{{/header}}
		{{#results}}
		<tr class="PIAM_row" id="{{id}}"><td style="width:5%;text-align:center;" class="AT_resultNb">{{resultNo}}.<td style="width:45%" class="AT_resultLabel AT_stepTodo">{{label}}</td>
					<td style="width:10%;background-color:#FFE7E4;text-align:center;border:solid 1px #94A9E4;" class="AT_result AT_stepFinished">{{value}}</td><td  style="width:10%;text-align:center;" class="AT_result_unit">{{unit}}</td><td style="width:30%" class="AT_result_type">{{type}}
					</td>
		</tr>
		{{/results}}
	{{/resultset}}
</table>

</script>


</body>
</html>