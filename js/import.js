jQuery.fn.stayInBox = function(box){
    var thisPos = this.position();
    var boxPos = box.position();
    var diff_right = (thisPos.left + this.width()) - (boxPos.left + box.width());
    var diff_bottom = (thisPos.top + this.height()) - (boxPos.top + box.height());
    var diff_left = boxPos.left - thisPos.left;
    var diff_top = boxPos.top - thisPos.top;
    
    if(diff_right > 0)
        this.width(this.width() - diff_right);
        
    if(diff_bottom > 0)
        this.height(this.height() - diff_bottom);
        
    if(diff_left > 0)
        this.css("left", thisPos.left + diff_left);
        
    if(diff_top > 0)
        this.css("top", thisPos.top + diff_top);
}

var elCount = 0;
 
function newCommon(tpl_id, sub_tag){
    jQuery("div[id*='el_div_']").css("position", "absolute"); // 1
    
    var newDraggable = jQuery("#"+tpl_id).clone().css("zIndex", elCount + 100).attr("id", "el_div_" + elCount)
                                .addClass("resizable ui-resizable").prependTo("#workarea"); // 2
    
    newDraggable.find(".delete").click(function(){
        jQuery(this).parent().remove(); // 3
    });
    
    var dragger = newDraggable.find(".dragger"); // 4
    dragger.mousedown(function(){ newDraggable.draggable({containment: "#workarea"}); });
    dragger.mouseup(function(){ newDraggable.draggable("disable"); });
    elCount++;
    return newDraggable;
}

var newImage = function(){
    var draggable = newCommon("img_div_tpl", "img");
    
    var subEl = draggable.find("img");
    draggable.width(subEl.width()).height(subEl.height()); // 1
    // 2
    draggable.resizable({
        aspectRatio: true,
        handles: "all",
        minWidth: 150,
        minHeight: 150,
        ghost: true,
        stop: function(){
            jQuery(this).stayInBox(jQuery("#workarea"));
            jQuery(this).find("img").width(jQuery(this).width()).height(jQuery(this).height());
        }
    });
}

var newText = function(){
    var draggable = newCommon("txt_div_tpl", "textarea");
    draggable.resizable({
        handles: "all",
        minWidth: 160,
        minHeight: 160,
        ghost: true,
        stop: function(){
            jQuery(this).stayInBox(jQuery("#workarea"));
            var margin = jQuery(this).find(".dragger").width() * 2;
            jQuery(this).find("textarea").width(jQuery(this).width() - margin).height(jQuery(this).height() - margin);
        }
    });
}

jQuery(document).ready(function(){
    jQuery("#new_text").click(newText);
    jQuery("#new_image").click(newImage);
    jQuery("#templates").hide();
});

/*
</script>
<button id="new_text">New Text Field</button><button id="new_image">New Image</button>
<div id="workarea" class="workspace">
<div id="templates">
    <div id="img_div_tpl" class="img_start">
        <img src="black_reuben.png" class="img_img_start">
        <div class="delete">&nbsp;</div>
        <div class="dragger">&nbsp;</div>
    </div>
    <div id="txt_div_tpl" class="txt_start">
        <textarea class="txt_area_start">jQuery UI, JavaScript, CSS, Ajax, programming, jobs, job, work, Ruby, Rails, PHP, Java, contractor, outsourcing.</textarea>
        <div class="delete">&nbsp;</div>
        <div class="dragger">&nbsp;</div>
    </div>
</div>
</body>
</html>

.workspace{
    border:2px black solid; 
    width:500px; 
    height:500px;
}
 
.txt_area_start{
    width:160px;
    height:160px;
    background: #fff;
    margin: 20px 20px 20px 20px;
    border:0;
    overflow: hidden;
}
 
.img_img_start{
    margin: 0;
    border:0;
}
 
.img_start{
    position: absolute;
    top: 0;
    left: 0;
}
 
.txt_start{
    width:200px;
    height:200px;
    position: absolute;
    top: 0;
    left: 0;
}
 
.dragger{
    background: url(images/drag.png);
    width:20px; 
    height:20px;
    position: absolute;
    bottom: -15;
    left: -15;
    
}
 
.resizer{
    background: url(images/zoom.png);
    clear: both;
    width:20px; 
    height:20px;
    position: absolute;
    bottom: 0;
    right: 0;
}
 
.delete{
    background: url(images/delete.png);
    width:20px; 
    height:20px;
    position: absolute;
    top: -15;
    right: -15;
}

*/


