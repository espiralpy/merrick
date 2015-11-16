exports.definition = {
	config: {
		columns: {
		    "QuadId": "text",
		    "SalesGroup": "text",
		    "DayOfWeek": "integer",
		    "StopNo": "integer",
		    "StoreId": "text",
		    "UserId": "text"
		},
		adapter: {
			type: "ws_local_sync",
			collection_name: "salesQuad"
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
			url : "/SalesQuad",
			comparator : function(salesQuad){
				return salesQuad.get("QuadId")
			},
			save: function(opts){
				this.each(function(model){
					model.save(null, opts);
				});
			}
		});
		
		return Collection;
	}
}

