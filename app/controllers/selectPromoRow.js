var App = require("/core");
var args = arguments[0] || {};
$.campaign = args.campaign || new Backbone.Model();
$.selected = false;

$.number.text 		= $.campaign.get("VPAReference");
$.description.text 	= $.campaign.get("Description");
$.a.text 			= $.campaign.get("Active");
// $.units.text 		= $.campaign.get("UnitsToDate");
// $.bought.text 		= $.campaign.get("Bought");
// $.np.text 			= $.campaign.get("NotPresented");
// $.n.text 			= $.campaign.get("NotAvailable");

$.row.addEventListener("click", function(){
	$.selected = !$.selected;
	if($.selected){
		$.row.backgroundColor = Alloy.Globals.colors.GRAY_LIGHT;
	} else {
		$.row.backgroundColor = Alloy.Globals.colors.WHITE;
	}
});