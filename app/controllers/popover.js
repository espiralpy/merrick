var App = require("/core");
var args = arguments[0] || {};
var data = [];

$.open = function(view){
	$.popover.show({
		view: view
	});
}
$.popover.title = args.title || L("choose_option_str");

if(args.rows === "date"){
	$.popover.remove($.list);
	$.popover.applyProperties($.popover.pickerStyle);
	$.picker.applyProperties({
		minDate : args.minDate || new Date(),
		value : args.value || new Date()
	});
	$.picker.addEventListener("change", changeEvent);
	$.popover.addEventListener("hide", function(){
		$.picker.removeEventListener("change", changeEvent);
	});
} else if(args.rows.length > 0){
	$.popover.remove($.picker);
	for(var i in args.rows){
		var option = args.rows[i];
		data.push({
			title: option.title+"",
			data: option.data,
			value: option.value
		});
	}

	$.list.data = data;

	$.list.addEventListener("click", function(evt){
		if(args.callback){
			args.callback(evt.rowData.data, evt.rowData.title ,  evt.rowData.value );
		}
		$.popover.hide();
	});
}
function changeEvent (evt) {
	args.callback && args.callback($.picker.value);
}
