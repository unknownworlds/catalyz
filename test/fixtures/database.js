var mongoose = require('mongoose');

var Group  = require('../../app/models/Group'),
	Player = require('../../app/models/Player');

exports.drop = function(callback) {
	Group.remove(function() {
		Player.remove(function() {
			callback();
		});
	});
};

exports.startTest = function() {
	var conn = mongoose.connect('mongodb://localhost/test_Catalyz');
};

exports.stopTest = function() {
};

