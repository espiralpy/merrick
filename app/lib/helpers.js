exports.nextSunday = function(date){
	// Ti.API.info("Date at date        " + date);
	date = exports.clearTimeForceTimezone(date);
	var dateCheck = new Date(date.getTime());
	// Ti.API.info("Date at date clean  " + date);
	var day = 7 - (date.getDay() > 0 ? date.getDay() : 7);
	// Ti.API.info("Date at helpers     " + day);
	date.setTime(date.getTime() + (day * 24 * 60 * 60 * 1000));
	// Ti.API.info("Date at helpers     " + date);
	// if(date.getTime() == dateCheck.getTime()){
		// day = 7 - (date.getDay() > 0 ? date.getDay() : 0);
		// Ti.API.info("2ndDate at helpers     " + day);
		// date.setTime(date.getTime() - (day * 24 * 60 * 60 * 1000) );
		// Ti.API.info("2ndDate at helpers     " + date);
	// }
	
	return date;
};
exports.nextSundayForward = function(date){
	// Ti.API.info("Date at date        " + date);
	date = exports.clearTimeForceTimezone(date);
	var dateCheck = new Date(date.getTime());
	// Ti.API.info("Date at date clean  " + date);
	var day = 7 - (date.getDay() > 0 ? date.getDay() : 7);
	// Ti.API.info("Date at helpers     " + day);
	date.setTime(date.getTime() + (day * 24 * 60 * 60 * 1000));
	// Ti.API.info("Date at helpers     " + date);
	if(date.getTime() == dateCheck.getTime()){
		day = 7 - (date.getDay() > 0 ? date.getDay() : 0);
		// Ti.API.info("2ndDate at helpers     " + day);
		date.setTime(date.getTime() + (day * 24 * 60 * 60 * 1000) );
		// Ti.API.info("2ndDate at helpers     " + date);
	}
	
	return date;
};
exports.clearTime = function(date){
	date.setMilliseconds(0);
	date.setSeconds(0);
	date.setMinutes(0);
	date.setHours(0);
	return date;
};
exports.clearTimeForceTimezone = function(date){
	date.setMilliseconds(0);
	date.setSeconds(0);
	date.setMinutes(0);
	date.setHours(17);
	return date;
};

exports.wordSeparator = function(formattedWords){
	if(formattedWords != "InProcess"){
			if(formattedWords == null || formattedWords == ""){
		return "";
		}
		var separatedWord = formattedWords.match(/[A-Z]?[a-z]+/g);
		return separatedWord.join(" ");
	}else{
		return "Rejected";
	}
};
