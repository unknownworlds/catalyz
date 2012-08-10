var http      = require('http'),
	mongoose  = require('mongoose');
	worker    = require('./app/worker');

var app  = require('./app/server'),
	conf = require('./config/config');

// Init
var uri = conf.get('database:uri');
mongoose.connect(uri);
console.log('database connection to ' + uri + '.');

// Start daemon
var period = conf.get('worker:period');
worker.cleaner(period);
console.log('worker will run every ' + period + ' seconds.')

// Start
var port = conf.get('PORT');
app.listen(conf.get('PORT'));
console.log('Catalyz starts on port ' + port + '.');