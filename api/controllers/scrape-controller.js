var scrapeService = require('./../service/scrape-service');
var json2csv = require('json2csv');
var fs = require('fs');


module.exports.scrape = function(req, res) {
	
	var cityData = ["Evans, Colorado", "Gilbert, Arizona", "New York, New York"];

	scrapeService.scrape(cityData).then(function(response){
		var data = response
		res.json(response)

	json2csv({data: data, fields: ['city', 'state', 'cityPopulation2013']}, function(err, csv) {
		  if (err) console.log(err);
		  fs.writeFile('file.csv', csv, function(err) {
		    if (err) throw err;
		    console.log('file saved');
		  });
		});
	}, 
	function(err){
		console.log(3333333, err)
	})
}