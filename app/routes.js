var director = require('director');

var api   = require('./controllers/api'),
	debug = require('./controllers/debug'),
	infos = require('./controllers/infos');

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
		'/debug': {
			get: debug.infos
		},
		'/status': {
			get: infos.count
		}
	}
};

module.exports = new director.http.Router(routes);