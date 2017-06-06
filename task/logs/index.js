var log4js = require('log4js');

log4js.configure({
	appenders: [
		{ type: 'console' },
		{ type: 'file', filename: 'task/logs/proxy.log', category: 'proxy' },
		{ type: 'file', filename: 'task/logs/bilibili-spider.log', category: 'bilibili-spider' }
	]
});

var proxyLog = log4js.getLogger('proxy');
var bilibiliSpider = log4js.getLogger('bilibili-spider');

module.exports = {
	proxyLog: proxyLog,
	bilibiliSpider: bilibiliSpider
};
