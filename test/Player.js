var db = require('./fixtures/database');

var Player = require('../app/models/Player');

describe('Player', function() {
	before(function(done) {
		db.startTest();
		db.drop(done);
	});

	beforeEach(function(done) {
		Player.remove(function() {
			done();
		});
	})

	after(function(done) {
		db.stopTest();
		done();
	});

	it('create Player', function(done) {
		var date = new Date;
		var p = new Player();

		p.steamID = "1904329044";
		p.nickname = "John";
		p.region = "Europe";
		p.build = "200";

		p.save(function(err) {
			Player.findOne({ steamID : "1904329044"}, function(err, player) {
				player.steamID.should.equal("1904329044");
				player.region.should.equal("Europe");
				player.build.should.equal("200");
				player.nickname.should.equal("John");
				player.updateDate.should.within(date, new Date());
				done();
			});
		});
	});
});