var express = require('express');
var request = require('request');
var cheerio = require('cheerio');
var app = express();
var q = require('q');


module.exports.scrape = function(arr) {

	var promises = arr.map(function(i){
			var deferred = q.defer(), 
			dc = {}, 
			target = i.trim().replace(/[,]/g, '').replace(/[ ]/g, '-');

			url = 'http://bracesinfo.com/dentalcosts/us.html'
			// url = 'http://www.whitepages.com/business/' + target + '.html';
			request(url, function(error, response, html) {
				if(!error) {

					var $ = cheerio.load(html);

				//crawl state names in usa

					$('#content').filter(function() {
						var data = $(this);
						var a_href = $('selector').attr('href');
						var num = data.find("ul li").length + 2;
						var states = [];

						function stateString() {
							for (var i = 0; i < num; i++) {
								var str = data.find("ul li:nth-child(" + i + ")")
								if (str.length > 0) {
									states.push({
										'state': str.text(), 
										'url': a_href
									});
								}
							}
						}
						stateString();
						dc.states = states;	
					});
				}

			});


		var cityNames = arr.map(function(i) {

			url = 'http://bracesinfo.com/dentalcosts/us.html';
			

				request(url, function(error, response, html) {
					if(!error) {

						var $ = cheerio.load(html);

					//crawl city names in states

						$('#content').filter(function() {
							var data = $(this);
							var a_href = $('selector').attr('href');
							var num = data.find("ul li").length + 2;
							var stateStr = data.find('h1').text().split(' ');
							var cities = [];

							function cityStrings() {
								for (var i = 0; i < num; i++) {
									var str = data.find("ul li:nth-child(" + i + ")")
									if (str.length > 0) {
										cities.push({
											'state': stateStr[0].trim(),
											'city': str.text(), 
											'url': a_href
										});
									}
								}
							}
							stateString();
							dc.cities = states;	
						})

					}
				}); //end of request
			}); //end of cityNames map



				//crawl city names in states to get cost info

					$('#content').filter(function() {
						var data = $(this);
						var a_href = $('selector').attr('href');
						var num = data.find("ul li").length + 2;
						var locStr = data.find('h1').text().split(' ');
						var category = [];

						function categoryStrings() {
							for (var i = 0; i < num; i++) {
								var str = data.find("ul li:nth-child(" + i + ")")
								if (str.length > 0) {
									cities.push({
										'state': stateStr[stateStr.length - 1].trim(),
										'city': stateStr[stateStr.length - 2].trim(),
										'category': str.text(),
										'url': a_href
									});
								}
							}
						}
						categoryString();
						dc.categories = category;	
					})

				//crawl categoreis in cities to get cost info

				$('.glossary').filter(function() {
						var data = $(this);
						var tableData = data.text()
						var categoryTitle = data.find('h1').text().split(' ');
						var costData = [];







					deferred.resolve(dc)
				} else {
					deferred.reject("it was rejected, dummy")
				}
			})
			return deferred.promise
		}) //end of loop
	return q.all(promises);
} //end of scrape
