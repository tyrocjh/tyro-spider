/*
	功能：爬取bilibili用户数据
	通过http://space.bilibili.com/ajax/member/GetInfo这个API（用户ID是从1开始递增，所以规则简单）
	需要通过POST提交，并带上mid（即用户ID）
	目前B站的用户ID大概是从1到128020000

	testProxy方法用于测试代理IP（存放于proxy-test.txt）是否适用于bilibili，并把可用的IP写入proxy.txt
	start方法爬虫开始
*/
var http = require("http"),
		mongoose = require('mongoose'),
		request = require('superagent'),
		cheerio = require("cheerio"),
		async = require("async"),
		fs = require('fs'),
		_ = require('lodash'),
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
	// 本地proxy测试文件
	var localProxyTestFile = './task/data/proxy-test.txt';
	// 本地userAgent文件
	var localUserAgentFile = './task/data/user-agent.txt';
	// 代理IP数组
	var proxyArr = [];
	// 代理IP测试数组
	var proxyTestArr = [];
	// userAgent数组
	var userAgentArr = [];

	function proxyRead(path, pArr) {
		return new Promise(function (resolve) {
			fs.readFile(path, 'utf-8', function(err, data) {
				if(err) {
			 		console.log('文件读取失败！');
				} else {
					var arr = data.split('\r\n');
					for(var key in arr) {
						pArr.push(arr[key]);
					}
					console.log('文件读取成功！');
					resolve();
				}
			});
		});
	}

	function userAgentRead() {
		return new Promise(function (resolve) {
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
	}

	function writeData() {
		proxyArr = _.uniq(proxyArr);
		var result = proxyArr.toString().replace(/,/g, '\r\n');
		fs.writeFile(localProxyFile, result, function(err) {
		    if(err) {
		    	console.log('写文件操作失败！');
		    } else {
		    	console.log('写文件操作成功！');
		    }
		});
	}

	function getRandom(min, max) {
		return min + Math.floor(Math.random() * (max - min + 1));
	}

	function saveUser(user) {
		User.create(user, function(err, model) {
			if (err) {
				logger.bilibiliSpider.info('save failed: ', user.mid, err);
			}
		});
	}

	function sendRequest(options) {
		var mid = options.mid || '';
		var proxy = options.proxy || '';
		var userAgent = options.userAgent || '';

		console.log('current mid: ', mid);

	 	request
	  	.post(targetUrl)
	  	.proxy('http://' + proxy)
	  	.send({ mid: mid })
	  	.set({
	  		'Content-Type': 'application/x-www-form-urlencoded',
	  		'Referer': 'http://www.bilibili.com/index.html',
	  		'User-Agent': userAgent
	  	})
	  	.timeout(5000)
	  	.end(function(err, res) {
	  		if(err) {
	  			proxyArr.splice(proxyArr.indexOf(proxy), 1);
	  			logger.bilibiliSpider.info('error: ', mid, ' ip: ', proxy, err);
	  		} else {
	  			var result = JSON.parse(res.text);
	  			if(result.status) {
	  				saveUser(result.data);
	  			} else {
	  				proxyArr.splice(proxyArr.indexOf(proxy), 1);
	  				logger.bilibiliSpider.info('Response false: ', mid, ' ip: ', proxy);
	  			}
	  		}
	  	});
	}

	function spider(mid, userAgentCount) {
		var options = {
			mid: mid,
			proxy: proxyArr[getRandom(1, proxyArr.length) - 1],
			userAgent: userAgentArr[getRandom(1, userAgentCount) - 1]
		};
		sendRequest(options);
	}

	// 爬虫开始
	function start() {
		Promise.all([proxyRead(localProxyFile, proxyArr), userAgentRead()]).then(function (result) {
			var userAgentCount = userAgentArr.length;
			// 爬50万条数据
			for(var i=1; i<=500000; i++) {
				(function(i) {
					setTimeout(function() {
						spider(i, userAgentCount);
					}, 200 * i);
				})(i);
			}
		});
	}

	function testRequest(proxy, userAgent, callback) {
	 	request
	  	.post(targetUrl)
	  	.proxy('http://' + proxy)
	  	.send({ mid: 1 })
	  	.set({
	  		'Content-Type': 'application/x-www-form-urlencoded',
	  		'Referer': 'http://www.bilibili.com/index.html',
	  		'User-Agent': userAgent
	  	})
	  	.timeout(3000)
	  	.end(function(err, res) {
	  		if(err) {
	  			console.log('error: ', proxy, err);
	  		} else {
	  			var result = JSON.parse(res.text);
	  			if(result.status) {
	  				console.log('response success: ', proxy);
	  				proxyArr.push(proxy);
	  			} else {
	  				console.log('response fail: ', proxy);
	  			}
	  		}
	  		callback();
	  	});
	}

	// 测试proxy是否可以用于bilibili
	function testProxy() {
		Promise.all([proxyRead(localProxyTestFile, proxyTestArr), userAgentRead()]).then(function (result) {
			var userAgentCount = userAgentArr.length;
	    async.mapLimit(proxyTestArr, proxyTestArr.length, function(proxy, callback) {
	      testRequest(proxy, userAgentArr[getRandom(1, userAgentCount) - 1], callback);
	    }, function(err, result) {
	      if(err) {
	        console.log(err);
	      } else {
	        console.log("代理IP检测完毕！！！");
	        writeData();
	      }
	    });
		});
	}

	return {
		start: start,
		testProxy: testProxy
	}
})();

// bilibiliSpider.start();
// bilibiliSpider.testProxy();
