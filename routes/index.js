

const express = require('express');
const router = express.Router();
const { ensureAuthenticated, ensureAdmin, forwardAuthenticated } = require('../config/auth');
const PortfolioItem = require('../models/PortfolioItem');

let topics = [];

// Home Page
router.get('/', forwardAuthenticated, (req, res) => res.render('home'));

router.get('/qr', (req, res) => res.render('qr'));

// Dashboard
router.get('/dashboard', ensureAuthenticated, async (req, res) => {
	try {
		const portfolioItems = await PortfolioItem.find();
		res.render('dashboard', { user: req.user, portfolioItems: portfolioItems });
	} catch (err) {
		console.error(err);
		res.status(500).send('Internal Server Error');
	}
});

// Admin Page - Apply ensureAdmin middleware
// Display the Admin Page
router.get('/admin', ensureAdmin, async (req, res) => {
	try {
		const portfolioItems = await PortfolioItem.find();
		res.render('admin', { user: req.user, portfolioItems: portfolioItems });
	} catch (err) {
		console.error(err);
		res.status(500).send('Internal Server Error');
	}
});

// Add Item
router.post('/admin/add-item', ensureAdmin, async (req, res) => {
	try {
		const { itemName, itemDescription, itemImages } = req.body;
		const imagesArray = itemImages.split(',').map(image => image.trim());

		// Add new item
		const newItem = new PortfolioItem({
			name: itemName,
			description: itemDescription,
			images: imagesArray,
		});
		const savedItem = await newItem.save();
		console.log('Added Item:', savedItem);

		res.redirect('/admin');
	} catch (err) {
		console.error(err);
		res.status(500).send('Internal Server Error');
	}
});


// Edit Item (render form for editing)
router.get('/admin/edit-item/:itemId', ensureAdmin, async (req, res) => {
	try {
		const itemId = req.params.itemId;
		const item = await PortfolioItem.findById(itemId);
		const portfolioItems = await PortfolioItem.find(); // Fetch all items
		res.render('admin', { user: req.user, portfolioItems: portfolioItems, item: item });
	} catch (err) {
		console.error(err);
		res.status(500).send('Internal Server Error');
	}
});

// Update Item (handle form submission for editing)
router.post('/admin/edit-item/:itemId', ensureAdmin, async (req, res) => {
	try {
		const itemId = req.params.itemId;
		const { itemName, itemDescription, itemImages } = req.body;
		const imagesArray = itemImages.split(',').map(image => image.trim());

		// Edit existing item
		const updatedItem = await PortfolioItem.findByIdAndUpdate(
			itemId,
			{
				name: itemName,
				description: itemDescription,
				images: imagesArray,
				timestamps: { updated: Date.now() },
			},
			{ new: true }
		);
		console.log('Updated Item:', updatedItem);

		res.redirect('/admin');
	} catch (err) {
		console.error(err);
		res.status(500).send('Internal Server Error');
	}
});

// Delete Item
router.post('/admin/delete-item', ensureAdmin, async (req, res) => {
	try {
		const itemId = req.body.itemId;
		await PortfolioItem.findByIdAndDelete(itemId);
		res.redirect('/admin');
	} catch (err) {
		console.error(err);
		res.status(500).send('Internal Server Error');
	}
});

// Handle Topic Addition (POST request)
router.post('/dashboard/add-topic', ensureAdmin, (req, res) => {
	const newTopic = req.body.topic;
	topics.push(newTopic);
	res.redirect('/dashboard');
});

// Handle Topic Deletion (POST request)
router.post('/dashboard/delete-topic', ensureAdmin, (req, res) => {
	const topicToDelete = req.body.topic;
	topics = topics.filter(topic => topic !== topicToDelete);
	res.redirect('/dashboard');
});

module.exports = router;
