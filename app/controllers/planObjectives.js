var App = require("/core");
var Api = require("/api");
var args = arguments[0] || {};
$.store = args.store || Alloy.createModel("store");
var planObjectiveRows = {};
var counter = 0;

// //Lock interfase if plan submitted
// args.uiEnabled = args.uiEnabled || false;	
// $.add.opacity = 0.5;
// $.add.opacity = 0.5;


$.init = function(){
	loadObjectives($.store.get("Objectives"));

	$.objectivesList.addEventListener("click", function(evt){
		var id = evt.source.id;
		if(id === "deleteBtn"){
			previousEvent = evt;
			
			var deleteConfirmation = Titanium.UI.createAlertDialog({
			    title: 'Remove',
			    message: 'Do you want to remove this Item?',
			    buttonNames: ['Yes','No'],
			    cancel: 1
			});
			deleteConfirmation.show();
			
	     	deleteConfirmation.addEventListener('click', function(e) {
	     		
			    if (e.index == 0) { // clicked "YES"
					$.objectivesList.deleteRow(previousEvent.index);
					$.store.get("Objectives").remove(planObjectiveRows[previousEvent.row.index].objective);
					delete planObjectiveRows[previousEvent.source.index];
			    } else if (e.index == 1) { // clicked "NO"
			    	}    
			});	
			
			

		}
	});
};

$.loadObjective = function(objective){
	objective = objective || new Backbone.Model();
	var objectiveRow = Alloy.createController("planObjectiveRow", {
		objective: objective,
		uiEnabled: args.uiEnabled,
		index : counter
	});
	planObjectiveRows[counter] = objectiveRow;
	$.objectivesList.appendRow(objectiveRow.getView());
	counter++;
};

function loadObjectives (objectives) {
	objectives && objectives.each(function(objective){
		$.loadObjective(objective, true);
	});
}

$.init();