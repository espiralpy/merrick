var App = require("/core");
var args = arguments[0] || {};
$.selected = false;
$.store = args.store || Alloy.createModel("store");

$.setSelected = function(state){
	$.selected = state;
	$.row.backgroundColor = Alloy.Globals.colors[$.selected ? "GRAY_LIGHT" : "WHITE"];
};

$.row.addEventListener("click", function(){
	$.setSelected(!$.selected);
	args && args.callback(); 
});
$.store.on("change", repaint);

function repaint () {
	$.namesdesc.text = $.store.get("Name") || '';
	$.address.text = $.store.get("Address", {full: true}) || '';
	$.phone.text = $.store.get("Phone") || '';
	// $.quads.text = $.store.get("QuadId") || '';
	}

repaint();