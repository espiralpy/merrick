var App = require("/core");
var Api = require("api");

App.loadingIndicator = Alloy.createController("loadingIndicator");
var loads = {};

var tabBar = Alloy.createController("tabBar", {
	tabGroup: $.tabGroup
});
var tabsInfo = {};
var sentModifiedCalls = [];
var callsInProcess = 0;
var daysToAdd = [];
var callsToProcess = [];
var loadingCatalogs = false;


$.reload = function(){
	$.dashboard.reload();
	$.stores.reload();
};

$.navigationOpen = function(window){
	var tab = $.tabGroup.activeTab;
	var index = tab.index;
	if(!tabsInfo[index]){
		tabsInfo[index] = [];
	}
	tabsInfo[index].push(window);
	tab.open(window);
};

$.navigationClose = function(window){
	var tab = $.tabGroup.activeTab;
	var index = tab.index;
	if(!tabsInfo[index]){
		tabsInfo[index] = [];
	}
	tabsInfo[index].pop();
	tab.close(window);
};

$.navigationCloseAll = function(index){
	if(tabsInfo[index] != null){
		var tabInfo = tabsInfo[index];
		var tab = $.tabGroup.tabs[index];
		var window;
		while(window = tabInfo.pop()){
			tab.close(window);
			window = null;
		}
	}
};

function init () {
	App.Index = $;

	tabBar.logout.addEventListener("click", function(){

		var logoutConfirmation = Titanium.UI.createAlertDialog({
			title: 'Logout',
			message: 'Do you want to logout?\n',
			//message: 'Do you want to logout?\n\nATTENTION:\n\nInternet access is required to log back in again.',
			buttonNames: ['Yes','No'],
			cancel: 1
		});
		logoutConfirmation.show();

		logoutConfirmation.addEventListener('click', function(e) {

			if (e.index == 0) { // clicked "YES"
				// Ti.App.Properties.removeProperty("validSession");
				// Ti.App.Properties.removeProperty("username");
				// Ti.App.Properties.removeProperty("password");
				// Ti.App.Properties.removeProperty("userLastAlerted");
				App.user.logout();
			} else if (e.index == 1) { // clicked "NO"
			}    
		});	




	});

	tabBar.sync.addEventListener("click", function(){

		daysToAdd = [];
		if(Ti.Network.online){
			
			loads["sync"] = App.loadingIndicator.show({
					 message: "Syncing Information"
			 });
			
			$.dashboard.sync({
				source: "local", 
				updateSync : true
			});

			//Check unsent unplanned calls to the WS
			var createdUnplannedCalls = Alloy.createCollection("unplannedCall");
			createdUnplannedCalls.fetch({
				query:"SELECT * FROM unplannedCall WHERE isDraft = 0 and WeekId = '-1'" , 
			});

			if(createdUnplannedCalls.length == 0){
				createUnplannedCalls();
			}
			//Getting the weekId to tag it to the unplanned calls
			for(var x = 0; x < createdUnplannedCalls.length ; x++){
				callsInProcess++;
				var currentIndex = x;
				Api.request({
					uri : "/QuadWeek?date=" + createdUnplannedCalls.at(x).get("WeekOf"),
					type : "GET",
					callback: function(rcvResponse){
					callsInProcess--;
					if(!(rcvResponse && rcvResponse.error)){
						createdUnplannedCalls.at(currentIndex).set({
							WeekId : rcvResponse.Id || "-1"
						});
						createdUnplannedCalls.at(currentIndex).save({source:"local", silent: true,});

						if(callsInProcess <= 0){

							createUnplannedCalls();
							
						}
					}
					else{
						Ti.API.info("Error receiving week Ids for unplanned calls");
					}
					
				}

				});



			}






		}else{
			alert("Internet Access required to Sync");
		}

	});

	$.tabGroup.add(tabBar.bar);
	$.tabGroup.add(tabBar.logo);
	$.tabGroup.open();

	App.Login = Alloy.createController("login");
}

