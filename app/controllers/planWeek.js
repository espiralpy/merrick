var App = require("/core");
var Api = require("api");
				
var helpers = require("helpers");
var sunday = helpers.nextSunday(new Date( (new Date().getTime() - (7*24*60*60*1000))  ) );
var currentWeek  = sunday;
Ti.API.info("currentWeek " + currentWeek);
var currentWeekId = "-1";
var monday = new Date(sunday.getTime() + (24*60*60*1000));
var planWeekRows = [];
// var alreadySelectedStores = [];
var counter = 0;
var hasChanged = false;
var unlocked = true;
var objectivesList = null;
var globalComments = {};
var loads = {};
var currentPlanStatus = 0;
var notCurrentWeekNotified = false;

$.open = function(){
	$.window.open();
}


function checkWeekLock(){

	var checkPlan = Alloy.createCollection("planSentForApproval");
	checkPlan.fetch({query: "SELECT * FROM planSentForApproval where WeekOf = '" + sunday.format("mm-dd-yyyy") + "'"});
	if(checkPlan.length > 0){
	currentPlanStatus = checkPlan.at(0).get("Approved");
		switch(checkPlan.at(0).get("Approved")){
			case 0: //none
				lockInterfase(false);
				changeTitleDate(null);
				break;
			case 1: 
				lockInterfase(false);
				changeTitleDate("Rejected");
				if((checkPlan.at(0).get("ManagerComments") != "Pending...") && (checkPlan.at(0).get("ManagerComments") != "")  && (checkPlan.at(0).get("ManagerComments") != null) ){
					var commentsJSON = JSON.parse(checkPlan.at(0).get("ManagerComments"));
					for(var x = 0; x < commentsJSON.length; x++){
						globalComments[commentsJSON[x].StoreId] = commentsJSON[x].Comments; 
					}

				}else{
					
					globalComments = {};
				}
				
				break;
			case 2:
				lockInterfase(true);
				changeTitleDate("Submitted");
				break;
		
			case 3:
				lockInterfase(true);
				changeTitleDate("Approved");
				break;
			}
		
	}else{
		currentPlanStatus = 0;
		lockInterfase(false);
		changeTitleDate();
	}
}

$.back.addEventListener("click", function(){

	if(hasChanged){
		var navigateConfirmation = Titanium.UI.createAlertDialog({
			title: 'Change Week',
			message: 'Any unsaved changes will be lost\nProceed?',
			buttonNames: ['Yes','No'],
			cancel: 1
		});
		navigateConfirmation.show();

		navigateConfirmation.addEventListener('click', function(e) {

			if (e.index == 0) { // clicked "YES"
				navigateWeek(-1);
			} else if (e.index == 1) { // clicked "NO"
			}    
		});	
	}
	else{
				navigateWeek(-1);
	}

});

$.next.addEventListener("click", function(){

	if(hasChanged){
		var navigateConfirmation = Titanium.UI.createAlertDialog({
			title: 'Change Week',
			message: 'Any unsaved changes will be lost\n\nProceed?',
			buttonNames: ['Yes','No'],
			cancel: 1
		});
		navigateConfirmation.show();

		navigateConfirmation.addEventListener('click', function(e) {

			if (e.index == 0) { // clicked "YES"
				navigateWeek(1);
			} else if (e.index == 1) { // clicked "NO"
			}    
		});	
	}
	else{
		navigateWeek(1);
	}
});


$.btnAddStores.addEventListener("click", function(){
	
	var tmpsunday = helpers.nextSunday(new Date( (new Date().getTime() - (7*24*60*60*1000))  ) );
	Ti.API.info("tmpsunday "+tmpsunday);
	Ti.API.info("sunday    " + sunday);
	if((!notCurrentWeekNotified) && (tmpsunday.getTime() != sunday.getTime())){
		var deleteConfirmation = Titanium.UI.createAlertDialog({
			title: 'Planning a different week',
			message: 'This is not the current week\nDo you want to continue planning anyway?',
			buttonNames: ['Yes','No'],
			cancel: 1
		});
		deleteConfirmation.show();

		deleteConfirmation.addEventListener('click', function(e) {

			if (e.index == 0) { // clicked "YES"
				notCurrentWeekNotified = true;
				callStoreSelector();
			} else if (e.index == 1) { // clicked "NO"
			}    
		});	
		
		
	}else{
		callStoreSelector();
	}
});

