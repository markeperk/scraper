var scrapeService = require('./../service/scrape-service')

module.exports.scrape = function(req, res) {
	
	var cityData = ["Evans Colorado", "Berthoud Colorado", "Mesa Arizona", "Provo Utah", "Gilbert Arizona"];

	scrapeService.scrape(cityData).then(function(response){
		res.json(response)
	}, 
	function(err){
		console.log(3333333, err)
	})
}