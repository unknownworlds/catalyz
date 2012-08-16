var fs = require('fs'),
	xml2js = require('xml2js'),
	_ = require('underscore');

var parser = new xml2js.Parser();
fs.readFile(__dirname + '/data.xml', function(err, data) {
	parser.parseString(data, function (err, result) {
		var data = {},
			r = {},
			el;

		for ( var i = 1 ; i < result.tr.length ; i++) {
			el = result.tr[i].td;

			var code = el[5],
				name =  el[2],
				region = el[1],
				continent = el[0];

			if (code == "--") {
				continue;
			}

			if (continent == "Americas" && region == "Central America" || region == "North America" ) {
				continent = "North America";
			} else if (continent == "Americas") {
				continent = "South America";
			}

			data[code] = {
				name: name,
				continent: continent
			};

			r[region] = 1;
		}

		fs.writeFile(__dirname + '/data.json', JSON.stringify(data), function (err) {
			if (err) throw err;
			console.log('It\'s saved!');
		});
	});
});