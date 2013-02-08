/**
 * @author patricepaquette
 */

 DRAWLIB = {};
 
 DRAWLIB.draw_segment = function(point1, point2, color, thickness){
 	var temp_segment = PICTIN.surface.createLine({
			x1: point1.x,
			y1: point1.y,
			x2: point2.x,
			y2: point2.y
		}).setStroke({
			color: "#" + color,
			width: thickness
	});
	
	return temp_segment;
 }
