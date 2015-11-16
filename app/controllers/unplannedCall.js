var App = require("/core");
var helpers = require("helpers");
var args = arguments[0] || {};
var today = new Date();
var sunday = helpers.nextSunday(new Date( today.getTime() - 7 * 24*60*60*1000));
var user	= App.user;
var currentWeekId  = "-1";
var currentWeekOf  = sunday.format("mm-dd-yyyy");
var planWeekRows = [];
var alreadySelectedStores = [];
var counter = 0;
var hasChanged = false;
// var App.CALL_TYPE = Ti.App.Properties.hasProperty("callTypes") ? Ti.App.Properties.getString("callTypes") : [];  
var callObjectives = [];
var todayValue = today.getDay();

var storeType  = null;

todayValue = todayValue != 0 ? todayValue : 7;
$.call;


// Ti.API.info("currentWeekId @ unplannedcall" + args.currentWeekId);
// Ti.API.info("CALL TYPE" + App.CALL_TYPE);
// Ti.API.info("CALL TYPE" + JSON.stringify(App.CALL_TYPE));
// Ti.API.info("CALL TYPE" + App.CALL_TYPE[0]);
// Ti.API.info("CALL TYPE" + JSON.stringify((App.CALL_TYPE)[0]));

function init(){
	
	App.goToDailyPlan = function(){
		goToDailyPlan();
	}
	/*
	  There will only be 1 draft available, it will update to the current day in case it was not added/finished the day before, once the draft has been added to the day
	  it will not be shown again here, it can be accessible through the daily plan screen, any further modification should be done there.
	*/
	$.today.text = today.format("mm/dd/yyyy") + " - New Call";


	$.day.text = today.format("ddd dd") + " (" + todayValue + ")";
	// App.CALL_TYPE = App.CALL_TYPE.split(",");

	var checkDraft = Alloy.createCollection("unplannedCall");
	checkDraft.fetch({query: "SELECT * FROM unplannedCall WHERE IsDraft = 1"});


	if(checkDraft.length > 0){

		$.today.text = today.format("mm/dd/yyyy") + " - Draft";
		$.call = checkDraft.at(0);
		$.call.set({
			WeekDay : todayValue,
			WeekOf  : sunday.format("mm-dd-yyyy")
		});
		$.stop.text = checkDraft.at(0).get("StopNumber");

		var recoverStore = Alloy.createCollection("store");
		recoverStore.fetch({source:"local", query: "SELECT * FROM store WHERE Id = '"  + checkDraft.at(0).get("StoreId")  +  "'"});
		if(recoverStore.length > 0){
			$.storeNameLabel.text 		  = recoverStore.at(0).get("Name");
			$.addressLabel.text   = recoverStore.at(0).get("Address").get("Street1");
			$.zipLabel.text 	  = recoverStore.at(0).get("Address").get("Zip");
			enableButtons(true);	
		}



		var jsonObjectives = checkDraft.at(0).get("Objectives").toJSON();	
		for(var z = 0; z < jsonObjectives.length ; z++  ) 
		{

			var tmpObjective = new Backbone.Model();

			tmpObjective.set({
				"DistributionSalesValue" 				: jsonObjectives[z].DistributionSalesValue || 0.0,
				"RetailSalesValue" 				: jsonObjectives[z].RetailSalesValue || 0.0,
				"Description"		: jsonObjectives[z].Description || null,
				"ResponsibleParty"  : jsonObjectives[z].ResponsibleParty || null,
				"Quantity" 			: jsonObjectives[z].Quantity || null,
				"DueDate" 			: jsonObjectives[z].DueDate || null
			});

			loadObjective(tmpObjective);

		}

		$.callType.text = App.CALL_TYPE[checkDraft.at(0).get("CallType")];

	}	
	else{

		recoverWeekId();


		$.call = Alloy.createModel("unplannedCall",{
			RecId : "-1",  				   
			StopNumber: 1,
			WeekDay : todayValue,		
			WeekOf : currentWeekOf,	 	
			WeekId : currentWeekId,	 		
			StoreId : "-1", 		 		
			CallType : 8,	
			Objectives : JSON.parse("[]"),  
			IsDraft : true,				    
		});	



	}


}


