var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var app = express();
var q = require('q');


module.exports.scrape = function(arr) {

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
						loc.cityPopulation2013 = +(popData[3].replace(/[,]/g, ''));
						loc.urban = popData[4].replace(/[{()}%]/g, '')/100;
						loc.rural = popData[6].replace(/[{()}%]/g, '')/100;
						loc.cityPopulationChange = popData[popData.length-1].trim();
					});

					//gender ratio
					$('.population-by-sex').filter(function() {
						var data = $(this);
						genderRatio = data.children().text()
						var gender = genderRatio.replace(/[FemalesM:()%,]/g, '').trim().split(' ')
								males = gender[0];
								females = gender[1];
						loc.males = +(males.substring(0, (males.search(/\D/))));
						loc.malePercentage = +(+(males.substring((males.indexOf('.')-2), females.length))/100).toFixed(2);
						loc.females = +(females.substring(0, (females.search(/\D/))));
						loc.femalePercentage = +(+(females.substring((females.indexOf('.')-2), females.length))/100).toFixed(2);
					});

					//median resident age
					$('.median-age').filter(function() {
						var data = $(this);
						mra = data.children().text();
						loc.medianResidentAge = +((mra.substring(mra.indexOf(':') + 1, mra.indexOf('.') + 2)).trim())
					});

					//median household income
					$('.median-income').filter(function() {
						var data = $(this);
						mhi = data.children().first().text();
						loc.medianHouseholdIncome = mhi
						// loc.medianHouseholdIncome = +((mhi.substring(mhi.indexOf(':') + 1, mhi.indexOf('.') + 2)).trim())
					});

					// //median house value
					// // $('.median-age').filter(function() {
					// 	var data = $(this);
					// 	mhv = data.children().text();
					// 	loc.medianHouseholdValue = +((mva.substring(mva.indexOf(':') + 1, mva.indexOf('.') + 2)).trim())
					// });

					// //median gross rent
					// // $('.median-age').filter(function() {
					// 	var data = $(this);
					// 	mgr = data.children().text();
					// 	loc.medianGrossRent = +((mgr.substring(mgr.indexOf(':') + 1, mgr.indexOf('.') + 2)).trim())
					// });

					// //cost of living index
					// // $('.median-age').filter(function() {
					// 	var data = $(this);
					// 	cli = data.children().text();
					// 	loc.costLivingIndex = +((cli.substring(cli.indexOf(':') + 1, cli.indexOf('.') + 2)).trim())
					// });

					// //race breakdown
					// // $('.median-age').filter(function() {
					// 	var data = $(this);
					// 	race = data.children().text();
					// 	loc.caucasian = 
					// 	loc.hispanic = 
					// 	loc.asian = 
					// 	loc.black = 
					// });

					// //elevation
					// // $('.median-age').filter(function() {
					// 	var data = $(this);
					// 	elevation = data.children().text();
					// 	loc.elevation = elevation
					// });

					// //land area
					// // $('.median-age').filter(function() {
					// 	var data = $(this);
					// 	area = data.children().text();
					// 	loc.area = area
					// });

					// //population density
					// // $('.median-age').filter(function() {
					// 	var data = $(this);
					// 	density = data.children().text();
					// 	loc.populationDensity = density
					// });

					// //population 25 + 
					// // $('.median-age').filter(function() {
					// 	var data = $(this);
					// 	pop25andOlder = data.children().text();
					// 	loc.pop25highSchool=	pop25andOlder
					// 	loc.pop25bachelors =	pop25andOlder
					// 	loc.pop25graduate =	pop25andOlder
					// 	loc.pop25unemployed =	pop25andOlder
					// });

					// //population 15 + 
					// // $('.median-age').filter(function() {
					// 	var data = $(this);
					// 	pop15andOlder = data.children().text();
					// 	loc.pop15neverMarried=	pop15andOlder
					// 	loc.pop15nowMarried =	pop15andOlder
					// 	loc.pop15Widowed =	pop15andOlder
					// 	loc.pop15Divorced =	pop15andOlder
					// });

					// //foreign born residents
					// // $('.median-age').filter(function() {
					// 	var data = $(this);
					// 	foreignBorn = data.children().text();
					// 	loc.foreignBornResidents = foreignBorn
					// 	loc.foreignBornResidentsPercentage = foreignBorn
					// 	loc.stateForeignBornResidentsPercentage = foreignBorn
					// });

					// //nearest city over 200k
					// // $('.median-age').filter(function() {
					// 	var data = $(this);
					// 	nearestCity200 = data.children().text();
					// 	loc.nearestCityOver200k = nearestCity200
					// });

					// //change due to commuting
					// // $('.median-age').filter(function() {
					// 	var data = $(this);
					// 	popChangeCommute = data.children().text();
					// 	loc.populationChangeDueToCommuting = popChangeCommute
					// 	loc.workersWhoLiveWorkInCity = popChangeCommute
					// });

					// //crime rate index
					// // $('.median-age').filter(function() {
					// 	var data = $(this);
					// 	cri = data.children().text();
					// 	loc.crimeRateIndex = cri
					// 	loc.crimeRateIndexPercentageOfUSA = cri
					// });

					// //wikipedia link
					// // $('.median-age').filter(function() {
					// 	var data = $(this);
					// 	link = data.children().text();
					// 	loc.wikipediaLink = link
					// });

					// //unemployment rate
					// // $('.median-age').filter(function() {
					// 	var data = $(this);
					// 	unemployment = data.children().text();
					// 	loc.unemploymentRate = unemployment
					// 	loc.stateUnemploymentRate = unemployment
					// });

















					deferred.resolve(loc)
				} else {
					deferred.reject("it was rejected, dummy")
				}
			})
			return deferred.promise
		}) //end of loop
	return q.all(promises);
} //end of scrape
