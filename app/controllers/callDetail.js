var App = require("/core");
var args = arguments[0] || {};
var quad = Alloy.Models.instance("quad");
var enabledUI = true;
var touched = false;

$.call = args.call || {};
$.day = args.day || new Backbone.Model({Date: null, DayOfWeek : null});
$.store = Alloy.createModel("store", {
	"Id" : $.call.get("StoreId") || "-1"
});

//Check modified and unplanned calls
var completeSwt = null;
var switchAutoChange = false;


if($.call){
//Ti.API.info("call args "+JSON.stringify(args));
	
	var checkModifiedCall;

	if($.call.get("RecId") != "-1"){
		checkModifiedCall = Alloy.createCollection("modifiedCall");
		checkModifiedCall.fetch({query: "SELECT * FROM modifiedCall WHERE RecId = '" + $.call.get("RecId") + "'"});
	}else{
		checkModifiedCall = Alloy.createCollection("unplannedCall");
		checkModifiedCall.fetch({query: "SELECT * FROM unplannedCall WHERE IsDraft = 0 AND StoreID = '"+ $.call.get("StoreId")+"' AND WeekDay =" + $.day.get("DayOfWeek")  + " AND WeekOf = '" + args.weekOf + "'" + " AND StopNumber = " + $.call.get("StopNumber")});
	}
	
	if(checkModifiedCall.length > 0){


		$.call.set({
			RecId :      checkModifiedCall.at(0).get("RecId"),
			TimeIn :     new Date(( checkModifiedCall.at(0).get("TimeIn"))),
			TimeOut :      new Date( (checkModifiedCall.at(0).get("TimeOut"))),
			Complete:       checkModifiedCall.at(0).get("Complete"),
			StopNumber:       checkModifiedCall.at(0).get("StopNumber"),
			StoreId :       checkModifiedCall.at(0).get("StoreId"),
			Comments:       checkModifiedCall.at(0).get("Comments"),
			Objectives :    checkModifiedCall.at(0).get("Objectives"),
			CallMadtop :    new Backbone.Model(checkModifiedCall.at(0).get("CallMadtop")),
			Promos :      	checkModifiedCall.at(0).get("Promos"),
			CallType :      checkModifiedCall.at(0).get("CallType"),
			WeekId :     	 checkModifiedCall.at(0).get("WeekId"),
			UnplannedCall :   checkModifiedCall.at(0).get("UnplannedCall"),
			DogDryLinearFeet: checkModifiedCall.at(0).get("DogDryLinearFeet"),
			DogCanLinearFeet: checkModifiedCall.at(0).get("DogCanLinearFeet"),
			CatDryLinearFeet: checkModifiedCall.at(0).get("CatDryLinearFeet"),
			CatCanLinearFeet: checkModifiedCall.at(0).get("CatCanLinearFeet"),
			TreatsLinearFeet: checkModifiedCall.at(0).get("TreatsLinearFeet"),
			CallDate:       checkModifiedCall.at(0).get("CallDate"), 
			QuadId:       checkModifiedCall.at(0).get("QuadId") 
		});
	}

} 





var date = $.call.get("CallDate") == null ? App.today.format("yyyy-mm-dd"):  $.call.get("CallDate");

if(date.split){
	date = date.split("T");
	date = date[0].split("-");
	date = new Date(date[0],date[1]-1,date[2]);
	
}


var dayOfWeek = $.day.get("DayOfWeek") == null ? App.today.getDay() : $.day.get("DayOfWeek")  ;

// Ti.API.info(JSON.stringify(dayOfWeek));

var tabs = {};
var contentTab;
var lastButton;

$.dateField.value = date.format("mm/dd/yyyy");

var timeIn = $.call.get("TimeIn");



$.checkin.text = timeIn ? timeIn.format("hh:MMTT") : "";
$.checkin.time = timeIn;

var timeOut = $.call.get("TimeOut");
$.checkout.text = timeOut ? timeOut.format("hh:MMTT") : "";
$.checkout.time = timeOut;

var isComplete = $.call.get("Complete") || false;
var switchOptions = JSON.parse("{}");

	switchOptions.right =  10;
	switchOptions.value=isComplete;


completeSwt =  Titanium.UI.createSwitch( switchOptions );

if(isComplete){
	enableButtons(false);
}

$.complete.add(completeSwt);



$.callTypeLbl.text = App.CALL_TYPE[$.call.get("CallType")];



