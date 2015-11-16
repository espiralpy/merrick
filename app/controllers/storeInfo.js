var args = arguments[0] || {};
$.store = args.store || Alloy.createModel("store");

checkModifiedStore();

function checkModifiedStore(){
	if($.store.has("Id")){
		
		var modifiedStores = Alloy.createCollection("modifiedStore");
		modifiedStores.fetch({query:"SELECT * FROM modifiedStore WHERE StoreId = '" + $.store.get("Id")+ "'"});
		if(modifiedStores.length > 0){
			
				$.store.set({
					Manager 		 : modifiedStores.at(0).get("Manager"),
					Contact			 : modifiedStores.at(0).get("Contact"),
					Comments		 : modifiedStores.at(0).get("Comments")
				});
			
		}
	
 	}
	
}

function init () {
	$.store.on("change", repaint);
	repaint();
}

function repaint () {
	$.id.text = $.store.id;
	$.mailingAddress.text = $.store.get("Address", {full: true});
	$.manager.value = $.store.get("Manager");
	$.contact.value = $.store.get("Contact");
	$.catDry.text = $.store.get("CatDryLinearFeet");
	$.catCan.text = $.store.get("CatCanLinearFeet");
	$.dogDry.text = $.store.get("DogDryLinearFeet");
	$.dogCan.text = $.store.get("DogCanLinearFeet");
	$.treat.text = $.store.get("TreatLinearFeet");
}

function save(){
	
	var checkModifiedStore = Alloy.createCollection("modifiedStore");

	
	checkModifiedStore.fetch({query: "SELECT * FROM modifiedStore WHERE StoreId = '"	+ $.store.get("Id") + "'"});
	if(checkModifiedStore.length > 0){
		checkModifiedStore.at(0).set({
		 	modified_id : checkModifiedStore.at(0).get("modified_id"),
			StoreId : $.store.get("Id"),
			Name : $.store.get("Name"),
			//MailingAddress : $.mailingAddress.text,
			Manager : $.manager.value,
			Contact : $.contact.value,
		});
		checkModifiedStore.at(0).save();
	}else{
		var tmpStore = Alloy.createModel("modifiedStore");
			tmpStore.set({
				StoreId : $.store.get("Id"),
				Name : $.store.get("Name"),
				//Comments : $.mailingAddress.text,
				Manager : $.manager.value,
				Contact : $.contact.value,
		});
		tmpStore.save();
	}
	
}

init();

exports.save = save;