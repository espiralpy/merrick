//var UDID = require('ti.udid');
var App = require("/core");
// var dummy = require("/demodata");
var errorStatus = {
	// "110" : "110 - Invalid Device.", //Strings sent by WebService instead of different values
	// "120" : "120 - Disabled Device.",
	// "130" : "130 - Employee not assigned.",
	// "140" : "140 - Inactive or Terminated employee.",
	// "150" : "150 - Invalid Sales Group or Quad.",
	"401" : "401 - Invalid Username/Password/UID.",
	"500" : "500 - There is an issue on the server, please try again later.",
};

// var UID = UDID.oldUDID;  //OLD DEVICE ID, removed on iOS7
// var UID = "b00ac45c35de7e38ecb03ba2f154f50da2f5d2c2"; //pablo1
// UID = "4506d22dce620b19e828193c8b5b45d0fcd8a895"; //pablo2  ONLY FOR TESTING PURPOUSES

var UID = "-1";

if( Ti.App.Properties.hasProperty("deviceID")){
	UID = Ti.App.Properties.getString("deviceID");
}else{
	UID = Ti.Platform.id;
	Ti.App.Properties.setString("deviceID", Ti.Platform.id);
}


// UID = "4506d22dce620b19e828193c8b5b45d0fcd8a895"; //pablo2  ONLY FOR TESTING PURPOUSES

exports.UID = UID;

var ROOT_URL = Alloy.CFG.ROOT_URL;
var AUTH_HEADER = {
		name: "merrickauth",
		value: "user:password:1234"
	};

function request (params) {
	params = params || {};
	var headers = [ AUTH_HEADER ].concat(params.headers || []);
	var request = require("/http").request({
		type: params.type || "GET",
		format: params.format || "json",
		data: params.data || null,
		url: ROOT_URL + params.uri, //Please note: uri instead of url (for avoiding confussions)
		headers: headers,
		secure: false, //TODO: Remove this once the cert has been validated on the server
		failure: function(response, event){
			response = response || {};
			
			if(response.status == 401){
				alert(response.responseText);
				var userCollection = Alloy.createCollection("user");
				userCollection.fetch({
					query:"SELECT * FROM user WHERE Username = '" + App.user.get("Username") + "'",
					source: "local"
				});
				if(userCollection.length > 0){
					userCollection.at(0).destroy({source:"local"});
				}
				App.user.logout();
				App.user.destroy({source:"local"});

				
			}else{
				var message = errorStatus[response.status] || event && event.error || response.error;
				alert(message);
			}
			
			//App.user.logout(); //Enable to logout user on 500 error from WS
			App.loadingIndicator && App.loadingIndicator.forceHide();
			if(params.callback){
				response.error = true;
				params.callback(response)
			}
		},
		success: function(response){
			if(response){
				params.callback && params.callback(response);
			}else{
				var newResponse = [];
				params.callback && params.callback(newResponse);

			}
		}
	});
}
 
exports.request = request;

exports.salesQuad = function(params){
	params = params || {};
	params.uri = "/SalesQuad";
	request(params);
};

exports.updateCredentials = function(params){
	params = params || {};
	var username = params.username || "";
	var password = params.password || "";
	AUTH_HEADER.value = username + ":" + password + ":" + UID;
};

exports.doLogin = function(params){
	params = params || {};
	exports.updateCredentials(params);
	params.uri = "/QuadWeek?date=" + (new Date()).format("mm-dd-yyyy"); 
	request(params);
};