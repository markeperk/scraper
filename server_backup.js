
var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var app = express();


app.get('/scrape', function(req, res){
	var targetCities = [];
	var cityData = ["Evans Colorado", "Berthoud Colorado"];

	// var city, state, zipCodes, pop2013, urban, rural, popChange, genderRatio, medianResAge;
	// var json = {
	// 	city: "",
	// 	state: "",
	// 	zipCodes: "",
	// 	pop2013: "", 
	// 	urban: "", 
	// 	rural: "",
	// 	males: "",
	// 	malePercentage: "",
	// 	females: "",
	// 	femalePercentage: "",
	// 	medianResAge: ""
	// };
			
	for (var i = 0; i < cityData.length; i++) {
		console.log(cityData[i]);
		var target = cityData[i].trim().split(' ')
		console.log(target)
		var loc = {'location': target}
		url = 'http://www.city-data.com/city/' + loc[0] + '-' + loc[1] + '.html';
		request(url, function(error, response, html) {
			if(!error) {
				var $ = cheerio.load(html);

				//city name
				$('.city').filter(function() {
					var data = $(this);
					var cityState = data.children().first().text().split(' ');
					// release = data.children().last().children().text();
					loc.city = cityState[0].replace(/[,]/, '');
					loc.state = cityState[1]
					// loc.release = release;
				})	

				//city zip codes
				$('.zip-codes').filter(function() {
					var data = $(this);
					zipCodes = data.children().text();
					loc.zipCodes = zipCodes.replace(/[^0-9]/g,' ').trim();
				});

				//city population - need to filter out text
				$('.city-population').filter(function() {
					var data = $(this);
					var popData = data.text().split(' ');
					console.log(popData.join(' '))
					loc.pop2013 = popData[3].replace(/[,]/g, '');
					loc.urban = popData[4].replace(/[{()}%]/g, '')/100;
					loc.rural = popData[6].replace(/[{()}%]/g, '')/100;
					loc.popChange = popData[popData.length-1].trim();
				});

				//gender ratio
				$('.population-by-sex').filter(function() {
					var data = $(this);
					genderRatio = data.children().text()
					var gender = genderRatio.replace(/[FemalesM:()%,]/g, '').trim()
					console.log(gender)
					loc.males = gender;
					// loc.malePercentage = genderRatio[3].replace(/[{()}%]/g, '')/100;	
					// loc.females = genderRatio[4].replace(/[,]/, '');
					// loc.femalePercentage = genderRatio[5].replace(/[{()}%]/g, '')/100;
				});

				//median resident age
				$('.median-age').filter(function() {
					var data = $(this);
					medianResAge = data.children().text();
					loc.medianResAge = medianResAge;
				});
			}
		})
		targetCities.push(loc);
	} //end of loop

	console.log(targetCities);

	// fs.writeFile('output.json', JSON.stringify(json, null, 4), function(err) {
	// 	console.log('file successfully written');
	// })
	res.send(targetCities);

})

app.listen('8081');

console.log('listening on port 8081');

exports = module.exports = app;