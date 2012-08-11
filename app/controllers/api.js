var url = require('url');

var common  = require('./common'),
	clean = require('./clean');

var Player = require('../models/Player'),
	Group  = require('../models/Group');

exports.register = function() {
	var request = this.req,
		response = this.res;

	var query = url.parse(request.url, true).query,
		server = query.server,
		steamID = query.steamID,
		build = query.build,
		region = query.region,
		nickname = query.nickname;

	if (!common.checkParameter.call(this, [server, steamID, build, region, nickname])) return;

	Player.findOne({'steamID' : steamID}, function(err, player) {
		if (player == null) {
			var player = new Player({
				steamID: steamID,
				nickname: nickname,
				server: server,
				build: build,
				region: region,
			});
			player.save();
		}

		Group.GetPlayerGroup(player, function(group) {
			var toSend = {
				player: player,
				group: group
			};

			console.log('REGISTER: ' + steamID);
			response.writeHead(200, {"Content-Type": "application/json"});
			response.write(JSON.stringify(toSend));
			response.end();
		});
	});
};

exports.deregister = function() {
	var request  = this.req,
		response = this.res;

	var query   = url.parse(request.url, true).query,
		steamID = query.steamID,
		reason  = query.reason;

	if(!common.checkParameter.call(this, [steamID])) return;

	Player.findOne({'steamID' : steamID}, function(err, player) {
		if (player) {
			clean.removePlayer(player, function() {
				console.log('DEREGISTER: ' + steamID);
				response.end();
			});
		} else {
			response.end();
		}
	});
};

exports.update = function() {
	var request  = this.req,
		response = this.res,
		me       = this;

	var query   = url.parse(request.url, true).query,
		steamID = query.steamID;

	if(!common.checkParameter.call(this, [steamID])) return;

	Player.findOne({ steamID: steamID}, function(err, player) {
		if (player == null) {
			common.respondError().call(me);
			return;
		}
		player.save();

		Group.GetPlayerGroup(player, function(group) {
			var toSend = {
				group: group
			};

			common.respondJSON.call(me, toSend);
		});
	})
};