function callStoreSelector(){
		hasChanged = true;
	var selectStores = Alloy.createController("selectStores", {
		callback: function(selected){
		
			
		for(var i = 0; i < selected.length;  i++){

			var storeController = selected[i];

			//Store Objectives will be used to transport the actual call objectives for the week, this change will not be saved and is to be discarded when done with it.
			selected.at(i).set({ Objectives : []});

			var planWeekRow = Alloy.createController("planWeekRow", {
				store: selected.at(i),
				uiEnabled: unlocked,
				startDate : new Date(sunday.getTime()),
			});

			var notAdded = true;
			// for(var i = 0 ; i < planWeekRows.length ; i++){    // Uncomment to prevent adding the same store twice
				// if(planWeekRows[i].store.get("Id") == planWeekRow.store.get("Id") ){
					// notAdded = false;
				// }
			// }
			if(notAdded){
				$.tableView.appendRow(planWeekRow.getView());
				planWeekRows.push(planWeekRow);
			}

			//counter++;
		}
		enableButtons();
	},
	weekOf: sunday.format("mm-dd-yyyy"),
	// previouslySelectedStores: planWeekRows  //Uncomment to prevent adding the same store twice
	previouslySelectedStores: []  //Remove to  prevent adding the same store twice
	});
	selectStores.open();
};

$.tableView.addEventListener("click", function(evt){
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
						$.tableView.deleteRow(previousEvent.index);
						planWeekRows.splice(previousEvent.index,1);
						enableButtons();
					} else if (e.index == 1) { // clicked "NO"
					}    
				});	
				break;
		
			}
	

});

$.send.addEventListener("click", function(){
	hasChanged = true;

	if(validateData()){

		var sendConfirmation = Titanium.UI.createAlertDialog({
			title: 'Send for Approval',
			message: 'Do you want to send your plan for reviewal?',
			buttonNames: ['Yes','No'],
			cancel: 1
		});
		sendConfirmation.show();
		sendConfirmation.addEventListener('click', function(e) {
			if (e.index == 0) { // clicked "YES"
				loads["weekplan"] = App.loadingIndicator.show({
						 message: "Uploading Plan"
				});
				
				lockInterfase(true);
				saveInformation();
				
				if(Ti.Network.online){

					Api.request({
						uri : "/QuadWeek?date=" + monday.format("mm-dd-yyyy"),
						type : "GET",
						callback: function(rcvResponse){
						if(!(rcvResponse && rcvResponse.error)){
							currentWeekId = rcvResponse.Id || "-1";
							sendPlanToWS();
						}
						else{
							lockInterfase(false);
						}

					}
					});
				}

				else{
					alert("No Internet Connection");
					lockInterfase(false);
				}



			} else if (e.index == 1) { // clicked "NO"
			}    
		});	
	}	
});

function checkSentPlan(response){
	
	if (response && response.error){
		App.loadingIndicator.hide(loads["weekplan"]);
		alert("There was an error, please verify your plan information and try again");
		Ti.API.info("Error sending plan:" + JSON.stringify(response));
		lockInterfase(false);
	}else{
		var checkPlan = Alloy.createCollection("planSentForApproval");
		checkPlan.fetch({query: "SELECT * FROM planSentForApproval where WeekOf = '" + currentWeekId + "'"});
		var sentPlan = null;
		if(checkPlan.length > 0){
			checkPlan.at(0).set({
				WeekId			  : currentWeekId,
				WeekOf			  : currentWeekId,
				ManagerComments   : "Pending...",
				Approved 			: 2,
			});
			sentPlan = checkPlan.at(0);
		}else{

			var newPlan = Alloy.createModel("planSentForApproval");
			newPlan.set({
				WeekId			  : currentWeekId,
				WeekOf			:   sunday.format("mm-dd-yyyy"),
				ManagerComments : "Pending...",
				Approved 	    : 2,
			});
			sentPlan = newPlan;
		}

		sentPlan.save();
		if(objectivesList.length > 0){
			Api.request({
					uri : "/Objective",
					type : "POST",
					data : objectivesList.toJSON(),
					callback: function(rcvResponse){
						checkObjectivesResponse(rcvResponse);
					},

			});
		}else{
			checkObjectivesResponse(null);
		}


	}
}
function checkObjectivesResponse(response){
	App.loadingIndicator.hide(loads["weekplan"]);			
	if (response && response.error){
		
		lockInterfase(false);
		alert("There was an error updating objectives, please try again"); 
		sentPlan.set({
			Approved : 1
		});
		Ti.API.info("Error sending plan:" + JSON.stringify(response));
		sentPlan.save();
	}else{
		for(var x = 0; x < planWeekRows.length; x++){
			planWeekRows[x].disableInterfase();
		}
		alert("Plan sent for Approval");
		changeTitleDate("Sent For Approval");
	}
}

