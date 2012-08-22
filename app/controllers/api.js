var url = require('url');

var Continents = require('../../lib/geodata/Continents');

var common  = require('./common'),
	clean = require('./clean');

var Player = require('../models/Player'),
	Group  = require('../models/Group');

exports.register = function() {
	var request  = this.req,
		response = this.res,
		me       = this;

	var query = url.parse(request.url, true).query,
		server = query.server,
		steamID = query.steamID,
		build = query.build,
		region = query.region,
		nickname = query.nickname;

	if (!common.checkParameter.call(this, [server, steamID, build, region, nickname])) return;

	if (region.length == 2) {
		region = Continents.fromCountry(region);
		if (!region) {
			region = "North America";
		}
	}

	Player.findOne({'steamID' : steamID}, function(err, player) {
		var callback = function(err) {
			if (err) {
				common.respondError.call(me);
			}

			Group.GetPlayerGroup(player, function(group) {
				var toSend = {
					player: player,
					group: group
				};
				common.respondJSON.call(me, toSend);
			});
		};

		if (player == null) {
			var player = new Player({
				steamID: steamID,
				nickname: nickname,
				server: server,
				build: build,
				region: region,
			});
			player.save(callback);
		} else {
			callback();
		}	
	});
};

exports.deregister = function() {
	var request  = this.req,
		response = this.res,
		me       = this;

	var query   = url.parse(request.url, true).query,
		steamID = query.steamID,
		reason  = query.reason;

	if(!common.checkParameter.call(this, [steamID])) return;

	Player.findOne({'steamID' : steamID}, function(err, player) {
		if (player != null) {
			clean.removePlayer(player, function() {
				common.respondJSON.call(me, {status: 'OK', description: steamID + ' has been deregistered.'});
			});
		} else {
			common.respondError.call(me);
		}
	});
};

exports.update = function() {
	var request  = this.req,
		response = this.res,
		me       = this;

	var query   = url.parse(request.url, true).query,
		steamID = query.steamID,
		message = query.message;

	if(!common.checkParameter.call(this, [steamID])) return;

	Player.findOne({ steamID: steamID}, function(err, player) {
		if (player == null) {
			common.respondError.call(me);
			return;
		}
		player.save();

		Group.GetPlayerGroup(player, function(group) {
			var next = function(player) {
				player.getAllMessages(function(messages) {
					var toSend = {
						group: group
					};

					if (messages.length > 0) {
						toSend.messages = messages;
					}

					common.respondJSON.call(me, toSend);
				});			
			};

			if (message) {
				group.sendMessage(player.nickname, message, function() {
					Player.findOne({ steamID: steamID}, function(err, player) {
						next(player);
					});
				});
			} else {
				next(player);
			}			
		});
	})
};