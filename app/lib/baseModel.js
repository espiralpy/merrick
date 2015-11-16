var GenericModel = Backbone.Model.extend();
var GenericCollection = Backbone.Collection.extend();

exports.Model = _({
	set: function(attrs, opts){
		var model = this;
		var columns = model.config.columns;

		_.each(attrs, function(attr, name){
			var column = columns[name];
			if(column && (column === "model" || column === "collection")){
				var nested;
				if(column === "model"){
					nested = new GenericModel(attr && attr.toJSON ? attr.toJSON() : attr);
				} else {
					nested = new GenericCollection(attr && attr.toJSON ? attr.toJSON() : attr);
				}
				attrs[name] = nested;
			}
		});

		return Backbone.Model.prototype.set.call(this, attrs, opts);
	}
}).clone();

exports.Collection = _({
	save: function(opts, attrs){
		this.each(function(model){
			model.save(attrs, opts);
		});
	}
}).clone();