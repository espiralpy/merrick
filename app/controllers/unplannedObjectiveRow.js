var App = require("core");
var args = arguments[0] || {};
$.objective = args.objective || new Backbone.Model();

$.recoverObjective = function(){
	return $.objective;
}

function init() {
	$.objective.on("change", repaint);
	$.edit.addEventListener("click", showSMRT);
	$.row.index = args.index;
	repaint();
}

function showSMRT() {
	var smrt = Alloy.createController("smrt", {
		objective : $.objective
	});
	smrt.open();
}

function repaint() {
	var dueDate = $.objective.get("DueDate") || null;
	var objectiveText = $.objective.get("Description");
	if(objectiveText && objectiveText.length > 24){
		objectiveText  = objectiveText.slice(0,23 ) + "...";
	}
	$.specific.text = objectiveText;
	$.quantity.text = $.objective.get("Quantity");
	$.dist.text = "$ " + $.objective.get("DistributionSalesValue");			
	$.retail.text = "$ " + $.objective.get("RetailSalesValue");
	$.dist.opacity = 0.0;			
	$.retail.opacity = 0.0;
	
	if($.dist.text == "$ undefined"){
			$.dist.text = "$ " + "0.0";					
	}	
	if($.retail.text == "$ undefined"){
			$.retail.text = "$ " + "0.0";	
	}
		
	$.dist.opacity = 1.0;		
	$.retail.opacity = 1.0;

	//Ti.API.info("duedate: " + dueDate);
	if(dueDate){
		dueDate = new Date(dueDate);
		$.dueDate.text =  dueDate.format("mmmm dd, yyyy");
	}
	else{
		dueDate = new Date();
		$.dueDate.text =  dueDate.format("mmmm dd, yyyy");
	}
}

init();