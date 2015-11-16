var App = require("/core");
var args = arguments[0] || {};
var currentValue = args.feet || 0;
var modifiedValue = args.modifiedValue;

$.product.text = args.product || '';
$.feet.value = currentValue;
$.delta.text = "" + (args.delta || 0);

$.feet.addEventListener("blur", function(newValue){
	newValue.value.trim();
	newValue.value = isNaN(newValue.value) ? newValue.value = 0 : newValue.value;
	newValue.value = newValue.value == "" ? 0 : parseFloat(newValue.value);
	args.callback    ( newValue.value - currentValue ); 
	currentValue = newValue.value;
	$.feet.value = currentValue;
	$.delta.text	= newValue.value - args.oldValue;
});

//Apply modified values
if(modifiedValue != null){
	currentValue	= modifiedValue;
	$.feet.value 	= currentValue;
	$.delta.text	= modifiedValue - args.oldValue;
}


exports.product = $.product.text;
exports.index = (args && args.index) || -1;
