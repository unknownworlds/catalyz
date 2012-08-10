var http      = require('http'),
	mongoose  = require('mongoose');
	daemon    = require('./app/daemon');

var app = require('./app/server');

// Init
mongoose.connect('mongodb://localhost/catalyz_local');

console.log('Catalyz starts');

// Start daemon
daemon.cleaner();

// Start
app.listen(3000);