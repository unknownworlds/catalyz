var Group  = require('../models/Group'),
	Player = require('../models/Player');

var Semaphore = require('../../lib/Semaphore');

var _ = require('underscore');

var cleanPlayer = function(idle, callback) {
	var now = new Date(),
		limitDate = now.setSeconds(now.getSeconds() - idle);

	var removeAll = function(i, players) {
		if (i < players.length) {
			removePlayer(players[i], function() {
				i += 1;
				removeAll(i, players);
			});
		} else if (callback) {
			callback();
		}
	};

	Player.find({updateDate : { $lt : limitDate }}, function(err, players) {
		removeAll(0, players);
	});
};
exports.cleanPlayer = cleanPlayer;

var cleanGroup = function(callback) {
	var removeAll = function(i, groups) {
		if (i < groups.length) {
			groups[i].remove(function() {
				i += 1;
				removeAll(i, groups);
			});
		} else if (callback) {
			callback();
		}	
	};

	Group.find({playerCount: 0}, function(err, groups) {
		removeAll(0, groups);
	});
};
exports.cleanGroup = cleanGroup;


var removePlayer = function(player, callback) {
	var groupCallback = function() {
		player.remove(function() {
			callback();
		});
	};

	Group.find({"players.steamID": player.steamID}, function(err, groups) {
		if (groups.length == 0) {
			groupCallback();
			return;
		}

		var semaphore = new Semaphore(function() {
			groupCallback();
		});
		semaphore.set(groups.length);

		_.each(groups, function(group) {
			group.removePlayer(player);

			if (group.players.length == 0) {
				group.remove(semaphore);
			} else {
				group.save(semaphore);
			}
		});		
	});
}
exports.removePlayer = removePlayer;