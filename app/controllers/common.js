var _ = require('underscore');

/**
 * Check all the list of parameters exist and defined.
 * If one doesn't, send an error to the client
 */
var checkParameter = function(list) {
	var request = this.req,
		response = this.res;

	var test = true;

	_.each(list, function(item) {
		test = test && item != undefined && item != null ? true : false;
	});

	if (!test) {
		respondError.call(this, 'Miss parameters');
	}

	return test;
};
exports.checkParameter = checkParameter;

var respondError = function(message, code) {
	var request = this.req,
		response = this.res;

	code = code ? code : 400;
	message = message ? message : "I'm so sorry..."

	response.writeHead(400, {"Content-Type": "application/json"});
	response.write(JSON.stringify({ status: 'ERROR', code: code, description: message}));
	response.end();


};
exports.respondError = respondError;

var respondJSON = function(json) {
	var request = this.req,
		response = this.res;

	response.writeHead(200, {"Content-Type": "application/json"});
	response.write(JSON.stringify(json));
	response.end();
};
exports.respondJSON = respondJSON;