var mongoose = require('mongoose'),
	Schema   = mongoose.Schema;

var _       = require('underscore'),
	winston = require('winston');

var conf = require('../../config/config');

var Player    = require('./Player'),
	Semaphore = require('../../lib/Semaphore');

var GroupSchema = new Schema({
	players: [],
	playerCount: Number,
	region: String,
	build: String,
	server: String,
	hasStarted: Boolean,
	createDate: Date,
	updateDate: Date
});

GroupSchema.index({playerCount: 1, region: 1, build: 1, hasStarted: 1});

GroupSchema.pre('save', function(next) {
	this.players = this.players ? this.players : [];
	this.createDate = this.createDate ? this.createDate : new Date();
	this.playerCount = this.playerCount ? this.playerCount : 0;
	this.hasStarted = this.hasStarted ? this.hasStarted : 0;
	this.waitingPlayerNumber = this.waitingPlayerNubmer ? this.playerNubmer : 0;
	this.joinPlayerNumber = this.joinPlayerNubmer ? this.playerNubmer : 0;

	this.updateCount();
	this.updateDate = new Date();

	next();
});

/**
 * Update different counter
 */
GroupSchema.methods.updateCount = function() {
	this.playerCount = this.players.length;
};

GroupSchema.methods.addPlayer = function(player) {
	var test = false;

	_.each(this.players, function(p) {
		test = test || p.steamID == player.steamID;
	});

	if (!test) {
		this.players.push({
			steamID: player.steamID,
			nickname: player.nickname
		});

		if (this.players.length >= conf.get('group:min')) {
			this.hasStarted = true;
			winston.info('group start');
		}

		this.updateCount();
	}
};

GroupSchema.methods.removePlayer = function(player) {
	this.players = _.filter(this.players, function(item) {
		return item.steamID != player.steamID;
	});
	this.sendNotification("" + player.nickname + " has left");
	this.updateCount();
};

GroupSchema.methods.sendMessage = function(author, message, callback) {
	var finish = new Semaphore(function() {
		if (callback) callback();
	});
	finish.set(this.players.length);

	_.each(this.players, function(p) {
		Player.findOne({ steamID: p.steamID}, function(err, player) {
			player.pushMessage(author, message, function() {
				finish();
			});
		});		
	});
};

GroupSchema.methods.sendNotification = function(message, callback) {
	var finish = new Semaphore(function() {
		if (callback) callback();
	});
	finish.set(this.players.length);

	_.each(this.players, function(p) {
		Player.findOne({ steamID: p.steamID}, function(err, player) {
			if (!player) {
				return;
			}
			player.pushNotification(message, function() {
				finish();
			});
		});		
	});
};

/**
 * Get the group of player using groupID.
 * If the ID is null, choose or create a group for the player
 */
GroupSchema.statics.GetPlayerGroup = function(player, callback) {
	var Group = this;

	if (player.groupID) {
		Group.findById(player.groupID, function(err, group) {
			callback(group);
		});
	} else {
		Group.findOne({ build: player.build, region: player.region}).lt('playerCount', conf.get('group:max')).gte('playerCount', 1).exec(function(err, group) {
			if (!group) {
				group = new Group({
					build: player.build,
					region: player.region,
					server: player.server
				});
				group.players = [];
			}

			group.addPlayer(player);
			group.save(function(err) {
				player.groupID = group._id;
				player.save(function(err) {
					callback(group);
					group.sendNotification("" + player.nickname + " has joined");
				});
			});			
		});
	}
}

module.exports = mongoose.model('Group', GroupSchema);