$.store.on("change", function(){
	var timeIn = $.call.get("TimeIn");
	var timeOut = $.call.get("TimeOut");
	$.window.title = $.store.get("Name") + " - " + date.format("dddd mm/dd/yyyy");
	$.storeName.text = $.store.get("Name");
	$.address.text = $.store.get("Address", { full : true });
	$.zip.text = $.store.has("Address") ? $.store.get("Address").get("Zip") : "";
	$.phone.text = $.store.get("Phone");
	$.quadLbl.text = quad.get("Id");
	$.idField.value = $.store.get("Id");
	$.checkinLbl.text = timeIn ?  timeIn.format("hh:MMTT") : "";
	$.checkoutLbl.text = timeOut ? timeOut.format("hh:MMTT") : "";
	$.callTypeLbl.text = App.CALL_TYPE[$.call.get("CallType")];
	setTimeout(function() {
		completeSwt.value = $.call.get("Complete");
		completeSwt.enabled = !completeSwt.value;
		if((args.planStatus != 3) && (!$.call.get("UnplannedCall"))){   //Should not allow modification if the plan is not approved and it is not an unplanned call
			enableButtons(false);
		}
	}, 350);



});

$.store.fetch({
	source: "local"
});



loadTab("comments");

$.tabs.addEventListener("click", function(evt){
	var id = evt.source.id;
	if(id){
		loadTab(id);
	}
});

$.callType.addEventListener("click", function(){
	var rows = [];
	for(var i = 0; i< App.CALL_TYPE_MAP[$.store.get("Type")].length; i++){ 
		rows.push({
			title: App.CALL_TYPE[App.CALL_TYPE_MAP[$.store.get("Type")][i]],
			data:  App.CALL_TYPE[$.store.get("Type")][i]
		});
	}
	var popover = Alloy.createController("popover", {
		rows: rows,
		title: L("select_call_type_str"),
		callback: function(rcvCallType, title){
		$.callTypeLbl.text = title;
		$.call.set({
			"CallType" : rcvCallType
		});
	}
	});
	popover.open($.callType);
});
$.checkin.addEventListener("click", function(){
	var now = new Date();
	$.checkinLbl.text = now.format("hh:MMTT");
	if($.checkinLbl.color == Alloy.Globals.colors.CORK ){
		$.checkinLbl.color = "#008000";
		$.checkin.font =  Alloy.Globals.fonts.DEFAULT_14_BOLD;
	}else{
		$.checkinLbl.color = Alloy.Globals.colors.CORK;
		$.checkin.font = Alloy.Globals.fonts.DEFAULT_14;
	}

	$.checkin.time = now;
	$.checkin.touchEnabled = false;

	saveInformation();
});
$.checkout.addEventListener("click", function(){
	var now = new Date();
	$.checkoutLbl.text = now.format("hh:MMTT");

	if($.checkoutLbl.color == "#FF0000" ){
		$.checkoutLbl.color =  "#A52A2A";
		$.checkoutLbl.font  = Alloy.Globals.fonts.DEFAULT_14_BOLD;
	}else{
		$.checkoutLbl.color = "#FF0000";
		$.checkoutLbl.font = Alloy.Globals.fonts.DEFAULT_14;
	}

	$.checkout.time = now;

	$.checkout.touchEnabled = false;
	var completeConfirmation = Titanium.UI.createAlertDialog({
		title: 'Complete Call',
		message: '\nMark CALL as COMPLETE?\n\nNo further changes will be allowed',
		buttonNames: ['Yes','No'],
		cancel: 1
	});
	completeConfirmation.show();

	completeConfirmation.addEventListener('click', function(e) {
		if (e.index == 0) { // clicked "YES"
			switchAutoChange = true;
			enableButtons(false);
			setTimeout(function() {
				
				completeSwt.value = true;
				saveInformation();	
				// args && args.callback && args.callback();
				
			}, 250);

			
		} else if (e.index == 1) { // clicked "NO"
			$.checkout.touchEnabled = true;
			saveInformation();
		}    
	});



});
completeSwt.addEventListener("change", function(){
	if(!switchAutoChange){
		var completeConfirmation = Titanium.UI.createAlertDialog({
			title: 'Complete Call',
			message: '\nMark CALL as COMPLETE?\n\nNo further changes will be allowed',
			buttonNames: ['Yes','No'],
			cancel: 1
		});
		completeConfirmation.show();
	
		completeConfirmation.addEventListener('click', function(e) {
			if (e.index == 0) { // clicked "YES" 
				enableButtons(false);
				
				switchAutoChange = false;
				completeSwt.enabled = false;
				saveInformation();
				
				// args && args.callback && args.callback();
			} else if (e.index == 1) { // clicked "NO"
				enableButtons(true);
				switchAutoChange = true;
				setTimeout(function() {
					
						$.call.set({
							Complete : true,
						});
						completeSwt.value = false;
						completeSwt.enabled = true;
					}, 250);
			}    
		});
	}else{
		
		switchAutoChange = false;
	}
		
	

});

