var App = require("/core");
var args = arguments[0] || {};

function repaint () {
	var address = $.store.get("Address");
	$.stop.text 		= "" + ($.call.get("StopNumber") || 0);
	$.storeName.text 	= $.store.get("Name");
	$.address.text 		= $.store.get("Address", { full : true });
	$.zip.text 			= address ? address.get("Zip") : "";
	$.phone.text 		= $.store.get("Phone");
	$.quadLbl.text 		= $.store.get("Manager");
	$.container.callId 	= $.call.get("RecId");
}



$.call = args.call || {};
$.container.index = args.index;

// Ti.API.info("CALL INFORMATION: " + JSON.stringify($.call));

if($.call.get("UnplannedCall") == true){
	$.ucBookMark.opacity = 1.0;
}
if($.call.get("Complete") == true){
	$.complete.opacity = 1.0;
}

$.store = Alloy.createModel("store", {
	"Id" : $.call.get("StoreId") || "-1"
});

$.store.on("change", repaint);
$.call.on("change", repaint);

$.call.on("change:StoreId", function(){
	$.store.set({
		"Id" : $.call.get("StoreId")
	}).fetch({
		source: "local"
	});
});

$.store.fetch({
	source: "local"
});