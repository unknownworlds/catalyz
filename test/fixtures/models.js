var Group  = require('../../app/models/Group'),
	Player = require('../../app/models/Player');

exports.createPlayer = function(id, name) {
	var p = new Player({
		steamID: id,
		nickname: name,
		server: "127.0.0.1:27015",
		region: "Europe",
		build: "200"
	});

	return p;
};

exports.createGroup = function() {
	var g = new Group({
		region: "Europe",
		build: "200",
		server: "127.0.0.1:27015"
	});

	return g;
};