function createUnplannedCalls(){
	callsInProcess = 0;
	
	//Ti.API.info("Received weekIds and creating the calls on the WS");
	//Create unplanned Calls (Get RecIds)
	var sendableUnplannedCalls = Alloy.createCollection("unplannedCall");
	sendableUnplannedCalls.fetch({
		query:"SELECT * FROM unplannedCall WHERE isDraft = 0 and RecId = '-1'" ,
		source:"local"
	});
	
	if(sendableUnplannedCalls.length == 0){
			updateCalls();
	}
	
	// alert(sendableUnplannedCalls.length);
	var objectivesList = new Backbone.Collection();
	for(var j = 0 ; j < sendableUnplannedCalls.length ; j++){
			var currentIndex = j;
			// var storeQuad = Alloy.createCollection("salesQuad");
			// storeQuad.fetch({
				// source:"local",
				// query:"SELECT QuadId FROM salesQuad WHERE StoreId = '" + sendableUnplannedCalls.at(j).get("StoreId") + "'",
				// silent: true,
				// });
	
			var tmpUri = "/QuadCall?";
			/*
			if(storeQuad.length > 0){
				if(storeQuad.at(0).get("QuadId") != null){
					tmpUri = "/QuadCall?quadId="+ storeQuad.at(0).get("QuadId") ;
				}
			}
			*/
			
			//GETOBJECTIVES and set a storeid, remember: objectives are sent on a different call to the WS
			tmpObjectivesList = sendableUnplannedCalls.at(j).get("Objectives") || new Backbone.Collection() ;
			
			for(var m = 0; m < tmpObjectivesList.length; m++){
				tmpObjectivesList.at(m).set({
					StoreId : sendableUnplannedCalls.at(j).get("StoreId")
				});
			}
			
			for(var m = 0; m < tmpObjectivesList.length; m++){
				objectivesList.add(tmpObjectivesList.at(m));
			}
			
			
			sendableUnplannedCalls.at(j).set({
				Complete : sendableUnplannedCalls.at(j).get("Complete")  == 1 ? true : false,
				UnplannedCall : sendableUnplannedCalls.at(j).get("UnplannedCall")  == 1 ? true : false,
				Promos : sendableUnplannedCalls.at(j).get("Promos").length == 0 ? null : sendableUnplannedCalls.at(j).get("Promos"),
			});
		}
		// alert(JSON.stringify(objectivesList));
		if(callsInProcess <= 0){
			callsInProcess = 0;
				if(objectivesList.length > 0){
				Api.request({
						uri : "/Objective",
						type : "POST",
						data : objectivesList.toJSON(),
						callback: function(rcvResponse){
							
								if (rcvResponse && rcvResponse.error){
								alert("There was an error sending objectives, please try again"); 
								updateCalls();
							}else{
								
								sendUnplannedCall(sendableUnplannedCalls);
							}
							
						}
	
				});
				}else{
					sendUnplannedCall(sendableUnplannedCalls); //updateCalls();
				}
				
			}
	
}

