var App = require("/core");
var args = arguments[0] || {};
var call = args.call;
var store = args.store || Alloy.createModel("store");

exports.save = saveInformation;

// Ti.API.info(args.uiEnabled);
if(args && (args.uiEnabled != null) && !args.uiEnabled){
	$.container.touchEnabled = false;
}

function init () {
	
	var checkSavedComments = Alloy.createCollection("modifiedStore");
	checkSavedComments.fetch({
		query:"SELECT Comments FROM modifiedStore WHERE StoreId = '" + store.get("Id") + "'"
	});
	if(checkSavedComments.length > 0){
		loadComment(checkSavedComments.at(0).get("Comments"), $.storesList);
	}else{
		loadComment(store.get("Comments"), $.storesList);
	}
	
	
			
	if(call){

		loadComment(call.get("Comments"), $.callsList);
	
	} else {
		$.autoadjust.remove($.callComments);
		$.storeComments.applyProperties($.storeComments.full);
	}
}

function loadComment (comment, textArea) {
	comment = comment || "No Comments";
	textArea.value = comment;
}

function saveInformation(rcvModifiedCall){
	
	if(rcvModifiedCall != null ){
			rcvModifiedCall.set({
			alloy_id : rcvModifiedCall.get("alloy_id"),
	        Comments: $.callsList.value,
		});
		rcvModifiedCall.save();
		
		var modifiedStores = Alloy.createCollection("modifiedStore"); 
		modifiedStores.fetch({
			query: "SELECT * FROM modifiedStore WHERE StoreId = '" + rcvModifiedCall.get("StoreId") + "'"
		});
		
		var tmpStore;
		if(modifiedStores.length > 0){
			
			tmpStore = modifiedStores.at(0);
			
		}else{
			tmpStore = Alloy.createModel("modifiedStore",{
					StoreId : store.get("Id"),
					Name : store.get("Name"),
					Manager : store.get("Manager"),
					Contact : store.get("Contact"),
					Comments : store.get("Comments"),
					//Objectives : store.get("Objectives"),
					// CatDryLinearFeet : store.get("CatDryLinearFeet"),
					// CatCanLinearFeet : store.get("CatCanLinearFeet"),
					// DogDryLinearFeet : store.get("DogDryLinearFeet"),
					// DogCanLinearFeet : store.get("DogCanLinearFeet"),
					// TreatLinearFeet : store.get("TreatLinearFeet"),
			});
		}
		tmpStore.set({
			Comments : $.storesList.value.trim() || "No Comments",
		});
		tmpStore.save();
	}
		saveStoreInformation();
}

$.callsList.addEventListener("focus", function(){
	$.callsList.value = $.callsList.value.toLowerCase() != "no comments" ? $.callsList.value : "";
});

function saveStoreInformation(){
		var modifiedStores = Alloy.createCollection("modifiedStore"); 
		modifiedStores.fetch({
			query: "SELECT * FROM modifiedStore WHERE StoreId = '" + store.get("Id") + "'"
		});
		
		var tmpStore;
		if(modifiedStores.length > 0){
			
			tmpStore = modifiedStores.at(0);
			
		}else{
			tmpStore = Alloy.createModel("modifiedStore",{
					StoreId : store.get("Id"),
					Name : store.get("Name"),
					Manager : store.get("Manager"),
					Contact : store.get("Contact"),
					Comments : store.get("Comments"),

			});
		}
		tmpStore.set({
			Comments : $.storesList.value.trim() || "No Comments",
		});
		tmpStore.save();
}
exports.save = saveInformation;
init();