var mongoose = require('mongoose');

var Group  = require('../../app/models/Group'),
	Player = require('../../app/models/Player');

var db;

exports.drop = function(callback) {
	Group.remove({}, function() {
		Player.remove({}, function() {
			callback();
		});
	});
};

exports.startTest = function() {
	db = mongoose.connect('mongodb://localhost/test_Catalyz');
};

exports.stopTest = function() {
	mongoose.disconnect();
};

