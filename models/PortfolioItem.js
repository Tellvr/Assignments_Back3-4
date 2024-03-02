const mongoose = require('mongoose');

const PortfolioItemSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
	},
	description: {
		type: String,
		required: true,
	},
	images: {
		type: [String], // Assuming URLs of images
		required: true,
	},
	timestamps: {
		created: {
			type: Date,
			default: Date.now,
		},
		updated: {
			type: Date,
			default: Date.now,
		},
		deleted: {
			type: Date,
			default: null,
		},
	},
});

const PortfolioItem = mongoose.model('PortfolioItem', PortfolioItemSchema);

module.exports = PortfolioItem;