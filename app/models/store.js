var base = require("baseModel");
exports.definition = {
	config: {
		columns: {
			"Id" : "TEXT PRIMARY KEY",
			"Name" : "text",
			"Address" : "model",
			"MailingAddress" : "model",
			"Phone" : "text",
			"Manager" : "text",
			"Contact" : "text",
			"Comments" : "text",
			"Type" : "integer",
			"Objectives" : "collection",
			"CatDryLinearFeet" : "double",
			"CatCanLinearFeet" : "double",
			"DogDryLinearFeet" : "double",
			"DogCanLinearFeet" : "double",
			"TreatLinearFeet" : "double",
			"ActiveCampaigns" : "collection",
			"UserId"   : "text",
			"Latitude"  : "double",
			"Longitude" : "double"
		},
		adapter: {
			type: "ws_local_sync",
			idAttribute: "Id",
			collection_name: "store"
		}
	},		
	extendModel: function(Model) {		
		_.extend(Model.prototype, base.Model, {
			url: function(){
				return "/Store/" + this.get("Id")
			},
			get: function(name, opts){
				opts = opts || {};
				if(opts.full){
					var address;
					if(this.has(name)){
						address = this.get(name);
						var result = [
							address.get("Street1"),
							address.get("City"),
							address.get("State")
						];
						return result.join(", ");
					}
				}

				return Backbone.Model.prototype.get.call(this, name);
			}
		});
		return Model;
	},
	extendCollection: function(Collection) {
		_.extend(Collection.prototype, base.Collection, {
			url: "/Store",
			save: function(opts){
				this.each(function(model){
					model.save(null, opts);
				});
			}
		});
		return Collection;
	}
};