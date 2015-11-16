var App = require("/core");
var helpers = require("helpers");
var args = arguments[0] || {};
var lastItem;
var lastPresetView;
$.objective = args.objective || new Backbone.Model();

if(args.objective == null){
	$.objective.set({
		"DistributionSalesValue" : 0.0,
		"RetailSalesValue" : 0.0
	});
}


showView("s");

$.open = function(){
	$.window.open();
};

$.close = function(){
	$.window.close();
};

$.closeBtn.addEventListener("click", function(){
	$.close();
})
$.done.addEventListener("click", function(){
	if(validateObjective()){
		if(args && args.useConfirmation && args.useConfirmation == true){
			var addConfirmation = Titanium.UI.createAlertDialog({
				    title: 'Add Objective',
				    message: 'Once this objective has been added, it can not be edited or removed.\nDo you want to continue?',
				    buttonNames: ['Yes','No'],
				    cancel: 1
				});
				addConfirmation.show();
				
		     	addConfirmation.addEventListener('click', function(e) {
		     		
				    if (e.index == 0) { // clicked "YES"
				    	args.onDone && args.onDone($.objective);
						$.close();
				    } else if (e.index == 1) { // clicked "NO"
				    	}    
				});	
		}
		else{
			args.onDone && args.onDone($.objective);
			$.close();
		}
	}else{
		$.close();
	}

	
});
$.menu.addEventListener("click", function(evt){
	var id = evt.source.action;
	id && showView(id);
});
$.description.addEventListener("change", function(evt){
	$.objective.set({
		"Description": evt.value
	});
	$.mDescription.value = evt.value;
});
$.responsible.addEventListener("change", function(evt){
	$.objective.set({
		"ResponsibleParty" : evt.value
	});
});
$.quantity.addEventListener("blur", function(evt){
	if(evt.value!=""){
		var tmpValue = parseFloat(evt.value);
		if(!tmpValue){
			tmpValue = 0;
		}
		$.quantity.value =  tmpValue.toFixed(0);
		$.objective.set({
			"Quantity" : $.quantity.value
		});	
	}
});
$.distribution.addEventListener("blur", function(evt){

	if(evt.value != ""){
		$.distributionDollar.opacity = 1.0;
		var tmpValue = parseFloat(evt.value);
		if(!tmpValue){
			tmpValue = 0;
		}
		$.distribution.value = tmpValue.toFixed(2);
		$.objective.set({
			"DistributionSalesValue" : $.distribution.value
		});
	}
	else{
		$.distributionDollar.opacity = 0.3;
	}
});

$.retail.addEventListener("blur", function(evt){
	if(evt.value != ""){
		$.retailDollar.opacity = 1.0;	
		var tmpValue = parseFloat(evt.value);
		if(!tmpValue){
			tmpValue = 0;
		}
		$.retail.value = tmpValue.toFixed(2);
		$.objective.set({
			"RetailSalesValue" : $.retail.value
		});
	}
	else{
		$.retailDollar.opacity = 0.3;
	}


});
$.dueDate.addEventListener("click", function(){
	var minDate = helpers.clearTime(new Date);
	if($.dueDate.text == ""){
		$.dueDate.text = minDate.format("dddd mmm dd, yyyy");
	}
	var dueDate = $.objective.get("DueDate");
	// Ti.API.info(dueDate);
	if(dueDate){
		dueDate = new Date(dueDate);
	}
	else{
		dueDate = new Date(); 
		$.objective.set({
			"DueDate" : dueDate
		});	
	}
	var popover = Alloy.createController("popover", {
		rows: "date",
		minDate : minDate,
		value : dueDate,
		title: L("select_date_str"),
		callback: function(day){
		$.dueDate.text = day.format("dddd mmm dd, yyyy");
		$.objective.set({
			"DueDate" : day
		});
	}
	});
	popover.open($.dueDate);
	popover = null;
});

function repaint () {
	var dueDate = $.objective.get("DueDate") || "";
	$.description.value = $.objective.get("Description") || "";
	$.mDescription.value = $.objective.get("Description") || "";
	$.responsible.value = $.objective.get("ResponsibleParty") || "";
	$.quantity.value = $.objective.get("Quantity") || "";
	$.distribution.value = $.objective.get("DistributionSalesValue") || "";
	if($.distribution.getValue() != ""){
		$.distributionDollar.opacity = 1.0;
	}
	$.retail.value = $.objective.get("RetailSalesValue") || "";
	if($.retail.getValue() != ""){
		$.retailDollar.opacity = 1.0;

	}
	if(dueDate){
		dueDate = new Date(dueDate);
		$.dueDate.text =  dueDate.format("dddd mmmm dd, yyyy");
	}
	else{
		dueDate = new Date();
		$.dueDate.text =  dueDate.format("dddd mmmm dd, yyyy");
	}
}

function showView (itemId) {

	
	if(lastItem){
		lastItem.color = lastItem.normalColor;
		lastItem.backgroundColor = lastItem.backgroundNormalColor;
		lastPresetView.visible = false;
	}
	lastPresetView = $[itemId + "Wrapper"];
	lastPresetView.visible = true;
	lastItem = $[itemId];
	lastItem.color = lastItem.selectedColor;
	lastItem.backgroundColor = lastItem.backgroundSelectedColor;

}

function validateObjective(){
	if(JSON.stringify($.objective) == "{}"){
		return false;
	}else{
		return true;
	}
}
repaint();