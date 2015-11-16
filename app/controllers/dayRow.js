var App = require("/core");
var quad = Alloy.Models.instance("quad");
var args = arguments[0] || {};

$.day = args.day || {};
var startDate = quad.get("StartDate");
if(startDate){
	var date = new Date(startDate.getTime() + ($.day.get("DayOfWeek") - 1) * 24 * 60 * 60 * 1000);
	$.day.set({
		"Date" : date
	});
	$.number.text = date.format("dd");
	$.dayLbl.text = date.format("dddd");
} else {
	$.number.text = "--";
	$.dayLbl.text = "---";
}
$.row.dayId = $.day.get("QuadId");
$.dayId = $.day.get("QuadId");

$.setSelected = function(state){
	$.wrapper.backgroundColor = (state ? $.wrapper.backgroundSelectedColor : $.wrapper.backgroundNormalColor);
};