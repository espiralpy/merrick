var App 	= require("/core");
var helpers = require("helpers");

//models singletons
var quad 	= Alloy.Models.instance("quad");
var days 	= Alloy.Collections.instance("day");
var calls 	= Alloy.Collections.instance("call");
var user	= App.user;
var quadStatus = 0;


//nested controllers
var lastSingleDay;
var dayRows = [];
var singleStores = [];
var loads = {};

//Time helpers
var sunday = helpers.nextSunday(new Date( (new Date()).getTime() - 7 * 24*60*60*1000));
var monday = new Date(sunday.getTime() + (24*60*60*1000));
var currentWeekOf  = sunday.format("mm-dd-yyyy");
var currentDayValue = (new Date()).getDay();

$.reload = function(params){
	params = params || {};
	sync({
		loadStores: params.loadStores || !user.has("LastSync"),
		loadCatalogs: params.loadCatalogs || !user.has("LastSync"),
		loadTimeData: params.loadTimeData || true,
		source: params.source || "both"
	});
};

$.selectDay = function(index){
	if(dayRows[index]){
		lastSingleDay && lastSingleDay.setSelected(false);
		lastSingleDay = dayRows[index];
		lastSingleDay.setSelected(true);
		currentDayValue = lastSingleDay.day.get("DayOfWeek");
		loadCalls(lastSingleDay.day);
	}else{
		if(index != 0){
			$.selectDay(0);
		}
	}
};

function init () {
	
	user.on("change", function(user, opts){
		var lastSync = user.get("LastSync");
		$.lastSync.text = lastSync ? lastSync.format("mm/dd/yyyy, h:MM TT") : "--/--/--";
		if(!user.has("Username")){
			quad.clear().set(quad.defaults);
			days.reset();
			calls.reset();
		}
	});
	
	quad.on("change:StartDate", function(){
		var start = quad.get("StartDate");

		if(start){
			quadStatus = quad.get("Status") || 0;
			$.currentWeek.text = start.format("mmmm yyyy");
			$.quadTitle.text = String.format( 
					L("labWeekof_str"), 
					start.format("mmmm dd"), 
					new Date(start.getTime() + 6 * 24 * 60 * 60 * 1000).format("dd"), 
					start.format("yyyy"), 
					helpers.wordSeparator(App.WEEK_STATUS[quadStatus] || "None")
					);
		} else {
			$.currentWeek.text = "";
			$.quadTitle.text = "";
		}
	});

	days.on("reset", loadDays);

	quad.on("change:ActualDate", function(model, day){
		if(user.has("Username")){
			sync({
				loadStores: false
			});
		}
	});



	$.masterView.addEventListener("click", function(evt){
		if(evt.index != null){
			$.selectDay(evt.index);
		}
	});
	
	$.stores.addEventListener("click", function(evt){
		var index = evt.source.index;

		if(index != null && evt.source.id != "stores" && singleStores[index] != null){
			var tmpDay = null;
			if(lastSingleDay && lastSingleDay.day){
				tmpDay = lastSingleDay.day;
			}
			var callDetail = Alloy.createController("callDetail", {
				call: singleStores[index].call,
				day: tmpDay,
				weekOf: currentWeekOf,
				planStatus: quadStatus,
				callback: function(){
					refreshScreen();
				}
			});
			callDetail.open();
		}
	});
	
	$.back.addEventListener("click", function(){
			goToPreviousQuad();
	});
	$.next.addEventListener("click", function(){
			goToNextQuad();
	});
	$.map.addEventListener("click", function(){
		var map = Alloy.createController("map" , { "stores" : singleStores} );
		map.open({
			stores: calls
		});
	});

	// $.buildN.text = 41;
}

