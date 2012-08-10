var http = require('http');

var router = require('./routes');

module.exports = http.createServer(function(request, response) {
	router.dispatch(request, response, function(err) {
		if (err) {
			response.writeHead(404, {"Content-type": "application/json"});
			response.end({ status: "ERROR", code: 404, description: "Not Found"});
		}
    });
});