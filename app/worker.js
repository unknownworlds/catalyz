var clean = require('./controllers/clean'),
	conf  = require('../config/config');

var cleaner = function(period) {
	clean.cleanPlayer(conf.get('player:timeout'));
	clean.cleanGroup();

	setTimeout(cleaner, period * 1000);
};
exports.cleaner = cleaner;