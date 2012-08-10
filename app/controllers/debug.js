var Player = require('../models/Player'),
	Group  = require('../models/Group');

exports.infos = function() {
	var request  = this.req,
		response = this.res;

	var infos = {};

	Player.find({}, function(err, doc) {
		infos.players = doc;
		Group.find({}, function(err, doc) {
			infos.groups = doc;

			response.writeHead(200, {"Content-Type": "application/json"});
			response.write(JSON.stringify(infos));
			response.end();
		})
	});
};