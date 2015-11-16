var base = require("baseModel");
exports.definition = {
	config: {
		columns: {
			"Id" : "TEXT PRIMARY KEY",
		    "Status": "integer",
		    "StartDate": "date",
		    "SalesGroup": "text",
		    "Objectives" : "collection",
		    "QuadIds" : "json",
		    "ValidDayNumbers" : "json",
		    "UserId" : "text"
		},
		adapter: {
			type: "ws_local_sync",
			idAttribute: "Id",
			collection_name: "quad"
		}
	},		
	extendModel: function(Model) {		
		_.extend(Model.prototype, base.Model, {
			url: "/QuadWeek",
			defaults: {
				//"ActualDate" : new Date()
				"ActualDate" : new Date()
			},
			parse: function(attrs){
				if(_.isArray(attrs) && attrs.length > 0){
					return attrs[0];
				} else {
					return attrs;
				}
			},
			set: function(attrs, opts){
				attrs = attrs || {};
				if(attrs.StartDate && !_.isDate(attrs.StartDate)){
					var time;
					if(_.isString(attrs.StartDate)){
						time = ('' + attrs.StartDate).replace(/-/g,"/").replace(/[TZ]/g," ");
					} else {
						time = attrs.StartDate;
					}
					attrs.StartDate = new Date(time);
				}

				return base.Model.set.call(this, attrs, opts);
			},
			fetch: function(opts){
				opts = opts || {};
				opts.data = opts.data || {
					date: this.get("ActualDate")
				};
				// if(opts.source === "local" || opts.source === "both"){
					 //opts.data.userId = Alloy.Models.instance("user").get("Username");
				// }
				return Backbone.Model.prototype.fetch.call(this, opts);
			},
			toJSON: function(){
				var attrs = _.clone(this.attributes);
				_.each(attrs, function(attr){
					if(_.isDate(attr)){
						attr = attr.getTime();
					}
				});

				return attrs;
			},
			walkQuad: function(steps){
				steps = steps || 0;
				var newDate = new Date(this.get("ActualDate").getTime() + steps * 7 * 24 * 60 * 60 * 1000);
				this.set({
					"ActualDate" : newDate
				});
			}
		});
		
		return Model;
	},
	extendCollection: function(Collection) {		
		_.extend(Collection.prototype, base.Collection, {
			url: "/QuadWeek"
		});
		
		return Collection;
	}
}