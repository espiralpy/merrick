var base = require("baseModel");

exports.definition = {
	config: {
		columns: {
			"WeekId"			: "TEXT PRIMARY KEY",
			"WeekOf"			: "TEXT",
			"ManagerComments"   : "TEXT",
			"Approved" 			: "INTEGER",
		},
		adapter: {
			type: "sql",
			idAttribute: "WeekId",
			collection_name: "planSentForApproval"
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