function sendUnplannedCall(callsList){		
//Get the updated info from callList TODO
	// alert("sending unplanned calls");
	callsInProcess = 0;
	callsToProcess = [];

	for(var x = 0; x < callsList.length; x++){

		callsToProcess.push([callsList.at(x),true]);
		//TODO REMOVE QUAD ASSIGNMENT
		// var storeQuad = Alloy.createCollection("salesQuad");
		// storeQuad.fetch({
			// source:"local",
			// query:"SELECT QuadId FROM salesQuad WHERE StoreId = '" + callsList.at(x).get("StoreId") + "'",
			// silent: true,
			// });

		
		var tmpUri = "/QuadCall?";
// 		
		// if(storeQuad.length > 0){ 
			// if(storeQuad.at(0).get("QuadId") != null){
				// tmpUri = "/QuadCall?quadId="+ storeQuad.at(0).get("QuadId") ;
			// }
		// }
// 		
		// if(storeQuad.length > 0){
			// callsList.at(x).set({
				// // QuadId : storeQuad.at(0).get("QuadId")
			// });
		// }else{
			callsList.at(x).set({
				QuadId : null
			});
		// }
		//GETOBJECTIVES and set a storeid, remember: objectives are sent on a different call to the WS
		// var objectivesList = callsList.at(x).get("Objectives") ;  TODO TODO TODO TODO
		// for(var m = 0; m < objectivesList.length; m++){
			// objectivesList.at(m).set({
				// StoreId : callsList.at(x).get("StoreId")
			// });
		// }s
		
	    //var currentIndex = x;
	 	
	 	//Add as an array and null the items?
	 	
	 	var internalIndex = 0;
		setTimeout(function(){
			
			for(var f = 0; f < callsToProcess.length; f++){
				if(callsToProcess[f][1]){
					callsToProcess[f][1] = false;
					  internalIndex = f;
					  f=callsToProcess.length;
				}
			}
			
			
			Api.request({
				// /QuadCall?quadId=(value)&weekId=(value)
				uri : tmpUri +"weekId=" + callsList.at(internalIndex).get("WeekId")+"&dayOfWeek="+callsList.at(internalIndex).get("WeekDay"),
				type : "POST",
				data : callsList.at(internalIndex).toJSON(),
				callback: function(rcvResponse){
					
				
						if(!(rcvResponse && rcvResponse.error)){
							
							
							for(var t = 0; t < callsList.length; t++){
								if(
									(callsList.at(t).get("WeekDay") == (rcvResponse.DayOfWeek*1))  &&
									(callsList.at(t).get("StoreId") == rcvResponse.StoreId)  &&
									(callsList.at(t).get("StopNumber") == rcvResponse.StopNumber)  
									){
									callsList.at(t).set({
										Destroy : true
									});
								}
								// else{
									// Ti.API.info("Not equal" + JSON.stringify(callsList.at(t)) + "\n> " + JSON.stringify(rcvResponse));
								// }
							}
		
						}
						else{
							Ti.API.info("Error sending unplanned calls");
														
							for(var t = 0; t < callsList.length; t++){
								if(
									(callsList.at(t).get("WeekDay") == (rcvResponse.DayOfWeek*1))  &&
									(callsList.at(t).get("StoreId") == rcvResponse.StoreId)  &&
									(callsList.at(t).get("StopNumber") == rcvResponse.StopNumber)  
									){
									callsList.at(t).set({
										Destroy : false
									});
								}
							}
						}
						
						var allCompleted = true;
						for(var g = 0; g < callsList.length; g++){
							if(!callsList.at(g).has("Destroy")){
								allCompleted = false;
							}
						}
						if(allCompleted){
							
							for(var b = (callsList.length-1); b >= 0; b--){
								//Ti.API.info("b -> " + b + JSON.stringify(callsList.at(b)));
									if(callsList.at(b).get("Destroy") == true){
										callsList.at(b).destroy({source:"local" , silent: true});
									}
								
								}
								
								updateCalls();
						}


					}
			});
				
			}, (1500 * x));
		
			
	}

}


