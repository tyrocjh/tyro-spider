# tyro-spider

1.使用代理IP

2.使用user-agent

3.限制并发量

## 入口文件

* collect-proxy.js 收集可用的代理IP（然而免费的代理IP并没啥用。。。花钱买算了呗。。。）
* bilibili-spider.js 爬取B站数据（结果：6小时只能爬到10万条数据，估计需要花钱买IP才能爬更多数据，暂告一段落吧~）

## nodejs debug的使用:

1.node debug task/collectProxy.js

2.执行完1后程序会在第一行停止，输入c（continue），即可跳到断点处

3.输入repl，放可调试变量

4.crtl+c 退出debug模式


## 技术

* [superagent](http://visionmedia.github.io/superagent) 【实现主动发起get/post/delete等请求】
* [superagent-proxy](https://github.com/TooTallNate/superagent-proxy) 【superagent的proxy插件】
* [cheerio](https://github.com/cheeriojs/cheerio) 【跟jquery几乎一样用法】
* [eventproxy](https://github.com/JacksonTian/eventproxy) 【并发】
* [async](https://github.com/caolan/async) 【控制并发的数量】
* [promise](https://segmentfault.com/a/1190000007703723?from=timeline&isappinstalled=1)【promise解决回调嵌套】
* [promise](https://segmentfault.com/a/1190000002928371)【promise.all】


## 参考

* [B站用户爬虫](https://github.com/airingursb/bilibili-user/blob/master/bilibili_user.py)
* [爬虫-代理IP使用](http://www.cnblogs.com/hearzeus/p/5157016.html)
* [ip测试](http://ip.chinaz.com/getip.aspx)
* [免费IP代理](http://www.goubanjia.com/free/gngn/index.shtml 这个比下面那个好用)
* [免费IP代理](http://www.xicidaili.com/nn/1 这个不好用)
