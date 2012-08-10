var db     = require('./fixtures/database'),
	models = require('./fixtures/models');

var Group  = require('../app/models/Group'),
	Player = require('../app/models/Player');

describe('Group', function() {
	before(function(done) {
		db.startTest();
		db.drop(done);
	});

	beforeEach(function(done) {
		Group.remove(function() {
			done();
		});
	});

	after(function(done) {
		db.stopTest();
		done();
	});

	it('create Group', function(done) {
		var date = new Date;
		var g = new Group();

		g.region = "Europe";
		g.build = "200";
		g.players = [];
		g.updateCount();

		g.save(function(err) {
			Group.findOne({}, function(err, group) {
				group.region.should.equal("Europe");
				group.build.should.equal("200");
				group.updateDate.should.within(date, new Date());
				done();
			});
		});
	});

	it('add player to a Group', function(done) {
		var p1 = models.createPlayer("1234", "John"),
			p2 = models.createPlayer("2345", "Jane"),
			p3 = models.createPlayer("3456", "Simon");
		
		var g = models.createGroup();

		g.addPlayer(p1);
		g.addPlayer(p2);
		g.addPlayer(p3);

		g.save(function(err) {
			Group.findOne({}, function(err, group) {
				group.players.length.should.equal(3);
				group.playerCount.should.equal(3);
				group.hasStarted.should.be.false;
				done();
			});
		});
	});

	it('start after 8 players', function(done) {
		var p1 = models.createPlayer("1", "John"),
			p2 = models.createPlayer("2", "Jane"),
			p3 = models.createPlayer("3", "Simon"),
			p4 = models.createPlayer("4", "Jin"),
			p5 = models.createPlayer("5", "Sol"),
			p6 = models.createPlayer("6", "Kevin"),
			p7 = models.createPlayer("7", "Harry"),
			p8 = models.createPlayer("8", "Sonia");
		
		var g = models.createGroup();

		g.addPlayer(p1);
		g.addPlayer(p2);
		g.addPlayer(p3);
		g.addPlayer(p4);
		g.addPlayer(p5);
		g.addPlayer(p6);
		g.addPlayer(p7);
		g.addPlayer(p8);

		g.save(function(err) {
			Group.findOne({}, function(err, group) {
				group.players.length.should.equal(8);
				group.playerCount.should.equal(8);
				group.hasStarted.should.be.true;
				done();
			});
		});
	});

	it('remove player to a Group', function(done) {
		var p1 = models.createPlayer("1234", "John"),
			p2 = models.createPlayer("2345", "Jane"),
			p3 = models.createPlayer("3456", "Simon");
		
		var g = models.createGroup();

		g.addPlayer(p1);
		g.addPlayer(p2);
		g.addPlayer(p3);

		g.players[0].steamID.should.equal(p1.steamID);
		g.players[1].steamID.should.equal(p2.steamID);
		g.players[2].steamID.should.equal(p3.steamID);

		g.removePlayer(p1);
		g.removePlayer(p2);

		g.save(function(err) {
			Group.findOne({}, function(err, group) {
				
				group.players.length.should.equal(1);
				group.playerCount.should.equal(1);
				done();
			});
		});
	});

	it('find Group of a Player', function(done) {
		var p = models.createPlayer("1234", "John");

		Group.GetPlayerGroup(p, function(group) {
			Player.findOne({ steamID : "1234"}, function(err, player) {
				player.groupID.equals(group._id).should.be.true;
				group.players[0].steamID.should.equal(player.steamID);
				group.region.should.equal("Europe");
				group.build.should.equal("200");
				group.server.should.equal("127.0.0.1:27015");
				done();
			});
		});
	});
})