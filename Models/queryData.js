const mongoose = require('mongoose');

const queriesSchema = new mongoose.Schema({
	billing_cycle: String,
	start_date: Date,
	end_date: Date,
});

module.exports = mongoose.model('Query', queriesSchema);
