var base = require("baseModel");
exports.definition = {
	config: {
		columns: {
			"RecId" : "TEXT",
		    "TimeIn" : "date",
		    "TimeOut" : "date",
		    "Complete": "boolean",
		    "StopNumber": "INTEGER",
		    "WeekOf" : "TEXT",
		    "WeekId" : "TEXT",
		    "StoreId" : "TEXT",
		    "Comments" : "TEXT",
		    "Objectives" : "collection",
		    "CallMadtop" : "model",
		    "Promos" : "collection",
		    "UnplannedCall" : "boolean",
		    "DogDryLinearFeet": "double",
		    "DogCanLinearFeet": "double",
		    "CatDryLinearFeet": "double",
		    "CatCanLinearFeet": "double",
		    "TreatsLinearFeet": "double",
		    "CallType" : "INTEGER",
		    "WeekDay" : "INTEGER",
		    "CallDate": "date" ,
		    "IsDraft" : "BOOLEAN",
		},
		adapter: {
			type: "sql_json",
			//idAttribute: "WeekDay, WeekOf ,StoreId",
			collection_name: "unplannedCall"
		}
	},		
	extendModel: function(Model) {		
		_.extend(Model.prototype, base.Model, {
			defaults : {
				"Objectives" : new Backbone.Collection(),
				"Promos" : new Backbone.Collection(),
				"CallMadtop" : new Backbone.Model()
			},
			set: function(attrs, opts){
				attrs = attrs || {};
				if(attrs.TimeIn && !_.isDate(attrs.TimeIn)){
					var time;
					if(_.isString(attrs.TimeIn)){
						time = ('' + attrs.TimeIn).replace(/-/g,"/").replace(/[TZ]/g," ");
					} else {
						time = attrs.TimeIn;
					}
					attrs.TimeIn = new Date(time);
				}

				if(attrs.TimeOut && !_.isDate(attrs.TimeOut)){
					var time;
					if(_.isString(attrs.TimeOut)){
						time = ('' + attrs.TimeOut).replace(/-/g,"/").replace(/[TZ]/g," ");
					} else {
						time = attrs.TimeOut;
					}
					attrs.TimeOut = new Date(time);
				}

				return base.Model.set.call(this, attrs, opts);
			},
		});
		
		return Model;
	},
	extendCollection: function(Collection) {		
		_.extend(Collection.prototype, base.Collection, {
			comparator: function(call){
				return call.get("StopNumber");
			}
		});
		
		return Collection;
	}
}

