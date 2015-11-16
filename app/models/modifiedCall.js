var base = require("baseModel");
exports.definition = {
	config: {
		columns: {
			"RecId" : "TEXT PRIMARY KEY",
		    "TimeIn" : "date",
		    "TimeOut" : "date",
		    "Complete": "boolean",
		    "StopNumber": "integer",
		    "StoreId" : "text",
		    "Comments": "text",
		    "Objectives" : "collection",
		    "CallMadtop" : "model",
		    "Promos" : "collection",
		    "CallType" : "integer",
		    "WeekId" : "text",
		    "UnplannedCall" : "boolean",
		    "DogDryLinearFeet": "double",
		    "DogCanLinearFeet": "double",
		    "CatDryLinearFeet": "double",
		    "CatCanLinearFeet": "double",
		    "TreatsLinearFeet": "double",
		    "CallDate": "string", 
		    "QuadId": "string" 
		},
		adapter: {
			type: "sql_json",
			collection_name: "modifiedCall"
		}
	},		
		extendModel: function(Model) {		
		_.extend(Model.prototype, {
			// extended functions and properties go here
		});
		
		return Model;
	},
	extendCollection: function(Collection) {		
		_.extend(Collection.prototype, {
			// extended functions and properties go here
		});
		
		return Collection;
	}
};