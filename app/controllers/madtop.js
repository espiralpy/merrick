var App = require("/core");
var Api = require("/api");
var args = arguments[0] || {};

$.call = args.call;
$.store = args.store;
$.callPromos = [];

var counter = 0;
var clearText = "-Clear-";

var lastView;
var lastItem;
var feets;

// Ti.API.info(args.uiEnabled);
if(args && (args.uiEnabled != null) && !args.uiEnabled){
	$.content.touchEnabled = false;
}

function init(){
		if($.call){
			loadMadtop($.call.get("CallMadtop"));
		}
}


showView("m");
// var mResetValues = ["Dog", "Cat", "Both"];
// var aPop = [1,2,3,4,5,6,7,8,9,10];
// var aShow = ["Trade","Consumer","Distributor"];
// var aRecomp =  ["Yes", "No"];
// var dOrderValues = ["Dog", "Cat", "Both"];
// var tSeminarValues = ["Planned", "Unplanned"];
// var tTrainingValues = ["Breed Club", "Training"];
// var oObjectivesValues = ["0/1", "0/2", "0/3", "1/1", "1/2", "1/3", "2/2", "2/3", "3/3"];
// var oRideValues = ["Yes", "No"];

exports.save = saveInformation;

var availableOptions = [];
availableOptions["mReset"]  	= [{title: clearText, data: null},{title: "Dog", data: "1"}, {title: "Cat", data: "2"}, {title: "Both", data: "3"}];
availableOptions["mEndcap"]		= [{title: clearText, data: null},{title:"1", data: "1"}, {title:"2", data: "2"}, {title:"3", data: "3"}, {title:"4", data: "4"}, {title:"5", data: "5"} ]; 
availableOptions["mOffshelf"]	= [{title: clearText, data: null},{data:"001", title:"1"},{data:"002",title:"2"},{data:"003",title:"3"},{data:"004",title:"4"},{data:"005",title:"5"},{data:"006",title:"6"},{data:"007",title:"7"},{data:"008",title:"8"},{data:"009",title:"9"},{data:"010",title:"10"},{data:"011",title:"11"},{data:"012",title:"12"},{data:"013",title:"13"},{data:"014",title:"14"},{data:"015",title:"15"},{data:"016",title:"16"},{data:"017",title:"17"},{data:"018",title:"18"},{data:"019",title:"19"},{data:"020",title:"20"} ]; 
availableOptions["aPop"]		= [{title: clearText, data: null},{title: "1", data: "001"}, {title: "2", data: "002"}, {title: "3", data: "003"}, {title: "4", data: "004"}, {title: "5", data: "005"}, {title: "6", data: "006"}, {title: "7", data: "007"}, {title: "8", data: "008"}, {title: "9", data: "009"}, {title: "10", data: "010"}, {title: "11", data: "011"}, {title: "12", data: "012"}, {title: "13", data: "013"}, {title: "14", data: "014"}, {title: "15", data: "015"}, {title: "16", data: "016"}, {title: "17", data: "017"}, {title: "18", data: "018"}, {title: "19", data: "019"}, {title: "20", data: "020"}];
availableOptions["aShow"]		= [{title: clearText, data: null},{title: "Trade", data: "0"}, {title: "Consumer", data: "1"}, {title: "Distributor", data: "2"}];
availableOptions["aRecomp"] 	= [{title: clearText, data: null},{title:"No", data: "0"},{title:"Yes", data: "1"}]; 
availableOptions["dOrder"]		= [{title: clearText, data: null},{title:"Dog", data: "1"}, {title:  "Cat", data: "2"}, {title:  "Both",data: "3"}];
availableOptions["dSku"]		= [{title: clearText, data: null},{data:"001", title:"1"},{data:"002",title:"2"},{data:"003",title:"3"},{data:"004",title:"4"},{data:"005",title:"5"},{data:"006",title:"6"},{data:"007",title:"7"},{data:"008",title:"8"},{data:"009",title:"9"}]; 
availableOptions["tAttendees"]	= [{title: clearText, data: null},{title:"2", data: "02"}, {title:"3", data: "03"}, {title:"4", data: "04"}, {title:"5", data: "05"}, {title:"6", data: "06"}, {title:"7", data: "07"}, {title:"8", data: "08"}, {title:"9", data: "09"}, {title:"10", data: "10"}, {title:"10+", data: "11"}]; 
availableOptions["tSeminar"]	= [{title: clearText, data: null},{title:"PrePlanned", data: "1"},{title: "Unplanned", data: "2"}];
availableOptions["tTraining"]	= [{title: clearText, data: null},{title:"Breed Club", data: "0"}, {title: "Training", data: "1"}];
availableOptions["oObjectives"]	= [{title: clearText, data: null},{title:"0/1", data: "001"}, {title:  "0/2", data: "002"}, {title:  "0/3", data: "003"}, {title:  "1/1", data: "011"}, {title:  "1/2", data: "012"}, {title:  "1/3", data: "013"}, {title:  "2/2", data: "022" }, {title:  "2/3", data: "023"}, {title:  "3/3",data: "033"}];
availableOptions["oRide"]		= [{title: clearText, data: null},{title:"No", data: "0"},{title:"Yes", data: "1"}]; 