function updateCalls(){

	callsInProcess = 0 ;
	
	Ti.API.info("Ready to send my updates");
	
	//Send information, A few notes here: Structure on how to send this info was modified half way through development, not allowing a more clean implementation, hence the following data manipulations
	//A brief example on this, objectives were tagged to the calls instead of the stores, among other changes halfway through the late stages of development.
	//This also applies to the behavior on the "plan new week" window
	
	
	var updatedWeeks = Alloy.createCollection("modifiedCall");
	updatedWeeks.fetch({
		query:"SELECT DISTINCT WeekId FROM modifiedCall WHERE complete = 1" ,
		silent: true,
	});
	if(updatedWeeks.length == 0){
			updateStores();
	}
	
	
	var updatedObjectives = new Backbone.Collection();
	var createdObjectives = new Backbone.Collection();	
	
	for(var k = 0 ; k < updatedWeeks.length ; k++){
			
		var updatedCalls = Alloy.createCollection("modifiedCall");
		updatedCalls.fetch({
			query:"SELECT * FROM modifiedCall WHERE WeekId = '"+updatedWeeks.at(k).get("WeekId")+"'" ,
			silent: true,
		});
		
		callsInProcess = 0;
		
	
		
		var tmpCallsCollection = new Backbone.Collection();
		
		for(var q = 0 ; q < updatedCalls.length ; q++){
			
			
			var currentIndex = q;
			// var storeQuad = Alloy.createCollection("salesQuad");
				// storeQuad.fetch({
					// source:"local",
					// query:"SELECT QuadId FROM salesQuad WHERE StoreId = '" + updatedCalls.at(currentIndex).get("StoreId") + "'",
					// silent: true,
// 								
				// });
	
			 var tmpUri = "/QuadCall?"; 
			
			//var tmpUri = "/QuadCall?";
			var tmpCall = new Backbone.Model();
			
			// if(storeQuad.length > 0){
				// tmpCall.set({
					// QuadId : storeQuad.at(0).get("QuadId")
				// });
			// }else{
				// tmpCall.set({
					// QuadId : null
				// });
			// }
// 			
			tmpCall.set({
				RecId : 1 * updatedCalls.at(currentIndex).get("RecId"),
				CallType: updatedCalls.at(currentIndex).get("CallType"),
				TimeIn: updatedCalls.at(currentIndex).get("TimeIn"),
				TimeOut: updatedCalls.at(currentIndex).get("TimeOut"),
				Complete : updatedCalls.at(currentIndex).get("Complete")  == 1 ? true : false,
				StopNumber: updatedCalls.at(currentIndex).get("StopNumber"),
				StoreId: updatedCalls.at(currentIndex).get("StoreId"),
				Comments : updatedCalls.at(currentIndex).get("Comments") || "No Comments",
				Promos : updatedCalls.at(currentIndex).get("Promos").length == 0 ? null : updatedCalls.at(currentIndex).get("Promos"),
				CallMadtop: updatedCalls.at(currentIndex).get("CallMadtop"),
				CallDate: updatedCalls.at(currentIndex).get("CallDate"),
				WeekId: updatedCalls.at(currentIndex).get("WeekId"),
				UnplannedCall:    updatedCalls.at(currentIndex).get("UnplannedCall"),
				DogDryLinearFeet: updatedCalls.at(currentIndex).get("DogDryLinearFeet"),
			    DogCanLinearFeet: updatedCalls.at(currentIndex).get("DogCanLinearFeet"),
			    CatDryLinearFeet: updatedCalls.at(currentIndex).get("CatDryLinearFeet"),
			    CatCanLinearFeet: updatedCalls.at(currentIndex).get("CatCanLinearFeet"),
			    TreatsLinearFeet: updatedCalls.at(currentIndex).get("TreatsLinearFeet"),
			    QuadId: updatedCalls.at(currentIndex).get("QuadId"),
				
				//Objectives : null
			});
			tmpCallsCollection.add(tmpCall);
			
			// Ti.API.info("preparing objectives ");
			var tmpObjectives =  new Backbone.Collection(updatedCalls.at(currentIndex).get("Objectives"));
			
			
			
			//Objectives are updated on a separate call to the WS

			for(var n =0 ; n < tmpObjectives.length; n++){
				
				tmpObjectives.at(n).set({
					StoreId: updatedCalls.at(currentIndex).get("StoreId")
				});
				
				//Must differentiate of they are new objectives or previously created objectives as bot require 2 different methods to be send to the WS and prevent duplicates.
				
				if(tmpObjectives.at(n).has("RecId")){
					updatedObjectives.add(tmpObjectives.at(n));
				}else{
					createdObjectives.add(tmpObjectives.at(n));
				}
			}
		}
		
		callsInProcess++;
		Api.request({
				// QuadCall?quadId=(null)&weekId=(value)  - quadid null due to WS changes, field will probably dissapear in the future
				
				uri : tmpUri +"weekId=" + updatedCalls.at(currentIndex).get("WeekId"),
				type : "PUT",
				data : tmpCallsCollection.toJSON(),
				callback: function(rcvResponse){
				callsInProcess--;
				if(!(rcvResponse && rcvResponse.error)){
					for(var t = updatedCalls.length-1; t >=0 ; t--){
						updatedCalls.at(t).destroy({source:"local", silent: true,});
					}
				}
				else{
					 App.loadingIndicator.hide(loads["sync"]);
					Ti.API.info("Error updating calls");
				}
				if( (callsInProcess <= 0) &&  (k >= updatedWeeks.length-1)){
					// Ti.API.info("Updating Stores");
					processObjectives(updatedObjectives,createdObjectives);
				}
				
	
			}
		});
		
		
	}
	

}

function processObjectives(updatedObjectives,createdObjectives){
	
	callsInProcess = 0;
	
	if(updatedObjectives.length == 0  && createdObjectives.length == 0 ){
		updateStores();
	}
	
	if(updatedObjectives.length > 0){
		callsInProcess++;
		Api.request({
				uri : "/Objective",
				type : "PUT",
				data : updatedObjectives.toJSON(),
				callback: function(rcvResponse){
					callsInProcess--;	
						if (rcvResponse && rcvResponse.error){
						alert("There was an error updating objectives, please try again"); 
					
					}else{
						//do nothing
					}
					if(callsInProcess <= 0){
						updateStores();
					}
				}
	
		});
	}
	if(createdObjectives.length > 0){
		callsInProcess++;
		Api.request({
				uri : "/Objective",
				type : "POST",
				data : createdObjectives.toJSON(),
				callback: function(rcvResponse){
					callsInProcess--;
						if (rcvResponse && rcvResponse.error){
						alert("There was an error sending objectives, please try again"); 
					
					}else{
						//
					}
					if(callsInProcess <= 0){
						updateStores();
					}
				}
	
		});
	}
}


