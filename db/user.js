var mongoose = require('mongoose'),
		Schema = mongoose.Schema;

var User = new mongoose.Schema({
	mid: Number,
	name: String,
	sex: String,
	birthday: String,
	sign: String,
	regtime: Number,
	fans: Number,
	approve: Boolean,
	place: String,
	face: String,
	rank: String,
	coins: Number,
	attention: Number,
	friend: Number,
	playNum: Number,
	DisplayRank: String,
	spacesta: Number,
	description: String,
	article: Number,
	toutu: String,
	toutuId: Number,
	theme: String,
	theme_preview: String,
	im9_sign: String,
	attentions: [Number],
	level_info: {},
	pendant: {},
	nameplate: {},
	official_verify: {}
}, {
	timestamps: true
});

module.exports = mongoose.model('User', User);
