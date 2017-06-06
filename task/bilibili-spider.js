/*
	功能：爬取bilibili用户数据
	通过http://space.bilibili.com/ajax/member/GetInfo这个API
	需要通过POST提交，并带上mid（即用户ID）
	目前B站的用户ID大概是从1到128020000
*/
var http = require("http"),
		mongoose = require('mongoose'),
		request = require('superagent'),
		cheerio = require("cheerio"),
		async = require("async"),
		fs = require('fs'),
		config = require('../db/config'),
		User = require('../db/user'),
		logger = require('./logs');

require('superagent-proxy')(request);

mongoose.connect(config.database);
mongoose.connection.on('error', function() {
	console.info('Error: Could not connect to MongoDB. Did you forget to run `mongod`?');
});

var bilibiliSpider = (function() {
	// 目标网站（通过api来获取用户数据）
	var targetUrl = 'http://space.bilibili.com/ajax/member/GetInfo';
	// 本地proxy文件
	var localProxyFile = './task/data/proxy.txt';
	// 本地userAgent文件
	var localUserAgentFile = './task/data/user-agent.txt';
	// 代理IP数组
	var proxyArr = [];
	// userAgent数组
	var userAgentArr = [];

	var proxyRead = new Promise(function (resolve) {
		fs.readFile(localProxyFile, 'utf-8', function(err, data) {
			if(err) {
		 		console.log('文件读取失败！');
			} else {
				var arr = data.split('\n');
				for(var key in arr) {
					proxyArr.push(arr[key]);
				}
				console.log('文件读取成功！');
				resolve();
			}
		});
	});

	var userAgentRead = new Promise(function (resolve) {
		fs.readFile(localUserAgentFile, 'utf-8', function(err, data) {
			if(err) {
		 		console.log('文件读取失败！');
			} else {
				var arr = data.split('\r\n');
				for(var key in arr) {
					userAgentArr.push(arr[key]);
				}
				console.log('文件读取成功！');
				resolve();
			}
		});
	});

	function getRandom(min, max) {
		return min + Math.floor(Math.random() * (max - min + 1));
	}

	function saveUser(user) {
		User.create(user, function(err, model) {
			if (err) {
				logger.bilibiliSpider.info('user ', user.mid, ' save failed...');
			}
		});
	}

	function sendRequest(options) {
		var mid = options.mid || '';
		var proxy = options.proxy || '';
		var userAgent = options.userAgent || 'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.1; WOW64; Trident/6.0)';

	 	request
	  	.post(targetUrl)
	  	.proxy('http://' + proxy)
	  	.send({ mid: mid })
	  	.set({
	  		'Content-Type': 'application/x-www-form-urlencoded',
	  		'Referer': 'http://www.bilibili.com/index.html',
	  		'User-Agent': userAgent
	  	})
	  	.timeout(3000)
	  	.end(function(err, res) {
	  		if(err) {
	  			logger.bilibiliSpider.info('error: ', mid, err);
	  		} else {
	  			var result = JSON.parse(res.text);
	  			if(result.status) {
	  				saveUser(result.data);
	  				logger.bilibiliSpider.info('Response success: ', mid);
	  			} else {
	  				logger.bilibiliSpider.info('Response false: ', mid);
	  			}
	  		}
	  	});
	}

	function spider(mid, proxyCount, userAgentCount) {
		var options = {
			mid: mid,
			proxy: proxyArr[getRandom(1, proxyCount) - 1],
			userAgent: userAgentArr[getRandom(1, userAgentCount) - 1]
		};
		sendRequest(options);
	}

	function start() {
		// 读取proxy，userAgent文件
		Promise.all([proxyRead, userAgentRead]).then(function (result) {
			var proxyCount = proxyArr.length;
			var userAgentCount = userAgentArr.length;
			for(var i=1; i<=3; i++) {
				spider(i, proxyCount, userAgentCount);
			}
		});
	}

	return {
		start: start
	}
})();

bilibiliSpider.start();
