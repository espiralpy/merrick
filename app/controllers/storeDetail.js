var App = require("core");
var args = arguments[0] || {};
var tabs = {};
var contentTab;
var lastButton;
$.store = args.store || Alloy.createModel("store");

$.open = function(){
	App.Index.navigationOpen($.window)
	loadStoreMap();
};

function init () {
	loadTab("comments");
	$.tabs.addEventListener("click", tabEvent);
	repaint();

}

function repaint () {
	$.storeName.text = $.store.get("Name");
	$.address.text = $.store.get("Address", {full: true});
	$.zip.text = $.store.has("Address") ? $.store.get("Address").get("Zip") : "";
	$.phone.text = $.store.get("Phone");
}

function tabEvent (evt) {
	var id = evt.source.id;
	if(id){
		loadTab(id);
	}
}

function loadTab(name){
	if(contentTab){
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
			store: $.store
		});
	}
	contentTab = tabs[name];
	if(name == "objectives"){
		$.save.enabled = false;
	}else{
		$.save.enabled = true;
	}
	$.content.add(contentTab.getView());
}
function loadStoreMap (){
	
	if(!args.store){
		return;
	}
	
	//Ti.API.info(JSON.stringify(args.store));
	var store = args.store;
	$.map.addAnnotation({
		animate: true,
		latitude: args.store.get("Latitude"),
		longitude: args.store.get("Longitude"),
		pincolor: Ti.Map.ANNOTATION_RED,
		title: store.name,
		subtitle: store.address + " " + store.zip
	});
	
	
	$.map.setLocation({
		animate: true,
		latitude: args.store.get("Latitude"),
		longitude: args.store.get("Longitude"),
		latitudeDelta: 0.05,
		longitudeDelta: 0.05
	});
}

$.save.addEventListener("click",function(){
	if(contentTab){
		contentTab.save();
	}
});

init();