function sendPlanToWS(){
	
	//Objectives must be sent on a different call to the WS
	
	objectivesList = new Backbone.Collection();

	var daysCollection = Alloy.createCollection("day");
	var days = {};
	for(var i in planWeekRows){
		var planWeekRow = planWeekRows[i];
		var call = planWeekRow.call;
		var store = planWeekRow.store;

		var tmpObjectives  = store.get("Objectives");
		for(var j = 0; j < tmpObjectives.length ; j++){
			
			var tmpStoreObjective = new Backbone.Model();
			
			tmpStoreObjective.set({
				StoreId 			   : store.get("Id"),
				QuadId				:    store.get("QuadId"),
				DistributionSalesValue : parseFloat(1 * tmpObjectives.at(j).get("DistributionSalesValue")),
				RetailSalesValue   	: 	 parseFloat(1 * tmpObjectives.at(j).get("RetailSalesValue")),
				Description 		: 	tmpObjectives.at(j).get("Description"),
				Completed   		: 	false,
				DueDate     		: 	tmpObjectives.at(j).get("DueDate"),
				ResponsibleParty	: 	tmpObjectives.at(j).get("ResponsibleParty"),
				Quantity         	: 	1 * tmpObjectives.at(j).get("Quantity"),
			});
			
			objectivesList.add(tmpStoreObjective);
		}


		var dayOfWeek = call.get("DayOfWeek");
		
			call.set({
				"QuadId" : store.get("QuadId"),
			});
		
		
		if(!days[dayOfWeek]){

			var day = Alloy.createModel("day", {
				"DayOfWeek" : dayOfWeek,
			    //"QuadId" : store.get("QuadId"),
				"Calls" : [],
				"WeekId" : currentWeekId,
			});
			days[dayOfWeek] = day;
			daysCollection.add(day);
		}
		days[dayOfWeek].get("Calls").push(call);
	}
	for(var i =0; i < daysCollection.length; i++){
		for(var j =0; j < daysCollection.at(i).get("Calls").length; j++){
			daysCollection.at(i).get("Calls")[j].set({
				Comments : daysCollection.at(i).get("Calls")[j].get("Comments") || "",
				Complete : false,
				UnplannedCall : false,
			});

		}
	}
	Ti.API.info("Sending to WebService: " + JSON.stringify(daysCollection));
	
	Api.request({
		uri : "/QuadDay",
		type : "POST",
		data : daysCollection.toJSON(),
		callback: function(response){
		checkSentPlan(response);
	}
	});

}
function lockInterfase(lock){
	
		
	if(lock){ //lock interfase
		$.send.title = "";
		$.send.image = "/dashboard/icon_waiting_for_approval.png";
		$.send.enabled = false;
		$.save.enabled = false;
		$.discard.enabled = false;
		$.btnAddStores.enabled = false;
		unlocked = false;
	}else{  //unlock
		$.send.image = "";
		$.send.title = L("labSend_str");
		if(currentPlanStatus != 0){
			$.send.enabled = true;
			$.save.enabled = true;
			$.discard.enabled = true;
		}
		$.btnAddStores.enabled = true;
		unlocked = true;
	}

}

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
			$.tableView.setData([]);
			planWeekRows = [];
			enableButtons();
			discardSavedDatabaseInfo();
			hasChanged = false;
		} else if (e.index == 1) { // clicked "NO"
		}    
	});		
});

$.save.addEventListener("click", function(){
	saveInformation();
});