function loadDays () {
	
	days.sort({
		silent: true
	});
	
	
	var weekRows = [];
	dayRows = [];
	
	
	var thisWeekDays = [];
	var existentDays = [];
	days.each(function(day, index){   
			thisWeekDays.push(day);
			existentDays.push(day.get("DayOfWeek"));
	});
	
	
	var unplannedCallCheck = Alloy.createCollection("unplannedCall");
	unplannedCallCheck.fetch({ 
		query:"SELECT DISTINCT WeekDay FROM unplannedCall WHERE WeekOf = '"+ currentWeekOf+"'"
	});
	for(var y = 0; y  < unplannedCallCheck.length; y++){
		
		if(existentDays.indexOf(unplannedCallCheck.at(y).get("WeekDay")) == -1){
			var unplannedDay = Alloy.createModel("day");
			unplannedDay.set({
				DayOfWeek: unplannedCallCheck.at(y).get("WeekDay"),
			});
			
			thisWeekDays.push(unplannedDay);
			existentDays.push(unplannedDay.get("DayOfWeek"));			
		}

	}
	
	
	for(var x = 0; x < thisWeekDays.length; x++){
		
			var dayRow = Alloy.createController("dayRow", {
				day: thisWeekDays[x]
			});
			dayRows.push(dayRow);
			weekRows.push(dayRow.getView());
	}
	
	// Ti.API.info("step loaddays4");
	$.week.data = weekRows;
	
	if(currentDayValue != null){
		$.selectDay(  existentDays.indexOf(currentDayValue));
	}else{
		$.selectDay(0);
	}
	
}

