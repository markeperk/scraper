var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var app = express();
var q = require('q');


module.exports.scrape = function(arr) {

	var promises = arr.map(function(i){
			var deferred = q.defer(), loc = {}, target = i.trim().replace(/[,]/g, '').replace(/[ ]/g, '-');
			url = 'http://www.city-data.com/city/' + target + '.html';
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
						mhi = data.text();
						mhiStr = mhi.replace(/[^0-9,]/g, ' ').trim().replace(/\s+/g, ' ').replace(/[,]/g, '').split(' ')
						// loc.mhistr = mhiStr.filter(Number)
						loc.medianHouseholdIncome2012 = +mhiStr[1]
						loc.medianHouseholdIncome2000 = +mhiStr[2]
						loc.medianHouseholdIncomeState = +mhiStr[5]
						loc.perCapitaIncome2012 = +mhiStr[7]
						loc.perCapitaIncome2000 = +mhiStr[8]
						loc.medianHouseValue2012 = +mhiStr[13]
						loc.medianHouseValue2000 = +mhiStr[14]
						loc.medianHouseValueState = +mhiStr[17]
						// loc.medianHouseholdIncome2012 = +((mhi.substring(mhi.indexOf('$') + 1, mhi.indexOf('(') - 1)).replace(/[,]/, '').trim())
					});

					//median gross rent
					$('.median-rent').filter(function() {
						var data = $(this);
						mgr = data.children().text();
						loc.medianGrossRent = +((mgr.substring(mgr.indexOf('$') + 1, mgr.indexOf('.') + 2)).trim().replace(/[,]/g, ''))
					});

					// //cost of living index
					$('.cost-of-living-index').filter(function() {
						var data = $(this);
						cli = data.text();
						loc.costLivingIndex2012 = +((cli.substring(cli.indexOf(':') + 1, cli.indexOf('(') - 1)).trim())/100;
					});

					//race breakdown
					$('.races-graph').filter(function() {
						var data = $(this), cityRacialProfile = [], num = data.find("ul li").length + 2;
						function raceString() {
							for (var i = 0; i < num; i++) {
								var str = data.find("ul li:nth-child(" + i + ")").first().text().replace(/[-%,]/g, '').trim().replace(/\s+/g, ' ');
								if (str.length > 0) {
									cityRacialProfile.push({
										'race': str.substring(0, str.search(/\d/)).trim(), 
										'population': +(str.substring(str.search(/\d/), str.indexOf('(')).trim()), 
										'percentage': +(str.substring(str.indexOf('(')+1, str.length-1)/100)
									});
								}
							}
						}
						raceString()
						loc.cityRacialProfile = cityRacialProfile;
					});

					//elevation
					$('.elevation').filter(function() {
						var data = $(this);
						elev = data.children().text();
						loc.elevation = +((elev.substring(elev.indexOf(':') + 1, elev.indexOf('f') - 1)).trim());
					});

					//land area and population density
					$('#population-density').filter(function() {
						var data = $(this);
						la = data.children().first().text().replace(/[^0-9,]/g, ' ').trim().replace(/\s+/g, ' ');
						pd = data.children().last().text().replace(/[^0-9,]/g, ' ').trim().replace(/\s+/g, ' ');
						loc.landArea = +(la.replace(/[ ]/g, '.'))
						loc.populationDensity = +(pd.replace(/[,]/g, ''));
					});

					//population 25 + 
					$('.education-info').filter(function() {
						var data = $(this);
						highSchoolPlus = data.find("ul li:nth-child(1)").first().text().replace(/[-%,]/g, '');
						loc.highSchoolPlus = +(highSchoolPlus.replace(/[^0-9.]/g, '').trim()/100);
						bachelorsDegreePlus = data.find("ul li:nth-child(2)").first().text().replace(/[-%,]/g, '');
						loc.bachelorsDegreePlus = +(bachelorsDegreePlus.replace(/[^0-9.]/g, '').trim()/100);
						gradDegreePlus = data.find("ul li:nth-child(3)").first().text().replace(/[-%,]/g, '');
						loc.gradDegreePlus = +(gradDegreePlus.replace(/[^0-9.]/g, '').trim()/100);
						unemployed = data.find("ul li:nth-child(4)").first().text().replace(/[-%,]/g, '');
						loc.unemployed = +(unemployed.replace(/[^0-9.]/g, '').trim()/100);
					});

					//population 15 + 
					$('.marital-info').filter(function() {
						var data = $(this);
						neverMarried = data.find("ul li:nth-child(1)").first().text().replace(/[-%,]/g, '');
						loc.neverMarried = +(neverMarried.replace(/[^0-9.]/g, '').trim()/100);
						nowMarried = data.find("ul li:nth-child(2)").first().text().replace(/[-%,]/g, '');
						loc.nowMarried = +(nowMarried.replace(/[^0-9.]/g, '').trim()/100);
						separated = data.find("ul li:nth-child(3)").first().text().replace(/[-%,]/g, '');
						loc.separated = +(separated.replace(/[^0-9.]/g, '').trim()/100);
						widowed = data.find("ul li:nth-child(4)").first().text().replace(/[-%,]/g, '');
						loc.widowed = +(widowed.replace(/[^0-9.]/g, '').trim()/100);
						divorced = data.find("ul li:nth-child(5)").first().text().replace(/[-%,]/g, '');
						loc.divorced = +(divorced.replace(/[^0-9.]/g, '').trim()/100);
					});

					//foreign born residents
					$('.foreign-born-population').filter(function() {
						var data = $(this);
						foreignBorn = data.children().text().replace(/[,]/, '').replace(/[^0-9.]/g, ' ').trim().replace(/\s+/g, ' ').split(' ');
						loc.foreignBornResidents = +(foreignBorn[0]);
						loc.foreignBornResidentsPercentage = +(foreignBorn[foreignBorn.length - 2])/100;
						loc.stateForeignBornResidentsPercentage = +(foreignBorn[foreignBorn.length - 1])/100;
					});


					//registered sex offenders
					$('.sex-offenders').filter(function() {
						var data = $(this);
						sexOffendText = data.text().replace(/[^0-9,]/g, ' ').trim().replace(/\s+/g, ' ').split(' ');
						sexOffenders = data.find("strong").text().replace(/[^0-9]/g, '');
						loc.numberOfSexOffenders2015 = +sexOffenders
						loc.residentsToSexOffenderRatio = sexOffendText[sexOffendText.length - 2] + ":1"
					});

					//real estate taxes
					$('.real-estate-taxes').filter(function() {
						var data = $(this);
						ret = data.text().replace(/[,]/g, '');
						loc.realEstateTaxesWithMortgages2012 = +((ret.substring(ret.indexOf('$') + 1, ret.indexOf('(') - 1)).trim())
					});

					//nearest city over 200k
					$('.nearest-cities').filter(function() {
						var data = $(this), nearestCities = [], num = data.find("p").length;
						function ncString() {
							for (var i = 0; i < num; i++) {
								var str = data.find("p:nth-child(" + i + ")").first().text().replace(/[-%,()]/g, '').trim().replace(/\s+/g, ' ');
								var newStr = str.substring((str.search(/\d/)), str.length).trim().split(' ');
								if (newStr.length > 1) {
									var state = str.match(/[A-Z]{2}/g);
									var stateIndex = newStr.indexOf(state[0]);
									if (stateIndex === 2) {var nearCity = newStr[1]} else if (stateIndex - 2 === 1) { var nearCity = newStr[1] + " " + newStr[2]} else if (stateIndex - 2 === 2) { var nearCity = newStr[1] + " " + newStr[2] + " " + newStr[3] }
									nearestCities.push({
										'population threshold': +(newStr[0].replace(/[^0-9]/g, '').trim()), 
										'city': nearCity,
										'state': state[0],
										'distance': +(newStr[newStr.length - 4]),
										'population': +((newStr[newStr.length - 1]).replace(/[^0-9]/g, ''))
									});
								}
							}
						}
						ncString()
						loc.nearestCities = nearestCities;
					});

					//change due to commuting
					$('.commuters').filter(function() {
						var data = $(this);
						cdpc = data.text().replace(/[^0-9,.+-]/g, ' ').trim().replace(/\s+/g, ' ').replace(/[,]/g, '').trim().split(' ');
						loc.commuterDaytimePopulationChange = +(cdpc[0])
						loc.commuterDaytimePopulationChgPercentage = +(cdpc[1])
						loc.workersWhoLiveAndWork = +(cdpc[2])
						loc.workersWhoLiveAndWorkPercentage = +(cdpc[3])
					});

					//crime rate index
					$('.crime').filter(function() {
						var data = $(this);
						cri = data.find(".norm").last().text();
						loc.crimeRateIndexCity = +((cri.substring(cri.length - 5, cri.length)).trim())
						loc.crimeRateIndexAvgUSA = +((cri.substring(cri.indexOf('=') + 1, cri.indexOf(')'))).trim())
					});

					//unemployment rate
					$('.unemployment').filter(function() {
						var data = $(this);
						unemploy = data.children().text();
						unemployStr = unemploy.replace(/[^0-9.]/g, ' ').trim().replace(/\s+/g, ' ').replace(/[,]/g, '').split(' ')
						var year = ("unemploymentRate" + unemployStr[0]).toString();
						var stYear = ("stateUnemploymentRate" + unemployStr[0]).toString();
						loc[year] = +(unemployStr[1])/100
						loc[stYear] = +(unemployStr[2])/100
					});		

					//tornados percentage
					$('.tornados').filter(function() {
						var data = $(this);
						td = data.text();
						diff =  td.substring(td.indexOf('%') + 1, td.indexOf('%') + 9).trim()
						tdStr = +(td.substring(td.search(/\d/), td.indexOf('%'))/100)
						if (diff === "greater") {
							loc.cityDifferenceToUSATornadoAvg = "+" + tdStr
						} else { 
							loc.cityDifferenceToUSATornadoAvg = "-" + tdStr
						}
					});

					//earthquake percentage
					$('.earthquakes').filter(function() {
						var data = $(this);
						eq = data.text();
						diff =  eq.substring(eq.indexOf('%') + 1, eq.indexOf('%') + 9).trim()
						eqStr = +(eq.substring(eq.search(/\d/), eq.indexOf('%'))/100)
						if (diff === "greater") {
							loc.cityDifferenceToUSAEarthquakeAvg = "+" + eqStr
						} else { 
							loc.cityDifferenceToUSAEarthquakeAvg = "-" + eqStr
						}
					});

					//natural disasters
					$('.natural-disasters').filter(function() {
						var data = $(this);
						nd = data.text();
						ndt = nd.substring(nd.indexOf("Causes of natural disasters:") + 28, nd.lastIndexOf('(')-1).trim().replace(/[:]/g, '').split(',');
						loc.majorNaturalDisastersPresidentialDeclared = +(nd.substring(nd.indexOf("(Presidential) Declared:") + 25, nd.indexOf("Emergencies")).trim())
						loc.majorNaturalDisastersUSAAverage = +(nd.substring(nd.indexOf("US average") + 12, nd.indexOf("Major")-2).trim())
						loc.naturalDisastersInCityCounty = +(nd.substring(nd.indexOf('(') + 1, nd.indexOf(')')).trim())
						loc.countyMajorNaturalDisasterCauses = {};
						function ndtString() {
							for (var i = 0; i < ndt.length; i++) {
								if (ndt[i]) {
									var count = +(ndt[i].substring(ndt[i].search(/\d/), ndt[i].length).trim())
									var type = ndt[i].substring(0, ndt[i].search(/\d/) - 1).trim();
									loc.countyMajorNaturalDisasterCauses[type] = count;
								}
							}
						}
						ndtString();
					});

					//air quality
					$('.air-pollution').filter(function() {
						var data = $(this);
						ap = data.find('p').text();
						aqi = +(ap.substring(ap.indexOf("2012") + 8, ap.indexOf("This is") - 2).replace(/[,]/g, '').trim());
						aqiUSAAvg = +(data.find('tr').first().next().text().replace(/[^0-9]/g, ' ').trim().replace(/[ ]/g, '.'));
						loc.airQualityIndex2012 = {};
							if (aqi > 0 && aqi <= 50) {
								loc.airQualityIndex2012['airQualityIndex'] = aqi;
								loc.airQualityIndex2012['airQualityIndexUSAAvg'] = aqiUSAAvg;
								loc.airQualityIndex2012['status'] = "Good";
								loc.airQualityIndex2012['symbolColor'] = "Green";
								loc.airQualityIndex2012['meaning'] = "Air quality is considered satisfactory, and air pollution poses little or no risk";
							}	else if (aqi > 50 && aqi <= 100) {
								loc.airQualityIndex2012['airQualityIndex'] = aqi;
								loc.airQualityIndex2012['airQualityIndexUSAAvg'] = aqiUSAAvg;
								loc.airQualityIndex2012['status'] = "Moderate";
								loc.airQualityIndex2012['symbolColor'] = "Yellow";
								loc.airQualityIndex2012['meaning'] = "Air quality is acceptable; however, for some pollutants there may be a moderate health concern for a very small number of people who are unusually sensitive to air pollution.";
							} else if (aqi > 100 && aqi <= 150) {
								loc.airQualityIndex2012['airQualityIndex'] = aqi;
								loc.airQualityIndex2012['airQualityIndexUSAAvg'] = aqiUSAAvg;
								loc.airQualityIndex2012['status'] = "Unhealthy for Sensitive Groups";
								loc.airQualityIndex2012['symbolColor'] = "Orange";
								loc.airQualityIndex2012['meaning'] = "Members of sensitive groups may experience health effects. The general public is not likely to be affected.";
							} else if (aqi > 150 && aqi <= 200) {
								loc.airQualityIndex2012['airQualityIndex'] = aqi;
								loc.airQualityIndex2012['airQualityIndexUSAAvg'] = aqiUSAAvg;
								loc.airQualityIndex2012['status'] = "Unhealthy";
								loc.airQualityIndex2012['symbolColor'] = "Red";
								loc.airQualityIndex2012['meaning'] = "Health warnings of emergency conditions. The entire population is more likely to be affected.";
							} else if (aqi > 200 && aqi <= 250) {
								loc.airQualityIndex2012['airQualityIndex'] = aqi;
								loc.airQualityIndex2012['airQualityIndexUSAAvg'] = aqiUSAAvg;
								loc.airQualityIndex2012['status'] = "Very Unhealthy";
								loc.airQualityIndex2012['symbolColor'] = "Purple";
								loc.airQualityIndex2012['meaning'] = "Health warnings of emergency conditions. The entire population is more likely to be affected.";
							} else if (aqi > 250 && aqi <= 300) {
								loc.airQualityIndex2012['airQualityIndex'] = aqi;
								loc.airQualityIndex2012['airQualityIndexUSAAvg'] = aqiUSAAvg;
								loc.airQualityIndex2012['status'] = "Very Unhealthy";
								loc.airQualityIndex2012['symbolColor'] = "Maroon";
								loc.airQualityIndex2012['meaning'] = "Health alert: everyone may experience more serious health effects";
							}
					});

					//residents in poverty
					$('.poverty-level').filter(function() {
						var data = $(this);
						pl = data.text();
						loc.povertyLevel2012 = +(pl.substring(pl.indexOf(":") + 1, pl.indexOf('%')).trim()/100);
					});

					//household stats
					$('.households-stats').filter(function() {
						var data = $(this);
						hs = data.text().replace(/[^0-9.]/g, ' ').trim().replace(/\s+/g, ' ').split(' ');
						loc.avgHouseholdSizeCity = +hs[0];
						loc.avgHouseholdSizeState = +hs[1];
						loc.percOfFamilyHouseholdsCity = +hs[2]/100;
						loc.percOfFamilyHouseholdsState = +hs[3]/100;						
						loc.percOfHouseholdsUnmarriedCity = +hs[4]/100;
						loc.percOfHouseholdsUnmarriedState = +hs[5]/100;					
						loc.likelyHomoHouseholdsLesbians = +hs[6]/100;
						loc.likelyHomoHouseholdsGayMen = +hs[7]/100;
					});

					$('.religion').filter(function() {
						var data = $(this);
						pawrc = data.find('table').first().children().text().replace(/[^0-9.]/g, ' ').trim().replace(/\s+/g, ' ').split(' ');
						domReligion = data.text().replace(/[^0-9.]/g, ' ').trim().replace(/\s+/g, ' ');
						domReligionNames = data.find('th').text()
						loc.percAffiliatedWithRelCongCity = +pawrc[0]/100;
						loc.percAffiliatedWithRelCongState = +pawrc[1]/100;
		
						var sepChurch = domReligionNames.match(/[a-z][A-Z]/g)
						loc.rr = domReligionNames
						var relNames = domReligionNames
						var churchNames = sepChurch.map(function(i){
								var str = i, sep = i.split(''), first = sep[0], second = sep[1]
								relNames = relNames.replace(str, first + "," + second);
						})
						loc.th = relNames.split(',')
						loc.rel = domReligion
						
					});


					deferred.resolve(loc)
				} else {
					deferred.reject("it was rejected, dummy")
				}
			})
			return deferred.promise
		}) //end of loop
	return q.all(promises);
} //end of scrape
