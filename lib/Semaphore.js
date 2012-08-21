var _ = require('underscore');

var Semaphore = function(callback, scope) {
	var s = function() {
		s.run(arguments);
	};

   	s.semaphore = 0;
    s.callback = callback;
    s.scope = scope || s;

    s.add = function() {
    	this.semaphore++;
	};

	s.set = function(n) {
	    this.semaphore = n;
	};

	s.run = function() {
	    this.semaphore--;
	    if (this.semaphore <= 0 && this.callback) {
	        this.callback.apply(this.scope, arguments);
	        return true;
	    }
	    return false;
	};

    return s;
};

Semaphore.prototype.add = function() {
    this.semaphore++;
};

Semaphore.prototype.set = function(n) {
    this.semaphore = n;
};

Semaphore.prototype.run = function() {
    this.semaphore--;
    if (this.semaphore <= 0 && this.callback) {
        this.callback.apply(this.scope, arguments);
        return true;
    }
    return false;
};

module.exports = Semaphore;