var availableObjectives = [];
availableObjectives["001"] = "0/1";
availableObjectives["002"] = "0/2";
availableObjectives["003"] = "0/3";
availableObjectives["011"] = "1/1";
availableObjectives["012"] = "1/2";
availableObjectives["013"] = "1/3";
availableObjectives["022"] = "2/2";
availableObjectives["023"] = "2/3";
availableObjectives["033"] = "3/3";
availableObjectives["000"] = " ";

$.menu.addEventListener("click", function(evt){
	var id = evt.source.action;
	id && showView(id);
});

$.content.addEventListener("click",function(e){
	switch(e.source.id){
	case "mReset":
	case "mEndcap":
	case "mOffshelf":
	case "aPop":
	case "aShow":
	case "aRecomp":
	case "dOrder":
	case "dSku":
	case "tAttendees":
	case "tSeminar":
	case "tTraining":
	case "oObjectives":
	case "oRide":
		createPopover(e.source);
		break;
	}


});
function createPopover(rcvElement){
	var previousElement = rcvElement;
	var popover = Alloy.createController("popover", {
		rows: availableOptions[rcvElement.id],
		callback: function(value, title){
		previousElement.text = title == clearText ? "" : title;
		previousElement.data = value;
	}
	});
	popover.open(rcvElement);

}
$.addPromo.addEventListener("click", function(){
	var availableCampaigns = Alloy.createCollection("campaign");
	
	availableCampaigns.fetch({
		source: "local",
		query : "SELECT CampaignId, VPAReference, Description, Active, UnitsToDate, Bought, NotPresented, NotAvailable, EndDate FROM campaign"	  //notbought == available?
	});
	
	var selectPromo = Alloy.createController("selectPromo", {
		campaigns: availableCampaigns,
		callback: function(selectedPromos){

			
		var alertDuplicates = false;
		for(var i in selectedPromos){
			var notAdded = true;
			for(var j = 0; j < $.callPromos.length; j++){
				if($.callPromos[j] != null){
					if(selectedPromos[i].campaign.get("CampaignId") == $.callPromos[j].get("CampaignId")){
						notAdded = false;
						alertDuplicates = true;
						j = $.callPromos.length;
					}
				}

			}
			if(notAdded){
			
				var selectedPromo = selectedPromos[i];
				//Newly selected promo
				var promo = new Backbone.Model({
					VPAReference: selectedPromo.campaign.get("VPAReference"),
					Campaign : selectedPromo.campaign
				});
				
				var promoRow = Alloy.createController("promoRow", {
					promo: promo,		
					index : counter,
					callback: function(promo,index){
								updatePromo(promo,index);
							}
				});
				counter++;
				$.promo.appendRow(promoRow.getView());
			}
			
		}
		if(alertDuplicates){
			alert("Duplicated Promos detected, duplicated entries have been ignored.");
		}
	}
	});
	selectPromo.open();
});

$.promo.addEventListener("click", function(evt){
	var previousEvent = evt;
	if(evt.source.id === "deleteBtn"){
		hasChanged = true;
		var discardConfirmation = Titanium.UI.createAlertDialog({
			title: 'Delete',
			message: 'Do you want to remove this Promo?',
			buttonNames: ['Yes','No'],
			cancel: 1
		});
		discardConfirmation.show();
		discardConfirmation.addEventListener('click', function(e) {
			if (e.index == 0) { // clicked "YES"
				$.callPromos.splice(previousEvent.index, 1);
				$.promo.deleteRow(previousEvent.index);
			} else if (e.index == 1) { // clicked "NO"
			}    
		});		

	}
});