$.open = function(){
	App.Index.navigationOpen($.window)
};

function loadTab(name){
	if(contentTab){
		saveInformation();
		$.content.remove(contentTab.getView());
		contentTab = null;
	}
	if(lastButton){
		lastButton.backgroundImage = lastButton.backgroundNormalImage;
	}
	lastButton = $[name];
	lastButton.backgroundImage = lastButton.backgroundSelectedImage;
	if(!tabs[name]){
		tabs[name] = Alloy.createController(name, {
			call: $.call,
			store: $.store,
			weekOf: args.weekOf,
			addObjectives : true,
			uiEnabled : enabledUI,
			day: dayOfWeek
		});
	}
	contentTab = tabs[name];
	$.content.add(contentTab.getView());
}


function saveInformation(){
	touched = true;
	var recoverModifiedCall = null;

	if($.call.get("RecId") == "-1" ){

		//Unplanned Call
		var checkExistentCall = Alloy.createCollection("unplannedCall");

		checkExistentCall.fetch({
			query:  "SELECT * FROM unplannedCall WHERE IsDraft = 0 AND StoreId = '"+ $.call.get("StoreId")+"' AND WeekOf = '"+ args.weekOf + "' AND WeekDay = " + dayOfWeek   	 + " AND StopNumber = " + $.call.get("StopNumber")     
		});


		if(checkExistentCall.length > 0){
			recoverModifiedCall = checkExistentCall.at(0);
		}else{
			Ti.API.info("Something wrong on the call data");
		}
	}
	else
	{

		//Planned Call
		var checkExistentCall = Alloy.createCollection("modifiedCall");
		checkExistentCall.fetch({
			query: "SELECT * FROM modifiedCall WHERE RecId = '" + $.call.get("RecId") + "'"
		});
		if(checkExistentCall.length > 0 ){
			// Ti.API.info("Updating modified planned call");
			recoverModifiedCall = checkExistentCall.at(0);

		}else{
			// Ti.API.info("creating modified planned call");
			var newModifiedCall = Alloy.createModel("modifiedCall",{
				RecId :      $.call.get("RecId"),
				TimeIn :      new Date($.call.get("TimeIn")),
				TimeOut :       new Date($.call.get("TimeOut")),
				Complete:       $.call.get("Complete"),
				StopNumber:       $.call.get("StopNumber"),
				StoreId :       $.call.get("StoreId"),
				Comments:       $.call.get("Comments"),
				Objectives :    $.call.get("Objectives"),
				CallMadtop :    $.call.get("CallMadtop"),
				Promos :       $.call.get("Promos"),
				CallType :      $.call.get("CallType"),
				WeekId :      $.call.get("WeekId"),
				UnplannedCall :   $.call.get("UnplannedCall"),
				DogDryLinearFeet: $.call.get("DogDryLinearFeet"),
				DogCanLinearFeet: $.call.get("DogCanLinearFeet"),
				CatDryLinearFeet: $.call.get("CatDryLinearFeet"),
				CatCanLinearFeet: $.call.get("CatCanLinearFeet"),
				TreatsLinearFeet: $.call.get("TreatsLinearFeet"),
				CallDate:       $.call.get("CallDate"), 
				QuadId:       $.call.get("QuadId") 
			});	
			newModifiedCall.save();
			recoverModifiedCall = newModifiedCall;	
		}
	}

// Ti.API.info($.checkin.time);
	recoverModifiedCall.set({
		 TimeIn :        $.checkin.time.time && $.checkin.time.time() ||  $.checkin.time ,
		 TimeOut :       $.checkout.time.time && $.checkout.time.time() ||  $.checkout.time,
		Complete:       completeSwt.value,
		CallType:       App.CALL_TYPE.indexOf($.callTypeLbl.text),
	});

	contentTab.save(recoverModifiedCall)

}

$.save.addEventListener("click", function(){
	saveInformation();
    args && args.callback && args.callback();
});

function enableButtons(newValue){
	enabledUI = newValue;
	completeSwt.enabled = newValue;
	$.checkin.touchEnabled = newValue;
	$.checkout.touchEnabled = newValue;
	//$.content.touchEnabled = newValue;
	$.callType.touchEnabled = newValue;
	$.save.enabled = newValue;

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

	
App.goToDailyPlan = function(){
	goToDailyPlan();
}

$.window.addEventListener("close", function(){
	if(touched){
		args && args.callback && args.callback();
	}	
});
