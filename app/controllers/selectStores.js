var App = require("/core");
var Api = require("/api");
var args = arguments[0] || {};
var stores = Alloy.createCollection("store");
var storesControllers = [];
var quads = {};
var storesQuad = {};
var notTyping = true;
var showSelectedStoresValue;
stores.on("reset", loadStores);
var timers = null;
var lastQuery = "";

$.open = function(){
    $.windowStores.open();
    fetchStores();
    
	

};

function init() {
    $.closeBtn.addEventListener('click',function(){
        $.windowStores.close();
    });
    $.btnDone.addEventListener("click", function(){
        args.callback && args.callback(obtainSelectedStores());
        $.windowStores.close();
    });
    $.viewQuad.addEventListener("click", function(evt){
        var state = $.viewQuad.value = !$.viewQuad.value;
        $.viewQuad.backgroundColor = state ? $.viewQuad.backgroundSelectedColor : $.viewQuad.backgroundNormalColor;
        selectAll($.viewQuad.value);
    });
    $.viewShow.addEventListener("click", function(){
        var rows = [{
            title : "All",
            data : false
        }];
        _.each(quads, function(active, name){
            active && rows.push({
                title : name,
                data : name
            });
        });
        var popover = Alloy.createController("popover", {
            title : "Select Quad",
            rows : rows,
            callback : function(quad, name){
                $.quad.text = name;
                fetchStores(quad);
            }
        });                                     
        popover.open($.viewShow);
    });
    
    $.textSearch.addEventListener("change", function(evt){

		if(timers == null){
			timers = setTimeout(function(){
	   			search($.textSearch.value);
				timers = null;
				},450);
		}
 
   });
    $.basicSwitch.addEventListener("change", function(evt){
    	showSelectedStoresValue = evt.value;
        showSelectedStores(evt.value);
    });
}
function fetchStores (quadId) {
    var load = App.loadingIndicator.show({
        message : "Quads Stores"
    });
    stores.fetch({
        source : "local",
        data : {
            "UserId" : App.user.get("Username")
        },
        success : function(){
            var salesQuads = Alloy.createCollection("salesQuad");
            salesQuads.fetch({
                source : "both", 
                data : {
                    "UserId" : App.user.get("Username"),
                    "QuadId" : quadId || null
                },
                success : function(){
                    salesQuads.each(function(salesQuad){
                        storesQuad["'" + salesQuad.get("StoreId") + "'"] = salesQuad.get("QuadId");
                        var store = stores.get(salesQuad.get("StoreId"));
                        store && store.set({
                            "QuadId" : salesQuad.get("QuadId") ,
                            "DayOfWeek" : salesQuad.get("DayOfWeek"),
                            "StopNo" : salesQuad.get("StopNo")
                        });
                        
                        
                        
                        salesQuad.set({
                            "UserId" : App.user.get("Username")
                        });
                        if(!quadId){
                            quads[salesQuad.get("QuadId")] = true;
                        }
                    });
                    if(quadId){
                            realStores = stores.filter(function(store){
                            return ( store.has("QuadId") && (store.get("QuadId") == quadId)) ;
                        });
                    if($.textSearch.getValue() != ""){
		                    search($.textSearch.value);
		                }
		                else{
                        stores.reset(realStores);
		                	
		                }
                    } else {
                        stores.reset(stores.sortBy(function(store){
                            return store.get("QuadId");
                        }));
                    }
                    salesQuads.save({
                        source : "local"
                    });
                    

                    App.loadingIndicator.hide(load);
                },
                error:function(){
                	Ti.API.info("Could not load QUAD information");
                	 App.loadingIndicator.hide(load);
                }
            });
        }
    });
}

function loadStores (stores) {
    // Ti.API.info("Last query: " + lastQuery);

    storesControllers = [];
    var storesRows = [];
    
    stores.each(function(store){
        
        if(storesQuad["'" + store.get("Id") + "'"] != null){
            store.set({
            QuadId : storesQuad["'" + store.get("Id") + "'"]
            });
        }

        if( ($.quad.text =="All" )  || (store.get("QuadId") == $.quad.text) ){

    		
    		
            var selectStoreRow = Alloy.createController("selectStoreRow", {
                store: store,
                callback: function(){
                	showSelectedStores(showSelectedStoresValue);
                }
            });
            var notAdded = true;
            for(var i = 0; i< args.previouslySelectedStores.length; i++){
                if( args.previouslySelectedStores[i].store.get("Id") == selectStoreRow.store.get("Id") ){
                    notAdded = false; 
                    selectStoreRow.selected = true;
                    i = args.previouslySelectedStores.length;
                }
                
            }
            if(notAdded){
                storesControllers.push(selectStoreRow);
                storesRows.push(selectStoreRow.getView());
            }
        }         
    

    });
    $.tableView.data = storesRows;
}

function search (text) {
	// Ti.API.info("Searching: "+text);
    text = (text || "").trim();
    
    var stringCheck = text.split("'");
    if(stringCheck.length == 1){
        var result = Alloy.createCollection("store");
        result.fetch({
            query:"SELECT * FROM store WHERE Name LIKE '%" + text + "%' OR Address LIKE '%" + text + "%'", 
            source:"local", 
        }); 
        
        $.basicSwitch.value = false;
        
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
                
                $.basicSwitch.value = false;
                loadStores(result);
        }

    }else{
        alert("Single quotes ( ' ) are not a valid character\n\nPlease remove them to continue");
    }
        
}

function showSelectedStores (state) {
    var rowStoresToLoad;
    if(state){
        rowStoresToLoad = obtainSelectedStores();
    } else {
        rowStoresToLoad = storesControllers;
    }
    var rows = _.map(rowStoresToLoad, function(rowStore){
        return rowStore.getView();
    });
    $.tableView.data = rows;
}

function obtainSelectedStores () {
    var selectedCollection = new Backbone.Collection();
    
    selectedCollection.comparator = function(store) {
									  return store.get("DayOfWeek") + "" + store.get("StopNo");
									};
    
    for(var i in storesControllers){
        if(storesControllers[i].selected){
            selectedCollection.add(storesControllers[i].store);
        }
    }
    selectedCollection.sort();
    
    return selectedCollection;
}

function selectAll (state) {
    _.each(storesControllers, function(controllers){
        controllers.setSelected(state);
    });
    showSelectedStores(showSelectedStoresValue);
}

init();