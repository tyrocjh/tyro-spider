var http = require("http"),
	mongoose = require('mongoose'),
	superagent = require("superagent"),
	cheerio = require("cheerio"),
	async = require("async"),
	eventproxy = require('eventproxy'),
	jsonfile = require('jsonfile'),
	_ = require('lodash'),
	config = require('../config'),
	Article = require('../server/models/article'),
	ArticleType = require('../server/models/articleType'),
	ArticleTag = require('../server/models/articleTag');

var ep = new eventproxy();
	mainUrl = 'http://mhbseal.com/', //入口页面
	pageNum = 3, //要爬取文章的页数
	pageUrls = [], //存放收集文章页面网站
	articleArray = [],
	articles = [],
	articleTags = [],
	articleTypes = [],
	startDate = new Date(),
	endDate = false,
	outputFile = 'task/data.json';

mongoose.connect(config.database);
mongoose.connection.on('error', function() {
	console.info('Error: Could not connect to MongoDB. Did you forget to run `mongod`?');
});

for (var i = 1; i <= pageNum; i++) {
	pageUrls.push('http://mhbseal.com/api/articleList?page=' + i);
}

function getArticles(datas) {
	datas.forEach(function(obj) {
		var tags = [];
		obj.tags.forEach(function(tag) {
			tags.push(tag);
		});
		var newObj = {};
		newObj._id = obj._id;
		newObj.title = obj.title;
		newObj.author = obj.author;
		newObj.visits = obj.visits;
		newObj._type = obj.type._id;
		newObj.tags = tags;
		newObj.published = true;
		newObj.introduction = obj.introduction;
		newObj.content = obj.content;
		newObj.createdAt = obj.createTime;
		newObj.updatedAt = obj.lastEditTime; // not work?
		articles.push(newObj);
	});
}

function getArticleTypes(datas) {
	datas.forEach(function(obj) {
		var newObj = {};
		newObj._id = obj.type._id;
		newObj.name = obj.type.name;
		newObj.path = obj.type.path;
		newObj.enabled = obj.type.enabled;
		articleTypes.push(newObj);
	});
	articleTypes = _.uniqBy(articleTypes, 'name');
}

function getArticleTags(datas) {
	datas.forEach(function(obj) {
		for (var i = 0; i < obj.tags.length; i++) {
			var newObj = {};
			newObj._id = obj.tags[i]._id;
			newObj.name = obj.tags[i].name;
			newObj.path = obj.tags[i].path;
			articleTags.push(newObj);
		}
	});
	articleTags = _.uniqBy(articleTags, 'name');
}

function createData(M, arr) {
	arr.forEach(function(obj) {
		M.create(obj, function(err, model) {
			if (err) {
				console.info(err);
			}
		});
	});
}

function processData(data) {
	// getArticleTags(data);
	// createData(ArticleTag, articleTags);

	// getArticleTypes(data);
	// createData(ArticleType, articleTypes);

	// getArticles(data);
	// createData(Article, articles);
}

function outputData(data) {
	jsonfile.writeFile(outputFile, data, {
		spaces: 2
	}, function(err) {
		if (err) {
			console.info(err);
		}
	})
}

function start() {
	ep.after('ArticleJson', pageNum, function() {
		// outputData(articleArray);
		processData(articleArray);
	})

	// 遍历文章列表页
	pageUrls.forEach(function(pageUrl) {
		superagent.get(pageUrl)
			.end(function(err, res) {
				articleArray = articleArray.concat(res.body.data.articles);
				ep.emit('ArticleJson');
			})
	})
}

start();