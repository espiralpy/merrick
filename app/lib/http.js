/**
 * HTTP Request Helper
 */

/**
 * Standard HTTP Request
 * @param {Object} _params
 * @description The following are valid options to pass through:
 *  _params.timeout		: int Timeout request
 *  _params.type		: string GET/POST
 *  _params.format		: string json, etc.
 *  _params.secure		: enable httpclient property validatesSecureCertificate
 *  _params.data		: mixed The data to pass
 *  _params.url			: string The url source to call
 *  _params.failure		: funtion A function to execute when there is an XHR error
 *  _params.success		: function when successful
 *  _params.passthrough : Any passthrough params
 *  _params.headers     : Array of request headers
 */
exports.request = function(_params) {
	if(Ti.Network.online) {
		Ti.API.debug('HTTP Request');
		// Setup the xhr object
		var xhr = Ti.Network.createHTTPClient();

		if (_params.secure != null){
			Ti.API.debug('secure: ' + _params.secure);
			xhr.validatesSecureCertificate = _params.secure;	
		}

		// Set the timeout or a default if one is not provided
		xhr.timeout = _params.timeout ? _params.timeout : 120000;

		// For mobile web CORs
		if(OS_MOBILEWEB) {
			xhr.withCredentials = true;
		}

		/**
		 * When XHR request is loaded
		 */
		xhr.onload = function(_data) {
			if(_data) {
				if(_params.format === "json") {
					_data = JSON.parse(this.responseText);
				} else if(_params.format === "text") {
					_data = this.responseText;
				} else if(_params.format === "xml") {
					_data = this.responseXML;
				} else {
					_data = this.responseData;
				}
				var headers = (xhr.getResponseHeaders) ? xhr.getResponseHeaders() : null;

				if(_params.success) {
					if(_params.passthrough) {
						_params.success(_data, headers, _params.passthrough);
					} else {
						_params.success(_data, headers);
					}
				} else {
					return _data;
				}
			}
		};

		if(_params.ondatastream) {
			xhr.ondatastream = function(_event) {
				if(_params.ondatastream) {
					_params.ondatastream(_event.progress);
				}
			};
		}

		/**
		 * Error handling
		 * @param {Object} _event The callback object
		 */
		xhr.onerror = function(_event) {
			// Ti.API.error(JSON.stringify(this));
			Ti.API.debug(this);
			for (prop in this){
				Ti.API.debug('Error ' + prop + ': ' + this[prop]);
			}
			Ti.API.debug(_event);
			for (prop in _event){
				Ti.API.debug('Error _event: ' + _event[prop]);
			}
			_params.failure && _params.failure(this, _event);
		};

		// Open the remote connection
		_params.type = _params.type ? _params.type : "GET";
		_params.async = _params.async ? _params.async : true;

		Ti.API.debug('url: ' + _params.url);

		xhr.open(_params.type, _params.url, _params.async);

		if(_params.headers) {
			for (var i = 0, j = _params.headers.length; i < j; i++) {
				Ti.API.debug('header: ' + _params.headers[i].name + ":" + _params.headers[i].value);
				xhr.setRequestHeader(_params.headers[i].name, _params.headers[i].value);
				xhr.setRequestHeader("Content-Type", "application/json");
			}
		}
		
		if(_params.data) {
			// send the data
			var data = (typeof _params.data === "string") ? _params.data : JSON.stringify(_params.data);
			Ti.API.debug("data: " + data);
			xhr.send(data);
		} else {
			xhr.send();
		}
	} else {
		if(_params.failure) {
			_params.failure({ 'error' : 'No internet connection' });
		}
	}
};