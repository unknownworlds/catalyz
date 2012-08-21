var db = require('./fixtures/database'),
	request = require('supertest'),
	should = require('should');

var app = require('../app/server'),
	Continents = require('../lib/geodata/Continents'),
	Group = require('../app/models/Group');

describe('API v1', function() {
	before(function(done) {
		db.startTest();
		db.drop(function() {
			Continents.init(done);
		});
	});

	beforeEach(function(done) {
		db.drop(done);
	});

	after(function(done) {
		db.stopTest();
		done();
	});

	describe('/register', function() {
		it('fail if not every GET param', function(done) {
			request(app).get('/v1/register')
				.expect('Content-Type', /json/)
				.expect(400, done);
		});

		it('return group and player', function(done) {
			request(app).get('/v1/register?region=FR&steamID=0&nickname=John&build=200&server=120.0.0.1:27015')
				.expect('Content-Type', /json/)
				.expect(200)
				.end(function(err, response) {
					var body = response.body;
					body.should.have.property('group');
					body.group.should.have.property('players');
					body.group.should.have.property('server');
					body.should.have.property('player');
					body.player.should.have.property('server');
					body.player.should.include({ steamID: "0", nickname: "John", region: "Europe"});
					body.player.should.have.property('groupID');
					done();
				});
		});
	});

	describe('/update', function() {
		it('fail if no steamID', function(done) {
			request(app).get('/v1/update')
				.expect(400, done);
		});

		it('doesn\'nt crash if wrong steamID', function(done) {
			request(app).get('/v1/update?steamID=1')
				.expect(400, done);
		});

		it('update show new person', function(done) {
			request(app).get('/v1/register?region=Europe&steamID=12345&nickname=John&build=200&server=127.0.0.1:27015')
				.end(function(err, response) {
					request(app).get('/v1/register?region=Europe&steamID=98765&nickname=Jane&build=200&server=127.0.0.1:27015')
						.end(function(err, response) {
							request(app).get('/v1/update?steamID=98765')
								.end(function(err, response) {
									response.body.group.players.length.should.equal(2);
									response.body.group.playerCount.should.equal(2);
									response.body.group.server.should.equal("127.0.0.1:27015");
									done();
								});
						});
				});
		});

		it('update return messages', function(done) {
			request(app).get('/v1/register?region=Europe&steamID=12345&nickname=John&build=200&server=127.0.0.1:27015')
				.end(function(err, response) {
					request(app).get('/v1/register?region=Europe&steamID=98765&nickname=Jane&build=200&server=127.0.0.1:27015')
						.end(function(err, response) {
							request(app).get('/v1/update?steamID=12345')
								.end(function(err, response) {
									(response.body.messages.length >= 1).should.be.true;
									response.body.messages[0].author.should.equal("Server");
									done();
								});
						});
				});
		});
	});

	describe('/status', function() {
		it('count are ok', function(done) {
			request(app).get('/v1/register?region=GB&steamID=1&nickname=John&build=200&server=120.0.0.1:27015')
				.end(function(err, response) {
					request(app).get('/v1/register?region=CN&steamID=2&nickname=Jane&build=200&server=120.0.0.1:27015')
						.end(function(err, response) {
							request(app).get('/v1/register?region=US&steamID=3&nickname=Jane&build=200&server=120.0.0.1:27015')
								.end(function(err, response) {
									request(app).get('/v1/register?region=FR&steamID=4&nickname=Jane&build=200&server=120.0.0.1:27015')
										.end(function(err, response) {
											request(app).get('/v1/status')
												.end(function(err, response) {
													var body = response.body;
													body.playerCount.should.equal(4);
													body.groupCount.should.equal(3);
													body.regions['North America'].should.equal(1);
													body.regions.Europe.should.equal(2);
													body.regions.Asia.should.equal(1);
													body.regions.Africa.should.equal(0);
													done();
												});
										});
								});
						});
				});
		});
	});

	describe('/deregister', function() {
		it('fail if no steamID', function(done) {
			request(app).get('/v1/deregister')
				.expect(400, done);
		});

		it('doesn\'nt crash if wrong steamID', function(done) {
			request(app).get('/v1/deregister?steamID=1')
				.expect(400, done);
		});

		it('deregister', function(done) {
			request(app).get('/v1/register?region=Europe&steamID=12345&nickname=John&build=200&server=120.0.0.1:27015')
				.end(function(err, response) {
					request(app).get('/v1/register?region=Europe&steamID=98765&nickname=Jane&build=200&server=120.0.0.1:27015')
						.end(function(err, response) {
							request(app).get('/v1/deregister?steamID=12345')
								.end(function(err, response) {
									request(app).get('/v1/update?steamID=98765')
										.end(function(err, response) {
											response.body.group.players.length.should.equal(1);
											response.body.group.playerCount.should.equal(1);
											done();
										});
								});
						});
				});
		});

		it('remove Group if nobody is inside', function(done) {
			request(app).get('/v1/register?region=Europe&steamID=12345&nickname=John&build=200&server=120.0.0.1:27015')
				.end(function(err, response) {
					var groupID = response.body.player.groupID;

					request(app).get('/v1/deregister?steamID=12345')
						.end(function(err, response) {
							Group.findById(groupID, function(err, group) {
								should.not.exist(group);
								done();
							});
						});
				});
		});
	});
});