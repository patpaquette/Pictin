/**
 * @author patricepaquette
 */
//this class can be used by anything that has a state. It will have to implement the functions recordState() and stateRollBack()
 state_manager.prototype.undo = sm_undo;
 state_manager.prototype.redo = sm_redo;
 state_manager.prototype.recordState = sm_recordState;
 state_manager.prototype.stateRollback = sm_stateRollback;
 
 function state_manager(obj){
 	this.max_states = 20;
	this.state_index = 1;
	this.states = new Array(null); //keeps a list of custom states
	this.obj = obj;
	
	//custom rollback function pointers
	this.rollback_func = state_manager.prototype.stateRollback;
	
	if(rollback_manager != null){
		//rollback_manager.register_sm(this);
	}
 }
 
 function sm_undo(){
 	if (this.state_index > 0) {
		this.state_index -= 1;
		this.rollback_func();
	}
 }
 
 function sm_redo(){
 	if(this.state_index != this.states.length - 1){
		this.state_index += 1;
		this.rollback_func();
	}
 }

 
 function sm_recordState(state){
	//remove all states that have been undone
	if (this.state_index < this.states.length - 1) {
		this.states.splice(this.state_index + 1, this.states.length - 1 - this.state_index)
	}
	
	this.states.push(state);
	
	if (this.states.length > this.max_states) {
		this.states.splice(0);
	}
	
	this.state_index = this.states.length - 1;
 }
 
 function sm_stateRollback(){
 	//needs to be implemented by the inheriting class
 }

 
 
