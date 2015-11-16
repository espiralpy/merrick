var App = require("/core");
var args = arguments[0] || {};
$.objective = args.objective || new Backbone.Model();
$.index = args.index != null ? args.index : -1;

function init() {

	$.objective.on("change", repaint);

	var isComplete = $.objective.get("Completed") || false;
	
	if(isComplete){
		$.completeObjective.touchEnabled = false;
	}
	
	setTimeout(function() {
		$.completeObjective.value = isComplete;
		
	}, 250);



	repaint();
}

function showSMRT() {
	var smrt = Alloy.createController("smrt", {
		objective : $.objective
	});
	smrt.open();
}

function repaint() {
	var dueDate = $.objective.get("DueDate") || (new Date()).format("yyyy-mm-ddT00:00:00"); 
	
	if(dueDate.split){
		dueDate =  dueDate.split("T");
		dueDate = dueDate[0].split("-");

		dueDate = new Date(parseFloat(dueDate[0]),parseFloat(dueDate[1])-1,parseFloat(dueDate[2])  ) ;
	
	}

	
	


	$.specific.text = $.objective.get("Description");
	$.quantity.text = $.objective.get("Quantity");
	if($.objective.get("DistributionSalesValue") != 'undefined'){
		$.distribution.text = "$ " + $.objective.get("DistributionSalesValue");
	}	
	if( $.objective.get("RetailSalesValue") != 'undefined'){
		$.retail.text = "$ " + $.objective.get("RetailSalesValue");
	}

	if($.distribution.text == "$ undefined"){
		$.distribution.text = "$ " + "0.0";					
	}	
	if($.retail.text == "$ undefined"){
		$.retail.text = "$ " + "0.0";	
	}

	$.responsible.text = $.objective.get("ResponsibleParty") || "";
	$.dueDate.text = dueDate  ? new Date(dueDate).format("mmmm dd, yyyy") : (new Date()).format("mmmm dd, yyyy");

	args && args.callback($.objective, $.index); 
}

$.completeObjective.addEventListener("click", function(){

	$.completeObjective.touchEnabled = false;

	var completeConfirmation = Titanium.UI.createAlertDialog({
		title: 'Complete Objective',
		message: '\nMark as completed?\n\nNo further changes will be allowed once saved',
		buttonNames: ['Yes','No'],
		cancel: 1
	});
	completeConfirmation.show();

	completeConfirmation.addEventListener('click', function(e) {
		if (e.index == 0) { // clicked "YES"
			$.completeObjective.value =  !$.completeObjective.value;
			
			if($.completeObjective.value){
				$.objective.set({
					Completed : true,
					CompletionDate : new Date()
				});
			}else{
				$.objective.set({
					Completed : false,      //$.completeObjective.value || false <--it was like this
					CompletionDate : null
				});
			}
			args && args.callback($.objective, $.index); 

		} else if (e.index == 1) { // clicked "NO"

			$.completeObjective.touchEnabled = true;
		}    
	});		

});



init();