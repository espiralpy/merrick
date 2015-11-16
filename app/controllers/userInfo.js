var App = require("/core");
var args = arguments[0] || {};
var today = App.today;
var photoUrl = Ti.App.Properties.getString('userAvatar',"/dashboard/photoplaceholder.png") ;

App.user.on("change", function(model, options){
	$.user.value = Ti.App.Properties.getString("userRealName", model.get("Username")) ;
	$.date.text = App.today.format("mmmm dd, yyyy");
	$.sales.text = model.get("Position");
});


$.user.addEventListener("blur",function(e){
	//Ti.API.info(JSON.stringify(e));
	Ti.App.Properties.setString("userRealName", $.user.value );
});

function init() {
	var photoUrl = Ti.App.Properties.getString("userAvatar","/dashboard/photoplaceholder.png") ;


	if(args.showSales){
		$.data.remove($.welcome);
	} else {
		$.data.remove($.sales);
	}
	$.avatar.image = photoUrl;
}



function openCamera(rcvEvent){
	var rcvImage = rcvEvent.source;
		var cameraOrGalleryDialog = Titanium.UI.createAlertDialog({
		    title: 'Select source',
		    message: 'Select Image Source',
		    buttonNames: ['Camera','Gallery'],
		    cancel: 1
		});
		
		
		cameraOrGalleryDialog.addEventListener('click', function(evt) {
		    if (evt.index == 0) { // clicked "Camera"
		    		Ti.Media.showCamera({
							allowEditing:  true,
							success: function(e) {
								
					 		var tempDate = new Date().getTime();
					 		photoUrl = Ti.Filesystem.applicationDataDirectory+ tempDate+ '_temp.png';

							var tmpPhoto = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, tempDate + '_temp.png');
					 		tmpPhoto.write(e.media);
					 		Ti.App.Properties.setString('userAvatar',photoUrl);
					 		rcvImage.image = photoUrl;
					 	},
						cancel:function() {
						},
						error:function(error) {
							// called when there's an error
							var a = Titanium.UI.createAlertDialog({title:'Camera'});
							if (error.code == Titanium.Media.NO_CAMERA) {
								a.setMessage('Please run this test on device');
							} else {
								a.setMessage('Unexpected error: ' + error.code);
							}
							a.show();
						},
					});

		    } else if (evt.index == 1) { // clicked "Gallery"
					Ti.Media.openPhotoGallery({
						allowEditing:  true,
						 	success: function(e) {
						 		
						 		var tempDate = new Date().getTime();
						 		photoUrl = Ti.Filesystem.applicationDataDirectory+ tempDate+ '_temp.png';
						 
						 		var tmpPhoto = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, tempDate + '_temp.png');
						 		tmpPhoto.write(e.media);
						 		
					 			Ti.App.Properties.setString('userAvatar',photoUrl);
						 		rcvImage.image = photoUrl;
						 	},
						 	cancel:function() {
						 		},
						 	error:function(error) {
						 		var a = Titanium.UI.createAlertDialog({title:'Camera'});
						 		if (error.code == Titanium.Media.NO_CAMERA) {
						 			a.setMessage('Please run this test on device');
						 		} else {
						 			a.setMessage('Unexpected error: ' + error.code);
						 		}
						 		a.show();
						 	},
					});
		    	}    
		});	
	
	cameraOrGalleryDialog.show();
	
}

init();