var scrapeService = require('./../service/scrape-service');
var forecastService = require('./../service/forecast-service');
var json2csv = require('json2csv');
var fs = require('fs');


module.exports.scrape = function(req, res) {
	
	var cityData = ["Evans, Colorado", "Gilbert, Arizona", "New York, New York"];

	scrapeService.scrape(cityData).then(function(response){
		var data = response;
		res.json(response);

//scrape info from bracesinfo.com/dentalcosts/us/co/greeley/preventative-care etc

	// dentalCostsService.scrape(cityData).then(function(response){
	// 	var data = response;
	// 	res.json(response);





//pull data from weather api


	// forecastService.getWeather(cityData).then(function(response) {
	// 	console.log('weather: ', response);
	// 	var weatherData = response;
	// })

//scrape info from whitepages.com on dental listings... yellow pages?





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