function saveInformation(){
	// if(validateData()){
	loads["save"] = App.loadingIndicator.show({
		message: "Saving"
	});
		var daysCollection = Alloy.createCollection("day");
		var days = {};
		var daysQuad = [];
		for(var i in planWeekRows){
			var planWeekRow = planWeekRows[i];
			var call = planWeekRow.call;
			var store = planWeekRow.store;
			var dayOfWeek = call.get("DayOfWeek");

			Ti.API.info("HERE BE DRAGONS " + store.get("QuadId") + store.get("Name") );
			Ti.API.info("HERE BE DRAGONS2 " + JSON.stringify(days) );
			
			call.set({
				"Objectives" : store.get("Objectives").toJSON(),
				"QuadId" : store.get("QuadId"),
			});

			if((!days[dayOfWeek]) ){
				var day = Alloy.createModel("day", {
					"DayOfWeek" : dayOfWeek,
					//"QuadId" : store.get("QuadId"),
					"Calls" : [],
					"WeekId" : currentWeekId 
				});

				days[dayOfWeek] = day;
				
				
				daysCollection.add(day);
			}

			days[dayOfWeek].get("Calls").push(call);
			var dataToSave = daysCollection.toJSON();

			
			discardSavedDatabaseInfo();

			Ti.API.info("Data to save: " + JSON.stringify(dataToSave));
			
			for(var c in dataToSave){
				var dayToSave = Alloy.createModel('weekPlans', {
					WeekOf:     sunday.format("mm-dd-yyyy"),
					DayOfWeek:  dataToSave[c].DayOfWeek,
					Day:        dataToSave[c].Day,
					//QuadId:     dataToSave[c].QuadId, 
					WeekId:     dataToSave[c].WeekId,
					Calls:      JSON.stringify(dataToSave[c].Calls)
				}); 
				dayToSave.save();
			}


		}

		hasChanged = false;
		
		App.loadingIndicator.hide(loads["save"]);
	// }
}
function discardSavedDatabaseInfo(){
	var checkExistent = Alloy.createCollection("weekPlans");
	checkExistent.fetch({query:"SELECT * FROM weekPlans WHERE WeekOf = '" + sunday.format("mm-dd-yyyy") + "'"});

	while(checkExistent.length > 0){
		checkExistent.at(0).destroy();
	}
}

function validateData(){
	loads["validate"] = App.loadingIndicator.show({
		message: "Validating data"
	});
	var validator = [
		[[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]],
		[[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]],
		[[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]],
		[[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]],
		[[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]],
		[[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]],
		[[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]]
	]; 
	
	var daysCollection = Alloy.createCollection("day");
	var days = {};
	
	for(var i in planWeekRows){
		
			var call = planWeekRows[i].call;
			// var store = planWeekRow.store;
			// var dayOfWeek = call.get("DayOfWeek");
			if((validator[call.get("DayOfWeek")-1][call.get("StopNumber")-1]).length > 0 ){			
				for(var y = 0; y < (validator[call.get("DayOfWeek")-1][call.get("StopNumber")-1]).length ; y++){ //check all stores available on that stop/day combination
					if(validator[call.get("DayOfWeek")-1][call.get("StopNumber")-1][y] == call.get("StoreId")){
						// Ti.API.info("Got Duplicate:" + call.get("DayOfWeek") + " store-" + call.get("StoreId") + " stop-" + call.get("StopNumber") );
						y = (validator[call.get("DayOfWeek")-1][call.get("StopNumber")-1]).length + 1;
						
						App.loadingIndicator.hide(loads["validate"]);
						
						alert("There is more than one call with the same Store-Day-Stop combination.\nPlease review your plan.");
						
						return false;
					}else{
						if(y == (validator[call.get("DayOfWeek")-1][call.get("StopNumber")-1]).length-1){
							(validator[call.get("DayOfWeek")-1][call.get("StopNumber")-1]).push(call.get("StoreId"));
							y = (validator[call.get("DayOfWeek")-1][call.get("StopNumber")-1]).length + 1;
						}
					}

				}	
			}else{
				(validator[call.get("DayOfWeek")-1][call.get("StopNumber")-1]).push(call.get("StoreId"));
			}
	}
	
	App.loadingIndicator.hide(loads["validate"]);
	validator = null;
	return true;	
}
function enableButtons () {
	if(unlocked && planWeekRows.length > 0 ){
		$.send.enabled = true;
		$.save.enabled = true;
		$.discard.enabled = true;
	} else {
		$.send.enabled = false;
		$.save.enabled = false;
		$.discard.enabled = false;
	}
}

