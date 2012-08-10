nconf = require('nconf');

nconf.env('__').overrides({
	database: {
		uri: nconf.get('MONGOLAB_URI')
	}
}).defaults({
	database: {
		uri: 'mongodb://localhost/catalyz_local'
	},
	worker: {
		period: 5
	},
	group: {
		min: 8, // minimum number of player to start
		max: 12 // maximum number of player to start
	},
	PORT: 80
});

module.exports = nconf;