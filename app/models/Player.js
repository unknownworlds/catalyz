var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

// ---- Player ----
var PlayerSchema = new Schema({
	steamID: String,
	nickname: String,
	region: String,
	build: String,
	server: String,

	messages: [{
		isNotification: Boolean,
		author: String,
		message: String
	}],

	groupID: Schema.ObjectId,

	updateDate: Date
});

PlayerSchema.index({steamID: { unique: true }, groupID: 1, region: 1, build: 1});

PlayerSchema.pre('save', function(next) {
	this.updateDate = new Date();
	next();
});

PlayerSchema.methods.pushMessage = function(author, message, callback) {
	this.messages.push({
		isNotification: false,
		author: author,
		message: message
	});

	this.save(function() {
		if (callback) {
			callback();
		}
	});
};

PlayerSchema.methods.pushNotification = function(message, callback) {
	this.messages.push({
		isNotification: true,
		author: "Server",
		message: message
	});

	this.save(function() {
		if (callback) {
			callback();
		}
	});
};

PlayerSchema.methods.GetAllMessages = function(callback) {
	var messages = this.messages;
	this.messages = [];

	this.save(function() {
		callback(messages);
	});
};

module.exports = mongoose.model('Player', PlayerSchema);