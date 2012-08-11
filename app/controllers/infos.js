var _ = require('underscore');

var Player = require('../models/Player'),
	Group  = require('../models/Group');

var conf    = require('../../config/config'),
	common  = require('./common'),
	regions = conf.get('regions');

var count = function() {
	var request  = this.req,
		response = this.res,
		me       = this;

	var toSend = {
		status: "OK",
		playerCount: 0,
		regions: {}
	};

	function Run(i, regions, callback) {
		if ( i < regions.length ) {
			Player.count({region: regions[i]}, function(err, count) {
				toSend.regions[regions[i]] = count;
				i += 1;
				Run(i, regions, callback);
			});
		} else {
			callback();
		}
	}

	Run(0, regions, function() {
		Group.count({}, function(err, count) {
			toSend.groupCount = count;
			_.each(regions, function(region) {
				toSend.playerCount += toSend.regions[region];
			});

			common.respondJSON.call(me, toSend);
		});
	});
};

exports.count = count;