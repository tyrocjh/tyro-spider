var http = require("http"),
	request = require('superagent')
	cheerio = require("cheerio"),
	async = require("async"),
	eventproxy = require('eventproxy'),
	jsonfile = require('jsonfile'),
	_ = require('lodash');

require('superagent-proxy')(request);

// var ep = new eventproxy();
// 	mainUrl = 'http://mhbseal.com/', //入口页面
// 	pageNum = 3, //要爬取文章的页数
// 	pageUrls = [], //存放收集文章页面网站
// 	startDate = new Date(),
// 	endDate = false,
// 	outputFile = 'task/data.json';

// function createData(M, arr) {
// 	arr.forEach(function(obj) {
// 		M.create(obj, function(err, model) {
// 			if (err) {
// 				console.info(err);
// 			}
// 		});
// 	});
// }

// function outputData(data) {
// 	jsonfile.writeFile(outputFile, data, {
// 		spaces: 2
// 	}, function(err) {
// 		if (err) {
// 			console.info(err);
// 		}
// 	})
// }

// function start() {
// 	ep.after('ArticleJson', pageNum, function() {
// 		outputData(articleArray);
// 	})

// 	// 遍历文章列表页
// 	pageUrls.forEach(function(pageUrl) {
// 		request.get(pageUrl)
// 			.end(function(err, res) {
// 				articleArray = articleArray.concat(res.body.data.articles);
// 				ep.emit('ArticleJson');
// 			})
// 	})
// }

function start() {
	
}

start();