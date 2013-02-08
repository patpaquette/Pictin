/**
 * @author patricepaquette
 */

 function get_line_equation(p1, p2){
 	if(!isNan(p1.x) && !isNaN(p1.y) && !isNaN(p2.x) && !isNaN(p2.y)){
		var slope = (p2.y - p1.y)/(p2.x - p1.x);
		var intercept = null;
		if (!isNaN(slope))  intercept = slope*p1.x - p1.y;
		
		return new line_equation(slope, intercept);
	}
	
	return null
 }
 
 function line_equation(slope, intercept){
 	this.isVertical = null;
 	this.slope = null;
	this.intercept = null;
	
	//constructor
	(isNaN(slope))?this.isVertical=true:this.isVertical=false;
	(isNaN(slope))?this.slope=null:this.slope=slope;
	this.intercept = intercept;
	
	this.getY = function(x){
		if(this.isVertical == false){
			return this.slope*x + this.intercept;
		}
		
		return null;
	}
 }
 
 function get_segment_length(x1, y1, x2, y2){
	
	var delta_x = x2-x1;
	var delta_y = y2-y1;
	
	return Math.sqrt(delta_x*delta_x + delta_y*delta_y);
}
 