function loadCalls (day) {
	
	var dayCalls = Alloy.createCollection("call");
	
	_.each(day.get("CallRecIds"), function(callId){
		
		dayCalls.add(calls.get(callId));
	});
	
	dayCalls.sort({
		silent: true
	});
	singleStores = [];
	var todayPlannedCalls = [];
	for (var i = 0; i < dayCalls.length; i++){

	var checkModifiedCall = Alloy.createCollection("modifiedCall");
		checkModifiedCall.fetch({query: "SELECT * FROM modifiedCall WHERE RecId = '" + dayCalls.at(i).get("RecId") + "'"});

			if(checkModifiedCall.length > 0){
			//Possibly making double assignment work here, will check to improve performance.
			
					dayCalls.at(i).set({
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
				
				
				
		todayPlannedCalls.push(dayCalls.at(i));
	}

	//To this point, the planned calls have been added, now its time to input old calls and unplanned calls


	loadUnplannedCalls(todayPlannedCalls);

}

function parseObjectives(rcvJSON){
	
	
	var jsonObjectives = JSON.parse(rcvJSON);	
	var tmpCollection = new Backbone.Collection();

	for(var z = 0; z < jsonObjectives.length ; z++  ) 
	{

		var tmpObjective = new Backbone.Model();

		tmpObjective.set({
			"DistributionSalesValue" : jsonObjectives[z].DistributionSalesValue || 0.0,
			"RetailSalesValue" 				: jsonObjectives[z].RetailSalesValue || 0.0,
			"Description"		: jsonObjectives[z].Description || null,
			"ResponsibleParty"  : jsonObjectives[z].ResponsibleParty || null,
			"Quantity" 			: jsonObjectives[z].Quantity || null,
			"DueDate" 			: jsonObjectives[z].DueDate || null
		});
		tmpCollection.add(tmpObjective);

	}	
	return tmpCollection;
}


function insertUnplannedCalls(){

	for(var i = 0; i < singleStores.length ; i++){
		
		// UNCOMMENT BELOW TO GET STOP NUMBERS IN SEQUENTIAL ORDER - WILL AFFECT PRIMARY KEY ON THE WS
		
		// singleStores[i].call.set({
			// StopNumber : i+1
		// })
		wrapper.add(singleStores[i].getView());
	}

}
function sync (params) {
	

	params = params || {};
	
	var loadStores = params.loadStores || false;
	var loadCatalogs = params.loadCatalogs || false;
	var loadTimeData  =  params.loadTimeData || true;
	var source = "local";
	var updateSync = false;
	if(Ti.Network.online){
		 source = params.source || "both";  
		 updateSync = params.updateSync || false;
			if(updateSync || (user.get("LastSync") == null)){
			updateLastSync(null);
		}
	}
	
	loads = {};
	if(loadStores){
		
		var stores = Alloy.createCollection("store");
		loads["stores"] = App.loadingIndicator.show({
			message: "Stores",
			onHide: loadDays
		});
		stores.fetch({
			success: function(){
			stores.each(function(store){
				store.set({
					"UserId" : user.get("Username")
				});
			});
			stores.save({
				source: "local"
			});
			App.Stores.reload();
			App.loadingIndicator.hide(loads["stores"]);
		},
		error:function(rcvError){
			//Ti.API.info("Error: " + rcvError);
			App.loadingIndicator.forceHide();
		}

		});
	}
   if(loadCatalogs){
	var campaigns = Alloy.createCollection("campaign");
		loads["campaign"] = App.loadingIndicator.show({
			message: "Campaigns"
		});
		campaigns.fetch({
			source: source,
			success: function(){
				
			campaigns.save({
				source: "local",
			});
			
	
			App.loadingIndicator.hide(loads["campaign"]);
			
			},
			
			error:function(rcvError){
				App.loadingIndicator.forceHide();
			}

		});
	

	var salesQuad = Alloy.createCollection("salesQuad");
		loads["sales"] = App.loadingIndicator.show({
			message: "Sales Quad"
		});
		if(source == "remote"){
			salesQuad.fetch({source:"local", silent:true, async:false});
			for(var gh = salesQuad.length; gh > 0; gh--){
				salesQuad.at(gh-1).destroy({
						source:"local",
						silent:true, 
						async:false
					}); 
			}
			
			//salesQuad.save({source:"local", silent: true});
		}
		salesQuad.fetch({
			source: source,
			success: function(){
				
			App.loadingIndicator.hide(loads["sales"]);
			salesQuad.save({
				source: "local",
			});
			
	
			
			},
			
			error:function(rcvError){
				App.loadingIndicator.forceHide();
			}

		});
	}

	if(loadTimeData){
		loads["week"] = App.loadingIndicator.show({
			message: "Quad",
			onHide : loadStores ? null : loadDays
			}); 
		
		quad.fetch({
			source: source,
			success: function(e){
				
		// Ti.API.info(currentWeekOf+"<- currentWeekOff E(Fetch) quadStartDate->" + quad.get("StartDate"));

				
		if((currentWeekOf == new Date(e.get("StartDate").getTime() - 86400000).format("mm-dd-yyyy")) ){
				
			//Ti.API.info(currentWeekOf+"<- currentWeekOff F(IF) quadStartDate->" + JSON.stringify(quad));
					//Clearing up days with no information
					var plansSentForApproval = Alloy.createCollection("planSentForApproval");
					
					plansSentForApproval.fetch({query:"SELECT * FROM planSentForApproval WHERE WeekId = '"+ quad.get("Id")  +"'"});				
					if(plansSentForApproval.length > 0){
						plansSentForApproval.at(0).set({
							Approved : quad.get("Status"),
						});
						
					// Ti.API.info("OLD plan");
						plansSentForApproval.at(0).save();
					}else{
						
					//Ti.API.info("NEW plan " + quad.get("Id"));
						var newPlan = Alloy.createModel('planSentForApproval',{
							Approved : quad.get("Status"),
							WeekId :   quad.get("Id"),
							WeekOf			: currentWeekOf,
							ManagerComments   : "Pending...", 
						});
						newPlan.save();
					}
					
					
				
			}else{
				quad.set({
					"Id" :  "-1"
				});
				
			}
				
				
				
				
							loads["days"] = App.loadingIndicator.show({
								message: "Days"
							});

								//Ti.API.info("Current quad: " + quad.get("Id"));
							days.fetch({
								source: source,
								data: {
									weekId: quad.get("Id")
								},
								success: function(){
					
								
					
					

								
								// Ti.API.info("step load calls");
								if(sunday.format("dd-mm-yyyy") != currentWeekOf){ //We verify the week has changed
									//alert("moving");
									loads["calls"] = App.loadingIndicator.show({
										message: "Calls"
									});
									 calls.fetch({
											source: source,
											data: {
											weekId: quad.get("Id")
										},
										success: function(){
											calls.each(function(call){
												call.set({
													"WeekId" : quad.get("Id")
												});
											});
											calls.save({
												source: "local"
											});
											App.loadingIndicator.hide(loads["calls"]);
											if(($.storesWrapper.children.length  == 0) && ($.week.data.length == 0)){
												
												loadUnplannedCalls([]);
												
											}
							
										},
										error:function(rcvError){
											//Ti.API.info("The Error " + rcvError);
											App.loadingIndicator.forceHide();
										}
										});
										
								}else{					
									loadUnplannedCalls([]);
								}
				
								days.save({
									source: "local"
								});
								App.loadingIndicator.hide(loads["days"]);
								
								
								
							},
							error:function(rcvError){
								if(rcvError && rcvError.error){
									alert(rcvError.error);	
								}
								App.loadingIndicator.hide(loads["week"]);
								App.loadingIndicator.hide(loads["days"]);
							}
							});
			
			

			
			
			if(quad.get("Id") != "-1" ){
				quad.save({
					"UserId" : user.get("Username")
				}, {
					source: "local"
				});	
			}
			
			App.loadingIndicator.hide(loads["week"]);
	
	
		},
		error:function(rcvError){
			// Ti.API.info("Error" + JSON.stringify(rcvError));
			 App.loadingIndicator.hide(loads["week"]);
		}
		});			
	}
		
	
	var dataLastSync = user.get("LastSync") || new Date();

	if( 
			(!Ti.App.Properties.hasProperty("callTypes"))  
			||
			(((new Date()).getTime() - dataLastSync.getTime() ) > 14 * 24 * 60 * 60 * 1000)

			){
				
		refreshValuesFromWS();
	}
	
	

}

function loadUnplannedCalls(todayPlannedCalls){
	var wrapper = Ti.UI.createView($.content.stores);
	var todayUnplannedCalls  = Alloy.createCollection("unplannedCall");

	todayUnplannedCalls.fetch({query: "SELECT * FROM unplannedCall WHERE IsDraft = 0 AND WeekDay = " + currentDayValue  + " AND WeekOf = '" + currentWeekOf + "'" });
	

		
	for(var x = 0; x < todayUnplannedCalls.length; x++){



	    var allObjectives = todayUnplannedCalls.at(x).get("Objectives") ||  new Backbone.Collection();	

		var tmpCall = Alloy.createModel("unplannedCall", {
			RecId : "-1",
			StopNumber: todayUnplannedCalls.at(x).get("StopNumber") ,
			WeekId : "-1",
			StoreId : todayUnplannedCalls.at(x).get("StoreId") ,
			Objectives : allObjectives || new Backbone.Collection(),
			CallType : todayUnplannedCalls.at(x).get("CallType") ,
			WeekDay : todayUnplannedCalls.at(x).get("WeekDay") ,
			UnplannedCall : true,
			Complete : todayUnplannedCalls.at(x).get("Complete")
		})


		//
		for(var k = 0;  k < todayPlannedCalls.length ; k++){
			if(todayPlannedCalls[k].get("StopNumber") >= todayUnplannedCalls.at(x).get("StopNumber") ){
				todayPlannedCalls.splice( k , 0 , tmpCall);
				k = todayPlannedCalls.length;
			}
			else{
				if(k == todayPlannedCalls.length-1){
					todayPlannedCalls.push(tmpCall);
					k++;
				}
			}
		}
		if(todayPlannedCalls.length == 0){
			todayPlannedCalls.push(tmpCall);
		}
		
		//old method
		// if(todayPlannedCalls.length >= todayUnplannedCalls.at(x).get("StopNumber") ){
			// todayPlannedCalls.splice( todayUnplannedCalls.at(x).get("StopNumber") - 1 , 0 , tmpCall);
		// }else{
			// todayPlannedCalls.push(tmpCall);
		// }
	}


	for(var i = 0; i < todayPlannedCalls.length ; i++){
		
		//UNCOMMENT FOR SEQUENTIAL NUMBER DISPLAY
		
		// todayPlannedCalls[i].set({
			// StopNumber: i+1
		// });
		
		var singleStore = Alloy.createController("store", {
			call: todayPlannedCalls[i],
			index: i
		});				
		singleStores.push(singleStore);
		wrapper.add(singleStores[i].getView());
	}

	$.stores.remove($.storesWrapper);
	$.storesWrapper = wrapper;
	$.stores.add($.storesWrapper);
	
	
}

function updateLastSync (lastSync) {
	
	lastSync = lastSync || new Date();
	user.set({
		"LastSync" : lastSync
	});
	user.save(null, {
		source: "local"
	});
	
}

$.unplannedCall.addEventListener('click', function(){
	var unplannedCallView = Alloy.createController("unplannedCall" , { 
		callback: function(){
			refreshScreen();
		},
		currentWeekId : quad.get("Id")
	});
	
	unplannedCallView.open({
		moreArgs: "args"
	});
}); 

function refreshValuesFromWS(){

	loads["catalogs"] = App.loadingIndicator.show({
		message: "Catalogs"
	});
	var today = new Date();
	var Api = require("api");
	if(Ti.Network.online){
		
		App.reloadCatalogs();

	}
	App.loadingIndicator.hide(loads["catalogs"]);
}

function saveQuadWeekInformation(rcvResponse){

	var tmpModel = Alloy.createModel('quadWeek',{ 
		Id				: 	rcvResponse.Id,
		SalesGroup		:   rcvResponse.SalesGroup,
		QuadIds			:	JSON.stringify(rcvResponse.QuadIds),
		StartDate		:	rcvResponse.StartDate,
		Status			:   rcvResponse.Status,
		ValidDayNumbers :	JSON.stringify(rcvResponse.ValidDayNumbers),
	});


	tmpModel.save();
}


function refreshScreen(){
 sync({source:"local"});
 
 	quadStatus = quad.get("Status") || 0;
 	$.quadTitle.text = String.format( 
		L("labWeekof_str"), 
		monday.format("mmmm dd"), 
		new Date(monday.getTime() + 6 * 24 * 60 * 60 * 1000).format("dd"), 
		monday.format("yyyy"), 
		helpers.wordSeparator(App.WEEK_STATUS[quadStatus] || "")
		);

}

init();
function goToNextQuad(){
		var moveQuad  = true;
		sunday = helpers.nextSunday(monday);
		monday = new Date(sunday.getTime() + (24*60*60*1000));
		//Ti.API.info(currentWeekOf+"<- currentWeekOff A quadStartDate->" + quad.get("StartDate"));
		if(currentWeekOf !=sunday.format("mm-dd-yyyy") ){
		currentWeekOf=sunday.format("mm-dd-yyyy");
		}else{
			moveQuad = false;
		}
		
		//Ti.API.info(currentWeekOf+"<- currentWeekOff B quadStartDate->" + quad.get("StartDate"));
		
	$.quadTitle.text = String.format( 
		L("labWeekof_str"), 
		monday.format("mmmm dd"), 
		new Date(monday.getTime() + 6 * 24 * 60 * 60 * 1000).format("dd"), 
		monday.format("yyyy"), 
		"" // helpers.wordSeparator(App.WEEK_STATUS[quadStatus] || "")
		);
	
		$.storesWrapper.children = [];
		$.week.data = [];
		if(moveQuad){
			quad.walkQuad(1);
		}
}
function goToPreviousQuad(){
		var moveQuad  = true;
		sunday = helpers.nextSunday(new Date( monday.getTime() - (8 * 24 * 60 * 60 * 1000) ));
		monday = new Date(sunday.getTime() + (24*60*60*1000));
			
		//Ti.API.info(currentWeekOf+"<- currentWeekOff -A quadStartDate->" + quad.get("StartDate"));
		if(currentWeekOf !=sunday.format("mm-dd-yyyy") ){
		currentWeekOf=sunday.format("mm-dd-yyyy");
		}else{
			moveQuad = false;
		}
		
		//Ti.API.info(currentWeekOf+"<- currentWeekOff -B quadStartDate->" + quad.get("StartDate"));
		
		
	$.quadTitle.text = String.format( 
		L("labWeekof_str"), 
		monday.format("mmmm dd"), 
		new Date(monday.getTime() + 6 * 24 * 60 * 60 * 1000).format("dd"), 
		monday.format("yyyy"), 
		"" //helpers.wordSeparator(App.WEEK_STATUS[quadStatus] || "")
		);
	
	
	
		$.storesWrapper.children = [];
		$.week.data = [];
		if(moveQuad){
			quad.walkQuad(-1);
		}
}
$.content.addEventListener("swipe", function(e){
	if(e.direction == "left"){
			goToNextQuad();
	}else{
		if(e.direction == "right"){
			goToPreviousQuad();
		}
	}
});

$.currentWeek.addEventListener("click",function(){
	refreshScreen();
});

exports.quad = quad;
exports.sync = sync;
exports.updateLastSync = function(){
	updateLastSync();
};
exports.refreshScreen = refreshScreen;
