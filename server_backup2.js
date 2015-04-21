
var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var app = express();
var q = require('q');


app.get('/scrape', function(req, res) {
	
	var cityData = ["Evans Colorado", "Berthoud Colorado", "Mesa Arizona"];

	scrape(cityData).then(function(res){
		console.log(2222222, res);
		res.json(res)
	}, function(err){
		console.log(33333333, err)
	})
	// .then(function(response) {
	// 		console.log('response', response);
	// 		res.send(response);
	// 	}, function(err){
	// 		console.log(err)
	// 	})
})

		function scrape(arr) {
			var promiseArray = [];
			console.log(arr)
			// var targetCities = [];
			var promises = arr.map(function(i){
					var deferred = q.defer();
					var loc = {}, target = i.trim().split(' ');
					url = 'http://www.city-data.com/city/' + target[0] + '-' + target[1] + '.html';
					request(url, function(error, response, html) {
						if(!error) {

							var $ = cheerio.load(html);

							//city name
							$('.city').filter(function() {
								var data = $(this);
								var cityState = data.children().first().text().split(' ');
								loc.city = cityState[0].replace(/[,]/, '');
								loc.state = cityState[1]
							})	

							//city zip codes
							$('.zip-codes').filter(function() {
								var data = $(this);
								zips = data.children().text();
								loc.zips = zips.replace(/[^0-9]/g, ' ').trim();
							});

							//city population - need to filter out text
							$('.city-population').filter(function() {
								var data = $(this);
								var popData = data.text().split(' ');
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
							deferred.resolve(loc)
							console.log(1111111111, loc)
						} else {
							console.log("error error error")
							deferred.reject("it was rejected, dummy")
						}
						// targetCities.push(loc)
					})
					// console.log('dp...', deferred.promise);
					return deferred.promise
					// promiseArray.push(deferred.promise);
				}) //end of loop
				// for (var i = 0; i < arr.length; i++) {
				// 	var deferred = q.defer();
				// 	var loc = {}, target = arr[i].trim().split(' ');
				// 	url = 'http://www.city-data.com/city/' + target[0] + '-' + target[1] + '.html';
				// 	request(url, function(error, response, html) {
				// 		if(!error) {

				// 			var $ = cheerio.load(html);

				// 			//city name
				// 			$('.city').filter(function() {
				// 				var data = $(this);
				// 				var cityState = data.children().first().text().split(' ');
				// 				loc.city = cityState[0].replace(/[,]/, '');
				// 				loc.state = cityState[1]
				// 			})	

				// 			//city zip codes
				// 			$('.zip-codes').filter(function() {
				// 				var data = $(this);
				// 				zips = data.children().text();
				// 				loc.zips = zips.replace(/[^0-9]/g, ' ').trim();
				// 			});

				// 			//city population - need to filter out text
				// 			$('.city-population').filter(function() {
				// 				var data = $(this);
				// 				var popData = data.text().split(' ');
				// 				loc.pop2013 = popData[3].replace(/[,]/g, '');
				// 				loc.urban = popData[4].replace(/[{()}%]/g, '')/100;
				// 				loc.rural = popData[6].replace(/[{()}%]/g, '')/100;
				// 				loc.popChange = popData[popData.length-1].trim();
				// 			});

				// 			//gender ratio
				// 			$('.population-by-sex').filter(function() {
				// 				var data = $(this);
				// 				genderRatio = data.children().text()
				// 				var gender = genderRatio.replace(/[FemalesM:()%,]/g, '').trim()
				// 				loc.males = gender;
				// 				// loc.malePercentage = genderRatio[3].replace(/[{()}%]/g, '')/100;	
				// 				// loc.females = genderRatio[4].replace(/[,]/, '');
				// 				// loc.femalePercentage = genderRatio[5].replace(/[{()}%]/g, '')/100;
				// 			});

				// 			//median resident age
				// 			$('.median-age').filter(function() {
				// 				var data = $(this);
				// 				medianResAge = data.children().text();
				// 				loc.medianResAge = medianResAge;
				// 			});
				// 			deferred.resolve(loc)
				// 			console.log(1111111111, loc)
				// 		} else {
				// 			console.log("error error error")
				// 			deferred.reject("it was rejected, dummy")
				// 		}
				// 		// targetCities.push(loc)
				// 	})
				// 	// console.log('dp...', deferred.promise);
				// 	promiseArray.push(deferred.promise);
				// } //end of loop
			console.log(777777777, promises)
			return q.all(promises);
		} //end of scrape



app.listen('8081');
console.log('listening on port 8081');
exports = module.exports = app;