var db = require('./fixtures/database'),
	request = require('supertest'),
	should = require('should');

var app = require('../app/server'),
	Group = require('../app/models/Group');

describe('API v1', function() {
	before(function(done) {
		db.startTest();
		db.drop(done);
	});

	beforeEach(function(done) {
		db.drop(done);
	});

	describe('/register', function() {
		it('fail if not every GET param', function(done) {
			request(app).get('/v1/register')
				.expect('Content-Type', /json/)
				.expect(400, done);
		});

		it('return group and player', function(done) {
			request(app).get('/v1/register?region=Europe&steamID=12345&nickname=John&build=200&server=120.0.0.1:27015')
				.expect('Content-Type', /json/)
				.expect(200)
				.end(function(err, response) {
					var body = response.body;
					body.should.have.property('group');
					body.group.should.have.property('players');
					body.should.have.property('player');
					body.player.should.include({ steamID: "12345", nickname: "John"});
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

		it('update show new person', function(done) {
			request(app).get('/v1/register?region=Europe&steamID=12345&nickname=John&build=200&server=120.0.0.1:27015')
				.end(function(err, response) {
					request(app).get('/v1/register?region=Europe&steamID=98765&nickname=Jane&build=200&server=120.0.0.1:27015')
						.end(function(err, response) {
							request(app).get('/v1/update?steamID=98765')
								.end(function(err, response) {
									response.body.group.players.length.should.equal(2);
									response.body.group.playerCount.should.equal(2);
									done();
								});
						});
				});
		});
	});

	describe('/status', function() {
		it('count are ok', function(done) {
			request(app).get('/v1/register?region=Europe&steamID=1&nickname=John&build=200&server=120.0.0.1:27015')
				.end(function(err, response) {
					request(app).get('/v1/register?region=Asia&steamID=2&nickname=Jane&build=200&server=120.0.0.1:27015')
						.end(function(err, response) {
							request(app).get('/v1/register?region=US_West&steamID=3&nickname=Jane&build=200&server=120.0.0.1:27015')
								.end(function(err, response) {
									request(app).get('/v1/register?region=Europe&steamID=4&nickname=Jane&build=200&server=120.0.0.1:27015')
										.end(function(err, response) {
											request(app).get('/v1/status')
												.end(function(err, response) {
													var body = response.body;
													body.playerCount.should.equal(4);
													body.groupCount.should.equal(3);
													body.regions.US_West.should.equal(1);
													body.regions.Europe.should.equal(2);
													body.regions.Asia.should.equal(1);
													body.regions.US_Africa.should.equal(0);
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