var base = require("baseModel");
exports.definition = {
	config: {
		columns: {
			"StoreId" : "TEXT PRIMARY KEY",
			"Name" : "text",
			//"MailingAddress" : "model", --Removed as per Wayne's request
			"Manager" : "text",
			"Contact" : "text",
			"Comments" : "text",
			"Objectives" : "TEXT",
			"CatDryLinearFeet" : "double",
			"CatCanLinearFeet" : "double",
			"DogDryLinearFeet" : "double",
			"DogCanLinearFeet" : "double",
			"TreatLinearFeet" : "double",
		},
		adapter: {
			type: "sql",
			collection_name: "modifiedStore"
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