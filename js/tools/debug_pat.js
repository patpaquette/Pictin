/**
 * @author patricepaquette
 */
DEBUG_PAT = {};

DEBUG_PAT.debug_enabled = false;
DEBUG_PAT.priority_mode = false;
DEBUG_PAT.priorize = false;

DEBUG_PAT.output_obj = function(obj, label, priorize){
	if(typeof priorize != 'undefined') DEBUG_PAT.priorize = priorize;
	
	if ((DEBUG_PAT.priority_mode && DEBUG_PAT.priorize) || !(DEBUG_PAT.priority_mode)) {
		if (DEBUG_PAT.debug_enabled && typeof obj != 'undefined' && obj != null) {
			for (var key in obj) {
			
				//console.log(label + ", " + key + " : " + obj[key]);
				
			}
		}
		else 
			if (DEBUG_PAT.debug_enabled) {
				//console.log(label + ", object either null or undefined");
			}
		DEBUG_PAT.priorize = false;
	}
}

DEBUG_PAT.output = function(string, priorize){
	if(typeof priorize != 'undefined') DEBUG_PAT.priorize = priorize;
	
	if ((DEBUG_PAT.priority_mode && DEBUG_PAT.priorize) || !(DEBUG_PAT.priority_mode)) {
		if (DEBUG_PAT.debug_enabled) {
			//console.log(string);
		}
		DEBUG_PAT.priorize = false;
	}
}
