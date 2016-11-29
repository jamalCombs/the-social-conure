var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// define Schema
var BirdStatus = new Schema({
	status: String, // what is the status
	name: String, // who is it from
	location: {
		geo: { type: [Number], index: { type: '2dsphere', sparse: true } },
		name: String
	}, // where'd we get it?
	dateAdded : { type: Date, default: Date.now }
});

// export model
module.exports = mongoose.model('Bird',BirdStatus);
