var mongoose = require('mongoose'),
	Schema   = mongoose.Schema;

var _ = require('underscore');

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
	this.players.push({
		steamID: player.steamID,
		nickname: player.nickname
	});

	if (this.players.length >= 8) {
		this.hasStarted = true;
	}

	this.updateCount();
};

GroupSchema.methods.removePlayer = function(player) {
	this.players = _.filter(this.players, function(item) {
		return item.steamID != player.steamID;
	});
	this.updateCount();
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
		Group.findOne({ build: player.build, region: player.region}).lte('playerCount', 8).gte('playerCount', 1).exec(function(err, group) {
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
				});
			});			
		});
	}
}

module.exports = mongoose.model('Group', GroupSchema);