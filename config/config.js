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
	player: {
		timeout: 30
	},
	group: {
		min: 8, // minimum number of player to start
		max: 12 // maximum number of player to start
	},
	regions: [
		'North America',
		'South America',
		'Europe',
		'Asia',
		'Oceania',
		'Africa'
	],
	PORT: 8000
});

module.exports = nconf;