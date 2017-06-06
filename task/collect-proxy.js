/*
	功能：收集可用的代理IP，存放到/data下的proxy.txt
*/
var http = require("http"),
		request = require('superagent')
		cheerio = require("cheerio"),
		async = require("async"),
		fs = require('fs'),
		_ = require('lodash'),
		logger = require('./logs');

require('superagent-proxy')(request);

var collectProxy = (function() {
	// 国内代理IP网站
	var targetUrl = 'http://www.xicidaili.com/nn/';
	// 测试代理IP是否可用
	var proxyCheckUrl = 'http://ip.chinaz.com/getip.aspx';
	// 本地proxy文件路径
	var localProxyFile = './task/data/proxy.txt';
	// 本地userAgent文件路径
	var localUserAgentFile = './task/data/user-agent.txt';
	// 存放收集到的代理IP
	var proxyArrTmp = [];
	// 存放可用的代理IP
	var proxyArr = [];
	// 存放userAgent
	var userAgentArr = [];

	function getRandom() {
		var max = userAgentArr.length;
		return 1 + Math.floor(Math.random() * max);
	}

	// 读取userAgent文件
	function readData() {
		fs.readFile(localUserAgentFile, 'utf-8', function(err, data) {
			if(err) {
		 		console.log('文件读取失败！');
			} else {
				var arr = data.split('\r\n');
				for(var key in arr) {
					userAgentArr.push(arr[key]);
				}
				console.log('文件读取成功！');
				checkAndWrite();
			}
		});
	}

	// 把可用的代理IP写入本地文件
	function writeData() {
		var result = proxyArr.toString().replace(/,/g, '\n');
		fs.writeFile(localProxyFile, result, function(err) {
		    if(err) {
		    	console.log('写文件操作失败！');
		    } else {
		    	console.log('写文件操作成功！');
		    }
		});
	}

	// 使用superagent发送请求
	function sendRequest(options, callback) {
		var target = options.target || '';
		var proxy = options.proxy || '';
		var userAgent = options.userAgent || 'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.1; WOW64; Trident/6.0)';
		var handleSuccess = options.success || function(res) {};
		var handleError = options.error || function(err) {};

		if(proxy) {
		 	request
		  	.get(target)
		  	.proxy(proxy)
		  	.set({ 'User-Agent': userAgent })
		  	.timeout(3000)
		  	.end(function(err, res) {
		  		if(err) {
		  			handleError(err);
		  			callback(null, null);
		  		} else {
		  			handleSuccess(res);
		  			callback(null, null);
		  		}
		  	});
		} else {
		 	request
		  	.get(target)
		  	.set({ 'User-Agent': userAgent })
		  	.timeout(3000)
		  	.end(function(err, res) {
		  		if(err) {
		  			handleError(err);
		  			callback(null, null);
		  		} else {
		  			handleSuccess(res);
		  			callback(null, null);
		  		}
		  	});
		}
	}

	// 测试代理IP是否可用
	function checkProxy() {
		console.log("开始检测代理IP是否可用...");
    async.mapLimit(proxyArrTmp, 10, function(proxy, callback) {
        var options = {
        	target: proxyCheckUrl,
        	proxy: 'http://' + proxy,
        	userAgent: userAgentArr[getRandom()-1],
        	success: function(res) {
        		proxyArr.push(proxy);
        		logger.proxyLog.info('success: ', proxy);
        	},
        	error: function(err) {
        		logger.proxyLog.info('error: ', err);
        	}
        };
        setTimeout(function() {
        	sendRequest(options, callback);
        }, 500);
    }, function(err, result) {
        if(err) {
          console.log('error: ', err);
        } else {
          console.log("代理IP检测完毕！！！");
          writeData();
        }
    });
	}

	function checkAndWrite() {
		proxyArrTmp = _.uniq(proxyArrTmp);
		checkProxy();
	}

	// 收集代理IP
	function collectData() {
		var urls = [];

		// 从目标网站取前20页的数据（每页100条）
		for(var i=1; i<=20; i++) {
			urls.push(targetUrl + i);
		}

		console.log("开始收集代理IP...");
    async.mapLimit(urls, urls.length, function(url, callback) {
      var options = {
      	target: url,
      	success: function(res) {
	  			var $ = cheerio.load(res.text);
	  			$('#ip_list tr').each(function(idx, el) {
	  				if(idx !== 0) {
		  				var ip = $(el).find('td').eq(1).text();
		  				var port = $(el).find('td').eq(2).text();
		  				var proxy = ip + ':' + port;
		  				proxyArrTmp.push(proxy);
	  				}
	  			});
      	},
      	error: function(err) {
      		console.log(err);
      	}
      };
      sendRequest(options, callback);
    }, function(err, result) {
      if(err) {
        console.log('error: ', err);
      } else {
        console.log("代理IP收集完毕！！！");
        readData();
      }
    });
	}

	return {
		collectData: collectData
	}
})();

function start() {
	collectProxy.collectData();
}

start();
