var base = require("baseModel");

			    
exports.definition = {
	config: {
		columns: {
		    "DayOfWeek": "integer",
		    //"Day" : "text",
			//"QuadId" : "text",//  removed by WS
		    "WeekId" : "text",
		    "CallRecIds": "json",
		},
		adapter: {
			type: "ws_local_sync",
			collection_name: "day",
		}
	},		
	extendModel: function(Model) {		
		_.extend(Model.prototype, base.Model, {
			url: "/QuadDay",

		});
		
		return Model;
	},
	extendCollection: function(Collection) {		
		_.extend(Collection.prototype, base.Collection, {
			url: "/QuadDay",
			comparator: function(day){
				return day.get("DayOfWeek") || 0;
			}
		});
		
		return Collection;
	}
}


			    
