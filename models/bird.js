var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// define Schema
var BirdPost = new Schema({
	type: String, // bird post
	location: {
		geo: { type: [Number], index: { type: '2dsphere', sparse: true } },
		name: String
	}, // where'd we get it?
	dateAdded : { type: Date, default: Date.now },
});


// export model
module.exports = mongoose.model('Bird',BirdPost);