$.open = function(){

	App.Index.navigationOpen($.window);
	$.window.open();
}


function recoverWeekId(){

	var checkPlan = Alloy.createCollection("planSentForApproval");
	checkPlan.fetch({query: "SELECT WeekId FROM planSentForApproval where WeekOf = '" + currentWeekOf + "'"});
	if(checkPlan.length > 0){
		currentWeekId = checkPlan.at(0).get("WeekId");
	}
}



function processStore(rcvStore){
	
	if(rcvStore.length > 0){
		storeType 		      = rcvStore[0].store.get("Type"),
		$.storeNameLabel.text = rcvStore[0].store.get("Name");
		$.addressLabel.text   = rcvStore[0].store.get("Address").get("Street1");
		$.zipLabel.text 	  = rcvStore[0].store.get("Address").get("Zip");
		$.call.set({
			StoreId : rcvStore[0].store.get("Id")
		});
		enableButtons(true);
		
		if(App.CALL_TYPE_MAP[storeType].length > 0){
			if(App.CALL_TYPE_MAP[storeType].indexOf(8) > -1){
				$.callType.text = App.CALL_TYPE[8];
				$.call.set({
					"CallType" : 8
				});
			}else{
				$.callType.text = App.CALL_TYPE[App.CALL_TYPE_MAP[storeType][0]];
				//Ti.API.info(JSON.stringify(App.CALL_TYPE_MAP[storeType]));
				$.call.set({
					"CallType" : App.CALL_TYPE_MAP[storeType][0]
				});
			}
		}else{
			Ti.API.info("ERROR: This store type doesn't have a mapped call type");
		}
	}

}



function enableButtons (enable) {

	if(enable){
		$.add.enabled = true;
		//$.save.enabled = true;
		$.discard.enabled = true;
		$.btnAddObjectives.enabled = true;
	}
	else{
		$.add.enabled = false;
		//$.save.enabled = false;
		$.discard.enabled = false;
		$.btnAddObjectives.enabled = false;
	}

}

function loadObjective(objective){

	var tmpObjective = objective || new Backbone.Model();
	callObjectives.push(tmpObjective);

	var objectiveRow = Alloy.createController("unplannedObjectiveRow", {
		objective: objective,

	});
	$.objectivesList.appendRow(objectiveRow.getView());
}

$.stop.addEventListener("click", function(evt){
	var rows = [];
	for(var i = 1; i <= 20; i++){
		rows.push({
			title: "" + i,
			data: i
		});
	}
	var popover = Alloy.createController("popover", {
		rows: rows,
		title: L("select_stop_str"),
		callback: function(stop, title){
		$.stop.text = title;
		$.call.set({
			"StopNumber" : stop 
		});
	}
	});
	popover.open($.stop);
});

$.btnAddObjectives.addEventListener("click", function(){
	var objective = new Backbone.Model();
	var smrt = Alloy.createController("smrt", {
		objective : objective,
		onDone : function(objective){
		loadObjective(objective);
	}
	});
	//$.store.get("Objectives").add(objective);
	smrt.open();
});




$.window.addEventListener("focus", function(){
	App.user.set({
		updateMe: new Date()
	});
});


// $.save.addEventListener("click", function(){
	// saveInformation(true); 
// });

