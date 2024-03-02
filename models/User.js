const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
	firstname: {
		type: String,
		required: true,
	},
	lastname: {
		type: String,
		required: true,
	},
	country: {
		type: String,
		required: true,
	},
	age: {
		type: Number,
		required: true,
	},
	gender: {
		type: String,
		enum: ['Male', 'Female', 'Mechanic'],
		required: true,
	},
	email: {
		type: String,
		required: true,
		unique: true,
	},
	password: {
		type: String,
		required: true,
	},
	role: {
		type: String,
		enum: ['admin', 'user'],
		default: 'user',
		required: true,
	},
});

const User = mongoose.model('User', UserSchema);

module.exports = User;
