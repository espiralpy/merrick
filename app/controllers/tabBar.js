var App = require("/core");
var args = arguments[0] || {};
var last;
var tabGroup = args.tabGroup;

$.tabs.addEventListener("click", function(evt){
	var index = evt.source.index;
	if(index != null){
		selectTab(evt.source);
		tabGroup && tabGroup.setActiveTab(index);
	}
});

function init () {
	selectTab($.dashboard);	
}

function selectTab (button) {
	if(last){
		last.button.backgroundImage = "";
		last.icon.image = last.icon.normalImage;
	}
	last = {
		button: button,
		icon: $[button.icon]
	};
	last.button.backgroundImage = last.button.backgroundSelectedImage;
	last.icon.image = last.icon.selectedImage;
}


function logoClick(){


			selectTab($.dashboard);
			tabGroup && tabGroup.setActiveTab(0);
			App.goToDailyPlan && App.goToDailyPlan();



}
init();