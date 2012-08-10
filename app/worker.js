var clean = require('./controllers/clean');

var cleaner = function(period) {
	clean.cleanPlayer(30);
	clean.cleanGroup();

	setTimeout(cleaner, period * 1000);
};
exports.cleaner = cleaner;