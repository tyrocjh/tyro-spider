var log4js = require('log4js');

log4js.configure({
	appenders: [
		{ type: 'console' },
		{ type: 'file', filename: 'task/logs/proxy.log', category: 'proxy' },
		{ type: 'datefile', filename: 'task/logs/bilibili-spider', category: 'bilibili-spider', pattern: '-yyyy-MM-dd.log', alwaysIncludePattern: true }
	]
});

var proxyLog = log4js.getLogger('proxy');
var bilibiliSpider = log4js.getLogger('bilibili-spider');

module.exports = {
	proxyLog: proxyLog,
	bilibiliSpider: bilibiliSpider
};
