var db     = require('./fixtures/database'),
	models = require('./fixtures/models');

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

	describe('basic', function() {
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

	describe('messaging', function() {
		it('add message', function(done) {
			var p = models.createPlayer("1", "John");

			p.pushMessage("marc", "Hello World", function() {
				p.pushNotification("Someone joins", function() {
					p.pushMessage("sarah", "Hello Sir", function() {
						p.messages.length.should.equal(3);
						for (var i = 0; i < p.messages.length; i++) {
							p.messages[i].should.have.property("author");
							p.messages[i].should.have.property("message");
							p.messages[i].should.have.property("isNotification");
						}
						p.messages[0].message.should.equal("Hello World");
						p.messages[0].isNotification.should.equal(false);
						p.messages[0].author.should.equal("marc");
						p.messages[1].author.should.equal("Server");
						p.messages[1].isNotification.should.equal(true);

						done();
					});
				});
			});
			
		});

		it('get all messages', function(done) {
			var p = models.createPlayer("1", "John");

			p.pushMessage("marc", "Hello World", function() {
				p.pushNotification("Someone joins", function() {
					p.pushMessage("sarah", "Hello Sir", function() {
						p.GetAllMessages(function(m) {
							m.length.should.equal(3);
							for (var i = 0; i < m.length; i++) {
								m[i].should.have.property("author");
								m[i].should.have.property("message");
								m[i].should.have.property("isNotification");
							}
							m[0].message.should.equal("Hello World");
							m[0].isNotification.should.equal(false);
							m[0].author.should.equal("marc");
							m[1].author.should.equal("Server");
							m[1].isNotification.should.equal(true);

							p.messages.length.should.equal(0);

							done();
						});
					});
				});
			});
		});
	});
	
});