function updateStores(){
	
	var updatedStores = Alloy.createCollection("modifiedStore");
	updatedStores.fetch({
		query:"SELECT * FROM modifiedStore" ,
		silent: true,
	});
	
	callsInProcess = 0;
	
	if(updatedStores.length == 0){
		refreshDays();
	}else{
		var allModifiedStores = new Backbone.Collection();
	
			for(var j = 0 ; j < updatedStores.length ; j++){
				
				var storeChanges = new Backbone.Model();
				// [{"Id":"104108","Manager":"Manager Name","Contact":"Contact Name","Comments":"some comment"}]
				storeChanges.set({
					Id :      updatedStores.at(j).get("StoreId"),
					Manager:  updatedStores.at(j).get("Manager"),
					Contact:  updatedStores.at(j).get("Contact"),
					Comments: updatedStores.at(j).get("Comments") || "No Comments",
				});
				
				allModifiedStores.add(storeChanges);
			}
				Api.request({
					uri : "/Store",
					type : "PUT",
					data : allModifiedStores.toJSON(),
					callback: function(rcvResponse){
					if(!(rcvResponse && rcvResponse.error)){
						for(var v = updatedStores.length-1 ; v >= 0; v--){
							updatedStores.at(v).destroy({source:"local", silent: true,});
						}
					}
					else{
						 Ti.API.info("Error updating stores");
					}
					
					refreshDays();
					
					
		
				}
			});
			
	}

}

