var App = require("/core");
var helpers = require("helpers");
var args = arguments[0] || {};
var startDate = args.startDate || helpers.nextSunday(new Date());

args.uiEnabled = args.uiEnabled || false;	

function disableInterfase(){
	args.uiEnabled = false;
	$.comments.touchEnabled = false;
	$.deleteBtn.enabled = false;
	
}

if(!args.uiEnabled){
	disableInterfase();
}

defaultCall = [];

defaultCall.push(8);
defaultCall.push(1);
defaultCall.push(3);
defaultCall.push(7);
defaultCall.push(1);

$.store = args.store || new Alloy.createModel("store");
$.call = args.dbCall || Alloy.createModel("call", {
	"StoreId" : $.store.id,
	"DayOfWeek" : $.store.get("DayOfWeek") || 1,
	"StopNumber" : $.store.get("StopNo") || 1,
	"CallType" : defaultCall[$.store.get("Type")] || 8,
});

if($.call.get("QuadId")){
	$.quads.text = $.call.get("QuadId");
	$.store.set("QuadId",$.call.get("QuadId"));
}

if(!args.dbCall){
	$.call.set({
		"CallDate" : new Date(startDate.getTime() + $.call.get("DayOfWeek") * 24 * 60 * 60 * 1000),
	});
}
else{
	if(args.dbCall.get("CallType") || (args.dbCall.get("CallType") == 0) ){
		$.callType.text = App.CALL_TYPE[args.dbCall.get("CallType")];
	}else{
		$.call.set({
			"CallType": 8
		});
	}
}


$.store.on("change", repaint);
$.store.get("Objectives").on("add", repaint);
$.store.get("Objectives").on("remove", repaint);
$.rowView.index = args.index;

function repaint() {
	$.quads.text = $.store.get("QuadId");
	$.namesdesc.text = $.store.get("Name");
	$.callType.text = App.CALL_TYPE[$.call.get("CallType")];
	$.day.text = $.call.get("CallDate").format("ddd dd") + " (" + $.call.get("DayOfWeek") + ")";
	$.stops.text = $.store.get("StopNo") || $.store.get("StopNumber") || 1 ;
	$.objectives.text = $.store.get("Objectives").length;
	$.comments.value = $.call.get("Comments");
}

repaint();

$.comments.addEventListener('blur', function(){
	if($.comments.getValue() != ""){
		$.call.set({
			"Comments" : $.comments.value,
		});
	}
});

$.rowView.addEventListener("click", function(evt){
	var action = evt.source.action;
	if(action){
	if(args.uiEnabled ||( action == "addObjective")){
				switch(action){
				case "type":
					var rows = [];
	
				for(var i = 0; i< App.CALL_TYPE_MAP[$.store.get("Type")].length; i++){ 
					rows.push({
						title: App.CALL_TYPE[App.CALL_TYPE_MAP[$.store.get("Type")][i]],
						data:  App.CALL_TYPE_MAP[$.store.get("Type")][i]
					});
				}
	
	
				var popover = Alloy.createController("popover", {
					rows: rows,
					title: L("select_call_type_str"),
					callback: function(rcvCallType, title){
						$.callType.text = title;
						// Ti.API.info("received call type " +  rcvCallType);
						$.call.set({
							"CallType" : rcvCallType
						});
					}
				});
				popover.open($.callType);
				break;
			case "date":
				var rows = [];
				for(var i = 1; i <= 7; i++){
					var day = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
					rows.push({
						title: day.format("dddd dd") + " (" + i + ")",
						data: i,
						value: day
					});
				}
				var popover = Alloy.createController("popover", {
					rows: rows,
					title: L("select_date_str"),
					callback: function(dayNumber, title, value){
						$.day.text = value.format("ddd dd") + " (" + dayNumber + ")";
						//var myCallDate = new Date(startDate.getTime() + ( *24*60*60*1000));
						$.call.set({
							"DayOfWeek" : dayNumber,
							"CallDate" : new Date(startDate.getTime() + dayNumber * 24 * 60 * 60 * 1000),
							//"CallDate" : 
						})
					}
				});
				popover.open($.day);
				break;
			case "stop":
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
						$.stops.text = title;
						$.call.set({
							"StopNumber" : stop
						});
					}
				});
				popover.open($.stops);
				break;
			case "addObjective":
				var objectivesPopup = Alloy.createController("objectivesPopup", {
					store : $.store,
					uiEnabled : args.uiEnabled,
					callDate: $.call.get("CallDate")
				});
				objectivesPopup.open();
		}
	}

}


});

exports.disableInterfase = disableInterfase;