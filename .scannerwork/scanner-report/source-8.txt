const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const barsDataSchema = new Schema({
	billing_cycle: {
		type: Number,
		required: true,
	},
	billing_month: {
		type: String,
		required: true,
	},
	amount: {
		type: Number,
		required: true,
	},
	start_date: {
		type: Date,
		required: true,
	},
	end_date: {
		type: Date,
		required: true,
	},
	last_edited: {
		type: String,
		required: true,
	},
	account: {
		account_name: {
			type: String,
			required: true,
		},
		date_created: {
			type: Date,
			required: true,
		},
		is_active: {
			type: String,
			required: true,
		},
		last_edited: {
			type: String,
			required: true,
		},
		customer: {
			first_name: {
				type: String,
				required: true,
			},
			last_name: {
				type: String,
				required: true,
			},
			address: {
				type: String,
				required: true,
			},
			status: {
				type: String,
				required: true,
			},
			date_created: {
				type: Date,
				required: true,
			},
			last_edited: {
				type: String,
				required: true,
			},
		},
	},
});

module.exports = mongoose.model('billing', barsDataSchema);
