var loads = {};
var index = 0;
var callback;

$.show = function(params){
	params = params || {};
	loads[index] = params;
	index++;
	load(_.last(_.toArray(loads)));
	if(_.size(loads) == 1){
		$.window.open();
	}
	return index - 1;
};

$.hide = function(index){
	if(loads[index]){
		delete loads[index];
	}
	load(_.last(_.toArray(loads)));
	if(_.size(loads) == 0){
		$.window.close();
		callback && callback();
		callback = null;
	}
};

$.forceHide = function(){
	loads = {};
	index = 0;
	callback = null;
	$.window.close();
};

function load (params) {
	if(params){
		if( 
			(params.message == "Validating data") || 
			(params.message == "Processing") || 
			(params.message == "Syncing Information") || 
			(params.message == "Uploading Plan")  || 
			(params.message == "Deleting")  || 
			(params.message == "Saving") 
		){
				
				$.loadingText.text = params.message;
		}else{
			$.loadingText.text = "Loading " + params.message;
		}
		callback = params.onHide || callback;
	}
}