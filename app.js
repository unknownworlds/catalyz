var http      = require('http'),
	fs        = require('fs'),
	mongoose  = require('mongoose'),
	worker    = require('./app/worker');

var app        = require('./app/server'),
	Continents = require('./lib/geodata/Continents'),
	conf       = require('./config/config');

var winston          = require('winston'),
	transportMongoDB = require('winston-mongodb').MongoDB
	url			     = require('url');

//////////
// Init //
//////////

var uri = conf.get('database:uri');
mongoose.connect(uri);
console.log('database connection to ' + uri + '.');

Continents.init(function() {
	start();
});

// Logger

var dbInfo = url.parse(uri);

winston.add(transportMongoDB, {
	db: dbInfo.pathname.replace(/^\//, ''), // remove "/"
	host: dbInfo.hostname,
	port: parseInt(dbInfo.port)
});

////////////
// Daemon //
////////////

var period = conf.get('worker:period');
worker.cleaner(period);
console.log('worker will run every ' + period + ' seconds.')

console.log('Group will contains between ' + conf.get('group:min') + ' and ' + conf.get('group:max') + ' players.');

///////////
// Start //
///////////

var start = function() {
	var port = conf.get('PORT');
	app.listen(conf.get('PORT'));
	console.log('Catalyz starts on port ' + port + '.');
};
