exports.definition = {
	config: {
		columns: {
			"Username" : "TEXT PRIMARY KEY",
			"Password" : "text",
		    "Name": "text",
		    "Position": "text",
		    "LastSync" : "date"
		},
		adapter: {
			type: "ws_local_sync",
			idAttribute : "Username",
			collection_name: "user"
		}
	},		
	extendModel: function(Model) {		
		_.extend(Model.prototype, {
			idAttribute : "Username",
			set: function(attrs, opts){
				if(attrs.LastSync && _.isNumber(attrs.LastSync)){
					attrs.LastSync = new Date(attrs.LastSync);
				}
				return Backbone.Model.prototype.set.call(this, attrs, opts);
			},
			/**
			 * @method Tries to login within the backend
			 * @param {String} username
			 * @param {String} password
			 * @param {function} onLogin(state, model) callback function to be invoked after the ws returned a response
			 */
			login: function(username, password, onLogin){
				
				var model 	= this;
				var now = new Date();
				
				var expirationDate;
				
				if(Ti.App.Properties.hasProperty("validSession")){ 
					expirationDate = new Date( parseInt(Ti.App.Properties.getString("validSession")));
				}else{
					expirationDate = new Date(now.getTime() - 99999);
				}
				
				if(now.getTime() > expirationDate.getTime()){  
					externalLogin(username, password, model, onLogin);
				}
				else{	
						Ti.API.info("Fetching local user");
						model.fetch({
							source : "local",
							data : {
								"Username" : username,
								"Password" : password
							},
							success : function(newUser, response){
								if(response && (response.length > 0 || _.size(response) > 0)){
									require("api").updateCredentials({
										username : model.get("Username"),
										password : model.get("Password")
									});
									
									model.set({
										"LoggedIn" : true
									});
									onLogin && onLogin({
										success : true
									});
								} else {
										externalLogin(username, password, model, onLogin);
								}
							},
							error : function(){
								externalLogin(username, password, model, onLogin);
							}
						});						
					
					}
					
				
				

			},
			/**
			 * @method Log out the user from the backend
			 * @param {function} onLogout(status, model) being called after the backend has returned a status
			 */
			logout: function(onLogout){
				this.clear().set("LoggedIn", false);
			}
		});
		
		return Model;
	},
	extendCollection: function(Collection) {		
		_.extend(Collection.prototype, {
			// extended functions and properties go here
		});
		
		return Collection;
	}
}

function externalLogin (username, password, model, onLogin) {
	
	Ti.API.info("external Login");
	var Api = require("api");
	Api.doLogin({
		username: username,
		password: password,
		callback: function(response){
			if(response.error){
				onLogin && onLogin({
					success : false
				});
			} else {
						//Ti.API.info("login response"  + JSON.stringify(response));
						var now = new Date();
						var expiration = new Date((new Date()).getTime() + (72 * 60 * 60 * 1000));
						
						Ti.App.Properties.setString('validSession', (expiration.getTime()).toString());
						
						if(Ti.App.Properties.hasProperty('userLastAlerted')){
							var lastAlerted = (new Date(parseInt(Ti.App.Properties.getString('userLastAlerted')))).getTime();
								
							if( (now.getTime() - lastAlerted) > 24 * 60 * 60 * 1000){
									Ti.App.Properties.setString('userLastAlerted', (now.getTime()).toString());
									alert("Your session will expire on:\n" + expiration.format("dddd mmm dd, yyyy\n HH:MM"));
							}
						}else{
							Ti.App.Properties.setString('userLastAlerted', (now.getTime()).toString() );
							alert("Your session will expire on:\n" + expiration.format("dddd mmm dd, yyyy\n HH:MM"));
						}								
						 Ti.App.Properties.setString('username', username);
						 Ti.App.Properties.setString('password', password);	
						model.save({
							"Username" : username,
							"Password" : password,
							"LoggedIn" : true
						}, {
							source : "local"
						});
						onLogin && onLogin({
							success : true
						});
					}
		}
	});
}