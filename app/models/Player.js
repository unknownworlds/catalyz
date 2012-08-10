var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

// ---- Player ----
var PlayerSchema = new Schema({
	steamID: String,
	nickname: String,
	region: String,
	build: String,
	server: String,

	groupID: Schema.ObjectId,

	updateDate: Date
});

PlayerSchema.pre('save', function(next) {
	this.updateDate = new Date();
	next();
});

module.exports = mongoose.model('Player', PlayerSchema);