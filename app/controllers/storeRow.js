var App = require("core");
var args = arguments[0] || {};

$.store = args.store || Alloy.createModel("store");

$.store.on("change", repaint);

function repaint () {
	$.storeId.text = $.store.id;
	$.name.text = $.store.get("Name");
	$.address.text = $.store.get("Address", {full: true});
	$.phone.text = $.store.get("Phone");
}

repaint();