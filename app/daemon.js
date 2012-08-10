var clean = require('./controllers/clean');

exports.cleaner = function() {
	console.log('cleaning')

	clean.cleanPlayer(30);
	clean.cleanGroup();

	setTimeout(exports.cleaner, 5000);
}