function showView (itemId) {
	var name = itemId + "_wrapper";
	lastView && lastView.hide();
	if(lastItem){
		lastItem.color = lastItem.normalColor;
		lastItem.backgroundColor = lastItem.backgroundNormalColor;
	}
	lastView = $[name];
	lastItem = $[itemId];
	lastItem.color = lastItem.selectedColor;
	lastItem.backgroundColor = lastItem.backgroundSelectedColor;
	lastView.show();
}

function loadMadtop (madtop) {
	
	madtop = madtop.toJSON();
	


	if(madtop == null){
		madtop = JSON.parse('{"Attendees":null,"BreedClub":null,"Demo":null,"Endcap":null,"New":null,"Objectives":null,"OffShelf":null,"Order":null,"Pop":null,"Promo":null,"Recommendation":null,"Reset":null,"Ride":null,"Samples":null,"Seminar":null,"Show":null,"SKU":null,"Store":null,"Trainer":null,"Training":null}');
	}

	//M
	var m = {
			offshelf: madtop.Offshelf ,
			endcap: madtop.Endcap ,
			reset: madtop.Reset 
	};
	
	$.mOffshelf.text = m.offshelf;
	
	
	$.mEndcap.text = m.endcap;
	
	$.mReset.text = m.reset;
	
	var a = {
			
			recomp : 	madtop.Recommendation , //When dinamically receiving values from WS double check correct functionality 
			pop : 		madtop.Pop ,
			show : 		madtop.Show   //WS decided that we need to start values in zero here and not one as any other fields
	}; 
	
	$.aRecomp.text = a.recomp;
	
	$.aPop.text =  a.pop;
	
	$.aShow.text =  a.show;
	
	feets = [];
	feets = [
	             {
	            	 product: "Cat Dry",
	            	 oldValue: $.store.get("CatDryLinearFeet") || 0,
	            	 modifiedValue : $.call.get("CatDryLinearFeet"),
	            	 feet: $.store.get("CatDryLinearFeet") || 0,
	            	 index : 1,
	             },
	             {
	            	 product: "Cat Can",
	            	 oldValue: $.store.get("CatCanLinearFeet")|| 0,
	            	 modifiedValue : $.call.get("CatCanLinearFeet"),
	            	 feet: $.store.get("CatCanLinearFeet")|| 0,
	            	 index : 2,
	             },
	             {
	            	 product: "Dog Dry",
	            	 oldValue: $.store.get("DogDryLinearFeet")|| 0,
	            	 modifiedValue : $.call.get("DogDryLinearFeet"),
	            	 feet: $.store.get("DogDryLinearFeet")|| 0,
	            	 index : 3,
	             },
	             {
	            	 product: "Dog Can",
	            	 oldValue: $.store.get("DogCanLinearFeet")|| 0,
	            	 modifiedValue : $.call.get("DogCanLinearFeet"),
	            	 feet: $.store.get("DogCanLinearFeet")|| 0,
	            	 index : 4,
	             },
	             {
	            	 product: "Treat",
	            	 oldValue: $.store.get("TreatLinearFeet")|| 0,
	            	 modifiedValue : $.call.get("TreatsLinearFeet"),
	            	 feet: $.store.get("TreatLinearFeet")|| 0,
	            	 index : 5,
	             }
	             ];
	$.mTotal.text = "0";

	for(var i in feets){
		var feet = feets[i];
		var footRow = Alloy.createController("footRow", {
			product: feet.product,
			feet: feet.feet,
			delta: feet.delta,
			oldValue: feet.oldValue,
			index: feets[i].index,
			modifiedValue: feets[i].modifiedValue,
			callback: function(delta){
			updateTotal(delta);
		}
		});
		feets[i] = footRow;
		var valueToAdd = 0;
		valueToAdd = feet.modifiedValue || feet.oldValue;
		$.mTotal.text = parseInt($.mTotal.text) + parseInt(valueToAdd); 

		if($.feets.data.length > 0){
			$.feets.insertRowBefore( i, footRow.getView()); 
		}else{
			$.feets.add(footRow.getView());
		}

	}

	//D
	var d = {

			
			sku 	: madtop.SKU,
			order   : madtop.Order,	
			
			dsv 	: madtop.DistributionSalesValue || 0.0,
			rsv 	: madtop.RetailSalesValue || 0.0	
	};
	
	$.dSku.text = d.sku;
	
	$.dOrder.text = d.order;
	
	
	$.dsvSales.value = d.dsv ;
	$.rsvSales.value = d.rsv ;

	//T
	
	var	tmpAttendees;
	
	if( (madtop.Attendees ==  "")  || (madtop.Attendees == null) ){
		tmpAttendees = 0;
		$.tAttendees.data  = "";
	}else{
		tmpAttendees =  madtop.Attendees;
	}
	var t = {
			
			seminar   : madtop.Seminar ,
			attendees : tmpAttendees,
			training  : madtop.Training
	};
	
	$.tSeminar.text = t.seminar;
	
	if(t.attendees != 0){
		$.tAttendees.text  = t.attendees; 
	}
	
	$.tTraining.text =  t.training;

	//O
	var o = {
		
			objectives : madtop.Objectives ,
			ride : 		 madtop.Ride 
	};
	
	$.oObjectives.text = o.objectives;
	
	$.oRide.text = o.ride;

	//P
	var p = $.call.get("Promos") || new Backbone.Collection();
	p.each(function(promo){
		var promoRow = Alloy.createController("promoRow", {
			promo: promo,				
			index : counter,
			callback: function(promo,index){
							updatePromo(promo,index);
						}
		});
		$.promo.appendRow(promoRow.getView());
		counter++;
	});
}

