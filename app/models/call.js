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
			type: "ws_local_sync",
			idAttribute: "RecId",
			collection_name: "call"
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
					attrs.TimeIn = new Date(time + " UTC");
				}

				if(attrs.TimeOut && !_.isDate(attrs.TimeOut)){
					var time;
					if(_.isString(attrs.TimeOut)){
						time = ('' + attrs.TimeOut).replace(/-/g,"/").replace(/[TZ]/g," ");
					} else {
						time = attrs.TimeOut;
					}
					attrs.TimeOut = new Date(time + " UTC");
				}

				return base.Model.set.call(this, attrs, opts);
			},
		});
		
		return Model;
	},
	extendCollection: function(Collection) {		
		_.extend(Collection.prototype, base.Collection, {
			url: "/QuadCall",
			comparator: function(call){
				return call.get("StopNumber");
			}
		});
		
		return Collection;
	}
}

