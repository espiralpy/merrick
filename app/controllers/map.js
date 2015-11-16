var App = require("/core");
var args = arguments[0] || {};
var defaultLocation = [];

$.open = function(){
	App.Index.navigationOpen($.window)
	loadStores();
};

function loadStores () {
	defaultLocation = [];
	receivedStores = [];
		
		for(var i = 0 ; i < args.stores.length ;i++){
			var store = args.stores[i].store;
			
			if(store.has("Latitude") && store.has("Longitude")){
				var pinNumber =  i < 10 ? (i+1) : "";
				$.map.addAnnotation({
				animate: true,
				image: "/numbered_pins/pin"+pinNumber+".png",
				latitude: store.get("Latitude"),
				longitude: store.get("Longitude"),
				title: store.get("Name"),
				subtitle: store.get("Address").get("Street1") + " " + store.get("Address").get("Zip")
			});
			if (defaultLocation.length < 1){
				defaultLocation.push(store.get("Latitude"));
				defaultLocation.push(store.get("Longitude"));
			}
			}
		}
		if(defaultLocation.length > 0){
			$.map.setLocation({
				animate: true,
				latitude: defaultLocation[0],
				longitude: defaultLocation[1],
				latitudeDelta: 0.05,
				longitudeDelta: 0.05
			});				
		}else{
			alert("No stores have location data defined");
		}
		
	
}


function goToDailyPlan(){
			App.goToDailyPlan = function(){
				//clear previous function
				;
			}
			$.window.close();
}

	
App.goToDailyPlan = function(){
	goToDailyPlan();
}