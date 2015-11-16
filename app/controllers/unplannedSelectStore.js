var App = require("/core");
var Api = require("/api");
var args = arguments[0] || {};
var stores = Alloy.createCollection("store");
var storesControllers = [];

var timers = null;
var notTyping = true;

$.open = function(){

	$.windowStores.open();
};

function init() {

	var load = App.loadingIndicator.show({
		message : "Stores"
	});

	$.closeBtn.addEventListener('click',function(){
		$.windowStores.close();
	});

	search("");

	$.textSearch.addEventListener("change", function(evt){


		if(timers == null){
			timers = setTimeout(function(){
				search($.textSearch.value);
				timers = null;
			},450);
		}


		notTyping = false;

	});

	App.loadingIndicator.hide(load);
}



function fetchStores () {

	stores.fetch({
		source : "local",
		data : {
		"UserId" : App.user.get("Username")
	},
	success : function(){
		App.loadingIndicator.hide(load);
		loadStores(stores);

	}
	});
}

function loadStores (stores) {
	storesControllers = [];
	var storesRows = [];

	stores.each(function(store){


		var selectStoreRow = Alloy.createController("unplannedSelectStoreRow", {
			store: store,
			callback: function(received){
			args.callback && args.callback(obtainSelectedStores());
			$.windowStores.close();
		}
		});

		storesControllers.push(selectStoreRow);
		storesRows.push(selectStoreRow.getView());


	});
	$.tableView.data = storesRows;
}

function search (text) {
	text = (text || "").trim();

	var stringCheck = text.split("'");
	if(stringCheck.length == 1){
		var result = Alloy.createCollection("store");
		result.fetch({
			query:"SELECT * FROM store WHERE Name LIKE '%" + text + "%' OR Address LIKE '%" + text + "%'", 
			source:"local", 
		}); 

		//$.basicSwitch.value = false;

		if(result.length > 0){
			loadStores(result);
		}
		else{
			var result = Alloy.createCollection("store");

			var rcvValues = text.split(" ");
			var customQuery = "SELECT * FROM store WHERE " ;

			for(var i = 0; i < rcvValues.length; i++){

				customQuery += " (Name LIKE '%" + rcvValues[i] + "%' OR Address LIKE " + "'%" + rcvValues[i] + "%')";

				if(i != rcvValues.length - 1){
					customQuery += " AND ";
				}

			}


			var result = Alloy.createCollection("store");
			result.fetch({query:customQuery , source:"local" }); 

			// $.basicSwitch.value = false;

			loadStores(result);
		}

	}else{
		alert("Single quotes ( ' ) are not a valid character\n\nPlease remove them to continue");
	}

}

function obtainSelectedStores () {
	var selected = [];
	for(var i in storesControllers){
		if(storesControllers[i].selected){
			selected.push(storesControllers[i]);
		}
	}
	return selected;
}



init();