var base = require("baseModel");
exports.definition = {
	config: {
		columns: {
				  "Active": "boolean",
				  "Description": "TEXT",
				  "EndDate": "date",
				  "StartDate": "date",
				  "CampaignId": "TEXT PRIMARY KEY",
				  "NationalCampaign": "boolean",
				  "Notes": "TEXT",
				  "VPAReference": "TEXT",
				  "Bought": "TEXT",
				  "NotBought": "TEXT",
				  "NotAvailable": "TEXT",
				  "NotPresented": "TEXT",
				  "StoreCampaignRecId": "TEXT",
				  "UnitsToDate": "TEXT",
				  "StoreCampaignVPAReference": "TEXT"
		},
		adapter: {
			type: "ws_local_sync",
			idAttribute: "CampaignId",
			collection_name: "campaign"
		}
	},		
	extendModel: function(Model) {		
		_.extend(Model.prototype, base.Model, {
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

				if(attrs.EndDate && !_.isDate(attrs.EndDate)){
					var time;
					if(_.isString(attrs.EndDate)){
						time = ('' + attrs.EndDate).replace(/-/g,"/").replace(/[TZ]/g," ");
					} else {
						time = attrs.EndDate;
					}
					attrs.EndDate = new Date(time);
				}

				return base.Model.set.call(this, attrs, opts);
			}
		});
		return Model;
	},
	extendCollection: function(Collection) {
		_.extend(Collection.prototype, base.Collection, {
			url: "/Campaign",

		});
		return Collection;
	}
};