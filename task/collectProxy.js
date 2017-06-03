/*
	功能：收集可用的代理IP，存放到/data下的proxy.txt
*/

var http = require("http"),
		request = require('superagent')
		cheerio = require("cheerio"),
		async = require("async"),
		fs = require('fs'),
		_ = require('lodash');

require('superagent-proxy')(request);

var collectProxy = (function() {
	// 存放收集到的代理IP
	var proxyArr = [];
	// 国内代理IP网站
	var targetUrl = 'http://www.xicidaili.com/nn/';
	// 测试代理IP是否可用
	var proxyCheckUrl = 'http://ip.chinaz.com/getip.aspx';

	function writeData() {
		var result = proxyArr.toString().replace(/,/g, '\n');
		fs.writeFile('./task/data/proxy.txt', result, function(err) {
		    if(err) {
		    	console.log('写文件操作失败！');
		    } else {
		    	console.log('写文件操作成功！');
		    }
		});
	}

	function checkData() {
	 	request
	  	.get(proxyCheckUrl)
	  	.proxy('http://115.46.86.108:80')
	  	.set({ 'User-Agent': 'Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 7.1; Trident/5.0)' })
	  	.end(function(err, res){
	  		if(err) {
	  			console.log('error: ', err);
	  		} else {
	  			console.log('success...');
	  			console.log(res.text);
	  			// writeData();
	  		}
	  	});

		// 并发控制
    // async.mapLimit(urls, urls.length, function(url, callback) {
    //     console.log("开始收集代理IP...");
    //     requestAndCollect(url, callback);
    // }, function(err, result) {
    //     if(err) {
    //       console.log('error: ', err);
    //     } else {
    //     	// console.log(result);
    //       console.log("代理IP收集完毕！！！");
    //       handleResult(result);
    //       checkAndWrite();
    //     }
    // });
	}

	function handleResult(arr) {
		for(var key in arr) {
			proxyArr = proxyArr.concat(arr[key]);
		}
		proxyArr = _.uniq(proxyArr);
	}

	// 处理数组，并测试代理IP是否可用，最后写入本地文件
	function checkAndWrite(result) {
		handleResult(result);
		console.info(proxyArr);
		console.info(proxyArr.length);
		// checkData();
	}

	function requestAndCollect(url, callback) {
	 	request
	  	.get(url)
	  	.set({ 'User-Agent': 'Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 7.1; Trident/5.0)' })
	  	.end(function(err, res) {
	  		if(err) {
	  			console.log('error: ', err);
	  		} else {
	  			var arr = [];
	  			var $ = cheerio.load(res.text);
	  			$('#ip_list tr').each(function(idx, el) {
	  				if(idx !== 0) {
		  				var ip = $(el).find('td').eq(1).text();
		  				var port = $(el).find('td').eq(2).text();
		  				var proxy = ip + ':' + port;
		  				arr.push(proxy);
	  				}
	  			});
	  			callback(null, arr);
	  		}
	  	});
	}

	// 收集代理IP
	function collectData() {
		var urls = [];

		// 只取前5页的数据（每页100条数据）
		for(var i=1; i<=2; i++) {
			urls.push(targetUrl + i);
		}

		// 并发控制
    async.mapLimit(urls, urls.length, function(url, callback) {
        console.log("开始收集代理IP...");
        requestAndCollect(url, callback);
    }, function(err, result) {
        if(err) {
          console.log('error: ', err);
        } else {
        	// console.log(result);
          console.log("代理IP收集完毕！！！");
          checkAndWrite(result);
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
