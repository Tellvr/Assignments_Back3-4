const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const nodemailer = require('nodemailer');
// Load User model
const User = require('../models/User');
const { forwardAuthenticated } = require('../config/auth');

const transporter = nodemailer.createTransport({
	host: 'smtp.gmail.com',
	port: 465,
	secure: true, // Use SSL
	auth: {
		user: process.env.EMAIL_USER,
		pass: process.env.EMAIL_PASS
	},
});

async function sendWelcomeEmail(email) {
	try {
		const info = await transporter.sendMail({
			from: process.env.EMAIL_USER,
			to: email,
			subject: 'Thank you for registering in Daelijek',
			text: 'Thank you for registering on our website!',
		});

		console.log('Email sent: ', info.messageId);
	} catch (error) {
		console.error('Error sending welcome email:', error);
	}
}

// Login Page
router.get('/login', forwardAuthenticated, (req, res) => res.render('login'));

// Register Page
router.get('/register', forwardAuthenticated, (req, res) => res.render('register'));

// Register
router.post('/register', (req, res) => {
	const { firstname, lastname, age, country, gender, email, password, password2 } = req.body;
	let errors = [];

	if (!firstname || !lastname || !age || !gender || !country || !email || !password || !password2) {
		errors.push({ msg: 'Please enter all fields' });
	}

	if (password != password2) {
		errors.push({ msg: 'Passwords do not match' });
	}

	if (password.length < 6) {
		errors.push({ msg: 'Password must be at least 6 characters' });
	}

	if (errors.length > 0) {
		res.render('register', {
			errors,
			firstname,
			lastname,
			age,
			country,
			gender,
			email,
			password,
			password2
		});
	} else {
		User.findOne({ email: email }).then(async user => {
			if (user) {
				errors.push({ msg: 'Email already exists' });
				res.render('register', {
					errors,
					firstname,
					lastname,
					age,
					country,
					gender,
					email,
					password,
					password2
				});
			} else {
				const newUser = new User({
					firstname,
					lastname,
					age,
					country,
					gender,
					email,
					password,
					role: 'user'
				});

				await newUser.save();
				await sendWelcomeEmail(email);



				bcrypt.genSalt(10, (err, salt) => {
					bcrypt.hash(newUser.password, salt, (err, hash) => {
						if (err) throw err;
						newUser.password = hash;
						newUser
							.save()
							.then(user => {
								req.flash(
									'success_msg',
									'You are now registered and can log in'
								);
								res.redirect('/users/login');
							})
							.catch(err => console.log(err));
					});
				});
			}
		});
	}
});

// Login
router.post('/login', (req, res, next) => {
	passport.authenticate('local', {
		successRedirect: '/dashboard',
		failureRedirect: '/users/login',
		failureFlash: true
	})(req, res, next);
});

// Logout
router.get('/logout', (req, res) => {
	// Use a callback function (if required) to handle any post-logout operations
	req.logout((err) => {
		if (err) {
			// Handle error, if any
			console.error(err);
			return res.redirect('/'); // Redirect to a default page or handle as needed
		}

		// Flash a success message to be displayed on the next redirected page.
		req.flash('success_msg', 'You are logged out');

		// Redirect the user to the login page after logging out.
		res.redirect('/users/login');
	});
});


module.exports = router;