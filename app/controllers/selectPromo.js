var App = require("/core");
var Api = require("/api");
var args = arguments[0] || {};
var selectPromoRows = [];
$.campaigns = args.campaigns || new Backbone.Collection();

$.open = function(){
	$.window.open();
};

$.close = function(){
	$.window.close();
};
$.closeBtn.addEventListener("click", $.close);

$.add.addEventListener("click", function(){
	var selectedPromos = [];
	for(var i in selectPromoRows){
		
		if(selectPromoRows[i].selected){
			selectedPromos.push(selectPromoRows[i]);
		}
		
	}
	args.callback && args.callback(selectedPromos);
	$.close();
});

function loadPromos () {
	var rows = [];
	$.campaigns.each(function(campaign){
		
		//Not checking startdate as WS should send only active campaigns, we are just double checking nothing expired while we are offline
		if(( new Date()).getTime() < campaign.get("EndDate").getTime() ){
			var selectPromoRow = Alloy.createController("selectPromoRow", {
				campaign: campaign
			});
			rows.push(selectPromoRow.getView());
			selectPromoRows.push(selectPromoRow);
		}
		

	});
	$.promosList.data = rows;
}

loadPromos();