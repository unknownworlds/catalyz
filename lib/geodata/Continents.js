var fs   = require('fs'),
	conf = require('../../config/config');

var countryData;

var init = function(callback) {
	fs.readFile(__dirname + '/data.json', function(err, data) {
		countryData = JSON.parse(data);
		if (callback) {
			callback();
		}
	});
};
exports.init = init;

var fromCountry = function(code) {
	if (!countryData) {
		throw "Country data are not initialized";
	}

	if (countryData[code]) {
		return countryData[code].continent;
	} else {
		return null;
	}
};
exports.fromCountry = fromCountry;