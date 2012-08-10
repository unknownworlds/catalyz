var db     = require('./fixtures/database'),
	models = require('./fixtures/models');

var clean  = require('../app/controllers/clean'),
	Player = require('../app/models/Player'),
	Group  = require('../app/models/Group');

describe('Cleaner', function() {
	before(function(done) {
		db.startTest();
		db.drop(done);
	});

	beforeEach(function(done) {
		db.drop(done);
	})

	after(function(done) {
		db.stopTest();
		done();
	});

	it('Player', function(done) {
		var p1 = models.createPlayer("12345", "Henry"),
			p2 = models.createPlayer("67890", "Sophie"),
			p3 = models.createPlayer("22222", "John");

		p1.save(function() {
			p2.save(function() {
				p3.save(function() {
					clean.cleanPlayer(-1, function() {
						Player.find({}, function(err, players) {
							players.length.should.equal(0);
							done();
						});
					});
				});
			});
		});
	});

	it('Group', function(done) {
		var g1 = models.createGroup(),
			g2 = models.createGroup(),
			g3 = models.createGroup();

		g1.save(function() {
			g2.save(function() {
				g3.save(function() {
					clean.cleanGroup(function() {
						Group.find({}, function(err, groups) {
							groups.length.should.equal(0);
							done();
						});
					});
				});
			});
		});
	});
});