function saveInformation(rcvIsDraft){
	
	//Check for duplicate StoreId-WeekId-StopNumber combination
	if(!isDuplicatedEntry($.call.get("StoreId"),$.call.get("WeekId"),$.call.get("StopNumber"), todayValue)){
		
		var checkUnplannedCall = Alloy.createCollection("unplannedCall");
	
	
		checkUnplannedCall.fetch({query: "SELECT * FROM unplannedCall WHERE IsDraft = 1"});
	
		var tmpUnplannedCall = null;
		
		if(checkUnplannedCall.length > 0){
			tmpUnplannedCall = checkUnplannedCall.at(0);
		}else{
			tmpUnplannedCall = Alloy.createModel("unplannedCall");
		}
		
		tmpUnplannedCall.set({
				RecId : "-1",
				StopNumber: $.call.get("StopNumber"),
				WeekId : 	$.call.get("WeekId"),
				WeekOf :    $.call.get("WeekOf"),
				StoreId : 	$.call.get("StoreId"),
				Objectives : callObjectives,
				CallType : $.call.get("CallType"),
				WeekDay : $.call.get("WeekDay"),
				IsDraft : rcvIsDraft,
				
			    TimeIn : null,
			    TimeOut : null,
			    Complete: false,
			    
			    Comments : "",
			    CallMadtop : JSON.parse("[]"),
			    Promos : JSON.parse("[]"),
			    UnplannedCall : true,
			    DogDryLinearFeet: null,
			    DogCanLinearFeet: null,
			    CatDryLinearFeet: null,
			    CatCanLinearFeet: null,
			    TreatsLinearFeet: null,
			    CallDate:  new Date(), 
	
			});
			
		tmpUnplannedCall.save();
		return true;
	}else{
		alert("Another call with this Store-Day-Stop combination already exists.");
		return false;
	}
	

	

}

$.add.addEventListener("click", function(){
	hasChanged = true;
	var addToDayConfirmation = Titanium.UI.createAlertDialog({
		title: 'Add to Day',
		message: 'Do you want to add this call to your day plan?',
		buttonNames: ['Yes','No'],
		cancel: 1
	});
	addToDayConfirmation.show();
	addToDayConfirmation.addEventListener('click', function(e) {
		if (e.index == 0) { // clicked "YES"
			if(saveInformation(false)){
				args.callback();
				$.window.close();
			}
			
		} else if (e.index == 1) { // clicked "NO"
		}    
	});		
});
$.callType.addEventListener("click", function(evt){
	if(storeType != null){
		
		var rows = [];
		
		for(var i = 0; i< App.CALL_TYPE_MAP[storeType].length; i++){ 
			rows.push({
				title: App.CALL_TYPE[App.CALL_TYPE_MAP[storeType][i]],
				data:  App.CALL_TYPE_MAP[storeType][i]
			});
		}
	
		var popover = Alloy.createController("popover", {
			rows: rows,
			title: L("select_call_type_str"),
			callback: function(rcvCallType, title){
			$.callType.text = title;
			$.call.set({
				"CallType" : rcvCallType
			});
		}
		});
		popover.open($.callType);
	}
});

$.objectivesList.addEventListener("click", function(evt){
	hasChanged = true;
	var id = evt.source.id;
	switch(id){
	case "deleteBtn":


		var previousEvent = evt;

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
				callObjectives.splice(previousEvent.index,1);
			} else if (e.index == 1) { // clicked "NO"
			}    
		});	
		break;

	}
});

$.btnSelectStore.addEventListener("click", function(){
	hasChanged = true;
	var selectStore = Alloy.createController("unplannedSelectStore", {
		callback: function(selected){
		processStore(selected);
	},
	});
	selectStore.open();
});

$.discard.addEventListener("click", function(){
	hasChanged = true;
	var discardConfirmation = Titanium.UI.createAlertDialog({
		title: 'Discard',
		message: 'Do you want to discard your current plan progress?',
		buttonNames: ['Yes','No'],
		cancel: 1
	});
	discardConfirmation.show();
	discardConfirmation.addEventListener('click', function(e) {
		if (e.index == 0) { // clicked "YES"
			discardInformation()
		} else if (e.index == 1) { // clicked "NO"
		}    
	});		
});


function discardInformation(){
	enableButtons(false);
	$.today.text = today.format("mm/dd/yyyy") + " - New Call";
	recoverWeekId();


	$.call = Alloy.createModel("unplannedCall",{
		RecId : "-1",  				   
		StopNumber: 1,
		WeekDay : todayValue,		
		WeekOf : currentWeekId,	 	
		Week : currentWeekId,	 		
		StoreId : "-1", 		 		
		CallType : 8,	
		Objectives : JSON.parse("[]"), 
		IsDraft : true,				    
	});	

	$.call.set({
		WeekDay : todayValue,
		WeekOf  : sunday.format("mm-dd-yyyy")
	});


	$.storeNameLabel.text =  "";
	$.addressLabel.text   =	 "";
	$.zipLabel.text 	  =  "";

	$.stop.text   =	 "1";
	$.callType.text 	  =  "Retail";

	callObjectives = [];
	$.objectivesList.data = [];

	var checkDrafts = Alloy.createCollection("unplannedCall");
	checkDrafts.fetch({query: "SELECT * FROM unplannedCall WHERE IsDraft = 1"});

	var tmpTotalLength	= checkDrafts.length
			for(var i = 0; i < tmpTotalLength; i++){
				checkDrafts.at(0).destroy();
			}
	
}


