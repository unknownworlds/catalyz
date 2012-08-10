var db     = require('./fixtures/database'),
	models = require('./fixtures/models');

var conf = require('../config/config');

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

	it('different region give different group', function(done) {
		function Run(i, players, callback) {
			if ( i < players.length) {
				Group.GetPlayerGroup(players[i], function() {
					i += 1;
					Run(i, players, callback);
				});
			} else {
				callback();
			}
		}

		var p = [];

		for(var i = 0; i < 3; i++) {
			p.push(models.createPlayer(String(i), "John" + i));
		}
		p[0].region = "US";
		p[1].region = "EU";
		p[2].region = "US";

		Run(0, p, function() {
			p[0].groupID.equals(p[2].groupID).should.be.true;
			p[0].groupID.equals(p[1].groupID).should.be.false;
			done();
		});
	});

	it('different build give different group', function(done) {
		function Run(i, players, callback) {
			if ( i < players.length) {
				Group.GetPlayerGroup(players[i], function() {
					i += 1;
					Run(i, players, callback);
				});
			} else {
				callback();
			}
		}

		var p = [];

		for(var i = 0; i < 3; i++) {
			p.push(models.createPlayer(String(i), "John" + i));
		}
		p[0].build = "200";
		p[1].build = "201";
		p[2].build = "200";

		Run(0, p, function() {
			p[0].groupID.equals(p[2].groupID).should.be.true;
			p[0].groupID.equals(p[1].groupID).should.be.false;
			done();
		});
	});

	it('start after group:min players', function(done) {
		var min = conf.get('group:min'),
			g   = models.createGroup(),
			p   = [];

		for(var i = 0; i < min; i++) {
			p.push(models.createPlayer(String(i), "John" + i));
			g.addPlayer(p[i]);
		}

		g.save(function(err) {
			Group.findOne({}, function(err, group) {
				group.players.length.should.equal(min);
				group.playerCount.should.equal(min);
				group.hasStarted.should.be.true;
				done();
			});
		});
	});

	it('can\'t have more than group:max players in a group', function(done) {
		var max = conf.get('group:max'),
			n   = max + 1,
			p   = [];

		function Run(i, players, callback) {
			if ( i < players.length) {
				Group.GetPlayerGroup(players[i], function() {
					i += 1;
					Run(i, players, callback);
				});
			} else {
				callback();
			}
		}

		for(var i = 0; i < n; i++) {
			p.push(models.createPlayer(String(i), "John" + i));
		}

		Run(0, p, function() {
			p[0].groupID.equals(p[max-1].groupID).should.be.true;
			p[max-1].groupID.equals(p[n-1].groupID).should.be.false;
			done();
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