function saveInformation(rcvModifiedCall){

	tmpMadtop =  JSON.parse("{}");


	tmpMadtop.Attendees =  $.tAttendees.text ;
	tmpMadtop.Endcap    =  $.mEndcap.text;
	tmpMadtop.Objectives =  $.oObjectives.text;
	tmpMadtop.Offshelf  =  $.mOffshelf.text;
	tmpMadtop.Order     =  $.dOrder.text;
	tmpMadtop.DistributionSalesValue     =  parseFloat($.dsvSales.value);
	tmpMadtop.RetailSalesValue     		 =  parseFloat($.rsvSales.value);
	tmpMadtop.Pop       =  $.aPop.text;
	tmpMadtop.Recommendation =  $.aRecomp.text;
	tmpMadtop.Reset     =  $.mReset.text;
	tmpMadtop.Ride      = $.oRide.text ;
	tmpMadtop.Seminar   =  $.tSeminar.text;
	tmpMadtop.Show    =  $.aShow.text;
	tmpMadtop.SKU     =  $.dSku.text;
	tmpMadtop.Training  =  $.tTraining.text ;
	
	tmpMadtop.Store     =  $.store.get("StoreId");

	
	tmpMadtop.New     =  false;


	if(rcvModifiedCall != null ){
		var promosToSave = new Backbone.Collection();
		for(var i = 0; i < $.callPromos.length ; i++){
			if($.callPromos[i] != null){
				promosToSave.add($.callPromos[i]);
			}
		}
	
		rcvModifiedCall.set({
			alloy_id :   rcvModifiedCall.get("alloy_id"),
			CallMadtop:  new Backbone.Model(tmpMadtop),
			Promos:		 promosToSave
		});
		
	for(var x = 0; x < feets.length; x++){
		
		switch(feets[x].index){
			case 1:	
				rcvModifiedCall.set({
					CatDryLinearFeet : feets[x].feet.value
				});
			break;
			case 2:
				rcvModifiedCall.set({
					CatCanLinearFeet : feets[x].feet.value
				});
			break;
			case 3:
				rcvModifiedCall.set({
					DogDryLinearFeet : feets[x].feet.value
				});
			break;
			case 4:
				rcvModifiedCall.set({
					DogCanLinearFeet : feets[x].feet.value
				});
			break;
			case 5:
				rcvModifiedCall.set({
					TreatsLinearFeet : feets[x].feet.value
				});
			break;
			case -1:
				Ti.API.info("Missing index at linear feets information");
			break;
			}	

		}
		rcvModifiedCall.save();
	} 
	
	
	
}

$.dsvSales.addEventListener("blur", function(evt){

	if(evt.value != ""){
		var tmpValue = parseFloat(evt.value);
		if(!tmpValue){
			tmpValue = 0;
		}
		$.dsvSales.value = tmpValue.toFixed(2);
	}
});

$.rsvSales.addEventListener("blur", function(evt){
	if(evt.value != ""){
		var tmpValue = parseFloat(evt.value);
		if(!tmpValue){
			tmpValue = 0;
		}
		$.rsvSales.value = tmpValue.toFixed(2);

	}


});

function updateTotal(delta){
	$.mTotal.text = parseInt($.mTotal.text + delta); 
}


function updatePromo(promo,index){
	if(index != -1){
		$.callPromos[index] = promo;
	}
}

init();