function goToDailyPlan(){
		var completeConfirmation = Titanium.UI.createAlertDialog({
		title: 'Jump to Daily Plan',
		message: '\nGo to Daily Plan?\n\nYou will lose any unsaved changes\n',
		buttonNames: ['Yes','No'],
		cancel: 1
	});
	completeConfirmation.show();

	completeConfirmation.addEventListener('click', function(e) {
		if (e.index == 0) { // clicked "YES"
			// alert("CLICK");
			App.goToDailyPlan = function(){
				//clear previous function
				;
			}
			$.window.close();
		} else if (e.index == 1) { // clicked "NO"

		}    
	});
}

function isDuplicatedEntry(_storeId,_weekId,_stopNumber, weekDay){
	
	//Ti.API.info("values to check duplication: " + _storeId +" "+ _weekId + " "+  _stopNumber);
	var isDuplicate = false;
	var callCheck = Alloy.createCollection("call");

	callCheck.fetch({
		query: "SELECT * FROM call WHERE StoreId ='"+ _storeId  +  "' AND WeekId ='" + _weekId +"' AND StopNumber = "+_stopNumber,
		source:"local",
		silent: true
		});
		
		//Ti.API.info("found " + callCheck.length + " calls, now checking days...");
	
		if(callCheck.length > 0){
		
		for(var h = 0; h < callCheck.length; h++){
			
			var dayCheck = Alloy.createCollection("day");
			dayCheck.fetch({
				query: "SELECT * FROM day WHERE WeekId ='" + callCheck.at(h).get("WeekId") +"' AND DayOfWeek = "+ weekDay,
				source:"local",
				silent: true
			});
			
			//Ti.API.info("-found calls this day" + JSON.stringify(dayCheck));
			
			for(var f = 0; f < dayCheck.at(0).get("CallRecIds").length; f++){
				//Ti.API.info("-searching" + dayCheck.at(0).get("CallRecIds")[f]  +" = "+  callCheck.at(h).get("RecId") );
				if(dayCheck.at(0).get("CallRecIds")[f]  ==  callCheck.at(h).get("RecId") ){
					//Ti.API.info("--found a duplicate" + JSON.stringify(dayCheck.at(0).get("CallRecIds")[f]));
					return true;
				}
			}
			
			
		}
		
		
	}	
	
	
	var unplannedCallCheck = Alloy.createCollection("unplannedCall");
	
	unplannedCallCheck.fetch({
		query: "SELECT * FROM unplannedCall WHERE StoreId ='"+ _storeId  +  "' AND WeekId ='" + _weekId +"' AND StopNumber = "+ _stopNumber + " AND WeekDay = " + todayValue,
		source:"local",
		silent: true
		});
		
		//Ti.API.info("found " + unplannedCallCheck.length + " unplannedCalls with weekId");
		
	if(unplannedCallCheck.length > 0) {
		return true;
	}
	
	//CHeck the ones with WeekId = -1	
	unplannedCallCheck = Alloy.createCollection("unplannedCall");
	
	unplannedCallCheck.fetch({
		query: "SELECT * FROM unplannedCall WHERE StoreId ='"+ _storeId  +  "' AND WeekId ='" + "-1"+"' AND StopNumber = "+ _stopNumber + " AND WeekDay = " + todayValue,
		source:"local",
		silent: true
		});
		
		//Ti.API.info("found " + unplannedCallCheck.length + " unplannedCalls with WeekId = -1");
		
		if(unplannedCallCheck.length > 0) {
			return true;
		}
		
	return false;
}


init();