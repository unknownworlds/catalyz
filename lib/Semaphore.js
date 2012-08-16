var Semaphore = function(callback, scope) {
    this.semaphore = 0;
    this.callback = callback;
    this.context = scope || this;
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
    }
};

module.exports = Semaphore;