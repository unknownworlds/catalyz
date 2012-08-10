var director = require('director');

var api = require('./controllers/api');
	debug = require('./controllers/debug');

var routes = {
	'/v1': {
		'/register': {
			get: api.register
		},
		'/deregister': {
			get: api. deregister
		},
		'/update': {
			get: api.update
		},
		'/infos': {
			get: debug.infos
		}
	}
};

module.exports = new director.http.Router(routes);