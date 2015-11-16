
var App = require("core");
App.Stores = $;
var stores = Alloy.createCollection("store");
var storeRows = [];
var timers = null; 

var modifiedStores = [];

$.reload = function(){
	stores.fetch({
		source: "local",
		data: {
			"UserId" : App.user.get("Username")
		}
	});
};

function init () {
	
    var checkModifiedStore = Alloy.createCollection("modifiedStore");
	checkModifiedStore.fetch({query: "SELECT * FROM modifiedStore"});
	for(var i = 0 ; i < checkModifiedStore.length; i++){
		modifiedStores.push(checkModifiedStore.at(i).get("StoreId"));
	}
	stores.on("reset", repaint);
	$.tableView.addEventListener("click", function(evt){
		evt.detail && openStoreDetail(evt.index);
	});
	
	$.textSearch.addEventListener("change", function(evt){

		if(timers == null){
			timers = setTimeout(function(){
	   			search($.textSearch.value);
				timers = null;
				},450);
		}
	});
}

function search (text) {
	
	text = (text || "").trim();
	var stringCheck = text.split("'");
	if(stringCheck.length == 1){
		var result = Alloy.createCollection("store");
		result.fetch({query:"SELECT * FROM store WHERE Name LIKE '%" + text + "%' OR Address LIKE '%" + text + "%'", source:"local" }); 
		if(result.length > 0){
				repaint(result);
		}
		else{
				result = Alloy.createCollection("store");
				
				var rcvValues = text.split(" ");
				var customQuery = "SELECT * FROM store WHERE " ;
				
				for(var i = 0; i < rcvValues.length; i++){
					
					customQuery += " (Name LIKE '%" + rcvValues[i] + "%' OR Address LIKE " + "'%" + rcvValues[i] + "%')";
	
					if(i != rcvValues.length - 1){
						customQuery += " AND ";
					}
					
				}
				
				// Ti.API.info("Received query " + customQuery);
				var result = Alloy.createCollection("store");
				result.fetch({query:customQuery , source:"local" }); 
					
				repaint(result);
	 		}
	}else{
		alert("Single quotes ( ' ) are not a valid character\n\nPlease remove them to continue");
	}
	
	
}

function repaint (collection) {
	storeRows = [];
	var rows = [];
	collection.each(function(store){
		    

		var storeRow = Alloy.createController("storeRow", {
			store: store
		});
		
		rows.push(storeRow.getView());
		storeRows.push(storeRow);
	});
	$.tableView.data = rows;
}

function openStoreDetail (index) {
	var storeDetail = Alloy.createController("storeDetail", {
		store : storeRows[index].store
	});
	storeDetail.open();
}


//LISTENERS

init();