function populateFromDB(rcvSunday){ 
	var checkExistent = Alloy.createCollection("weekPlans");
	checkExistent.fetch({query:"SELECT * FROM weekPlans WHERE WeekOf = '" + rcvSunday.format("mm-dd-yyyy") + "' ORDER BY DayOfWeek ASC "});

	if(checkExistent.length > 0){

		for(var x = 0; x <  checkExistent.length; x++)
		{

			var dbData = checkExistent.at(x);



			
			var existentCallsCollection = new Backbone.Collection(JSON.parse(dbData.get("Calls")));
			existentCallsCollection.comparator = function(call) {
									  return call.get("StopNumber");
									};
    		existentCallsCollection.sort();
			var existentCalls = existentCallsCollection.toJSON();
			

			for(var y = 0; y < existentCalls.length; y++){
				var storeInfo = Alloy.createCollection("weekPlans");
				storeInfo.fetch({source: "local", query:"SELECT * FROM store WHERE Id = '" + existentCalls[y].StoreId + "'"});


				if(storeInfo.length > 0){
					var tmpStore = storeInfo.at(0);

					var tmpObjectiveCollection = new Backbone.Collection();

					for(var z = 0; z < existentCalls[y].Objectives.length ; z++  ) 
					{

						var tmpObjective = new Backbone.Model();

						tmpObjective.set({
							"DistributionSalesValue" 				: existentCalls[y].Objectives[z].DistributionSalesValue || 0.0,
							"RetailSalesValue" 				: existentCalls[y].Objectives[z].RetailSalesValue || 0.0,
							"Description"		: existentCalls[y].Objectives[z].Description || null,
							"ResponsibleParty"  : existentCalls[y].Objectives[z].ResponsibleParty || null,
							"Quantity" 			: existentCalls[y].Objectives[z].Quantity || null,
							"DueDate" 			: existentCalls[y].Objectives[z].DueDate || null
						});

						tmpObjectiveCollection.add(tmpObjective);

					}

					tmpStore.set({ 
						Objectives: tmpObjectiveCollection ,
						DayOfWeek : dbData.get("DayOfWeek"),
						StopNumber : existentCalls[y].StopNumber,
						QuadId :  existentCalls[y].QuadId
					});

					var recoverCall = new Backbone.Model();

					var tmpCallDate = existentCalls[y].CallDate;
					if(tmpCallDate){
						tmpCallDate = new Date(tmpCallDate);
					}
					else{
						tmpCallDate = new Date();
					}

					// recoverCall.set({
						// Comments: existentCalls[y].Comments || "",
					// });
					
					
					recoverCall.set({
						RecId : existentCalls[y].RecId,
						// TimeIn : existentCalls[y].TimeIn,
						// TimeOut : existentCalls[y].TimeOut,
						Complete: existentCalls[y].Complete || false,
						StopNumber: existentCalls[y].StopNumber,
						StoreId : existentCalls[y].StoreId,
						//Promos : collection,
						CallType : existentCalls[y].CallType,
						WeekId : existentCalls[y].WeekId,
						// UnplannedCall : existentCalls[y].UnplannedCall,
						// DogDryLinearFeet: existentCalls[y].DogDryLinearFeet,
						// DogCanLinearFeet: existentCalls[y].DogCanLinearFeet,
						// CatDryLinearFeet: existentCalls[y].CatDryLinearFeet,
						// CatCanLinearFeet: existentCalls[y].CatCanLinearFeet,
						// TreatsLinearFeet: existentCalls[y].TreatsLinearFeet,
						CallDate: tmpCallDate,   
						DayOfWeek: dbData.get("DayOfWeek"),
						CallMadtop: existentCalls[y].CallMadtop,
						Promos: existentCalls[y].Promos,

					});
					
					
					if(currentPlanStatus == 1){
						recoverCall.set({
							
							Comments: globalComments[existentCalls[y].StoreId] || "",
						});
					}else{
						recoverCall.set({
							Comments: existentCalls[y].Comments || "",
						});
					}
					
					var planWeekRow = Alloy.createController("planWeekRow", {
						dbCall: recoverCall,
						store: tmpStore,
						uiEnabled: unlocked,
						startDate : new Date(rcvSunday.getTime()),
						//index : counter
					});

					var notAdded = true;
					// for(var i = 0 ; i < planWeekRows.length ; i++){  //Uncomment to prevent the same store to be added more than once
						// if(planWeekRows[i].store.get("Id") == planWeekRow.store.get("Id") ){
							// notAdded = false;
						// }
					// }
					if(notAdded){
						$.tableView.appendRow(planWeekRow.getView());
						planWeekRows.push(planWeekRow);
					}
					enableButtons();

				}else{
					Ti.API.info("Unexistent Store in local database");
				}


			}



		}

	}
}

