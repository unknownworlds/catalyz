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
		'US_East',
		'US_West',
		'South_America',
		'Europe',
		'Asia',
		'Australia',
		'Middle_East',
		'Africa',
		'Other'
	],
	PORT: 80
});

module.exports = nconf;