function refreshDays(){
	
	callsInProcess = 0;
	var getAvailableWeekids = Alloy.createCollection("quad");
	getAvailableWeekids.fetch({
		query:'SELECT  StartDate, Id FROM quad WHERE Status != 0 ORDER BY StartDate  DESC LIMIT 8',
		source:"local",
		silent: true,
	});
	
	callsInProcess = 0;
	
	// http://mufasa.merrickpetcare.com:87/api/QuadDay?weekIds=SW_000003905|SW_000003906|SW_000003907
	
	if(getAvailableWeekids.length == 0){
			getAvailableWeekids.fetch({
			query:'SELECT  StartDate, Id FROM quad ORDER BY StartDate  DESC LIMIT 7',
			source:"local",
			silent: true,
		});
	}	

	var availableWeekIds = "";
	var startDate = 9999999999999999;
	var endDate = 0;
	
	//Adding weeks which have information
	for(var z = 0; z < getAvailableWeekids.length; z++){
		if(z == 0){
			//enddate and startdate look reversed though they aren't, this is a quick reminder that the order is descending on the query so the latest date is received as the first record
			availableWeekIds+= getAvailableWeekids.at(z).get("Id");
			endDate = getAvailableWeekids.at(z).get("StartDate").getTime() > endDate ? getAvailableWeekids.at(z).get("StartDate").getTime() : endDate;  //.format("mm-dd-yyyy");
			startDate = getAvailableWeekids.at(z).get("StartDate").getTime()< startDate ? getAvailableWeekids.at(z).get("StartDate").getTime() : startDate; ;//.format("mm-dd-yyyy");
		}else{
			// if(z == getAvailableWeekids.length-1){
				availableWeekIds+= "|" +getAvailableWeekids.at(z).get("Id");
				startDate = getAvailableWeekids.at(z).get("StartDate").getTime()< startDate ? getAvailableWeekids.at(z).get("StartDate").getTime() : startDate; //.format("mm-dd-yyyy");
			// }else{
				// availableWeekIds+= "|" + getAvailableWeekids.at(z).get("Id");
			// }
		}
	}
	
	
	//Adding weeks which were blank to check for updates
	var getAvailableBlankWeekids = Alloy.createCollection("quad");
	getAvailableBlankWeekids.fetch({
		query:'SELECT  StartDate, Id FROM quad WHERE Status = 0 ORDER BY StartDate  DESC',
		source:"local",
		silent: true,
	});
	
	
	// https://mufasa.merrickpetcare.com:85/api/QuadDay?weekIds=SW_000003905|SW_000003906|SW_000003907  this is how it looks
	
	if(getAvailableBlankWeekids.length > 0){
		for(var z = 0; z < getAvailableBlankWeekids.length; z++){
			if(z == 0){
				if(availableWeekIds === ""){
					availableWeekIds += getAvailableBlankWeekids.at(z).get("Id");
				}else{ 
					availableWeekIds += "|" + getAvailableBlankWeekids.at(z).get("Id");
				}
				// if(endDate === "" || startDate === ""){		
					endDate = getAvailableBlankWeekids.at(z).get("StartDate").getTime() > endDate ? getAvailableBlankWeekids.at(z).get("StartDate").getTime() : endDate;  //.format("mm-dd-yyyy");
					startDate = getAvailableBlankWeekids.at(z).get("StartDate").getTime()< startDate ? getAvailableBlankWeekids.at(z).get("StartDate").getTime() : startDate; ;//.format("mm-dd-yyyy");
					// }
			}else{
				// if(z == getAvailableBlankWeekids.length-1){
					availableWeekIds+= "|" + getAvailableBlankWeekids.at(z).get("Id")
					endDate = getAvailableBlankWeekids.at(z).get("StartDate").getTime() > endDate ? getAvailableBlankWeekids.at(z).get("StartDate").getTime() : endDate;  //.format("mm-dd-yyyy");
					startDate = getAvailableBlankWeekids.at(z).get("StartDate").getTime()< startDate ? getAvailableBlankWeekids.at(z).get("StartDate").getTime() : startDate; ;//.format("mm-dd-yyyy");
					
					
				// }else{
					// availableWeekIds+= "|" + getAvailableBlankWeekids.at(z).get("Id");
				// }
			}
		}
	}
	
	 Ti.API.info("Syncing these weeks" + availableWeekIds);
	
	if(availableWeekIds != ""){
		
			Api.request({
				uri : "/QuadDay?weekIds=" + availableWeekIds,
				type : "GET",
				callback: function(rcvResponse){
				
				callsInProcess--;
				if(!(rcvResponse && rcvResponse.error)){
					
					
					
					var availableCalls  = Alloy.createCollection("call");
					
					availableCalls.fetch({
							query : "SELECT * FROM call WHERE WeekId IN ('"+availableWeekIds.replace(/(\||,)/g, "','")  + "')",
							source:"local", 
							silent:true
						});
						
					for (var y = availableCalls.length-1; y >= 0; y--){
						availableCalls.at(y).destroy({source:"local", silent:true});
					}
								
					var availableDays = Alloy.createCollection("day");
					availableDays.fetch({
							query : "SELECT * FROM day WHERE WeekId IN ('"+availableWeekIds.replace(/(\||,)/g, "','")  + "')",
							source:"local", 
							silent:true
						});
						
					for (var y = availableDays.length-1; y >= 0; y--){
						availableDays.at(y).destroy({source:"local", silent:true});
					}
					
				 	if (rcvResponse == null){
				 		rcvResponse = [];
				 	}
				 	
				 	//Process new information
				 	
					Api.request({
						uri : "/QuadWeek?startDate=" + new Date(startDate*1).format("mm-dd-yyyy")+ "&endDate="+new Date(endDate*1).format("mm-dd-yyyy"),
						type : "GET",
						callback: function(quadRcvResponse){
						callsInProcess--;
						if(!(quadRcvResponse && quadRcvResponse.error)){
							var tmpUserId =  App.user.get("Username");
							for(var c = 0; c < quadRcvResponse.length; c++){
									var tmpQuad = Alloy.createModel('quad');
									
									tmpQuad.set({
												Id : quadRcvResponse[c].Id,
											    Status:  quadRcvResponse[c].Status,
											    StartDate: quadRcvResponse[c].StartDate,
											    SalesGroup: quadRcvResponse[c].SalesGroup,
											    QuadIds : 		quadRcvResponse[c].QuadIds,
											    Objectives : 	 quadRcvResponse[c].Objectives,
											    ValidDayNumbers : quadRcvResponse[c].ValidDayNumbers,
											    UserId : 			tmpUserId,			    
										});
										tmpQuad.save(null,{
												source:"local", 
												silent:true
											});
											
											
								 
								  var existentPlan = Alloy.createCollection("planSentForApproval");
								  var tmpWeekOf = (new Date(tmpQuad.get("StartDate").getTime() - 86400000)).format("mm-dd-yyyy"); //-24hrs
								  existentPlan.fetch({
								  	query: "SELECT * FROM planSentForApproval WHERE WeekOf = '" + tmpWeekOf + "'",
								  	source: "local"
								  });
								  
								  if(existentPlan.length >0){
								  	existentPlan.at(0).set({
								  		Approved : quadRcvResponse[c].Status
								  	});
								  	existentPlan.at(0).save({source:"local"});
								  }else{
								  	
								  	var tmpPlan = Alloy.createModel("planSentForApproval");
								  	tmpPlan.set({
								  		WeekId: quadRcvResponse[c].Id,
								  		WeekOf: tmpWeekOf,
								  		ManagerComments:"Pending...",
								  		Approved: quadRcvResponse[c].Status
								  	});
								  	tmpPlan.save({
								  		source:"local",
								  		silent:"true"
								  	});
								  }
							}
							
						}else{
								Ti.API.info("Error getting quads data");
								App.loadingIndicator.hide(loads["sync"]);
							}
					 }
				});	
				 	
				 	
				 	
				 	for(var a = 0; a < rcvResponse.length ; a++){
				 		
				 		var tmpDay = Alloy.createModel("day",{
				 			
				 			DayOfWeek	: rcvResponse[a].DayOfWeek,
				 			//QuadId		: rcvResponse[a].QuadId || " ",
				 			WeekId		: rcvResponse[a].WeekId,
				 			CallRecIds	: rcvResponse[a].CallRecIds || []
				 			
				 		});
				 		
				 		
				 		 tmpDay.save(null,{
					 			 source:"local", 
					 			 silent: true,
				 			 });
				 			
			 			var calls = Alloy.createCollection("call");
			 			
						//Collections .add() funcitons were not behaving properly
						for(var k = 0; k < rcvResponse[a].Calls.length; k++){
							var tmpCall = Alloy.createModel("call",{
									RecId :  rcvResponse[a].Calls[k].RecId ,
								    TimeIn : rcvResponse[a].Calls[k].TimeIn ,
								    TimeOut : rcvResponse[a].Calls[k].TimeOut ,
								    Complete: rcvResponse[a].Calls[k].Complete ,
								    StopNumber: rcvResponse[a].Calls[k].StopNumber ,
								    StoreId : rcvResponse[a].Calls[k].StoreId ,
								    Comments: rcvResponse[a].Calls[k].Comments ,
								    Objectives : rcvResponse[a].Calls[k].Objectives ,
								    CallMadtop : rcvResponse[a].Calls[k].CallMadtop ,
								    Promos : rcvResponse[a].Calls[k].Promos ,
								    CallType : rcvResponse[a].Calls[k].CallType ,
								    WeekId : rcvResponse[a].WeekId ,
								    UnplannedCall : rcvResponse[a].Calls[k].UnplannedCall ,
								    DogDryLinearFeet: rcvResponse[a].Calls[k].DogDryLinearFeet ,
								    DogCanLinearFeet: rcvResponse[a].Calls[k].DogCanLinearFeet ,
								    CatDryLinearFeet: rcvResponse[a].Calls[k].CatDryLinearFeet ,
								    CatCanLinearFeet: rcvResponse[a].Calls[k].CatCanLinearFeet,
								    TreatsLinearFeet: rcvResponse[a].Calls[k].TreatsLinearFeet ,
								    CallDate: rcvResponse[a].Calls[k].CallDate , 
								    QuadId: rcvResponse[a].Calls[k].QuadId , 
							}); 
							tmpCall.save(null,{source:"local", silent:true});
						}
			 		
				 	}
				 	
				 	//Update sent plans if status is rejected
				 	
				 	var rejectedPlans = Alloy.createCollection("quad");
				 	rejectedPlans.fetch({ 
					 		query:  "SELECT Id FROM quad WHERE Status = 1",  //status :Rejected
					 		source: "local", 
					 		silent: true
				 		});
				 	
				 	
				 	for(var c = 0; c < rejectedPlans.length; c++){
					 		
								var getWeekCalls = Alloy.createCollection("call");
							 		getWeekCalls.fetch({ 
								 		query:  "SELECT * FROM call WHERE WeekId = '" + rejectedPlans.at(c).get("Id") + "'",  
								 		source: "local", 
								 		silent: true
							 		});
							 		

							 	
							 	var getPlannedWeek = Alloy.createCollection("planSentForApproval");
							 	getPlannedWeek.fetch({ 
							 		query:  "SELECT * FROM planSentForApproval WHERE WeekId = '"+ rejectedPlans.at(c).get("Id") + "'",  
							 		source: "local", 
							 		silent: true
						 		});
						 		
							 	var tmpManagerComments	= [];
							 	for(var x = 0; x  <  getWeekCalls.length ; x++){
							 		if ( getWeekCalls.at(x).get("Comments") != null){
							 			tmpManagerComments.push({
							 				StoreId: getWeekCalls.at(x).get("StoreId"),
							 				Comments: getWeekCalls.at(x).get("Comments")
							 			});
							 		}
							 	}	
							 	if(getPlannedWeek.length > 0){
							 		
							 		getPlannedWeek.at(0).set({
							 			ManagerComments : JSON.stringify(tmpManagerComments)
							 		});
							 		
							 		
							 		getPlannedWeek.at(0).save({
							 			source: "local",
							 			silent: true
							 		});
							 	}
							 	
						}	
				 
				 }else{
						App.loadingIndicator.hide(loads["sync"]);
					}
				}
			});
	}	
	if(callsInProcess <= 0){
			if(!loadingCatalogs)	{
				loadCatalogs();
			}

		}


}

