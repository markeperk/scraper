
var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var app = express();
var q = require('q');
var bodyParser = require('body-parser')

var scrapeController = require('./api/controllers/scrape-controller');

app.use(bodyParser.json())

app.get('/scrape', scrapeController.scrape)


app.listen('8081');
console.log('listening on port 8081');
exports = module.exports = app;