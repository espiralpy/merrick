/**
 * Main app singleton
 * @type {Object}
 */
var App = {
	/**
	 * Sets up the app singleton and all it's child dependencies
	 * NOTE: This should only be fired in index controller file and only once.
	 */
	init: function() {
		
		Ti.include("/date.format.js");
		Ti.Network.addEventListener("change", App.networkObserverUpdate);
		Ti.App.addEventListener("pause", App.pause);
		Ti.App.addEventListener("close", App.exit);
		Ti.App.addEventListener("resume", App.resume);
		App.CALL_TYPE    = Ti.App.Properties.hasProperty("callTypes") ? 	Ti.App.Properties.getString("callTypes") : ["None","Admin Office","Cat Show","Distributor","Dog Show","Show Consumer","Time Off","Prospect","Retail","Telemarketing","Vacation","Show Trade"];
		App.CALL_TYPE_MAP    = Ti.App.Properties.hasProperty("callTypesMap") ? Ti.App.Properties.getString("callTypes") : [[1,3,7,8,9],[1,8,9],[3,8],[1,2,4,5,6,7,8,9,11],[1,9]];  
		App.PROMO_STATUS = Ti.App.Properties.hasProperty("promoStatus") ? 	Ti.App.Properties.getString("promoStatus") : ["Not Bought","Bought"];  
		
	},
	/**
	 * Main controller used for controling app's navigation and global components such as TabGroups or NavigationGroups
	 */
	Index: null,
	/**
	 * Login controller
	 */
	Login: null,
	/**
	 * Flag used for retrieving dumy data
	 */
	useDummy: true,
	/**
	 * User Info
	 */
	user: Alloy.Models.instance("user"),
	/**
	 * Today's date, for multiple purposes
	 */
	today: new Date(),
	/**
	 * Current controller, for accesing globally
	 */

	
	currentController: null,
	WEEK_STATUS : ["None","Rejected","Submitted","Approved"],
	OBJECTIVE_PRIORITY : {},
	CALL_TYPE : ["None","AdminOffice","CatShow","Distributor","DogShow","ShowConsumer","TimeOff","Prospect","Retail","Telemarketing","Vacation","ShowTrade"],
	CALL_TYPE_MAP : [[1,3,7,8,9],[1,8,9],[3,8],[1,2,4,5,6,7,8,9,11],[1,9]],
	PROMO_STATUS : ["Not Bought","Bought"],
	reloadCatalogs: function(){
		
		var Api = require("api");
		if(Ti.Network.online ){
		Api.request({
				uri: "/QuadWeek?getWeekStatus",
				callback: function(response){
					App.WEEK_STATUS = response;
				}
			});
			
		Api.request({
				uri : "/QuadCall?getCallTypes=yes",
				type : "GET",
				callback: function(rcvResponse){
					//We receive it as a string instead of an object so we have to handle this one differently
					if(rcvResponse && (rcvResponse!="") && (rcvResponse!="[]")){
						var tmpCallTypes = rcvResponse.toString();
						tmpCallTypes = tmpCallTypes.split(",");
						for(var x = 0 ; x < tmpCallTypes.length; x++){
							
							tmpCallTypes[x] = helpers.wordSeparator(tmpCallTypes[x]);
						}
						App.CALL_TYPE = tmpCallTypes;
						tmpCallTypes = tmpCallTypes.join(",");
						if(tmpCallTypes == null){
							tmpCallTypes = 'None,AdminOffice,CatShow,Distributor,DogShow,ShowConsumer,TimeOff,Prospect,Retail,Telemarketing,Vacation,ShowTrade';
						}
	
						Ti.App.Properties.setString("callTypes",tmpCallTypes) ;
					}else{
						tmpCallTypes = 'None,AdminOffice,CatShow,Distributor,DogShow,ShowConsumer,TimeOff,Prospect,Retail,Telemarketing,Vacation,ShowTrade';
						Ti.App.Properties.setString("callTypes",tmpCallTypes) ;
					}
			}
			});
			//MAPPING
			Api.request({
				uri : "/TypeMapping",
				type : "GET",
				callback: function(rcvResponse){
					if(rcvResponse && (rcvResponse!="") && (rcvResponse!="[]")){
						App.CALL_TYPE_MAP = [];
						
						var tmpMap =  rcvResponse;
						
						var mapSize = 0;
						//Define how many store types we have
						for(var c = 0; c < tmpMap.length; c++){
							if(mapSize < tmpMap[c].StoreType){
								mapSize = tmpMap[c].StoreType;
							}
						}
						//Create the call type array accordingly
						for(var i = 0; i <= mapSize; i++){
							App.CALL_TYPE_MAP.push([]);
						}			
						//push the valid call types (unless repeated)			
						for(var c = 0; c < tmpMap.length; c++){
							if(App.CALL_TYPE_MAP[tmpMap[c].StoreType].indexOf(tmpMap[c].CallType) == -1){
								App.CALL_TYPE_MAP[tmpMap[c].StoreType].push(tmpMap[c].CallType);
							}
						}
						//Sort them up
						for(var c = 0; c < App.CALL_TYPE_MAP.length; c++){
								App.CALL_TYPE_MAP[c].sort(sortNumber);
						}
						//Save them
						 Ti.App.Properties.setString("callTypesMap",App.CALL_TYPE_MAP.toString()) ;
					}
			}
			});
			
			Api.request({
				
				uri: "/QuadCall?getPromoStatus",
				callback: function(rcvResponse){				
					if(rcvResponse && (rcvResponse!="") && (rcvResponse!="[]") ){			
						var tmpPromoStatus = rcvResponse.toString();å
						tmpPromoStatus = tmpPromoStatus.split(",");
									
						for(var x = 0 ; x < tmpPromoStatus.length; x++){
							
							tmpPromoStatus[x] = helpers.wordSeparator(tmpPromoStatus[x]);
						}
									
						App.PROMO_STATUS = tmpPromoStatus ;						
						tmpPromoStatus = tmpPromoStatus.join(",");
						if(tmpPromoStatus == null && (!Ti.App.Properties.hasProperty("promoStatus")) ){
							tmpPromoStatus = 'NotBought,Bought';
						}
						Ti.App.Properties.setString("promoStatus",tmpPromoStatus) ;
					}
					else{
						App.PROMO_STATUS = ["Not Bought","Bought"];
					}
				}
			});
		}else{
			
			App.PROMO_STATUS = ["Not Bought","Bought"];
		}

	},
	/**
	 * Global network event handler
	 */
	networkObserverUpdate: function() {

	},
	/**
	 * Pause event observer
	 */
	pause: function(_evt) { },
	/**
	 * Exit event observer
	 */
	exit: function(_evt) { },
	/**
	 * Resume event observer
	 */
	resume: function() { },
	
};

function sortNumber(a,b)
{
  return a - b;
}

module.exports = App;