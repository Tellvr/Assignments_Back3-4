const express = require('express')
const expressLayouts = require('express-ejs-layouts')
const mongoose = require('mongoose')
const flash = require('connect-flash')
const session = require('express-session')
const passport = require('passport')
const nodemailer = require('nodemailer');

const app = express();

require('./config/passport')(passport);

const transporter = nodemailer.createTransport({
	host: 'smtp.gmail.com',
	port: 465,
	secure: true, // Use SSL
	auth: {
		user: 'dias1605ermek@gmail.com', // Your Gmail email address
		pass: 'dias1605dddsss' // Your Gmail app password or account password
	}
});


// DB
const db = require('./config/keys').MongoURI;

mongoose
	.connect(
		db,
		{ useNewUrlParser: true, useUnifiedTopology: true }
	)
	.then(() => console.log('MongoDB Connected'))
	.catch(err => console.log(err));

// Ejs
app.use(expressLayouts);
app.set('view engine', 'ejs')

app.get('/country', (req, res) => {
	res.render('country'); // Рендеринг шаблона EJS с именем index.ejs
});

// BodyPARSER
app.use(express.urlencoded({ extended: false }))

app.use(
	session({
		secret: 'secret',
		resave: true,
		saveUninitialized: true
	})
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

app.use(function (req, res, next) {
	res.locals.success_msg = req.flash('success_msg');
	res.locals.error_msg = req.flash('error_msg');
	res.locals.error = req.flash('error');
	next();
});


// Routes
app.use('/', require('./routes/index'));
app.use('/users', require('./routes/users'));


const PORT = process.env.PORT || 3000;

app.listen(PORT, console.log(`Server started on port ${PORT}`));

fetch('https://api.chucknorris.io/jokes/random')
	.then(response => response.json())
	.then(data => {
		console.log(data.value); // Выводим шутку в консоль
		// Здесь вы можете использовать данные шутки в вашем проекте
	})
	.catch(error => {
		console.error('Error:', error);
	});