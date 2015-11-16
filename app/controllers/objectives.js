var App = require("/core");
var Api = require("/api");
var args = arguments[0] || {};
$.call = args.call || Alloy.createModel("call");
$.store = args.store || Alloy.createModel("store");
var callObjectives = [];
var objectiveRows = [];
var existentObjectives = [];
var counter = 0;

if(args && (args.uiEnabled != null) && !args.uiEnabled){
	$.objectivesContainer.touchEnabled = false;
}



$.init = function(){
	loadObjectives($.call.get("Objectives"));
	loadObjectives($.store.get("Objectives"));
	if(args && args.addObjectives){
		var addObjectivesButton  = Ti.UI.createButton({
			left : 930,
			top  : 388,
			color: "gray",
			width: 70,
			height: 30,
			backgroundLeftCap: 30,
			backgroundTopCap: 15,
			image: "/store/add.png",
			backgroundImage: "/transparent.png",
			font: Alloy.Globals.fonts.DEFAULT_12_BOLD,
			enabled : true
		});
		addObjectivesButton.addEventListener("click",function(){
				var objective = new Backbone.Model();
				objective.set({
					DueDate : new Date()
				});
				var smrt = Alloy.createController("smrt", {
					objective : objective,
					useConfirmation : true,
					onDone : function(objective){
					$.loadObjective(objective);
				}
				});
				smrt.open();
		});
		$.objectivesContainer.add(addObjectivesButton);
	}
};

$.loadObjective = function(objective){
	
	callObjectives.push(objective);
	
	
	objective = objective || new Backbone.Model();
	var objectiveRow = Alloy.createController("objectiveRow", {
		objective: objective,
		index : counter,
		callback: function(objective,index){
			updateObjective(objective,index);
		}
	});
	objectiveRows[counter] = objectiveRow;
	$.objectivesList.appendRow(objectiveRow.getView());
	counter++;
};

function loadObjectives (objectives) {
	//NOT THE SAME AS loadObjective
	if(objectives != null){
		for(var i = 0; i < objectives.length ; i++){
			//Ti.API.info(existentObjectives.indexOf(objectives.at(i).get("RecId")) + JSON.stringify(objectives.at(i))); 
			if(existentObjectives.indexOf(objectives.at(i).get("RecId")) < 0 ){
				existentObjectives.push(objectives.at(i).get("RecId"));
				$.loadObjective(objectives.at(i), true);
			}
		}
	}
		

}

exports.save = saveInformation;

function saveInformation(rcvModifiedCall){
	//Ti.API.info("Save objectives");
	
	rcvModifiedCall.set({
		Objectives : callObjectives
	});

	rcvModifiedCall.save();
	
}


function updateObjective(objective,index){
	if(index != -1){
		callObjectives[index] = objective;
	}
}

$.init();