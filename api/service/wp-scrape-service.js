var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var app = express();
var q = require('q');


module.exports.scrape = function(arr) {

	var promises = arr.map(function(i){
			var deferred = q.defer(), loc = {}, target = i.trim().replace(/[,]/g, '').replace(/[ ]/g, '-');
			http://www.whitepages.com/business/CO/Evans/dentists?page=2
			url = 'http://www.whitepages.com/business/' + target + '.html';
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

					//total number given for city

					//real number for each city

					//number by zip code

					//number by added zip codes




					deferred.resolve(loc)
				} else {
					deferred.reject("it was rejected, dummy")
				}
			})
			return deferred.promise
		}) //end of loop
	return q.all(promises);
} //end of scrape
