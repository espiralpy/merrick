exports.definition = {
	config: {
		columns: {
		    "WeekOf": "PRIMARY KEY",
			"DayOfWeek":"INTEGER",
			"QuadId":"TEXT",
			"WeekId":"TEXT",
			"Calls": "TEXT",
		},
        defaults: {
            //"n_structures": 1
        },
		adapter: {
			type: "sql",
			collection_name: "weekPlans"
		}
	},		
	extendModel: function(Model) {		
		_.extend(Model.prototype, {
			
		});
		
		return Model;
	},
	extendCollection: function(Collection) {		
		_.extend(Collection.prototype, {

		});
		
		return Collection;
	}
}