function getDateSuffix(date) {
	if (date == 1 || date == 21 || date == 31 ) {
		return 'st';
	}
	else {
		if  (date == 2 || date == 22) {
			return 'nd';
		}
		else {
			if  (date == 3 || date == 23) {
				return 'rd';
			}
			else{
				return 'th';
			}
		}

	}
}


function enablePlanWeekButtons(){
	Ti.API.info("**Not this one");
	Ti.API.info("Enable Sunday = " + sunday);
	Ti.API.info("Today " + new Date((helpers.nextSunday(new Date())).getTime() - (7 * 24 * 60 * 60 * 1000)));
	if (sunday.getTime() <= (helpers.nextSunday(new Date())).getTime() - (7 * 24 * 60 * 60 * 1000)){
		$.back.enabled = false;
		$.back.opacity = 0.5
	}
	else{
		$.back.enabled = true;
		$.back.opacity = 1.0;
	}
	
	Ti.API.info("//Not this one");
}

function changeTitleDate(status){
	var tmpStatus = status != null ? (" - "+status) : "";
	var friday = new Date (monday.getTime() + 4 * 24 * 60* 60 * 1000);

	if(friday.format("mmmm") == monday.format("mmmm")){
		$.currentWeek.text = monday.format("mmmm d")  + getDateSuffix(monday.getDate()) + " - " + friday.format("d") + getDateSuffix(friday.getDate()) + friday.format(", yyyy") + tmpStatus;  //February 18th - 22th, 2013
	}else{
		$.currentWeek.text = monday.format("mmmm d")  + getDateSuffix(monday.getDate()) + " - " + friday.format("mmmm d") + getDateSuffix(friday.getDate()) + friday.format(", yyyy") + tmpStatus; //February 29th - May 4th, 2013
	}
	//week starts and is defined by sunday
	// Sunday is the Key, L - V available working days, Saturday ignored
}

function navigateWeek(direction){
	notCurrentWeekNotified = false;
	currentWeekId="-1";
	var loads = {};
	loads["plan"] = App.loadingIndicator.show({
		message: "Plan"
	});
	Ti.API.info("Navigate!");
	if(direction == 1){
		Ti.API.info("current Sunday: "+ sunday);
		sunday = helpers.nextSundayForward(monday);
	Ti.API.info("new sunday! " + sunday);
		monday = new Date(sunday.getTime() + (24*60*60*1000));
	Ti.API.info("new monday! " + monday);
	}else{
		Ti.API.info("current Sunday: "+ sunday);
		sunday = helpers.nextSunday(new Date( monday.getTime() - (8 * 24 * 60 * 60 * 1000) ));
	Ti.API.info("new sunday! " + sunday);
		monday = new Date(sunday.getTime() + (24*60*60*1000));
	Ti.API.info("new monday! " + monday);
	}

	checkWeekLock();
	$.tableView.setData([]);
	planWeekRows = [];
	Ti.API.info("populate sunday!" + sunday);
	populateFromDB(sunday);	
	enableButtons();
	enablePlanWeekButtons();

	hasChanged = false;

	App.loadingIndicator.hide(loads["plan"]);
}

$.window.addEventListener('open', function(e) {
	enablePlanWeekButtons();
	var loads = {};

	loads["plan"] = App.loadingIndicator.show({
		message: "Plan"
	});
	checkWeekLock();
	populateFromDB(sunday);	
	App.loadingIndicator.hide(loads["plan"]);
	
});

$.window.addEventListener("focus",function (){
	$.myUserInfo.avatar.image = Ti.App.Properties.getString("userAvatar","/dashboard/photoplaceholder.png");
	$.myUserInfo.user.value = Ti.App.Properties.getString("userRealName", App.user.get("Username")) ;
});
