var App = require("/core");
var Api = require("/api");
var duration = 200;
var loading;
var opened = false;

var commands = [];
commands.push("cleardata");
commands.push("techsupport");
commands.push("saveid");
// commands.push("defineid");

//Methods
$.open = function(){
	
	if(!opened){
		$.window.open();
		$.username.focus();
		opened = true;
	}

};

$.close = function(){
	if(opened){
		opened = false;
		$.password.value = "";
		$.window.close();
	}
};

//Private functions
function init () {
	
	//Listeners
	$.ok.addEventListener("click", function(){
		
		
		var username = $.username.hasText() ? $.username.value.trim() : "";
		var password = $.password.hasText() ? $.password.value : "";

		if(username === ""){
			alert("Please introduce a valid username");
			return;
		}

		if(password === ""){
			alert("Please introduce a valid password");
			return;
		}		
		if (commands.indexOf( username ) != -1){
			switch(commands.indexOf( username )){
				case 0: //cleardata
				if(password == "pass@word1"){
						var completeConfirmation = Titanium.UI.createAlertDialog({
							title: 'Clear all Data',
							message: 'Do you want to clear all stored data?',
							buttonNames: ['Yes','No'],
							cancel: 1
						});
						completeConfirmation.show();
					
						completeConfirmation.addEventListener('click', function(e) {
							if (e.index == 0) { // clicked "YES"
								clearData();
							} else if (e.index == 1) { // clicked "NO"
							}    
						});
				}
				break;
				case 1 : //techsupport
				if(password == "pass@word1"){
					
					//var UDID = require('ti.udid');
					var techMessage = "Build #54\n " +  //change build No. here , app builds 48 and 49 have been skipped to match testflight numbers
									 // "Device old UUID: \n " + UDID.oldUDID + "+++" + Ti.Platform.id + "\n"+
									  "Device current ID: \n " +( ( Ti.App.Properties.hasProperty("deviceID") ? Ti.App.Properties.getString("deviceID") : Ti.Platform.id) );
					var techConfirmation = Titanium.UI.createAlertDialog({
							title: 'Tech Support Information:',
							message: techMessage,
							buttonNames: ['Copy Details','Close'],
							cancel: 1
						});
						techConfirmation.show();
					
						techConfirmation.addEventListener('click', function(e) {
							if (e.index == 0) { // clicked "Copy Details"
								Ti.UI.Clipboard.clearText();
								Ti.UI.Clipboard.setText(techMessage);	
								alert("Tech data copied to clipboard");
							} else if (e.index == 1) { // clicked "Close"
							}    
						});
					
					
					
										
					
				}
				break;
				case 2 : //saveid
				if(password == "pass@word1"){
					
					var UDID = require('ti.udid');
					Ti.App.Properties.setString("deviceID", UDID.oldUDID);
					alert("Device ID set to: \n" + Ti.App.properties.getString("deviceID"));
					alert("Please restart the application");
					
				}
				break;
				// case 3 : //defineId
				// if(password == "pass@word1"){
					// Ti.UI.setBackgroundColor('white');
// 				
					  // var dialog = Ti.UI.createAlertDialog({
					    // title: 'Enter new device Id',
					    // style: Ti.UI.iPhone.AlertDialogStyle.PLAIN_TEXT_INPUT,
					    // buttonNames: ['OK']
					  // });
					  // dialog.addEventListener('click', function(e){
					    // Ti.API.info('e.text: ' + e.text);
					  	// Ti.App.Properties.setString("deviceID", e.text);
					 	// alert("Please restart the application");
					  // });
					  // dialog.show();
				// }
				// break;
			}
		}else{
			executeLogin(username,password);
		}
		

		
	});


function executeLogin(username,password){
	loading = App.loadingIndicator.show({
				message : "User"
			});
			App.user.login(username, password, function(response){
				if(!response.success){
					$.password.value = "";
					$.password.focus();
					App.loadingIndicator.hide(loading);
				}
				else{
					App.loadingIndicator.hide(loading);
				}
			});
}

	App.user.on("change:LoggedIn", function(model, loggedIn){
		App.loadingIndicator.hide(loading);
		if(loggedIn){
			
			App.Index && App.Index.reload && App.Index.reload();
			
			$.close();
		} else {
			$.open();
		}
	});

	$.username.addEventListener("focus", moveUp);
	$.password.addEventListener("focus", moveUp);

	$.username.addEventListener("blur", moveDown);
	$.password.addEventListener("blur", moveDown);
	
	$.open();
	 
}

function moveUp () {
	$.wrapper.animate({
		top: $.wrapper.topFocus,
		duration: duration
	});
}
function moveDown () {
	$.wrapper.animate({
		top: $.wrapper.topBlur,
		duration: duration
	});
}

function clearData(){
	loading = App.loadingIndicator.show({
			message : "Deleting"
		});
	var allTables = [];
	
	allTables.push("call");
	allTables.push("campaign");
	allTables.push("day");
	allTables.push("modifiedCall");
	allTables.push("modifiedStore");
	allTables.push("planSentForApproval");
	allTables.push("quad");
	allTables.push("salesQuad");
	allTables.push("store");
	allTables.push("unplannedCall");
	allTables.push("user");
	allTables.push("weekPlans");
	
	for(var x = 0; x < allTables.length; x++){
		cleanTable(allTables[x]);
	}

	Ti.App.Properties.removeProperty('password');
	Ti.App.Properties.removeProperty('username');
	Ti.App.Properties.removeProperty('validSession');
	Ti.App.Properties.removeProperty('userLastAlerted');
	Ti.App.Properties.removeProperty('userAvatar');
	Ti.App.Properties.removeProperty('userRealName');

	App.loadingIndicator.hide(loading);
	
	alert("Data has been cleared");
	alert("Please restart the application");

}

function cleanTable(tablename){
	

	var availableData = Alloy.createCollection(tablename);

	availableData.fetch({
			query : "SELECT * FROM " + tablename,
			source:"local", 
			silent:true
		});
		
	for (var y = availableData.length-1; y >= 0; y--){
		availableData.at(y).destroy({source:"local", silent:true});
	}
}
init();
