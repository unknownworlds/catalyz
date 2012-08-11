var clean = require('./controllers/clean'),
	conf  = require('../config/config');

var cleaner = function(period) {
	setTimeout(function() {
		clean.cleanPlayer(conf.get('player:timeout'));
		clean.cleanGroup();
		cleaner(period);
	}, period * 1000);
};
exports.cleaner = cleaner;