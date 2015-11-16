var App = require("/core");
var args = arguments[0] || {};

$.promo = args.promo || new Backbone.Model();

$.customPromo = new Backbone.Model();

if(JSON.stringify($.promo.get("Campaign")) == undefined){
	var availableCampaigns = Alloy.createCollection("campaign");
	availableCampaigns.fetch({
		source:"local",
		query:"SELECT VPAReference, Description FROM campaign WHERE CampaignId = '" + $.promo.get("CampaignId") + "'"
	});
	if(availableCampaigns.length > 0){
		$.promo.set({
			Campaign : availableCampaigns.at(0)
		});
	}
	
}


var campaign = $.promo.get("Campaign") || new Backbone.Model();

if(campaign.toJSON){
	campaign = campaign.toJSON();
}else{
	campaign = new Backbone.Model($.promo.get("Campaign"));
	campaign = campaign.toJSON();
}


$.promoNumber.text = campaign.VPAReference   || "No Reference or Expired";
$.promoDesc.text   = campaign.Description    || "No Description or Expired";
$.promoStatus.text = App.PROMO_STATUS[$.promo.get("Status")] || " ";
$.promoUnits.value = $.promo.get("Units");
$.dsv.value = $.promo.get("DistributionSalesValue");
$.rsv.value = $.promo.get("RetailSalesValue");

$.customPromo.set({
		CampaignId 	: campaign.CampaignId || $.promo.get("CampaignId")
});

refreshCustomPromo();


// $.promoA.text = campaign.Active; [{"CampaignId":"MC001268","Status":1,"Units":50.0 },{"CampaignId":"MC001267","Status":1,"Units":100.0 }]
// $.promoBought.text = campaign.Bought;
// $.promoNotBought.text = campaign.NotBought;
// $.promoNotPres.text = campaign.NotPresented;
// $.promoNotAvailable.text = campaign.NotAvailable;

$.promoStatus.addEventListener("click", function(){
	var rows = [];
	for(var i = 0; i< App.PROMO_STATUS.length; i++){
		rows.push({
			title: App.PROMO_STATUS[i],
			data: i
		});
	}
	var popover = Alloy.createController("popover", {
		rows: rows,
		callback: function(rcvValue, title){
		$.promoStatus.text = title;
		$.promo.set({
			"Status" : rcvValue
		});
		
		refreshCustomPromo();
	}
	});
	popover.open($.promoStatus);
});
$.promoUnits.addEventListener("blur", function(evt){
	if(evt.value!=""){
		var tmpValue = parseFloat(evt.value);
		if(!tmpValue){
			tmpValue = 0;
		}
		$.promoUnits.value =  tmpValue.toFixed(0);
		$.promo.set({
			"Units" : $.promoUnits.value
		});	
		refreshCustomPromo();
	}
});
$.dsv.addEventListener("blur", function(evt){
	
	if(evt.value != ""){
			var tmpValue = parseFloat(evt.value);
		if(!tmpValue){
			tmpValue = 0;
		}
		$.dsv.value = tmpValue.toFixed(2);
		$.promo.set({
			"DistributionSalesValue" : $.dsv.value
		});
		refreshCustomPromo();
	}
});

$.rsv.addEventListener("blur", function(evt){
	if(evt.value != ""){
		var tmpValue = parseFloat(evt.value);
		if(!tmpValue){
			tmpValue = 0;
		}
		$.rsv.value = tmpValue.toFixed(2);
		$.promo.set({
			"RetailSalesValue" : $.rsv.value
		});
		refreshCustomPromo();
	}


});




function refreshCustomPromo(){
	
	$.customPromo.set({
		Status 		: $.promo.get("Status") == null ? 0 : $.promo.get("Status") , //NotBought default
		Units  		: $.promo.get("Units") || 0,
		DistributionSalesValue  		: $.promo.get("DistributionSalesValue") || 0.0,
		RetailSalesValue 		: $.promo.get("RetailSalesValue") || 0.0
	});
		
	args && args.callback($.customPromo, args.index); 
}