function loadCatalogs(){
loadingCatalogs = true; //FIX THIS
 Ti.API.info("current calls"+callsInProcess);
			App.loadingIndicator.hide(loads["sync"]);
			callsInProcess = 0;
			
				var stores = Alloy.createCollection("store");
				loads["stores"] = App.loadingIndicator.show({
					message: "Stores"
				});
				
				callsInProcess++;
	// Ti.API.info("1calls in process store " +callsInProcess);
				stores.fetch({
					source: "remote",
					success: function(){
					var user	= App.user;

					stores.each(function(store){
						
						store.set({
							"UserId" : user.get("Username")
						});
					});
					stores.save({
						source: "local"
					});
					App.Stores.reload();
					
					
					callsInProcess--;	
					// Ti.API.info("1calls in process " +callsInProcess);
					if( callsInProcess <= 0   ){
						$.dashboard.sync({source: "local", updateSync : true});
						processInformationPopup();
					}
					
					App.loadingIndicator.hide(loads["stores"]);
				},
				error:function(rcvError){
					callsInProcess--;	
					if( callsInProcess <= 0   ){
						$.dashboard.sync({
							source: "local", 
							updateSync : true
						});
						processInformationPopup();
					}
					App.loadingIndicator.forceHide();
				}
		
				});
			
			var campaigns = Alloy.createCollection("campaign");
				loads["campaign"] = App.loadingIndicator.show({
					message: "Campaigns"
				});
				
				callsInProcess++;
				// Ti.API.info("1calls in process campaing " +callsInProcess);
				campaigns.fetch({
					source: "remote",
					success: function(){	
						
					campaigns.save({
						source: "local",
					});
					
					callsInProcess--;
					
	// Ti.API.info("2calls in process " +callsInProcess);
					if( callsInProcess <= 0   ){
						$.dashboard.sync({source: "local", updateSync : true});
						processInformationPopup();
					}
			
					App.loadingIndicator.hide(loads["campaign"]);
					
					},
					
					error:function(rcvError){
						callsInProcess--;						
						if( callsInProcess <= 0   ){
							$.dashboard.sync({
								source: "local", 
								updateSync : true
							});
						processInformationPopup();
						}
						App.loadingIndicator.forceHide();
					}
		
				});
			
		
			var salesQuad = Alloy.createCollection("salesQuad");
				loads["sales"] = App.loadingIndicator.show({
					message: "Sales Quad"
				});
				callsInProcess++;
				
				salesQuad.fetch({source:"local", silent:true, async:false});
				for(var gh = salesQuad.length; gh > 0; gh--){
					salesQuad.at(gh-1).destroy({
							source:"local",
							silent:true, 
							async:false
						}); 
				}
			
				
				//salesQuad.save({source:"local", silent: true});
				
					// Ti.API.info("1calls in process sales " + callsInProcess);
				salesQuad.fetch({
					source: "remote",
					success: function(){
					salesQuad.save({
						source: "local",
					});
					
					callsInProcess--;	
	// Ti.API.info("3calls in process " +callsInProcess);
					if( callsInProcess <= 0   ){
						$.dashboard.sync({
							source: "local", 
							updateSync : true
						});
						processInformationPopup();
					}
					App.loadingIndicator.hide(loads["sales"]);
					
					},
					
					error:function(rcvError){
						callsInProcess--;	
						if( callsInProcess <= 0   ){
						$.dashboard.sync({
							source: "local", 
							updateSync : true
						});
						processInformationPopup();
					}
					App.loadingIndicator.forceHide();
					}
		
				});
}

init();

function processInformationPopup(){
	loads["info"] = App.loadingIndicator.show({
					message: "Processing"
				});
 	setTimeout(function(){
 		$.dashboard.refreshScreen();
 		App.loadingIndicator.forceHide();
 		loadingCatalogs = false;
 	},7000);
}
