var Semaphore = require('../lib/Semaphore');

describe('Semaphore', function() {
	it('act as a function', function(done) {
		var foo = "Foo";

		var s = new Semaphore(function() {
			foo = "Hello!";
		});

		s.semaphore.should.equal(0);

		foo.should.equal("Foo");
		s();
		foo.should.equal("Hello!");
		done();
	});

	it('semaphore feature', function(done) {
		var foo = "Foo";

		var s = new Semaphore(function() {
			foo = "Hello!";
		});

		console.log(s);
		console.log(s.prototype);

		s.set(3)
		s.semaphore.should.equal(3);

		foo.should.equal("Foo");
		s();
		foo.should.equal("Foo");
		s();
		foo.should.equal("Foo");
		s();
		foo.should.equal("Hello!");
		done();
	});
});