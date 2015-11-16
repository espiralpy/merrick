//Inherits sql sync module
var parent = require("alloy/sync/sql_json");
// module.exports = parent;

exports.beforeModelCreate = function(config, name){
	parent.beforeModelCreate(config, name);
};

exports.afterModelCreate = function(Model, name){
	parent.afterModelCreate(Model, name);
};

exports.sync = function(method, model, opts){
	opts = opts ? _.clone(opts) : {};
	source = opts.source || "remote";
	switch(source){
		case "remote":
			Sync(method, model, opts);
			break;
		case "local":
			SyncLocal(method, model, opts);
			break;
		case "both":
			var newOpts = opts ? _.clone(opts) : {};
			newOpts.success = function(response){
				if(!response || (response && _.isEmpty(response))){
					Sync(method, model, opts);	
				} else {
					response = response != null ? response : "{}";
					opts.success && opts.success(response);
				}
			};
			newOpts.error = function(model, response){
				Sync(method, model, opts);
			};
			SyncLocal(method, model, newOpts);

			break;
	}
};

function SyncLocal (method, model, opts) {
	method = method || "read";
	var idAttr = model.config.adapter.idAttribute;
	switch(method){
		case "read":
		case "create":
		case "update":
			if(opts.data || (idAttr && model.has && model.has(idAttr))){
				var where = [];
				var values = [];
				var collection = model.config.adapter.collection_name;
				
				for(var key in opts.data){
					var value = opts.data[key];
					key = key.charAt(0).toUpperCase() + key.substr(1);
					if(collection === "quad" && key === "Date"){
						

						var date = value.getTime();
						
						where.push("? BETWEEN StartDate AND (StartDate + 7 * 24 * 60 * 60 * 1000)");
						
						values.push(date);
						
					} else if(value != null){
						where.push(key + " = ?");
						values.push("" + value);
					}
				}
				if(model.has && model.has(idAttr) && values.length < 1){
					//Ti.API.info("at Stop1");
					where.push(idAttr + " = ?");
					values.push("" + model.get(idAttr));
				}
				if(values.length > 0){
					var statement = "SELECT * FROM " + collection + " WHERE ";
					statement += where.join(" AND ");
					opts.query = {
						statement: statement,
						params: values
					};
					Ti.API.debug(opts.query);
				}
			}
			else{
			}
			break;
	}
	parent.sync(method, model, opts);
}

function Sync (method, model, opts) {
	var Api = require("api");
	
	switch(method){
		case "create":
			break;
		case "read":
			var uri = _.isFunction(model.url) ? model.url() : model.url;
			var gets = [];
			if(opts.data){
				for(var key in opts.data){
					var value = opts.data[key];
					if(model.config.adapter.collection_name === "quad" && key === "date"){
						value = value.format("mm-dd-yyyy")
					}
					if(value){
						gets.push(key + "=" + value);
					}
				}
			}
			if(gets.length > 0){
				uri += "?" + gets.join("&");
			}
			Api.request({
				uri: uri,
				callback: function(response){
					response = response || { error : true };
					if(response && response.error){
						opts.error && opts.error(response);
						SyncLocal(method, model, opts);
					} else {
						opts.success && opts.success(response, model, opts);
					}
				}
			});
			break;
		case "update":
			break;
		case "delete":
			break;
	}
}