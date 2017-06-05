var log4js = require('log4js');

log4js.configure({
	appenders: [
		{ type: 'console' },
		{ type: 'file', filename: 'task/logs/proxy.log', category: 'proxy' }
	]
});

var proxyLog = log4js.getLogger('proxy');

module.exports = {
	proxyLog: proxyLog
};
