var App = require("/core");
var args = arguments[0] || {};
$.store = args.store;

$.open = function(){
	$.window.open();
};

$.close = function(){
	$.window.close();
};

//Lock interfase if plan submitted
args.uiEnabled = args.uiEnabled || false;	
$.objectivesWrp.touchEnabled = args.uiEnabled;
$.add.enabled = args.uiEnabled;


function init () {
	$.objectives = Alloy.createController("planObjectives", {
		store : $.store,
		uiEnabled : args.uiEnabled
	});
	$.objectivesWrp.add($.objectives.getView());
}

$.closeBtn.addEventListener("click", function(){
	$.close();
});
$.add.addEventListener("click", function(){
	var objective = new Backbone.Model();
	objective.set({
		"DueDate" : args.callDate || new Date()
	});
	var smrt = Alloy.createController("smrt", {
		objective : objective,
		onDone : function(objective){
			$.objectives.loadObjective(objective);
		}
	});
	$.store.get("Objectives").add(objective);
	smrt.open();
});

init();